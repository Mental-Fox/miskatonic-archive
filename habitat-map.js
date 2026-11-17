'use strict';
/* Интерактивная карта «Где они обитали»: масштаб и перетаскивание, подсказки, слои,
   шкала времени с проигрыванием, места из рассказов на карте «Наши дни».
   Переопределяет openPeriodMap из periods.js. */
const hm={view:null,hidden:new Set(),playing:null,pins:true,mode:'globe',lon:0,lat:15,globeZoom:1};
const HM_FULL={x:-4,y:-4,w:218,h:158};

function mollweide(lat,lon){
  if(Math.abs(lat)>=89.999999)return [105,lat>0?1:149];
  const phi=lat*Math.PI/180;let t=phi;
  for(let i=0;i<12;i++){const f=(2*t+Math.sin(2*t)-Math.PI*Math.sin(phi))/(2+2*Math.cos(2*t));t-=f;if(Math.abs(f)<1e-6)break;}
  return [105+104*(lon/180)*Math.cos(t),75-74*Math.sin(t)];
}
function hmSpeciesRecord(id){return byId.get(id)||null;}
function hmStage(age,selected){
  const regions=window.periodRanges[age],key=window.periodKey;
  const drawn=Object.keys(regions).filter(id=>regions[id].length&&!hm.hidden.has(id));
  if(selected&&drawn.includes(selected))drawn.push(drawn.splice(drawn.indexOf(selected),1)[0]);
  const ranges=drawn.map(id=>'<g class="range-area hm-range '+(selected===id?'chosen':selected?'muted':'')+'" data-range="'+id+'" style="--area-color:'+key[id].color+'">'+
    regions[id].map(d=>'<path d="'+d+'"/>').join('')+'</g>').join('');
  const stars=(window.periodBattles[age]||[]).map(([x,y])=>'<g class="hm-battle" data-battle="1">'+battleSign(x,y)+'</g>').join('');
  const pins=age==='0'&&hm.pins?earthRegions.map(r=>{const [x,y]=mollweide(r.lat,r.lon);return '<g class="hm-pin" data-pin="'+r.id+'" transform="translate('+x.toFixed(1)+' '+y.toFixed(1)+')"><circle r="3.2"/><circle r="1.2" class="core"/></g>';}).join(''):'';
  return '<defs><clipPath id="hm-clip"><ellipse cx="105" cy="75" rx="104" ry="74"/></clipPath>'+
    '<radialGradient id="hm-sea" cx=".42" cy=".32" r=".76"><stop stop-color="#f3e8cb"/><stop offset="1" stop-color="#d8c599"/></radialGradient>'+
    '<pattern id="hm-hatch" width="2.2" height="2.2" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><path d="M0 0v2.2" stroke="#5d432a" stroke-width=".35" opacity=".35"/></pattern></defs>'+
    '<g clip-path="url(#hm-clip)"><rect x="-10" y="-10" width="230" height="170" fill="url(#hm-sea)"/>'+
    '<path class="old-land" d="'+window.periodLand[age]+'"/><path d="'+window.periodLand[age]+'" fill="url(#hm-hatch)" pointer-events="none"/>'+
    '<g class="chart-grid">'+atlasGrid+'</g>'+ranges+'<g class="battle-stars">'+stars+'</g>'+pins+'</g>'+
    '<ellipse class="map-edge" cx="105" cy="75" rx="104" ry="74"/><ellipse class="map-edge outer" cx="105" cy="75" rx="107" ry="77"/>';
}
function hmLegend(age,selected){
  const rows=window.periodRanges[age];
  return Object.keys(window.periodKey).filter(id=>Object.hasOwn(rows,id)).map(id=>{
    const item=window.periodKey[id],mapped=rows[id].length>0,off=hm.hidden.has(id);
    return '<div class="hm-row'+(selected===id?' on':'')+(off?' off':'')+'" data-species="'+id+'" style="--area-color:'+item.color+'">'+
      '<a class="hm-pick" href="'+periodHash(age,selected===id?null:id)+'"><span class="sigil-wrap">'+glyphFor(id)+'</span><span class="range-name">'+escapeHTML(item.name)+'</span></a>'+
      (mapped?'<button type="button" class="hm-eye" data-eye="'+id+'" aria-pressed="'+(!off)+'" title="'+(off?'Показать слой':'Скрыть слой')+'">'+(off?'○':'●')+'</button>':'<span class="hm-sign" title="Только знак — границы не очерчены">✧</span>')+'</div>';
  }).join('');
}
function hmFocus(age,selected){
  if(!selected)return '<p class="age-intro">'+escapeHTML(age.note)+'</p><p class="hm-hint">Потяните глобус мышью или пальцем, чтобы повернуть Землю. Колёсико и кнопки «+/−» меняют масштаб. Нажмите на ареал или выберите обитателя в списке.</p>';
  const item=window.periodKey[selected],r=hmSpeciesRecord(selected);
  const ages=mapAges.filter(a=>window.periodRanges[a.id][selected]?.length).map(a=>'<a href="'+periodHash(a.id,selected)+'" class="'+(a.id===age.id?'now':'')+'">'+a.short+'</a>').join('');
  return '<div class="species-focus hm-focus">'+(r?'<div class="hm-portrait">'+plateImage(r,'plate-main')+'</div>':'')+'<b>'+escapeHTML(item.name)+'</b><p>'+escapeHTML(item.detail)+'</p>'+
    (!window.periodRanges[age.id][selected].length?'<small>В эту эпоху есть только знак присутствия.</small>':'')+
    (ages?'<div class="hm-ages"><span>Встречается на картах:</span>'+ages+'</div>':'')+
    (r?'<a class="map-dossier" href="#entry/'+r.id+'">Открыть дневник '+icon('book')+'</a>':'')+'<a class="clear-range" href="'+periodHash(age.id)+'">Показать все ареалы</a></div>';
}
function hmTimeline(index,selected){
  return '<div class="hm-timeline"><button type="button" class="hm-play" data-play aria-label="Проиграть эпохи">'+(hm.playing?'❚❚':'▶')+'</button>'+
    '<div class="hm-track"><input type="range" min="0" max="7" step="1" value="'+index+'" data-age-slider aria-label="Эпоха">'+
    '<div class="hm-ticks">'+mapAges.map((a,i)=>'<a href="'+ageLink(a.id,selected)+'" class="'+(i===index?'now':'')+'" style="--i:'+i+'"><i></i><span>'+a.short+'</span></a>').join('')+'</div></div></div>';
}
function hmApplyView(){
  const svg=$('folio').querySelector('.hm-map');if(!svg)return;
  if(hm.mode==='globe'){hm.drawGlobe?.();$('folio').querySelector('.hm-zoom-level').textContent='×'+hm.globeZoom.toFixed(1).replace('.',',');return;}
  const v=hm.view;svg.setAttribute('viewBox',v.x+' '+v.y+' '+v.w+' '+v.h);
  const z=HM_FULL.w/v.w;$('folio').querySelector('.hm-zoom-level').textContent='×'+z.toFixed(1).replace('.',',');
  svg.style.setProperty('--z',z);
}
function hmZoom(f,cx,cy){
  if(hm.mode==='globe'){hm.globeZoom=Math.max(1,Math.min(3,hm.globeZoom*f));hmApplyView();return;}
  const v=hm.view,nw=Math.min(HM_FULL.w,Math.max(HM_FULL.w/6,v.w/f)),k=nw/v.w;
  cx??=v.x+v.w/2;cy??=v.y+v.h/2;
  hm.view={x:cx-(cx-v.x)*k,y:cy-(cy-v.y)*k,w:nw,h:v.h*k};hmClamp();hmApplyView();
}
function hmClamp(){
  const v=hm.view;v.x=Math.min(HM_FULL.x+HM_FULL.w-v.w,Math.max(HM_FULL.x,v.x));v.y=Math.min(HM_FULL.y+HM_FULL.h-v.h,Math.max(HM_FULL.y,v.y));
}
function hmPoint(svg,e){const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(svg.getScreenCTM().inverse());}

