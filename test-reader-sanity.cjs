'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('reader-sanity.js','utf8'),key='miskatonic.reader-sanity.v1';
function boot(saved=null,blocked=false){
  const data=new Map(saved===null?[]:[[key,saved]]);let writes=0;
  const nodes=Object.fromEntries(['reader-sanity','reader-sanity-number','reader-sanity-meter','book','header'].map(id=>[id,{attrs:{},setAttribute(k,v){this.attrs[k]=v;},append(child){this.lastChild=child;}}]));
  const compact={matches:false,addEventListener(name,fn){this.change=fn;}};
  const c={Date,Object,Number,JSON,matchMedia:()=>compact,document:{getElementById:id=>nodes[id],querySelector:()=>nodes.header},localStorage:{
    getItem:k=>{if(blocked)throw Error('Unavailable');return data.get(k)||null;},
    setItem:(k,v)=>{if(blocked)throw Error('Unavailable');writes++;data.set(k,v);}
  }};
  c.window=c;vm.createContext(c);vm.runInContext(source,c);
  return {api:c.readerSanity,nodes,data,writes,compact};
}
const first=boot();assert.equal(first.api.current(),100);assert.equal(first.writes,1);
assert.equal(first.nodes['reader-sanity-number'].textContent,'100 / 100');
assert.equal(first.nodes['reader-sanity-meter'].value,100);
assert.equal(first.nodes['reader-sanity'].attrs['aria-label'],'Рассудок читателя: 100 из 100');
assert.equal(first.nodes.book.lastChild,first.nodes['reader-sanity']);
first.compact.matches=true;first.compact.change();
assert.equal(first.nodes.header.lastChild,first.nodes['reader-sanity'],'Compact indicator moves beside search');
first.compact.matches=false;first.compact.change();
assert.equal(first.nodes.book.lastChild,first.nodes['reader-sanity'],'Desktop bookmark returns outside page host');
const restored=boot(first.data.get(key));assert.equal(restored.api.current(),100);assert.equal(restored.writes,0);
assert.equal(restored.data.get(key),first.data.get(key),'Keep original initialization timestamp');
for(const saved of ['bad json','null','[]','{"version":1,"value":0}','{"version":2,"value":100,"createdAt":"bad"}']){
  const r=boot(saved);assert.equal(r.api.current(),100);assert.equal(JSON.parse(r.data.get(key)).value,100);
}
const unavailable=boot(null,true);assert.equal(unavailable.api.current(),100);
assert(Object.isFrozen(first.api));assert.equal(Object.keys(first.api).length,1,'Read-only API without deduction/reset methods');
for(let i=0;i<200;i++)assert.equal(first.api.current(),100);
assert(!/setInterval|setTimeout|requestAnimationFrame/.test(source));
const index=fs.readFileSync('index.html','utf8');
assert(index.includes('src="reader-sanity.js?v=bookmark-2"'));
assert(index.includes('id="reader-sanity"'));assert(index.includes('id="reader-sanity-meter"'));
console.log('PASS: initialize 100/100, restore without rewriting, recover malformed data, work without storage, accessible display, read-only stable value and no background loops.');
