'use strict';

const fieldReferences = [
  ['Бестиарий «Лавкрафт вики»', 'https://lovecraft.fandom.com/ru/wiki/Бестиарий', 'Русский указатель существ и вариантов их имён.'],
  ['A Lovecraftian Bestiary', 'https://www.hplovecraft.com/creation/bestiary.aspx', 'Описания существ из рассказов и комментарии об их происхождении.']
];

function referenceShelf(){
  return '<h3>Справочники</h3><div class="reference-shelf">'+fieldReferences.map(([title,url,note])=>
    '<div><a href="'+url+'" target="_blank" rel="noopener noreferrer">'+title+' ↗</a><small>'+note+'</small></div>').join('')+'</div>';
}

let atlasTrail = [];
function atlasNode(record, x, y, center=false){
  const address = center ? '#entry/' : '#atlas/';
  return '<a class="chart-node '+(center?'focus-node':'satellite')+'" href="'+address+record.id+'" style="--x:'+x+'%;--y:'+y+'%" aria-label="'+
    (center?'Открыть карточку':'Исследовать связи')+' — '+escapeHTML(record.name)+'"><span class="node-image">'+illustration(record,true)+'</span><span class="node-label">'+escapeHTML(record.name)+'</span></a>';
}

function atlasChart(record){
  const neighbors = record.related.map(id=>byId.get(id)).filter(Boolean);
  // The current corpus has two or three direct links per entry.
  const points = neighbors.map((_,i)=>{
    const angle=(i*2*Math.PI/neighbors.length - Math.PI/2) + (neighbors.length===2?Math.PI/2:0);
    return [50+35*Math.cos(angle),50+33*Math.sin(angle)];
  });
  const lines = points.map(([x,y])=>'<line class="chart-thread" x1="50" y1="50" x2="'+x+'" y2="'+y+'" pathLength="1"/>').join('');
  return '<div class="star-chart"><div class="azimuth" aria-hidden="true"></div><svg class="threads" aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none">'+lines+'</svg>'+
    atlasNode(record,50,50,true)+neighbors.map((r,i)=>atlasNode(r,...points[i])).join('')+'</div>';
}

function openAtlas(record){
  const prior=atlasTrail.lastIndexOf(record.id);
  if(prior>=0)atlasTrail=atlasTrail.slice(0,prior+1);else atlasTrail.push(record.id);
  const crumbs=atlasTrail.slice(-3).map(id=>{
    const name=escapeHTML(byId.get(id).name);
    return id===record.id?'<span aria-current="page">'+name+'</span>':'<a href="#atlas/'+id+'">'+name+'</a>';
  }).join('<i aria-hidden="true">›</i>');
  const options=sections.slice(1).map(([group,label])=>'<optgroup label="'+label+'">'+records.filter(r=>r.group===group)
    .sort((a,b)=>a.name.localeCompare(b.name,'ru')).map(r=>'<option value="'+r.id+'" '+(r===record?'selected':'')+'>'+escapeHTML(r.name)+'</option>').join('')+'</optgroup>').join('');
  openFolio('<div class="field-header"><span class="overline copper"><span class="gold-rule"></span>Картотека</span><h2 id="dialog-title">Атлас связей</h2></div>'+
    '<div class="atlas-layout">'+atlasChart(record)+'<div class="atlas-notes"><div class="taxon">'+escapeHTML(record.kind)+'</div><h3>'+escapeHTML(record.name)+'</h3><div class="latin">'+escapeHTML(record.latin)+'</div><p>'+escapeHTML(record.summary)+'</p>'+
    '<a class="secondary" href="#entry/'+record.id+'">Читать карточку '+icon('book')+'</a></div></div>'+
    '<div class="atlas-foot"><label>Перейти к записи<select id="atlas-select">'+options+'</select></label><div><small>Выберите соседний портрет, чтобы продолжить путь.</small><nav class="atlas-trail" aria-label="Путь по атласу">'+crumbs+'</nav></div></div>', 'atlas-mode');
  $('atlas-select').addEventListener('change',event=>{location.hash='atlas/'+event.target.value;});
}

