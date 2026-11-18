'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c={window:{}};vm.runInNewContext(fs.readFileSync('reader-sanity-model.js','utf8'),c);
const create=c.window.createSanityModel,key='miskatonic.reader-sanity.v2';
const records=Array.from({length:70},(_,i)=>({id:'r'+i}));
const leaves=[{id:'story',title:'Story',standalone:false},{id:'single',title:'Single',standalone:true}];
function storage(initial={},blocked=false){
  const data=new Map(Object.entries(initial));
  return {data,getItem(k){if(blocked)throw Error();return data.get(k)||null;},setItem(k,v){if(blocked)throw Error();data.set(k,v);}};
}
function boot(store=storage()){return create({records,leaves,storage:store,now:()=> '2026-11-17T00:00:00.000Z'});}
const store=storage(),first=boot(store);
assert.equal(first.snapshot().value,100);assert.equal(first.snapshot().stage,'clear');
assert.equal(first.quote('clue:r0').cost,2);assert.equal(first.quote('log:r0').cost,2);
assert.equal(first.quote('leaf:single').cost,2);assert.equal(first.quote('leaf:story').cost,4);
assert.equal(first.unlock('postscript:story').ok,false,'Cannot read a dangerous note before its own leaf');
assert.equal(first.unlock('leaf:story').charged,4);assert.equal(first.snapshot().value,96);
assert.equal(first.unlock('leaf:story').charged,0);assert.equal(first.snapshot().value,96);
assert.equal(first.unlock('postscript:story').charged,6);assert.equal(first.snapshot().value,90);
assert.equal(first.unlock('leaf:single').charged,2);assert.equal(first.snapshot().value,88);
const restored=boot(store);assert.equal(restored.snapshot().value,88);assert(restored.quote('leaf:story').opened);
assert.equal(restored.unlock('unknown').ok,false);assert.equal(restored.snapshot().value,88);
for(let i=0;i<37;i++)assert(restored.unlock('clue:r'+i).ok);
assert.equal(restored.snapshot().value,14);assert.equal(restored.snapshot().stage,'limit');
for(let i=37;i<44;i++)assert(restored.unlock('clue:r'+i).ok,'Sanity can be spent below 15');
assert.equal(restored.snapshot().value,0,'Sanity goes all the way down to zero');
assert.equal(restored.unlock('clue:r50').ok,false);assert.equal(restored.snapshot().value,0,'At zero new materials stay closed');
assert(restored.unlock('clue:r0').ok);assert.equal(restored.snapshot().value,0,'Previously read stays free at zero');
restored.rest();assert.equal(restored.snapshot().value,100);assert(restored.quote('leaf:story').opened);assert.equal(restored.quote('clue:r0').cost,0);
const stages=[[70,'clear'],[69,'anxious'],[40,'anxious'],[39,'haunted'],[15,'haunted'],[14,'limit'],[0,'limit']];
for(const [value,stage] of stages){
  const m=boot(storage({[key]:JSON.stringify({version:2,value,opened:[],createdAt:'date'})}));
  assert.equal(m.snapshot().stage,stage);
  if(value===0){assert.equal(m.unlock('clue:r0').ok,false);assert.equal(m.snapshot().value,0);}
  else{assert(m.unlock('clue:r0').ok);assert.equal(m.snapshot().value,Math.max(0,value-2));}
}
const edge=boot(storage({[key]:JSON.stringify({version:2,value:15,opened:['leaf:story']})}));
assert(edge.unlock('postscript:story').ok);assert.equal(edge.snapshot().value,9);assert(edge.unlock('leaf:single').ok);assert.equal(edge.snapshot().value,7);
const last=boot(storage({[key]:JSON.stringify({version:2,value:1,opened:['leaf:story']})}));
assert.equal(last.unlock('postscript:story').charged,1,'The last purchase takes whatever is left');assert.equal(last.snapshot().value,0);
const old=boot(storage({'miskatonic.reader-sanity.v1':'{"version":1,"value":100,"createdAt":"old"}','miskatonic.hidden-pages.v1':'["story","nonexistent"]'}));
assert(old.quote('leaf:story').opened);assert.equal(old.snapshot().value,100);assert.equal(old.unlock('leaf:story').charged,0);
for(const broken of ['bad json','null','[]','{"version":2,"value":-1,"opened":[]}','{"version":2,"value":200,"opened":[]}']){
  const m=boot(storage({[key]:broken}));assert.equal(m.snapshot().value,100);
}
const offline=boot(storage({},true));assert.equal(offline.snapshot().persistent,false);
assert(offline.unlock('leaf:single').ok);assert.equal(offline.snapshot().value,98);assert.equal(offline.unlock('leaf:single').charged,0);
// Two tabs read the latest persisted state before spending.
const other=boot(store);assert.equal(other.unlock('clue:r60').charged,2);
assert.equal(restored.unlock('clue:r60').charged,0);assert.equal(restored.snapshot().value,98);
const copy=restored.snapshot();copy.opened.length=0;assert(restored.quote('leaf:story').opened);
const index=fs.readFileSync('index.html','utf8');assert(index.indexOf('reader-sanity-model.js')<index.indexOf('src="reader-sanity.js'));
assert(!/setInterval|requestAnimationFrame/.test(fs.readFileSync('reader-sanity.js','utf8')));
console.log('PASS: canonical prices, explicit spending, free re-read, nonnegative balance, all thresholds, rest without losing discoveries, v1 migration, bad/offline storage and sequential cross-tab reads.');
