const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const src=fs.readFileSync('image-library.js','utf8').replace(/\}\)\(\);\s*$/, 'window.testImages={items,save,refreshImages,build,options};})();');
const stored=new Map();
function boot(){
  const images=[],css=new Map();let exported;
  const fields=new Map();
  function field(key){if(!fields.has(key))fields.set(key,{value:'',style:{},disabled:false,innerHTML:'',replaceChildren(){}});return fields.get(key);}
  const db={transaction(){const tx={objectStore(){return {getAll(){const req={};queueMicrotask(()=>{req.result=[...stored].map(([id,value])=>({id,value}));req.onsuccess();});return req;},put(record){stored.set(record.id,record.value);queueMicrotask(()=>tx.oncomplete());}};}};return tx;}};
  const c={console,Map,Set,Promise,Event,Blob,queueMicrotask,setTimeout(){},location:{hash:'#chapter/books'},MutationObserver:class{observe(){}},indexedDB:{open(){const req={result:db};queueMicrotask(()=>req.onsuccess());return req;}},URL:{createObjectURL(blob){exported=blob;return 'blob:test';},revokeObjectURL(){}},artPath:r=>'art/'+r.id+'.webp',fileAliases:{},chapters:[{id:'books',num:'VI',title:'Библиотека',art:'necronomicon'},{id:'places',num:'IV',title:'Места',art:'rlyeh'}],plateImage:r=>'<img src="art/'+r.id+'.webp">',document:{body:{append(){}},documentElement:{style:{setProperty:(key,value)=>css.set(key,value)}},querySelectorAll:()=>images,addEventListener(){},createElement(tag){return tag==='dialog'?{querySelector:field,querySelectorAll:()=>[],setAttribute(){},addEventListener(){}}:{click(){}};}}};
  c.window=c;c.dispatchEvent=()=>{};c.BOOK_IMAGES={cthulhu:{src:'data:old',name:'old.png'},'unknown-future-slot':{src:'data:future',name:'future.png'}};c.ENTRIES=[{id:'cthulhu',name:'Ктулху'}];
  vm.createContext(c);vm.runInContext(fs.readFileSync('image-assets.js','utf8'),c);vm.runInContext(src,c);
  return {c,images,css,fields,getExport:()=>exported};
}
function image(path,id){let src=path;return {dataset:id?{imageId:id}: {},closest:()=>false,getAttribute:()=>src,setAttribute:(_,value)=>{src=value;},get src(){return src;}};}
(async()=>{
  const {c,images,css,fields,getExport}=boot();await c.bookImages.ready;
  const t=c.testImages;
  assert(t.items().some(x=>x.id==='chapter:books'&&x.name.includes('Библиотека')));
  assert.equal(t.items().filter(x=>x.id.startsWith('asset:')).length,c.BOOK_IMAGE_ASSETS.length);
  assert.equal(new Set(t.items().map(x=>x.id)).size,t.items().length);
  assert.equal(c.bookImages.resolve('art/cutouts/cthulhu.webp'),'data:old');
  const chapter=image('art/necronomicon.webp','chapter:books');const plain=image('art/necronomicon.webp');images.push(chapter,plain);
  await t.save('chapter:books',{src:'data:chapter',name:'chapter.png'});
  assert.equal(chapter.src,'data:chapter');assert.equal(plain.src,'art/necronomicon.webp');
  await t.save('asset:art/necronomicon.webp',{src:'data:book',name:'book.png'});
  assert.equal(chapter.src,'data:chapter');assert.equal(plain.src,'data:book');
  await t.save('chapter:books',null);assert.equal(chapter.src,'data:book');
  await t.save('asset:art/necronomicon.webp',null);assert.equal(plain.src,'art/necronomicon.webp');
  await t.save('asset:art/paper-grain.webp',{src:'data:paper',name:'paper.png'});
  assert.equal(css.get('--book-image-art-paper-grain-webp'),'url("data:paper")');
  const added=image('mark.svg');images.push(added);await t.save('asset:mark.svg',{src:'data:mark',name:'mark.png'});assert.equal(added.src,'data:mark');
  const late=image('mark.svg');images.push(late);t.refreshImages();assert.equal(late.src,'data:mark');
  const next=boot();await next.c.bookImages.ready;assert.equal(next.c.bookImages.resolve('mark.svg'),'data:mark');
  t.build();t.options();assert(fields.get('[data-image-select]').innerHTML.includes('chapter:books'));
  fields.get('[data-image-category]').value='Главы';t.options();assert(!fields.get('[data-image-select]').innerHTML.includes('asset:'));
  fields.get('[data-image-query]').value='Библиотека';t.options();assert(fields.get('[data-image-name]').textContent.includes('Библиотека'));
  fields.get('[data-image-query]').value='no-such-picture';t.options();assert(fields.get('[data-image-file]').disabled);
  fields.get('[data-image-export]').onclick();const exported=await getExport().text();
  const restore={window:{}};vm.runInNewContext(exported,restore);assert.equal(restore.window.BOOK_IMAGES['asset:mark.svg'].src,'data:mark');assert.equal(restore.window.BOOK_IMAGES['unknown-future-slot'].src,'data:future');assert(!restore.window.BOOK_IMAGES['chapter:books']);
  for(const p of c.BOOK_IMAGE_ASSETS)assert(fs.existsSync(p),p);
  const tokens=c.BOOK_IMAGE_ASSETS.map(p=>p.replace(/[^a-zA-Z0-9-]/g,'-'));assert.equal(new Set(tokens).size,tokens.length);
  for(const path of fs.readdirSync('.').filter(x=>x.endsWith('.css'))){const text=fs.readFileSync(path,'utf8');for(const m of text.matchAll(/url\(['"]?(art\/[^)'"\s]+)['"]?\)/g)){assert(c.BOOK_IMAGE_ASSETS.includes(m[1]));assert(text.slice(Math.max(0,m.index-90),m.index).includes('var(--book-image-'),path+': '+m[1]);}}
  console.log('PASS: catalog, independent chapter replacement, shared assets, reset, CSS backgrounds, dynamic images, persistence, search, filters, export and restore.');
})().catch(e=>{console.error(e);process.exitCode=1;});
