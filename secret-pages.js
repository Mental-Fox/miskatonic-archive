'use strict';
/* Авторская история проекта, не литературный канон Мифов. */
(function(){
  const key='miskatonic.hidden-pages.v1';
  const leaves=[
    {id:'salt',entry:'cthulhu',number:'113а',title:'Лист с соляным следом',next:'deep-ones',
      clue:'У корешка белеет полоска бумаги. На ней: «Не сверять с оглавлением».',
      scholar:'Соляной ободок заходит на внутренний сгиб. Он появился после переплёта. Проверить происхождение бумаги.',
      witness:'В комнате не было воды. Посмотрите запись о Глубоководных — там я ещё доверял измерениям.',
      heading:'Запись о сухом приливе',
      paragraphs:['14 октября. В читальном зале обнаружен лист, отсутствующий в описи. Бумага сухая, однако на столе под ней остаётся влажный прямоугольник. После удаления листа след исчезает.',
        'Доктор Вельт велел пометить повреждение как следствие сырости. Я обвела пятно карандашом. К утру линия оказалась на обороте бумаги, хотя я не переворачивала лист.',
        'Край пахнет солью. В каталоге морских существ я оставила вторую запись. Если её найдут, пусть проверят не рисунок, а расстояние между следами.'],
      reply:'Влажность воздуха — 41 процент. Объяснение сыростью отзываю.',
      answer:'Я сохранила ваш первый вывод. Пусть следующий читатель увидит, как легко мы согласились.'},
    {id:'footprints',entry:'deep-ones',number:'113б',title:'Лист с двумя рядами следов',next:'necronomicon',
      clue:'Между листами вложен протокол с двумя карандашными чертами и номером «113б».',
      scholar:'Расстояние между отпечатками одинаково. Либо свидетель ошибся, либо один и тот же след перенесли несколько раз.',
      witness:'Я измерила их вашей линейкой. Следы шли из закрытой книги. Последний был на столе. Ищите вклейку у «Некрономикона».',
      heading:'Протокол измерения № 6',
      paragraphs:['16 октября. На полях появились два ряда отпечатков. Левый ряд принадлежит босой человеческой стопе. В правом различимы три длинных пальца. Длина шага у обоих рядов — ровно семнадцать сантиметров.',
        'При закрытии книги оба ряда совпадают. Следы находятся на разных листах, но под увеличением виден единый нажим. Будто кто-то прошёл по бумаге, когда она ещё не была разделена на страницы.',
        'Вельт предложил изъять вклейки. Я нашла в переплёте старую расписку: три листа уже вынимали. Завтра сверю её с записью о «Некрономиконе».'],
      reply:'Семнадцать сантиметров — ширина внутренней части переплёта. Следы измеряли не шаг.',
      answer:'Тогда что именно пыталось определить ширину выхода?'},
    {id:'binding',entry:'necronomicon',number:'113в',title:'Расписка переплётчика',next:null,
      clue:'Под описанием книги проступает расписка. В уголке выведено: «Третий лист не вынимать».',
      scholar:'Следует различать свидетельство и толкование. Мы видели следы на бумаге. О существе за бумагой у нас нет данных.',
      witness:'Вы правы. Мы всё время искали того, кто оставил пометки. Но пометки оставляли мы.',
      heading:'Расписка без имени заказчика',
      paragraphs:['Принято в переплёт: один том, три ненумерованных листа. Изъять листы невозможно: после удаления в томе обнаруживаются новые, с теми же повреждениями.',
        'Заказчик просит считать пометки двух владельцев частью переплёта. Первый почерк — доктора Артура Вельта. Второй — архивистки Марты Рейн. Оба имени присутствуют в описи, составленной за сорок лет до их рождения.',
        'На обороте рукой Марты приписано: «Если вы нашли все три листа, оставьте книгу открытой. Не ради нас. Чтобы следующий читатель не начал с темноты».'],
      reply:'В опись внесён третий читатель. Имя не указано. Время поступления совпадает с открытием этого листа.',
      answer:'Не ищите своё имя. Пока вы читаете, последняя строка остаётся пустой.'}
  ];
  const notes=window.ARCHIVE_OWNER_NOTES||{};
  const arcs=window.ARCHIVE_SECRET_ARCS||[{id:'tide',title:'Сухой прилив',start:'cthulhu',hint:'Начните с пометки у Ктулху.',ending:'Три вклейки снова собраны. Но последняя строка всё ещё пуста.'}];
  leaves.forEach(leaf=>leaf.arc='tide');
  leaves.push(...(window.ARCHIVE_EXTRA_LEAVES||[]));
  leaves.push(...(window.ARCHIVE_SINGLE_LEAVES||[]));
  leaves.push(...(window.ARCHIVE_CATALOG_LEAVES||[]));
  const found=new Set();let storageOK=true;
  try{
    const saved=JSON.parse(localStorage.getItem(key)||'[]');
    if(Array.isArray(saved))for(const id of saved)if(leaves.some(l=>l.id===id))found.add(id);
  }catch{storageOK=false;}
  const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const available=leaf=>{
    if(leaf.standalone)return true;
    const chain=leaves.filter(l=>l.arc===leaf.arc),i=chain.indexOf(leaf);
    return i===0||found.has(chain[i-1].id)||found.has(leaf.id);
  };
  function save(){try{localStorage.setItem(key,JSON.stringify([...found]));storageOK=true;}catch{storageOK=false;}}
  function handwriting(scholar,witness){
    return '<div class="owner-marginalia"><span class="folio-kicker">На полях · два почерка</span><p class="owner-scholar">'+esc(scholar)+'<cite>Доктор Артур Вельт · каталогизатор</cite></p><p class="owner-witness">'+esc(witness)+'<cite>Марта Рейн · архивистка</cite></p></div>';
  }
  function ledger(){
    return '<aside class="owner-ledger"><span class="folio-kicker">Следы прежних владельцев</span><h3>Листы вне описи</h3><p>Пометки доктора Артура Вельта и архивистки Марты Рейн встречаются во всех разделах каталога: у существ и богов, мест, реликвий и книг. Нажмите на большую иллюстрацию записи, чтобы открыть её тайный лист.</p><p>Найдено листов: '+found.size+' из '+leaves.length+'. Открытые вклейки можно перечитать.</p><div class="owner-arcs">'+arcs.map(arc=>{
      const chain=leaves.filter(l=>l.arc===arc.id),count=chain.filter(l=>found.has(l.id)).length;
      const start=window.ENTRIES.find(r=>r.id===arc.start);
      return '<section class="owner-arc"><h4>'+esc(arc.title)+' <span>'+count+' / '+chain.length+'</span></h4><p>'+esc(arc.hint)+'</p><a class="ink-link" href="#entry/'+arc.start+'">Начать: '+esc(start?.name||arc.start)+' →</a><nav aria-label="Найденные листы: '+esc(arc.title)+'">'+chain.filter(l=>found.has(l.id)).map(l=>'<a href="#secret/'+l.id+'">'+l.number+' · '+esc(l.title)+'</a>').join('')+'</nav></section>';
    }).join('')+'</div><small>Авторские истории проекта; не литературный канон Мифов. Прогресс хранится в этом браузере.</small></aside>';
  }
  function decorate(root,hash){
    if(hash==='#contents'){
      const paths=root.querySelector('.reading-paths');
      if(paths)paths.insertAdjacentHTML('afterend',ledger());
      else root.querySelector('.book-page')?.insertAdjacentHTML('beforeend',ledger());
      return;
    }
  }

  function open(id){
    const leaf=leaves.find(l=>l.id===id);
    if(!leaf||!available(leaf)){
      openFolio('<div class="open-book secret-book"><section class="book-page verso"><span class="folio-kicker">Лист вне описи</span><h2>Здесь пока нет вклейки</h2><p>Сначала найдите предыдущую вклейку этой истории. В описи справа указаны начала сюжетных следов и найденные личные дела существ.</p><a class="ink-link" href="#contents">К описи найденных листов →</a></section><section class="book-page recto">'+ledger()+'</section></div>','spread-mode secret-mode');
      return;
    }
    found.add(leaf.id);save();
    const record=window.ENTRIES.find(r=>r.id===leaf.entry);
    const next=leaf.next&&window.ENTRIES.find(r=>r.id===leaf.next);
    const chain=leaves.filter(l=>l.arc===leaf.arc),arc=arcs.find(a=>a.id===leaf.arc);
    const note=notes[leaf.entry]||{scholar:leaf.reply,witness:leaf.answer};
    const postscript=(note.scholar!==leaf.reply||note.witness!==leaf.answer)?'<details class="secret-postscript"><summary>Поздняя приписка</summary>'+handwriting(leaf.reply,leaf.answer)+'</details>':'';
    openFolio(window.secretOrnaments.wrap(leaf,'<div class="open-book secret-book"><section class="book-page verso"><span class="folio-kicker">Вклейка '+leaf.number+' · частный архив</span><h2>'+esc(leaf.heading)+'</h2><div class="secret-transcript">'+leaf.paragraphs.map(p=>'<p>'+esc(p)+'</p>').join('')+'</div><p class="secret-disclaimer">Авторская история проекта. Эти документы и их владельцы вымышлены.</p><div class="folio-page">'+leaf.number+'</div></section><section class="book-page recto"><span class="folio-kicker">Два прежних владельца</span><h3>Прочитано до вас</h3>'+handwriting(note.scholar,note.witness)+postscript+'<p class="secret-progress" role="status">Найдено '+found.size+' из '+leaves.length+' вклеек. История «'+esc(arc.title)+'»: '+chain.filter(l=>found.has(l.id)).length+' из '+chain.length+'.'+(storageOK?'':' Хранилище недоступно: находки сохранятся только до закрытия страницы.')+'</p><button type="button" class="secret-inspect" data-inspect-entry="'+esc(leaf.entry)+'" aria-haspopup="dialog">Рассмотреть: '+esc(record?.name||'иллюстрацию')+'</button><nav class="secret-links" aria-label="Продолжить исследование">'+(next?'<a class="secret-tab" href="#entry/'+next.id+'">По следу пометки: '+esc(next.name)+' →</a>':'<p class="secret-ending">'+esc(arc.ending)+'</p>')+'<a href="#entry/'+leaf.entry+'">← Вернуться: '+esc(record?.name||'запись каталога')+'</a><a href="#contents">Найденные листы в оглавлении</a></nav><div class="folio-page">'+leaf.number+' · оборот</div></section></div>'),'spread-mode secret-mode');
  }
  window.archiveSecrets={decorate,open,
    link(entry){const leaf=leaves.find(l=>l.entry===entry);return leaf?'#secret/'+leaf.id:'';},
    anchor(id){return '#entry/'+(leaves.find(l=>l.id===id)?.entry||'cthulhu');},
    onward(id){const leaf=leaves.find(l=>l.id===id);return leaf&&found.has(leaf.id)&&leaf.next?'#entry/'+leaf.next:'#contents';}
  };
})();
