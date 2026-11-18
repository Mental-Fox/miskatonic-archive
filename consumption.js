'use strict';
/* Ноль рассудка завершает цикл: книга закрывается, находки и заметки сохраняются.
   В описи остаётся след; после открытия подписи Марты местами заменяет третья рука. */
(function(){
  const RECORD='miskatonic.consumed.v1';
  const reduce=typeof matchMedia==='function'?matchMedia('(prefers-reduced-motion: reduce)'):{matches:false};
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let running=false;

  function record(storage){try{const r=JSON.parse((storage||localStorage).getItem(RECORD)||'null');if(r&&Number.isInteger(r.count)&&r.count>0)return r;}catch{}return null;}
  function recover(storage){
    try{
      const key='miskatonic.reader-sanity.v2',s=JSON.parse(storage.getItem(key)||'null');
      if(s?.version!==2||!Array.isArray(s.opened))return false;
      storage.setItem(key,JSON.stringify({...s,value:100}));
      // Новая ночь: три спички. Руны имени (пробуждение) остаются — книга помнит.
      try{const k='miskatonic.sleeper.v1',x=JSON.parse(storage.getItem(k)||'null');if(x&&x.v===1)storage.setItem(k,JSON.stringify({...x,matches:Math.max(3,x.matches|0)}));}catch{}
      return true;
    }catch{return false;}
  }
  function remember(storage,bait){
    try{
      const prev=record(storage)||{count:0};
      storage.setItem(RECORD,JSON.stringify({count:prev.count+1,last:new Date().toISOString(),bait:bait||''}));
    }catch{}
  }
  function closeBook(){
    location.hash='#cover';
    location.reload();
  }

  function consume(){
    if(running||!document.body)return;running=true;
    const p=window.homoLector?.profile?.()||{};
    const bait=p.ranked?.[0]?(window.ENTRIES||[]).find(r=>r.id===p.ranked[0])?.name||'':'';
    const prev=record(),number=122+(prev?prev.count:0);
    let date='';try{date=new Date().toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'});}catch{}
    const lines=window.SLEEPER_STORY?.consumed||['Седьмой стежок натянулся.','В описи появилась ваша строка.'];
    const card='Homo lector. Наблюдение № '+number+' · '+date+(date.endsWith('.')?'':'.')+(bait?' Последний устойчивый образ: «'+bait+'».':'')+' Память удержана. Переплёт закрыть.';
    const veil=document.createElement('div');
    veil.className='consumed';veil.setAttribute('role','alertdialog');veil.setAttribute('aria-modal','true');veil.setAttribute('aria-labelledby','consumed-title');
    veil.innerHTML='<div class="consumed-inner"><h2 id="consumed-title" class="consumed-line">'+esc(lines[0])+'</h2><p class="consumed-line consumed-main">'+esc(lines[1])+'</p>'+
      '<p class="consumed-card">'+esc(card)+'<cite>неустановленный почерк · карточка наблюдения</cite></p><p class="consumed-close">Находки и заметки сохранятся. После открытия рассудок восстановится; подписи на полях изменятся.</p>'+
      '<button type="button" class="consumed-go">Закрыть книгу</button></div>';
    document.body.append(veil);
    let finished=false;
    const finish=()=>{if(finished)return;finished=true;window.bookConsumed=true;try{remember(localStorage,bait);recover(localStorage);}catch{}closeBook();};
    veil.querySelector('.consumed-go').addEventListener('click',finish);
    const g=window.gsap;
    if(!g||reduce.matches){veil.classList.add('static');veil.querySelector('.consumed-go').focus();return;}
    // Обложка, которая захлопнется над страницами: та же, что на заставке (с печатью), или простая кожаная.
    const pages=document.getElementById('pages')?.getBoundingClientRect();
    let shut=null,cover=null;
    if(pages&&pages.width>0){
      const narrow=innerWidth<=820,half=narrow?pages.width:pages.width/2;
      shut=document.createElement('div');shut.className='closing-cover';shut.setAttribute('aria-hidden','true');
      Object.assign(shut.style,{left:(narrow?pages.left:pages.left+pages.width/2)+'px',top:pages.top+'px',width:half+'px',height:pages.height+'px'});
      cover=document.createElement('div');cover.className='closing-cover-board';
      const front=document.querySelector('#closed-book .cb-front');
      const face=front?front.cloneNode(true):Object.assign(document.createElement('div'),{className:'cb-front closing-plain'});
      face.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));
      const back=document.createElement('div');back.className='cb-back closing-back';
      cover.append(face,back);shut.append(cover);document.body.append(shut);
    }
    const split=el=>{const t=el.childNodes[0].textContent;el.childNodes[0].replaceWith(...[...t].map(ch=>{const s=document.createElement('span');s.textContent=ch;return s;}));return [...el.querySelectorAll(':scope>span')];};
    const a=split(veil.querySelector('h2')),b=split(veil.querySelector('.consumed-main'));
    const tl=g.timeline({onComplete:finish});
    tl.fromTo(veil,{opacity:0},{opacity:1,duration:1.6,ease:'sine.in'})
      .from(a,{opacity:0,y:4,duration:.6,stagger:.045,ease:'sine.out'},'+=.2')
      .from(b,{opacity:0,y:8,duration:.8,stagger:.06,ease:'sine.out'},'+=.3')
      .from(veil.querySelector('.consumed-card'),{opacity:0,duration:1.3,ease:'sine.out'},'+=.5')
      .from(veil.querySelector('.consumed-close'),{opacity:0,duration:.9,ease:'sine.out'},'+=.8')
      .to(veil.querySelector('.consumed-inner'),{opacity:0,duration:1.1,ease:'sine.in'},'+=1');
    if(shut){
      // Из темноты проступает книга, и обложка захлопывается над страницами.
      tl.to(veil,{opacity:.62,duration:.9,ease:'sine.out'})
        .set(shut,{autoAlpha:1})
        .fromTo(cover,{rotationY:-178},{rotationY:0,duration:1.5,ease:'power2.inOut'},'+=.1')
        .to(shut,{scale:.985,duration:.12,yoyo:true,repeat:1,ease:'power1.inOut'})
        .set(document.body,{backgroundColor:'#000'})
        .to(document.documentElement,{opacity:0,duration:.8,ease:'sine.in'},'+=.35');
    }
  }

  function check(){
    const v=window.readerSanity?.current?.();
    if(v===0)consume();
  }
  addEventListener('sanitychange',e=>{if(e.detail?.value===0)consume();});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',check,{once:true});else check();
  window.bookConsumption=Object.freeze({consume,recover,record});
})();
