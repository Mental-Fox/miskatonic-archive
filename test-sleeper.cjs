'use strict';
/* Сюжет «Мёртвый, но видящий сны»: целостность данных, маршруты, материалы, спички и руны. */
const assert=require('assert'),fs=require('fs'),vm=require('vm');
const listeners={},store=new Map();
const root={dataset:{},style:{setProperty(){}}};
const ctx={console,
  localStorage:{getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)},
  document:{documentElement:root,addEventListener(t,f){(listeners[t]??=[]).push(f);},querySelector:()=>null,querySelectorAll:()=>[]},
  addEventListener(t,f){(listeners[t]??=[]).push(f);},matchMedia:()=>({matches:true}),location:{hash:''}};
ctx.window=ctx;vm.createContext(ctx);
const run=f=>vm.runInContext(fs.readFileSync(__dirname+'/'+f,'utf8'),ctx,{filename:f});
for(const f of ['entries.js','fieldwork.js','profiles.js','epochs.js','field-notes.js','books.js','bestiary-ext.js'])run(f);
run('sleeper-story.js');run('sleeper.js');
const S=ctx.SLEEPER_STORY,api=ctx.sleeper;
const known=new Set(ctx.ENTRIES.map(r=>r.id));
const all_count=()=>new Set(S.seasons.flatMap(s=>s.ids)).size;

// Сезоны и существа
assert.strictEqual(S.seasons.length,6);
assert.strictEqual(all_count(),ctx.ENTRIES.length,'каждая запись принадлежит сезону');
const all=S.seasons.flatMap(s=>s.ids);
assert.strictEqual(new Set(all).size,all.length,'существо в двух сезонах');
for(const id of all){assert(known.has(id),'нет записи '+id);assert(S.entries[id],'нет сна '+id);}
for(const s of S.seasons)for(const k of s.people)assert(S.people[k],'нет сыщика '+k);
assert.strictEqual(Object.keys(S.people).length,7);

// Вклейки: 20 штук; руны: 24 разных, по четыре на сезон
const inserts=Object.entries(S.entries).filter(([,e])=>e.insert);
assert.strictEqual(inserts.length,20);
const runes=Object.values(S.entries).filter(e=>Number.isInteger(e.rune)).map(e=>e.rune).sort((a,b)=>a-b);
assert.deepStrictEqual(runes,[...Array(24).keys()]);
assert.strictEqual(S.runes.length,24);assert.strictEqual(new Set(S.runes.map(r=>r.glyph)).size,24,'глифы рун различаются');
for(const s of S.seasons)assert.strictEqual(s.ids.filter(id=>Number.isInteger(S.entries[id].rune)).length,4,s.n+': четыре руны');
for(const [id,e] of Object.entries(S.entries)){
  assert.strictEqual(e.dream.length,3,id+': три уровня сна');
  if(Number.isInteger(e.rune))assert(e.canon?.dreamt&&e.canon?.real,id+': пометка «приснилось иначе»');
  if(e.next)assert(S.entries[e.next],id+': ниточка ведёт в пустоту');
  if(!e.insert)continue;
  assert(S.people[e.owner],id+': владелец');
  assert.strictEqual(e.insert.paragraphs.length,3,id+': документ');
  assert.strictEqual(e.deep.length,3,id+': приписка 18+');
}
// Сыщики I–II оставили по две вклейки, III–V — по четыре
const per={};for(const [,e] of inserts)per[e.owner]=(per[e.owner]||0)+1;
assert.deepStrictEqual(per,{crane:2,haddad:2,ashcombe:2,joseph:2,bloomfield:4,courtney:4,gallagher:4});

// Материалы рассудка
const mats=api.materials();
assert.strictEqual(mats.filter(m=>m.id.startsWith('insert:')).length,20);
assert(mats.filter(m=>m.id.startsWith('deep:')).every(m=>m.requires===m.id.replace('deep:','insert:')&&m.cost===6));
assert.strictEqual(mats.filter(m=>m.id.startsWith('canon:')).length,Object.values(S.entries).filter(e=>e.canon).length);

