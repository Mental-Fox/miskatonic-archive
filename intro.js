'use strict';
/* Плавное объёмное покачивание: отдельные оси, реакция на курсор и свет. */
(function(){
  const intro=document.getElementById('intro'),cb=document.getElementById('closed-book');
  if(!intro||!cb)return;
  const h=location.hash,reduced=matchMedia('(prefers-reduced-motion: reduce)');
  if(h&&h!=='#cover'&&h!=='#')return;
  const motionButton=document.getElementById('intro-animation-toggle');
  const motionKey='miskatonic-intro-animation';
  let userPaused=false;
  try{userPaused=localStorage.getItem(motionKey)==='off';}catch{}
  const motionPaused=()=>userPaused||reduced.matches;
  const main=document.querySelector('main.desk');
  const front=cb.querySelector('.cb-front');
  const seal=cb.querySelector('.cb-seal');
  const gaze=seal?.querySelector('.cb-gaze');
  const skinDisplacement=cb.querySelector('#book-skin-motion feDisplacementMap');
  const drawTentacles=window.bookTentacles?.mount(cb.querySelector('.cb-vector-tendrils'));
  const drawTouchingTentacles=window.bookTentacles?.mount(cb.querySelector('.cb-vector-touch'));
  const drawTouchingRoots=window.bookTentacles?.mount(cb.querySelector('.cb-vector-touch-roots'));
  function syncBookArt(){
    const path='art/intro-vector-preview.svg';
    cb.classList.toggle('has-custom-art',!!window.bookImages?.get('intro-book') || (window.bookImages?.resolve(path)||path)!==path);
  }
  syncBookArt();
  window.addEventListener('bookimageschange',syncBookArt);
  const dust=document.getElementById('dust'),timers=[];
  let opened=false,frame=0,last=0,elapsed=0,px=0,py=0,rx=8,ry=-7,rz=-3,bob=0,attention=0,nearness=0,wake=0;
  let hasPointer=false,eyeX=0,eyeY=0,gazeX=0,gazeY=0,pullX=0,pullY=0,seekX=0,seekY=0,lastPointer=-10;
  let restingBook={x:innerWidth/2,y:innerHeight*.47,w:0,h:0};
  let lastDetails=-Infinity,lastArms=-Infinity,armsAtRest=false;
  const idleLooks=[[-1,-.25],[1,.15],[.3,.9],[-.65,-.8],[0,0]];
  function moveArms(amount=reduced.matches?0:wake*1.45){
    if(armsAtRest&&amount<=.005)return;
    cb.style.setProperty('--feeler-upper',(Math.sin(elapsed*1.35)*2.2*amount).toFixed(3)+'deg');
    cb.style.setProperty('--feeler-lower',(Math.sin(elapsed*1.05+2)*2.7*amount).toFixed(3)+'deg');
    cb.style.setProperty('--feeler-bottom',(Math.sin(elapsed*1.2+4)*1.8*amount).toFixed(3)+'deg');
    if(drawTentacles)drawTentacles(elapsed,amount,px);
    if(drawTouchingTentacles)drawTouchingTentacles(elapsed,amount,px);
    if(drawTouchingRoots)drawTouchingRoots(elapsed,amount,px);
    armsAtRest=amount<=.005;
  }
  document.body.classList.add('intro-on');intro.hidden=false;if(main)main.inert=true;
  if(!reduced.matches)for(let i=0;i<16;i++){
    const d=document.createElement('i');
    d.style.cssText='left:'+Math.random()*100+'%;top:'+Math.random()*100+'%;--s:'+(1+Math.random()*2)+'px;--d:'+(12+Math.random()*10)+'s;--delay:-'+Math.random()*15+'s;--x:'+(Math.random()*60-30)+'px';dust.append(d);
  }
  function place(){
    let t;
    if(opened){
      const r=document.getElementById('pages').getBoundingClientRect();
      t=innerWidth<=820?{l:r.left,t:r.top,w:r.width,h:r.height}:{l:r.left+r.width/2,t:r.top,w:r.width/2,h:r.height};
    }else{
      const w=Math.min(innerWidth*.55,innerHeight*.44,450),height=w*1.38;
      t={l:(innerWidth-w)/2,t:innerHeight*.47-height/2,w,h:height};
      restingBook={x:innerWidth/2,y:innerHeight*.47,w,h:height};
    }
    Object.assign(cb.style,{left:t.l+'px',top:t.t+'px',width:t.w+'px',height:t.h+'px'});
  }
  function paint(){
    cb.style.setProperty('--rx',rx.toFixed(3)+'deg');
    cb.style.setProperty('--ry',ry.toFixed(3)+'deg');
    cb.style.setProperty('--rz',rz.toFixed(3)+'deg');
    cb.style.setProperty('--float',bob.toFixed(3)+'px');
    cb.style.setProperty('--attract-x',pullX.toFixed(3)+'px');
    cb.style.setProperty('--attract-y',pullY.toFixed(3)+'px');
    front.style.setProperty('--shine-x',(50+ry*1.2).toFixed(1)+'%');
    front.style.setProperty('--shine-y',(35-rx).toFixed(1)+'%');
  }
  function paintLife(){
    const breath=(Math.sin(elapsed*1.12)+1)/2;
    const heartbeat=Math.pow(Math.max(0,Math.sin(elapsed*2.3)),7);
    cb.style.setProperty('--breath-open',(-.08-breath*(.15+attention*.08+wake*.4)).toFixed(3)+'deg');
    cb.style.setProperty('--breath-depth',(breath*(.8+attention*.6)).toFixed(3)+'px');
    cb.style.setProperty('--skin-stretch',(1+breath*.0025).toFixed(5));
    cb.style.setProperty('--page-shift',((Math.sin(elapsed*2.1)*.025+heartbeat*.035)*(1+attention)).toFixed(4)+'px');
    cb.style.setProperty('--clasp-turn',(heartbeat*(.25+attention*.35)).toFixed(3)+'deg');
    if(gaze)gaze.setAttribute('transform','translate('+(gazeX*4.5).toFixed(3)+' '+(gazeY*2).toFixed(3)+')');
    cb.style.setProperty('--iris-light',(.35+breath*.2+heartbeat*.2+attention*.2).toFixed(3));
    cb.style.setProperty('--seam-light',(.7+breath*.2+heartbeat*.1+wake*.16).toFixed(3));
    cb.style.setProperty('--wake-lift',(-wake*(1+breath*.5)).toFixed(3)+'px');
    cb.style.setProperty('--leaf-flutter',(wake*(Math.sin(elapsed*2.1)*.4+heartbeat*.25)).toFixed(3)+'deg');
    cb.style.setProperty('--inner-pulse',(.55+breath*.16+heartbeat*.07).toFixed(3));
    // Металл остаётся жёстким; кожа под ним деформируется отдельно.
    const twitch=Math.sin(elapsed*17)*Math.pow(Math.max(0,Math.sin(elapsed*3.1)),9);
    cb.style.setProperty('--book-wake',wake.toFixed(4));
    cb.style.setProperty('--medal-x',(wake*(Math.sin(elapsed*2.8)*.25+twitch*.4)).toFixed(3)+'px');
    cb.style.setProperty('--medal-y',(wake*(Math.sin(elapsed*3.7)*.3+heartbeat*.35)).toFixed(3)+'px');
    cb.style.setProperty('--medal-turn',(wake*(Math.sin(elapsed*2.2)*.15+twitch*.2)).toFixed(3)+'deg');
    cb.style.setProperty('--skin-x',(wake*(Math.sin(elapsed*2.4)*.7+twitch*.8)).toFixed(3)+'px');
    cb.style.setProperty('--skin-y',(wake*(Math.sin(elapsed*1.9)*.6+heartbeat*.8)).toFixed(3)+'px');
  }
  function animate(now){
    if(opened||intro.hidden||motionPaused()||document.hidden){frame=0;return;}
    const dt=last?Math.min((now-last)/1000,.05):0;last=now;elapsed+=dt;
    const blend=1-Math.exp(-dt*4.5);
    attention+=(nearness-attention)*blend;
    wake+=((pointerOver||focusOver?1:0)-wake)*blend;
    const idle=idleLooks[Math.floor(elapsed/2.6)%idleLooks.length];
    const tracking=hasPointer&&(nearness>.1||elapsed-lastPointer<3)?1:0;
    const lookBlend=1-Math.exp(-dt*(tracking?10:5.5));
    gazeX+=((idle[0]*(1-tracking)+eyeX*tracking)-gazeX)*lookBlend;
    gazeY+=((idle[1]*(1-tracking)+eyeY*tracking)-gazeY)*lookBlend;
    pullX+=(seekX*attention*4-pullX)*blend;
    pullY+=(seekY*attention*3-pullY)*blend;
    const tx=8+Math.sin(elapsed*.65)*2-py*5;
    const ty=-7+Math.sin(elapsed*.48)*6+px*9;
    const tz=-3+Math.sin(elapsed*.4)+px*1.5;
    rx+=(tx-rx)*blend;ry+=(ty-ry)*blend;rz+=(tz-rz)*blend;
    bob=Math.sin(elapsed*.8)*2.5+Math.sin(elapsed*1.12)*attention*.4;
    paint();
    if(now-lastDetails>=1000/30){paintLife();lastDetails=now;}
    if(now-lastArms>=1000/(wake>.01?24:16)){moveArms();lastArms=now;}
    frame=requestAnimationFrame(animate);
  }
  function resume(){last=0;if(!frame&&!opened&&!motionPaused()&&!document.hidden)frame=requestAnimationFrame(animate);}
  function stop(){cancelAnimationFrame(frame);frame=0;last=0;}
  function onMove(e){
    if(opened||motionPaused()||e.pointerType==='touch')return;
    px=Math.max(-1,Math.min(1,(e.clientX-innerWidth/2)/(innerWidth*.35)));
    py=Math.max(-1,Math.min(1,(e.clientY-innerHeight*.47)/(innerHeight*.4)));
    hasPointer=true;lastPointer=elapsed;
    const range=Math.max(100,Math.min(innerWidth*.2,220));
    const dx=e.clientX-restingBook.x,dy=e.clientY-restingBook.y;
    const outside=Math.hypot(Math.max(0,Math.abs(dx)-restingBook.w*.5),Math.max(0,Math.abs(dy)-restingBook.h*.5));
    nearness=Math.max(0,1-outside/range);
    seekX=Math.max(-1,Math.min(1,dx/(restingBook.w*.5+range*.5)));
    seekY=Math.max(-1,Math.min(1,dy/(restingBook.h*.5+range*.5)));
    if(seal){
      eyeX=Math.max(-1,Math.min(1,dx/Math.max(restingBook.w*.55,45)));
      eyeY=Math.max(-1,Math.min(1,dy/Math.max(restingBook.h*.4,45)));
    }
  }
  function onLeave(){px=0;py=0;nearness=0;hasPointer=false;seekX=0;seekY=0;}
  function onVisibility(){if(document.hidden)stop();else resume();}
  function onReduced(){
    stop();
    const paused=motionPaused();
    intro.classList.toggle('motion-paused',paused);
    if(motionButton){
      motionButton.textContent=reduced.matches?'Анимация отключена':paused?'Включить анимацию':'Отключить анимацию';
      motionButton.disabled=reduced.matches;
      motionButton.setAttribute('aria-pressed',String(paused));
      motionButton.title=reduced.matches?'В настройках устройства включено уменьшение движения':'Анимация стартового экрана';
    }
    intro.querySelectorAll('svg').forEach(svg=>{if(paused)svg.pauseAnimations?.();else svg.unpauseAnimations?.();});
    if(paused){
      rx=8;ry=-7;rz=-3;bob=0;pullX=0;pullY=0;gazeX=0;gazeY=0;px=0;py=0;attention=0;
      if(gaze)gaze.setAttribute('transform','translate(0 0)');
      ['--breath-open','--breath-depth','--skin-stretch','--page-shift','--clasp-turn','--iris-x','--iris-y','--iris-light','--seam-light','--wake-lift'].forEach(k=>cb.style.removeProperty(k));
      ['--book-wake','--medal-x','--medal-y','--medal-turn','--skin-x','--skin-y','--leaf-flutter','--inner-pulse'].forEach(k=>cb.style.removeProperty(k));
      wake=1;paint();paintLife();
      if(skinDisplacement)skinDisplacement.setAttribute('scale','0');
      moveArms(1.45);
      intro.style.removeProperty('--life-pulse');if(opened)finish();
    }
    else{wake=0;armsAtRest=false;moveArms(0);updatePeek();resume();}
  }
  function open(){
    if(opened)return;opened=true;stop();cb.classList.remove('hover','peek');place();intro.classList.add('lift');
    if(motionPaused()){finish();return;}
    timers.push(setTimeout(()=>{document.body.classList.add('intro-opening');intro.classList.add('opening');},950));
    timers.push(setTimeout(finish,2200));
  }
  function finish(){
    timers.forEach(clearTimeout);opened=true;stop();cb.classList.remove('hover','peek');intro.hidden=true;removeEventListener('resize',place);
    document.body.classList.remove('intro-on','intro-opening');document.body.classList.add('intro-done');
    if(main)main.inert=false;
    document.removeEventListener('keydown',onKey,true);removeEventListener('hashchange',onRoute);
    document.removeEventListener('visibilitychange',onVisibility);reduced.removeEventListener('change',onReduced);
    intro.removeEventListener('pointermove',onMove);intro.removeEventListener('pointerleave',onLeave);
    window.removeEventListener('bookimageschange',syncBookArt);
    document.querySelector('.title-page .open-btn')?.focus({preventScroll:true});
  }
  function onKey(e){
    if(intro.hidden)return;
    if(e.key==='Tab'){
      e.preventDefault();
      const next=document.activeElement===cb&&motionButton&&!motionButton.disabled?motionButton:cb;
      next.focus({preventScroll:true});return;
    }
    if(e.target===motionButton&&e.key!=='Escape')return;
    if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();finish();}
    else if(e.key==='ArrowRight'){e.preventDefault();e.stopImmediatePropagation();open();}
    else if(['ArrowLeft','PageDown','PageUp','Home','/'].includes(e.key))e.stopImmediatePropagation();
  }
  function onRoute(){if(!intro.hidden)finish();}
  let pointerOver=false,focusOver=false;
  function updatePeek(){
    cb.classList.toggle('hover',pointerOver&&!opened);
    cb.classList.toggle('peek',(pointerOver||focusOver)&&!opened);
    intro.classList.toggle('ritual-awake',(pointerOver||focusOver)&&!opened);
  }
  cb.addEventListener('mouseenter',()=>{pointerOver=true;updatePeek();});
  cb.addEventListener('mouseleave',()=>{pointerOver=false;updatePeek();});
  cb.addEventListener('focus',()=>{focusOver=true;updatePeek();});
  cb.addEventListener('blur',()=>{focusOver=false;updatePeek();});
  cb.addEventListener('click',open);
  cb.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});
  motionButton?.addEventListener('click',()=>{
    userPaused=!userPaused;
    try{localStorage.setItem(motionKey,userPaused?'off':'on');}catch{}
    onReduced();
  });
  intro.addEventListener('pointermove',onMove,{passive:true});intro.addEventListener('pointerleave',onLeave);
  document.addEventListener('visibilitychange',onVisibility);reduced.addEventListener('change',onReduced);
  addEventListener('resize',place);addEventListener('hashchange',onRoute);document.addEventListener('keydown',onKey,true);
  place();paint();moveArms(0);onReduced();
  const verso=document.getElementById('folio').querySelector('.book-page.verso');
  if(verso&&innerWidth>820)cb.querySelector('.cb-back').append(verso.cloneNode(true));
})();
