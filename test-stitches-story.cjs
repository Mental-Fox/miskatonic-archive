'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
function boot(data=new Map()){
  const c={window:null,localStorage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)}};
  c.window=c;vm.createContext(c);
  for(const f of ['entries.js','fieldwork.js','profiles.js','epochs.js','field-notes.js','books.js','bestiary-ext.js','owner-notes.js','owner-leaves.js','catalog-leaves.js','detective-story.js','secret-incidents.js','collection-story.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});
  return c;
}
const data=new Map(),c=boot(data),s=c.ARCHIVE_DETECTIVES;
assert.equal(Object.keys(s.traces).length,107);
for(const r of c.ENTRIES){assert(s.traces[r.id],r.id);assert(c.ARCHIVE_STITCH_EVIDENCE[r.id],r.id);assert(c.ARCHIVE_SECRET_INCIDENTS[r.id].length>100,r.id);}
assert.equal(Object.keys(s.documents).length,12);
assert.equal(Object.keys(c.ARCHIVE_INCIDENT_TIERS).length,16);
const start=s.dossier.join(' ');
assert(start.includes('1894')&&start.includes('седьмой иглы'));
assert(!/Homo lector|Книга собирала|память — удержать/.test(start),'No final explanation in initial dossier');
for(const leaf of c.ARCHIVE_EXTRA_LEAVES){const doc=s.leaf(leaf);assert.equal(doc.id,leaf.id);assert.equal(doc.next,leaf.next);assert.notEqual(doc.paragraphs[0],leaf.paragraphs[0]);}
assert(s.documents['ice-rubbing'].paragraphs.join(' ').includes('1930–1931'));
assert(s.documents['key-rest'].paragraphs.join(' ').includes('2 января 1937'));
assert(s.documents['dream-silence'].paragraphs.join(' ').includes('собаке, которой у них никогда не было'));
assert(c.archiveIncidentTier('cthulhu',20,false).includes('семью прозрачными стежками'));
assert(!data.has('miskatonic.incident-revelations.v1'),'An unpaid preview does not save revelations');
assert(!c.archiveIncidentTier('cthulhu',100).includes('семью прозрачными стежками'));
c.archiveIncidentTier('cthulhu',20);
assert(c.archiveIncidentTier('cthulhu',100).includes('семью прозрачными стежками'),'Rest does not erase seen text');
assert(boot(data).archiveIncidentTier('cthulhu',100).includes('семью прозрачными стежками'),'Revealed passages survive reload');
assert(!c.archiveIncidentTier('dagon',100).includes('Рёбра вдавлены'),'One document does not unlock another');
assert(!s.note('cthulhu',{}).thirdHand);
data.set('miskatonic.consumed.v1','{"count":1}');
assert(s.note('cthulhu',{}).thirdHand);assert(!s.note('dagon',{}).thirdHand,'Only selected signatures change');
const unavailable={window:null,localStorage:{getItem(){throw Error();},setItem(){throw Error();}}};unavailable.window=unavailable;vm.createContext(unavailable);
for(const f of ['detective-story.js','secret-incidents.js','collection-story.js'])vm.runInContext(fs.readFileSync(f,'utf8'),unavailable);
assert(unavailable.archiveIncidentTier('cthulhu',20).includes('семью прозрачными стежками'));
assert(unavailable.archiveIncidentTier('cthulhu',100).includes('семью прозрачными стежками'),'In-memory fallback retains seen text');
// The reader card is concealed until enough independent evidence has been found.
const cardData=new Map(),card=boot(cardData);let cardHtml='';
Object.assign(card,{location:{hash:''},addEventListener(){},document:{addEventListener(){}},openFolio:s=>cardHtml=s});
vm.runInContext(fs.readFileSync('homo-lector.js','utf8'),card);
card.homoLector.open();assert(cardHtml.includes('Заклеенный клапан'));assert(!cardHtml.includes('<h2>Homo lector'));
cardData.set('miskatonic.reader-sanity.v2',JSON.stringify({value:100,opened:['leaf:key-ticket']}));
card.homoLector.open();assert(cardHtml.includes('<h2>Homo lector'));
cardData.set('miskatonic.reader-sanity.v2',JSON.stringify({value:100,opened:Array.from({length:10},(_,i)=>'leaf:e'+i)}));
assert(card.homoLector.revealed(),'Ten independent leaves also uncover the card');
cardData.set('miskatonic.reader-sanity.v2','{"value":100,"opened":[]}');
cardData.set('miskatonic.consumed.v1','{"count":1,"last":"2026-11-18"}');
card.homoLector.open();assert(cardHtml.includes('Наблюдение возобновлено'));
console.log('PASS: all 107 clues, 12 linked documents, 16 tiered protocols, chronology, spoiler boundary, paid reveal persistence and changed signatures.');
