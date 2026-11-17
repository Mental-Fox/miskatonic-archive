'use strict';
const records = window.ENTRIES;
const byId = new Map(records.map(record => [record.id, record]));
const sections = [
  ['all','Все записи','grid'], ['gods','Боги','eye'], ['creatures','Существа','wing'],
  ['places','Места','places'], ['signs','Знаки и реликвии','rune'], ['books','Библиотека','book']
];
const paths = {
  globe:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4.5" ry="9"/><path d="M3 12h18M5 6.5q7 4 14 0m-14 11q7-4 14 0"/>',
  order:'<path d="M12 5v6M5 16v-5h14v5"/><circle cx="12" cy="4" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="19" cy="18" r="2"/>',
  atlas:'<circle cx="12" cy="12" r="2.4"/><circle cx="5" cy="5" r="1.6"/><circle cx="19" cy="6" r="1.6"/><circle cx="6" cy="20" r="1.6"/><path d="m6.2 6.2 4 4m3.7.4 3.8-3.4m-7 6.5-3.6 5"/>',
  lens:'<circle cx="10" cy="10" r="6.4"/><path d="m15 15 6 6M7.2 10a3 3 0 0 1 3-3"/>',
  bookmark:'<path d="M6.5 3.5h11v17L12 17l-5.5 3.5z"/>',
  book:'<path d="M12 5.8C8.8 3.9 5.9 3.6 2.5 4.5v14.3c3.5-.9 6.2-.5 9.5 1.5 3.3-2 6-2.4 9.5-1.5V4.5c-3.4-.9-6.3-.6-9.5 1.3v14.5"/>',
  'arrow-down':'<path d="M12 4v15m-6-6 6 6 6-6"/>',
  arrow:'<path d="M5 17 18 4M7 4h11v11"/>',
  search:'<circle cx="10" cy="10" r="6.3"/><path d="m15 15 5 5"/>',
  grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  eye:'<path d="M2 12s4-6.5 10-6.5S22 12 22 12s-4 6.5-10 6.5S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  wing:'<path d="m4 20 3.5-7L4 6l6 3 9-6-2 6-3 3 1 4-5-1-6 5Z"/>',
  places:'<path d="M3 20h18M5 20V9l3-3 3 3v11m1-13 3-4 4 4v13M8 11v2m7-4v2m1 3v2"/>',
  rune:'<path d="m12 2 7 7-7 6-7-6 7-7Zm0 0v20m-5-4 5-4 5 4"/>',
  close:'<path d="m5 5 14 14m0-14L5 19"/>',
  plus:'<path d="M12 5v14M5 12h14"/>'
};
const icon = name => '<svg class="icon" aria-hidden="true" viewBox="0 0 24 24">'+paths[name]+'</svg>';
const $ = id => document.getElementById(id);
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const normalize = value => String(value ?? '').toLocaleLowerCase('ru').replaceAll('ё','е').replace(/[^\p{L}\p{N}]/gu,'');
const plural = n => n%10===1 && n%100!==11 ? 'запись' : n%10>=2 && n%10<=4 && (n%100<12 || n%100>14) ? 'записи' : 'записей';
const fileAliases = {'deep-ones':'deep-one','elder-things':'elder-thing','nightgaunts':'nightgaunt','ghouls':'ghoul','pnakotic':'pnakotic-manuscripts'};
function artPath(record){
  if(record.group==='books' && !['necronomicon','pnakotic'].includes(record.id)) return 'art/books/'+record.id+'.svg';
  return 'art/'+(fileAliases[record.id] || record.id)+'.webp';
}
function illustration(record, eager=false){
  return '<img src="'+artPath(record)+'" alt="" loading="'+(eager?'eager':'lazy')+'"'+(record.group==='books'?' class="book-cover"':'')+'>';
}
/* Вырезанный рисунок на пергаменте: сначала ваша картинка в art/plates (webp или png),
   затем автоматически вырезанная art/cutouts, в конце — обычная гравюра в рамке. */
