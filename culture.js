"use strict";
const cultureTypes={videogame:'Видеоигры',anime:'Аниме',film:'Фильмы',series:'Сериалы',tabletop:'Настольные игры',book:'Книги и рассказы'};
const cultureRelations={
  appearance:{label:'Прямое появление',description:'Именованная сущность действует в произведении. Её версия принадлежит миру этого произведения.'},
  adaptation:{label:'Адаптация / переосмысление',description:'Литературный сюжет или образ намеренно преобразован: экранизация, игровой мир, пародия или поздний роман.'},
  reference:{label:'Отсылка',description:'Использованы имя, знак или отдельный мотив. Это не означает полного переноса литературной сущности.'},
  inspiration:{label:'Свободное вдохновение',description:'Авторы опираются на идеи или атмосферу Лавкрафта. Тождество существ не предполагается.'}
};
const culturePresence={shown:'Показан персонаж / монстр',mentioned:'Упоминание / культ',motif:'Отсылка / образ'};
const cultureFilters={type:'all',relation:'all',entity:'all',query:'',context:'all',presence:'all'};
let cultureReturnHash='#culture';
function cultureRelated(entity){return window.CULTURE_MEDIA.filter(media=>media.links.some(link=>link.entity===entity));}
function cultureLink(url,label){return '<a href="'+escapeHTML(url)+'" target="_blank" rel="noopener noreferrer">'+escapeHTML(label)+' ↗</a>';}
function cultureBadge(relation){return '<span class="culture-badge relation-'+relation+'">'+escapeHTML(relation==='literature'?'Литературная запись':cultureRelations[relation].label)+'</span>';}
function cultureEntityLinks(media){
  return media.links.length?media.links.map(link=>'<a href="#entry/'+link.entity+'" title="'+escapeHTML(link.form)+'">'+escapeHTML(byId.get(link.entity)?.name||link.entity)+'</a>').join(''):'<span>Именованные сущности в этой карточке не заявлены</span>';
}
function cultureCard(media){
  return '<article class="culture-card"><a class="culture-card-art" href="#culture/media/'+media.id+'" aria-label="Подробнее: '+escapeHTML(media.title)+'"><img data-image-id="culture:'+media.id+'" src="art/culture/'+media.type+'.svg" alt="Условная эмблема: '+escapeHTML(cultureTypes[media.type])+'" loading="lazy"><span>'+media.year+'</span></a><div class="culture-card-copy"><div class="culture-card-meta">'+escapeHTML(cultureTypes[media.type])+' · '+media.year+'</div><h3><a href="#culture/media/'+media.id+'">'+escapeHTML(media.title)+'</a></h3>'+cultureBadge(media.relation)+(media.evidence?'<small class="culture-presence presence-'+media.evidence.mode+'">'+escapeHTML(culturePresence[media.evidence.mode])+'</small>':'')+(media.library?'<small class="culture-library-group">'+escapeHTML(media.library.group)+'</small>':'')+'<p>'+escapeHTML(media.summary)+'</p><div class="culture-entities">'+cultureEntityLinks(media)+'</div><a class="culture-read" href="#culture/media/'+media.id+'">Роль, трактовка и источники →</a></div></article>';
}
function cultureMatching(filters=cultureFilters){
  const q=normalize(filters.query);
  return cultureAllMedia().filter(media=>(filters.context!=='cultural'||media.relation!=='literature')&&(!filters.presence||filters.presence==='all'||(filters.entity!=='all'?media.links.some(link=>link.entity===filters.entity&&(link.presence||media.evidence?.mode)===filters.presence):media.evidence?.mode===filters.presence))&&(filters.type==='all'||media.type===filters.type)&&(filters.relation==='all'||media.relation===filters.relation)&&(filters.entity==='all'||media.links.some(link=>link.entity===filters.entity))&&(!q||normalize([media.title,media.creator,media.year,media.summary,media.interpretation,media.library?.group||'',media.library?.englishTitle||'',media.evidence?.where||'',...(media.evidence?.names||[]),...media.links.map(link=>byId.get(link.entity)?.name||'')].join(' ')).includes(q)));
}
function cultureResults(){
  const items=cultureMatching();
  return items.length?items.map(cultureCard).join(''):'<div class="culture-empty"><h3>Совпадений нет</h3><p>Попробуйте другой вид медиа, тип связи или имя.</p><button type="button" data-culture-reset>Сбросить фильтры</button></div>';
}
function cultureSelect(name,label,options,value){
  return '<label>'+label+'<select data-culture-filter="'+name+'">'+options.map(([id,title])=>'<option value="'+id+'"'+(id===value?' selected':'')+'>'+escapeHTML(title)+'</option>').join('')+'</select></label>';
}
function renderCultureIndex(){
  const roman=['I','II','III','IV','V','VI'];
  const covers=Object.entries(cultureTypes).map(([type,title],i)=>{
    const count=cultureAllMedia().filter(media=>media.type===type).length;
    return '<a class="culture-category-cover" href="#culture/type/'+type+'" aria-label="Открыть: '+escapeHTML(title)+'"><img src="art/culture/'+type+'.svg" alt=""><div><span>Раздел '+roman[i]+'</span><b>'+escapeHTML(title)+'</b><small>В коллекции: '+count+'</small></div></a>';
  }).join('');
  cultureOpen('<header class="page-title"><h2 id="dialog-title">Следы Древних в культуре</h2><div class="cipher">ᛊᛚᛖᛞᛁ ᛞᚱᛖᚹᚾᛁᚺ ᚹ ᚲᚢᛚᛏᚢᚱᛖ</div></header><div class="culture-index-heading"><p>Выберите вид медиа</p><a class="ink-link" href="#culture/all">Все произведения ('+cultureAllMedia().length+') →</a></div><nav class="culture-category-covers" aria-label="Разделы культуры">'+covers+'</nav>',true);
}
function renderCulture(mode,value){
  if(!mode)return renderCultureIndex();
  if(mode==='media')return renderCultureMedia(value);
  if(mode==='type'&&cultureTypes[value]){
    Object.assign(cultureFilters,{type:value,relation:'all',entity:'all',query:'',context:'all',presence:'all'});cultureReturnHash='#culture/type/'+value;
  }else if(mode==='entry'){
    cultureFilters.presence='all';cultureFilters.context='cultural';cultureFilters.type='all';cultureFilters.relation='all';cultureFilters.query='';cultureFilters.entity=byId.has(value)?value:'all';
    cultureReturnHash=cultureFilters.entity==='all'?'#culture':'#culture/entry/'+value;
  }else {Object.assign(cultureFilters,{type:'all',relation:'all',entity:'all',query:'',context:'all',presence:'all'});cultureReturnHash='#culture/all';}
  const entities=records.filter(record=>['gods','creatures'].includes(record.group)).map(record=>record.id).sort((a,b)=>byId.get(a).name.localeCompare(byId.get(b).name,'ru')); 
  const intro='<a class="ink-link culture-back" href="#culture">← Разделы культуры</a><header class="page-title"><span class="folio-kicker">Культурный след · после литературных Мифов</span><h2 id="dialog-title">'+escapeHTML(mode==='type'&&cultureTypes[value]?cultureTypes[value]:'Следы Древних в культуре')+'</h2><p class="culture-intro">От немого кино до аниме: как меняются знакомые имена за пределами писаний.</p></header>';
  const legend='<details class="culture-legend"><summary>Четыре вида связи с Мифами</summary><dl>'+Object.entries(cultureRelations).map(([id,item])=>'<div><dt>'+cultureBadge(id)+'</dt><dd>'+escapeHTML(item.description)+'</dd></div>').join('')+'</dl><p>Тип связи — редакционная классификация коллекции; пояснение и подтверждающие ссылки приведены в каждой записи.</p></details>';
  const filters='<form class="culture-filters" id="culture-filters" role="search" aria-label="Поиск в культуре"><label class="culture-query">Найти в коллекции<input type="search" data-culture-filter="query" placeholder="Название, автор, существо или год…" value="'+escapeHTML(cultureFilters.query)+'"></label>'+
    cultureSelect('type','Вид медиа',[['all','Все виды'],...Object.entries(cultureTypes)],cultureFilters.type)+cultureSelect('relation','Связь с Мифами',[['all','Любая связь'],...Object.entries(cultureRelations).map(([id,item])=>[id,item.label]),['literature','Литературные записи']],cultureFilters.relation)+cultureSelect('entity','Существо',[['all','Все существа'],...entities.map(id=>[id,byId.get(id).name])],cultureFilters.entity)+cultureSelect('presence','Как встречается',[['all','Все варианты'],...Object.entries(culturePresence)],cultureFilters.presence)+'<button type="button" data-culture-reset>Сбросить</button></form>';
  cultureOpen(intro+(cultureFilters.type==='book'?'<p class="culture-reading-intro">Здесь собраны рассказы Лавкрафта, книги соавторов и последователей, а также поздние переосмысления. Библиографические группы указаны на карточках. Даты могут обозначать время написания или первого издания.</p>':'')+'<p class="culture-boundary">Экранизации, игры и поздние книги имеют собственные версии Мифов. Их детали не дополняют литературные описания существ в архиве.</p>'+legend+filters+'<div class="culture-results-heading"><span id="culture-count" role="status">Найдено: '+cultureMatching().length+' из '+cultureAllMedia().length+'</span><span>Год — датировка произведения или указанной версии</span></div><div class="culture-grid" id="culture-results">'+cultureResults()+'</div>'+cultureLibraryFooter(cultureFilters.type)+'<p class="culture-art-credit">Иллюстрации карточек — оригинальные эмблемы видов медиа, созданные для архива. Постеры и кадры не воспроизводятся.</p>');
}
function cultureOpen(content,framed=false){
  openFolio('<div class="open-book catalog-book culture-book"><section class="book-page verso"></section><section class="book-page recto"></section><div class="map-across catalog-across'+(framed?' wide-framed wide-framed-culture':'')+'">'+(framed?'<span class="wide-frame-art" aria-hidden="true"></span>':'')+'<div class="catalog-inner culture-inner">'+content+'</div></div></div>','spread-mode catalog-mode culture-mode');
}
function renderCultureMedia(id){
  const media=cultureAllMedia().find(item=>item.id===id);
  if(!media)return cultureOpen('<header class="page-title"><h2 id="dialog-title">Запись не найдена</h2></header><a class="ink-link" href="#culture">← В коллекцию</a>');
  cultureOpen('<a class="ink-link culture-back" href="'+cultureReturnHash+'">← В коллекцию</a><article class="culture-detail"><figure><img data-image-id="culture:'+media.id+'" src="art/culture/'+media.type+'.svg" alt="Условная эмблема: '+escapeHTML(cultureTypes[media.type])+'"><figcaption>Оригинальная эмблема архива · не официальный постер</figcaption></figure><div><span class="folio-kicker">'+escapeHTML(cultureTypes[media.type])+' · '+media.year+'</span><h2 id="dialog-title">'+escapeHTML(media.title)+'</h2><p class="culture-creator">'+escapeHTML(media.creator)+'</p>'+cultureBadge(media.relation)+'<p class="culture-detail-summary">'+escapeHTML(media.summary)+'</p><h3>'+(media.relation==='literature'?'О литературной записи':'Как интерпретированы')+'</h3><p>'+escapeHTML(media.interpretation)+'</p></div>'+cultureEvidence(media)+'<section class="culture-detail-wide"><h3>'+(media.relation==='literature'?'Связанные записи архива':'Сущности и их роль')+'</h3>'+(media.links.length?'<div class="culture-role-list">'+media.links.map(link=>'<section><h4><a href="#entry/'+link.entity+'">'+escapeHTML(byId.get(link.entity)?.name||link.entity)+' →</a></h4><span>'+escapeHTML(link.form)+'</span><p>'+escapeHTML(link.role)+'</p></section>').join('')+'</div>':'<p>'+(media.library?.kind==='game'?'Состав существ зависит от редакции и сценария. Отдельные сущности в этой карточке не перечислены.':media.relation==='literature'?'Для этого произведения отдельные сущности в библиографии не указаны.':'Именованные сущности не заявлены: здесь фиксируется вдохновение творчеством Лавкрафта, а не прямое появление определённого существа.')+'</p>')+'</section><section class="culture-detail-wide culture-source-panel"><h3>'+(media.relation==='literature'?'Произведение':'Литературная основа и культурная версия')+'</h3><ul>'+media.origins.map(origin=>'<li>'+escapeHTML(origin)+'</li>').join('')+'</ul><p>'+(media.relation==='literature'?'Это библиографическая запись. Оригиналы Лавкрафта отделены от поздних интерпретаций; по ссылкам на связанные записи доступны литературные описания существ.':'Свойства и события этого медиа относятся к его собственной версии мира. Литературное описание доступно по ссылке на существо.')+'</p><h3>Источники о произведении</h3><ul class="culture-source-links">'+media.sources.map(source=>'<li>'+cultureLink(source.url,source.title)+'</li>').join('')+'</ul></section>'+cultureLibraryResources(media)+'</article>');
}
function cultureEvidence(media){
  const evidence=media.evidence;if(!evidence)return '';
  return '<section class="culture-detail-wide culture-evidence"><h3>Где и как встречается</h3><span class="culture-presence presence-'+evidence.mode+'">'+escapeHTML(culturePresence[evidence.mode])+'</span><h4>'+escapeHTML(evidence.where)+'</h4><p>'+escapeHTML(evidence.names.join(' · '))+'</p><p>'+escapeHTML(evidence.detail)+'</p><small>Сведения сверены: 11.11.2026. Подтверждающие ссылки приведены ниже.</small></section>';
}
function cultureBeyond(entity){
  if(!byId.has(entity)||!['gods','creatures'].includes(byId.get(entity).group))return '';
  const items=cultureRelated(entity);
  return '<section class="culture-beyond" aria-label="За пределами писаний"><h3>За пределами писаний</h3><p>Культурные версии образа; их особенности не относятся к литературному описанию выше.</p>'+(items.length?'<div>'+items.slice(0,3).map(media=>'<a class="culture-beyond-item" href="#culture/media/'+media.id+'"><span><b>'+escapeHTML(media.title)+'</b><small>'+media.year+' · '+escapeHTML(cultureTypes[media.type])+'</small></span>'+cultureBadge(media.relation)+'</a>').join('')+'</div>':'<p class="culture-beyond-empty">Проверенных примеров в этой коллекции пока нет.</p>')+'<a class="ink-link" href="#culture/entry/'+entity+'">'+(items.length?'Все связанные медиа ('+items.length+')':'Открыть коллекцию и фильтр существа')+' →</a></section>';
}
function cultureRefresh(){
  const results=document.getElementById('culture-results');if(!results)return;
  results.innerHTML=cultureResults();
  document.getElementById('culture-count').textContent='Найдено: '+cultureMatching().length+' из '+cultureAllMedia().length;
}
document.addEventListener('input',e=>{
  if(e.target.dataset?.cultureFilter!=='query')return;
  cultureFilters.query=e.target.value;cultureRefresh();
});
document.addEventListener('change',e=>{
  const key=e.target.dataset?.cultureFilter;
  if(!['type','relation','entity','presence'].includes(key))return;
  cultureFilters[key]=e.target.value;cultureRefresh();
});
document.addEventListener('click',e=>{
  if(!e.target.closest('[data-culture-reset]'))return;
  Object.assign(cultureFilters,{type:'all',relation:'all',entity:'all',query:'',context:'all',presence:'all'});
  document.querySelectorAll('[data-culture-filter]').forEach(control=>control.value=control.dataset.cultureFilter==='query'?'':'all');cultureRefresh();
});
document.addEventListener('submit',e=>{if(e.target.id==='culture-filters')e.preventDefault();});
