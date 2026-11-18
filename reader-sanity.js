'use strict';
(function(){
  let storage=null;try{storage=localStorage;}catch{}
  const model=window.createSanityModel({records:window.ENTRIES||[],leaves:window.archiveSecrets?.materials()||[],extra:window.sleeper?.materials?.()||[],storage});
  const contents=new Map(),labels={clear:'Ясность',anxious:'Тревога',haunted:'Наваждение',limit:'Предел'};
  const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const widget=document.getElementById('reader-sanity'),number=document.getElementById('reader-sanity-number'),meter=document.getElementById('reader-sanity-meter');
  function paint(){
    const state=model.snapshot();
    if(number)number.textContent=state.value+' / 100';
    if(meter)meter.value=state.value;
    if(widget){widget.setAttribute('aria-label','Рассудок читателя: '+state.value+' из 100');widget.dataset.stage=state.stage;widget.title='Рассудок · '+labels[state.stage];}
  }
  function has(key){return model.quote(key).opened;}
  function wrap(key,html,title){
    const q=model.quote(key);
    if(!q.known||q.opened)return html;
    contents.set(key,{html,title});
    const reason=q.reason==='parent'?'Сначала откройте сам тайный лист.':!q.canOpen?'Рассудок исчерпан. Отдохните в читальном зале.':'Плата один раз. Повторное чтение бесплатно.';
    return '<div class="sanity-lock" data-sanity-gate="'+esc(key)+'"><div class="sanity-lock-preview" aria-hidden="true" inert>'+html+'</div><div class="sanity-lock-overlay"><strong>'+esc(title||q.title)+'</strong><button type="button" data-sanity-unlock="'+esc(key)+'" '+(!q.canOpen?'disabled':'')+'>Открыть · −'+q.cost+' рассудка</button><small>'+reason+'</small><a href="#reading-room">В читальный зал</a></div></div>';
  }
  function refreshGates(){
    document.querySelectorAll('[data-sanity-gate]').forEach(gate=>{
      const key=gate.dataset.sanityGate,entry=contents.get(key);
      if(entry)gate.outerHTML=wrap(key,entry.html,entry.title);
    });
  }
  function notify(){window.dispatchEvent(new Event('sanityunlock'));}
  // Любое изменение рассудка (оплата, отдых, другая вкладка): для атмосферы и поглощения.
  function changed(){const e=new Event('sanitychange');e.detail={value:model.snapshot().value};window.dispatchEvent(e);}
  function openRoom(){
    const s=model.snapshot();
    openFolio('<div class="open-book sanity-room"><section class="book-page verso"><span class="folio-kicker">Читальный зал Мискатоника</span><h2>Вернуться к свету</h2><p class="sanity-room-lead">Вы откладываете чужие записи, закрываете переплёт и возвращаетесь к знакомым звукам читального зала.</p><p>Найденные вклейки и открытые материалы сохранятся. Перечитать их можно без новой платы.</p><button type="button" class="sanity-rest" data-sanity-rest '+(s.value===100?'disabled':'')+'>Закончить исследование · восстановить до 100</button><a class="ink-link" href="#contents">Вернуться к оглавлению →</a><div class="folio-page">Читальный зал</div></section><section class="book-page recto"><span class="folio-kicker">Состояние читателя</span><h3>'+labels[s.stage]+'</h3><p class="sanity-room-value">'+s.value+' <small>/ 100</small></p><p>Полевые карточки и отдельные тайные листы: <b>2</b> рассудка.<br>Вклейки сыщиков: <b>4</b>.<br>Опасные приписки: <b>6</b>.<br>Правда о каноне («приснилось иначе»): <b>1</b>.</p><p>На нуле лампа гаснет, и Ш’Ннар просыпается внутри читателя. Книга закроется; после открытия рассудок вернётся, а находки и заметки останутся. Руны имени книга не забывает.</p><p>Ничего не списывается за ожидание, перелистывание или просмотр иллюстраций. Цена видна на кнопке открытия.</p>'+(!s.persistent?'<p role="status">Хранилище браузера недоступно. Состояние сохранится только до закрытия страницы.</p>':'')+'<div class="folio-page">Рассудок</div></section></div>','spread-mode sanity-room-mode');
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-sanity-unlock],[data-sanity-rest]');if(!button)return;
    event.preventDefault();
    if(button.hasAttribute('data-sanity-rest')){model.rest(window.sleeper?.strike?.()??100);paint();changed();notify();return;}
    const key=button.dataset.sanityUnlock,result=model.unlock(key);
    paint();
    if(result.ok&&result.charged)changed();
    if(!result.ok){refreshGates();return;}
    if(key.startsWith('leaf:')||key.startsWith('postscript:')){notify();return;}
    const gate=button.closest('[data-sanity-gate]'),entry=contents.get(key);
    if(gate&&entry)gate.outerHTML=entry.html;
    refreshGates();
  });
  window.addEventListener('storage',event=>{
    if(event.key==='miskatonic.reader-sanity.v2'){model.refresh();paint();changed();notify();}
  });
  const book=document.getElementById('book'),header=document.querySelector('.book-head');
  if(widget&&book&&header&&typeof matchMedia==='function'){
    const compact=matchMedia('(max-width:820px)');
    const place=()=>{if(compact.matches)header.append(widget);else book.append(widget);};
    place();compact.addEventListener('change',place);
  }
  paint();
  function spend(n){const c=model.spend(n);paint();if(c)changed();return c;}
  window.readerSanity=Object.freeze({current:()=>model.snapshot().value,has,wrap,openRoom,spend});
})();
