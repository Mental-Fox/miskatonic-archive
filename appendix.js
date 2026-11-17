'use strict';
/* Приложения: каталог, история Мифов, книги и рассказы, настольные игры, о проекте. */
const HPLT='https://www.hplovecraft.com/writings/texts/fiction/';
const bgg=q=>'https://boardgamegeek.com/geeksearch.php?action=search&objecttype=boardgame&q='+encodeURIComponent(q);
const russianSearch=q=>'https://yandex.ru/search/?text='+encodeURIComponent(q);
const outsideLink=(url,label)=>'<a class="ink-link" href="'+escapeHTML(url)+'" target="_blank" rel="noopener noreferrer">'+escapeHTML(label)+' ↗</a>';
const russianGamePages={
  'Ужас Аркхэма':'https://hobbyworld.ru/uzhas-arkhjema',
  'Древний ужас':'https://hobbyworld.ru/drevnij-uzhas',
  'Особняки безумия':'https://hobbyworld.ru/osobnjaki-bezumija-vtoraja-redakcija',
  'Ужас Аркхэма. Карточная игра':'https://hobbyworld.ru/uzhas-arkhjema-kartochnaja-igra'
};
function libraryTools(kind,options){
  return '<div class="library-tools" data-library="'+kind+'"><label>Найти в разделе<input type="search" data-library-query placeholder="'+(kind==='reading'?'Название, автор или существо…':'Название или описание игры…')+'"></label><label>Показать<select data-library-category><option value="all">Все '+(kind==='reading'?'произведения':'игры')+'</option>'+options.map((t,i)=>'<option value="'+i+'">'+escapeHTML(t)+'</option>').join('')+'</select></label><p class="library-count" aria-live="polite"></p></div>';
}
function filterLibrary(){
  const controls=document.querySelector('.library-tools');if(!controls)return;
  const q=normalize(controls.querySelector('[data-library-query]').value);
  const category=controls.querySelector('[data-library-category]').value;
  let visible=0,total=0;
  document.querySelectorAll('[data-library-item]').forEach(item=>{
    total++;
    item.hidden=!(category==='all'||item.dataset.category===category)||!normalize(item.dataset.search).includes(q);
    if(!item.hidden)visible++;
  });
  document.querySelectorAll('[data-library-group]').forEach(group=>{
    group.hidden=![...group.querySelectorAll('[data-library-item]')].some(item=>!item.hidden);
  });
  controls.querySelector('.library-count').textContent=visible?'Показано: '+visible+' из '+total:'Ничего не найдено. Измените запрос или выберите другую категорию.';
}
document.addEventListener('input',e=>{if(e.target.matches('[data-library-query]'))filterLibrary();});
document.addEventListener('change',e=>{if(e.target.matches('[data-library-category]'))filterLibrary();});

