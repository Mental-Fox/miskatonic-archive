'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const data=new Map(),handlers={},windowHandlers={},nodes={};
for(const id of ['reader-sanity','reader-sanity-number','reader-sanity-meter','book','header'])nodes[id]={dataset:{},setAttribute(){},append(){}};
let rendered='',gateResult='';
const c={Date,Map,Set,JSON,Object,Number,Event:class{constructor(type){this.type=type;}},location:{hash:'#secret/salt'},
  localStorage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)},
  document:{getElementById:id=>nodes[id],querySelector:()=>nodes.header,querySelectorAll:()=>[],addEventListener:(name,fn)=>handlers[name]=fn,body:{classList:{contains:()=>false}}},
  matchMedia:()=>({matches:false,addEventListener(){}}),addEventListener:(name,fn)=>windowHandlers[name]=fn,
  dispatchEvent:event=>windowHandlers[event.type]?.(event),openFolio:html=>rendered=html,
  plateImage:(r,cls)=>'<img class="'+cls+'" data-record="'+r.id+'">',escapeHTML:v=>String(v),icon:()=>'<svg></svg>',motionOf:()=>'breathe'};
c.window=c;vm.createContext(c);
for(const f of ['entries.js','fieldwork.js','profiles.js','epochs.js','field-notes.js','books.js','bestiary-ext.js','owner-notes.js','owner-leaves.js','catalog-leaves.js','monster-engravings.js','secret-ornaments.js','secret-pages.js','reader-sanity-model.js','reader-sanity.js','notebook.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});
windowHandlers.sanityunlock=()=>c.location.hash==='#reading-room'?c.readerSanity.openRoom():c.archiveSecrets.open(c.location.hash.split('/')[1]);
function click(key,rest=false){
  const gate={set outerHTML(v){gateResult=v;}};
  const button={dataset:{sanityUnlock:key},hasAttribute:attr=>rest&&attr==='data-sanity-rest',closest:()=>gate};
  handlers.click({target:{closest:()=>button},preventDefault(){}});
}
const sanity=c.readerSanity,secrets=c.archiveSecrets;
assert.equal(sanity.current(),100);
secrets.open('salt');
assert(rendered.includes('sanity-lock-preview'));assert(rendered.includes('aria-hidden="true" inert'));
assert(rendered.includes('Открыть · −4 рассудка'));assert.equal(sanity.current(),100);
assert.equal(data.get('miskatonic.hidden-pages.v1'),undefined,'Viewing the sealed leaf is not discovery or purchase');
click('leaf:salt');assert.equal(sanity.current(),96);assert(rendered.includes('class="secret-transcript"'));
assert.deepEqual(JSON.parse(data.get('miskatonic.hidden-pages.v1')),['salt']);
secrets.open('salt');assert.equal(sanity.current(),96);
assert(rendered.includes('data-sanity-unlock="postscript:salt"'));
assert(rendered.includes('Открыть · −6 рассудка'));
click('postscript:salt');assert.equal(sanity.current(),90);assert(gateResult.includes('На полях · два почерка'));
secrets.open('salt');assert(!rendered.includes('data-sanity-unlock="postscript:salt"'));
const r=c.ENTRIES.find(r=>r.id==='cthulhu');c.records=c.ENTRIES;
const clue=c.guideRecto(r,c.speciesProfiles[r.id],c.fieldNotes[r.id],'test');
assert(clue.includes('data-sanity-unlock="clue:cthulhu"'));assert(clue.includes('Открыть · −2 рассудка'));
assert(clue.includes('class="secret-creature-link"'));assert.equal(sanity.current(),90);
click('clue:cthulhu');assert.equal(sanity.current(),88);assert(gateResult.includes('Ключевые приметы'));assert(!gateResult.includes('sanity-lock'));
assert(!c.guideRecto(r,c.speciesProfiles[r.id],c.fieldNotes[r.id],'test').includes('data-sanity-unlock="clue:cthulhu"'));
const log=c.sanityFieldLog(r,'Проверочная запись');assert(log.includes('data-sanity-unlock="log:cthulhu"'));assert.equal(sanity.current(),88);
click('log:cthulhu');assert.equal(sanity.current(),86);assert(gateResult.includes('Проверочная запись'));
secrets.open('ice-card');assert(rendered.includes('Запечатанная вклейка'));assert(!rendered.includes('Здесь пока нет вклейки'));assert(!rendered.includes('owner-ledger'),'No catalog dump on sealed leaf');
c.location.hash='#reading-room';sanity.openRoom();assert(rendered.includes('Вернуться к свету'));
click('',true);assert.equal(sanity.current(),100);assert(rendered.includes('100 <small>/ 100'));
assert(sanity.has('leaf:salt'));assert(sanity.has('clue:cthulhu'));
c.location.hash='#secret/salt';secrets.open('salt');assert.equal(sanity.current(),100);
assert.equal(nodes['reader-sanity-number'].textContent,'100 / 100');
console.log('PASS: real catalog/notebook/secret integration; strong-blur markup; no charge on navigation; visible 2/4/6 prices; pay once; discovery only after consent; all story leaves exist; room restores without losing access.');