function openPeriodMap(id,layer,tabs){
  const index=Math.max(0,mapAges.findIndex(a=>a.id===id)),age=mapAges[index];
  const ranges=window.periodRanges[age.id],selected=layer&&Object.hasOwn(ranges,layer)?layer:null;
  const folio=$('folio');
  if(folio.open&&folio.classList.contains('hm-mode')){
    folio.querySelector('.hm-map').innerHTML=hmStage(age.id,selected);
    folio.querySelector('.hm-age').innerHTML='<span class="folio-kicker">Этап '+(index+1)+' из 8</span><h3>'+age.title+'</h3>';
    folio.querySelector('.hm-legend').innerHTML=hmLegend(age.id,selected);
    folio.querySelector('.hm-focus-wrap').innerHTML=hmFocus(age,selected);
    folio.querySelector('.hm-time').innerHTML=hmTimeline(index,selected);
    folio.querySelectorAll('.period-thumb').forEach(t=>{t.toggleAttribute('aria-current',t.dataset.age===age.id);t.href=ageLink(t.dataset.age,selected);});
    folio.querySelector('.hm-pins-toggle').hidden=age.id!=='0';
    hmRefreshGlobe(age.id,selected);hmApplyView();return;
  }
  hm.view={...HM_FULL};
  const thumbs=mapAges.map((a,i)=>'<a data-age="'+a.id+'" class="period-thumb" href="'+ageLink(a.id,selected)+'" '+(a.id===age.id?'aria-current="step"':'')+'><span class="thumb-sigils">'+
    Object.keys(window.periodRanges[a.id]).map(k=>'<i style="--area-color:'+window.periodKey[k].color+'">'+glyphFor(k)+'</i>').join('')+'</span>'+historicalPlate(a.id,null,true)+'<span>'+a.short+'</span></a>').join('');
  openFolio('<div class="book-binding"><span>'+icon('book')+' Руководство натуралиста</span></div><header class="sheet-head period-head"><h2 id="dialog-title">Где они обитали</h2><div class="cipher" aria-hidden="true">'+cipherLine('earth through the aeons')+'</div>'+
    '<p class="sheet-lead">Вращайте Землю и исследуйте ареалы за 1,8 млрд лет. Выбирайте эпоху, приближайте глобус и открывайте записи об обитателях.</p></header>'+
    '<div class="period-tools"><nav aria-label="Миры архива" class="realm-tabs">'+tabs+'</nav><a class="map-dossier" href="#habitats/earth/globe">Глобус мест из рассказов ↗</a></div>'+
    '<div class="period-columns hm-columns"><section class="period-main hm-main"><div class="age-title"><div class="hm-age"><span class="folio-kicker">Этап '+(index+1)+' из 8</span><h3>'+age.title+'</h3></div>'+
    '<div class="hm-controls"><button type="button" data-zoom-in aria-label="Приблизить">+</button><button type="button" data-zoom-out aria-label="Отдалить">−</button><button type="button" data-zoom-reset aria-label="Вся карта">⤢</button><span class="hm-zoom-level">×1</span></div></div>'+
    '<div class="hm-view-switch" role="group" aria-label="Вид карты"><button type="button" data-map-mode="globe">Глобус</button><button type="button" data-map-mode="flat">Плоская карта</button></div>'+
    '<div class="hm-stage"><canvas class="hm-globe" width="480" height="480" tabindex="0" role="img" aria-label="Вращаемый глобус ареалов. Стрелки — поворот, плюс и минус — масштаб, Home — исходный вид."></canvas><svg class="period-plate hm-map" viewBox="-4 -4 218 158" role="img" aria-label="Карта ареалов">'+hmStage(age.id,selected)+'</svg><div class="hm-tip" hidden></div></div>'+
    '<div class="map-conventions"><span><i class="solid-key"></i> Ареал</span><span><i class="outline-key"></i> Только знак</span><span><b>✶</b> Битва</span>'+
    '<label class="hm-pins-toggle" '+(age.id!=='0'?'hidden':'')+'><input type="checkbox" data-pins '+(hm.pins?'checked':'')+'> Места из рассказов</label></div>'+
    '<div class="hm-time">'+hmTimeline(index,selected)+'</div></section>'+
    '<section class="period-key"><h3>Обитатели эпохи</h3><div class="range-list hm-legend">'+hmLegend(age.id,selected)+'</div><div class="hm-focus-wrap">'+hmFocus(age,selected)+'</div></section></div>'+
    '<nav class="period-thumbs" aria-label="Восемь карт Земли">'+thumbs+'</nav>'+
    '<p class="period-credit">Даты, последовательность и примерные ареалы — по иллюстрации <i>Lovecraftian Bestiary</i>, Миклош Конья и Ноэми Вари.</p>','manual-mode period-mode parchment-mode hm-mode');
  hmBind();hmMountGlobe();hmSetMode(hm.mode);hmRefreshGlobe(age.id,selected);hmApplyView();
}
function hmCurrent(){const [, , age, sp]=location.hash.slice(1).split('/');return {age:age||'1800',sp:sp||null};}
function hmGo(age,sp){history.replaceState(history.state,'',periodHash(age,sp));route();}
function hmStop(){clearInterval(hm.playing);hm.playing=null;const b=$('folio').querySelector('[data-play]');if(b)b.textContent='▶';}
function hmBind(){
  const folio=$('folio'),stage=folio.querySelector('.hm-stage'),svg=folio.querySelector('.hm-map'),tip=folio.querySelector('.hm-tip');
  let drag=null,moved=false;
  stage.addEventListener('wheel',e=>{e.preventDefault();if(hm.mode==='globe'){hmZoom(e.deltaY<0?1.15:1/1.15);return;}const p=hmPoint(svg,e);hmZoom(e.deltaY<0?1.25:0.8,p.x,p.y);},{passive:false});
  stage.addEventListener('pointerdown',e=>{if(e.button!==0||hm.mode==='globe')return;drag={x:e.clientX,y:e.clientY,v:{...hm.view}};moved=false;});
  hm.dragMove=e=>{
    if(drag){const r=svg.getBoundingClientRect(),k=hm.view.w/r.width,dx=e.clientX-drag.x,dy=e.clientY-drag.y;
      if(Math.abs(dx)+Math.abs(dy)>3){moved=true;stage.classList.add('dragging');}
      hm.view={...drag.v,x:drag.v.x-dx*k,y:drag.v.y-dy*k};hmClamp();hmApplyView();}
  };
  hm.dragEnd=()=>{drag=null;stage.classList.remove('dragging');};
  stage.addEventListener('pointermove',e=>{
    const g=e.target.closest('[data-range],[data-pin],[data-battle]');
    folio.querySelectorAll('.hm-row.hover').forEach(x=>x.classList.remove('hover'));
    if(!g||drag){tip.hidden=true;return;}
    let html='';
    if(g.dataset.range){const k=window.periodKey[g.dataset.range];html='<b style="--area-color:'+k.color+'">'+glyphFor(g.dataset.range)+escapeHTML(k.name)+'</b><small>Нажмите, чтобы выбрать</small>';
      folio.querySelector('.hm-row[data-species="'+g.dataset.range+'"]')?.classList.add('hover');}
    else if(g.dataset.pin){const r=earthRegions.find(x=>x.id===g.dataset.pin);html='<b>📍 '+escapeHTML(r.label)+'</b><small>'+r.ids.map(i=>byId.get(i)?.name).filter(Boolean).join(', ')+'</small>';}
    else html='<b>✶ Битва</b><small>Столкновение рас, отмеченное на схеме</small>';
    const b=stage.getBoundingClientRect();tip.innerHTML=html;tip.hidden=false;
    tip.style.left=Math.min(b.width-180,e.clientX-b.left+14)+'px';tip.style.top=(e.clientY-b.top+14)+'px';
  });
  stage.addEventListener('pointerleave',()=>{tip.hidden=true;});
  stage.addEventListener('click',e=>{
    if(moved)return;const g=e.target.closest('[data-range],[data-pin]');const c=hmCurrent();
    if(g?.dataset.range){hmStop();hmGo(c.age,c.sp===g.dataset.range?null:g.dataset.range);}
    else if(g?.dataset.pin){hmStop();location.hash='#habitats/earth/'+g.dataset.pin;}
  });
  stage.addEventListener('dblclick',e=>{if(hm.mode==='globe'){hmZoom(1.4);return;}const p=hmPoint(svg,e);hmZoom(1.8,p.x,p.y);});
  if(hm.bound)return;hm.bound=true;
  window.addEventListener('pointermove',e=>hm.dragMove?.(e));
  window.addEventListener('pointerup',()=>hm.dragEnd?.());
  folio.addEventListener('click',e=>{
    const t=e.target.closest('button,a');if(!t||!folio.classList.contains('hm-mode'))return;
    if(t.dataset.mapMode)hmSetMode(t.dataset.mapMode);
    else if(t.hasAttribute('data-zoom-in'))hmZoom(1.4);
    else if(t.hasAttribute('data-zoom-out'))hmZoom(1/1.4);
    else if(t.hasAttribute('data-zoom-reset')){hm.view={...HM_FULL};hm.lon=0;hm.lat=15;hm.globeZoom=1;hmApplyView();}
    else if(t.dataset.eye){const id=t.dataset.eye;hm.hidden.has(id)?hm.hidden.delete(id):hm.hidden.add(id);const c=hmCurrent();hmGo(c.age,c.sp);}
    else if(t.hasAttribute('data-play')){
      if(hm.playing){hmStop();return;}
      t.textContent='❚❚';
      const step=()=>{const c=hmCurrent(),i=mapAges.findIndex(a=>a.id===c.age);if(i>=7){hmStop();return;}hmGo(mapAges[i+1].id,c.sp);
        const b=$('folio').querySelector('[data-play]');if(b)b.textContent='❚❚';};
      if(mapAges.findIndex(a=>a.id===hmCurrent().age)>=7)hmGo(mapAges[0].id,hmCurrent().sp);
      hm.playing=setInterval(step,1800);
    }
  });
  folio.addEventListener('input',e=>{
    if(e.target.matches('[data-age-slider]')){hmStop();hmGo(mapAges[+e.target.value].id,hmCurrent().sp);$('folio').querySelector('[data-age-slider]')?.focus();}
    if(e.target.matches('[data-pins]')){hm.pins=e.target.checked;const c=hmCurrent();hmGo(c.age,c.sp);}
  });
  folio.addEventListener('pointerover',e=>{
    if(!folio.classList.contains('hm-mode'))return;const svg=folio.querySelector('.hm-map');
    const row=e.target.closest('.hm-row');svg.querySelectorAll('.hm-range.hl').forEach(x=>x.classList.remove('hl'));
    if(row)svg.querySelector('[data-range="'+row.dataset.species+'"]')?.classList.add('hl');
  });
  folio.addEventListener('close',hmStop);
}
window.addEventListener('hashchange',()=>{if(!location.hash.startsWith('#habitats/earth'))hmStop();});