/* ---------- История ---------- */
window.mythosHistory=[
  ['1890','Рождение в Провиденсе','20 августа в Провиденсе (Род-Айленд) родился Говард Филлипс Лавкрафт. Почти всю жизнь он проведёт в этом городе.',['haunter']],
  ['1917','«Дагон»','Лавкрафт возвращается к прозе. Рассказ о моряке, увидевшем исполина у монолита, — первый шаг к будущим Мифам.',['dagon']],
  ['1919','Страна снов','«Карающий рок над Сарнатом» и другие сказки в духе Дансени открывают мир снов.',['sarnath','bokrug','beings-of-ib']],
  ['1920','Ньярлатхотеп','Ему приснился сон, из которого вырос рассказ-миниатюра о страннике из Египта.',['nyarlathotep']],
  ['1921','«Безымянный город»','Впервые звучит двустишие безумного араба Абдула Альхазреда.',['nameless-city','necronomicon']],
  ['1923','Weird Tales','Лавкрафт начинает печататься в журнале Weird Tales — главной площадке его рассказов.',[]],
  ['1926','«Зов Ктулху»','Возвращение в Провиденс после нью-йоркских лет и самый плодотворный период. Написан «Зов Ктулху» и «Сомнамбулический поиск неведомого Кадата».',['cthulhu','rlyeh','kadath']],
  ['1928','«Ужас Данвича»','«Зов Ктулху» выходит в Weird Tales. Пишется «Ужас Данвича» — Йог-Сотот приходит в Новую Англию.',['dunwich-horror','yog']],
  ['1930','«Шепчущий во тьме»','Ми-го и Юггот. В том же году астрономы открывают Плутон.',['mi-go','yuggoth']],
  ['1931','«Хребты Безумия»','Антарктическая повесть о Старцах и шогготах. Журналы долго отказываются её печатать.',['elder-things','shoggoth','polar-city']],
  ['1935','«Тень из безвременья»','Великая раса Йит и путешествия разума сквозь время. Последний большой текст Мифов.',['yith','flying-polyps']],
  ['1936','Astounding Stories','«Хребты Безумия» и «Тень из безвременья» наконец выходят — в научно-фантастическом журнале.',[]],
  ['1937','Смерть','15 марта Лавкрафт умирает в Провиденсе. При жизни у него не вышло ни одной книги.',[]],
  ['1939','Arkham House','Август Дерлет и Дональд Уондрей основывают издательство, чтобы издать его рассказы. Дерлет же придумывает термин «Мифы Ктулху».',['hastur']],
  ['1981','«Зов Ктулху» (НРИ)','Сэнди Петерсен и Chaosium выпускают ролевую игру. Мифы получают систематику и правила.',[]],
  ['1987','«Ужас Аркхэма»','Chaosium выпускает настольную игру по Мифам; позже её переиздаст Fantasy Flight Games.',['arkham']],
  ['1988','«Руководство натуралиста»','Петерсен издаёт иллюстрированный справочник монстров Мифов, а следом — существ Страны Грёз. Наша книга во многом следует ему.',[]],
  ['2010-е','Возрождение','Настольные игры, фильмы и видеоигры делают Ктулху частью массовой культуры.',[]]
];
function renderHistory(){
  const H=window.mythosHistory,half=Math.ceil(H.length/2);
  const col=items=>'<ol class="timeline">'+items.map(([y,t,x,ids])=>'<li><b class="tl-year">'+y+'</b><div><h4>'+escapeHTML(t)+'</h4><p>'+escapeHTML(x)+'</p>'+(ids.length?'<div class="tl-links">'+ids.filter(i=>byId.has(i)).map(i=>'<a href="#entry/'+i+'">'+escapeHTML(byId.get(i).name)+'</a>').join('')+'</div>':'')+'</div></li>').join('')+'</ol>';
  openFolio('<div class="open-book"><section class="book-page verso"><header class="page-title"><span class="folio-kicker">Приложение</span><h2 id="dialog-title">История Мифов</h2><div class="cipher">'+cipherLine('history')+'</div></header>'+
    '<p class="dropcap">Мифы Ктулху не были задуманы как система. Лавкрафт перекликался сам с собой и с друзьями-писателями, вставляя чужих богов в свои рассказы. Систему из этого сделали уже после его смерти.</p>'+col(H.slice(0,half))+'<div class="folio-page">·</div></section>'+
    '<section class="book-page recto">'+col(H.slice(half))+'<div class="folio-page">·</div></section></div>','spread-mode');
}

