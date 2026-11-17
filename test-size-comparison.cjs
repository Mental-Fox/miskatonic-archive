'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('notebook.js','utf8');
const fragment=source.slice(source.indexOf('const humanFigure='),source.indexOf('function guideTitle'));
const c={window:{archiveSecrets:{link:id=>id==='test'?'#secret/dossier-test':''}},plateImage:()=>'<img>',escapeHTML:v=>String(v)};
vm.createContext(c);vm.runInContext(fragment,c);
const r={id:'test',name:'Существо'};
const known=c.sizeChart(r,{size:{m:3.6,label:'Около 3,6 м'}});
assert(known.includes('--h:100.000%'));assert(known.includes('--h:50.000%'));
assert(known.includes('Человек · 1,8 м'));assert(known.includes('Существо · 3,6 м'));
const tiny=c.sizeChart(r,{size:{m:.18,label:'18 см'}});assert(tiny.includes('--h:10.000%'));
const huge=c.sizeChart(r,{size:{m:10000,label:'10 км'}});assert((huge.match(/<span style="bottom:/g)||[]).length<=5,'Large sizes do not create hundreds of ruler marks');
for(const m of [null,undefined,NaN,0,-3]){
  const html=c.sizeChart(r,{size:{m,label:'Облик не описан'}});
  assert(html.includes('Размер не установлен'));assert(!html.includes('scale-plot'));assert(!html.includes('scale-drawing'));
  assert(!html.includes('едва заметная точка'));
}
assert.equal(c.sizeChart(r,{}),'');
const linked=c.secretIllustration(r,'<img src="custom">');
assert(linked.includes('href="#secret/dossier-test"'));assert(linked.includes('<img src="custom">'));
assert(linked.includes('aria-label="Открыть тайный лист: Существо"'));
assert.equal(c.secretIllustration({id:'other'},'<img>'),'<img>');
console.log('PASS: shared scale, tiny/large dimensions, bounded ruler ticks, unknown/invalid dimensions and accessible secret link without altering the illustration.');
