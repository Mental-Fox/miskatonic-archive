'use strict';

const mapAges=[
  {id:'1800',short:'1,8 млрд лет',title:'1,8 млрд лет назад',note:'Первая карта отмечает поселения Старцев. Их ареал показан несколькими раздельными участками.'},
  {id:'1100',short:'1,1 млрд лет',title:'1,1 млрд лет назад',note:'К Старцам добавляются шогготы, Ктулху и его отродья. На схеме существа могут быть обозначены знаком даже там, где границы их ареала не нанесены.'},
  {id:'750',short:'750 млн лет',title:'750 млн лет назад',note:'Появляется знак летающих полипов. На карте отмечено столкновение; знак битвы можно отличить от цветных ареалов по форме звезды.'},
  {id:'470',short:'470 млн лет',title:'470 млн лет назад',note:'В легенде появляется Великая раса Йит. Некоторые области протянулись вдоль краёв карты.'},
  {id:'280',short:'280 млн лет',title:'280 млн лет назад',note:'К прежним обитателям присоединяются змеелюди. Их выделение позволяет проследить ареал на следующем этапе.'},
  {id:'170',short:'170 млн лет',title:'170 млн лет назад',note:'В легенде появляются Ми-го. Для шогготов теперь выделена собственная область.'},
  {id:'50',short:'50 млн лет',title:'50 млн лет назад',note:'Материки расходятся. Знак Великой расы Йит исчезает из легенды этой карты.'},
  {id:'0',short:'Наши дни',title:'Наши дни',note:'На заключительной карте показаны основные места присутствия. Некоторых существ авторы схемы допускают встретить и за пределами выделенных областей.'}
];
const periodHash=(age,species)=>'#habitats/earth/'+age+(species?'/'+species:'');
function ageLink(age,species){
  return periodHash(age,species && Object.hasOwn(window.periodRanges[age],species)?species:null);
}

function graticule(){
  let paths='';
  for(let n=-3;n<=3;n++){
    const offset=n*26;
    paths+='<path d="M105 1 Q'+(105+2*offset)+' 75 105 149"/>';
  }
  for(const y of [19,37,56,75,94,113,131])paths+='<path d="M0 '+y+'H210"/>';
  return paths;
}
const atlasGrid=graticule();
function battleSign(x,y){
  return '<path transform="translate('+x+' '+y+')" d="m0 -3 .75 2.2 2.3 -1.2 -1.5 2 2.45 .55 -2.45 .6 1.1 2.2 -2 -1.4 -1 2.1 -.15 -2.4 -2.3 .65 1.65 -1.8 -1.95 -1.3 2.65 .1z"/>';
}