/* ---------- Книги и рассказы ---------- */
window.readingList=[
  {title:'Лавкрафт: Мифы Ктулху',items:[
    ['Зов Ктулху','1926','cc',['cthulhu','rlyeh','wilcox-relief']],['Хребты Безумия','1931','mm',['elder-things','shoggoth','polar-city']],
    ['Ужас Данвича','1928','dh',['dunwich-horror','yog','dunwich']],['Тень над Иннсмутом','1931','soi',['deep-ones','innsmouth','dagon']],
    ['Шепчущий во тьме','1930','wid',['mi-go','yuggoth','shub']],['Тень из безвременья','1935','sot',['yith','flying-polyps']],
    ['Обитающий во тьме','1935','hd',['haunter','shining-trapezohedron']],['Сны в ведьмином доме','1932','dwh',['brown-jenkin']],
    ['Цвет из иных миров','1927','cs',[]],['Модель Пикмана','1926','pm',['ghouls']],['Дагон','1917','d',['dagon']],
    ['Безымянный город','1921','nc',['nameless-city']],['Праздник','1923','f',['byakhee']],['Крысы в стенах','1923','ra',[]],
    ['Случай Чарльза Декстера Варда','1927','cdw',[]]]},
  {title:'Лавкрафт: Страна снов',items:[
    ['Сомнамбулический поиск неведомого Кадата','1927','dq',['kadath','nightgaunts','gug','zoog','moon-beast']],['Карающий рок над Сарнатом','1919','dcs',['sarnath','bokrug']],
    ['Кошки Ултара','1920','cu',['ulthar']],['Селефаис','1920','c',['celephais']],['Иные боги','1921','og',['hatheg-sign','great-ones']],
    ['Серебряный ключ','1926','sk',['silver-key']],['Ньярлатхотеп','1920','n',['nyarlathotep']]]},
  {title:'Соавторы и последователи',items:[
    ['Роберт Чемберс — «Король в жёлтом»','1895','https://www.gutenberg.org/ebooks/8492',['carcosa','yellow-sign','king-in-yellow']],
    ['Кларк Эштон Смит — рассказы о Гиперборее','1930-е','https://en.wikipedia.org/wiki/Clark_Ashton_Smith',['tsathoggua','commoriom','eibon','abhoth']],
    ['Фрэнк Белнап Лонг — «Псы Тиндалоса»','1929','https://en.wikipedia.org/wiki/The_Hounds_of_Tindalos',['hound-tindalos']],
    ['Роберт Блох — «Звёздный бродяга»','1935','https://en.wikipedia.org/wiki/Robert_Bloch',['star-vampire','de-vermis']],
    ['Роберт И. Говард — «Королевство теней»','1929','https://en.wikipedia.org/wiki/Robert_E._Howard',['serpent-people','unaussprechlichen']],
    ['Август Дерлет — «Следы Ктулху»','1962','https://en.wikipedia.org/wiki/August_Derleth',['ithaqua','celaeno']],
    ['Рэмси Кэмпбелл — «Обитатель озера»','1964','https://en.wikipedia.org/wiki/Ramsey_Campbell',['glaaki']],
    ['Брайан Ламли — «Роющие в глубине»','1974','https://en.wikipedia.org/wiki/Brian_Lumley',['chthonian','gharne']],
    ['Сэнди Петерсен — «Руководство натуралиста по монстрам Ктулху»','1988','https://en.wikipedia.org/wiki/Sandy_Petersen',[]]]}
];
function renderReading(){
  const L=window.readingList;
  const group=g=>'<div data-library-group><h3 class="read-group">'+escapeHTML(g.title)+'</h3><ul class="read-list">'+g.items.map(([t,y,code,ids])=>{
    const url=code.startsWith('http')?code:HPLT+code+'.aspx';
    const query=(g===L[2]?'':'Говард Филлипс Лавкрафт ')+t;
    const names=ids.filter(i=>byId.has(i)).map(i=>byId.get(i).name).join(' ');
    return '<li data-library-item data-category="'+L.indexOf(g)+'" data-search="'+escapeHTML(query+' '+names)+'"><span class="read-title">'+escapeHTML(t)+'</span><span class="read-year">'+y+'</span><div class="resource-links">'+outsideLink(russianSearch(query+' читать на русском'),'Найти на русском')+outsideLink('https://www.litres.ru/search/?q='+encodeURIComponent(query),'Литрес')+outsideLink(url,code.startsWith('http')?'Об авторе / источнике':'Оригинал · EN')+'</div>'+(ids.length?'<div class="tl-links">'+ids.filter(i=>byId.has(i)).map(i=>'<a href="#entry/'+i+'">'+escapeHTML(byId.get(i).name)+'</a>').join('')+'</div>':'')+'</li>';}).join('')+'</ul></div>';
  openFolio('<div class="open-book"><section class="book-page verso"><header class="page-title"><span class="folio-kicker">Приложение</span><h2 id="dialog-title">Книги и рассказы</h2><div class="cipher">'+cipherLine('read them')+'</div></header>'+
    '<p class="sheet-lead">Реальные произведения и русские издания. Впервые здесь? Начните с «Дагона», затем прочитайте «Зов Ктулху» и «Хребты Безумия».</p><aside class="resource-note">«Найти на русском» открывает поиск в новой вкладке браузера; «Литрес» — поиск издания в каталоге. Это поиск, а не ссылка на полный текст. Год рядом с названием — время написания или издания.</aside>'+libraryTools('reading',L.map(g=>g.title))+group(L[0])+'<div class="folio-page">·</div></section>'+
    '<section class="book-page recto">'+group(L[1])+group(L[2])+'<h3 class="read-group">Другие энциклопедии</h3><ul class="read-list"><li><a class="read-title" href="https://universeoflovecraft.github.io/index.html" target="_blank" rel="noopener noreferrer">Энциклопедия существ по вселенной Г. Ф. Лавкрафта ↗</a><span class="read-year">universeoflovecraft.github.io</span><div class="uol-note">45 статей о богах, звёздных расах и существах — с иллюстрациями и списком рассказов, где каждое появляется. Сделал Данила Абакумов по книге «Миры Говарда Филлипса Лавкрафта. Иллюстрированная энциклопедия».</div></li><li><a class="read-title" href="https://www.hplovecraft.com/creation/bestiary.aspx" target="_blank" rel="noopener noreferrer">A Lovecraftian Bestiary ↗</a><span class="read-year">hplovecraft.com</span></li></ul>'+'<p class="read-more"><a class="ink-link" href="https://www.hplovecraft.com/writings/fiction/" target="_blank" rel="noopener noreferrer">Полный список рассказов Лавкрафта ↗</a></p><div class="folio-page">·</div></section></div>','spread-mode');
  filterLibrary();
}

