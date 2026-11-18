'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const data=new Map([
  ['miskatonic.reader-sanity.v2','{"version":2,"value":0,"createdAt":"original","opened":["leaf:salt","postscript:salt"]}'],
  ['miskatonic.hidden-pages.v1','["salt"]'],['miskatonic.homo-lector.v1','{"first":"original","visits":{"cthulhu":4}}'],
  ['miskatonic.fieldnote.v1.cthulhu','Моя заметка'],['miskatonic.incident-revelations.v1','{"cthulhu":2}'],
  ['miskatonic.fps.v1','off'],['miskatonic.consumed.v1','{"count":2,"last":"2026-01-01"}']
]);
const storage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,String(v))};
let finish,reloads=0,html='';
const c={JSON,Object,Number,Math,String,Array,Date,localStorage:storage,location:{hash:'',reload(){reloads++;}},
  matchMedia:()=>({matches:true}),addEventListener(){},
  document:{readyState:'loading',addEventListener(){},body:{append(){}},createElement(){return {
    setAttribute(){},set innerHTML(s){html=s;},querySelector(){return {addEventListener(type,fn){finish=fn;},focus(){}};},classList:{add(){}}
  };}}};
c.window=c;vm.createContext(c);vm.runInContext(fs.readFileSync('consumption.js','utf8'),c);
assert.equal(c.bookConsumption.record().count,2);
const before=new Map(data);c.bookConsumption.consume();assert(finish,'Reduced motion presents the closing control');
assert(html.includes('Находки и заметки сохранятся'));
finish();finish();
assert.equal(reloads,1,'Closing control is idempotent');
assert.equal(c.location.hash,'#cover');assert.equal(c.bookConsumption.record().count,3);
const recovered=JSON.parse(data.get('miskatonic.reader-sanity.v2'));
assert.equal(recovered.value,100);assert.equal(recovered.createdAt,'original');
assert.deepEqual(recovered.opened,['leaf:salt','postscript:salt']);
for(const [k,v] of before)if(!['miskatonic.reader-sanity.v2','miskatonic.consumed.v1'].includes(k))assert.equal(data.get(k),v,'Preserved exactly: '+k);
assert.equal(c.bookConsumption.recover({getItem(){throw Error();}}),false,'Unavailable storage does not crash closing');
assert.equal(c.bookConsumption.recover({getItem(){return '{';}}),false,'Corrupt state is not overwritten');
console.log('PASS: closing the book restores sanity and preserves paid materials, discoveries, notes, revealed text and reader history; repeat close and unavailable storage handled.');
