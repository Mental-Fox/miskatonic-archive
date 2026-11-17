'use strict';
/* Первый этап: постоянный начальный показатель, без изменения при чтении. */
(function(){
  const key='miskatonic.reader-sanity.v1';
  let state=null;
  try{
    const saved=JSON.parse(localStorage.getItem(key)||'null');
    if(saved?.version===1&&saved.value===100&&typeof saved.createdAt==='string'&&Number.isFinite(Date.parse(saved.createdAt))){
      state={version:1,value:100,createdAt:saved.createdAt};
    }
  }catch{}
  if(!state){
    state={version:1,value:100,createdAt:new Date().toISOString()};
    try{localStorage.setItem(key,JSON.stringify(state));}catch{}
  }
  const widget=document.getElementById('reader-sanity');
  const number=document.getElementById('reader-sanity-number');
  const meter=document.getElementById('reader-sanity-meter');
  if(number)number.textContent='100 / 100';
  if(meter)meter.value=100;
  if(widget)widget.setAttribute('aria-label','Рассудок читателя: 100 из 100');
  const book=document.getElementById('book'),header=document.querySelector?.('.book-head');
  if(widget&&book&&header&&typeof matchMedia==='function'){
    const compact=matchMedia('(max-width:820px)');
    const place=()=>{if(compact.matches)header.append(widget);else book.append(widget);};
    place();compact.addEventListener('change',place);
  }
  window.readerSanity=Object.freeze({current:()=>state.value});
})();