/* ---------- Настольные игры ---------- */
window.boardGames=[
  ['Зов Ктулху','Call of Cthulhu','Ролевая игра','Chaosium, 1981','2–6','Сыщики расследуют тайны и медленно теряют рассудок. Основа всей игровой систематики Мифов.',['https://www.chaosium.com/call-of-cthulhu-rpg/','Chaosium']],
  ['Ужас Аркхэма','Arkham Horror','Кооператив','Chaosium 1987 · FFG 2005','1–8','Сыщики бродят по Аркхэму, закрывают врата в иные миры и не дают Древнему проснуться.',null],
  ['Древний ужас','Eldritch Horror','Кооператив','Fantasy Flight Games, 2013','1–8','Кругосветное расследование: от Токио до Антарктиды, пока Древний не пробудился.',null],
  ['Особняки безумия','Mansions of Madness','Сюжетная, с приложением','Fantasy Flight Games, 2011','1–5','Обследование домов с привидениями; второе издание ведёт приложение-рассказчик.',null],
  ['Ужас Аркхэма. Карточная игра','Arkham Horror: The Card Game','Карточная кампания','Fantasy Flight Games, 2016','1–4','Колодостроительная кампания с сюжетом, связанным от сценария к сценарию.',null],
  ['Знак древних','Elder Sign','Кубики, кооператив','Fantasy Flight Games, 2011','1–8','Короткая игра на кубиках: сыщики проходят приключения в музее, собирая знаки Старших.',null],
  ['Cthulhu: Death May Die','Cthulhu: Death May Die','Кооператив','CMON, 2019','1–5','Сыщики не мешают ритуалу, а доводят его до конца — чтобы убить явившегося бога.',null],
  ['Войны Ктулху','Cthulhu Wars','Стратегия','Petersen Games, 2015','2–8','Игроки сами становятся Великими Древними и делят Землю огромными фигурами.',null],
  ['Пандемия: Зов Ктулху','Pandemic: Reign of Cthulhu','Кооператив','Z-Man Games, 2016','1–4','Механика «Пандемии» в Новой Англии: закрывайте порталы, пока культисты не призвали Древних.',null],
  ['Манчкин Ктулху','Munchkin Cthulhu','Пародия, карты','Steve Jackson Games, 2007','3–6','Шуточный «Манчкин» по Мифам: убей монстра, забери сокровище, сойди с ума.',null]
];
function gameCard([ru,en,type,pub,players,text,off]){
  const category=type==='Ролевая игра'?'1':/Пародия|Стратегия/.test(type)?'2':'0';
  return '<article class="game-card" data-library-item data-category="'+category+'" data-search="'+escapeHTML([ru,en,type,text].join(' '))+'"><span class="game-type">'+escapeHTML(type)+'</span><h4>'+escapeHTML(ru)+'</h4><div class="book-latin">'+escapeHTML(en)+'</div><p>'+escapeHTML(text)+'</p>'+
    '<div class="game-meta"><span>'+escapeHTML(pub)+'</span><span>Игроки: '+players+'</span></div><div class="resource-links">'+outsideLink(russianSearch(ru+' настольная игра русское издание'),'Найти на русском')+outsideLink(russianSearch(ru+' правила на русском'),'Найти правила')+(russianGamePages[ru]?outsideLink(russianGamePages[ru],'Hobby World · RU'):'')+'</div><details class="resource-original"><summary>Зарубежные источники</summary><div class="game-links">'+outsideLink(bgg(en),'BoardGameGeek')+(off?outsideLink(off[0],off[1]):'')+'</div></details></article>';
}
function renderGames(){
  const G=window.boardGames,half=Math.ceil(G.length/2);
  openFolio('<div class="open-book"><section class="book-page verso"><header class="page-title"><span class="folio-kicker">Приложение</span><h2 id="dialog-title">Настольные игры</h2><div class="cipher">'+cipherLine('board games')+'</div></header>'+
    '<p class="sheet-lead">Мифы за игровым столом: совместные расследования, ролевые истории и сражения Древних.</p><aside class="resource-note">Ищите русское издание и правила в браузере. У четырёх игр есть отдельная ссылка на русскую страницу Hobby World. Число игроков зависит от редакции и дополнений — уточняйте его на странице выбранного издания.</aside>'+libraryTools('games',['Совместная игра','Ролевые игры','Соперничество и юмор'])+'<div class="games">'+G.slice(0,half).map(gameCard).join('')+'</div><div class="folio-page">·</div></section>'+
    '<section class="book-page recto"><div class="games">'+G.slice(half).map(gameCard).join('')+'</div><div class="folio-page">·</div></section></div>','spread-mode');
  filterLibrary();
}

