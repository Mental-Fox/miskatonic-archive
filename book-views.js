'use strict';
/* Глава VII «Атлас натуралиста»: хроника-книга, интерактивные карты, пантеон. */

/* ================= ХРОНИКА СТАРЦЕВ ================= */
const chronicleMore={
  arrival:{more:['Старцы пересекли межзвёздную пустоту на собственных крыльях: их ткани выдерживали холод и вакуум. Земля тогда была молода, безжизненна и почти целиком покрыта водой.','Первые города они строили на дне южного моря. Барельефы показывают звёзды, от которых они прилетели, — но ни одна из них не совпадает с нашим небом.'],dyer:'Резьба начиналась с неба: множество звёзд и одна, выделенная, — откуда пришли строители.'},
  shoggoths:{more:['Для пищи Старцы вывели простейшую жизнь, а из той же протоплазмы — шогготов: пластичные массы, которые под гипнотическим приказом отращивали нужные органы и ворочали каменные глыбы.','Шогготы строили подводные лабиринты, а Старцы тем временем — по своей прихоти или случайно — дали начало всей земной жизни, включая предков человека.'],dyer:'На одной из плит виднелась жалкая маленькая тварь — прообраз млекопитающих, выведенный ради еды или забавы.'},
  landfall:{more:['Когда из океана поднялась суша, часть Старцев переселилась на берег. Им пришлось приспособиться к воздуху: на суше они стали медлительнее, но научились летать на пяти крыльях.','Главные города ещё долго оставались под водой. Суша служила колонией, торговым путём и местом для научных работ.'],dyer:'Карты на стенах отличались от наших: материки сливались в одно огромное южное поле.'},
  'pacific-war':{more:['Из космоса пришло звёздное потомство Ктулху. Осьминогоподобные пришельцы обрушились на тихоокеанские земли, и Старцы, несмотря на оружие и шогготов, отступили в море.','Мир был заключён: новые земли достались пришельцам, старые — Старцам. Позже Р’льех вместе с хозяевами ушёл на дно, и война окончилась сама собой.'],dyer:'Изображения захватчиков вызывали у резчиков явное отвращение — линии становились резче.'},
  rebellion:{more:['Шогготы, оставленные на суше, со временем обрели разум и собственную волю. Они начали подражать речи хозяев и однажды восстали.','Старцы подавили бунт новым оружием, но с тех пор держали шогготов в страхе. На барельефах шогготы покрыты обезглавленными телами — следами того восстания.'],dyer:'Шогготов изображали покрытыми чем-то вроде слизистой коры — и рядом всегда лежали тела без голов.'},
  'mi-go':{more:['С севера пришли новые пришельцы — грибовидные ми-го с Юггота. Они вытеснили Старцев из северного полушария, и древний народ сосредоточился на юге.','Тогда же Старцы начали утрачивать умение летать через космос, а их искусство постепенно мельчало.'],dyer:'Позднейшая резьба грубее ранней: мастера словно торопились или разучились.'},
  'last-city':{more:['Последней великой столицей стал город у подножия Хребтов Безумия — каменный лабиринт на сотни километров, с башнями, мостами и террасами.','За горами, по барельефам, лежали ещё более высокие пики, к которым Старцы не приближались: что-то обитало там.'],dyer:'Даже Старцы боялись того, что скрывалось за самыми высокими вершинами.'},
  ice:{more:['Наступил ледниковый холод. Старцы ушли в глубину — в тёплое подземное море под городом, где построили новый город и оставили старый вымерзать.','Шогготы последовали за ними. Внизу, в темноте, хозяева и рабы остались вдвоём, и чем это кончилось — экспедиция узнала слишком поздно.'],dyer:'Последние барельефы изображали спуск к чёрной воде и колонны, уходящие вниз.'},
  expedition:{more:['В 1930–1931 годах экспедиция Мискатоникского университета нашла в пещере тела Старцев. Лагерь Лэйка был разорён, а Дайер и Данфорт, перелетев через горы, увидели город.','Спустившись к подземному морю, они встретили шоггота и бежали. Данфорт, оглянувшись в полёте, увидел что-то за горами — и сошёл с ума.'],en:'Radiates, vegetables, monstrosities, star-spawn — whatever they had been, they were men!',dyer:'Лучистые, растения, чудовища, звёздное отродье — кем бы они ни были, они были людьми!'}
};
function openChronicle(id){
  const epochs=window.earthEpochs;
  const index=Math.max(0,epochs.findIndex(e=>e.id===id)),e=epochs[index],x=chronicleMore[e.id]||{more:[]};
  const steps=epochs.map((it,i)=>'<a href="#chronicle/'+it.id+'" class="ch-step'+(i===index?' on':'')+'"><b>'+romans[i]+'</b><span>'+escapeHTML(it.title)+'<small>'+escapeHTML(it.era)+'</small></span></a>').join('');
  const prev=index?'<a class="ink-link" href="#chronicle/'+epochs[index-1].id+'">← '+escapeHTML(epochs[index-1].title)+'</a>':'<span></span>';
  const next=index<epochs.length-1?'<a class="ink-link" href="#chronicle/'+epochs[index+1].id+'">'+escapeHTML(epochs[index+1].title)+' →</a>':'<a class="ink-link" href="#entry/elder-things">Дневник Старцев →</a>';
  openFolio('<div class="open-book chronicle-book"><section class="book-page verso"><header class="page-title"><span class="folio-kicker">Хроника Старцев · по «Хребтам Безумия»</span><h2 id="dialog-title">Этап '+romans[index]+'</h2></header>'+
    '<figure class="chronicle-plate"><img src="art/'+e.image+'.webp" alt=""><figcaption class="ink">Барельеф '+romans[index]+' — '+escapeHTML(e.place)+'</figcaption></figure>'+
    '<nav class="ch-steps">'+steps+'</nav><div class="folio-page">'+(index*2+1)+'</div></section>'+
    '<section class="book-page recto"><span class="ch-era">'+escapeHTML(e.era)+'</span><h3 class="ch-title">'+escapeHTML(e.title)+'</h3><p class="ch-place">'+escapeHTML(e.place)+'</p>'+
    '<p class="dropcap ch-body">'+escapeHTML(e.body)+'</p>'+x.more.map(p=>'<p class="ch-body">'+escapeHTML(p)+'</p>').join('')+
    '<figure class="author-voice'+(x.en?'':' retold')+'"><figcaption>'+(x.en?'Из записок Дайера':'Что видел Дайер на стенах · пересказ')+'</figcaption>'+(x.en?'<blockquote class="voice-en" lang="en">'+escapeHTML(x.en)+'</blockquote>':'')+'<p class="voice-ru">'+escapeHTML(x.dyer||e.evidence)+'</p><cite>— Г. Ф. Лавкрафт, «Хребты Безумия»</cite></figure>'+
    '<p class="ink evidence-note">'+escapeHTML(e.evidence)+'</p><div class="book-refs"><h3>Записи этапа</h3>'+shelfLinks(e.records)+'</div>'+
    '<div class="epoch-turn">'+prev+next+'</div><div class="folio-page">'+(index*2+2)+'</div></section></div>','spread-mode');
}

