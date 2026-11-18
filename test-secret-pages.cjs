'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const catalog={window:{}};vm.createContext(catalog);
for(const f of ['entries.js','fieldwork.js','profiles.js','epochs.js','field-notes.js','books.js','bestiary-ext.js','owner-notes.js','owner-leaves.js','catalog-leaves.js'])vm.runInContext(fs.readFileSync(f,'utf8'),catalog,{filename:f});
const records=catalog.window.ENTRIES,notes=catalog.window.ARCHIVE_OWNER_NOTES,extra=catalog.window.ARCHIVE_EXTRA_LEAVES,arcs=catalog.window.ARCHIVE_SECRET_ARCS;
const creatures=records.filter(r=>['creatures','gods'].includes(r.group));
assert.equal(creatures.length,64);
assert.equal(Object.keys(notes).length,106);
for(const r of creatures){assert(notes[r.id]?.scholar,r.id);assert(notes[r.id]?.witness,r.id);}
const texts=Object.values(notes).flatMap(n=>[n.scholar,n.witness]);assert.equal(new Set(texts).size,212,'Every note is individually written');
assert.equal(arcs.length,8);assert.equal(extra.length,9);
const singles=catalog.window.ARCHIVE_SINGLE_LEAVES;
assert.equal(singles.length,53);
const catalogLeaves=catalog.window.ARCHIVE_CATALOG_LEAVES;
assert.equal(catalogLeaves.length,42);
const leafRecords=[{entry:'cthulhu'},{entry:'deep-ones'},{entry:'necronomicon'},...extra,...singles,...catalogLeaves];
assert.equal(leafRecords.length,records.length);
assert.equal(new Set(leafRecords.map(l=>l.entry)).size,107);
assert.equal(new Set(catalogLeaves.map(l=>l.id)).size,42);
assert.equal(new Set(catalogLeaves.map(l=>l.number)).size,42);
assert.equal(new Set(catalogLeaves.flatMap(l=>l.paragraphs)).size,84);
assert.equal(catalogLeaves.filter(l=>records.find(r=>r.id===l.entry).group==='places').length,13);
assert.equal(catalogLeaves.filter(l=>records.find(r=>r.id===l.entry).group==='signs').length,10);
assert.equal(catalogLeaves.filter(l=>records.find(r=>r.id===l.entry).group==='books').length,19);
for(const r of records)assert.equal(leafRecords.filter(l=>l.entry===r.id).length,1,'Exactly one leaf for '+r.id);
assert.equal(new Set([...extra,...singles].map(l=>l.id)).size,62);
assert.equal(new Set([...extra,...singles].map(l=>l.number)).size,62);
assert.equal(new Set(singles.flatMap(l=>l.paragraphs)).size,106,'Independent documents have unique paragraphs');
assert.equal(new Set(extra.map(l=>l.id)).size,9);
assert.equal(new Set(extra.map(l=>l.number)).size,9);
for(const leaf of [...extra,...singles]){
  assert(records.some(r=>r.id===leaf.entry),leaf.entry);
  if(leaf.next)assert(records.some(r=>r.id===leaf.next),leaf.next);
  assert(leaf.paragraphs.length>=2);assert(leaf.reply);assert(leaf.answer);
}
function boot(saved='[]',blocked=false){
  const values=new Map([['miskatonic.hidden-pages.v1',saved]]);
  let html='',inserted='';
  const c={Set,JSON,localStorage:{getItem:k=>{if(blocked)throw Error();return values.get(k);},setItem:(k,v)=>{if(blocked)throw Error();values.set(k,v);}},
    openFolio:s=>html=s,ENTRIES:records,
    plateImage:(r,cls)=>'<img class="'+cls+'" data-record="'+r.id+'" src="art/'+r.id+'.webp">'};
  c.window=c;vm.createContext(c);
  for(const f of ['owner-notes.js','owner-leaves.js','catalog-leaves.js','detective-story.js','secret-incidents.js','collection-story.js','secret-evidence.js','monster-engravings.js','secret-ornaments.js','secret-pages.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);
  return {api:c.archiveSecrets,values,html:()=>html,decorate(hash){
    inserted='';c.archiveSecrets.decorate({querySelector:()=>({querySelector:()=>null,insertAdjacentHTML:(_,s)=>inserted=s})},hash);return inserted;
  }};
}
const chains=[
  [['salt','cthulhu'],['footprints','deep-ones'],['binding','necronomicon']],
  [['ice-rubbing','elder-things'],['ice-correction','shoggoth'],['ice-card','yith']],
  [['dream-name','zoog'],['dream-silence','nightgaunts'],['dream-shore','nodens']],
  [['key-imprint','yog'],['key-ticket','nyarlathotep'],['key-rest','azathoth']]
];
const t=boot();
const beforeDossier=t.values.get('miskatonic.hidden-pages.v1');
t.api.open('case-file');
assert(t.html().includes('Двое оценщиков'));
assert(t.html().includes('Книга собирает коллекцию'));
assert(t.html().includes('Homo lector'));
assert(t.html().includes('Homo faber'));
assert(t.html().includes('бывший инспектор'));
assert(t.html().includes('частная сыщица'));
assert(t.html().includes('1926'));
assert.equal(t.values.get('miskatonic.hidden-pages.v1'),beforeDossier,'Dossier is not a discovered leaf');
assert.equal(t.api.anchor('case-file'),'#contents');
const storyContext={window:{}};vm.createContext(storyContext);
vm.runInContext(fs.readFileSync('detective-story.js','utf8'),storyContext);
const story=storyContext.window.ARCHIVE_DETECTIVES;
vm.runInContext(fs.readFileSync('secret-incidents.js','utf8'),storyContext);
vm.runInContext(fs.readFileSync('collection-story.js','utf8'),storyContext);
const incidents=storyContext.window.ARCHIVE_SECRET_INCIDENTS;
assert.equal(Object.keys(incidents).length,records.length,'Every leaf has an incident');
assert.equal(new Set(Object.values(incidents)).size,records.length,'Incidents are individually written');
const incidentReader=boot();
for(const r of records){
  assert(incidents[r.id]?.length>100,'Incident for '+r.id);
  incidentReader.api.open(incidentReader.api.link(r.id).split('/')[1]);
  const html=incidentReader.html();
  assert(html.includes('Что обнаружили сыщики'),r.id);
  assert(html.includes('Опасная приписка · <span class="secret-age-mark">18+</span>'),r.id);
  const danger=html.match(/<details class="secret-postscript">([\s\S]*?)<\/details>/)?.[1];
  for(const paragraph of incidents[r.id].split(/\n\n+/))assert(danger?.includes(paragraph),r.id);
  assert.equal((html.match(/class="secret-photo secret-photo-/g)||[]).length,3,'Two evidence photos and one incident photo: '+r.id);
  assert.equal((danger.match(/class="secret-photo secret-photo-incident"/g)||[]).length,1,r.id);
  assert(html.includes('class="secret-blood-text"'),r.id);
  assert(!html.includes('class="secret-evidence-figure"'),'Old isolated creature engraving removed from dossier');
  assert(html.includes('<details class="secret-route">'),r.id);
  assert(!danger.includes('owner-marginalia'),'Incident must not repeat the two handwritings');
}
assert.equal(Object.keys(story.traces).length,107);
const storyTexts=Object.values(story.traces).flat();
assert.equal(new Set(storyTexts).size,214,'Every detective conclusion is individually written');
for(const r of records){
  const original=notes[r.id]||{scholar:'Показание',witness:'Наблюдение'};
  const rewritten=story.note(r.id,original);
  assert(story.traces[r.id],r.id);
  assert(rewritten.scholar.includes(story.traces[r.id][0]),r.id);
  assert(rewritten.witness.includes(story.traces[r.id][1]),r.id);
  assert.equal(story.note(r.id,original).scholar,rewritten.scholar,'Rendering does not accumulate text');
}
for(const r of creatures){
  assert.equal(t.decorate('#entry/'+r.id),'','Owner notes must not appear in the main entry');
  assert(t.api.link(r.id).startsWith('#secret/'),r.id);
}

for(const chain of chains){
  const isolated=boot();
  assert.equal(isolated.api.link(chain[0][1]),'#secret/'+chain[0][0]);
  assert(!isolated.decorate('#entry/'+chain[1][1]).includes('#secret/'+chain[1][0]));
  const direct=boot();direct.api.open(chain[2][0]);assert(direct.html().includes('class="secret-transcript"'),'Every existing story leaf has real content, even before earlier leaves');
  for(let i=0;i<chain.length;i++){
    const [id,entry]=chain[i];
    assert.equal(isolated.api.link(entry),'#secret/'+id);
    isolated.api.open(id);assert(isolated.html().includes('Найдено '+(i+1)+' из 107'));
    assert(isolated.html().includes('class="secret-traces raster-traces"'));
    assert(!isolated.html().includes('class="secret-script"'),'No ordered symbol rows');
    assert.equal((isolated.html().match(/class="rlyeh-symbol-frame"/g)||[]).length,2,'Symbol frame retained on both pages');
    assert(isolated.html().includes('data-inspect-entry="'+entry+'"'));
    assert(isolated.html().includes('class="secret-transcript"'));
    t.api.open(id);
    assert.equal(isolated.api.onward(id),i<2?'#entry/'+chain[i+1][1]:'#contents');
  }
  assert(isolated.html().includes('class="secret-ending"'));
}
assert(t.html().includes('Найдено 12 из 107'));
t.api.open('salt');assert(t.html().includes('Найдено 12 из 107'));
const ledger=t.decorate('#contents');for(const chain of chains)for(const [id] of chain)assert(ledger.includes('#secret/'+id));
for(const arc of arcs)assert(ledger.includes(arc.title));
for(const leaf of singles){
  assert.equal(t.api.link(leaf.entry),'#secret/'+leaf.id);
  t.api.open(leaf.id);assert(t.html().includes(leaf.heading));
  assert(t.html().includes('data-inspect-entry="'+leaf.entry+'"'));
  assert(t.html().includes(leaf.paragraphs[0]));{const shown=story.note(leaf.entry,notes[leaf.entry]);assert(t.html().includes(shown.scholar));assert(t.html().includes(shown.witness));}assert(t.html().includes(leaf.paragraphs[1]));
  assert.equal(t.api.anchor(leaf.id),'#entry/'+leaf.entry);
  assert.equal(t.api.onward(leaf.id),'#contents');
}
assert(t.html().includes('Найдено 65 из 107'));
const legacy65=boot(t.values.get('miskatonic.hidden-pages.v1'));
assert(legacy65.decorate('#contents').includes('Найдено листов: 65 из 107'));
for(const leaf of catalogLeaves){
  assert.equal(t.api.link(leaf.entry),'#secret/'+leaf.id);
  assert.equal(t.decorate('#entry/'+leaf.entry),'');
  t.api.open(leaf.id);
  assert(t.html().includes(leaf.heading));
  for(const paragraph of leaf.paragraphs)assert(t.html().includes(paragraph));
  {const shown=story.note(leaf.entry,notes[leaf.entry]);assert(t.html().includes(shown.scholar));assert(t.html().includes(shown.witness));}
  assert(t.html().includes('data-record="'+leaf.entry+'"'),'Use this entry’s illustration instead of a generic monster decoration');
  assert.equal(t.api.anchor(leaf.id),'#entry/'+leaf.entry);
}
assert(t.html().includes('Найдено 107 из 107'));
const restored=boot(t.values.get('miskatonic.hidden-pages.v1'));
assert(restored.decorate('#contents').includes('Найдено листов: 107 из 107'));
const legacy=boot('["salt","footprints","binding"]');
assert(legacy.decorate('#contents').includes('Найдено листов: 3 из 107'),'Old progress survives unchanged');
assert.equal(legacy.api.link('necronomicon'),'#secret/binding');
assert(!legacy.decorate('#entry/shoggoth').includes('#secret/ice-correction'));
assert(!boot('broken json').decorate('#entry/deep-ones').includes('#secret/footprints'));
assert(!boot('["unknown"]').decorate('#contents').includes('Найдено листов: 1'));
const offline=boot('[]',true);offline.api.open('salt');
assert(offline.html().includes('Хранилище недоступно'));
offline.api.open('footprints');assert(offline.html().includes('class="secret-transcript"'));
t.api.open('<img>');assert(t.html().includes('Запись не найдена'));assert(!t.html().includes('<img>'));
assert.equal(t.api.anchor('binding'),'#entry/necronomicon');assert.equal(t.api.anchor('bad'),'#entry/cthulhu');
assert.equal(boot().api.onward('footprints'),'#contents');
const themed=boot();themed.api.open('dossier-atlach-nacha');assert(themed.html().includes('secret-theme-web'));
themed.api.open('dossier-star-vampire');assert(themed.html().includes('secret-theme-blood'));
themed.api.open('salt');assert(themed.html().includes('secret-theme-tide'));
const index=fs.readFileSync('index.html','utf8');
{
  const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('secret-ornaments.js','utf8'),c);
  const api=c.window.secretOrnaments,classes=new Set();let inserts=0;
  const page={insertAdjacentHTML(position,markup){assert.equal(position,'afterbegin');assert(markup.includes('record-engraving'));assert(!markup.includes('preserveAspectRatio="none"'));inserts++;}};
  const book={dataset:{},classList:{add:(...xs)=>xs.forEach(x=>classes.add(x))},querySelector:()=>page};
  const root={querySelector:()=>book};
  api.decorateEntry(root,'atlach-nacha');api.decorateEntry(root,'atlach-nacha');
  assert.equal(inserts,2,'One frame per side, without duplicates');
  assert(classes.has('engraved-record'));assert(classes.has('secret-theme-web'));
  const original='<div class="open-book secret-book"><section class="book-page verso"><div class="folio-page">1</div></section><section class="book-page recto"><div class="folio-page">2</div></section></div>';
  const a=api.wrap({entry:'atlach-nacha'},original),b=api.wrap({entry:'atlach-nacha'},original);
  assert.equal(a,b,'Engraving is stable between visits');
  assert(!a.includes('preserveAspectRatio="none"'),'Corner illustrations retain their proportions');
  assert(!a.includes('<svg'),'Page decorations use raster artwork');
  assert(a.includes('raster-web'),'Spider entries use the engraved web asset');
  assert(a.includes('rlyeh-symbol-frame'),'Chaotic handwritten frame is preserved');
  assert(!a.includes('raster-scribbles'),'No full-page symbol wallpaper');
  const other=api.wrap({entry:'star-vampire'},original);
  assert(other.includes('raster-blood'),'Blood-related entry selects the correct atlas tile');
}
assert(index.indexOf('owner-notes.js')<index.indexOf('owner-leaves.js'));
assert(index.indexOf('owner-leaves.js')<index.indexOf('secret-pages.js'));
assert(index.indexOf('catalog-leaves.js')>index.indexOf('owner-leaves.js'));
assert(index.indexOf('catalog-leaves.js')<index.indexOf('secret-pages.js'));
assert(index.indexOf('catalog-leaves.js')<index.indexOf('detective-story.js'));
assert(index.indexOf('detective-story.js')<index.indexOf('secret-pages.js'));
assert(index.indexOf('secret-incidents.js')<index.indexOf('secret-pages.js'));
assert(index.indexOf('secret-evidence.js')<index.indexOf('secret-pages.js'));
assert(index.indexOf('secret-pages.js')<index.indexOf('src="reader.js'));
console.log('PASS: all 107 unique catalog entries have one secret leaf; 42 new place/relic/book documents with individual notes and entry-specific images; direct story access, progress migration, storage failures and script order.');
