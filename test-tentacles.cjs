'use strict';
const assert=require('node:assert/strict');
const {geometry,mount,kinds}=require('./tentacles.js');
assert.equal(kinds.length,20);
for(const kind of kinds){
  const still=geometry(kind,0,0),a=geometry(kind,1,1),b=geometry(kind,2,1);
  assert.deepEqual(a.root,still.root,'The root must stay at the binding.');
  assert.deepEqual(b.root,still.root);
  assert.notDeepEqual(a.tip,b.tip,'The free end must deform over time.');
  assert.notEqual(a.body,b.body);
  assert(!/NaN|Infinity/.test(JSON.stringify(a)));
  assert(a.body.endsWith('Z')&&a.belly.endsWith('Z'));
  assert.equal(a.cups.length,15);
  assert(a.cups[0].rx>a.cups.at(-1).rx,'Suckers must taper with the arm.');
  assert(a.cups.every(c=>c.rx>0&&c.ry>0));
}
function node(attrs={}){
  return {attrs,children:[],setAttribute(k,v){this.attrs[k]=v;},getAttribute(k){return this.attrs[k];},append(el){this.children.push(el);},replaceChildren(){this.children=[];}};
}
global.document={createElementNS:()=>node()};
const roots=kinds.map(kind=>node({'data-tentacle':kind}));
const draw=mount({getAttribute:()=> 'cover',querySelectorAll:()=>roots});
draw(0,0);const before=roots[0].children[0].attrs.d;
draw(1.4,1);assert.notEqual(roots[0].children[0].attrs.d,before);
for(const root of roots){const contact=geometry(root.attrs['data-tentacle'],0,0).touch;assert.equal(root.children.length,contact?21:20);assert(root.children[contact?6:5].attrs.transform.includes('rotate'));}
const sizes=kinds.map(k=>geometry(k,0,0).size);assert(Math.max(...sizes)>Math.min(...sizes)*4);
for(const kind of kinds.filter(k=>geometry(k,0,0).touch)){const g=geometry(kind,1,1);assert(g.tip[0]>20&&g.tip[1]>20&&g.tip[0]<370&&g.tip[1]<538,'Contact tips should rest inside the cover.');}
assert.equal(kinds.filter(k=>geometry(k,0,0).touch).length,5);
const tips=kinds.filter(k=>!geometry(k,0,0).touch).map(k=>geometry(k,0,0).tip);
assert(tips.some(p=>p[0]<0)&&tips.some(p=>p[0]>400)&&tips.some(p=>p[1]<0)&&tips.some(p=>p[1]>560),'Tentacles must reach out from all four sides.');
for(const kind of kinds.filter(k=>geometry(k,0,0).touch)){
 const whole=geometry(kind,2,1),top=geometry(kind,2,1,0,.32);
 assert.deepEqual(whole.tip,top.tip,'Both layers must meet at the same tip.');
 assert.notDeepEqual(whole.root,top.root,'Front layer must exclude the root.');
 assert.notEqual(whole.body,top.body);
}
const backRoots=kinds.map(kind=>node({'data-tentacle':kind}));mount({querySelectorAll:()=>backRoots})(0,1);assert(backRoots.every(g=>g.children.length===20),'No contact shadow under the cover.');
delete global.document;
console.log('PASS: roots stay fixed, bodies and tips deform, suckers taper, SVG paths and sucker positions update.');