/* ================= ГДЕ ОНИ ОБИТАЛИ ================= */
const earthSpots=[
  ['Аркхэм',42.6,-70.9,['arkham','necronomicon','brown-jenkin','celaeno','thaumaturgical'],'Университетский город на Мискатонике.'],
  ['Иннсмут',42.85,-70.7,['innsmouth','deep-ones','dagon','hydra'],'Порт, заключивший союз с глубоководными.'],
  ['Данвич',42.6,-72.4,['dunwich','dunwich-horror','yog'],'Глухие холмы с каменными кругами.'],
  ['Провиденс',41.8,-71.4,['haunter','shining-trapezohedron','wilcox-relief','nyarlathotep'],'Родной город Лавкрафта: церковь на Федерал-Хилл.'],
  ['Бостон',42.36,-71.06,['ghouls','cultes-goules'],'Подвалы Норт-Энда и мастерская Пикмана.'],
  ['Кингспорт',42.5,-70.85,['nodens','byakhee'],'Туманный утёс и праздник в старой церкви.'],
  ['Вермонт',43.6,-72.6,['mi-go','shub','dark-young'],'Горы, где ми-го добывают руду.'],
  ['Оклахома',35.5,-97.5,['yig','formless-spawn','tsathoggua','serpent-people'],'Курган, под которым синий К’ньян и чёрный Н’кай.'],
  ['Манитоба',55,-97,['ithaqua'],'Тайга, где шагает Вендиго.'],
  ['Милуоки',43,-87.9,['star-vampire','de-vermis'],'Здесь Блох поселил своего «звёздного бродягу».'],
  ['Р’льех',-47.15,-126.7,['rlyeh','cthulhu','star-spawn','rlyeh-text'],'47°9′ ю. ш., 126°43′ з. д. — по записи Йохансена.'],
  ['Тихий океан · Дагон',-8,-150,['dagon','deep-ones'],'Здесь моряк видел, как со дна поднялась суша.'],
  ['Му',-12,-170,['ghatanothoa','tyog-scroll','zanthu','unaussprechlichen'],'Затонувший континент и гора Яддит-Го.'],
  ['Понапе',6.9,158.2,['ponape','deep-ones'],'Каролинские острова, откуда привезли писание.'],
  ['Город Старцев',-77,105,['polar-city','elder-things','shoggoth','polar-reliefs','star-spawn'],'За Хребтами Безумия.'],
  ['Пустыня Австралии',-22,125,['yith','flying-polyps','yith-archive','eltdown'],'Руины города Великой расы.'],
  ['Безымянный город',22,47,['nameless-city','necronomicon','serpent-people'],'Пески Аравии.'],
  ['Гиперборея',74,-40,['commoriom','eibon','tsathoggua','formless-spawn'],'Древний континент под гренландским льдом.'],
  ['Сассекс',50.9,-0.3,['sussex','eltdown'],'Черепки из триасовых слоёв и неточный перевод.'],
  ['Долина Северн',52.2,-2.4,['glaaki'],'Озеро, на дне которого ждёт Глааки.'],
  ['Лондон',51.5,-0.12,['dimensional-shambler','chaugnar-faugn'],'Музей восковых фигур Роджерса.'],
  ['Германия',51,6.8,['unaussprechlichen','de-vermis'],'Дюссельдорф и Кёльн — города запретных изданий.'],
  ['Франция',48.7,3,['cultes-goules','daemonolatreia','king-in-yellow'],'Здесь печатали книги, которые потом жгли.'],
  ['Г’харн',18,8,['gharne','chthonian'],'Затерянный город хтонианцев в Сахаре.'],
  ['Египет',30,31,['nyarlathotep'],'Отсюда пришёл Ньярлатхотеп.'],
  ['Тибет',31,88,['dzyan','chaugnar-faugn','mi-go'],'Плато Цан, книга Дзиан и горы ми-го.'],
  ['Анды',-13,-72,['atlach-nacha','mi-go'],'Отсюда искали путь к паучьей бездне.']
];
const dreamSpots=[
  ['Ултар',230,250,['ulthar','saturnian-cat','zoog'],'Город кошек за рекой Скай.'],
  ['Зачарованный лес',150,300,['zoog','buopoth','magah-bird'],'Входные ворота Страны Грёз — у семисот ступеней.'],
  ['Дайлат-Лин',300,330,['moon-beast','leng-man'],'Порт, куда приходят чёрные галеры.'],
  ['Селефаис',470,210,['celephais','great-ones','lamp-newt'],'Город Куранеса у Серенарианского моря.'],
  ['Мнар · Сарнат и Иб',190,420,['sarnath','bokrug','beings-of-ib','doom-sign'],'Болото на месте величайшего города.'],
  ['Ориаб · Нгранек',420,420,['nightgaunts','hemophore','great-ones'],'Остров с горой, где высечен лик богов.'],
  ['Инкуанок',640,180,['great-ones','shantak'],'Город из оникса, жители с ликами богов.'],
  ['Плато Ленг',720,120,['leng-man','leng-spider','kadath'],'Холодное плато костров и монастыря.'],
  ['Кадат',820,60,['kadath','great-ones','nyarlathotep','shantak'],'Ониксовый замок земных богов.'],
  ['Саркоманд',610,300,['wamp','leng-man'],'Мёртвый город с лестницей в Подземный мир.'],
  ['Хатег-Кла',300,150,['hatheg-sign','great-ones','hsan','pnakotic'],'Гора, куда поднялся Барзай.'],
  ['Сона-Нил',560,470,['butterfly-dragon'],'Земля Иллюзий.'],
  ['Парг',760,440,['fire-worm','voonith'],'Джунгли юга.'],
  ['Южное море',470,520,['gnorri','cloud-beast'],'Лабиринты гноров и облака-звери.'],
  ['Подземный мир',350,610,['gug','ghast','ghouls','abhoth','atlach-nacha','dhole'],'Склепы Зина, город гугов и озеро Абота.'],
  ['Луна',900,560,['moon-beast','saturnian-cat','leng-man'],'Обратная сторона Луны — земля лунных тварей.'],
  ['Тёмное измерение',90,560,['bloop','servant-karakal'],'Где свет излучается как тьма.']
];
const skyBodies=[
  ['Солнце',0,0,26,'#d9a441',[],'Центр нашей системы.'],
  ['Земля',70,30,7,'#7a9a8a',['cthulhu','elder-things','deep-ones'],'Наш мир — и Страна Грёз за порогом сна.'],
  ['Луна',84,22,3,'#cfc6b0',['moon-beast','saturnian-cat'],'В Стране Грёз — дом лунных тварей.'],
  ['Сатурн',150,200,14,'#c8a46a',['tsathoggua','saturnian-cat'],'Откуда пришёл Цатоггуа и коты-арабески.'],
  ['Юггот',215,320,6,'#8a7f9a',['mi-go','yuggoth','shining-trapezohedron'],'Плутон — база ми-го.'],
  ['Альдебаран',300,40,5,'#e07a4a',['byakhee','hastur','carcosa'],'Звезда, у которой рождаются бьякхи; рядом Хиады и Каркоза.'],
  ['Целено',320,120,5,'#9fb7e0',['celaeno','yith'],'Звезда Плеяд с великой библиотекой.'],
  ['Яддит',330,220,5,'#b0d48a',['dhole','silver-key'],'Мир, источенный дхоулами.'],
  ['Облако Оорта',260,400,4,'#d8e4ec',['ithaqua'],'Холодная окраина, где бродит Итаква.'],
  ['Центр хаоса',380,330,9,'#6b4f8a',['azathoth','servitor','larva-outer-gods','nyarlathotep','yog','shub'],'Трон Азатота за пределами пространства.']
];
let mapView={x:0,y:0,k:1};
function spotPin(name,x,y,ids,cls,i){
  const kind=ids.some(id=>byId.get(id)?.group==='creatures'||byId.get(id)?.group==='gods')?'beast':ids.some(id=>byId.get(id)?.group==='books')?'tome':'site';
  return '<g class="pin '+kind+' '+cls+'" data-spot="'+i+'" transform="translate('+x.toFixed(1)+' '+y.toFixed(1)+')" tabindex="0" role="button" aria-label="'+escapeHTML(name)+'"><circle class="halo" r="10"/><circle class="dot" r="4.2"/><text y="-9">'+escapeHTML(name)+'</text></g>';
}
function spotCard(name,ids,text){
  const items=ids.map(id=>byId.get(id)).filter(Boolean);
  return '<b class="spot-name">'+escapeHTML(name)+'</b><p>'+escapeHTML(text)+'</p><div class="spot-list">'+items.map(r=>'<a href="#entry/'+r.id+'"><span>'+illustration(r)+'</span>'+escapeHTML(r.name)+'</a>').join('')+'</div>';
}
function openWorlds(tab,arg){
  tab=['earth','dream','space'].includes(tab)?tab:'earth';
  const tabs=[['earth','Места на Земле'],['dream','Страна Грёз'],['space','Космос']].map(([k,l])=>'<a href="#worlds/'+k+'"'+(k===tab?' aria-current="page"':'')+'>'+l+'</a>').join('');
  let map='',side='';
  if(tab==='earth'){
    const pins=earthSpots.map(([n,lat,lon,ids],i)=>spotPin(n,(lon+180)/360*1024,(90-lat)/180*512,ids,'',i)).join('');
    map='<svg class="atlas-map earth" viewBox="0 0 1024 512"><defs><filter id="sepia-map"><feColorMatrix type="matrix" values=".39 .77 .19 0 0  .35 .69 .17 0 0  .27 .53 .13 0 0  0 0 0 1 0"/></filter></defs><g class="pan"><image href="art/earth-surface.webp" width="1024" height="512" filter="url(#sepia-map)" opacity=".75"/>'+
      graticuleFlat(1024,512)+pins+'</g></svg>';
    side='<p class="ink map-hint">Наведите на отметку или нажмите на неё. Колесо мыши — приблизить, перетаскивание — сдвинуть.</p>';
  }else if(tab==='dream'){
    map='<svg class="atlas-map dream" viewBox="0 0 1000 680">'+dreamBase()+'<g class="pan">'+dreamSpots.map(([n,x,y,ids],i)=>spotPin(n,x,y,ids,'',i)).join('')+'</g></svg>';
    side='<p class="ink map-hint">Карта составлена по маршрутам Рэндольфа Картера. Расстояния в мире снов условны.</p>';
  }else if(tab==='space'){
    map='<svg class="atlas-map space" viewBox="-460 -460 920 920">'+spaceBase()+'</svg>';
    side='<p class="ink map-hint">Планеты движутся по орбитам. Нажмите на мир, чтобы узнать, кто там живёт.</p>';
  }else{
    const ages=mapAges;const ai=Math.max(0,ages.findIndex(a=>a.id===arg));
    map='<div class="era-stage">'+eraBlock(ages[ai].id,null)+'</div>';
    side='<div class="era-controls"><button type="button" class="secondary" data-era-play>'+icon('play')+'Проиграть</button><input type="range" min="0" max="7" value="'+ai+'" id="era-range" aria-label="Эпоха"><div class="era-ticks">'+ages.map(a=>'<span>'+a.short+'</span>').join('')+'</div></div>';
  }
  openFolio('<div class="open-book atlas-book"><section class="book-page verso"></section><section class="book-page recto"></section>'+
    '<div class="map-across'+(tab==='eras'?' eras':'')+'">'+map+'</div>'+
    '<header class="ov-head"><h2 id="dialog-title">Карта миров</h2><div class="cipher">'+cipherLine('map of the worlds')+'</div></header><nav class="ov-tabs realm-tabs book-tabs">'+tabs+'</nav>'+
    (tab==='eras'?'<div class="ov-card era-card">'+side+'</div>':'<div class="ov-card" id="spot-card">'+side+'</div><div class="ov-tools map-tools"><button type="button" data-zoom-map="1.4" aria-label="Приблизить">+</button><button type="button" data-zoom-map="0.7" aria-label="Отдалить">−</button><button type="button" data-zoom-map="0" aria-label="Сбросить">⟲</button></div>')+
    '</div>','spread-mode map-mode');
  mountMap(tab);
}
function graticuleFlat(W,H){let g='<g class="flat-grid">';for(let i=1;i<12;i++)g+='<path d="M'+(i*W/12)+' 0V'+H+'"/>';for(let i=1;i<6;i++)g+='<path d="M0 '+(i*H/6)+'H'+W+'"/>';return g+'</g>';}
function dreamBase(){
  return '<defs><pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><path d="M0 0v6" stroke="#8b6a4e" stroke-width=".7" opacity=".45"/></pattern></defs>'+
  '<g class="dream-land"><path class="sea" d="M0 0H1000V680H0Z"/>'+
  '<path class="land" d="M40 60Q180 20 330 60T620 40Q760 20 900 30Q980 90 960 240Q930 330 860 380Q800 420 700 400Q640 380 600 330Q560 380 520 360Q470 330 420 350Q360 380 300 360Q240 400 200 470Q150 520 90 480Q30 430 40 320Q20 200 40 60Z"/>'+
  '<path class="land" d="M380 400Q430 380 470 410Q480 450 440 460Q390 460 380 430Z"/>'+
  '<path class="land" d="M520 440Q600 420 660 450Q700 480 650 500Q580 510 530 490Z"/><path class="land" d="M700 410Q790 400 840 430Q860 480 800 490Q730 490 700 450Z"/>'+
  '<path class="under" d="M60 580Q300 540 560 590Q700 620 640 660Q400 680 120 660Q40 640 60 580Z"/>'+
  '<circle class="moon" cx="900" cy="560" r="80"/><path class="river" d="M120 200Q200 240 230 250T330 320"/><path class="mount" d="M700 140l20-40 20 40M800 80l20-50 20 50M290 160l14-30 14 30M410 410l12-26 12 26"/>'+
  '<text class="sea-name" x="560" y="270">Серенарианское море</text><text class="sea-name" x="340" y="540">Южное море</text><text class="sea-name" x="220" y="640">Подземный мир</text><text class="sea-name" x="855" y="655">Луна</text><text class="sea-name" x="40" y="640">Тёмное измерение</text></g>';
}
function spaceBase(){
  const rings=[70,150,215,300,380].map(r=>'<circle class="orbit" r="'+r+'"/>').join('');
  return '<defs><radialGradient id="sun"><stop offset="0" stop-color="#f6d27a"/><stop offset="1" stop-color="#b9772c"/></radialGradient></defs><g class="space-bg">'+rings+'</g>'+
    skyBodies.map(([n,orbit,ang,r,c,ids,t],i)=>{
      const body='<g class="pin body" data-spot="'+i+'" tabindex="0" role="button" aria-label="'+escapeHTML(n)+'"><circle class="halo" r="'+(r+8)+'"/><circle class="dot" r="'+r+'" fill="'+(i===0?'url(#sun)':c)+'"/>'+(n==='Сатурн'?'<ellipse rx="'+(r+9)+'" ry="4" fill="none" stroke="#c8a46a"/>':'')+'<text y="'+(-r-7)+'">'+escapeHTML(n)+'</text></g>';
      if(!orbit)return body;
      const dur=20+orbit/6;
      return '<g class="orbiter" style="--a:'+ang+'deg;--d:'+dur.toFixed(0)+'s"><g transform="translate('+orbit+' 0)"><g class="counter">'+body+'</g></g></g>';
    }).join('');
}
function eraBlock(age,sel){
  return '<div class="era-map">'+historicalPlate(age,sel)+'</div><div class="era-legend"><h3>'+mapAges.find(a=>a.id===age).title+'</h3><div class="range-list">'+mapLegend(age,sel)+'</div>'+focusNote(mapAges.find(a=>a.id===age),sel)+'</div>';
}
let eraTimer=null;
function mountMap(tab){
  clearInterval(eraTimer);eraTimer=null;
  const svg=$('folio').querySelector('.atlas-map'),card=$('spot-card');
  const data=tab==='earth'?earthSpots.map(s=>[s[0],s[3],s[4]]):tab==='dream'?dreamSpots.map(s=>[s[0],s[3],s[4]]):tab==='space'?skyBodies.map(s=>[s[0],s[5],s[6]]):null;
  if(tab==='eras'){
    const range=$('era-range'),stage=$('folio').querySelector('.era-stage');
    const show=i=>{stage.innerHTML=eraBlock(mapAges[i].id,null);};
    range.addEventListener('input',()=>show(+range.value));
    stage.addEventListener('click',e=>{const a=e.target.closest('a[href^="#habitats/earth/"]');if(!a)return;e.preventDefault();const parts=a.getAttribute('href').split('/');stage.innerHTML=eraBlock(parts[2],parts[3]||null);});
    $('folio').querySelector('[data-era-play]').addEventListener('click',ev=>{
      const b=ev.currentTarget;
      if(eraTimer){clearInterval(eraTimer);eraTimer=null;b.innerHTML=icon('play')+'Проиграть';return;}
      b.innerHTML=icon('pause')+'Пауза';
      eraTimer=setInterval(()=>{if(!range.isConnected){clearInterval(eraTimer);return;}range.value=(+range.value+1)%8;show(+range.value);},2200);
    });
    return;
  }
  if(!svg)return;
  const pan=svg.querySelector('.pan');mapView={x:0,y:0,k:1};
  const apply=()=>{if(pan)pan.setAttribute('transform','translate('+mapView.x+' '+mapView.y+') scale('+mapView.k+')');svg.style.setProperty('--k',mapView.k);};
  const pick=i=>{svg.querySelectorAll('.pin').forEach(p=>p.classList.toggle('on',p.dataset.spot==String(i)));const [n,ids,t]=data[i];card.innerHTML=spotCard(n,ids,t);};
  svg.addEventListener('mouseover',e=>{const p=e.target.closest('.pin');if(p)pick(p.dataset.spot);});
  svg.addEventListener('click',e=>{const p=e.target.closest('.pin');if(p)pick(p.dataset.spot);});
  svg.addEventListener('keydown',e=>{const p=e.target.closest('.pin');if(p&&(e.key==='Enter'||e.key===' ')){e.preventDefault();pick(p.dataset.spot);}});
  if(!pan)return;
  const vb=svg.viewBox.baseVal;
  const toSvg=(cx,cy)=>{const b=svg.getBoundingClientRect();return [(cx-b.left)/b.width*vb.width+vb.x,(cy-b.top)/b.height*vb.height+vb.y];};
  const zoomAt=(f,px,py)=>{const k=Math.min(8,Math.max(1,mapView.k*f));const r=k/mapView.k;mapView.x=px-(px-mapView.x)*r;mapView.y=py-(py-mapView.y)*r;mapView.k=k;if(k===1){mapView.x=0;mapView.y=0;}apply();};
  svg.addEventListener('wheel',e=>{e.preventDefault();const [px,py]=toSvg(e.clientX,e.clientY);zoomAt(e.deltaY<0?1.25:0.8,px,py);},{passive:false});
  let drag=null;
  svg.addEventListener('pointerdown',e=>{if(e.target.closest('.pin'))return;drag=[e.clientX,e.clientY,mapView.x,mapView.y];svg.setPointerCapture(e.pointerId);svg.classList.add('grabbing');});
  svg.addEventListener('pointermove',e=>{if(!drag)return;const b=svg.getBoundingClientRect();mapView.x=drag[2]+(e.clientX-drag[0])/b.width*vb.width;mapView.y=drag[3]+(e.clientY-drag[1])/b.height*vb.height;apply();});
  svg.addEventListener('pointerup',()=>{drag=null;svg.classList.remove('grabbing');});
  $('folio').querySelectorAll('[data-zoom-map]').forEach(b=>b.addEventListener('click',()=>{const f=+b.dataset.zoomMap;if(!f){mapView={x:0,y:0,k:1};apply();}else zoomAt(f,vb.x+vb.width/2,vb.y+vb.height/2);}));
}

