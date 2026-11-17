'use strict';
/* Шкала размеров и «Родословное древо» мифов (заменяет прежний атлас-звезду). */

function sizeFigure(r,m,top,current){
  const f=window.fieldNotes[r.id];
  return '<a class="lineup-fig'+(current?' current':'')+'" href="#entry/'+r.id+'" style="--h:'+(m/top*100).toFixed(2)+'%" title="'+escapeHTML(r.name+' — '+f.size.label)+'">'+
    '<span class="lineup-art">'+plateImage(r,'sketch')+'</span><span class="lineup-name">'+escapeHTML(r.name)+'<small>'+String(m).replace('.',',')+' м</small></span></a>';
}
function lineupPanel(title,items,top,step,current){
  const ticks=[];for(let v=step;v<=top+1e-6;v+=step)ticks.push('<i style="--y:'+(v/top*100).toFixed(2)+'%"><b>'+String(v).replace('.',',')+' м</b></i>');
  const human='<span class="lineup-fig human" style="--h:'+(1.8/top*100).toFixed(2)+'%"><span class="lineup-art">'+humanFigure+'</span><span class="lineup-name">Человек<small>1,8 м</small></span></span>';
  return '<section class="lineup"><h3>'+title+'</h3><div class="lineup-stage"><div class="lineup-ruler">'+ticks.join('')+'</div><div class="lineup-row">'+human+
    items.map(([r,m])=>sizeFigure(r,m,top,r.id===current)).join('')+'</div></div></section>';
}
function openSizes(current){
  const notes=window.fieldNotes;
  const beings=records.filter(r=>['gods','creatures'].includes(r.group)&&notes[r.id]?.size);
  const measured=beings.filter(r=>notes[r.id].size.m!=null).map(r=>[r,notes[r.id].size.m]).sort((a,b)=>a[1]-b[1]);
  const small=measured.filter(x=>x[1]<=3),large=measured.filter(x=>x[1]>3);
  const off=beings.filter(r=>notes[r.id].size.m==null);
  openFolio('<div class="book-binding"><span>'+icon('book')+' Руководство натуралиста</span></div>'+
    '<div class="parchment-sheet sizes-sheet"><header class="sheet-head"><h2 id="dialog-title">Диаграмма сравнения размеров</h2><div class="cipher" aria-hidden="true">'+cipherLine('scale of the mythos')+'</div>'+
    '<p class="sheet-lead">Все измеримые обитатели архива рядом с человеком ростом 1,8 м. Нажмите на фигуру, чтобы открыть запись.</p></header>'+
    lineupPanel('Не выше трёх метров',small,3,0.5,current)+lineupPanel('Великаны',large,Math.ceil(Math.max(4,...large.map(x=>x[1]))/5)*5,5,current)+
    '<section class="lineup off"><h3>Вне всякого масштаба</h3><div class="offscale-list">'+off.map(r=>'<a href="#entry/'+r.id+'"'+(r.id===current?' class="current"':'')+'><span>'+plateImage(r,'sketch')+'</span><b>'+escapeHTML(r.name)+'</b><small>'+escapeHTML(notes[r.id].size.label)+'</small></a>').join('')+'</div></section>'+
    '<p class="ink sheet-foot">Рост указан примерно, по описаниям в рассказах и «Руководстве натуралиста».</p></div>','notebook-mode sheet-mode');
  if(current)$('folio').querySelector('.current')?.scrollIntoView({block:'center'});
}

