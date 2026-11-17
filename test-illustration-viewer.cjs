'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
function node(){
  const events={},classes=new Set();
  return {events,style:{},dataset:{},isConnected:true,clientWidth:960,clientHeight:560,
    naturalWidth:1600,naturalHeight:900,complete:true,
    classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),toggle:(x,on)=>on?classes.add(x):classes.delete(x),contains:x=>classes.has(x)},
    addEventListener:(name,fn)=>events[name]=fn,setAttribute(){},removeAttribute(){},
    scrollTo(x,y){this.scrollLeft=x;this.scrollTop=y;},focus(){this.focused=true;},setPointerCapture(){}
  };
}
const fields=new Map(),dialog=node(),stage=node();
for(const selector of ['.inspection-viewport','input','output','#inspection-title'])fields.set(selector,node());
fields.set('.inspection-stage',stage);
stage.replaceChildren=(img)=>{stage.image=img;};stage.querySelector=()=>stage.image;
Object.defineProperty(stage,'innerHTML',{set(){stage.image=node();}});
dialog.querySelector=s=>fields.get(s);
dialog.showModal=()=>dialog.open=true;dialog.close=()=>{dialog.open=false;dialog.events.close();};
const windowEvents={},trigger=node();
const c={ENTRIES:[{id:'monster',name:'Существо'},{id:'place',name:'Затонувший город'}],
  document:{activeElement:trigger,body:{append(){}},createElement:tag=>tag==='dialog'?dialog:node(),addEventListener(){}},
  plateImage:()=>'<img>',plateFallback(img){img.fallback=true;},
  addEventListener:(name,fn)=>windowEvents[name]=fn};
c.window=c;vm.createContext(c);vm.runInContext(fs.readFileSync('illustration-viewer.js','utf8'),c);
const api=c.illustrationViewer;
api.open('monster',{currentSrc:'blob:custom',dataset:{next:'art/fallback.webp'}},trigger);
assert(dialog.open);assert.equal(stage.image.src,'blob:custom');assert.equal(stage.image.dataset.next,'art/fallback.webp');
assert.equal(fields.get('#inspection-title').textContent,'Существо');assert.equal(stage.image.style.width,'920px');
const range=fields.get('input');range.value='300';range.events.input();
assert.equal(stage.image.style.width,'2760px');assert.equal(fields.get('output').textContent,'300%');
const click=name=>dialog.events.click({target:{closest:()=>({hasAttribute:attr=>attr===name})}});
click('data-inspection-plus');assert.equal(fields.get('output').textContent,'325%');
range.value='900';range.events.input();assert.equal(fields.get('output').textContent,'400%');
const viewport=fields.get('.inspection-viewport');viewport.scrollLeft=10;viewport.scrollTop=20;
viewport.events.pointerdown({pointerType:'mouse',button:0,clientX:100,clientY:100,pointerId:1,preventDefault(){}});
viewport.events.pointermove({clientX:80,clientY:70});assert.equal(viewport.scrollLeft,30);assert.equal(viewport.scrollTop,50);
viewport.events.pointerup();click('data-inspection-reset');assert.equal(fields.get('output').textContent,'100%');assert.equal(viewport.scrollLeft,0);
click('data-inspection-close');assert(!dialog.open);assert(trigger.focused);assert.equal(stage.image,undefined);
api.open('place');assert.equal(fields.get('#inspection-title').textContent,'Затонувший город');assert.equal(stage.image.alt,'Иллюстрация — Затонувший город');
windowEvents.hashchange();assert(!dialog.open);
api.open('bad');assert(!dialog.open);
console.log('PASS: resolved/custom image, record and place inspection, fit, zoom limits, panning, reset, close/focus and route cleanup.');