/* ================= ПАНТЕОН ================= */
const pantheonRings=[
  {key:'outer',label:'Внешние боги',r:120},{key:'elder',label:'Старшие боги',r:120},
  {key:'old',label:'Великие Древние',r:250},
  {key:'servitor',label:'Подчинённые расы',r:400},{key:'independent',label:'Независимые расы',r:400},{key:'other',label:'Отдельные случаи',r:530}
];
function openPantheonRings(sel){
  const P=window.speciesProfiles,beings=records.filter(r=>P[r.id]);
  const by=k=>beings.filter(r=>P[r.id].rank===k);
  const cx=600,cy=60,nodes=[];
  const arc=(items,r,a0,a1,row=0)=>items.forEach((it,i)=>{const t=items.length===1?.5:i/(items.length-1);const a=(a0+(a1-a0)*t)*Math.PI/180;nodes.push([it,cx+Math.cos(a)*r,cy+Math.sin(a)*r]);});
  const outer=by('outer'),elder=by('elder');
  arc(elder,120,150,120);arc(outer,120,105,25);
  arc(by('old'),255,165,15);
  const serv=by('servitor'),ind=by('independent');
  const split=(arr,r1,r2,a0,a1)=>{const a=arr.filter((_,i)=>i%2===0),b=arr.filter((_,i)=>i%2);arc(a,r1,a0,a1);arc(b,r2,a0+3,a1-3);};
  split(serv,390,465,172,94);split(ind,390,465,86,8);
  arc(by('other'),560,165,15);
  const rank=r=>P[r.id].rank;
  const selRec=byId.get(sel);const selRank=selRec?rank(selRec):(pantheonRings.find(x=>x.key===sel)?sel:null);
  const ringsSvg=[120,255,428,560].map((r,i)=>'<path class="p-ring r'+i+'" d="M'+(cx-r)+' '+cy+' A'+r+' '+r+' 0 0 0 '+(cx+r)+' '+cy+'"/>').join('')+
    '<path class="p-split" d="M'+cx+' '+(cy+330)+'V'+(cy+600)+'"/>'+
    '<text class="p-label" x="'+(cx-240)+'" y="'+(cy+150)+'">Старшие боги</text><text class="p-label" x="'+(cx+150)+'" y="'+(cy+150)+'">Внешние боги</text>'+
    '<text class="p-label" x="'+cx+'" y="'+(cy+300)+'" text-anchor="middle">Великие Древние</text>'+
    '<text class="p-label" x="'+(cx-360)+'" y="'+(cy+520)+'">Подчинённые расы</text><text class="p-label" x="'+(cx+230)+'" y="'+(cy+520)+'">Независимые расы</text>'+
    '<text class="p-label small" x="'+cx+'" y="'+(cy+640)+'" text-anchor="middle">Отдельные случаи</text>';
  const nodeSvg=nodes.map(([r,x,y],i)=>{
    const on=selRec?r.id===selRec.id:selRank?rank(r)===selRank:false;
    return '<a href="#hierarchy/'+r.id+'" class="p-node rank-'+rank(r)+(on?' on':'')+(selRank&&!on&&!selRec?' dim':'')+'" style="--i:'+i+'" transform="translate('+x.toFixed(1)+' '+y.toFixed(1)+')"><circle r="21"/><clipPath id="pc'+i+'"><circle r="19"/></clipPath><image href="'+plateCandidates(r).slice(-1)[0]+'" x="-19" y="-19" width="38" height="38" clip-path="url(#pc'+i+')" preserveAspectRatio="xMidYMid slice"/><text y="33">'+escapeHTML(r.name)+'</text></a>';
  }).join('');
  const chips=[['outer','Внешние'],['elder','Старшие'],['old','Великие Древние'],['servitor','Подчинённые'],['independent','Независимые'],['other','Особые']].map(([k,l])=>'<a href="#hierarchy/'+k+'"'+(selRank===k&&!selRec?' aria-current="page"':'')+'>'+l+'</a>').join('');
  const card=selRec?'<div class="p-card"><div class="p-portrait">'+plateImage(selRec,'plate-main')+'</div><div class="taxon">'+escapeHTML(P[selRec.id].subrank||rankNames[rank(selRec)])+'</div><h3>'+escapeHTML(selRec.name)+'</h3><p>'+escapeHTML(selRec.summary)+'</p><a class="secondary read-entry" href="#entry/'+selRec.id+'">'+icon('book')+' Открыть запись</a></div>'
    :'<div class="p-card"><h3>'+(selRank?escapeHTML(rankNames[selRank]):'Пантеон мифов')+'</h3><p>'+(selRank?by(selRank).length+' '+plural(by(selRank).length)+'. Наведите на портрет, нажмите — узнаете больше.':'В центре — Внешние боги у трона Азатота. Ниже — Великие Древние, затем расы-служители и независимые народы. Схема повторяет круги старинного плаката «Lovecraftian Bestiary».')+'</p></div>';
  openFolio('<div class="open-book pantheon-book"><section class="book-page verso"></section><section class="book-page recto"></section>'+
    '<div class="map-across pantheon-wrap"><svg class="pantheon" viewBox="0 0 1200 '+(cy+690)+'"><defs><radialGradient id="eclipse"><stop offset=".55" stop-color="#1d1712"/><stop offset=".62" stop-color="#e8d7ad"/><stop offset="1" stop-color="#e8d7ad" stop-opacity="0"/></radialGradient></defs><circle cx="'+cx+'" cy="'+cy+'" r="70" fill="url(#eclipse)" class="eclipse"/><text class="p-center" x="'+cx+'" y="'+(cy+6)+'" text-anchor="middle">Азатот</text>'+ringsSvg+nodeSvg+'</svg></div>'+
    '<header class="ov-head"><h2 id="dialog-title">Пантеон</h2><div class="cipher">'+cipherLine('the pantheon')+'</div></header><nav class="ov-tabs right realm-tabs book-tabs">'+chips+'</nav><div class="ov-card p-card-wrap">'+card+'</div></div>','spread-mode map-mode pantheon-mode');
}
