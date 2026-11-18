'use strict';
// Атмосфера рассудка: виньетка, затемнение страниц и беспорядок в тексте растут по мере падения рассудка.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c={JSON,Object,Number,Math,String,Array,Set,matchMedia:()=>({matches:false}),addEventListener(){},
  document:{readyState:'loading',addEventListener(){}}};
c.window=c;vm.createContext(c);
const src=fs.readFileSync('sanity-atmosphere.js','utf8');
vm.runInContext(src,c);
const L=c.sanityAtmosphere.levels;

const at100=L(100),at70=L(70),at40=L(40),at15=L(15),at0=L(0);
assert.equal(at100.vignette,0,'Full sanity: no vignette');
assert.equal(at100.page,0,'Full sanity: pages untouched');
assert.equal(at100.disorder,0,'Full sanity: text untouched');
assert.equal(at70.disorder,0,'Disorder starts only below 70');
for(const key of ['vignette','page','disorder','swim']){
  let prev=-1;
  for(let v=100;v>=0;v-=5){const x=L(v)[key];assert(x>=prev-1e-9,key+' grows as sanity falls ('+v+')');assert(x>=0&&x<=1,key+' stays within 0..1');prev=x;}
}
assert(at0.vignette>.9,'At the bottom the edges are almost black');
assert(at0.page===1&&at0.disorder===1);
assert(L(60).blood===0&&at15.blood>.5,'Blood tint grows strong at the bottom');
const at20=L(20);assert(at20.disorder===1&&at20.swim>.9&&at20.vignette>.95,'By 20 sanity the text is barely readable and the edges are black');
assert(at0.reach<at40.reach&&at40.reach<at100.reach,'Darkness creeps closer to the centre');

assert(!/setInterval|setTimeout|requestAnimationFrame/.test(src),'No own timers or loops');
assert(/prefers-reduced-motion/.test(src));
const index=fs.readFileSync('index.html','utf8'),reader=fs.readFileSync('reader.js','utf8');
assert(index.indexOf('sanity-atmosphere.js')>0&&index.indexOf('sanity-atmosphere.js')<index.indexOf('reader.js'));
assert(reader.includes('sanityAtmosphere?.decorate'));
assert(fs.readFileSync('anomalies.css','utf8').includes('.sanity-vignette'));
// Пульс тома (FPS): над закладкой рассудка, цикл можно остановить кликом.
const fps=fs.readFileSync('fps-pulse.js','utf8');
assert(/cancelAnimationFrame/.test(fps)&&/miskatonic\.fps\.v1/.test(fps),'FPS loop can be stopped and the choice is remembered');
assert(/insertBefore\(el,sanity\)/.test(fps),'Placed right above the sanity bookmark');
assert(index.indexOf('fps-pulse.js')>0&&index.indexOf('fps-pulse.js')<index.indexOf('reader.js'));
assert(fs.readFileSync('anomalies.css','utf8').includes('.reader-fps'));
assert(!/sanity-swim|feDisplacementMap/.test(src),'No full-page SVG filter: swaying uses cheap transforms');
assert(/rune-scrawl/.test(src),'Runes are scattered over the page at low sanity');
console.log('sanity atmosphere ok');