/* ---------- Каталог ---------- */
let catalogFilter='all';
function catalogChapterCovers(){
  return chapters.filter(ch=>!['atlas','appendix'].includes(ch.id)).map(ch=>{
    const original='art/'+ch.art+'.webp';
    const src=window.bookImages?.get('chapter:'+ch.id)||window.bookImages?.resolve(original)||original;
    return '<a class="catalog-chapter-cover" href="#chapter/'+ch.id+'" aria-label="Открыть главу '+escapeHTML(ch.num)+': '+escapeHTML(ch.title)+'">'+
      '<img data-image-id="chapter:'+escapeHTML(ch.id)+'" data-image-original="'+escapeHTML(original)+'" src="'+escapeHTML(src)+'" alt="">'+
      '<div class="catalog-cover-label"><span>Глава</span><b>'+escapeHTML(ch.num)+'</b><h3>'+escapeHTML(ch.title)+'</h3><small>'+ch.ids.length+' '+plural(ch.ids.length)+'</small></div></a>';
  }).join('');
}
function renderCatalog(filter){
  if (!filter) {
    openFolio('<div class="open-book catalog-book"><section class="book-page verso"></section><section class="book-page recto"></section><div class="map-across catalog-across"><div class="catalog-inner catalog-chapter-index">'+
      '<header class="page-title"><h2 id="dialog-title">Каталог</h2><div class="cipher">'+cipherLine('catalogue')+'</div></header>'+
      '<div class="catalog-index-heading"><p>Выберите главу, чтобы открыть её записи</p><a class="ink-link" href="#catalog/all">Все записи →</a></div>'+
      '<nav class="catalog-chapter-covers" aria-label="Главы каталога">'+catalogChapterCovers()+'</nav></div></div></div>','spread-mode catalog-mode');
    return;
  }
  const tabs=[['all','Все'],['mythos','Мифы'],['dream','Страна Грёз'],['tales','Из рассказов'],['places','Места'],['signs','Реликвии'],['books','Библиотека']];
  catalogFilter=tabs.some(([id])=>id===filter)?filter:catalogFilter;
  const ids=catalogFilter==='all'?records.map(r=>r.id):(chapters.find(c=>c.id===catalogFilter)?.ids||[]);
  const items=ids.map(id=>byId.get(id)).filter(Boolean).sort((a,b)=>a.name.localeCompare(b.name,'ru'));
  openFolio('<div class="open-book catalog-book"><section class="book-page verso"></section><section class="book-page recto"></section><div class="map-across catalog-across"><div class="catalog-inner">'+
    '<header class="page-title"><h2 id="dialog-title">Каталог</h2><div class="cipher">'+cipherLine('catalogue')+'</div></header>'+
    '<a class="ink-link catalog-back" href="#catalog">← Главы каталога</a><nav class="realm-tabs book-tabs catalog-tabs">'+tabs.map(([k,l])=>'<a href="#catalog/'+k+'"'+(k===catalogFilter?' aria-current="page"':'')+'>'+l+'</a>').join('')+'<span class="catalog-count">'+items.length+' '+plural(items.length)+'</span></nav>'+
    '<div class="mini-shelf catalog-shelf">'+items.map(miniCard).join('')+'</div></div></div></div>','spread-mode catalog-mode');
}