const fieldClues = [
  ['gug','У этого великана от каждого локтя отходят две когтистые лапы. Чтобы увидеть раскрытую пасть, придётся смотреть вдоль всей головы.','Так устроены жители подземного города круглых башен на пути Картера.'],
  ['zoog','В Зачарованном лесу эти маленькие жители прячутся в норах и дуплах. Они разговаривают с Картером и угощают его вином из древесного сока.','Совет лесных собеседников отправляет сновидца искать рукопись в Ултаре.'],
  ['brown-jenkin','В аркхэмском доме студент слышит по ночам шаги крохотного спутника ведьмы. У него крысиное тело и почти человеческое лицо.','Бурый Дженкин сопровождает Кезию Мейсон в «Снах в ведьмином доме».'],
  ['cthulhu','Крылатое тело, голова со щупальцами. О его пробуждении сначала догадываются люди, которым снятся одни и те же каменные стены.','Сны скульптора и судовой журнал приводят к одному месту — Р’льеху.'],
  ['mi-go','У обитателей гор Вермонта членистые конечности и перепончатые крылья. Для путешествия человеческого мозга у них есть металлический цилиндр.','Их земные промыслы описаны в «Шепчущем во тьме».'],
  ['nightgaunts','Эти крылатые существа хватают путника в полной тишине. На гладкой голове есть загнутые рога, а лица вовсе нет.','Безликие ночные призраки уносят Картера от горы Нгранек.'],
  ['elder-things','Антарктическая экспедиция извлекает из породы бочкообразное тело. Его строение подчинено пятилучевой симметрии.','Та же пятилучевая форма встречается в следах и резьбе их полярного города.'],
  ['shoggoth','В подземном тоннеле движется чёрная масса. По её поверхности загораются и исчезают глаза, за поворотом слышен странный свист.','Меняющее форму существо служило строителям антарктического города.'],
  ['deep-ones','У жителей приморского городка с возрастом меняются глаза и шея. Ночью некоторые из них уходят вплавь за риф.','Секрет семей Иннсмута связан с народом подводного города.'],
  ['azathoth','У его двора за пределами привычного пространства бьют барабаны и монотонно звучат флейты.','Путь к этому двору становится последней угрозой в поисках Кадата.'],
  ['yith','Они переносят сознание в тела существ других эпох, а собранные свидетельства хранят в огромном архиве.','Путешественники во времени оставляют записи для Великой расы.'],
  ['nyarlathotep','Он приходит из Египта с приборами для публичных представлений. Люди выходят с сеанса в город, который перестают узнавать.','В других сновидениях этот посланник говорит от имени Иных богов.'],
  ['ghouls','На холстах бостонского художника видны сутулые фигуры с собачьими мордами. Одна фотография раскрывает, откуда взялась натура.','В «Модели для Пикмана» художник пишет с живых обитателей подземного мира.']
];

function shuffled(items){
  const result=[...items];
  for(let i=result.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [result[i],result[j]]=[result[j],result[i]];
  }
  return result;
}
let identification=null;
function startIdentification(){
  const candidates=records.filter(r=>r.group==='gods'||r.group==='creatures');
  identification={index:0,rounds:shuffled(fieldClues).slice(0,5).map(([id,clue,explanation])=>({
    id,clue,explanation,answer:null,
    options:shuffled([byId.get(id),...shuffled(candidates.filter(r=>r.id!==id)).slice(0,2)])
  }))};
}

function openIdentification(){
  if(!identification)startIdentification();
  const {index,rounds}=identification;
  if(index===rounds.length){
    const correct=rounds.filter(r=>r.answer===r.id).length;
    const review=rounds.map(round=>{
      const r=byId.get(round.id);
      return '<a class="review-row" href="#entry/'+r.id+'">'+illustration(r,true)+'<span>'+escapeHTML(r.name)+'</span><small>'+(round.answer===r.id?'Верно':'Ваш ответ — '+escapeHTML(byId.get(round.answer).name))+'</small>'+icon('arrow')+'</a>';
    }).join('');
    openFolio('<div class="field-header"><span class="overline copper"><span class="gold-rule"></span>Итоги исследования</span><h2 id="dialog-title">Опознано '+correct+' из 5</h2></div><div class="quiz-end"><div class="review-list">'+review+'</div><button class="explore" type="button" data-quiz="restart">Пройти ещё раз '+icon('lens')+'</button></div>','quiz-mode');return;
  }
  const round=rounds[index],record=byId.get(round.id),revealed=round.answer!==null;
  const progress=rounds.map((_,i)=>'<i class="'+(i<index?'complete':i===index?'current':'')+'"></i>').join('');
  const choices=round.options.map(r=>{
    const state=revealed?(r.id===record.id?' correct':r.id===round.answer?' mistake':''):'';
    return '<button class="choice'+state+'" type="button" data-answer="'+r.id+'" '+(revealed?'disabled':'')+'>'+escapeHTML(r.name)+(state===' correct'?' <b>✓</b>':state===' mistake'?' <b>×</b>':'')+'</button>';
  }).join('');
  const result=revealed?'<div class="identification-result" role="status"><strong>'+(round.answer===record.id?'Верно!':'Это '+escapeHTML(record.name)+'.')+'</strong> '+escapeHTML(round.explanation)+'</div><button type="button" class="explore" data-quiz="next">'+(index===4?'Посмотреть итоги':'Следующая примета')+' →</button>':'';
  openFolio('<div class="field-header"><span class="overline copper"><span class="gold-rule"></span>Полевое испытание</span><h2 id="dialog-title">Определитель существ</h2></div><div class="quiz-layout">'+
    '<div class="mystery-plate '+(revealed?'revealed':'')+'">'+illustration(record,true)+'<span>'+(revealed?escapeHTML(record.latin):'Образ скрыт')+'</span></div>'+
    '<div class="quiz-notes"><div class="round-count">Примета '+(index+1)+' из 5 <span class="progress-ink" aria-hidden="true">'+progress+'</span></div><p class="clue">'+escapeHTML(round.clue)+'</p><div class="choices" aria-label="Варианты ответа">'+choices+'</div>'+result+'</div></div>','quiz-mode');
}

function fieldAction(button){
  if(!identification)return;
  const round=identification.rounds[identification.index];
  if(button.dataset.answer && round && round.answer===null){
    round.answer=button.dataset.answer;
  }else if(button.dataset.quiz==='next' && round?.answer){
    identification.index++;
  }else if(button.dataset.quiz==='restart'){
    startIdentification();
  }else{return;}
  openIdentification();
  const next=$('folio').querySelector('[data-quiz], [data-answer]:enabled');
  if(next)next.focus({preventScroll:true});
}
