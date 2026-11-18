'use strict';
/* Homo lector — последняя запись описи. Карточка читателя по данным этого браузера.
   Ничего не отправляется наружу; учёт идёт только по переходам, без таймеров. */
(function(){
  const KEY='miskatonic.homo-lector.v1';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let persistent=true;
  function load(){
    try{
      const d=JSON.parse(localStorage.getItem(KEY)||'null');
      if(d&&typeof d==='object'&&typeof d.first==='string'&&d.visits&&d.dwell)return {first:d.first,visits:clean(d.visits),dwell:clean(d.dwell),rests:Number.isInteger(d.rests)&&d.rests>=0?d.rests:0};
    }catch{persistent=false;}
    return {first:new Date().toISOString(),visits:{},dwell:{},rests:0};
  }
  function clean(o){const r={};for(const [k,v] of Object.entries(o||{}))if(/^[a-z0-9-]+$/.test(k)&&Number.isFinite(v)&&v>=0)r[k]=v;return r;}
  const data=load();
  function save(){if(window.bookConsumed)return;try{localStorage.setItem(KEY,JSON.stringify(data));persistent=true;}catch{persistent=false;}}

  let current=null,since=0;
  const entryOf=hash=>{const m=/^#entry\/([^/]+)/.exec(hash||'');return m&&window.ENTRIES?.some(r=>r.id===m[1])?m[1]:null;};
  function settle(now){if(current)data.dwell[current]=(data.dwell[current]||0)+Math.min(Math.max(0,now-since),10*60e3);}
  // Перед записью перечитываем хранилище: другая вкладка могла обновить карточку.
  function refresh(){if(!persistent)return;const d=load();data.first=d.first<data.first?d.first:data.first;for(const k of ['visits','dwell'])for(const [id,v] of Object.entries(d[k]))data[k][id]=Math.max(data[k][id]||0,v);data.rests=Math.max(data.rests,d.rests);}
  function track(hash){
    refresh();
    const id=entryOf(hash),now=Date.now();
    if(id===current)return;
    settle(now);
    if(id){data.visits[id]=(data.visits[id]||0)+1;}
    current=id;since=now;save();
  }
  addEventListener('hashchange',()=>track(location.hash));
  addEventListener('pagehide',()=>{refresh();settle(Date.now());since=Date.now();save();});
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-sanity-rest]')){refresh();data.rests++;save();}},true);
  track(location.hash);

  function sanity(){
    try{const s=JSON.parse(localStorage.getItem('miskatonic.reader-sanity.v2')||'null');if(s&&Array.isArray(s.opened))return s;}catch{}
    return {value:window.readerSanity?.current?.()??100,opened:[]};
  }
  function noteCount(){let n=0;try{for(let i=0;i<localStorage.length;i++)if(localStorage.key(i)?.startsWith('miskatonic.fieldnote.v1.'))n++;}catch{}return n;}
  const name=id=>window.ENTRIES?.find(r=>r.id===id)?.name||id;
  const plural=(n,a,b,c)=>n%10===1&&n%100!==11?a:n%10>=2&&n%10<=4&&(n%100<12||n%100>14)?b:c;
  const bar=n=>'<span class="ink-redacted" role="img" aria-label="вымарано">'+'█'.repeat(n)+'</span>';

  function profile(){
    const s=sanity(),value=Number.isFinite(window.readerSanity?.current?.())?window.readerSanity.current():s.value;
    const ranked=Object.keys({...data.visits,...data.dwell}).sort((a,b)=>(data.dwell[b]||0)-(data.dwell[a]||0)||(data.visits[b]||0)-(data.visits[a]||0));
    const leaves=s.opened.filter(k=>k.startsWith('leaf:')).length,posts=s.opened.filter(k=>k.startsWith('postscript:')).length;
    const visits=Object.values(data.visits).reduce((a,b)=>a+b,0);
    return {value,ranked,leaves,posts,visits,read:Object.keys(data.visits).length,notes:noteCount(),rests:data.rests,first:data.first};
  }
  function condition(v){
    return v>=70?'Различает собственные воспоминания.':v>=40?'Связывает отдельные свидетельства.':v>=15?'Удерживает чужую память.':'Бодрствует. Шов натянут.';
  }
  function revealed(){
    const opened=sanity().opened;
    if(opened.includes('leaf:key-ticket')||opened.includes('leaf:key-rest')||opened.filter(k=>k.startsWith('leaf:')).length>=10)return true;
    try{return (JSON.parse(localStorage.getItem('miskatonic.consumed.v1')||'null')?.count||0)>0;}catch{return false;}
  }
  // Если книга уже поглотила читателя в этом браузере, она это помнит.
  function previous(){
    try{
      const r=JSON.parse(localStorage.getItem('miskatonic.consumed.v1')||'null');
      if(!r||!Number.isInteger(r.count)||r.count<1)return '';
      let d='';try{d=new Date(r.last).toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'});}catch{}
      return '<p class="lector-previous">Переплёт уже закрывался над вашей записью '+esc(d)+(r.bait?'. Сохранённый образ — «'+esc(r.bait)+'»':'')+'. Наблюдение возобновлено. Прежние находки и заметки остались в книге.</p>';
    }catch{return '';}
  }
  function open(){
    if(!revealed()){
      openFolio('<div class="open-book secret-book"><section class="book-page verso"><span class="folio-kicker">Последний раздел описи</span><h2>Заклеенный клапан</h2><p>Под полоской старой бумаги прощупывается карточка. Название закрыто. Вельт оставил на полях: «Сопоставить с билетом и незанятым креслом».</p><p>Проследите историю ключа или соберите десять тайных листов: отдельные графы станут различимы.</p><a href="#entry/yog">След ключа →</a><div class="folio-page">Опись · клапан</div></section><section class="book-page recto"><h3>Место не заполнено</h3><p class="owner-witness">Здесь не пусто. Просто мы пока не умеем это прочитать.<cite>Марта Рейн</cite></p><a href="#contents">Вернуться к оглавлению →</a><div class="folio-page">Оборот клапана</div></section></div>','spread-mode secret-mode');return;
    }
    const p=profile(),stage=p.value>=70?0:p.value>=40?1:2;
    let date='—';try{date=new Date(p.first).toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'});}catch{}
    const bait=p.ranked[0]?'«'+name(p.ranked[0])+'»':'ещё не подобрана';
    const second=p.ranked.slice(1,3).map(id=>'«'+name(id)+'»').join(', ')||'—';
    const retreat=p.rests===0?'Не отступает.':p.rests<3?'Отступал '+p.rests+' '+plural(p.rests,'раз','раза','раз')+'. Возвращался.':'Склонен отступать ('+p.rests+'). Возвращается всегда.';
    const rows=[
      ['Поступил в коллекцию',date,0],
      ['Статей прочитано',p.read+' из '+(window.ENTRIES?.length||120)+' · заходов: '+p.visits,0],
      ['Устойчивый образ',bait,0],
      ['Сопутствующие образы',second,1],
      ['Вскрыто тайных листов',String(p.leaves),1],
      ['Прочитано опасных приписок',String(p.posts),1],
      ['Пометки на полях',p.notes?p.notes+' — почерк сохранён':'не оставлял',1],
      ['Отступления в читальный зал',retreat,2],
      ['Рассудок',p.value+' / 100',2],
      ['Состояние образца',condition(p.value),2]
    ];
    const card='<dl class="lector-card">'+rows.map(([k,v,need])=>'<div><dt>'+esc(k)+'</dt><dd>'+(stage>=need?esc(v):bar(Math.max(4,Math.min(18,String(v).length))))+'</dd></div>').join('')+'</dl>';
    const done=p.leaves>=10&&p.value<40;
    const verdict=stage===2?'<p class="third-hand lector-verdict">'+(done?'Память удержана. Связи между записями устойчивы. При нуле рассудка шов замкнётся; наблюдение сохранится.':'Связи ещё неполны. Наблюдение продолжается.')+'<cite>неустановленный почерк · карточка наблюдения</cite></p>'
      :'<p class="tier-hint">Часть граф ещё не проступила. Они заполняются по мере того, как падает рассудок читателя.</p>';
    openFolio('<div class="open-book secret-book lector-book"><section class="book-page verso"><span class="folio-kicker">Опись тома · запись № 122</span><h2>Homo lector</h2><p class="book-latin">Человек читающий</p>'+
      '<p class="owner-scholar">Последняя графа описи. Основной текст похож на почерк Торпа; даты вписаны позднее. Графа меняется при чтении.<cite>Артур Вельт · сыщик, бывший инспектор</cite></p>'+
      '<p class="owner-witness">Если вы это читаете, графа уже открыта. Закройте книгу. Пожалуйста.<cite>Марта Рейн · частная сыщица</cite></p>'+
      previous()+
      '<p class="secret-disclaimer">Карточка составлена только по данным этого браузера: какие страницы вы открывали и как долго на них оставались. Ничего никуда не передаётся'+(persistent?'':'; хранилище недоступно, карточка забудется после закрытия страницы')+'.</p>'+
      '<nav class="secret-links"><a href="#secret/case-file">← Дело № 17</a><a href="#reading-room">В читальный зал</a><a href="#contents">Оглавление</a></nav><div class="folio-page">№ 122</div></section>'+
      '<section class="book-page recto"><span class="folio-kicker">Карточка сбора образца</span><h3>Естественная история существ, не описанных Линнеем</h3>'+card+verdict+'<div class="folio-page">№ 122 · оборот</div></section></div>','spread-mode secret-mode');
  }
  // Ссылки на карточку из досье и читального зала.
  function decorate(host,hash){
    const link='<a class="ink-link lector-link" href="#lector">'+(revealed()?'Последняя запись описи: Homo lector':'Заклеенный клапан в конце описи')+' →</a>';
    if(hash==='#secret/case-file')host.querySelector('.detective-dossier .secret-links')?.insertAdjacentHTML('afterbegin',link);
    if(hash==='#reading-room')host.querySelector('.sanity-room .recto .folio-page')?.insertAdjacentHTML('beforebegin','<p>'+link+'</p>');
  }
  window.homoLector=Object.freeze({open,decorate,visits:id=>data.visits[id]||0,profile,revealed});
})();