/* ---------- О проекте ---------- */
function renderAbout(){
  openFolio('<div class="open-book"><section class="book-page verso"><header class="page-title"><span class="folio-kicker">От составителя</span><h2 id="dialog-title">Зачем эта книга</h2><div class="cipher">'+cipherLine('why')+'</div></header>'+
    '<p class="dropcap">Мне хотелось собрать мир Лавкрафта в книгу, по которой можно путешествовать. Встретить незнакомое существо, перейти к месту его обитания, проследить связи с другими обитателями Мифов — и найти рассказ, с которого всё началось.</p>'+
    '<p>В рассказах этот мир открывается обрывками: чужим именем, найденной рукописью, барельефом в покинутом городе. Интерактивный бестиарий связывает такие фрагменты: иллюстрации соседствуют с описаниями, карты — с хрониками, а существа — со своими литературными источниками.</p>'+
    '<p>Я сделал этот проект для неспешного чтения и любопытства. Здесь можно листать страницы подряд или идти за одной деталью: от Старцев к Антарктиде, от подземного города к шогготам, а затем — к «Хребтам Безумия». Книги и настольные игры продолжают это путешествие за пределами архива.</p>'+
    '<div class="folio-page">·</div></section><section class="book-page recto"><img class="about-logo" src="logo.svg" alt="Бестиарий Лавкрафта">'+
    '<h3 class="read-group">Как устроен архив</h3><p>Это любительская энциклопедия по мотивам произведений Лавкрафта, его соавторов и последователей. Описания пересказаны своими словами, а иллюстрации передают художественный взгляд на существ. Источник в записи помогает продолжить чтение и сравнить разные трактовки.</p><p>Мифы складывались у разных авторов: пантеон и древо здесь служат картой связей, а не единой строгой системой. Полевые записи и оформление архива — художественная часть книги.</p>'+
    '<h3 class="read-group">Для кого</h3><p>Для тех, кто только открыл Лавкрафта, для игроков в «Зов Ктулху» и «Ужас Аркхэма», которым нужна быстрая справка за столом, и для старых поклонников, которые хотят увидеть Мифы целиком.</p>'+
    '<aside class="log-card"><span class="pin" aria-hidden="true"></span><b>Записка на полях</b><p>Ph’nglui mglw’nafh Cthulhu R’lyeh wgah’nagl fhtagn. Читайте осторожно.</p></aside><div class="folio-page">·</div></section></div>','spread-mode');
}
