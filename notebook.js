'use strict';

const rankNames = {
  outer:'Внешние боги',elder:'Старшие боги',old:'Великие Древние',servitor:'Подчинённые расы',
  independent:'Независимые расы',other:'Отдельные случаи'
};
const realmNames = {earth:'Земля',dream:'Страна снов',space:'Космос',beyond:'За пределами мира',unknown:'Неясный ареал'};
const paintedPlates=new Set(['elder-things','yith','tsathoggua']);
const romans=['I','II','III','IV','V','VI','VII','VIII','IX'];
const noteKey=id=>'miskatonic.fieldnote.v1.'+id;
const smallHeading=text=>'<div class="folio-kicker">'+escapeHTML(text)+'</div>';
const detailsLink=(hash,title)=>'<a class="ink-link" href="#'+hash+'">'+escapeHTML(title)+' <span aria-hidden="true">↗</span></a>';
const externalSource=(url,title)=>'<a class="ink-link" target="_blank" rel="noopener noreferrer" href="'+escapeHTML(url)+'">'+escapeHTML(title)+' ↗</a>';
const bookTerm=(label,value)=>'<div class="book-term"><dt>'+escapeHTML(label)+'</dt><dd>'+escapeHTML(value)+'</dd></div>';
function shelfLinks(ids){
  return ids.filter(id=>byId.has(id)).map(id=>detailsLink('entry/'+id,byId.get(id).name)).join('');
}
function handbookHeader(kicker,title){
  return '<div class="field-header"><span class="overline copper"><span class="gold-rule"></span>'+escapeHTML(kicker)+'</span><h2 id="dialog-title">'+escapeHTML(title)+'</h2></div>';
}
function keyFacts(r,p){
  if(p)return '<dl class="field-facts">'+bookTerm('Как узнать',p.traits)+bookTerm('Где встречается',p.habitat)+'</dl>';
  const label=r.group==='places'?'Свидетельство о месте':'Описание находки';
  return '<dl class="field-facts">'+bookTerm(label,r.summary)+'</dl>';
}
function notebookPlate(r,p){
  const image=window.bookImages?.get(r.id)?plateImage(r,'','Полевой рисунок — '+r.name):paintedPlates.has(r.id)
    ?'<img class="painted" src="art/plates/'+r.id+'.webp" alt="Полевой рисунок — '+escapeHTML(r.name)+'">'
    :illustration(r,true);
  return '<div class="plate-top">'+smallHeading(p?'Натурная таблица':'Иллюстрация к записи')+'<span class="plate-number">'+(records.indexOf(r)+1).toString().padStart(2,'0')+'</span></div>'+
    '<div class="specimen-art">'+secretIllustration(r,image)+'<button type="button" class="zoom-plate" data-zoom aria-haspopup="dialog">'+icon('lens')+'<span>Рассмотреть гравюру</span></button></div>'+
    '<p class="handwriting">'+escapeHTML(p?p.behavior:r.epithet)+'</p>';
}
const runeAlphabet='ᚨᛒᚲᛞᛖᚠᚷᚺᛁᛃᚴᛚᛗᚾᛟᛈᛩᚱᛊᛏᚢᚡᚹᛪᛇᛉ';
function cipherLine(text){
  return String(text||'').toLowerCase().replace(/[a-z]/g,ch=>runeAlphabet[ch.charCodeAt(0)-97]).replace(/[’'`-]/g,'·');
}
const ruAlphabet='АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЭЮЯ';
function thumbLetter(r){return (r.name.replace(/^[^А-ЯЁа-яё]+/,'')[0]||'?').toUpperCase().replace('Ё','Е');}
function thumbTab(r){
  const letter=thumbLetter(r),i=Math.max(0,ruAlphabet.indexOf(letter));
  return '<span class="thumb-tab" style="--tab:'+(i%9)+'" aria-hidden="true">'+escapeHTML(letter)+'</span>';
}
function guideFolio(p,side){
  const m=/(\d+)/.exec(p?.guide||'');
  return m?String(+m[1]+side):null;
}
const humanFigure='<img class="size-human" src="art/human-scale.svg" alt="" decoding="async" aria-hidden="true">';
function sizeChart(r,f){
  const s=f.size;if(!s)return '';
  const numeric=Number.isFinite(s.m)&&s.m>0;
  const header='<header class="scale-card-head"><span>Сравнение с человеком</span><small>Эталон · 1,8 м</small></header>';
  if(!numeric)return '<figure class="scale-card scale-unknown">'+header+'<div class="scale-unknown-body"><span class="scale-reference">'+humanFigure+'</span><div><b>Размер не установлен</b><p>'+escapeHTML(s.label||'Нет достоверных данных')+'</p><small>Соотношение с человеком не показано: числового размера нет.</small></div></div></figure>';
  const top=Math.max(1.8,s.m),hp=1.8/top*100,cp=s.m/top*100;
  const raw=top/4,power=10**Math.floor(Math.log10(raw)),step=[1,2,5,10].map(n=>n*power).find(n=>n>=raw);
  const ticks=[];for(let v=step;v<=top+1e-6;v+=step)ticks.push('<span style="bottom:'+(v/top*100).toFixed(3)+'%">'+String(+v.toFixed(2)).replace('.',',')+' м</span>');
  return '<figure class="scale-card">'+header+'<div class="scale-plot"><div class="scale-axis" aria-hidden="true">'+ticks.join('')+'</div><div class="scale-subject"><div class="scale-height" style="--h:'+cp.toFixed(3)+'%">'+plateImage(r,'scale-drawing')+'</div><small>'+escapeHTML(r.name)+' · '+String(s.m).replace('.',',')+' м</small></div><div class="scale-subject scale-subject-human"><div class="scale-height" style="--h:'+hp.toFixed(3)+'%">'+humanFigure+'</div><small>Человек · 1,8 м</small></div></div><figcaption><p>'+escapeHTML(s.label)+'</p><small>Ориентировочный масштаб по указанному в записи размеру.</small><a class="ink-link" href="#sizes/'+r.id+'">Общая шкала размеров →</a></figcaption></figure>';
}
function secretIllustration(r,image){
  const href=window.archiveSecrets?.link(r.id);
  if(!href)return image;
  return '<a class="secret-creature-link" href="'+href+'" aria-label="Открыть тайный лист: '+escapeHTML(r.name)+'" title="Нажмите на рисунок — открыть тайный лист">'+image+'</a>';
}

function guideTitle(r){
  return '<header class="guide-title"><h2 id="dialog-title">'+escapeHTML(r.name)+'</h2><div class="cipher" aria-hidden="true">'+escapeHTML(cipherLine(r.latin))+'</div><div class="book-latin">'+escapeHTML(r.latin)+'</div></header>';
}
function guideEpigraph(r){
  return '<blockquote class="guide-epigraph"><span class="sigil" aria-hidden="true">'+icon(r.group==='places'?'places':r.group==='signs'?'rune':'eye')+'</span><p>«'+escapeHTML(r.summary)+'»</p><cite>— по рассказу: '+escapeHTML(r.sourceTitle)+'</cite></blockquote>';
}
const field=(label,text)=>text?'<p class="guide-field"><b>'+escapeHTML(label)+':</b> '+escapeHTML(text)+'</p>':'';
function guideVerso(r,p,f){
  const isBeing=!!f.habits;
  let cols;
  if(isBeing){
    cols='<div class="guide-cols"><div><p class="guide-intro">'+escapeHTML(f.intro)+'</p>'+field('Места обитания',f.habitat)+'</div><div>'+
      field('Распространение',f.range)+field('Образ жизни и повадки',f.habits)+
      (f.distinct?.length?'<div class="guide-distinct"><b>Отличительные признаки:</b><ul>'+f.distinct.map(d=>'<li>'+escapeHTML(d)+'</li>').join('')+'</ul></div>':'')+'</div></div>'+sizeChart(r,f);
  } else {
    cols='<div class="guide-cols"><div>'+field(r.group==='places'?'Где находится':'Где хранится',f.where)+field('Что это',f.what)+'<p class="guide-intro">'+escapeHTML(r.lore)+'</p></div><div>'+
      '<div class="guide-distinct"><b>Ключевые моменты:</b><ul>'+f.key.map(d=>'<li>'+escapeHTML(d)+'</li>').join('')+'</ul></div>'+
      '<div class="guide-links"><b>Связано с:</b>'+shelfLinks(r.related)+'</div></div></div>';
  }
  return thumbTab(r)+guideTitle(r)+guideEpigraph(r)+cols+(typeof cultureBeyond==='function'?cultureBeyond(r.id):'');
}
function guideRecto(r,p,f,meta){
  const figNo=records.indexOf(r)+1;
  const image=secretIllustration(r,plateImage(r,'plate-main','Полевой рисунок — '+r.name));
  const keys=f.key||[];
  const notesHtml=(f.notes||[]).map((n,i)=>'<p class="ink-note n'+i+'"><span>'+escapeHTML(n.t)+'</span>'+escapeHTML(n.x)+'</p>').join('');
  return thumbTab(r)+
    '<aside class="key-slip"><b>Ключевые приметы</b><ol>'+keys.map(k=>'<li>'+escapeHTML(k)+'</li>').join('')+'</ol></aside>'+
    '<div class="specimen-art guide-art motion-'+motionOf(r.id)+'"><div class="living">'+image+'</div><div class="plate-tools"><button type="button" class="zoom-plate" data-still>'+icon(document.body.classList.contains('still-art')?'play':'pause')+(document.body.classList.contains('still-art')?'Оживить':'Замереть')+'</button><button type="button" class="zoom-plate" data-zoom aria-haspopup="dialog">'+icon('lens')+'<span>Рассмотреть</span></button></div></div>'+
    '<div class="margin-notes">'+notesHtml+'</div>'+
    '<div class="plate-foot"><span>'+escapeHTML(meta)+'</span><span class="ink">Рис. '+figNo+' — '+escapeHTML(r.name)+'</span></div>';
}
function openNotebook(r,notes){
  const p=window.speciesProfiles[r.id];
  const f=window.fieldNotes?.[r.id]||{intro:r.summary,key:[r.epithet]};
  const historic=window.earthEpochs.filter(e=>e.records.includes(r.id));
  const href='#entry/'+r.id;
  const meta=p?[p.subrank||rankNames[p.rank],realmNames[p.realm]].filter(Boolean).join(' · '):r.kind;
  const guideRef=f.guide||p?.guide||'';
  const title='<h2 id="dialog-title">'+escapeHTML(r.name)+'</h2><div class="book-latin">'+escapeHTML(r.latin)+'</div>';
  const source='<div class="book-source">'+externalSource(r.sourceUrl,r.sourceTitle)+(guideRef?'<small>Руководство натуралиста · '+escapeHTML(guideRef)+'</small>':'')+'</div>';
  const v=window.voices?.[r.id], log=window.fieldLogs?.[r.id];
  const voice=v?'<figure class="author-voice'+(v.retold?' retold':'')+'"><figcaption>'+(v.retold?'Как это было в рассказе · пересказ':'Как описывал автор')+'</figcaption>'+
    (v.en?'<blockquote class="voice-en" lang="en">'+escapeHTML(v.en)+'</blockquote>':'')+'<p class="voice-ru">'+(v.retold?'':'«')+escapeHTML(v.ru)+(v.retold?'':'»')+'</p><cite>— '+escapeHTML(v.by)+'</cite></figure>'
    :'<figure class="author-voice retold"><figcaption>Из рассказа</figcaption><p class="voice-ru">'+escapeHTML(r.summary)+'</p><cite>— '+escapeHTML(r.sourceTitle)+'</cite></figure>';
  const leftNotes=thumbTab(r)+'<header class="guide-title"><h2 id="dialog-title">'+escapeHTML(r.name)+'</h2><div class="cipher" aria-hidden="true">'+escapeHTML(cipherLine('testimony'))+'</div><div class="book-latin">Свидетельства · '+escapeHTML(r.latin)+'</div></header>'+
    voice+'<p class="book-lore dropcap">'+escapeHTML(r.lore)+'</p>'+
    (p?'<dl class="field-facts two">'+bookTerm('Как узнать',p.traits)+bookTerm('Что наблюдали',p.behavior)+'</dl>':'')+
    '<div class="read-where"><b>Где читать:</b> '+externalSource(r.sourceUrl,r.sourceTitle)+(guideRef?' · <span>«Руководство натуралиста», '+escapeHTML(guideRef)+'</span>':'')+(window.uolUrl&&window.uolUrl(r.id)?' · <a class="ink-link" href="'+window.uolUrl(r.id)+'" target="_blank" rel="noopener noreferrer">Энциклопедия существ ↗</a>':'')+'</div>'+
    (historic.length?'<div class="book-refs"><h3>В хронике Старцев</h3>'+historic.map(e=>detailsLink('chronicle/'+e.id,e.title)).join('')+'</div>':'');
  const marg=(f.notes||[]).map((n,i)=>'<p class="ink-note n'+i+'"><span>'+escapeHTML(n.t)+'</span>'+escapeHTML(n.x)+'</p>').join('');
  const rightNotes=thumbTab(r)+
    (log?'<aside class="log-card"><span class="pin" aria-hidden="true"></span><b>Из полевой книжки</b><p>'+escapeHTML(log)+'</p><small>— неизвестный исследователь Мискатоника</small></aside>':'')+
    '<div class="notes-portrait">'+plateImage(r,'sketch','')+'</div>'+
    (marg?'<div class="margin-notes">'+marg+'</div>':'')+
    '<h3 class="notes-title">Ваши заметки</h3><label class="sr" for="field-note">Моя заметка — '+escapeHTML(r.name)+'</label><textarea maxlength="4000" id="field-note" placeholder="Запишите примету, вопрос или ссылку на рассказ…"></textarea><small class="note-status" id="note-status" aria-live="polite">Заметки хранятся в этом браузере.</small>'+
    '<div class="book-refs"><h3>См. также</h3>'+shelfLinks(r.related)+detailsLink('atlas/'+r.id,'Родословное древо')+
    (p?detailsLink('hierarchy/'+p.rank,'Пантеон')+detailsLink('habitats','Карта'):'')+(f.size?detailsLink('sizes/'+r.id,'Шкала размеров'):'')+'</div>';
  const pl=guideFolio(p&&{guide:guideRef},0),pr=guideFolio(p&&{guide:guideRef},1);
  const folios=notes?[pl?String(+pl+0)+'·':'·',pr?pr+'·':'·']:[pl||'1',pr||'2'];
  openFolio('<div class="book-binding"><span>'+icon('book')+' Руководство натуралиста</span><button class="secondary record-save" type="button" data-save="'+r.id+'"></button></div>'+
    '<div class="open-book guide-book '+(notes?'turned notes-spread':'')+'"><section class="book-page verso">'+(notes?leftNotes:guideVerso(r,p,f))+'<div class="folio-page">'+folios[0]+'</div></section>'+
    '<section class="book-page recto">'+(notes?rightNotes:guideRecto(r,p,f,meta))+'<div class="folio-page">'+folios[1]+'</div></section></div>'+
    '<div class="book-bottom"><span>Разворот '+(notes?'2':'1')+' из 2'+(guideRef&&!notes?'<span class="bottom-ref"> · по «Руководству натуралиста», '+escapeHTML(guideRef)+'</span>':'')+'</span><a class="leaf-link" data-leaf href="'+href+(notes?'':'/notes')+'">'+(notes?'← Описание и рисунок':'Свидетельства и заметки →')+'</a></div>', 'notebook-mode');
  updateBookmarkButton($('folio').querySelector('[data-save]'),r.id);
  if(notes)bindNote(r.id);
}
function bindNote(id){
  const field=$('field-note'),status=$('note-status');
  try{field.value=localStorage.getItem(noteKey(id))||'';}catch{status.textContent='Хранилище браузера недоступно.';}
  field.addEventListener('input',()=>{
    try{
      if(field.value)localStorage.setItem(noteKey(id),field.value);else localStorage.removeItem(noteKey(id));
      status.textContent=field.value?'Сохранено в этом браузере.':'Заметка удалена.';
    }catch{status.textContent='Не удалось сохранить. Скопируйте заметку перед закрытием.';}
  });
}
function specimenListing(items,describe){
  return '<div class="species-list">'+items.map(r=>'<a href="#entry/'+r.id+'">'+illustration(r,true)+'<span><b>'+escapeHTML(r.name)+'</b><small>'+escapeHTML(describe(r))+'</small></span>'+icon('arrow')+'</a>').join('')+'</div>';
}
function openHierarchy(id){
  const profiles=window.speciesProfiles;
  const groups=Object.keys(rankNames).map(key=>({key,items:records.filter(r=>profiles[r.id]?.rank===key)})).filter(g=>g.items.length);
  const current=groups.find(g=>g.key===id)||groups[0];
  function branch(g){
    return '<a class="taxon-branch" href="#hierarchy/'+g.key+'" '+(g===current?'aria-current="page"':'')+'><b>'+escapeHTML(rankNames[g.key])+'</b><span>'+g.items.length+'</span></a>';
  }
  const branches=[['Пантеон',['outer','old']],['Народы и существа',['servitor','independent','other']]];
  const tree=branches.map(([name,keys])=>'<section><h3>'+name+'</h3><div>'+groups.filter(g=>keys.includes(g.key)).map(branch).join('')+'</div></section>').join('');
  openFolio(handbookHeader('Систематика','Иерархия мифов')+'<div class="manual-body"><p class="manual-intro">Выберите ветвь, чтобы открыть её представителей. Здесь собраны 29 обитателей архива. Для существ, чьё положение на схеме не установлено, есть раздел «Отдельные случаи».</p><div class="taxon-tree">'+tree+'</div><h3 class="manual-sub">'+rankNames[current.key]+'</h3>'+
    specimenListing(current.items,r=>profiles[r.id].subrank||r.kind)+'</div>','manual-mode');
}
function openChronicle(id){
  const epochs=window.earthEpochs;
  const index=Math.max(0,epochs.findIndex(e=>e.id===id)),e=epochs[index];
  const nav=epochs.map((item,i)=>'<a href="#chronicle/'+item.id+'" class="epoch-step" '+(i===index?'aria-current="step"':'')+'><span>'+romans[i]+'</span>'+escapeHTML(item.title)+'</a>').join('');
  const prev=index?detailsLink('chronicle/'+epochs[index-1].id,'← Назад'):'<span></span>';
  const next=index<epochs.length-1?detailsLink('chronicle/'+epochs[index+1].id,'Следующий этап') : detailsLink('entry/elder-things','В дневник Старцев');
  const area=e.zone==='pacific'?'pacific':e.zone==='antarctic'||e.id==='arrival'||e.id==='landfall'?'antarctic':null;
  const mapLink=area?detailsLink('habitats/earth/'+area,'Район на глобусе'):'';
  openFolio(handbookHeader('История Земли в «Хребтах Безумия»','Хроника Старцев')+
    '<div class="epoch-layout"><nav class="epoch-nav" aria-label="Этапы истории Старцев">'+nav+'</nav><section class="epoch-story"><div class="epoch-plate"><img src="art/'+e.image+'.webp" alt=""><span>'+escapeHTML(e.era)+'</span></div><div class="epoch-text">'+smallHeading('Этап '+romans[index]+' · '+e.place)+'<h3>'+escapeHTML(e.title)+'</h3><p>'+escapeHTML(e.body)+'</p><p class="evidence">'+escapeHTML(e.evidence)+'</p><div class="book-refs">'+shelfLinks(e.records)+'</div>'+
    '<div class="book-source">'+mapLink+externalSource(e.sourceUrl,e.sourceTitle)+'</div><div class="epoch-turn">'+prev+next+'</div></div></section></div>','manual-mode');
}
