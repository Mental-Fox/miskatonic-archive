'use strict';
/* «Пульс тома» — закладка над рассудком, которая показывает частоту кадров (FPS).
   Оформлена как часть книги: пульс ровный (50+), тревожный (30–49) или сбивается (<30).
   Это единственный постоянный цикл в проекте: requestAnimationFrame считает кадры, число обновляется дважды в секунду.
   Клик по закладке ставит замер на паузу и полностью останавливает цикл; выбор запоминается.
   Когда вкладка скрыта, браузер сам приостанавливает подсчёт. */
(function(){
  const KEY='miskatonic.fps.v1';
  let paused=false;try{paused=localStorage.getItem(KEY)==='off';}catch{}
  let el,num,frames=0,since=0,raf=0;
  const icon='<svg class="fps-beat" viewBox="0 0 28 16" aria-hidden="true"><path d="M1 9h6l2.5-6 4 12 3-9 2 3H27"/></svg>';
  function mood(fps){return fps>=50?'steady':fps>=30?'uneasy':'failing';}
  function tick(now){
    frames++;
    if(!since)since=now;
    const dt=now-since;
    if(dt>=500){
      const fps=Math.round(frames*1000/dt);frames=0;since=now;
      num.textContent=fps;el.dataset.mood=mood(fps);
      el.setAttribute('aria-label','Пульс тома: '+fps+' кадров в секунду');
    }
    raf=requestAnimationFrame(tick);
  }
  function start(){if(raf)return;frames=0;since=0;raf=requestAnimationFrame(tick);}
  function stop(){if(raf)cancelAnimationFrame(raf);raf=0;}
  function render(){
    el.classList.toggle('paused',paused);
    el.title=paused?'Пульс тома не измеряется. Нажмите, чтобы снова считать кадры в секунду.':'Пульс тома — кадров в секунду. Нажмите, чтобы остановить замер.';
    if(paused){stop();num.textContent='—';el.dataset.mood='paused';el.setAttribute('aria-label','Пульс тома: замер остановлен');}
    else start();
  }
  function mount(){
    const sanity=document.getElementById('reader-sanity');if(!sanity||el)return;
    el=document.createElement('button');el.type='button';el.className='reader-fps';
    el.innerHTML=icon+'<span class="fps-label">Пульс</span><strong class="fps-value">—</strong><small class="fps-unit">кадр/с</small>';
    num=el.querySelector('.fps-value');
    sanity.parentNode.insertBefore(el,sanity);
    el.addEventListener('click',()=>{paused=!paused;try{localStorage.setItem(KEY,paused?'off':'on');}catch{}render();});
    render();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
  window.fpsPulse=Object.freeze({pause(){if(!paused&&el)el.click();},resume(){if(paused&&el)el.click();},get running(){return !!raf;}});
})();