/* ---------- Родословное древо ---------- */
const treeTiers=[
  ['I','Внешние и Старшие боги',r=>['outer','elder'].includes(window.speciesProfiles[r.id]?.rank)],
  ['II','Великие Древние',r=>window.speciesProfiles[r.id]?.rank==='old'],
  ['III','Расы-служители и независимые',r=>['servitor','independent'].includes(window.speciesProfiles[r.id]?.rank)],
  ['IV','Одиночки и чудовища',r=>window.speciesProfiles[r.id]?.rank==='other'],
  ['V','Места',r=>r.group==='places'],
  ['VI','Знаки и реликвии',r=>r.group==='signs'],
  ['VII','Библиотека',r=>r.group==='books']
];
function treeLinks(id){
  const set=new Set(byId.get(id).related.filter(x=>byId.has(x)));
  records.forEach(r=>{if(r.related.includes(id))set.add(r.id);});
  set.delete(id);return set;
}
const treeState={trail:[],allThreads:false};
function treePath(from,to){
  if(from===to)return [from];
  const prev={[from]:null},q=[from];
  while(q.length){const cur=q.shift();for(const n of treeLinks(cur)){if(n in prev)continue;prev[n]=cur;if(n===to){const path=[to];let c=cur;while(c){path.unshift(c);c=prev[c];}return path;}q.push(n);}}
  return null;
}
function treeCurve(a,b,lift){
  const [sx,sy]=a,[x,y]=b,dy=y-sy,c1=sy+(Math.abs(dy)<10?-lift:dy*.5),c2=y-(Math.abs(dy)<10?lift:dy*.5);
  return 'M'+sx.toFixed(1)+' '+sy.toFixed(1)+' C'+sx.toFixed(1)+' '+c1.toFixed(1)+' '+x.toFixed(1)+' '+c2.toFixed(1)+' '+x.toFixed(1)+' '+y.toFixed(1);
}
function openAtlas(record,target){
  const id=record.id,links=treeLinks(id);
  const path=target&&byId.has(target)&&target!==id?treePath(id,target):null;
  if(treeState.trail.at(-1)!==id){treeState.trail=treeState.trail.filter(x=>x!==id);treeState.trail.push(id);treeState.trail=treeState.trail.slice(-6);}
  const used=new Set(),onPath=new Map((path||[]).map((x,i)=>[x,i+1]));
  const rows=treeTiers.map(([num,label,test])=>{
    const items=records.filter(r=>!used.has(r.id)&&test(r));items.forEach(r=>used.add(r.id));
    if(!items.length)return '';
    return '<div class="tree-tier"><div class="tier-label"><b>'+num+'</b>'+label+'<small>'+items.length+'</small></div><div class="tier-nodes">'+items.map(r=>{
      const cls=[r.id===id?'self':'',links.has(r.id)?'kin':'',onPath.has(r.id)?'on-path':''].join(' ');
      return '<a class="tree-node '+cls+'" data-node="'+r.id+'" href="#atlas/'+r.id+'"><span class="node-pic">'+illustration(r)+(onPath.has(r.id)?'<i class="step">'+onPath.get(r.id)+'</i>':'')+'</span><span class="node-name">'+escapeHTML(r.name)+'</span></a>';
    }).join('')+'</div></div>';
  }).join('');
  const kin=[...links].map(x=>byId.get(x));
  const names=records.map(r=>'<option value="'+escapeHTML(r.name)+'"></option>').join('');
  const pathHtml=target?(path?'<div class="path-box"><h4>Путь · '+(path.length-1)+' '+(path.length-1===1?'шаг':path.length-1<5?'шага':'шагов')+'</h4><ol>'+path.map(x=>'<li><a href="#atlas/'+x+'">'+escapeHTML(byId.get(x).name)+'</a></li>').join('')+'</ol><a class="clear-path" href="#atlas/'+id+'">Убрать путь</a></div>'
    :'<div class="path-box"><h4>Пути нет</h4><p>Эти записи не связаны даже через посредников.</p></div>'):'';
  const panel='<aside class="tree-card"><div class="tree-portrait">'+plateImage(record,'plate-main')+'</div><div class="taxon">'+escapeHTML(record.kind)+'</div><h3>'+escapeHTML(record.name)+'</h3><div class="book-latin">'+escapeHTML(record.latin)+'</div>'+
    '<p>'+escapeHTML(record.summary)+'</p><a class="secondary read-entry" href="#entry/'+id+'">'+icon('book')+' Открыть дневник</a>'+pathHtml+
    '<h4>Кровные связи · '+kin.length+'</h4><ul class="kin-list">'+kin.map(r=>'<li><a href="#atlas/'+r.id+'" data-kin="'+r.id+'">'+escapeHTML(r.name)+'</a><small>'+escapeHTML(r.kind)+'</small></li>').join('')+'</ul></aside>';
  const trail=treeState.trail.map(x=>x===id?'<span aria-current="page">'+escapeHTML(byId.get(x).name)+'</span>':'<a href="#atlas/'+x+'">'+escapeHTML(byId.get(x).name)+'</a>').join('<i>›</i>');
  const tools='<div class="tree-tools"><label class="tree-field">'+icon('search')+'<input list="tree-names" data-tree-find placeholder="Найти запись…" aria-label="Найти запись"></label>'+
    '<label class="tree-field path-field"><span>Путь до</span><input list="tree-names" data-tree-path placeholder="например, Некрономикон" aria-label="Проложить путь до записи" value="'+(target&&byId.has(target)?escapeHTML(byId.get(target).name):'')+'"></label>'+
    '<button type="button" class="tree-btn" data-tree-random>🎲 Случайная</button>'+
    '<label class="tree-toggle"><input type="checkbox" data-tree-all'+(treeState.allThreads?' checked':'')+'> Все нити</label><datalist id="tree-names">'+names+'</datalist></div>'+
    '<nav class="tree-trail" aria-label="Недавние записи">'+trail+'</nav>';
  const folio=$('folio'),same=folio.open&&folio.classList.contains('tree-mode'),scroll=same?folio.querySelector('.tree-scroll')?.scrollTop:0;
  openFolio('<div class="book-binding"><span>'+icon('book')+' Руководство натуралиста</span></div>'+
    '<div class="parchment-sheet tree-sheet"><header class="sheet-head"><h2 id="dialog-title">Родословное древо мифов</h2><div class="cipher" aria-hidden="true">'+cipherLine('genealogy of the old ones')+'</div>'+
    '<p class="sheet-lead">Поколения сверху вниз: от богов к расам, местам, реликвиям и книгам. Наведите на запись — проступят её нити; нажмите — она станет центром древа. Проложите путь между двумя записями, чтобы увидеть, через кого они связаны.</p></header>'+tools+
    '<div class="tree-layout"><div class="tree-scroll"><div class="tree-canvas'+(path?' has-path':'')+'"><svg class="tree-ink" aria-hidden="true"><g class="ink-all"></g><g class="ink-main"></g><g class="ink-path"></g><g class="ink-hover"></g></svg>'+rows+'<div class="tree-tip" hidden></div></div></div>'+panel+'</div></div>','notebook-mode sheet-mode tree-mode');
  if(same)folio.querySelector('.tree-scroll').scrollTop=scroll;
  requestAnimationFrame(()=>drawTree(id,links,path));
}
function treeGeom(){
  const canvas=$('folio').querySelector('.tree-canvas');if(!canvas)return null;
  const box=canvas.getBoundingClientRect();
  const at=k=>{const el=canvas.querySelector('[data-node="'+CSS.escape(k)+'"] .node-pic');if(!el)return null;const b=el.getBoundingClientRect();return [b.left-box.left+b.width/2,b.top-box.top+b.height/2];};
  return {canvas,box,at};
}
function drawTree(id,links,path){
  const g=treeGeom();if(!g)return;
  const svg=g.canvas.querySelector('.tree-ink');svg.setAttribute('width',g.box.width);svg.setAttribute('height',g.canvas.scrollHeight);
  const me=g.at(id);if(!me)return;
  svg.querySelector('.ink-main').innerHTML=[...links].map(k=>{const p=g.at(k);return p?'<path d="'+treeCurve(me,p,60)+'" pathLength="1"/>':'';}).join('');
  if(path){let d='';for(let i=1;i<path.length;i++){const a=g.at(path[i-1]),b=g.at(path[i]);if(a&&b)d+='<path d="'+treeCurve(a,b,70)+'" pathLength="1" style="animation-delay:'+(i*.35)+'s"/>';}svg.querySelector('.ink-path').innerHTML=d;}
  drawAllThreads();
}
function drawAllThreads(){
  const g=treeGeom();if(!g)return;const out=g.canvas.querySelector('.ink-all');
  if(!treeState.allThreads){out.innerHTML='';return;}
  const seen=new Set();let d='';
  records.forEach(r=>r.related.forEach(k=>{const key=[r.id,k].sort().join('|');if(seen.has(key)||!byId.has(k))return;seen.add(key);const a=g.at(r.id),b=g.at(k);if(a&&b)d+='<path d="'+treeCurve(a,b,40)+'"/>';}));
  out.innerHTML=d;
}
function treeHover(k){
  const g=treeGeom();if(!g)return;const layer=g.canvas.querySelector('.ink-hover'),tip=g.canvas.querySelector('.tree-tip');
  g.canvas.querySelectorAll('.tree-node.peek').forEach(n=>n.classList.remove('peek'));
  if(!k){layer.innerHTML='';tip.hidden=true;g.canvas.classList.remove('peeking');return;}
  const me=g.at(k),ls=treeLinks(k);g.canvas.classList.add('peeking');
  g.canvas.querySelector('[data-node="'+CSS.escape(k)+'"]')?.classList.add('peek');
  ls.forEach(x=>g.canvas.querySelector('[data-node="'+CSS.escape(x)+'"]')?.classList.add('peek'));
  layer.innerHTML=[...ls].map(x=>{const p=g.at(x);return p?'<path d="'+treeCurve(me,p,50)+'"/>':'';}).join('');
  const r=byId.get(k);tip.innerHTML='<b>'+escapeHTML(r.name)+'</b><small>'+escapeHTML(r.kind)+' · связей: '+ls.size+'</small><p>'+escapeHTML(r.summary)+'</p>';
  tip.hidden=false;const w=g.canvas.clientWidth;tip.style.left=Math.min(w-250,Math.max(0,me[0]-120))+'px';tip.style.top=(me[1]+44)+'px';
}
function treeIdByName(v){v=normalize(v);const r=records.find(x=>normalize(x.name)===v)||records.find(x=>normalize(x.name).startsWith(v)&&v.length>1);return r?.id;}
document.addEventListener('pointerover',e=>{
  const f=$('folio');if(!f.classList.contains('tree-mode'))return;
  const n=e.target.closest('.tree-node,[data-kin]');treeHover(n?(n.dataset.node||n.dataset.kin):null);
});
document.addEventListener('change',e=>{
  const f=$('folio');if(!f.classList.contains('tree-mode'))return;
  const cur=location.hash.split('/')[1];
  if(e.target.matches('[data-tree-find]')){const id=treeIdByName(e.target.value);if(id)location.hash='#atlas/'+id;}
  if(e.target.matches('[data-tree-path]')){const id=treeIdByName(e.target.value);if(id)location.hash='#atlas/'+cur+'/'+id;else if(!e.target.value)location.hash='#atlas/'+cur;}
  if(e.target.matches('[data-tree-all]')){treeState.allThreads=e.target.checked;drawAllThreads();}
});
document.addEventListener('click',e=>{
  const f=$('folio');if(!f.classList.contains('tree-mode'))return;
  if(e.target.closest('[data-tree-random]')){const pool=records.filter(r=>r.id!==location.hash.split('/')[1]);location.hash='#atlas/'+pool[Math.floor(Math.random()*pool.length)].id;}
});
window.addEventListener('resize',()=>{
  const f=$('folio');if(f.open&&f.classList.contains('tree-mode')){const [,id,t]=location.hash.slice(1).split('/');if(byId.has(id))drawTree(id,treeLinks(id),t&&byId.has(t)?treePath(id,t):null);}
});
