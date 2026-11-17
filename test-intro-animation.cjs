const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');
function element(){
  const props=new Map(),classes=new Set(),attrs=new Map(),handlers={};
  return {hidden:false,inert:false,handlers,attrs,style:{setProperty:(k,v)=>props.set(k,v),removeProperty:k=>props.delete(k),getPropertyValue:k=>props.get(k)||''},
    classList:{add:(...xs)=>xs.forEach(x=>classes.add(x)),remove:(...xs)=>xs.forEach(x=>classes.delete(x)),contains:x=>classes.has(x),toggle:(x,on)=>on?classes.add(x):classes.delete(x)},
    addEventListener:(n,f)=>handlers[n]=f,removeEventListener:(n)=>delete handlers[n],setAttribute:(k,v)=>attrs.set(k,v),getAttribute:k=>attrs.get(k),querySelectorAll:()=>[],focus(){},append(){}};
}
function boot(hash='',custom=false,stored=''){
  const intro=element(),book=element(),front=element(),skin=element(),noise=element(),main=element(),motion=element(),skip=element(),folio=element(),back=element();
  const drawCounts={outer:0,touch:0,roots:0};
  const surfaces={'.cb-vector-tendrils':{kind:'outer'},'.cb-vector-touch':{kind:'touch'},'.cb-vector-touch-roots':{kind:'roots'}};
  book.querySelector=s=>({'.cb-front':front,'#book-skin-motion feTurbulence':noise,'#book-skin-motion feDisplacementMap':skin,'.cb-back':back,...surfaces}[s]||null);
  folio.querySelector=()=>null;
  const nodes={intro,'closed-book':book,'intro-animation-toggle':motion,dust:element(),folio,pages:{getBoundingClientRect:()=>({left:10,top:10,width:1000,height:700})}};
  const document={body:element(),hidden:false,getElementById:id=>nodes[id],querySelector:s=>s==='main.desk'?main:null,addEventListener(){},removeEventListener(){},createElement:element};
  const reduced={matches:true,addEventListener(n,f){this[n]=f;},removeEventListener(){}};
  const frames=new Map(),timers=new Map();let frameId=0,timerId=0,time=0;
  const c={document,location:{hash},innerWidth:1400,innerHeight:950,matchMedia:()=>reduced,addEventListener(){},removeEventListener(){},requestAnimationFrame:f=>{frames.set(++frameId,f);return frameId},cancelAnimationFrame:id=>frames.delete(id),setTimeout:f=>{timers.set(++timerId,f);return timerId},clearTimeout:id=>timers.delete(id),Math};
  c.window=c;c.bookImages={get:()=>custom?'data:custom':'',resolve:p=>p};
  const storage=new Map([['miskatonic-intro-animation',stored]]);
  c.localStorage={getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)};
  c.bookTentacles={mount:surface=>()=>drawCounts[surface.kind]++};
  vm.runInNewContext(fs.readFileSync('intro.js','utf8'),c);
  const advance=count=>{for(let i=0;i<count;i++){time+=16;const batch=[...frames.values()];frames.clear();batch.forEach(f=>f(time));}};
  return {intro,book,skin,noise,main,motion,skip,reduced,frames,timers,advance,drawCounts,storage};
}
const r=boot();assert.equal(r.main.inert,true);assert.equal(r.intro.hidden,false);assert.equal(r.book.classList.contains('has-custom-art'),false);
r.reduced.matches=false;r.reduced.change();
r.book.handlers.mouseenter();r.intro.handlers.pointermove({clientX:710,clientY:450,pointerType:'mouse'});r.advance(180);
assert(r.book.classList.contains('peek'));assert(!r.noise.attrs.has('baseFrequency'));assert.equal(r.skin.getAttribute('scale'),'0');assert(+r.book.style.getPropertyValue('--book-wake')>.99);
assert.notEqual(r.book.style.getPropertyValue('--feeler-upper'),'0.000deg');
assert.notEqual(r.book.style.getPropertyValue('--medal-x'),'0.000px');
r.book.handlers.mouseleave();r.advance(180);assert(!r.book.classList.contains('peek'));
r.book.handlers.focus();r.advance(100);assert(r.book.classList.contains('peek'));r.book.handlers.blur();
r.reduced.matches=true;r.reduced.change();assert.equal(r.skin.getAttribute('scale'),'0');assert.equal(r.frames.size,0);
r.book.handlers.click();assert.equal(r.intro.hidden,true);assert.equal(r.main.inert,false);
const opened=boot();opened.reduced.matches=false;opened.reduced.change();opened.book.handlers.click();assert.equal(opened.timers.size,2);[...opened.timers.values()].forEach(f=>f());assert.equal(opened.main.inert,false);
assert(boot('',true).book.classList.contains('has-custom-art'));
const deep=boot('#entry/cthulhu');assert.equal(deep.main.inert,false);assert.equal(deep.book.handlers.click,undefined);
const idle=boot();idle.reduced.matches=false;idle.reduced.change();const idleStart={...idle.drawCounts};idle.advance(180);
assert.deepEqual(idle.drawCounts,idleStart,'Hidden idle tentacles are not rebuilt');
idle.book.handlers.mouseenter();const before=idle.drawCounts.outer;idle.advance(180);
assert(idle.drawCounts.outer-before<=70,'Active tentacle geometry is capped at 24 updates/second');
idle.book.handlers.click();const stopped={...idle.drawCounts};idle.advance(180);
assert.deepEqual(idle.drawCounts,stopped,'Opening stops intro geometry updates');
const toggle=boot();toggle.reduced.matches=false;toggle.reduced.change();toggle.motion.handlers.click();
assert.equal(toggle.frames.size,0);assert(toggle.intro.classList.contains('motion-paused'));
assert.equal(toggle.motion.textContent,'Включить анимацию');assert.equal(toggle.motion.getAttribute('aria-pressed'),'true');
assert.equal(toggle.storage.get('miskatonic-intro-animation'),'off');assert.equal(toggle.book.style.getPropertyValue('--book-wake'),'1.0000');
const pausedCounts={...toggle.drawCounts};toggle.advance(180);assert.deepEqual(toggle.drawCounts,pausedCounts);
toggle.motion.handlers.click();assert(toggle.frames.size>0);assert(!toggle.intro.classList.contains('motion-paused'));
assert.equal(toggle.storage.get('miskatonic-intro-animation'),'on');
const persisted=boot('',false,'off');persisted.reduced.matches=false;persisted.reduced.change();assert.equal(persisted.frames.size,0);assert(persisted.intro.classList.contains('motion-paused'));
persisted.book.handlers.click();assert(persisted.intro.hidden);assert.equal(persisted.timers.size,0,'Static mode opens immediately');
assert.equal((html.match(/class="cb-feeler cb-feeler-/g)||[]).length,25);assert(!html.includes('class="cb-live-tendrils"'));
assert(html.includes('cb-frame'));assert(html.includes('cb-relief'));assert(html.includes('cb-vector-tendrils'));assert(html.includes('sigil-metal'));assert(!html.includes('class="cb-part-base"'));assert(!html.includes('class="cb-page-block"'));
assert(!html.includes('id="intro-motion"'));assert(!html.includes('id="intro-skip"'));
assert(html.includes('cb-emblem-piece'));assert(html.includes('cb-latch-upper'));assert(html.includes('cb-latch-lower'));assert(!html.includes('cb-eye-aperture'));
console.log('PASS: hidden idle tentacles drawn once, animated on hover/focus within budget, no per-frame noise filter changes, intro stops on opening; reduced motion, custom image and deep links.');
console.log('PASS: animation toggle stops updates, preserves an awake static scene, persists and restores preference, resumes motion and allows immediate opening.');
