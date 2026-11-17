'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c={window:{}};vm.createContext(c);
for(const f of ['entries.js','fieldwork.js','profiles.js','epochs.js','field-notes.js','books.js','bestiary-ext.js','monster-engravings.js','secret-ornaments.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);
const records=c.window.ENTRIES.filter(r=>['creatures','gods'].includes(r.group));
const map=c.window.MONSTER_ENGRAVINGS,api=c.window.secretOrnaments;
assert.equal(records.length,64);assert.equal(Object.keys(map).length,64);
assert.equal(map.hydra.context.includes('не реконструкция'),true);
assert.notEqual(map.hydra.atlas+':'+map.hydra.tile,'art/engraved-margins/monsters-2.png:6','No invented egg for Hydra');
for(const asset of Object.values(map))assert(!asset.alternate.atlas.includes('engraving-atlas-v1'),'No unrelated generic alternatives');
for(const record of records){
  const asset=map[record.id];assert(asset,record.id);
  assert(Number.isInteger(asset.tile)&&asset.tile>=0&&asset.tile<8);
  assert(fs.existsSync(asset.atlas),asset.atlas);
  const html=api.wrap({entry:record.id},'<div class="open-book secret-book"><section class="book-page verso"></section><section class="book-page recto"><p class="secret-progress"></p></section></div>');
  assert(fs.existsSync(asset.alternate.atlas));
  assert(html.includes(asset.alternate.atlas));assert(html.includes('data-engraving="'+record.id+'"'));
  assert.equal((html.match(/data-engraving=/g)||[]).length,1,'Exactly one image per secret spread');
  assert(html.includes('data-variant="secret"'));
  assert(!html.includes('engraving-insert'));
  assert(!html.includes('raster-scribbles'));
  let corners=0,details=0,frames=0;
  const page={querySelector:()=>({insertAdjacentHTML(position,s){assert.equal(position,'beforebegin');assert(s.includes('engraving-insert'));details++;}}),
    insertAdjacentHTML(position,s){assert.equal(position,'afterbegin');assert(s.includes('rlyeh-symbol-frame'));frames++;if(s.includes('data-engraving=')){assert(s.includes(asset.atlas));corners++;}}};
  const book={dataset:{},classList:{add(){}},querySelector:()=>page},root={querySelector:()=>book};
  api.decorateEntry(root,record.id);api.decorateEntry(root,record.id);
  assert.equal(frames,2);assert.equal(corners,0,'No extra image on main spread');assert.equal(details,0,'No large inserted gallery');
}
assert.equal(api.noteMark('necronomicon'),'','No repeated drawings beside notes');
{
  function visit(id){
    const page={insertAdjacentHTML(position,s){assert(!s.includes('data-engraving='));}};
    const book={dataset:{},classList:{add(){}},querySelector:()=>page};
    api.decorateEntry({querySelector:()=>book},id);
  }
  const markup='<div class="open-book secret-book"><section class="book-page verso"><p>Text</p><div class="folio-page">1</div></section><section class="book-page recto"><div class="folio-page">2</div></section></div>';
  for(const record of records){
    visit(record.id);
    const a=api.wrap({entry:record.id},markup);
    visit(record.id);
    const b=api.wrap({entry:record.id},markup);
    const style=s=>/data-variant="secret" style="([^"]+)"/.exec(s)[1];
    assert.notEqual(style(a),style(b),'Same-theme variants rotate on revisiting the entry');
    assert.equal((b.match(/data-engraving=/g)||[]).length,1);
    assert.equal((b.match(/rlyeh-symbol-frame/g)||[]).length,2);
    const left=b.split('<section class="book-page recto">')[0];
    assert(left.includes('secret-evidence-figure'));
    assert(left.indexOf('secret-evidence-figure')>left.indexOf('<p>Text</p>'));
    assert(left.indexOf('secret-evidence-figure')<left.indexOf('folio-page'));
    assert(!b.split('<section class="book-page recto">')[1].includes('data-engraving='));
  }
}
const index=fs.readFileSync('index.html','utf8');assert(index.indexOf('monster-engravings.js')<index.indexOf('secret-ornaments.js'));
console.log('PASS: 64 curated themes, valid primary/alternate assets, no main accent, one figure under left-leaf text, no galleries or full-page symbol wallpaper, idempotent rendering and fallback.');
