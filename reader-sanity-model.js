'use strict';
(function(){
  window.createSanityModel=function({records,leaves,storage,now=()=>new Date().toISOString()}){
    const key='miskatonic.reader-sanity.v2',registry=new Map();
    for(const record of records){
      registry.set('clue:'+record.id,{cost:2,title:'Ключевые приметы'});
      registry.set('log:'+record.id,{cost:2,title:'Из полевой книжки'});
    }
    for(const leaf of leaves){
      registry.set('leaf:'+leaf.id,{cost:leaf.standalone?2:4,title:leaf.title});
      registry.set('postscript:'+leaf.id,{cost:6,title:'Опасная приписка',requires:'leaf:'+leaf.id});
    }
    let persistent=true;
    function read(k){try{return JSON.parse(storage.getItem(k)||'null');}catch{return null;}}
    function valid(saved){return saved?.version===2&&Number.isInteger(saved.value)&&saved.value>=0&&saved.value<=100&&Array.isArray(saved.opened);}
    function normalize(saved){return {version:2,value:saved.value,createdAt:typeof saved.createdAt==='string'?saved.createdAt:now(),opened:[...new Set(saved.opened.filter(id=>registry.has(id)))]};}
    const saved=read(key),old=read('miskatonic.reader-sanity.v1');
    let state=valid(saved)?normalize(saved):{version:2,value:old?.version===1&&Number.isInteger(old.value)&&old.value>=0&&old.value<=100?old.value:100,createdAt:typeof old?.createdAt==='string'?old.createdAt:now(),opened:[]};
    // Historical discoveries remain readable; migration never charges retroactively.
    const found=read('miskatonic.hidden-pages.v1');
    if(Array.isArray(found))for(const id of found){
      const material='leaf:'+id;if(registry.has(material)&&!state.opened.includes(material))state.opened.push(material);
    }
    function save(){try{storage.setItem(key,JSON.stringify(state));persistent=true;}catch{persistent=false;}}
    if(!valid(saved)||JSON.stringify(state)!==JSON.stringify(saved))save();
    function refresh(){
      if(!persistent)return;
      const next=read(key);if(valid(next))state=normalize(next);
    }
    function quote(id){
      const item=registry.get(id);
      if(!item)return {known:false,opened:false,canOpen:false,cost:0,reason:'unknown',value:state.value};
      const opened=state.opened.includes(id);
      const reason=opened?'':item.requires&&!state.opened.includes(item.requires)?'parent':state.value<=0?'insufficient':'';
      return {known:true,opened,canOpen:opened||!reason,cost:opened?0:item.cost,title:item.title,reason,value:state.value};
    }
    function unlock(id){
      refresh();const q=quote(id);
      if(!q.canOpen)return {ok:false,...q};
      if(q.opened)return {ok:true,...q,charged:0};
      const charged=Math.min(q.cost,state.value);state.value-=charged;state.opened.push(id);save();
      return {ok:true,...quote(id),charged};
    }
    function rest(){refresh();state.value=100;save();return snapshot();}
    function stage(){return state.value>=70?'clear':state.value>=40?'anxious':state.value>=15?'haunted':'limit';}
    function snapshot(){return {value:state.value,stage:stage(),opened:[...state.opened],persistent};}
    return Object.freeze({quote,unlock,rest,snapshot,refresh});
  };
})();
