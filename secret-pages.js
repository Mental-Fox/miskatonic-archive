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
        'Вельт велел зафиксировать сырость как улику по делу об исчезновении Элиаса. Я обвела пятно карандашом. К утру линия оказалась на обороте бумаги, хотя я не переворачивала лист.',
        'Край пахнет солью. В каталоге морских существ я оставила вторую запись. Если её найдут, пусть проверят не рисунок, а расстояние между следами.'],
      reply:'Влажность воздуха — 41 процент. Том сам производит воду. Он пробует вынести вещество за границы страницы.',
      answer:'Я сохранила ваш первый вывод. Пусть следующий сыщик увидит, как охотно книга принимает удобное объяснение.'},
    {id:'footprints',entry:'deep-ones',number:'113б',title:'Лист с двумя рядами следов',next:'necronomicon',
      clue:'Между листами вложен протокол с двумя карандашными чертами и номером «113б».',
      scholar:'Расстояние между отпечатками одинаково. Либо свидетель ошибся, либо один и тот же след перенесли несколько раз.',
      witness:'Я измерила их вашей линейкой. Следы шли из закрытой книги. Последний был на столе. Ищите вклейку у «Некрономикона».',
      heading:'Протокол измерения № 6',
      paragraphs:['16 октября. На полях появились два ряда отпечатков. Левый ряд принадлежит босой человеческой стопе. В правом различимы три длинных пальца. Длина шага у обоих рядов — ровно семнадцать сантиметров.',
        'При закрытии книги оба ряда совпадают. Следы находятся на разных листах, но под увеличением виден единый нажим. Будто кто-то прошёл по бумаге, когда она ещё не была разделена на страницы.',
        'Вельт предложил изъять вклейки. Я нашла в переплёте старую расписку: три листа уже вынимали. Завтра сверю её с записью о «Некрономиконе».'],
      reply:'Семнадцать сантиметров — ширина внутренней части переплёта. Книга измеряет выход для тела, которого у неё пока нет.',
      answer:'Последний след лежит на столе. Значит, ей уже удалось вынести наружу часть себя.'},
    {id:'binding',entry:'necronomicon',number:'113в',title:'Расписка переплётчика',next:null,
      clue:'Под описанием книги проступает расписка. В уголке выведено: «Третий лист не вынимать».',
      scholar:'Следует различать свидетельство и толкование. Мы видели следы на бумаге. О существе за бумагой у нас нет данных.',
      witness:'Вы правы. Мы всё время искали того, кто оставил пометки. Но пометки оставляли мы.',
      heading:'Расписка без имени заказчика',
      paragraphs:['Принято в переплёт: один том, три ненумерованных листа. Изъять листы невозможно: после удаления в томе обнаруживаются новые, с теми же повреждениями.',
        'Заказчик просит считать показания двух сыщиков частью переплёта. Первый почерк — Артура Вельта, бывшего инспектора. Второй — частной сыщицы Марты Рейн. Оба имени присутствуют в описи, составленной за сорок лет до их рождения. В графе заказчика стоит: «Сам том».',
        'На обороте рукой Марты приписано: «Книга жива. Она вернула в переплёт все изъятые листы и запомнила руки Элиаса. Теперь она знает наши. Не подписывайте расписку и не выполняйте просьбы, которые выдаются за подсказки».'],
      reply:'В опись внесён третий читатель. Имя не указано. Книга оставила в плане место человеку, который завершит её выход.',
      answer:'Не ищите своё имя. Если книга назовёт вас сама, не отвечайте.'}
  ];
  const notes=window.ARCHIVE_OWNER_NOTES||{};
  const arcs=window.ARCHIVE_SECRET_ARCS||[{id:'tide',title:'Сухой прилив',start:'cthulhu',hint:'Начните с пометки у Ктулху.',ending:'Три вклейки снова собраны. Но последняя строка всё ещё пуста.'}];
  leaves.forEach(leaf=>leaf.arc='tide');
  leaves.push(...(window.ARCHIVE_EXTRA_LEAVES||[]));
  leaves.push(...(window.ARCHIVE_SINGLE_LEAVES||[]));
  leaves.push(...(window.ARCHIVE_CATALOG_LEAVES||[]));
  for(let i=0;i<leaves.length;i++)leaves[i]=window.ARCHIVE_DETECTIVES.leaf?.(leaves[i])||leaves[i];
  const found=new Set();let storageOK=true;
  try{
    const saved=JSON.parse(localStorage.getItem(key)||'[]');
    if(Array.isArray(saved))for(const id of saved)if(leaves.some(l=>l.id===id))found.add(id);
  }catch{storageOK=false;}
  const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function save(){try{localStorage.setItem(key,JSON.stringify([...found]));storageOK=true;}catch{storageOK=false;}}
  function handwriting(scholar,witness,thirdHand=false){
    return '<div class="owner-marginalia"><span class="folio-kicker">На полях · '+(thirdHand?'изменившаяся подпись':'два почерка')+'</span><h4 class="secret-section-heading">Что обнаружили сыщики</h4><p class="owner-scholar">'+esc(scholar)+'<cite>Артур Вельт · сыщик, бывший инспектор</cite></p><p class="owner-witness'+(thirdHand?' third-hand':'')+'">'+esc(witness)+'<cite>'+(thirdHand?'неустановленный почерк · поверх подписи Марты':'Марта Рейн · частная сыщица')+'</cite></p>'+(thirdHand?'<p class="tier-hint">Слова сохранились. Подпись под наблюдением Марты переписана третьей рукой.</p>':'')+'</div>';
  }
  function ledger(){
    return '<aside class="owner-ledger"><span class="folio-kicker">Следы прежних владельцев</span><h3>Дело о живой книге</h3><p>'+esc(window.ARCHIVE_DETECTIVES.introduction)+'</p><a class="ink-link" href="#secret/case-file">Досье Вельта и Рейн →</a><p>Их улики спрятаны у существ, мест, реликвий и книг. Нажмите на большую иллюстрацию записи, чтобы найти тайный лист.</p><p>Найдено листов: '+found.size+' из '+leaves.length+'. Открытые вклейки можно перечитать.</p><div class="owner-arcs">'+arcs.map(arc=>{
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

  function openDossier(){
    const story=window.ARCHIVE_DETECTIVES;
    const people=story.people.map(person=>'<h3>'+esc(person.name)+'</h3><span class="folio-kicker">'+esc(person.role)+'</span><p>'+esc(person.text)+'</p>').join('');
    openFolio('<div class="open-book secret-book detective-dossier"><section class="book-page verso"><span class="folio-kicker">'+esc(story.title)+'</span><h2>'+esc(story.headings?.people||'Двое против переплёта')+'</h2>'+people+'<p class="secret-disclaimer">Сыщики и дело о живой книге — авторская история проекта, не литературный канон.</p><div class="folio-page">Дело № 17</div></section><section class="book-page recto"><span class="folio-kicker">Восстановлено по двум почеркам</span><h3>'+esc(story.headings?.dossier||'Книга ищет выход')+'</h3>'+story.dossier.map(p=>'<p>'+esc(p)+'</p>').join('')+'<details class="secret-source-note"><summary>Об источниках и датах</summary><p>'+esc(story.sources||'Авторское дело; источники каталога указаны в самих записях.')+'</p></details>'+ '<nav class="secret-links"><a href="'+esc(story.headings?.start||'#entry/cthulhu')+'">'+esc(story.headings?.startLabel||'Начать с соляного следа →')+'</a><a href="#contents">← Вернуться к оглавлению</a></nav><div class="folio-page">Досье · оборот</div></section></div>','spread-mode secret-mode');
  }
  function open(id){
    if(id==='case-file'){openDossier();return;}
    const leaf=leaves.find(l=>l.id===id);
    if(!leaf){
      openFolio('<div class="open-book secret-book"><section class="book-page verso"><h2>Запись не найдена</h2><p>Этот адрес не соответствует ни одному листу каталога.</p><a href="#contents">Вернуться к оглавлению →</a></section><section class="book-page recto"><h3>Архив закрыт</h3><p>Выберите существующую запись каталога и нажмите на её иллюстрацию.</p></section></div>','spread-mode secret-mode');
      return;
    }
    const material='leaf:'+leaf.id;
    if(window.readerSanity&&!window.readerSanity.has(material)){
      const preview='<article class="sealed-transcript"><h3>'+esc(leaf.heading)+'</h3>'+leaf.paragraphs.map(p=>'<p>'+esc(p)+'</p>').join('')+'</article>';
      const gate=window.readerSanity.wrap(material,preview,'Развернуть тайный лист');
      openFolio(window.secretOrnaments.wrap(leaf,'<div class="open-book secret-book"><section class="book-page verso"><span class="folio-kicker">Запечатанная вклейка '+leaf.number+'</span><h2>Неразобранный лист</h2>'+gate+'<div class="folio-page">'+leaf.number+'</div></section><section class="book-page recto"><span class="folio-kicker">Частный архив</span><h3>Показания сыщиков</h3><p>Под размытыми строками скрывается отдельный документ. Рассудок тратится только после нажатия кнопки открытия.</p><p>Плата взимается один раз. Повторное чтение останется доступным даже на пределе рассудка.</p><nav class="secret-links"><a href="#entry/'+leaf.entry+'">← Вернуться к записи</a><a href="#reading-room">В читальный зал</a></nav><div class="folio-page">'+leaf.number+' · оборот</div></section></div>'),'spread-mode secret-mode');
      return;
    }
    found.add(leaf.id);save();
    const record=window.ENTRIES.find(r=>r.id===leaf.entry);
    const next=leaf.next&&window.ENTRIES.find(r=>r.id===leaf.next);
    const chain=leaves.filter(l=>l.arc===leaf.arc),arc=arcs.find(a=>a.id===leaf.arc);
    const note=window.ARCHIVE_DETECTIVES.note(leaf.entry,notes[leaf.entry]||{scholar:leaf.reply,witness:leaf.answer});
    const incident=window.ARCHIVE_SECRET_INCIDENTS?.[leaf.entry];
    const photo=role=>window.secretEvidence.photo(leaf,role);
    const dangerous='<article class="secret-incident"><span class="folio-kicker">Из закрытого протокола</span><h4 class="secret-section-heading">Что произошло с человеком</h4>'+photo('incident')+(window.archiveIncidentTier?.(leaf.entry,window.readerSanity?.current(),!window.readerSanity||window.readerSanity.has('postscript:'+leaf.id))||'<div class="secret-blood-text">'+(incident||'').split(/\n\n+/).map(p=>'<p>'+esc(p)+'</p>').join('')+'</div>')+'<p class="secret-incident-source">Из записей Вельта и Рейн. Авторская реконструкция; связь происшествия с изображённым существом требует отдельного доказательства.</p></article>';
    const postscript=incident?'<details class="secret-postscript"'+(window.readerSanity?.has('postscript:'+leaf.id)?' open':'')+'><summary>Опасная приписка · <span class="secret-age-mark">18+</span></summary><p class="secret-content-note">Жестокость, телесный ужас, утрата рассудка.</p>'+(window.readerSanity?window.readerSanity.wrap('postscript:'+leaf.id,dangerous,'Прочитать опасную приписку · 18+'):dangerous)+'</details>':'';
    const route='<details class="secret-route"><summary>Маршрут расследования · '+found.size+' / '+leaves.length+'</summary><p class="secret-progress" role="status">Найдено '+found.size+' из '+leaves.length+' вклеек. История «'+esc(arc.title)+'»: '+chain.filter(l=>found.has(l.id)).length+' из '+chain.length+'.'+(storageOK?'':' Хранилище недоступно: находки сохранятся только до закрытия страницы.')+'</p><button type="button" class="secret-inspect" data-inspect-entry="'+esc(leaf.entry)+'" aria-haspopup="dialog">Рассмотреть: '+esc(record?.name||'иллюстрацию')+'</button><nav class="secret-links" aria-label="Продолжить исследование">'+(next?'<a class="secret-tab" href="#entry/'+next.id+'">По следу пометки: '+esc(next.name)+' →</a>':'<p class="secret-ending">'+esc(arc.ending)+'</p>')+'<a href="#entry/'+leaf.entry+'">← Вернуться: '+esc(record?.name||'запись каталога')+'</a><a href="#contents">Найденные листы в оглавлении</a></nav></details>';
    const front='<section class="book-page verso"><span class="folio-kicker">Вклейка '+esc(leaf.number)+' · частный архив</span><h2>'+esc(leaf.heading)+'</h2><div class="secret-transcript">'+leaf.paragraphs.map(p=>'<p>'+esc(p)+'</p>').join('')+'</div>'+photo('discovery')+'<p class="secret-disclaimer">Авторская история проекта. Документы, владельцы и реконструкции вымышлены.</p><div class="folio-page">'+esc(leaf.number)+'</div></section>';
    const back='<section class="book-page recto"><header class="secret-case-header"><div><span class="folio-kicker">Два прежних владельца</span><h3>Записи двух сыщиков</h3><a class="ink-link" href="#secret/case-file">Дело № 17 · кто оставил пометки →</a></div>'+photo('conclusion')+'</header>'+handwriting(note.scholar,note.witness,note.thirdHand)+postscript+route+'<div class="folio-page">'+esc(leaf.number)+' · оборот</div></section>';
    openFolio(window.secretOrnaments.wrap(leaf,'<div class="open-book secret-book secret-case-layout">'+front+back+'</div>'),'spread-mode secret-mode');
  }
  window.archiveSecrets={decorate,open,
    materials(){return leaves.map(({id,title,standalone})=>({id,title,standalone:!!standalone}));},
    link(entry){const leaf=leaves.find(l=>l.entry===entry);return leaf?'#secret/'+leaf.id:'';},
    anchor(id){return id==='case-file'?'#contents':'#entry/'+(leaves.find(l=>l.id===id)?.entry||'cthulhu');},
    onward(id){const leaf=leaves.find(l=>l.id===id);return leaf&&found.has(leaf.id)&&leaf.next?'#entry/'+leaf.next:'#contents';}
  };
})();
