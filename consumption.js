'use strict';
/* Поглощение. Когда рассудок доходит до нуля, книга забирает читателя:
   экран заливает чернота, проступает сообщение и карточка образца Homo lector,
   затем все записи читателя стираются, и книга закрывается — открывается заново с обложки.
   Стираются только следы чтения (рассудок, найденные листы, заметки на полях, карточка, пятна).
   Настройки сайта и собственные иллюстрации пользователя остаются.
   В памяти книги остаётся одна строка: сколько читателей она уже поглотила и когда. */
(function(){
  const ERASE=['miskatonic.reader-sanity.v2','miskatonic.reader-sanity.v1','miskatonic.hidden-pages.v1','miskatonic.homo-lector.v1','miskatonic.anomalies.v1'];
  const ERASE_PREFIX=['miskatonic.fieldnote.v1.'];
  const RECORD='miskatonic.consumed.v1';
  const reduce=typeof matchMedia==='function'?matchMedia('(prefers-reduced-motion: reduce)'):{matches:false};
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let running=false;

  function record(){try{const r=JSON.parse(localStorage.getItem(RECORD)||'null');if(r&&Number.isInteger(r.count)&&r.count>0)return r;}catch{}return null;}
  // Стирает следы чтения; возвращает список удалённых ключей (для проверки).
  function erase(storage){
    const removed=[];
    try{
      for(const k of ERASE)if(storage.getItem(k)!==null){storage.removeItem(k);removed.push(k);}
      const keys=[];for(let i=0;i<storage.length;i++)keys.push(storage.key(i));
      for(const k of keys)if(k&&ERASE_PREFIX.some(p=>k.startsWith(p))){storage.removeItem(k);removed.push(k);}
    }catch{}
    return removed;
  }
  function remember(storage,bait){
    try{
      const prev=record()||{count:0};
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
    const lines=['Вы читали слишком долго.','Книга вас поглотила.'];
    const card='Homo lector. Образец № '+number+' получен '+date+(date.endsWith('.')?'':'.')+(bait?' Приманка: «'+bait+'».':'')+' Читатель израсходован.';
    const veil=document.createElement('div');
    veil.className='consumed';veil.setAttribute('role','alertdialog');veil.setAttribute('aria-modal','true');veil.setAttribute('aria-labelledby','consumed-title');
    veil.innerHTML='<div class="consumed-inner"><h2 id="consumed-title" class="consumed-line">'+esc(lines[0])+'</h2><p class="consumed-line consumed-main">'+esc(lines[1])+'</p>'+
      '<p class="consumed-card">'+esc(card)+'<cite>третий почерк · наклон старой прописи</cite></p><p class="consumed-close">Переплёт закрывается.</p>'+
      '<button type="button" class="consumed-go">Закрыть книгу</button></div>';
    document.body.append(veil);
    const finish=()=>{window.bookConsumed=true;remember(localStorage,bait);erase(localStorage);closeBook();};
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
  window.bookConsumption=Object.freeze({consume,erase,record,ERASE,ERASE_PREFIX});
})();
