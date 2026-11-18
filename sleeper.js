'use strict';
/* Движок сюжета «Мёртвый, но видящий сны»: шесть сезонов на все записи, разворот «Сон»,
   вклейки сыщиков с ручным вскрытием, режим сна для поиска рун, замки сезонов и спички.
   Своих таймеров нет: всё запускается действиями читателя (в режиме сна — ещё и анимации GSAP). */
(function(){
  const S=window.SLEEPER_STORY;if(!S)return;
  const KEY='miskatonic.sleeper.v1',MATCHES=3,SLEEP_COST=5,BITE=3,STEP_PX=900;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const ids=Object.keys(S.entries);
  const withInsert=ids.filter(id=>S.entries[id].insert);
  const runeIds=ids.filter(id=>Number.isInteger(S.entries[id].rune)).sort((a,b)=>S.entries[a].rune-S.entries[b].rune);
  const fresh=()=>({v:1,runes:[],done:[],matches:MATCHES,gifts:[]});
  function norm(x){
    const st=fresh();
    if(!x||x.v!==1)return st;
    const pick=(a,set)=>Array.isArray(a)?[...new Set(a.filter(id=>set.includes(id)))]:[];
    st.runes=pick(x.runes,runeIds);st.done=pick(x.done,withInsert);st.gifts=pick(x.gifts,withInsert);
    st.matches=Number.isInteger(x.matches)&&x.matches>=0&&x.matches<=20?x.matches:MATCHES;
    return st;
  }
  let storage=null;try{storage=localStorage;}catch{}
  function load(){try{return norm(JSON.parse(storage?.getItem(KEY)||'null'));}catch{return fresh();}}
  let st=load();
  function save(){if(window.bookConsumed)return;try{storage?.setItem(KEY,JSON.stringify(st));}catch{}paintWake();}

  const sanity=()=>{const v=window.readerSanity?.current?.();return Number.isFinite(v)?v:100;};
  const tierOf=v=>v>=70?0:v>=40?1:2;
  const person=id=>S.people[S.entries[id]?.owner];
  const record=id=>(window.ENTRIES||[]).find(r=>r.id===id);
  const nameOf=id=>record(id)?.name||id;
  const seasonOf=id=>S.seasons.findIndex(s=>s.ids.includes(id));
  const has=k=>!window.readerSanity||window.readerSanity.has(k);
  const wrap=(k,html,label)=>window.readerSanity?window.readerSanity.wrap(k,html,label):html;
  const reduce=()=>typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Сезоны: руны и замки ---------- */
  const seasonRunes=n=>S.seasons[n].ids.filter(id=>Number.isInteger(S.entries[id].rune));
  const seasonFound=n=>seasonRunes(n).filter(id=>st.runes.includes(id)).length;
  const seasonDone=n=>seasonFound(n)===seasonRunes(n).length;
  const unlocked=n=>n<=0||seasonDone(n-1);
  const open$=id=>unlocked(seasonOf(id));
  const lockLine=n=>'Заперто. Найдите руны сезона '+S.seasons[n-1].n+' · '+seasonFound(n-1)+' / '+seasonRunes(n-1).length+'.';

  function paintWake(){
    const n=st.runes.length,root=document.documentElement;
    if(!root)return;
    root.dataset.wake=String(n);
    root.style.setProperty('--wake',(n/runeIds.length).toFixed(3));
  }

  /* ---------- Материалы для рассудка ---------- */
  function materials(){
    const list=[];
    for(const id of ids){
      const e=S.entries[id];
      if(e.insert){
        list.push({id:'insert:'+id,cost:4,title:'Вскрыть вклейку · '+e.number});
        list.push({id:'deep:'+id,cost:6,title:'Опасная приписка',requires:'insert:'+id});
      }
      if(e.canon)list.push({id:'canon:'+id,cost:1,title:'Как было у Лавкрафта'});
    }
    return list;
  }

  /* ---------- Маршруты ---------- */
  function match(hash){
    if(hash==='#sleeper'||hash==='#secret/case-file')return {view:'prologue',anchor:'#contents',where:'Что спит в книге',sub:'Пролог · опись Торпа',title:'Что спит в книге'};
    let m=/^#season\/([1-6])$/.exec(hash);
    if(m&&S.seasons[m[1]-1]){const s=S.seasons[m[1]-1];return {view:'season',n:+m[1]-1,anchor:'#contents',where:'Сезон '+s.n+' · '+s.title,sub:s.year+' · '+s.place,title:'Сезон '+s.n+' · '+s.title};}
    m=/^#insert\/([a-z-]+)$/.exec(hash);
    if(m&&S.entries[m[1]]?.insert){const e=S.entries[m[1]],p=person(m[1]);return {view:'insert',id:m[1],anchor:'#entry/'+m[1],where:'Вклейка · '+e.number,sub:p.object+' · '+p.name,title:e.insert.title};}
    if(hash==='#awakening')return {view:'epilogue',anchor:'#contents',where:'Эпилог · Пробуждение',sub:'Руны имени · '+st.runes.length+' / '+runeIds.length,title:'Пробуждение'};
    return null;
  }
  function open(spec){
    if(spec.view==='prologue')return openPrologue();
    if(spec.view==='season')return openSeason(spec.n);
    if(spec.view==='insert')return openInsert(spec.id);
    if(spec.view==='epilogue')return openEpilogue();
  }
  const page=(cls,verso,recto,mode)=>openFolio('<div class="open-book secret-book sleeper-book '+cls+'"><section class="book-page verso">'+verso+'</section><section class="book-page recto">'+recto+'</section></div>',mode||'spread-mode secret-mode sleeper-mode');
  const folio=t=>'<div class="folio-page">'+esc(t)+'</div>';
  function rerender(){window.dispatchEvent(typeof HashChangeEvent==='function'?new HashChangeEvent('hashchange'):new Event('hashchange'));}

  function openPrologue(){
    const P=S.prologue;
    const verso='<span class="folio-kicker">'+esc(P.kicker)+'</span><h2>'+esc(P.heading)+'</h2><div class="sl-prose">'+P.paragraphs.map((p,i)=>'<p'+(i===0?' class="dropcap"':'')+'>'+esc(p)+'</p>').join('')+'</div><p class="secret-disclaimer">Авторский сюжет проекта по мотивам Лавкрафта. Ш’Ннар и сыщики вымышлены.</p>'+folio('Пролог');
    const recto='<span class="folio-kicker">Правила сна</span><h3>Как читать спящую книгу</h3><dl class="sl-rules">'+P.rules.map(([t,d])=>'<div><dt>'+esc(t)+'</dt><dd>'+esc(d)+'</dd></div>').join('')+'</dl>'+meters()+
      '<nav class="secret-links"><a href="#season/1">Сезон I · '+esc(S.seasons[0].title)+' →</a><a href="#contents">← Содержание</a></nav>'+folio('Пролог · оборот');
    page('sl-prologue',verso,recto);
  }
  function statusMark(id){
    const e=S.entries[id];
    if(Number.isInteger(e.rune)&&st.runes.includes(id))return '<span class="sl-mark rune" title="Руна найдена">'+esc(S.runes[e.rune].glyph)+'</span>';
    if(e.insert&&st.done.includes(id))return '<span class="sl-mark done" title="Вклейка вскрыта, руна не найдена">✦</span>';
    if(Number.isInteger(e.rune))return '<span class="sl-mark key" title="Здесь спит руна">◇</span>';
    return '<span class="sl-mark" title="Только сон">·</span>';
  }
  function lockedSpread(n,back){
    const s=S.seasons[n];
    page('sl-locked','<span class="folio-kicker">Сезон '+esc(s.n)+' · '+esc(s.year)+'</span><h2>'+esc(s.title)+'</h2><p class="sl-lock-big" aria-hidden="true">⟡</p><p class="sl-lead">Этот сон Ш’Ннару ещё не снится.</p><p>'+esc(lockLine(n))+'</p>'+folio('Сезон '+s.n),
      '<span class="folio-kicker">Где искать</span><ol class="sl-season-list">'+seasonRunes(n-1).map(id=>'<li>'+statusMark(id)+'<a href="'+(S.entries[id].insert?'#insert/':'#entry/')+id+(S.entries[id].insert?'':'/notes')+'">'+esc(nameOf(id))+'</a></li>').join('')+'</ol><nav class="secret-links"><a href="#season/'+n+'">← Сезон '+esc(S.seasons[n-1].n)+' · '+esc(S.seasons[n-1].title)+'</a>'+(back?'<a href="'+back+'">← Назад к записи</a>':'')+'<a href="#contents">Содержание</a></nav>'+folio('Сезон '+s.n+' · оборот'));
  }
  function openSeason(n){
    if(!unlocked(n))return lockedSpread(n);
    const s=S.seasons[n],finished=seasonDone(n);
    const verso='<span class="folio-kicker">Сезон '+esc(s.n)+' · '+esc(s.year)+' · '+esc(s.place)+'</span><h2>'+esc(s.title)+'</h2><p class="sl-lead">'+esc(s.lead)+'</p><div class="sl-prose">'+s.story.map(p=>'<p>'+esc(p)+'</p>').join('')+'</div>'+
      (finished?'<p class="sl-ending">'+esc(s.ending)+'</p>':'<p class="sl-ending sealed">Конец сезона проступит, когда будут найдены все четыре руны · '+seasonFound(n)+' / 4.</p>')+folio('Сезон '+s.n);
    const people=s.people.length?s.people.map(k=>{const p=S.people[k];return '<article class="sl-person sl-'+k+'"><h3>'+esc(p.name)+' <small>«'+esc(p.tag)+'»</small></h3><span class="folio-kicker">'+esc(p.role)+'</span><p>'+esc(p.text)+'</p></article>';}).join('')
      :'<article class="sl-person sl-reader"><h3>Вы <small>«Homo lector»</small></h3><span class="folio-kicker">Читатель · запись № 122</span><p>Почерк сыщиков кончился. Дальше пометки делает тот, кто пишет как вы. Ваша карточка в описи уже заведена.</p><a class="ink-link" href="#lector">Карточка читателя →</a></article>';
    const keys=seasonRunes(n),rest=s.ids.filter(id=>!keys.includes(id));
    const li=id=>{const e=S.entries[id];return '<li>'+statusMark(id)+'<a href="#entry/'+id+'">'+esc(nameOf(id))+'</a>'+(e.insert?'<a class="sl-insert-link" href="#insert/'+id+'">'+esc(e.number)+'</a>':Number.isInteger(e.rune)?'<a class="sl-insert-link" href="#entry/'+id+'/notes">сон · руна</a>':'')+'</li>';};
    const list='<h4 class="secret-section-heading">Где спят руны · '+seasonFound(n)+' / '+keys.length+'</h4><ol class="sl-season-list">'+keys.map(li).join('')+'</ol>'+
      '<details class="sl-season-more"><summary>Остальные сны сезона · '+rest.length+'</summary><ol class="sl-season-list compact">'+rest.map(li).join('')+'</ol></details>';
    const nxt=S.seasons[n+1];
    const nav='<nav class="secret-links">'+(nxt?(unlocked(n+1)?'<a href="#season/'+(n+2)+'">Сезон '+esc(nxt.n)+' · '+esc(nxt.title)+' →</a>':'<span class="sl-locked-link">⟡ Сезон '+esc(nxt.n)+' · '+esc(nxt.title)+' — заперт</span>'):'<a href="#awakening">Эпилог · Пробуждение →</a>')+'<a href="#contents">← Содержание</a></nav>';
    page('sl-season',verso,'<span class="folio-kicker">'+(s.people.length>1?'Сыщики сезона':s.people.length?'Сыщик сезона':'Последний сыщик')+'</span>'+people+list+nav+folio('Сезон '+s.n+' · оборот'));
  }

  /* ---------- Вклейки ---------- */
  const VEVE=[[40,140],[75,168],[145,168],[180,140],[110,140],[110,45],[70,118],[150,118],[110,45]];
  function grid(cls,n){let cells='';for(let i=0;i<n;i++)cells+='<span style="--d:'+((i*37)%11)+'"></span>';return '<div class="'+cls+'" aria-hidden="true">'+cells+'</div>';}
  function objectHtml(id){
    const e=S.entries[id],p=person(id),first=esc(e.insert.paragraphs[0]);
    const base='class="sl-obj sl-'+p.kind+'" data-sl-obj="'+id+'" data-kind="'+p.kind+'" data-step="0"';
    switch(p.kind){
      case 'report':return '<div '+base+' role="button" tabindex="0" aria-label="Развернуть рапорт по сгибам"><div class="sl-paper"><p>'+first+'</p></div><span class="sl-crease c1"></span><span class="sl-crease c2"></span><span class="sl-crease c3"></span><span class="sl-hint" aria-live="polite">Нажмите на рапорт: развернуть сгиб · 0 / 3</span></div>';
      case 'ash':return '<div '+base+' role="button" tabindex="0" aria-label="Сдуть пепел: проведите курсором или пальцем, или нажмите Enter"><div class="sl-paper"><p>'+first+'</p></div>'+grid('sl-ash-grid',84)+'<span class="sl-hint" aria-live="polite">Проведите по пеплу, чтобы сдуть его</span></div>';
      case 'letter':return '<div '+base+'><div class="sl-envelope"><span class="sl-flap"></span><span class="sl-address">Г., до востребования · Лондон</span><button type="button" class="sl-seal" aria-label="Надавить на сургучную печать">П·Э</button></div><span class="sl-hint" aria-live="polite">Надавите на сургуч · 0 / 3</span></div>';
      case 'stitch':return '<div '+base+' role="button" tabindex="0" aria-label="Перерезать нитки корешка: проведите поперёк, или нажмите Enter"><div class="sl-spine"><span class="sl-spine-title">'+esc(nameOf(id))+'</span><span class="sl-thread" data-t="0"></span><span class="sl-thread" data-t="1"></span><span class="sl-thread" data-t="2"></span></div><span class="sl-hint" aria-live="polite">Проведите поперёк нитки, чтобы перерезать · 0 / 3</span></div>';
      case 'rubbing':return '<div '+base+' role="button" tabindex="0" aria-label="Натереть графитом: проведите курсором или пальцем, или нажмите Enter"><div class="sl-rub-paper">'+grid('sl-rub-grid',84)+'<p class="sl-rub-text">'+first+'</p></div><span class="sl-hint" aria-live="polite">Натрите бумагу графитом — проведите по ней</span></div>';
      case 'photo':return '<div '+base+' role="button" tabindex="0" aria-label="Проявить снимок: нажмите и держите"><div class="sl-tray"><div class="sl-print" style="--img:url(art/'+esc(id)+'.webp)"><span class="sl-print-cap">'+esc(nameOf(id))+'</span></div></div><span class="sl-hint" aria-live="polite">Нажмите и держите — снимок проявится. Отпустите раньше — побледнеет.</span></div>';
      default:{
        const pts=VEVE.map((q,i)=>'<circle class="sl-pt'+(i===0?' next':'')+'" data-i="'+i+'" cx="'+q[0]+'" cy="'+q[1]+'" r="9"/>').join('');
        return '<div '+base+' role="button" tabindex="0" aria-label="Обвести веве по точкам; Enter — следующая точка"><svg class="sl-veve" viewBox="0 0 220 220" aria-hidden="true"><path class="sl-veve-path" d="M'+VEVE.map(q=>q.join(' ')).join(' L')+'"/><path class="sl-veve-deco" d="M30 190q20-12 40 0t40 0 40 0 40 0M60 200q20-10 40 0t40 0 40 0"/><circle class="sl-veve-deco" cx="110" cy="30" r="5"/><circle class="sl-veve-deco" cx="58" cy="140" r="3"/><circle class="sl-veve-deco" cx="162" cy="140" r="3"/>'+pts+'</svg><span class="sl-hint" aria-live="polite">Обведите веве по точкам, начиная с левого края лодки · 0 / '+VEVE.length+'</span></div>';
      }
    }
  }
  const HOWTO={report:'Рапорт сложен втрое. Разверните сгибы по одному.',ash:'Расклад засыпан пеплом. Сдуйте его — проведите курсором или пальцем.',letter:'Письмо запечатано. Сургуч не поддастся с первого раза.',veve:'Веве нарисовано мукой. Обведите его по точкам, медленно и по порядку. Ошибётесь — колыбельная собьётся.',stitch:'Корешок прошит тремя чужими нитками. Перережьте их — проведите поперёк каждой.',rubbing:'Знак не виден глазом. Положите бумагу и натрите графитом — проведите по листу.',photo:'Снимок ещё в кювете. Держите его в проявителе — нажмите и не отпускайте, пока не проступит.'};

  function tiered(list,t,cls){
    const shown=list.slice(0,t+1).map((p,i)=>'<p class="'+cls+' t'+i+'">'+esc(p)+'</p>').join('');
    return shown+(t<list.length-1?'<p class="sl-more">Дальше строки слиплись. Они разойдутся, когда вы уснёте глубже.</p>':'');
  }
  function runeBlock(id){
    const e=S.entries[id],r=S.runes[e.rune];
    if(st.runes.includes(id))return '<div class="sl-rune-box got"><span class="sl-rune-glyph">'+esc(r.glyph)+'</span><p>Руна «'+esc(r.sound)+'» осталась в вас. Пробуждение: <b>'+st.runes.length+' / '+runeIds.length+'</b>.'+(seasonDone(seasonOf(id))?' Сезон пройден.':'')+'</p>'+(st.runes.length===runeIds.length?'<a class="ink-link" href="#awakening">Имя собрано. Эпилог →</a>':'')+'</div>';
    const v=sanity();
    return '<div class="sl-rune-box sleep"><span class="sl-rune-glyph faint" aria-hidden="true">'+esc(r.glyph)+'</span><div><p>Где-то здесь спит руна. Глазами её не увидеть — нужно уснуть над страницей и найти её во сне.</p><button type="button" class="sl-sleep" data-sl-hunt="'+id+'"'+(v<=0?' disabled':'')+'>Уснуть и искать руну · −'+SLEEP_COST+' рассудка</button><small>Во сне каждое движение стоит рассудка, ложная руна кусается на '+BITE+'. Проснуться можно в любой момент — клавишей Esc или кнопкой.</small></div></div>';
  }
  function openInsert(id){
    const n=seasonOf(id);
    if(!unlocked(n))return lockedSpread(n,'#entry/'+id);
    const e=S.entries[id],p=person(id),done=st.done.includes(id),paid=has('insert:'+id);
    const t=tierOf(sanity());
    const body=done?'<div class="sl-doc sl-doc-'+p.kind+'">'+e.insert.paragraphs.map(x=>'<p>'+esc(x)+'</p>').join('')+'<cite>'+esc(p.name)+'</cite></div>'
      :paid?objectHtml(id):wrap('insert:'+id,objectHtml(id),'Вскрыть вклейку');
    const verso='<span class="folio-kicker">Вклейка · '+esc(e.number)+' · '+esc(p.object)+'</span><h2>'+esc(e.insert.title)+'</h2>'+body+folio(e.number);
    const s=S.seasons[n];
    const nav='<nav class="secret-links">'+(e.next&&open$(e.next)?'<a class="secret-tab" href="#entry/'+e.next+'">Ниточка ведёт дальше: '+esc(nameOf(e.next))+' →</a>':e.next?'<span class="sl-locked-link">⟡ Ниточка уходит в запертый сезон</span>':'')+'<a href="#entry/'+id+'">← Каталог: '+esc(nameOf(id))+'</a><a href="#season/'+(n+1)+'">Сезон '+esc(s.n)+' · '+esc(s.title)+'</a></nav>';
    let recto;
    if(done){
      const deep='<div class="secret-blood-text sl-deep-text" data-tier="'+t+'">'+tiered(e.deep,t,'sl-deep-p')+'</div>';
      recto='<span class="folio-kicker">'+esc(p.name)+' · '+esc(p.hand)+'</span><h3>Что осталось на полях</h3>'+runeBlock(id)+
        '<details class="secret-postscript sl-deep"'+(has('deep:'+id)?' open':'')+'><summary>Опасная приписка · <span class="secret-age-mark">18+</span></summary><p class="secret-content-note">Телесный ужас, увечья, смерть. Чем ниже рассудок, тем дальше читается приписка.</p>'+wrap('deep:'+id,deep,'Прочитать опасную приписку · 18+')+'</details>'+
        (e.match&&st.gifts.includes(id)?'<p class="sl-gift">В рапорте лежала спичка. Теперь она ваша: спичек <b>'+st.matches+'</b>.</p>':'')+nav+folio(e.number+' · оборот');
    } else {
      recto='<span class="folio-kicker">Вложено в книгу · '+esc(p.name)+'</span><h3>'+esc(p.object)+'</h3><p>'+esc(HOWTO[p.kind])+'</p><p class="sl-note">Вскрытие стоит 4 рассудка, один раз. Документ, опасная приписка и сон, в котором спит руна, — внутри.</p>'+nav+folio(e.number+' · оборот');
    }
    page('sl-insert sl-insert-'+p.kind,verso,recto);
  }
  function complete(id){
    if(!st.done.includes(id)){
      st.done.push(id);
      const e=S.entries[id];
      if(e.match&&!st.gifts.includes(id)){st.gifts.push(id);st.matches++;}
      save();
    }
    const obj=document.querySelector('[data-sl-obj="'+id+'"]');
    const again=()=>{if(location.hash==='#insert/'+id)openInsert(id);};
    const g=window.gsap;
    if(obj&&g&&!reduce())g.to(obj,{opacity:0,scale:1.04,filter:'blur(3px)',duration:.7,ease:'sine.in',onComplete:again});
    else again();
  }
  function hint(obj,text){const h=obj.querySelector('.sl-hint');if(h)h.textContent=text;}
  function stepCount(obj,total,label,doneText){
    const n=Math.min(total,+obj.dataset.step+1);obj.dataset.step=n;
    hint(obj,n<total?label+' · '+n+' / '+total:doneText);
    if(n>=total)complete(obj.dataset.slObj);
  }
  function rub(obj,cells,cls,limit,doneText){
    cells.forEach(c=>c&&c.classList.add(cls));
    const all=obj.querySelectorAll('[class$="-grid"] span'),gone=obj.querySelectorAll('[class$="-grid"] span.'+cls).length;
    if(obj.dataset.step!=='done'&&gone/all.length>=limit){obj.dataset.step='done';hint(obj,doneText);complete(obj.dataset.slObj);}
  }
  const blow=(obj,cells)=>rub(obj,cells,'blown',.65,'Пепел лёг так.');
  const graphite=(obj,cells)=>rub(obj,cells,'rubbed',.6,'Знак проступил.');
  function cut(obj,thread){
    if(!thread||thread.classList.contains('cut'))return;
    thread.classList.add('cut');
    const n=obj.querySelectorAll('.sl-thread.cut').length;obj.dataset.step=n;
    hint(obj,n<3?'Нитка перерезана · '+n+' / 3':'Корешок раскрыт');
    if(n>=3)complete(obj.dataset.slObj);
  }
  function veveAt(obj,x,y){
    if(obj.dataset.step==='done')return;
    const svg=obj.querySelector('svg'),m=svg?.getScreenCTM?.();if(!m)return;
    const pt=new DOMPoint(x,y).matrixTransform(m.inverse());
    const next=+obj.dataset.step,q=VEVE[next],near=(a,r)=>Math.hypot(pt.x-a[0],pt.y-a[1])<r;
    if(q&&near(q,15)){lightVeve(obj,next+1);return;}
    const wrong=VEVE.findIndex((a,i)=>i>next&&near(a,10)&&!(q&&a[0]===q[0]&&a[1]===q[1])&&!VEVE.slice(0,next).some(b=>b[0]===a[0]&&b[1]===a[1]));
    if(wrong>=0&&next>0){
      obj.dataset.step='0';obj.querySelectorAll('.sl-pt').forEach(c=>c.classList.remove('lit','next'));
      obj.querySelector('.sl-pt[data-i="0"]')?.classList.add('next');
      obj.classList.remove('shiver');void obj.offsetWidth;obj.classList.add('shiver');
      hint(obj,'Колыбельная сбилась. Начните снова с левого края лодки · 0 / '+VEVE.length);
    }
  }
  function lightVeve(obj,n){
    obj.dataset.step=String(n);
    obj.querySelectorAll('.sl-pt').forEach(c=>{const i=+c.dataset.i;c.classList.toggle('lit',i<n);c.classList.toggle('next',i===n);});
    hint(obj,n<VEVE.length?'Обводите дальше · '+n+' / '+VEVE.length:'Веве замкнулось');
    if(n>=VEVE.length){obj.dataset.step='done';complete(obj.dataset.slObj);}
  }
  function develop(obj,on){
    if(obj.dataset.step==='done')return;
    if(on&&reduce()){obj.dataset.step='done';hint(obj,'Снимок проявлен.');complete(obj.dataset.slObj);return;}
    obj.classList.toggle('developing',on);
    hint(obj,on?'Держите… изображение проступает':'Снимок побледнел. Нажмите и держите дольше.');
  }

  /* ---------- Режим сна: поиск руны ---------- */
  const POOL='ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛋᛏᛒᛖᛗᛚᛜᛞᛟᛝ';
  let hunting=null,note='';
  const rnd=(a,b)=>a+Math.random()*(b-a);
  function hunt(id){
    if(hunting||!S.entries[id]||!Number.isInteger(S.entries[id].rune)||st.runes.includes(id)||!open$(id))return;
    const api=window.readerSanity;
    if(api?.spend){api.spend(SLEEP_COST);if(sanity()<=0)return;}
    const r=S.runes[S.entries[id].rune],calm=reduce(),g=window.gsap;
    const glyphs=[...POOL].filter(c=>c!==r.glyph);
    const count=calm?22:40,cells=[];
    for(let i=0;i<count;i++)cells.push({g:i<4?r.glyph:glyphs[(Math.random()*glyphs.length)|0],twin:i<4});
    cells.push({g:r.glyph,real:true});
    cells.sort(()=>Math.random()-.5);
    const el=document.createElement('div');
    el.className='dream-hunt';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label','Режим сна: найдите руну '+r.sound);
    el.innerHTML='<div class="dh-veil" aria-hidden="true"></div><header class="dh-bar"><span class="dh-task">Вы уснули над «'+esc(nameOf(id))+'». Найдите руну <b>'+esc(r.glyph)+'</b> «'+esc(r.sound)+'». Настоящая теплее остальных и не любит, когда к ней тянутся.</span><span class="dh-sanity">Рассудок <b>'+sanity()+'</b></span><button type="button" class="dh-wake">Проснуться · Esc</button></header>'+
      '<div class="dh-field">'+cells.map(c=>'<button type="button" class="dh-rune'+(c.real?' real':c.twin?' twin':'')+'" style="left:'+rnd(5,93).toFixed(1)+'%;top:'+rnd(16,90).toFixed(1)+'%;font-size:'+(c.real?rnd(30,38):rnd(22,46)).toFixed(0)+'px" aria-label="Руна">'+esc(c.g)+'</button>').join('')+'</div><p class="dh-msg" aria-live="polite"></p>';
    document.body.append(el);
    document.documentElement.classList.add('dreaming');
    const state={id,el,moved:0,last:null,flees:0,done:false};
    hunting=state;
    const paint=()=>{const v=sanity(),d=((100-v)/100).toFixed(3);el.style.setProperty('--dist',d);document.documentElement.style.setProperty('--dist',d);const b=el.querySelector('.dh-sanity b');if(b)b.textContent=v;};
    paint();
    if(g&&!calm){
      g.from(el,{opacity:0,duration:.9,ease:'sine.out'});
      el.querySelectorAll('.dh-rune').forEach(b=>g.to(b,{x:rnd(-70,70),y:rnd(-50,50),rotation:rnd(-30,30),duration:rnd(4,9),yoyo:true,repeat:-1,ease:'sine.inOut'}));
    }
    el.querySelector('.dh-wake').focus({preventScroll:true});
    const say=t=>{const m=el.querySelector('.dh-msg');if(m)m.textContent=t;};
    const drain=n=>{if(!api?.spend)return;api.spend(n);paint();if(sanity()<=0)close('Рассудок кончился во сне.');};
    function flee(b){
      const x=rnd(6,92),y=rnd(16,88);
      if(g&&!calm)g.to(b,{left:x+'%',top:y+'%',duration:.55,ease:'power2.out'});else{b.style.left=x+'%';b.style.top=y+'%';}
      state.flees++;say(state.flees<3?'Руна ускользнула. Тянитесь медленнее.':'Руна устала убегать. Она дрожит.');
      if(state.flees>=3)b.classList.add('tired');
    }
    state.move=ev=>{
      if(state.done)return;
      if(state.last)state.moved+=Math.hypot(ev.clientX-state.last[0],ev.clientY-state.last[1]);
      state.last=[ev.clientX,ev.clientY];
      if(state.moved>=STEP_PX){state.moved-=STEP_PX;drain(1);if(!hunting)return;}
      const real=el.querySelector('.dh-rune.real');if(!real||state.flees>=3)return;
      const b=real.getBoundingClientRect(),d=Math.hypot(ev.clientX-(b.left+b.width/2),ev.clientY-(b.top+b.height/2));
      if(d<70)flee(real);
    };
    state.click=ev=>{
      if(ev.target.closest('.dh-wake')){close('Вы проснулись. Руна осталась во сне.');return;}
      const b=ev.target.closest('.dh-rune');
      if(!b||state.done)return;
      if(b.classList.contains('real')){found(b);return;}
      b.classList.remove('bite');void b.offsetWidth;b.classList.add('bite');
      say(b.classList.contains('twin')?'Та же форма, но холодная. Это двойник. Сон кусается: −'+BITE+'.':'Это не она. Сон кусается: −'+BITE+'.');
      drain(BITE);
    };
    state.key=ev=>{if(ev.key==='Escape'){ev.preventDefault();close('Вы проснулись. Руна осталась во сне.');}};
    el.addEventListener('pointermove',state.move);
    el.addEventListener('click',state.click);
    document.addEventListener('keydown',state.key);
    function found(b){
      state.done=true;
      if(!st.runes.includes(id)){st.runes.push(id);save();}
      const n=seasonOf(id),msg='Руна «'+r.sound+'» осталась в вас. Книга стала темнее.'+(seasonDone(n)&&S.seasons[n+1]?' Сезон '+S.seasons[n+1].n+' открыт.':'');
      say(msg);
      if(g&&!calm){
        g.killTweensOf(el.querySelectorAll('.dh-rune'));
        g.timeline({onComplete:()=>close(msg)})
          .to(el.querySelectorAll('.dh-rune:not(.real)'),{opacity:0,scale:.4,duration:.6,stagger:.01,ease:'sine.in'})
          .to(b,{left:'50%',top:'50%',xPercent:-50,yPercent:-50,x:0,y:0,rotation:0,scale:3.2,duration:.9,ease:'power2.inOut'},'<')
          .to(el,{opacity:0,duration:.8,ease:'sine.in'},'+=.6');
      } else close(msg);
    }
  }
  function close(msg){
    const s=hunting;if(!s)return;
    hunting=null;
    window.gsap?.killTweensOf(s.el.querySelectorAll('*'));
    window.gsap?.killTweensOf(s.el);
    document.removeEventListener('keydown',s.key);
    s.el.remove();
    document.documentElement.classList.remove('dreaming');document.documentElement.style.removeProperty('--dist');
    if(msg)note=msg;
    if(sanity()>0)rerender();
  }

  /* ---------- Эпилог ---------- */
  function nameLine(){
    return '<div class="sl-name" aria-label="Руны имени: '+st.runes.length+' из '+runeIds.length+'">'+S.seasons.map((s,n)=>'<span class="sl-word" title="Сезон '+esc(s.n)+'">'+seasonRunes(n).map(id=>{const r=S.runes[S.entries[id].rune];return st.runes.includes(id)?'<span class="got" title="'+esc(r.sound)+'">'+esc(r.glyph)+'</span>':'<span class="miss" title="Не найдена">◌</span>';}).join('')+'</span>').join('')+'</div>';
  }
  function openEpilogue(){
    const E=S.epilogue,all=st.runes.length===runeIds.length;
    const verso=all
      ?'<span class="folio-kicker">'+esc(E.kicker)+'</span><h2>'+esc(E.heading)+'</h2>'+nameLine()+'<p class="sl-true-name">'+esc(S.trueName)+'</p><div class="sl-prose">'+E.paragraphs.map(p=>'<p>'+esc(p)+'</p>').join('')+'</div>'+folio('Эпилог')
      :'<span class="folio-kicker">'+esc(E.kicker)+'</span><h2>Имя не собрано</h2>'+nameLine()+'<p>Эпилог заклеен полоской бумаги. Под ней прощупываются шесть слов, но прочесть их можно только своими губами — собрав руны во снах шести сезонов.</p><p class="sl-note">Руны берут во сне: уснуть можно над вклейкой или над сном о существе.</p>'+folio('Эпилог');
    const where=S.seasons.map((s,n)=>'<li><b>Сезон '+esc(s.n)+'</b> · '+esc(s.title)+' — '+(unlocked(n)?seasonFound(n)+' / 4':'⟡ заперт')+'</li>').join('');
    const recto=all
      ?'<span class="folio-kicker">Опись · последняя строка</span><h3>Запись № 122</h3><p class="owner-witness third-hand">'+esc(E.final)+'<cite>ваш почерк</cite></p><nav class="secret-links"><a href="#lector">Карточка читателя →</a><a href="#reading-room">Зажечь лампу</a><a href="#contents">← Содержание</a></nav>'+folio('Эпилог · оборот')
      :'<span class="folio-kicker">Слова имени</span><ol class="sl-season-list">'+where+'</ol><nav class="secret-links"><a href="#contents">← Содержание</a></nav>'+folio('Эпилог · оборот');
    page('sl-epilogue'+(all?' awake':''),verso,recto);
  }

  /* ---------- Содержание, развороты существа, читальный зал ---------- */
  function meters(){
    return '<p class="sl-meters"><span title="Пробуждение книги: найдено рун имени">Пробуждение <b>'+st.runes.length+' / '+runeIds.length+'</b></span><span title="Спички для лампы в читальном зале">Спички <b>'+st.matches+'</b></span></p>';
  }
  function toc(){
    return '<nav class="sleeper-toc" aria-label="Сюжет книги"><h3 class="sl-toc-title">'+esc(S.title)+'</h3>'+
      '<a class="sl-toc-row sl-toc-prologue" href="#sleeper"><small>Пролог</small><span>Что спит в книге</span></a>'+
      S.seasons.map((s,i)=>{
        const ok=unlocked(i),cast=(s.people.length?s.people.map(k=>esc(S.people[k].name)).join(', '):'Вы')+' · '+esc(s.place);
        return '<section class="sl-toc-season'+(ok?'':' locked')+'"><a class="sl-toc-row" href="#season/'+(i+1)+'"><small>Сезон '+esc(s.n)+' · '+esc(s.year)+'</small><span>'+(ok?'':'⟡ ')+esc(s.title)+'</span><em>'+(ok?seasonFound(i)+' / 4':'заперт')+'</em></a>'+
          (ok?'<p class="sl-toc-cast">'+cast+' · '+s.ids.length+' снов</p><ol>'+seasonRunes(i).map(id=>'<li>'+statusMark(id)+'<a href="#entry/'+id+'">'+esc(nameOf(id))+'</a></li>').join('')+'</ol>':'<p class="sl-toc-cast">'+esc(lockLine(i))+'</p>')+'</section>';
      }).join('')+
      '<a class="sl-toc-row sl-toc-epilogue" href="#awakening"><small>Эпилог</small><span>Пробуждение</span></a>'+meters()+'</nav>';
  }
  function decorateEntry(root,id,notes){
    const e=S.entries[id];if(!e)return;
    const n=seasonOf(id),ok=unlocked(n),s=S.seasons[n],p=person(id);
    const leaf=root.querySelector('.leaf-link[data-leaf]');
    if(leaf)leaf.textContent=notes?'← Каталог и рисунок':'Сон и свидетельства →';
    const bottom=root.querySelector('.book-bottom > span');
    if(bottom&&bottom.firstChild?.nodeType===3)bottom.firstChild.textContent=(notes?'Разворот II · Сон':'Разворот I · Каталог')+' · сезон '+s.n+' · ';
    if(!notes){
      const target=ok&&e.insert?'#insert/'+id:'#entry/'+id+'/notes';
      root.querySelectorAll('.secret-creature-link').forEach(a=>{a.href=target;a.setAttribute('aria-label',e.insert&&ok?'Открыть вклейку: '+p.object:'Открыть сон о существе');a.title=e.insert&&ok?'Нажмите на рисунок — вклейка: '+p.object:'Нажмите на рисунок — что видел Ш’Ннар';});
      if(e.insert&&ok){
        root.querySelector('.book-page.recto')?.insertAdjacentHTML('beforeend','<a class="sl-tab sl-tab-'+p.kind+(st.done.includes(id)?' opened':'')+'" href="#insert/'+id+'" aria-label="Вклейка: '+esc(p.object)+', '+esc(p.name)+'"><span>'+esc(p.object)+'</span><small>'+esc(p.short)+' · '+esc(e.number)+'</small></a>');
        root.querySelector('.book-page.verso .guide-title')?.insertAdjacentHTML('afterend','<p class="sl-margin sl-hand-'+e.owner+'">'+esc(S.margins[e.owner])+'<cite>'+esc(p.name)+'</cite></p>');
      }
      return;
    }
    let dream;
    if(!ok){
      dream='<section class="sl-dream sl-dream-locked"><span class="folio-kicker">Разворот II · Сон · сезон '+esc(s.n)+'</span><h3>Этот сон ещё не снится</h3><p class="sl-more">'+esc(lockLine(n))+'</p><a class="ink-link" href="#season/'+n+'">Сезон '+esc(S.seasons[n-1].n)+' · '+esc(S.seasons[n-1].title)+' →</a></section>';
    } else {
      const t=tierOf(sanity());
      const canon=e.canon?'<p class="sl-dreamt"><span class="sl-dreamt-mark">приснилось иначе</span>'+esc(e.canon.dreamt)+'<cite>пометка на полях</cite></p>'+wrap('canon:'+id,'<p class="sl-canon"><b>Как было у Лавкрафта.</b> '+esc(e.canon.real)+'</p>','Как было у Лавкрафта'):
        (record(id)?.sourceTitle?'<p class="sl-source">Наяву: '+esc(record(id).sourceTitle)+'</p>':'');
      const rune=Number.isInteger(e.rune)&&!e.insert?runeBlock(id):'';
      dream='<section class="sl-dream" data-tier="'+t+'"><span class="folio-kicker">Разворот II · Сон · сезон '+esc(s.n)+' · '+esc(s.title)+'</span><h3>Что видел '+esc(S.name)+'</h3>'+tiered(e.dream,t,'sl-dream-p')+canon+rune+
        (e.insert?'<a class="ink-link sl-to-insert" href="#insert/'+id+'">'+esc(p.object)+' · '+esc(p.short)+' →</a>':'')+'</section>';
    }
    const verso=root.querySelector('.book-page.verso'),anchor=verso?.querySelector('.guide-title');
    if(anchor)anchor.insertAdjacentHTML('afterend',dream);else verso?.insertAdjacentHTML('afterbegin',dream);
  }
  function decorateRoom(root){
    const btn=root.querySelector('[data-sanity-rest]');if(!btn)return;
    const v=sanity();
    if(st.matches>0){btn.textContent='Зажечь спичку · восстановить до 100';btn.disabled=v===100;}
    else{btn.textContent='Спичек нет · посидеть в темноте (до 40)';btn.disabled=v>=40;}
    btn.insertAdjacentHTML('afterend','<p class="sl-room-matches">Спичек: <b>'+st.matches+'</b>. Лампа без огня не светит. '+(st.matches?'Каждый отдых сжигает одну спичку.':'Спичка иногда лежит в рапортах сержанта Крейна.')+'</p>');
  }
  function decorate(root,hash){
    paintWake();
    if(note){root.querySelector('.book-page')?.insertAdjacentHTML('afterbegin','<p class="sl-woke" role="status">'+esc(note)+'</p>');note='';}
    if(hash==='#contents'){
      const first=root.querySelector('.book-page.verso');
      const head=first?.querySelector('.page-title');
      if(head)head.insertAdjacentHTML('afterend',toc());else first?.insertAdjacentHTML('afterbegin',toc());
      return;
    }
    if(hash==='#reading-room')return decorateRoom(root);
    const m=/^#entry\/([a-z-]+)(\/notes)?$/.exec(hash);
    if(m)decorateEntry(root,m[1],!!m[2]);
  }
  /* Отдых в читальном зале: спичка → до 100; без спичек — до 40. */
  function strike(){
    const v=sanity();
    if(st.matches>0){st.matches--;save();return 100;}
    return Math.max(v,40);
  }

  /* ---------- Делегированные действия ---------- */
  document.addEventListener('click',ev=>{
    const sleep=ev.target.closest?.('[data-sl-hunt]');
    if(sleep){ev.preventDefault();hunt(sleep.dataset.slHunt);return;}
    const seal=ev.target.closest?.('.sl-seal');
    if(seal){stepCount(seal.closest('.sl-obj'),3,'Надавите на сургуч','Сургуч треснул');return;}
    const obj=ev.target.closest?.('.sl-obj[data-kind="report"]');
    if(obj&&obj.dataset.step!=='3')stepCount(obj,3,'Нажмите на рапорт: развернуть сгиб','Рапорт развёрнут');
  });
  document.addEventListener('keydown',ev=>{
    const obj=ev.target.closest?.('.sl-obj');if(!obj||ev.target!==obj)return;
    if(obj.dataset.kind==='photo'&&(ev.key==='Enter'||ev.key===' ')){ev.preventDefault();if(!ev.repeat)develop(obj,true);return;}
    if(ev.key!=='Enter'&&ev.key!==' ')return;
    ev.preventDefault();
    const k=obj.dataset.kind;
    if(k==='report')stepCount(obj,3,'Нажмите на рапорт: развернуть сгиб','Рапорт развёрнут');
    else if(k==='ash')blow(obj,[...obj.querySelectorAll('.sl-ash-grid span:not(.blown)')].slice(0,14));
    else if(k==='rubbing')graphite(obj,[...obj.querySelectorAll('.sl-rub-grid span:not(.rubbed)')].slice(0,14));
    else if(k==='stitch')cut(obj,obj.querySelector('.sl-thread:not(.cut)'));
    else if(k==='veve'&&obj.dataset.step!=='done')lightVeve(obj,+obj.dataset.step+1);
  });
  document.addEventListener('keyup',ev=>{
    const obj=ev.target.closest?.('.sl-obj[data-kind="photo"]');
    if(obj&&(ev.key==='Enter'||ev.key===' '))develop(obj,false);
  });
  document.addEventListener('pointerdown',ev=>{const obj=ev.target.closest?.('.sl-obj[data-kind="photo"]');if(obj){ev.preventDefault();develop(obj,true);}});
  ['pointerup','pointercancel'].forEach(t=>document.addEventListener(t,()=>document.querySelectorAll('.sl-obj.developing').forEach(o=>develop(o,false))));
  document.addEventListener('pointerout',ev=>{const obj=ev.target.closest?.('.sl-obj[data-kind="photo"].developing');if(obj&&!obj.contains(ev.relatedTarget))develop(obj,false);});
  document.addEventListener('transitionend',ev=>{
    if(!ev.target.classList?.contains('sl-print')||ev.propertyName!=='opacity')return;
    const obj=ev.target.closest('.sl-obj');
    if(obj?.classList.contains('developing')&&obj.dataset.step!=='done'){obj.dataset.step='done';hint(obj,'Снимок проявлен.');complete(obj.dataset.slObj);}
  });
  document.addEventListener('pointermove',ev=>{
    const obj=ev.target.closest?.('.sl-obj[data-kind="ash"],.sl-obj[data-kind="veve"],.sl-obj[data-kind="rubbing"],.sl-obj[data-kind="stitch"]');if(!obj)return;
    const k=obj.dataset.kind;
    if(k==='veve')return veveAt(obj,ev.clientX,ev.clientY);
    const el=document.elementFromPoint(ev.clientX,ev.clientY);
    if(k==='stitch'){
      // Нитку режет движение поперёк: предыдущая и текущая точка по разные стороны линии.
      const prev=obj._py;obj._py=ev.clientY;
      if(el?.classList.contains('sl-thread'))cut(obj,el);
      if(prev!=null)obj.querySelectorAll('.sl-thread:not(.cut)').forEach(t=>{const r=t.getBoundingClientRect(),cy=r.top+r.height/2;if(ev.clientX>=r.left&&ev.clientX<=r.right&&(prev-cy)*(ev.clientY-cy)<=0)cut(obj,t);});
      return;
    }
    const gridCls=k==='ash'?'sl-ash-grid':'sl-rub-grid',cls=k==='ash'?'blown':'rubbed';
    if(el&&el.parentElement?.classList.contains(gridCls)&&!el.classList.contains(cls)){
      const list=[...el.parentElement.children],i=list.indexOf(el),cells=[el];
      if(i%12<11)cells.push(list[i+1]);if(list[i+12])cells.push(list[i+12]);
      (k==='ash'?blow:graphite)(obj,cells);
    }
  });
  addEventListener('sanitychange',ev=>{
    if(hunting){if((ev.detail?.value??sanity())<=0)close('Рассудок кончился во сне.');return;}
    // Приписки зависят от глубины сна: перерисовать вклейку после оплаты.
    if(location.hash.startsWith('#insert/'))Promise.resolve().then(()=>{const id=location.hash.split('/')[1];if(S.entries[id]?.insert&&!hunting)openInsert(id);});
  });
  addEventListener('hashchange',ev=>{if(hunting&&ev.isTrusted)close();});
  addEventListener('storage',ev=>{if(ev.key===KEY){st=load();paintWake();}});
  paintWake();

  window.sleeper=Object.freeze({match,open,decorate,materials,strike,hunt,
    unlocked,seasonDone,
    state:()=>({runes:[...st.runes],done:[...st.done],matches:st.matches}),
    reset:()=>{st=fresh();save();},KEY});
})();
