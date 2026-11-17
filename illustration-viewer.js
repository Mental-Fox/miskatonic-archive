'use strict';
(function(){
  let dialog,image,viewport,range,status,trigger,scale=1,fitWidth=1,fitHeight=1,drag=null;
  const clamp=v=>Math.max(1,Math.min(4,v));
  function paint(){
    image.style.width=Math.round(fitWidth*scale)+'px';image.style.height=Math.round(fitHeight*scale)+'px';
    range.value=String(Math.round(scale*100));status.textContent=Math.round(scale*100)+'%';
    viewport.classList.toggle('can-pan',scale>1);
  }
  function fit(){
    if(!image?.naturalWidth)return;
    const factor=Math.min(Math.max(1,viewport.clientWidth-40)/image.naturalWidth,Math.max(1,viewport.clientHeight-40)/image.naturalHeight);
    fitWidth=image.naturalWidth*factor;fitHeight=image.naturalHeight*factor;paint();
  }
  function zoom(value){scale=clamp(value);paint();}
  function build(){
    dialog=document.createElement('dialog');dialog.className='illustration-viewer';
    dialog.setAttribute('aria-labelledby','inspection-title');
    dialog.innerHTML='<header><div><small>Архивная иллюстрация</small><h2 id="inspection-title"></h2></div><button type="button" data-inspection-close aria-label="Закрыть просмотр">Закрыть ×</button></header><div class="inspection-viewport" tabindex="0" aria-label="Изображение: прокрутите для просмотра увеличенных деталей"><div class="inspection-stage"></div></div><footer><button type="button" data-inspection-minus aria-label="Уменьшить">−</button><label>Масштаб <input type="range" min="100" max="400" step="10" value="100" aria-label="Масштаб иллюстрации"></label><button type="button" data-inspection-plus aria-label="Увеличить">+</button><output aria-live="polite">100%</output><button type="button" data-inspection-reset>Целиком</button><small>Увеличьте и перетаскивайте рисунок. Esc — закрыть.</small></footer>';
    document.body.append(dialog);viewport=dialog.querySelector('.inspection-viewport');
    range=dialog.querySelector('input');status=dialog.querySelector('output');
    range.addEventListener('input',()=>zoom(Number(range.value)/100));
    dialog.addEventListener('click',event=>{
      const button=event.target.closest('button');
      if(button?.hasAttribute('data-inspection-close'))dialog.close();
      if(button?.hasAttribute('data-inspection-plus'))zoom(scale+.25);
      if(button?.hasAttribute('data-inspection-minus'))zoom(scale-.25);
      if(button?.hasAttribute('data-inspection-reset')){zoom(1);viewport.scrollTo(0,0);}
      if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}
    });
    dialog.addEventListener('keydown',event=>{
      if(event.target===range)return;
      if(event.key==='+'||event.key==='='){event.preventDefault();zoom(scale+.25);}
      if(event.key==='-'){event.preventDefault();zoom(scale-.25);}
      if(event.key==='0'){event.preventDefault();zoom(1);viewport.scrollTo(0,0);}
    });
    viewport.addEventListener('pointerdown',event=>{
      if(event.pointerType!=='mouse'||event.button!==0||scale<=1)return;
      drag={x:event.clientX,y:event.clientY,left:viewport.scrollLeft,top:viewport.scrollTop};
      viewport.setPointerCapture(event.pointerId);viewport.classList.add('is-panning');event.preventDefault();
    });
    viewport.addEventListener('pointermove',event=>{
      if(drag){viewport.scrollLeft=drag.left+drag.x-event.clientX;viewport.scrollTop=drag.top+drag.y-event.clientY;}
    });
    const stop=()=>{drag=null;viewport.classList.remove('is-panning');};
    viewport.addEventListener('pointerup',stop);viewport.addEventListener('pointercancel',stop);
    dialog.addEventListener('close',()=>{
      stop();dialog.querySelector('.inspection-stage').replaceChildren();image=null;
      if(trigger?.isConnected)trigger.focus({preventScroll:true});
    });
    window.addEventListener('resize',()=>{if(dialog.open)fit();});
    window.addEventListener('hashchange',()=>{if(dialog.open)dialog.close();});
  }
  function open(id,source,button){
    const record=window.ENTRIES.find(r=>r.id===id);if(!record)return;
    if(!dialog)build();trigger=button||document.activeElement;scale=1;
    dialog.querySelector('#inspection-title').textContent=record.name;
    const stage=dialog.querySelector('.inspection-stage');
    // Use the already resolved image when available (including custom replacements).
    if(source){image=document.createElement('img');image.src=source.currentSrc||source.src;image.dataset.next=source.dataset.next||'';image.onerror=event=>plateFallback(event.currentTarget);stage.replaceChildren(image);}
    else {stage.innerHTML=plateImage(record);image=stage.querySelector('img');}
    image.alt='Иллюстрация — '+record.name;image.draggable=false;
    image.removeAttribute('class');image.style.width='1px';image.style.height='1px';
    image.addEventListener('load',fit);dialog.showModal();viewport.scrollTo(0,0);
    range.value='100';status.textContent='100%';viewport.classList.remove('can-pan');
    if(image.complete)fit();
  }
  window.illustrationViewer={open};
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-inspect-entry]');
    if(button)open(button.dataset.inspectEntry,null,button);
  });
})();