// Маршруты
assert.strictEqual(api.match('#sleeper').view,'prologue');
assert.strictEqual(api.match('#secret/case-file').view,'prologue');
assert.strictEqual(api.match('#season/2').n,1);assert.strictEqual(api.match('#season/6').n,5);assert.strictEqual(api.match('#season/7'),null);
assert.strictEqual(api.match('#insert/dagon').view,'insert');
assert.strictEqual(api.match('#insert/yog'),null,'у бога сезона III нет вклейки');
assert.strictEqual(api.match('#awakening').view,'epilogue');
assert.strictEqual(api.match('#entry/dagon'),null);

// Спички: три на ночь, потом только до 40
ctx.readerSanity={current:()=>20};
assert.strictEqual(api.state().matches,3);
assert.strictEqual(api.strike(),100);assert.strictEqual(api.strike(),100);assert.strictEqual(api.strike(),100);
assert.strictEqual(api.state().matches,0);
assert.strictEqual(api.strike(),40);
ctx.readerSanity={current:()=>55};
assert.strictEqual(api.strike(),55,'без спички выше 40 не поднимает и не опускает');
assert.strictEqual(JSON.parse(store.get(api.KEY)).matches,0);

// Замки сезонов: открыт только первый; четыре руны сезона I открывают II
assert(api.unlocked(0)&&!api.unlocked(1)&&!api.unlocked(5));
store.set(api.KEY,JSON.stringify({v:1,runes:['shoggoth','hound-tindalos','mi-go','ghouls'],matches:3}));
{const c3={...ctx,document:{...ctx.document,addEventListener(){}},addEventListener(){}};c3.window=c3;vm.createContext(c3);
for(const f of ['entries.js','fieldwork.js','profiles.js','epochs.js','field-notes.js','books.js','bestiary-ext.js','sleeper-story.js','sleeper.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+f,'utf8'),c3);
assert(c3.sleeper.seasonDone(0)&&c3.sleeper.unlocked(1)&&!c3.sleeper.unlocked(2));}

// Испорченное хранилище не ломает книгу
store.set(api.KEY,'{"v":1,"runes":["dagon","nope"],"matches":-4}');
const ctx2={...ctx,document:{...ctx.document,addEventListener(){}},addEventListener(){}};ctx2.window=ctx2;vm.createContext(ctx2);
for(const f of [...['entries.js','fieldwork.js','profiles.js','epochs.js','field-notes.js','books.js','bestiary-ext.js'],'sleeper-story.js','sleeper.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+f,'utf8'),ctx2);
const st=ctx2.sleeper.state();
assert.strictEqual(JSON.stringify(st.runes),'["dagon"]');assert.strictEqual(st.matches,3);

// Модель рассудка принимает материалы сюжета и отдых до заданного уровня
run('reader-sanity-model.js');
const mem=new Map(),model=ctx.createSanityModel({records:[],leaves:[],extra:mats,storage:{getItem:k=>mem.get(k)??null,setItem:(k,v)=>mem.set(k,v)}});
assert.strictEqual(model.quote('insert:dagon').cost,4);
assert.strictEqual(model.quote('deep:dagon').reason,'parent');
model.unlock('insert:dagon');assert.strictEqual(model.snapshot().value,96);
model.rest(40);assert.strictEqual(model.snapshot().value,96,'отдых в темноте не отнимает рассудок');
model.rest();assert.strictEqual(model.snapshot().value,100);
assert.strictEqual(model.spend(5),5);assert.strictEqual(model.snapshot().value,95,'сон стоит рассудка');
assert.strictEqual(model.spend(500),95);assert.strictEqual(model.snapshot().value,0,'ниже нуля не уходит');
console.log('sleeper story: ok');
