'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
{
  const reader=fs.readFileSync('reader.js','utf8');
  const start=reader.indexOf('const reduceMotion =');
  const end=reader.indexOf('/* ---------- Разделы книги',start);
  const layers=[],timers=new Map();let timerId=0;
  const host={innerHTML:'old',scrollTop:80};
  const reduced={matches:false};
  const ctx={host,pendingDir:1,window:{},location:{hash:'#entry/cthulhu'},matchMedia:()=>reduced,
    $:()=>({append(layer){layers.push(layer);}}),
    document:{createElement(){return {setAttribute(){},addEventListener(type,fn){this.end=fn;},remove(){this.removed=true;}};}},
    setTimeout(fn){timers.set(++timerId,fn);return timerId;},clearTimeout(id){timers.delete(id);}
  };
  vm.createContext(ctx);vm.runInContext(reader.slice(start,end),ctx);
  ctx.openFolio('first');assert.equal(host.innerHTML,'first');assert.equal(host.scrollTop,0);
  assert(layers[0].className.includes('paper-turn-forward'));assert.equal(layers.length,1);
  ctx.pendingDir=-1;ctx.openFolio('second');assert(layers[0].removed);assert.equal(timers.size,1);
  assert(layers[1].className.includes('paper-turn-back'));
  layers[1].end({target:layers[1],animationName:'paper-fold-sweep'});assert(!layers[1].removed);
  layers[1].end({target:layers[1],animationName:'paper-turn-finish'});assert(layers[1].removed);assert.equal(timers.size,0);
  reduced.matches=true;ctx.pendingDir=1;ctx.openFolio('third');assert.equal(layers.length,2);
  reduced.matches=false;ctx.pendingDir=1;ctx.openFolio('fourth');[...timers.values()][0]();assert(layers[2].removed);
  ctx.pendingDir=0;ctx.openFolio('same-page');assert.equal(layers.length,3);
  assert(!/cloneNode|captureScroll|rotateY/.test(reader.slice(start,end)));
  console.log('PASS: decorative paper fold, both directions, rapid navigation cleanup, animation completion, timeout and reduced motion; no spread copies.');
}
let observer,scans=0;
const images=[];
const document={
  body:{},querySelectorAll(){scans++;return images;},
  documentElement:{style:{setProperty(){}}}
};
const context={document,console,Event,location:{hash:''},
  MutationObserver:class{constructor(callback){observer=callback;}observe(){}},
  indexedDB:{open(){throw Error('Test without storage');}}
};
context.window=context;context.dispatchEvent=()=>{};
context.BOOK_IMAGES={'asset:mark.svg':{src:'data:replacement'}};
const source=fs.readFileSync('image-library.js','utf8').split('  let dialog,selected=')[0]+'})();';
vm.runInNewContext(source,context);
function image(){
  let src='mark.svg';
  return {nodeType:1,dataset:{},isConnected:true,matches:s=>s==='img',closest:()=>false,
    getAttribute:()=>src,setAttribute:(key,value)=>{src=value;},get src(){return src;}};
}
(async()=>{
  await context.bookImages.ready;
  scans=0;
  observer([{type:'childList',addedNodes:[{nodeType:3},{nodeType:1,matches:()=>false,querySelector:()=>null}]}]);
  assert.equal(scans,0,'SVG/text mutations must not scan the document');
  const img=image();
  observer([{type:'childList',addedNodes:[img]}]);
  assert.equal(img.src,'data:replacement','A newly added image still gets its override');
  const late=image();
  observer([{type:'attributes',target:late}]);
  assert.equal(late.src,'data:replacement','Changed image sources still get overrides');
  assert.equal(scans,0,'Individual updates must not scan the document');
  const {mount,kinds}=require('./tentacles.js');
  let writes=0;
  function node(attrs={}){return {setAttribute(k,v){writes++;attrs[k]=v;},getAttribute:k=>attrs[k],append(){},replaceChildren(){}};}
  global.document={createElementNS:()=>node()};
  const rigs=kinds.map(kind=>node({'data-tentacle':kind}));
  const draw=mount({querySelectorAll:()=>rigs});
  writes=0;draw(0,0);const first=writes;
  writes=0;draw(1,1);const next=writes;
  assert.equal(first-next,kinds.length*15*4,'Constant sucker radii are written only once');
  delete global.document;
  console.log(`PASS: targeted image updates; SVG/text changes cause no document scans; ${first-next} fewer SVG writes per animated update for ${kinds.length} arms.`);
})().catch(error=>{console.error(error);process.exitCode=1;});
