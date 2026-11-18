'use strict';
/* Аномалии страницы (GSAP): каждая опирается на то, что о существе сказано у Лавкрафта и его круга.
   Без линий, ряби и мельтешения — медленно и тихо. Срабатывают только на действия читателя; таймеров нет.
   Сила зависит от рассудка: 70+ — ничего, 40–69 — можно заметить, ниже 40 — явно.
   Без GSAP или при «уменьшить движение» — тот же смысл без анимации. */
(function(){
  const KEY='miskatonic.anomalies.v1';
  const reduce=typeof matchMedia==='function'?matchMedia('(prefers-reduced-motion: reduce)'):{matches:false};
  const level=()=>{const v=window.readerSanity?.current?.();return Number.isFinite(v)?v:100;};
  const stageOf=v=>v<40?2:v<70?1:0;
  function read(){try{const d=JSON.parse(localStorage.getItem(KEY)||'null');if(d&&typeof d.stains==='object')return d;}catch{}return {stains:{}};}
  function write(d){try{localStorage.setItem(KEY,JSON.stringify(d));}catch{}}
  const mark=(tag,cls,html='')=>{const n=document.createElement(tag);n.className=cls;n.innerHTML=html;n.setAttribute('aria-hidden','true');return n;};
  const quiet=el=>el?.closest?.('a,button,textarea,input,summary,details,.sanity-lock,[data-sanity-unlock],.anomaly-eye,.carried,.fx-word,.rlyeh-whisper');
  let registered=false,uid=0;
  function fx(){
    const g=window.gsap;if(!g||reduce.matches)return null;
    if(!registered){if(window.ScrambleTextPlugin)g.registerPlugin(window.ScrambleTextPlugin);registered=true;}
    return g;
  }
  const RUNES='ᚾᛇᚨᚱᛚᛏᚺᛟᛖᛈᛉᛞᚦᛋ';
  // Слово под курсором (или null), без разметки.
  function caret(e,book){
    let node=null,offset=0;
    if(document.caretPositionFromPoint){const p=document.caretPositionFromPoint(e.clientX,e.clientY);if(p){node=p.offsetNode;offset=p.offset;}}
    else if(document.caretRangeFromPoint){const r=document.caretRangeFromPoint(e.clientX,e.clientY);if(r){node=r.startContainer;offset=r.startOffset;}}
    if(!node||node.nodeType!==3||!book.contains(node)||quiet(node.parentElement))return null;
    return {node,offset};
  }

  // Псы Тиндалоса («Псы Тиндалоса», Лонг): приходят через углы, с языка капает голубая слизь.
  // Задержка курсора в углу — из угла медленно проступает синее пятно.
  function hound(book,s){
    if(!s)return;
    for(const page of book.querySelectorAll('.book-page')){
      const hits={};
      page.addEventListener('pointermove',e=>{
        const r=page.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,z=56;
        const h=x<z?'l':x>r.width-z?'r':'',v=y<z?'t':y>r.height-z?'b':'';
        if(!h||!v)return;
        const k=v+h;hits[k]=(hits[k]||0)+1;
        if(hits[k]!==(s===2?10:28))return;
        const id='hd'+(++uid),R=s===2?230:140,size=R+30,cx=h==='l'?0:size,cy=v==='t'?0:size;
        const stain=mark('span','anomaly-hound anomaly-'+k,
          '<svg width="'+size+'" height="'+size+'" viewBox="0 0 '+size+' '+size+'"><defs>'+
          '<radialGradient id="'+id+'g"><stop offset="0" stop-color="#0f2a7a" stop-opacity=".88"/><stop offset=".5" stop-color="#244c9e" stop-opacity=".42"/><stop offset="1" stop-color="#2e5cb4" stop-opacity="0"/></radialGradient>'+
          '<filter id="'+id+'f" x="-40%" y="-40%" width="180%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".025" numOctaves="3" seed="'+uid+'"/><feDisplacementMap in="SourceGraphic" scale="34"/></filter></defs>'+
          '<g filter="url(#'+id+'f)"><circle class="bleed" cx="'+cx+'" cy="'+cy+'" r="'+R+'" fill="url(#'+id+'g)"/></g></svg>');
        page.append(stain);
        const g=fx();if(!g)return;
        g.from(stain.querySelector('.bleed'),{attr:{r:4},duration:4,ease:'sine.out'});
        g.fromTo(stain.querySelector('feDisplacementMap'),{attr:{scale:90}},{attr:{scale:34},duration:4,ease:'sine.out'});
      });
    }
  }

  // Шоггот («Хребты Безумия»): «мириады временных глаз, что возникали и исчезали, как гнойники зеленоватого света».
  // Между словами открываются глаза и следят за курсором; когда появляется новый, старый закрывается и тает.
  const EYE='M1 6Q12-4 23 6Q12 16 1 6Z';
  function makeEye(){
    const id='ey'+(++uid);
    const eye=mark('span','anomaly-eye','<svg viewBox="0 0 24 12"><defs><clipPath id="'+id+'"><path d="'+EYE+'"/></clipPath></defs><path class="white" d="'+EYE+'"/><g clip-path="url(#'+id+')"><g class="look"><circle class="iris" cx="12" cy="6" r="3.8"/><circle class="pupil" cx="12" cy="6" r="1.7"/></g><rect class="lid" x="-1" y="0" width="26" height="13"/></g><path class="rim" d="'+EYE+'"/></svg>');
    const g=fx(),lid=eye.querySelector('.lid');
    if(g){g.fromTo(lid,{attr:{y:0}},{attr:{y:-13},duration:1.1,ease:'sine.out'});g.from(eye,{width:0,opacity:0,duration:.9,ease:'sine.out'});}
    else lid.setAttribute('y','-13');
    return eye;
  }
  function closeEye(eye){
    const g=fx(),lid=eye.querySelector('.lid');
    if(!g){eye.remove();return;}
    g.to(lid,{attr:{y:0},duration:.6,ease:'sine.in'});
    g.to(eye,{width:0,opacity:0,margin:0,duration:1.2,delay:.5,ease:'sine.in',onComplete:()=>eye.remove()});
  }
  function shoggoth(book,s){
    if(!s)return;
    let moves=0;const open=[],keepOpen=s===2?6:2,every=s===2?22:60;
    book.addEventListener('pointermove',e=>{
      for(const it of open){
        const r=it.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),d=Math.hypot(dx,dy)||1;
        it.querySelector('.look').setAttribute('transform','translate('+(dx/d*Math.min(4,d/30)).toFixed(2)+' '+(dy/d*Math.min(2,d/60)).toFixed(2)+')');
      }
      if(++moves%every)return;
      const at=caret(e,book);if(!at)return;
      const i=at.node.textContent.indexOf(' ',at.offset);if(i<0)return;
      const rest=at.node.splitText(i+1),eye=makeEye();
      rest.parentNode.insertBefore(eye,rest);open.push(eye);
      while(open.length>keepOpen)closeEye(open.shift());
    });
  }

  // Ньярлатхотеп: «тысяча обличий». Описание при каждом визите носит другую маску;
  // когда читатель подводит курсор к строке, слово медленно рассыпается рунами и становится другим.
  const masks=[
    [/Странник/g,['Фараон','Посланник','Тёмный человек','Ваш знакомый']],
    [/Египта/g,['Кхема','пустыни','ниоткуда','соседней улицы']],
    [/публику/g,['читателей','вас','полный зал','нас']],
    [/Зрители/g,['Читатели','Свидетели','Мы','Вы']],
    [/кошмары/g,['одни и те же сны','его голоса','эти страницы','вы']],
    [/научные приборы/g,['стеклянные приборы','книгу','ваше имя','подарок']]
  ];
  function textNodes(book){
    const walker=document.createTreeWalker(book,4),nodes=[];
    while(walker.nextNode())if(!quiet(walker.currentNode.parentElement))nodes.push(walker.currentNode);
    return nodes;
  }
  function wrapMask(book,re,word,spans){
    for(const n of textNodes(book)){
      const t=n.textContent;re.lastIndex=0;if(!re.test(t))continue;re.lastIndex=0;
      const frag=document.createDocumentFragment();let last=0,m;
      while((m=re.exec(t))){
        frag.append(t.slice(last,m.index));
        const sp=document.createElement('span');sp.className='mask-word';sp.dataset.mask=word;sp.textContent=m[0];
        frag.append(sp);spans.push(sp);last=re.lastIndex;
      }
      frag.append(t.slice(last));n.replaceWith(frag);
    }
  }
  function nyarlathotep(book,s,visits){
    if(!s||visits<2)return;
    const order=masks.map((_,i)=>masks[(i+visits)%masks.length]);
    const count=s===2?order.length:1+visits%2,spans=[];
    for(const [re,alts] of order.slice(0,count))wrapMask(book,re,alts[visits%alts.length],spans);
    if(s===2)wrapMask(book,/по рассказу/g,'по моему рассказу',spans);
    const g=fx();
    for(const sp of spans){
      if(!g||!window.ScrambleTextPlugin){sp.textContent=sp.dataset.mask;continue;}
      const host=sp.closest('p,li,blockquote,cite')||sp.parentElement;
      host.addEventListener('pointerenter',()=>{if(sp.dataset.done)return;sp.dataset.done='1';
        g.to(sp,{duration:2.4,scrambleText:{text:sp.dataset.mask,chars:RUNES,speed:.25,revealDelay:.6},ease:'none'});});
    }
  }

  // Глубоководные («Тень над Иннсмутом»): всё в доме пахнет рыбой и сыростью.
  // Клик оставляет мокрое пятно, которое медленно расползается и остаётся на странице; ниже 40 — след перепончатой ладони.
  const HAND='<svg viewBox="0 0 60 72"><path d="M30 70C14 68 8 56 10 44L3 22C2 16 9 14 11 19L17 35 15 11C15 4 23 4 23 11L25 33 27 7C28 0 36 0 36 7L35 33 40 13C42 7 49 8 47 15L42 39C50 31 57 35 53 41C47 51 45 68 30 70Z"/></svg>';
  function deepOnes(book,s,id){
    const d=read(),list=d.stains[id]||[];
    book.classList.add('anomaly-host');
    const draw=(p,animate)=>{
      const w=mark('span','anomaly-wet'+(p.h?' hand':'')+(s===0?' faint':''),p.h?HAND:'');
      w.style.left=p.x+'%';w.style.top=p.y+'%';w.style.setProperty('--r',p.r+'px');book.append(w);
      const g=animate&&fx();if(g)g.from(w,{scale:.1,opacity:0,duration:3.5,ease:'sine.out'});
    };
    list.forEach(p=>draw(p,false));
    if(!s)return;
    book.addEventListener('click',e=>{
      if(quiet(e.target))return;
      const r=book.getBoundingClientRect();
      const p={x:+((e.clientX-r.left)/r.width*100).toFixed(1),y:+((e.clientY-r.top)/r.height*100).toFixed(1),r:s===2?90:55,h:s===2&&e.detail%2===1};
      draw(p,true);const all=read();all.stains[id]=[...(all.stains[id]||[]),p].slice(-12);write(all);
    });
  }

  // Ктулху («Зов Ктулху»): спит и шлёт сны. Если долго смотреть на рисунок, под ним проступает строка из культового напева;
  // ниже 40 — и её перевод, записанный Леграссом.
  const CHANT='Ph’nglui mglw’nafh Cthulhu R’lyeh wgah’nagl fhtagn.';
  const CHANT_RU='«В своём доме в Р’льехе мёртвый Ктулху спит, ожидая».';
  function cthulhu(book,s){
    const art=book.querySelector('.specimen-art');if(!art||!s)return;
    const line=mark('p','rlyeh-whisper','<span class="chant"></span>'+(s===2?'<span class="chant-ru"></span>':''));
    art.append(line);
    let moves=0,shown=false;
    art.addEventListener('pointermove',()=>{
      if(shown||++moves<(s===2?40:90))return;shown=true;
      const g=fx(),chant=line.querySelector('.chant'),ru=line.querySelector('.chant-ru');
      line.removeAttribute('aria-hidden');
      if(!g){chant.textContent=CHANT;if(ru)ru.textContent=CHANT_RU;return;}
      chant.innerHTML=[...CHANT].map(ch=>'<span>'+(ch===' '?'&nbsp;':ch)+'</span>').join('');
      g.from(chant.children,{opacity:0,filter:'blur(3px)',duration:1.2,stagger:.06,ease:'sine.out'});
      if(ru){ru.textContent=CHANT_RU;g.from(ru,{opacity:0,duration:2.5,delay:CHANT.length*.06+.8,ease:'sine.out'});}
    });
  }

  // Йог-Сотот («Ужас Данвича»): «Йог-Сотот — врата, Йог-Сотот — ключ и страж врат».
  // На гравюре проступает замочная скважина; клик — страница медленно втягивается в неё.
  function yog(book,s){
    const art=book.querySelector('.specimen-art .living');if(!art||!s)return;
    const key=document.createElement('a');
    key.href='#lector';key.className='anomaly-keyhole'+(s===2?' open':'');
    key.setAttribute('aria-label','Замочная скважина: лист, которого нет в оглавлении');
    key.title='Йог-Сотот — ключ и страж врат';
    key.innerHTML='<svg viewBox="0 0 20 34" aria-hidden="true"><circle cx="10" cy="10" r="7"/><path d="M6.5 14 3 32h14l-3.5-18"/></svg>';
    art.classList.add('anomaly-host');art.append(key);
    const g=fx();if(!g)return;
    if(s===2)g.from(key,{scale:0,opacity:0,duration:2.4,delay:.8,ease:'sine.out'});
    key.addEventListener('click',e=>{
      const folio=document.getElementById('folio');if(!folio)return;
      e.preventDefault();
      const r=key.getBoundingClientRect(),f=folio.getBoundingClientRect();
      const at=(r.left+r.width/2-f.left).toFixed(0)+'px '+(r.top+r.height*.4-f.top).toFixed(0)+'px';
      g.fromTo(folio,{clipPath:'circle(150% at '+at+')'},{clipPath:'circle(0% at '+at+')',duration:1.6,ease:'sine.inOut',onComplete:()=>{
        location.hash='#lector';
        g.set(folio,{clearProps:'clipPath'});
        g.from(folio,{opacity:0,duration:1.4,ease:'sine.out',clearProps:'opacity'});
      }});
    });
  }

  // Ми-го («Шепчущий во тьме»): жужжащие голоса, которые подражают человеческой речи.
  // Когда курсор подходит к эпиграфу, фраза на мгновение превращается в жужжание — и снова в слова.
  const buzz=t=>[...t].map((ch,i)=>/[А-Яа-яЁё]/.test(ch)?'жзжшзж'[i%6]:ch).join('');
  function migo(book,s){
    if(!s)return;
    const g=fx();
    for(const p of book.querySelectorAll('.guide-epigraph p,.voice-ru')){
      const text=p.textContent;
      p.addEventListener('pointerenter',()=>{
        if(p.dataset.buzzed)return;p.dataset.buzzed='1';
        if(!g||!window.ScrambleTextPlugin){p.textContent=buzz(text);return;}
        g.timeline()
          .to(p,{duration:1.6,scrambleText:{text:buzz(text),chars:'жзшщ',speed:.3},ease:'none'})
          .to(p,{duration:1.8,delay:s===2?1.4:.4,scrambleText:{text,chars:'жзшщ',speed:.3},ease:'none'});
      });
    }
  }

  // Ночные призраки («Сомнамбулический поиск неведомого Кадата»): безликие, безмолвные, хватают и уносят.
  // Если курсор задерживается на тексте, слово под ним медленно поднимается и исчезает, оставляя пустое место.
  function nightgaunts(book,s){
    if(!s)return;
    let moves=0,taken=0;const max=s===2?4:1,every=s===2?30:80;
    book.addEventListener('pointermove',e=>{
      if(taken>=max||++moves%every)return;
      const at=caret(e,book);if(!at)return;
      const t=at.node.textContent;
      let a=at.offset,b=at.offset;
      while(a>0&&/[\p{L}-]/u.test(t[a-1]))a--;
      while(b<t.length&&/[\p{L}-]/u.test(t[b]))b++;
      if(b-a<3)return;
      const word=at.node.splitText(a);word.splitText(b-a);
      const sp=document.createElement('span');sp.className='carried';sp.textContent=word.textContent;word.replaceWith(sp);
      taken++;
      const g=fx();
      if(g)g.to(sp,{y:-34,opacity:0,duration:3.2,ease:'sine.in'});else sp.style.visibility='hidden';
    });
  }


  /* ---------- Общие эффекты для остальных существ и богов ---------- */
  const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  // Слово под курсором заворачивается в отдельный элемент, с которым и происходит эффект.
  function wordAt(e,book){
    const at=caret(e,book);if(!at)return null;
    const t=at.node.textContent;let a=at.offset,b=at.offset;
    while(a>0&&/[\p{L}-]/u.test(t[a-1]))a--;
    while(b<t.length&&/[\p{L}-]/u.test(t[b]))b++;
    if(b-a<3)return null;
    const w=at.node.splitText(a);w.splitText(b-a);
    const sp=document.createElement('span');sp.className='fx-word';sp.textContent=w.textContent;w.replaceWith(sp);
    return sp;
  }
  const letters=sp=>{const text=sp.textContent;sp.setAttribute('aria-label',text);sp.innerHTML=[...text].map(c=>'<span class="fx-ch" aria-hidden="true">'+esc(c)+'</span>').join('');return [...sp.children];};
  const pick=(arr,share)=>arr.filter((_,i)=>((i*7+3)%10)/10<share);

  // Что происходит со словом под курсором. Каждый эффект — медленный и однократный.
  const WORD={
    gnaw(sp,g,s){const cs=letters(sp);g.to(pick(cs,s===2?.5:.3),{opacity:0,scale:.4,duration:1,stagger:.3,ease:'sine.in'});if(s===2)g.to(cs,{color:'#5a1610',duration:2});},
    burrow(sp,g){g.to(sp,{y:11,opacity:.12,duration:3.2,ease:'sine.in'});},
    frost(sp,g){g.to(sp,{color:'#6f97b0',textShadow:'0 0 6px rgba(225,242,255,.95)',duration:3.5,ease:'sine.out'});},
    burn(sp,g){g.timeline().to(sp,{color:'#c8581a',textShadow:'0 0 8px rgba(255,140,40,.75)',duration:1.8,ease:'sine.in'}).to(sp,{color:'#2a1a10',textShadow:'0 0 0 rgba(0,0,0,0)',duration:2.6,ease:'sine.out'});},
    fade(sp,g){g.timeline().to(sp,{opacity:0,duration:2.2,ease:'sine.inOut'}).to(sp,{opacity:1,duration:2.2,delay:2.6,ease:'sine.inOut'});},
    bleed(sp,g){const cs=letters(sp);g.to(sp,{color:'#7a0c0c',duration:2.4,ease:'sine.in'});g.to(pick(cs,.35),{y:4,scaleY:1.35,transformOrigin:'50% 0%',duration:3.4,ease:'sine.in'});},
    sink(sp,g){const cs=letters(sp);g.to(cs,{y:()=>2+Math.random()*5,opacity:.62,duration:3.6,stagger:.09,ease:'sine.in'});},
    scatter(sp,g){const cs=letters(sp);g.timeline()
      .to(cs,{x:()=>(Math.random()-.5)*44,y:()=>(Math.random()-.5)*30,rotation:()=>(Math.random()-.5)*70,duration:2.6,stagger:.03,ease:'sine.out'})
      .to(cs,{x:0,y:0,rotation:0,duration:2.6,delay:1.2,ease:'sine.inOut'});},
    dance(sp,g){const cs=letters(sp);g.to(cs,{y:-5,duration:.6,yoyo:true,repeat:5,stagger:.13,ease:'sine.inOut'});},
    multiply(sp,g,s){sp.classList.add('fx-host');for(let i=0;i<(s===2?3:1);i++){const twin=document.createElement('span');twin.className='fx-twin';twin.setAttribute('aria-hidden','true');twin.textContent=sp.textContent;sp.append(twin);
      g.fromTo(twin,{opacity:0,x:0,y:0},{opacity:.28,x:(i%2?-1:1)*(6+i*5),y:(i-1)*5,duration:3,delay:i*.6,ease:'sine.out'});}},
    petrify(sp,g){g.to(sp,{color:'#6d685e',textShadow:'0 1px 0 rgba(255,255,255,.7),0 -1px 0 rgba(40,36,30,.55)',letterSpacing:'.04em',duration:3.2,ease:'sine.inOut'});},
    web(sp,g,s,book){const b=book.getBoundingClientRect(),r=sp.getBoundingClientRect();
      g.to(sp,{x:(b.left+b.width/2-r.left)*.07,y:(b.top+b.height*.45-r.top)*.07,color:'#5a5560',duration:3.8,ease:'sine.inOut'});},
    glow(sp,g,s,book,o){g.to(sp,{textShadow:'0 0 10px '+(o.glow||'rgba(150,220,200,.9)'),color:o.ink||'#2e5a52',duration:2.6,ease:'sine.out'});},
    song(sp,g){const cs=letters(sp);g.to(cs,{y:i=>Math.sin(i*.9)*4,duration:2.2,stagger:.06,ease:'sine.inOut'});},
    flutter(sp,g){const cs=letters(sp);g.fromTo(cs,{rotation:0},{rotation:()=>(Math.random()-.5)*16,duration:.7,yoyo:true,repeat:1,stagger:.05,ease:'sine.inOut'});},
    slither(sp,g){const cs=letters(sp);g.to(cs,{y:i=>Math.sin(i*1.2)*3,duration:1.6,stagger:.07,yoyo:true,repeat:1,ease:'sine.inOut'});},
    hiss(sp,g){const w=sp.textContent;if(!window.ScrambleTextPlugin)return;g.timeline().to(sp,{duration:1.4,scrambleText:{text:'с'.repeat(w.length),chars:'сшз',speed:.3},ease:'none'}).to(sp,{duration:1.6,delay:.9,scrambleText:{text:w,chars:'сшз',speed:.3},ease:'none'});},
    mask(sp,g){const w=sp.textContent;if(!window.ScrambleTextPlugin)return;g.timeline().to(sp,{duration:1.6,scrambleText:{text:[...w].map((_,i)=>RUNES[i%RUNES.length]).join(''),chars:RUNES,speed:.3},ease:'none'}).to(sp,{duration:1.8,delay:1.2,scrambleText:{text:w,chars:RUNES,speed:.3},ease:'none'});},
    swap(sp,g,s,book,o,st){const prev=st.prev;st.prev=sp;if(!prev||!prev.isConnected||!window.ScrambleTextPlugin)return;st.prev=null;
      const a=prev.textContent,b=sp.textContent;
      g.to(prev,{duration:2.2,scrambleText:{text:b,chars:RUNES,speed:.25},ease:'none'});g.to(sp,{duration:2.2,scrambleText:{text:a,chars:RUNES,speed:.25},ease:'none'});},
    trample(sp,g){g.to(sp,{scaleY:.45,scaleX:1.12,transformOrigin:'50% 100%',color:'#3b362e',duration:.6,ease:'power3.in'});},
    shamble(sp,g){g.timeline().to(sp,{x:22,opacity:.12,duration:1.3,ease:'sine.in'}).to(sp,{x:0,opacity:1,duration:1.5,delay:1.8,ease:'sine.out'});},
    hop(sp,g){g.timeline().to(sp,{y:-12,duration:.4,ease:'power2.out'}).to(sp,{y:0,duration:.6,ease:'power2.in'});},
    carry(sp,g){g.to(sp,{y:-34,opacity:0,duration:3.2,ease:'sine.in'});}
  };
  // Без GSAP — тот же смысл без движения.
  const STILL={gnaw:sp=>{sp.style.opacity=.35;},burrow:sp=>{sp.style.opacity=.12;},frost:sp=>{sp.style.color='#6f97b0';},burn:sp=>{sp.style.color='#2a1a10';},
    fade:()=>{},bleed:sp=>{sp.style.color='#7a0c0c';},sink:sp=>{sp.style.opacity=.62;},petrify:sp=>{sp.style.color='#6d685e';},trample:sp=>{sp.style.color='#3b362e';},carry:sp=>{sp.style.visibility='hidden';}};
  function words(book,s,o){
    if(!s)return;
    const g=fx(),fn=WORD[o.word],st={};
    let moves=0,done=0;const max=s===2?6:2,every=s===2?26:70;
    book.addEventListener('pointermove',e=>{
      if(done>=max||++moves%every)return;
      const sp=wordAt(e,book);if(!sp)return;done++;
      if(g)fn(sp,g,s,book,o,st);else STILL[o.word]?.(sp);
    });
  }

  // Строка из текстов под рисунком (как напев Ктулху).
  function whisper(book,s,o){
    const art=book.querySelector('.specimen-art');if(!art||!s)return;
    const line=mark('p','rlyeh-whisper'+(o.tone?' tone-'+o.tone:''),'<span class="chant"></span>'+(s===2&&o.ru?'<span class="chant-ru"></span>':''));
    art.append(line);
    let moves=0,shown=false;
    art.addEventListener('pointermove',()=>{
      if(shown||++moves<(s===2?40:90))return;shown=true;
      const g=fx(),chant=line.querySelector('.chant'),ru=line.querySelector('.chant-ru');
      line.removeAttribute('aria-hidden');
      if(!g){chant.textContent=o.text;if(ru)ru.textContent=o.ru;return;}
      chant.innerHTML=[...o.text].map(ch=>'<span>'+(ch===' '?'&nbsp;':esc(ch))+'</span>').join('');
      g.from(chant.children,{opacity:0,filter:'blur(3px)',duration:1.2,stagger:.06,ease:'sine.out'});
      if(ru){ru.textContent=o.ru;g.from(ru,{opacity:0,duration:2.5,delay:o.text.length*.06+.8,ease:'sine.out'});}
    });
  }

  // Тьма, в которой видно только пятно вокруг курсора (свет губителен для Обитающего во тьме),
  // или пелена, сквозь которую проступает лишь то, на что смотришь (Страж врат под покрывалом).
  function shroud(book,s,o){
    if(!s)return;
    book.classList.add('anomaly-host');
    const layer=mark('div','anomaly-shroud '+o.book);book.append(layer);
    const g=fx();let started=false;
    book.addEventListener('pointermove',e=>{
      const r=book.getBoundingClientRect();
      layer.style.setProperty('--x',(e.clientX-r.left)+'px');layer.style.setProperty('--y',(e.clientY-r.top)+'px');
      if(started)return;started=true;
      const to=s===2?1:.55;
      if(g)g.to(layer,{opacity:to,duration:6,ease:'sine.in'});else layer.style.opacity=to;
    });
    book.addEventListener('pointerleave',()=>{started=false;if(g)g.to(layer,{opacity:0,duration:2.5,ease:'sine.out'});else layer.style.opacity=0;});
  }

  // Глаза в тексте с настройками (цвет радужки, сколько открыто сразу).
  function eyes(book,s,o){
    if(!s)return;
    book.style.setProperty('--iris',o.iris||'#5d7a26');if(o.big)book.classList.add('eyes-big');
    let moves=0;const open=[],keepOpen=Math.min(o.max||3,s===2?6:2),every=s===2?24:60;
    book.addEventListener('pointermove',e=>{
      for(const it of open){
        const r=it.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),d=Math.hypot(dx,dy)||1;
        it.querySelector('.look').setAttribute('transform','translate('+(dx/d*Math.min(4,d/30)).toFixed(2)+' '+(dy/d*Math.min(2,d/60)).toFixed(2)+')');
      }
      if(++moves%every)return;
      const at=caret(e,book);if(!at)return;
      const i=at.node.textContent.indexOf(' ',at.offset);if(i<0)return;
      const rest=at.node.splitText(i+1),eye=makeEye();
      rest.parentNode.insertBefore(eye,rest);open.push(eye);
      while(open.length>keepOpen)closeEye(open.shift());
    });
  }

  // Пятна от клика с цветом (морская вода, слизь, жир, яд).
  function stains(book,s,o,id){
    book.classList.add('anomaly-host','stain-'+(o.color||'sea'));
    deepOnes(book,s,id);
  }

  // Кто что делает. Источник черты — в комментарии.
  const GENERIC={
    'azathoth':{word:'scatter'},                                   // слепой хаос, «безумные флейты»
    'shub':{word:'multiply',whisper:{text:'Iä! Shub-Niggurath!',ru:'«Чёрная Коза Лесов с Легионом Младых!»',tone:'green'}}, // «Шепчущий во тьме»
    'dagon':{book:'stain',color:'sea',whisper:{text:'Iä! R’lyeh! Cthulhu fhtagn! Iä! Iä!',ru:'Так клялись в Эзотерическом ордене Дагона.',tone:'sea'}},
    'chaugnar-faugn':{word:'bleed'},                               // статуя, пьющая кровь
    'hastur':{book:'veil',whisper:{text:'Have you found the Yellow Sign?',ru:'«Нашли ли вы Жёлтый знак?» — Р. Чемберс, «Король в жёлтом»',tone:'ochre'}},
    'tsathoggua':{word:'sink'},                                    // вечно сонный бог
    'hydra':{word:'sink'},                                         // всё уходит под воду
    'yig':{word:'slither'},                                        // отец змей
    'ghatanothoa':{word:'petrify'},                                // взгляд, превращающий в мумию
    'bokrug':{word:'sink',whisper:{text:'The doom that came to Sarnath',ru:'«Рок, пришедший в Сарнат»',tone:'sea'}},
    'nodens':{word:'glow',glow:'rgba(210,225,240,.95)',ink:'#3c4d63'}, // владыка бездны, противник Иных богов
    'ithaqua':{word:'frost'},                                      // шагающий по ветру, «Вендиго»
    'abhoth':{word:'multiply'},                                    // источник нечистых порождений
    'atlach-nacha':{word:'web'},                                   // паук, ткущий между мирами
    'great-ones':{word:'fade',whisper:{text:'The other gods! The other gods!',ru:'«Боги внешних адов, что стерегут слабых богов Земли!» — «Иные боги»',tone:'stone'}},
    'bugg-shash':{book:'eyes',iris:'#6d7f22',max:6},                // глаза и рты по всей массе
    'byatis':{book:'eyes',iris:'#8a2a1a',max:1,big:true},           // одноглазый
    'glaaki-god':{book:'stain',color:'slime'},                     // обитатель озера
    'daoloth':{word:'scatter'},                                    // разрывающий завесы
    'cthugha':{word:'burn'},                                       // живое пламя
    'rhan-tegoth':{book:'eyes',iris:'#9a1d10',max:3},              // три выпуклых глаза
    'ubbo-sathla':{word:'sink'},                                   // всё возвращается в праматерь
    'umr-at-tawil':{book:'veil'},                                  // страж под покрывалом
    'shudde-mell':{word:'burrow'},                                 // роющий в глубине
    'gug':{word:'gnaw'},                                           // людоеды подземья
    'zoog':{word:'flutter'},                                       // «трепещущий язык» зугов
    'moon-beast':{book:'stain',color:'grease'},                   // жирные, мерзко пахнущие
    'shantak':{word:'carry'},                                      // носят всадников
    'brown-jenkin':{word:'gnaw'},                                  // грызун с человеческим лицом
    'elder-things':{word:'song'},                                  // говорили «свистящими звуками»
    'yith':{word:'swap'},                                          // обмен разумом
    'flying-polyps':{word:'fade'},                                 // то видимы, то нет
    'ghouls':{word:'gnaw'},                                        // пожиратели мертвецов
    'haunter':{book:'darkness'},                                   // живёт во тьме, свет губителен
    'dunwich-horror':{word:'trample'},                             // невидимый, оставляет вмятины
    'byakhee':{word:'carry'},                                      // межзвёздные скакуны
    'chthonian':{word:'burrow'},                                   // подземные черви
    'dark-young':{word:'multiply'},                                // младые Шуб-Ниггурат
    'dhole':{word:'burrow'},                                       // колоссальные черви
    'dimensional-shambler':{word:'shamble'},                      // ковыляет между измерениями
    'formless-spawn':{word:'sink'},                                // жидкая чёрная масса
    'ghast':{word:'hop'},                                          // передвигаются прыжками
    'hunting-horror':{book:'darkness'},                            // слуги Ньярлатхотепа, боятся света
    'serpent-people':{word:'hiss'},                                // прячут змеиную суть под иллюзией
    'servitor':{word:'dance'},                                     // играют на флейтах
    'star-spawn':{word:'sink',whisper:{text:'That is not dead which can eternal lie',ru:'«Не мёртво то, что в вечности пребудет; со смертью времени и смерть умрёт».',tone:'green'}},
    'star-vampire':{word:'bleed'},                                 // невидим, пока не напьётся
    'basilisk':{word:'petrify'},                                   // каменящий взгляд
    'beings-of-ib':{word:'fade'},                                  // безголосые
    'bloop':{word:'glow',glow:'rgba(150,230,230,.9)',ink:'#2f5f5f'},// светится в темноте
    'buopoth':{word:'flutter'},                                    // мирный зверь
    'butterfly-dragon':{word:'flutter'},                           // крылья
    'saturnian-cat':{word:'glow',glow:'rgba(220,170,240,.9)',ink:'#5a3a6a'}, // филигрань
    'cloud-beast':{word:'fade'},                                   // растворяется
    'fire-worm':{word:'burn'},                                     // светится из трещин
    'gnorri':{word:'sink'},                                        // морской народ
    'hemophore':{word:'bleed'},                                    // кровопийца
    'lamp-newt':{word:'glow',glow:'rgba(255,220,140,.95)',ink:'#6a4a16'}, // светящийся тритон
    'larva-outer-gods':{word:'scatter'},                           // бесконечные формы
    'leng-spider':{word:'web'},                                    // ленгские пауки
    'magah-bird':{word:'song'},                                    // певчая
    'leng-man':{word:'mask'},                                      // прячутся под тюрбаном
    'servant-karakal':{word:'burn'},                               // красные молнии
    'voonith':{book:'stain',color:'poison'},                      // ядовитые струпья
    'wamp':{word:'gnaw'},                                          // падальщики
    'kn-yan':{word:'fade'},                                        // развоплощаются
    'nameless-folk':{word:'petrify'},                              // мумии рептилий
    'yaddith-beings':{word:'mask'},                                // колдуны Яддита
    'yekub-beings':{word:'swap'}                                   // обмен телами через кубы
  };
  function generic(book,s,id){
    const o=GENERIC[id];
    if(o.word)words(book,s,o);
    if(o.book==='eyes')eyes(book,s,o);
    if(o.book==='stain')stains(book,s,o,id);
    if(o.book==='darkness'||o.book==='veil')shroud(book,s,o);
    if(o.whisper)whisper(book,s,o.whisper);
  }

  const table={'hound-tindalos':hound,'shoggoth':shoggoth,'nyarlathotep':nyarlathotep,'deep-ones':deepOnes,
    'cthulhu':cthulhu,'yog':yog,'mi-go':migo,'nightgaunts':nightgaunts};
  for(const id of Object.keys(GENERIC))if(!table[id])table[id]=(book,s)=>generic(book,s,id);
  function decorate(host,hash){
    const m=/^#entry\/([^/]+)/.exec(hash||'');if(!m||!table[m[1]])return;
    const book=host.querySelector('.open-book');if(!book)return;
    const id=m[1],s=stageOf(level()),visits=window.homoLector?.visits(id)||1;
    book.dataset.anomaly=id;book.dataset.anomalyStage=s;
    table[id](book,s,id==='deep-ones'?id:visits);
  }
  window.bookAnomalies=Object.freeze({decorate,ids:Object.keys(table)});
})();
