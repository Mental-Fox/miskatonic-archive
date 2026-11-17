'use strict';
/* Пантеон: печатная карта с авторскими условными знаками. */
const domeRanks=[
  {key:'outer',label:'Внешние боги',text:'Космические силы, связанные с устройством мироздания.',color:'#b39b73'},
  {key:'old',label:'Великие Древние',text:'Древние боги и могущественные существа, почитаемые земными культами.',color:'#93a487'},
  {key:'elder',label:'Старшие боги',text:'Отдельная группа богов, к которой здесь отнесён Ноденс.',color:'#83a7a5'},
  {key:'servitor',label:'Подчинённые расы',text:'Расы, связанные со служением богам и Древним.',color:'#a89cba'},
  {key:'independent',label:'Независимые расы',text:'Народы и цивилизации с собственной историей.',color:'#91a7ba'},
  {key:'other',label:'Одиночки и другие существа',text:'Фамильяры, порождения и существа вне основных групп.',color:'#bb967d'}
];
const domeRealms=[['all','Все миры'],['earth','Земля'],['dream','Страна снов'],['space','Космос'],['beyond','За пределами мира']];
let domeState={sel:null,realm:'all',rank:null,query:''};
function domeRank(r){
  const key=window.speciesProfiles[r.id]?.rank;
  return r.id==='nodens'||key==='elder'?'elder':key;
}
function domeLayout(){
  return records.filter(r=>domeRanks.some(g=>g.key===domeRank(r))).map(r=>({r,rank:domeRank(r)}));
}
function domeMatches(r){
  const profile=window.speciesProfiles[r.id];
  const query=domeState.query.trim().toLocaleLowerCase('ru').replaceAll('ё','е');
  const text=[r.name,r.latin,r.epithet].join(' ').toLocaleLowerCase('ru').replaceAll('ё','е');
  return (domeState.realm==='all'||inRealm(profile,domeState.realm))&&(!query||text.includes(query));
}
function domeSigil(r){
  const signs={
    azathoth:'M16 10v-6m0 24v-6M10 16H4m24 0h-6M12 12 7 7m18 18-5-5M12 20l-5 5M25 7l-5 5M16 10l6 6-6 6-6-6Z',
    cthulhu:'M9 8q7 8 14 0M10 8v9q0 12 4 7V14m4-1v11q6 5 4-5M8 6l-2 4m18-4 2 4',
    'yog-sothoth':'M16 7a6 6 0 1 0 0 12 6 6 0 1 0 0-12M11 14a6 6 0 1 0 0 12 6 6 0 1 0 0-12M21 14a6 6 0 1 0 0 12 6 6 0 1 0 0-12',
    'shub-niggurath':'M8 5q16 4 0 9 16 4 0 8m16-17Q8 9 24 14 8 18 24 22M16 9v18m-5-2h10',
    nyarlathotep:'M16 27V5q7-2 6 4t-1 10h-9q-5-2-3-6m2 14 3-7m6 7-2-7',
    nodens:'M7 6l18 20M25 6 7 26M5 12h22M5 20h22M16 4v24'
  };
  let path=signs[r.id]||window.periodKey?.[r.id]?.glyph;
  if(!path){
    let hash=0;for(const c of r.id)hash=(hash*31+c.charCodeAt(0))>>>0;
    const motifs=['M8 8h16L8 24h16','M8 9q16-10 16 5T8 23','M7 12h18M7 20h18M16 5v22','M8 7l16 18M24 7 8 25','M16 5 7 22h18ZM10 15h12','M7 9q18 0 9 10t9 5'];
    path=motifs[hash%motifs.length]+(hash&1?'M12 6v20':'M6 16h20')+(hash&2?'M21 5a2 2 0 1 0 .1 0':'M10 25a2 2 0 1 0 .1 0');
  }
  return '<svg class="pantheon-sigil" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18.5"/><path transform="translate(4 4)" d="'+escapeHTML(path)+'"/></svg>';
}
function domeCard(r){
  const group=domeRanks.find(g=>g.key===domeRank(r));
  const linked=new Set(r.related||[]);
  records.forEach(other=>{if(other.related?.includes(r.id))linked.add(other.id);});
  const related=[...linked].map(id=>byId.get(id)).filter(Boolean).slice(0,6);
  return '<div class="hierarchy-detail-caption">Выбранная запись</div><div class="dome-portrait">'+plateImage(r,'plate-main')+'</div>'+
    '<div class="taxon">'+escapeHTML(group.label)+'</div><h3>'+escapeHTML(r.name)+'</h3>'+
    '<div class="book-latin">'+escapeHTML([r.latin,r.epithet].filter(Boolean).join(' · '))+'</div><p>'+escapeHTML(r.summary||'')+'</p>'+
    '<p class="dome-rank">'+escapeHTML(group.text)+'</p>'+
    '<div class="dome-actions"><a class="secondary" href="#entry/'+r.id+'">'+icon('book')+' Описание</a><a class="secondary" href="#atlas/'+r.id+'">'+icon('atlas')+' Связи</a></div>'+
    (related.length?'<div class="hierarchy-related"><h4>Связанные записи</h4>'+related.map(item=>'<a href="#entry/'+item.id+'">'+escapeHTML(item.name)+'</a>').join('')+'</div>':'');
}
function openHierarchy(rankId){
  domeState.rank=domeRanks.some(g=>g.key===rankId)?rankId:null;
  const nodes=domeLayout();
  const tiers=domeRanks.map((group,index)=>{
    const members=nodes.filter(n=>n.rank===group.key);
    return '<section class="hierarchy-tier" data-tier="'+group.key+'"><header class="pantheon-group-heading"><span>'+String(index+1).padStart(2,'0')+'</span><h3>'+escapeHTML(group.label)+'</h3><span data-tier-count="'+group.key+'">'+members.length+'</span></header><div class="hierarchy-members">'+members.map(({r},i)=>
      '<button type="button" class="hierarchy-member" data-dome="'+r.id+'" data-rank="'+group.key+'" aria-pressed="false" style="--stagger:'+([0,16,29,16,0][i%5])+'px"><span class="hierarchy-member-art">'+domeSigil(r)+'</span><span class="hierarchy-member-copy"><strong>'+escapeHTML(r.name)+'</strong><small>'+escapeHTML(r.epithet||r.latin||'')+'</small></span></button>'
    ).join('')+'</div><svg class="pantheon-arc" viewBox="0 0 1000 90" preserveAspectRatio="none" aria-hidden="true"><path d="M1 1Q500 175 999 1"/></svg></section>';
  }).join('');
  openFolio('<section class="hierarchy-sheet"><header class="hierarchy-head"><div class="pantheon-title"><span class="hierarchy-eyebrow">Мискатоникский архив · карта мироздания</span><h2 id="dialog-title">Пантеон<span>Мифов Ктулху</span></h2><p>Боги, древние расы и обитатели иных миров</p></div><label class="hierarchy-search"><span>'+icon('search')+'</span><input type="search" data-hierarchy-search aria-label="Найти существо в пантеоне" placeholder="Имя существа…" value="'+escapeHTML(domeState.query)+'"></label></header>'+
    '<div class="hierarchy-toolbar"><div class="hierarchy-realms" role="group" aria-label="Миры">'+domeRealms.map(([key,label])=>'<button type="button" data-realm="'+key+'" aria-pressed="'+(domeState.realm===key)+'">'+label+'</button>').join('')+'</div><span id="hierarchy-result-count" role="status" aria-live="polite"></span></div>'+
    '<div class="hierarchy-ranks" role="group" aria-label="Группы существ"><button type="button" data-ring-btn="all" aria-pressed="'+!domeState.rank+'">Все группы</button>'+domeRanks.map(group=>'<button type="button" data-ring-btn="'+group.key+'" aria-pressed="'+(domeState.rank===group.key)+'">'+escapeHTML(group.label)+' <span data-rank-count="'+group.key+'"></span></button>').join('')+'</div>'+
    '<p class="pantheon-key">Выберите знак, чтобы открыть запись · Условные знаки архива</p><div class="hierarchy-layout"><div class="hierarchy-tiers">'+tiers+'<div class="hierarchy-empty" hidden><h3>Ничего не найдено</h3><p>Попробуйте другое имя или сбросьте фильтры.</p><button type="button" data-hierarchy-reset>Показать всех</button></div></div></div><dialog class="hierarchy-info" aria-label="Запись пантеона"><button type="button" class="pantheon-close" data-hierarchy-close aria-label="Закрыть запись">×</button><div class="dome-card hierarchy-detail" aria-live="polite"></div></dialog></section>',
    'notebook-mode dome-mode hierarchy-mode hierarchy-poster-mode');
  domeApplyRealm();
}
function domeSelect(id,reveal=false){
  const folio=$('folio');
  if(!folio.classList.contains('hierarchy-mode'))return;
  const record=byId.get(id);
  if(!record||!domeRanks.some(g=>g.key===domeRank(record)))return;
  domeState.sel=id;
  const links=new Set(record.related||[]);
  records.forEach(r=>{if(r.related?.includes(id))links.add(r.id);});
  folio.querySelectorAll('[data-dome]').forEach(node=>{
    const selected=node.dataset.dome===id;
    node.classList.toggle('is-selected',selected);
    node.classList.toggle('is-related',links.has(node.dataset.dome));
    node.setAttribute('aria-pressed',String(selected));
  });
  const detail=folio.querySelector('.hierarchy-detail');
  detail.innerHTML=domeCard(record);
  if(reveal){const dialog=folio.querySelector('.hierarchy-info');if(!dialog.open)dialog.showModal?.();}
}
function domeApplyRealm(){
  const folio=$('folio');
  if(!folio.classList.contains('hierarchy-mode'))return;
  const nodes=domeLayout(),matching=nodes.filter(n=>domeMatches(n.r));
  const visible=matching.filter(n=>!domeState.rank||n.rank===domeState.rank);
  const ids=new Set(visible.map(n=>n.r.id));
  folio.querySelectorAll('[data-dome]').forEach(node=>{node.hidden=!ids.has(node.dataset.dome);});
  domeRanks.forEach(group=>{
    const tier=folio.querySelector('[data-tier="'+group.key+'"]');
    const count=visible.filter(n=>n.rank===group.key).length;
    tier.hidden=count===0;
    folio.querySelector('[data-tier-count="'+group.key+'"]').textContent=count;
    folio.querySelector('[data-rank-count="'+group.key+'"]').textContent=matching.filter(n=>n.rank===group.key).length;
  });
  folio.querySelectorAll('[data-realm]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.realm===domeState.realm)));
  folio.querySelectorAll('[data-ring-btn]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.ringBtn===(domeState.rank||'all'))));
  folio.querySelector('#hierarchy-result-count').textContent=visible.length+' из '+nodes.length+' записей';
  folio.querySelector('.hierarchy-empty').hidden=visible.length>0;
  if(!ids.has(domeState.sel))domeState.sel=ids.has('cthulhu')?'cthulhu':visible[0]?.r.id||null;
  if(domeState.sel)domeSelect(domeState.sel);
  else folio.querySelector('.hierarchy-detail').innerHTML='<div class="hierarchy-detail-placeholder">'+icon('book')+'<p>Измените фильтры, чтобы выбрать существо.</p></div>';
}
document.addEventListener('click',event=>{
  const folio=$('folio');if(!folio.classList.contains('hierarchy-mode'))return;
  if(event.target.closest('[data-hierarchy-close]')){folio.querySelector('.hierarchy-info').close();return;}
  const node=event.target.closest('[data-dome]');
  if(node){domeSelect(node.dataset.dome,true);return;}
  const realm=event.target.closest('[data-realm]');
  if(realm){domeState.realm=realm.dataset.realm;domeApplyRealm();return;}
  const rank=event.target.closest('[data-ring-btn]');
  if(rank){const key=rank.dataset.ringBtn;domeState.rank=key==='all'||domeState.rank===key?null:key;domeApplyRealm();return;}
  if(event.target.closest('[data-hierarchy-reset]')){
    domeState.realm='all';domeState.rank=null;domeState.query='';
    folio.querySelector('[data-hierarchy-search]').value='';domeApplyRealm();
  }
});
document.addEventListener('input',event=>{
  if(!event.target.matches('[data-hierarchy-search]')||!$('folio').classList.contains('hierarchy-mode'))return;
  domeState.query=event.target.value;domeApplyRealm();
});
