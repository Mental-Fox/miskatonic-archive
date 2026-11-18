'use strict';
// Карточка Homo lector и аномалии существ: учёт переходов, уровни карточки, подключение.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const data=new Map(),listeners={};let rendered='';
const store={getItem:k=>data.has(k)?data.get(k):null,setItem:(k,v)=>data.set(k,String(v)),get length(){return data.size;},key:i=>[...data.keys()][i]};
const c={JSON,Object,Number,Math,Date,Set,Map,String,Array,RegExp,localStorage:store,location:{hash:'#cover'},
  addEventListener:(n,f)=>(listeners[n]=listeners[n]||[]).push(f),
  document:{addEventListener:(n,f)=>(listeners['doc:'+n]=listeners['doc:'+n]||[]).push(f)},
  matchMedia:()=>({matches:false}),openFolio:h=>rendered=h};
c.window=c;vm.createContext(c);
vm.runInContext(fs.readFileSync('entries.js','utf8'),c);
for(const f of ['fieldwork.js','profiles.js','epochs.js','field-notes.js','books.js','bestiary-ext.js','voices.js','universe.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);
vm.runInContext(fs.readFileSync('homo-lector.js','utf8'),c);
vm.runInContext(fs.readFileSync('anomalies.js','utf8'),c);
const go=h=>{c.location.hash=h;for(const f of listeners.hashchange||[])f();};

go('#entry/cthulhu');go('#entry/cthulhu/notes');go('#entry/shoggoth');go('#entry/cthulhu');go('#entry/nonexistent');
assert.equal(c.homoLector.visits('cthulhu'),2,'Spreads of one entry are one visit');
assert.equal(c.homoLector.visits('shoggoth'),1);
assert.equal(c.homoLector.visits('nonexistent'),0,'Unknown ids are not tracked');
const saved=JSON.parse(data.get('miskatonic.homo-lector.v1'));
assert.equal(saved.visits.cthulhu,2);assert(typeof saved.first==='string');

// Другая вкладка добавила визиты — они не теряются.
const other=JSON.parse(data.get('miskatonic.homo-lector.v1'));other.visits.yog=5;data.set('miskatonic.homo-lector.v1',JSON.stringify(other));
go('#entry/dagon');assert.equal(c.homoLector.visits('yog'),5,'Merges visits from another tab');

// Повреждённые данные не ломают карточку.
data.set('miskatonic.homo-lector.v1','{broken');
c.readerSanity={current:()=>90};c.homoLector.open();
assert(rendered.includes('Homo lector'));assert(rendered.includes('Ничего никуда не передаётся'));
assert(rendered.includes('class="ink-redacted"'),'High sanity hides most fields');
assert(!rendered.includes('third-hand'));
c.readerSanity={current:()=>20};c.homoLector.open();
assert(!rendered.includes('class="ink-redacted"'),'Low sanity reveals every field');
assert(rendered.includes('Описание не завершено'));
data.set('miskatonic.reader-sanity.v2',JSON.stringify({version:2,value:20,opened:Array.from({length:10},(_,i)=>'leaf:x'+i)}));
c.homoLector.open();assert(rendered.includes('Описание завершено'),'Ten leaves at low sanity complete the card');
assert(!/[<>]script/i.test(rendered));

// Аномалии: только для шести существ и только на страницах записей.
const beingIds=JSON.stringify(c.ENTRIES.filter(r=>r.group==='gods'||r.group==='creatures').map(r=>r.id).sort());
assert.equal(JSON.parse(beingIds).length,77,'All creatures and gods are loaded');
assert.equal(JSON.stringify([...c.bookAnomalies.ids].sort()),beingIds,'Every creature and god has a page anomaly');
let touched=false;c.bookAnomalies.decorate({querySelector:()=>{touched=true;return null;}},'#catalog');
assert(!touched,'Non-entry pages are untouched');
c.bookAnomalies.decorate({querySelector:()=>null},'#entry/cthulhu');

// Подключение и отсутствие таймеров.
const index=fs.readFileSync('index.html','utf8');
assert(index.indexOf('homo-lector.js')<index.indexOf('reader.js')&&index.indexOf('anomalies.js')<index.indexOf('reader.js'));
assert(index.includes('anomalies.css'));
for(const f of ['homo-lector.js','anomalies.js'])assert(!/setInterval|setTimeout|requestAnimationFrame/.test(fs.readFileSync(f,'utf8')),f+' has no timers');
const reader=fs.readFileSync('reader.js','utf8');
assert(reader.includes("hash==='#lector'"));assert(reader.includes('bookAnomalies?.decorate'));
console.log('anomalies ok');

// Живая гравюра: без WebGL/OGL ничего не ломает, своих таймеров нет, подключена до reader.js.
vm.runInContext(fs.readFileSync('living-engraving.js','utf8'),c);
assert.equal(JSON.stringify(Object.keys(c.livingEngraving.kinds).sort()),beingIds,'Every creature and god has a living engraving');
assert(!/ab=|aberr|uAberr/.test(fs.readFileSync('living-engraving.js','utf8')),'No colour-splitting flicker in the shader');
let probed=false;c.livingEngraving.decorate({querySelector:()=>{probed=true;return null;}},'#entry/cthulhu');
assert(!probed,'Without OGL and GSAP the engraving stays a plain image');
const living=fs.readFileSync('living-engraving.js','utf8');
assert(!/setInterval|setTimeout|requestAnimationFrame/.test(living),'Living engraving has no own loops');
assert(/loseContext/.test(living),'WebGL context is released when leaving the page');
assert(index.indexOf('vendor/ogl/ogl.min.js')<index.indexOf('living-engraving.js')&&index.indexOf('living-engraving.js')<index.indexOf('reader.js'));
assert(reader.includes('livingEngraving?.decorate'));
assert(fs.existsSync('vendor/ogl/ogl.min.js')&&fs.existsSync('vendor/gsap/gsap.min.js')&&fs.existsSync('vendor/gsap/ScrambleTextPlugin.min.js'));
assert(!/groove|anomaly-stairs|SplitText|DrawSVG/.test(fs.readFileSync('anomalies.js','utf8')),'No drawn lines in page anomalies');
console.log('living engraving ok');