function historicalPlate(age,species,mini=false){
  const regions=window.periodRanges[age],key=window.periodKey;
  const uid=(mini?'thumb':'plate')+age;
  const drawn=Object.keys(regions).filter(id=>regions[id].length);
  // Draw the selected range last so an overlapping range can still be inspected.
  if(species && drawn.includes(species))drawn.push(drawn.splice(drawn.indexOf(species),1)[0]);
  const ranges=drawn.map(id=>{
    const focused=species===id;
    const shapes=regions[id].map(d=>'<path d="'+d+'"/>').join('');
    const style='style="--area-color:'+key[id].color+'"';
    const cls='class="range-area '+(focused?'chosen':species?'muted':'')+'"';
    if(mini)return '<g '+cls+' '+style+'>'+shapes+'</g>';
    return '<a href="'+periodHash(age,focused?null:id)+'" tabindex="-1" aria-label="'+escapeHTML(key[id].name)+'" '+cls+' '+style+'><title>'+escapeHTML(key[id].name)+'</title>'+shapes+'</a>';
  }).join('');
  const stars=(window.periodBattles[age]||[]).map(([x,y])=>battleSign(x,y)).join('');
  return '<svg class="period-plate" viewBox="-4 -4 218 158" '+(mini?'aria-hidden="true"':'role="group" aria-label="Карта ареалов — '+mapAges.find(a=>a.id===age).title+'"')+'><defs>'+
    '<clipPath id="'+uid+'-clip"><ellipse cx="105" cy="75" rx="104" ry="74"/></clipPath>'+
    '<radialGradient id="'+uid+'-sea" cx=".42" cy=".32" r=".76"><stop stop-color="#f3e8cb"/><stop offset="1" stop-color="#d8c599"/></radialGradient></defs>'+
    '<g clip-path="url(#'+uid+'-clip)"><rect width="210" height="150" fill="url(#'+uid+'-sea)"/><path class="old-land" d="'+window.periodLand[age]+'"/><g class="chart-grid">'+atlasGrid+'</g>'+ranges+
    '<g class="battle-stars" aria-hidden="true">'+stars+'</g></g><ellipse class="map-edge" cx="105" cy="75" rx="104" ry="74"/></svg>';
}
function glyphFor(id){
  return '<svg class="period-sigil" aria-hidden="true" viewBox="0 0 32 32"><path d="'+window.periodKey[id].glyph+'"/></svg>';
}
function mapLegend(age,selected){
  const rows=window.periodRanges[age];
  return Object.keys(window.periodKey).filter(id=>Object.hasOwn(rows,id)).map(id=>{
    const item=window.periodKey[id],mapped=rows[id].length>0;
    return '<a class="range-choice" data-species="'+id+'" href="'+periodHash(age,selected===id?null:id)+'" style="--area-color:'+item.color+'" '+(selected===id?'aria-current="true"':'')+'>'+
      '<span class="sigil-wrap">'+glyphFor(id)+'</span><span class="range-name">'+escapeHTML(item.name)+'</span><i class="map-dot '+(mapped?'':'hollow')+'" aria-label="'+(mapped?'Ареал нанесён':'Ареал не очерчен')+'"></i></a>';
  }).join('');
}
function focusNote(age,selected){
  if(!selected)return '<p class="age-intro">'+escapeHTML(age.note)+'</p>';
  const item=window.periodKey[selected];
  const notebook=byId.has(selected)?'<a class="map-dossier" href="#entry/'+selected+'">Открыть дневник '+icon('book')+'</a>':'';
  return '<div class="species-focus"><b>'+escapeHTML(item.name)+'</b><p>'+escapeHTML(item.detail)+'</p>'+
    (!window.periodRanges[age.id][selected].length?'<small>На схеме есть знак присутствия. Границы ареала для этой эпохи не указаны.</small>':'')+
    notebook+'<a class="clear-range" href="'+periodHash(age.id)+'">Показать все ареалы</a></div>';
}
function openPeriodMap(id,layer,tabs){
  const index=Math.max(0,mapAges.findIndex(a=>a.id===id)),age=mapAges[index];
  const ranges=window.periodRanges[age.id],selected=layer&&Object.hasOwn(ranges,layer)?layer:null;
  const folio=$('folio'),sameMode=folio.open && folio.classList.contains('period-mode');
  const scroll=sameMode?folio.scrollTop:0;
  const legendScroll=sameMode?(folio.querySelector('.range-list')?.scrollTop||0):0;
  const focus=sameMode?document.activeElement:null;
  const focusId=focus?.dataset?.species,focusAge=focus?.dataset?.age,focusStep=focus?.dataset?.step;
  const step=(delta,label)=>{
    const target=mapAges[index+delta];
    return target?'<a data-step="'+delta+'" href="'+ageLink(target.id,selected)+'" aria-label="'+label+'">'+(delta<0?'←':'→')+'</a>':'<span aria-hidden="true">'+(delta<0?'←':'→')+'</span>';
  };
  const thumbs=mapAges.map((a,i)=>'<a data-age="'+a.id+'" class="period-thumb" href="'+ageLink(a.id,selected)+'" aria-label="Этап '+(i+1)+' — '+a.title+'" '+(a.id===age.id?'aria-current="step"':'')+'><span class="thumb-sigils">'+Object.keys(window.periodRanges[a.id]).map(id=>'<i style="--area-color:'+window.periodKey[id].color+'">'+glyphFor(id)+'</i>').join('')+'</span>'+historicalPlate(a.id,null,true)+'<span>'+a.short+'</span></a>').join('');
  const badges='<div class="map-conventions"><span><i class="solid-key"></i> Ареал</span><span><i class="outline-key"></i> Только знак</span>'+
    (window.periodBattles[age.id]?.length?'<span><b aria-hidden="true">✶</b> Битва</span>':'')+'</div>';
  openFolio('<div class="book-binding"><span>'+icon('book')+' Руководство натуралиста</span></div><header class="sheet-head period-head"><h2 id="dialog-title">Где они обитали</h2><div class="cipher" aria-hidden="true">'+cipherLine('earth through the aeons')+'</div><p class="sheet-lead">Восемь карт Земли — от 1,8 млрд лет назад до наших дней. Над каждой картой — знаки рас, живших в ту эпоху.</p></header>'+
    '<div class="period-tools"><nav aria-label="Миры архива" class="realm-tabs">'+tabs+'</nav><a class="map-dossier" href="#habitats/earth/globe">Глобус мест из рассказов ↗</a></div>'+
    '<div class="period-columns"><section class="period-main"><div class="age-title"><div><span class="folio-kicker">Этап '+(index+1)+' из 8</span><h3>'+age.title+'</h3></div><nav class="age-stepper" aria-label="Переключение эпох">'+step(-1,'Предыдущая эпоха')+step(1,'Следующая эпоха')+'</nav></div>'+
    '<div class="period-map">'+historicalPlate(age.id,selected)+'</div>'+badges+'</section>'+
    '<section class="period-key"><h3>Обитатели эпохи</h3><div class="range-list">'+mapLegend(age.id,selected)+'</div>'+focusNote(age,selected)+'</section></div>'+
    '<nav class="period-thumbs" aria-label="Восемь карт Земли">'+thumbs+'</nav>'+
    '<p class="period-credit">Даты, последовательность и примерные ареалы — по иллюстрации <i>Lovecraftian Bestiary</i>, Миклош Конья и Ноэми Вари. Карты передают хронологию этой схемы.</p>','manual-mode period-mode parchment-mode');
  if(sameMode){
    folio.scrollTop=focusAge && matchMedia('(max-width:560px)').matches?0:scroll;
    const list=folio.querySelector('.range-list');list.scrollTop=legendScroll;
    const control=focusId?folio.querySelector('[data-species="'+focusId+'"]'):focusAge?folio.querySelector('[data-age="'+focusAge+'"]'):focusStep?folio.querySelector('[data-step="'+focusStep+'"]'):null;
    control?.focus({preventScroll:true});
  }
}