// The historical plates use an elliptical, equal-area world projection.
// Sample that same plate on a sphere so every epoch keeps its original ranges.
function hmSetMode(mode){
  hm.mode=mode;
  const folio=$('folio');
  folio.querySelector('.hm-globe').hidden=mode!=='globe';
  folio.querySelector('.hm-map').hidden=mode==='globe';
  folio.querySelectorAll('[data-map-mode]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.mapMode===mode));
  folio.querySelector('.hm-tip').hidden=true;
  hmApplyView();
}
let hmTextureVersion=0;
function hmRefreshGlobe(age,selected){
  const version=++hmTextureVersion,canvas=$('folio').querySelector('.hm-globe');
  if(!canvas)return;
  const svg='<svg xmlns="http://www.w3.org/2000/svg" width="1680" height="1200" viewBox="0 0 210 150"><style>'+
    '.map-edge,.hm-hit,[class*=edge]{fill:none}.old-land{fill:#b49b66;stroke:#6e5938;stroke-width:.4}.chart-grid{fill:none;stroke:#846b45;stroke-width:.25;opacity:.4}'+
    '.range-area{fill:var(--area-color);fill-opacity:.55;stroke:var(--area-color);stroke-width:.5}.range-area.muted{opacity:.22}.range-area.chosen{fill-opacity:.85;stroke:#39281c;stroke-width:.8}'+
    '.battle-stars{fill:#78351f}.hm-pin circle{fill:#9c2f1f;stroke:#fff6df;stroke-width:.6}.hm-pin .core{fill:#fff6df;stroke:none}</style>'+hmStage(age,selected).replace(/fill="url\(#hm-hatch\)"/g,'fill="none"')+'</svg>';
  const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'})),image=new Image();
  image.onload=()=>{
    URL.revokeObjectURL(url);
    if(version!==hmTextureVersion||!canvas.isConnected)return;
    const buffer=document.createElement('canvas');buffer.width=image.width;buffer.height=image.height;
    const ctx=buffer.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);
    hm.globeTexture=ctx.getImageData(0,0,buffer.width,buffer.height);hm.drawGlobe?.();
  };
  image.onerror=()=>{URL.revokeObjectURL(url);if(version===hmTextureVersion)hmSetMode('flat');};
  image.src=url;
}
function hmMountGlobe(){
  const canvas=$('folio').querySelector('.hm-globe'),ctx=canvas.getContext('2d'),N=canvas.width;
  let frame=0,drag=null;
  function geographic(x,y){
    const z2=1-x*x-y*y;if(z2<0)return null;
    const z=Math.sqrt(z2),a=hm.lat*Math.PI/180,s=Math.sin(a),c=Math.cos(a);
    return {lat:Math.asin(Math.max(-1,Math.min(1,y*c+z*s)))*180/Math.PI,
      lon:((hm.lon+Math.atan2(x,z*c-y*s)*180/Math.PI+540)%360)-180,z};
  }
  function draw(){
    frame=0;if(!canvas.isConnected||hm.mode!=='globe')return;
    const texture=hm.globeTexture,im=ctx.createImageData(N,N),radius=N*.46*hm.globeZoom;
    for(let j=0;j<N;j++)for(let i=0;i<N;i++){
      const x=(i+.5-N/2)/radius,y=(N/2-j-.5)/radius,p=geographic(x,y);if(!p)continue;
      const dst=4*(j*N+i),light=.68+.30*p.z+.09*y-.06*x;
      if(texture){
        const [u,v]=mollweide(p.lat,p.lon),tx=Math.max(0,Math.min(texture.width-1,Math.floor(u/210*texture.width))),ty=Math.max(0,Math.min(texture.height-1,Math.floor(v/150*texture.height)));
        const src=4*(ty*texture.width+tx);
        for(let k=0;k<3;k++)im.data[dst+k]=(texture.data[src+3]?texture.data[src+k]:[225,210,170][k])*light;
      }else{[225,210,170].forEach((c,k)=>im.data[dst+k]=c*light);}
      im.data[dst+3]=255;
    }
    ctx.putImageData(im,0,0);
  }
  hm.drawGlobe=()=>{if(!frame)frame=requestAnimationFrame(draw);};
  canvas.addEventListener('pointerdown',e=>{
    if(e.button!==0)return;canvas.focus({preventScroll:true});
    drag={id:e.pointerId,x:e.clientX,y:e.clientY,lon:hm.lon,lat:hm.lat,moved:false};canvas.setPointerCapture(e.pointerId);canvas.classList.add('dragging');
  });
  canvas.addEventListener('pointermove',e=>{
    if(!drag||e.pointerId!==drag.id)return;
    const dx=e.clientX-drag.x,dy=e.clientY-drag.y,k=180/canvas.getBoundingClientRect().width/hm.globeZoom;
    if(Math.hypot(dx,dy)>4)drag.moved=true;
    hm.lon=((drag.lon-dx*k+540)%360+360)%360-180;hm.lat=Math.max(-89,Math.min(89,drag.lat+dy*k));hm.drawGlobe();
  });
  canvas.addEventListener('pointerup',e=>{
    if(!drag||e.pointerId!==drag.id)return;
    const clicked=!drag.moved;drag=null;canvas.classList.remove('dragging');canvas.releasePointerCapture(e.pointerId);
    if(!clicked)return;
    const box=canvas.getBoundingClientRect(),radius=box.width*.46*hm.globeZoom;
    const p=geographic((e.clientX-box.left-box.width/2)/radius,(box.top+box.height/2-e.clientY)/radius);if(!p)return;
    const [x,y]=mollweide(p.lat,p.lon),current=hmCurrent();
    if(current.age==='0'&&hm.pins){
      const pin=earthRegions.find(r=>{const [a,b]=mollweide(r.lat,r.lon);return Math.hypot(a-x,b-y)<4;});
      if(pin){hmStop();location.hash='#habitats/earth/'+pin.id;return;}
    }
    const ids=Object.keys(window.periodRanges[current.age]).filter(id=>!hm.hidden.has(id));
    if(current.sp&&ids.includes(current.sp))ids.push(ids.splice(ids.indexOf(current.sp),1)[0]);
    const id=ids.reverse().find(id=>window.periodRanges[current.age][id].some(d=>ctx.isPointInPath(new Path2D(d),x,y)));
    if(id){hmStop();hmGo(current.age,current.sp===id?null:id);}
  });
  canvas.addEventListener('lostpointercapture',()=>{drag=null;canvas.classList.remove('dragging');});
  canvas.addEventListener('keydown',e=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','Home'].includes(e.key))return;e.preventDefault();
    if(e.key==='ArrowLeft')hm.lon-=12;if(e.key==='ArrowRight')hm.lon+=12;
    if(e.key==='ArrowUp')hm.lat=Math.min(89,hm.lat+12);if(e.key==='ArrowDown')hm.lat=Math.max(-89,hm.lat-12);
    if(e.key==='+'||e.key==='=')hmZoom(1.2);if(e.key==='-')hmZoom(1/1.2);
    if(e.key==='Home'){hm.lon=0;hm.lat=15;hm.globeZoom=1;}hmApplyView();
  });
}