const cutoutSet=new Set(['brown-jenkin','chaugnar-faugn','cthulhu','deep-one','ghoul','gug','hastur','mi-go','moon-beast','nightgaunt','nyarlathotep','yig','zoog','flying-polyps','azathoth','dagon','shantak','shoggoth','nodens','bokrug']);
const paintedSet=new Set(['elder-things','yith','tsathoggua']);
function plateCandidates(record){
  const file=fileAliases[record.id] || record.id, list=[];
  if(paintedSet.has(record.id)) list.push('art/plates/'+record.id+'.webp');
  else if(['gods','creatures'].includes(record.group)) list.push('art/plates/'+record.id+'.png');
  if(cutoutSet.has(file)) list.push('art/cutouts/'+file+'.webp');
  list.push(artPath(record));
  return list;
}
function plateImage(record, cls='', alt=''){
  const [first,...rest]=plateCandidates(record);
  const framed=rest.length===0 && !(record.group==='books' && !first.endsWith('.webp'));
  return '<img class="plate-img '+cls+(framed?' framed':'')+'" src="'+first+'" data-next="'+rest.join('|')+'" alt="'+escapeHTML(alt)+'" onerror="plateFallback(this)">';
}
function plateFallback(img){
  const rest=(img.dataset.next||'').split('|').filter(Boolean);
  if(!rest.length){img.onerror=null;return;}
  const next=rest.shift();img.dataset.next=rest.join('|');
  if(!rest.length && !next.includes('/books/')) img.classList.add('framed');
  img.src=next;
}
let favorites = new Set();
try {
  const saved = JSON.parse(localStorage.getItem('miskatonic.bookmarks.v1') || '[]');
  if(Array.isArray(saved)) favorites = new Set(saved.filter(id => byId.has(id)));
} catch {}
let section = 'all', shelfOnly = false, limit = 12, dialogOpener = null;
document.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML=icon(el.dataset.icon); });
$('filters').innerHTML=sections.map(([id,label,glyph]) => '<button type="button" class="filter" data-section="'+id+'" aria-pressed="false">'+icon(glyph)+label+'</button>').join('');
function saveLabel(id){
  return (favorites.has(id)?'Убрать из избранного':'Добавить в избранное')+' — '+byId.get(id).name;
}
function updateBookmarkButton(el,id){
  const saved=favorites.has(id);
  el.classList.toggle('saved',saved);
  el.setAttribute('aria-pressed',String(saved));
  el.setAttribute('aria-label',saveLabel(id));
  el.title=saveLabel(id);
  if(el.classList.contains('record-save')) el.innerHTML=icon('bookmark')+(saved?'В избранном':'В избранное');
}
const guideAliases={'elder-things':'Старец Старцы Старейшины','tsathoggua':'Цатоггуа Цатхогуа','yith':'Йитианец Йитианцы Иит'};
function render(){
  const query=normalize($('search').value);
  const matches=records.filter(r => (!shelfOnly || favorites.has(r.id)) && (section==='all' || r.group===section) &&
    (!query || [r.name,r.latin,r.epithet,r.kind,r.summary,guideAliases[r.id]].some(v=>normalize(v).includes(query))));
  $('shelf').classList.toggle('active',shelfOnly);
  $('nav-catalog').classList.toggle('nav-current',!shelfOnly);
  $('favorite-total').textContent=favorites.size;
  $('catalog-title').textContent=shelfOnly?'Избранное':'Каталог архива';
  $('instruments').hidden=shelfOnly;
  $('entry-count').textContent=matches.length+' '+plural(matches.length);
  for(const el of $('filters').children) el.setAttribute('aria-pressed',el.dataset.section===section);
  $('cards').innerHTML=matches.slice(0,limit).map((r,i)=> {
    const id=escapeHTML(r.id);
    const f=window.fieldNotes?.[r.id]||{},p=window.speciesProfiles?.[r.id];
    const keys=(f.key||[]).slice(0,3).map(k=>'<li>'+escapeHTML(k)+'</li>').join('');
    const ref=f.guide||p?.guide||'';
    return '<article class="card notebook-card"><a class="card-link" href="#entry/'+id+'" aria-label="Открыть запись «'+escapeHTML(r.name)+'»">'+thumbTab(r)+
      '<div class="nb-head"><div class="taxon">'+escapeHTML(r.kind)+'</div><span class="nb-no">№ '+String(records.indexOf(r)+1).padStart(2,'0')+'</span></div>'+
      '<div class="card-art nb-photo">'+illustration(r,i<3)+'</div>'+
      '<div class="card-body"><div class="card-name"><h3>'+escapeHTML(r.name)+'</h3>'+icon('arrow')+'</div><div class="cipher" aria-hidden="true">'+escapeHTML(cipherLine(r.latin))+'</div>'+
      '<p class="nb-epithet">'+escapeHTML(r.epithet)+'</p>'+(keys?'<ul class="nb-keys">'+keys+'</ul>':'<p>'+escapeHTML(r.summary)+'</p>')+
      '<div class="nb-foot">'+(ref?'Руководство · '+escapeHTML(ref):escapeHTML(r.sourceTitle.replace(/^.*?«/,'«')))+'</div></div></a><button type="button" class="save" data-save="'+id+'">'+icon('bookmark')+'</button></article>';
  }).join('');
  $('cards').querySelectorAll('[data-save]').forEach(el=>updateBookmarkButton(el,el.dataset.save));
  if(!matches.length){
    const emptyShelf=shelfOnly && !favorites.size;
    $('cards').innerHTML='<div class="empty"><h3>'+(emptyShelf?'Закладок пока нет':'Записи не найдены')+'</h3><p>'+(emptyShelf?'Нажмите на закладку в углу карточки, чтобы сохранить запись.':'Попробуйте другое имя или выберите другой раздел.')+'</p><button class="secondary" type="button" data-reset>'+(emptyShelf?'Открыть каталог':'Сбросить фильтры')+'</button></div>';
  }
  $('more').innerHTML=matches.length>limit?'<button class="more" type="button">'+icon('plus')+'Показать ещё ('+Math.min(12,matches.length-limit)+')</button>':'';
}
function toggleBookmark(id){
  if(!byId.has(id)) return;
  if(favorites.has(id)) favorites.delete(id); else favorites.add(id);
  try{localStorage.setItem('miskatonic.bookmarks.v1',JSON.stringify([...favorites]));}catch{}
  $('announce').textContent=byId.get(id).name+(favorites.has(id)?' — в избранном':' — закладка удалена');
  if(shelfOnly){render();}else{
    $('favorite-total').textContent=favorites.size;
    document.querySelectorAll('#cards [data-save="'+id+'"]').forEach(el=>updateBookmarkButton(el,id));
  }
  const el=$('folio').querySelector('[data-save]');if(el)updateBookmarkButton(el,el.dataset.save);
}
const closeHead='<div class="record-head"><button type="button" class="close" data-close aria-label="Закрыть">'+icon('close')+'</button></div>';
function openFolio(markup,mode='record-mode'){
  const dialog=$('folio');
  if(!dialog.open) dialogOpener=document.activeElement;
  dialog.className=mode;
  $('folio-content').innerHTML=closeHead+markup;
  if(!dialog.open) dialog.showModal();
  dialog.scrollTop=0;
  dialog.querySelector('[data-close]').focus({preventScroll:true});
}
function scrollCatalog(){
  $('catalog').scrollIntoView({block:'start'});
}
function closeFolio(){
  const returnHash=history.state?.fieldReturn;
  if(location.hash.startsWith('#entry/') && returnHash){
    history.replaceState(null,'',returnHash);route();return;
  }
  history.replaceState(null,'',shelfOnly?'#favorites':'#catalog');
  $('folio').close();
  if(dialogOpener?.isConnected && dialogOpener!==document.body)dialogOpener.focus({preventScroll:true});
  else $('catalog').focus({preventScroll:true});
}
function route(){
  const hash=location.hash;
  const [view, id, leaf, layer] = hash.slice(1).split('/');
  if(view==='chronicle'){openChronicle(id);return;}
  if(view==='hierarchy'){openHierarchy(id);return;}
  if(view==='sizes'){openSizes(id);return;}
  if(view==='habitats'){openHabitats(id,leaf,layer);return;}
  if(hash==='#identify'){openIdentification();return;}
  if(hash.startsWith('#atlas/')){
    const record=byId.get(id);
    if(record){openAtlas(record,leaf);return;}
  }
  if(hash.startsWith('#entry/')){
    const record=byId.get(id);
    if(record){openNotebook(record,leaf==='notes');return;}
  }
  if(hash==='#about'){
    openFolio('<div class="record-copy about-copy"><div class="overline copper"><span class="gold-rule"></span>Мискатоник</div><h2 id="dialog-title">Об архиве</h2><p class="lead">Путеводитель по мифам Ктулху для тех, кто хочет вернуться от знакомого имени к рассказу, где оно появилось.</p><p>В карточках собраны существа, места, знаки и книги из произведений Лавкрафта и других авторов. Ссылка на текст и переходы между записями помогают проследить, как связаны легенды. Вселенная мифов продолжает расти, а классификация служит для навигации по этому изданию.</p><p>Иллюстрации созданы специально для архива с помощью генерации изображений. Облик персонажей и начертание знаков передают художественную интерпретацию.</p><p>Полевые признаки и указатели страниц сверены с русским «Бестиарием Лавкрафта. Руководством натуралиста». Хроника следует последовательности событий в «Хребтах Безумия». Избранное и ваши заметки сохраняются в этом браузере.</p>'+referenceShelf()+'</div>');return;
  }
  if($('folio').open)$('folio').close();
  atlasTrail=[];
  const nextShelf=hash==='#favorites';
  if(nextShelf!==shelfOnly || !hash){shelfOnly=nextShelf;section='all';$('search').value='';limit=12;}
  render();
  if(hash==='#catalog'||nextShelf)scrollCatalog();
  else if(!hash)window.scrollTo({top:0});
}
document.addEventListener('click',event=>{
  const target=event.target.closest('button,a');
  if(event.target===$('folio')){const r=$('folio').getBoundingClientRect();if(event.clientX<r.left || event.clientX>r.right || event.clientY<r.top || event.clientY>r.bottom)closeFolio();return;}
  if(!target)return;
  if(target.hasAttribute('data-leaf')){
    event.preventDefault();history.replaceState(history.state,'',target.href);route();
    $('folio').querySelector('[data-leaf]')?.focus({preventScroll:true});return;
  }
  if(target.dataset.quiz||target.dataset.answer){fieldAction(target);return;}
  if(target.hasAttribute('data-zoom')){
    const expanded=target.getAttribute('aria-expanded')!=='true';
    target.setAttribute('aria-expanded',String(expanded));
    target.closest('.record-art, .specimen-art').classList.toggle('full-plate',expanded);
    target.querySelector('span').textContent=expanded?'Свернуть гравюру':'Рассмотреть гравюру';
    return;
  }
  const address=target.getAttribute('href');
  if(address?.startsWith('#entry/') && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey){
    const origin=/^#(?:atlas|identify|chronicle|habitats|hierarchy|sizes)(?:\/|$)/.test(location.hash)?location.hash:history.state?.fieldReturn;
    if(origin){event.preventDefault();history.pushState({fieldReturn:origin},'',address);route();return;}
  }
  if(target.hasAttribute('data-close')){closeFolio();return;}
  if(target.dataset.save){toggleBookmark(target.dataset.save);return;}
  if(target.dataset.section){section=target.dataset.section;limit=12;render();return;}
  if(target.hasAttribute('data-reset')){section='all';$('search').value='';limit=12;if(shelfOnly && !favorites.size)location.hash='catalog';else render();return;}
  if(target.classList.contains('more')){const firstNew=limit;limit+=12;render();$('cards').children[firstNew]?.querySelector('a')?.focus({preventScroll:true});return;}
  if(target.getAttribute('href')===location.hash && ['#catalog','#favorites'].includes(location.hash))scrollCatalog();
});
$('folio').addEventListener('cancel',event=>{event.preventDefault();closeFolio();});
$('search').addEventListener('input',()=>{limit=12;render();});
document.addEventListener('keydown',event=>{
  if(event.key==='/' && !$('folio').open && !event.ctrlKey && !event.metaKey && document.activeElement!==$('search')){event.preventDefault();$('search').focus();}
});
window.addEventListener('hashchange',route);
render();route();
