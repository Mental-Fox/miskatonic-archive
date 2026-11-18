'use strict';
// Поглощение: на нуле рассудка стираются следы чтения, настройки и память книги остаются.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const data=new Map([
  ['miskatonic.reader-sanity.v2','{"version":2,"value":0,"opened":["leaf:salt"]}'],['miskatonic.reader-sanity.v1','{}'],
  ['miskatonic.hidden-pages.v1','["salt"]'],['miskatonic.homo-lector.v1','{}'],['miskatonic.anomalies.v1','{}'],
  ['miskatonic.fieldnote.v1.cthulhu','заметка'],['miskatonic.fieldnote.v1.yog','ещё одна'],
  ['miskatonic.fps.v1','off'],['miskatonic-intro-animation','off'],['bestiary.still','1'],['miskatonic.consumed.v1','{"count":2,"last":"2026-01-01"}']
]);
const storage={getItem:k=>data.has(k)?data.get(k):null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k),get length(){return data.size;},key:i=>[...data.keys()][i]};
const c={JSON,Object,Number,Math,String,Array,Date,localStorage:storage,matchMedia:()=>({matches:false}),addEventListener(){},document:{readyState:'loading',addEventListener(){}}};
c.window=c;vm.createContext(c);
const src=fs.readFileSync('consumption.js','utf8');vm.runInContext(src,c);
const api=c.bookConsumption;
assert.equal(api.record().count,2,'The book remembers how many readers it consumed');
const removed=api.erase(storage);
for(const k of ['miskatonic.reader-sanity.v2','miskatonic.reader-sanity.v1','miskatonic.hidden-pages.v1','miskatonic.homo-lector.v1','miskatonic.anomalies.v1','miskatonic.fieldnote.v1.cthulhu','miskatonic.fieldnote.v1.yog'])
  assert(!data.has(k)&&removed.includes(k),'Erased: '+k);
for(const k of ['miskatonic.fps.v1','miskatonic-intro-animation','bestiary.still','miskatonic.consumed.v1'])assert(data.has(k),'Kept: '+k);
assert(/sanitychange/.test(src)&&/location\.hash='#cover'/.test(src)&&/location\.reload\(\)/.test(src),'Triggered by sanity reaching zero, closes the book');
assert(/bookConsumed=true/.test(src)&&/window\.bookConsumed/.test(fs.readFileSync('homo-lector.js','utf8')),'The reader card is not re-saved after consumption');
const rs=fs.readFileSync('reader-sanity.js','utf8');
assert(/sanitychange/.test(rs),'Every sanity change is announced');
const index=fs.readFileSync('index.html','utf8');
assert(index.indexOf('consumption.js')>0&&index.indexOf('consumption.js')<index.indexOf('reader.js'));
assert(fs.readFileSync('anomalies.css','utf8').includes('.consumed{'));
assert(/closing-cover/.test(src)&&/rotationY/.test(src),'The cover closes over the pages before the book reopens');
console.log('consumption ok');
