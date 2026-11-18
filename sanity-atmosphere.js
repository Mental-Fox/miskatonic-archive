'use strict';
/* Атмосфера рассудка: чем ниже рассудок, тем темнее книга и тем больше беспорядка в тексте.
   - виньетка по краям экрана сгущается к чёрному (на самом дне — с кровавым отливом);
   - страницы желтеют, гаснут и теряют цвет;
   - на любой странице часть слов сползает со строки, наклоняется, буквы пляшут, наливаются бурым,
     в словах проступают руны, некоторые слова расплываются или двоятся; под курсором слова отползают.
   Всё пересчитывается при открытии страницы и при изменении рассудка; своих таймеров и циклов нет.
   При «уменьшить движение» остаётся статичный беспорядок без анимации. */
(function(){
  const reduce=typeof matchMedia==='function'?matchMedia('(prefers-reduced-motion: reduce)'):{matches:false};
  const RUNES='ᚾᛇᚨᚱᛚᛏᚺᛟᛖᛈᛉᛞᚦᛋ';
  const level=()=>{const v=window.readerSanity?.current?.();return Number.isFinite(v)?Math.max(0,Math.min(100,v)):100;};
  const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
  const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
  // Сила каждого слоя в зависимости от рассудка (0..100). Отдельно, чтобы проверять тестами.
  function levels(v){
    const k=clamp((100-v)/80);                       // к 20 рассудка — максимум
    return {
      vignette:clamp(Math.pow(k,1.1))*.99,           // чернота у краёв
      reach:70-50*k-(v<20?(20-v)/2:0),               // откуда начинается тьма, % радиуса: к нулю — почти от центра
      blood:smooth(45,85,100-v)*.62,                 // кровавый отлив: с 55, в полную силу к 15
      page:smooth(10,80,100-v),                      // страницы гаснут: с 90, полностью к 20
      disorder:smooth(30,80,100-v),                  // беспорядок в тексте: с 70, максимум к 20
      swim:smooth(45,85,100-v)                       // всё плывёт: с 55, в полную силу к 15
    };
  }
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  // ---------- Виньетка и затемнение страниц ----------
  let veil=null,folio=null;const shown={vignette:0,reach:70,blood:0,page:0,swim:0};
  function paint(){
    if(veil){veil.style.setProperty('--v-alpha',shown.vignette.toFixed(3));veil.style.setProperty('--v-reach',shown.reach.toFixed(1)+'%');veil.style.setProperty('--v-blood',shown.blood.toFixed(3));}
    folio=folio||document.getElementById('folio');
    if(folio){
      const p=shown.page,parts=[];
      if(p>0.005)parts.push('brightness('+(1-.48*p).toFixed(3)+') sepia('+(.5*p).toFixed(3)+') saturate('+(1-.35*p).toFixed(3)+') contrast('+(1+.1*p).toFixed(3)+')');
      folio.style.filter=parts.join(' ');
    }
  }
  function build(){
    if(veil||!document.body)return;
    veil=document.createElement('div');veil.className='sanity-vignette';veil.setAttribute('aria-hidden','true');document.body.append(veil);
  }
  function atmosphere(instant){
    build();
    const target=levels(level()),g=window.gsap;
    if(g&&!reduce.matches&&!instant)g.to(shown,{...target,duration:1.2,ease:'sine.inOut',overwrite:true,onUpdate:paint});
    else{Object.assign(shown,target);paint();}
  }

  // ---------- Беспорядок в тексте ----------
  const SKIP='button,textarea,input,select,summary,svg,script,style,.sanity-lock,.ink-redacted,.fx-word,.mask-word,.carried,.anomaly-eye,.rlyeh-whisper,.mad-word,.cipher,.folio-page,[aria-hidden="true"],[data-sanity-unlock],[data-sanity-rest]';
  let seed=1;const rnd=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};
  function words(root){
    const out=[];const walker=document.createTreeWalker(root,4);
    while(walker.nextNode()){
      const n=walker.currentNode,el=n.parentElement;
      if(!el||el.closest(SKIP)||!/\p{L}{3}/u.test(n.textContent))continue;
      out.push(n);
    }
    return out;
  }
  function wrap(node,count,make){
    // Разбивает текстовый узел и оборачивает до count случайных слов.
    const parts=node.textContent.split(/(\s+)/);if(parts.length<1)return 0;
    const idx=[];parts.forEach((p,i)=>{if(/\p{L}{3}/u.test(p))idx.push(i);});
    if(!idx.length)return 0;
    const chosen=new Set();let tries=0;
    while(chosen.size<Math.min(count,idx.length)&&tries++<count*4)chosen.add(idx[Math.floor(rnd()*idx.length)]);
    if(!chosen.size)return 0;
    const frag=document.createDocumentFragment();
    parts.forEach((p,i)=>{if(chosen.has(i))frag.append(make(p));else frag.append(p);});
    node.replaceWith(frag);return chosen.size;
  }
  function madWord(text,d){
    const sp=document.createElement('span');sp.className='mad-word';sp.dataset.text=text;
    const tilt=(rnd()-.5)*d*12,lift=(rnd()-.5)*d*8;
    sp.style.transform='translateY('+lift.toFixed(2)+'px) rotate('+tilt.toFixed(2)+'deg)';
    const roll=rnd();
    if(roll<.38*d){ // буквы пляшут по высоте и наклону
      sp.setAttribute('aria-label',text);
      sp.innerHTML=[...text].map(ch=>'<span class="mad-ch" aria-hidden="true" style="transform:translateY('+((rnd()-.5)*d*11).toFixed(2)+'px) rotate('+((rnd()-.5)*d*24).toFixed(1)+'deg)">'+esc(ch)+'</span>').join('');
      sp.classList.add('dancing');
    }else if(roll<.38*d+.3*d&&d>.3&&text.length>3){ // одна-две буквы стали рунами
      sp.setAttribute('aria-label',text);
      const chars=[...text];const n=Math.max(1,Math.round(chars.length*.35*d));
      for(let k=0;k<n;k++){const j=Math.floor(rnd()*chars.length);chars[j]=RUNES[Math.floor(rnd()*RUNES.length)];}
      sp.textContent=chars.join('');sp.classList.add('runed');
    }else sp.textContent=text;
    if(rnd()<.4*d)sp.classList.add('bruised');            // наливается бурым
    if(rnd()<.3*d)sp.classList.add(d>.75?'smeared-hard':'smeared');            // расплывается
    if(d>.6&&rnd()<.18){sp.classList.add('doubled');sp.setAttribute('data-ghost',text);} // двоится
    return sp;
  }
  function disorder(host,d){
    if(d<=0)return;
    const book=host.querySelector('.open-book')||host;
    const pages=[...book.querySelectorAll('.book-page')];const roots=pages.length?pages:[book];
    let budget=Math.round(14+240*d);
    for(const root of roots){
      const nodes=words(root);
      const total=nodes.reduce((a,n)=>a+(n.textContent.match(/\p{L}{3,}/gu)||[]).length,0);
      if(!total)continue;
      const share=.04+.34*d;
      for(const n of nodes){
        if(budget<=0)break;
        const inNode=(n.textContent.match(/\p{L}{3,}/gu)||[]).length;
        let want=0;for(let i=0;i<inNode;i++)if(rnd()<share)want++;
        if(!want)continue;
        budget-=wrap(n,Math.min(want,budget),t=>madWord(t,d));
      }
    }
    // Заголовки: в названии проступают руны, тем больше, чем ниже рассудок.
    for(const h of book.querySelectorAll('h1,h2')){
      if(h.closest(SKIP)||h.dataset.runed)continue;
      const text=h.textContent;if(!/\p{L}{3}/u.test(text))continue;
      h.dataset.runed='1';h.setAttribute('aria-label',text);
      const share=.12+.5*d;
      h.innerHTML=[...text].map(ch=>/\p{L}/u.test(ch)&&rnd()<share
        ?'<span class="mad-rune" aria-hidden="true" data-letter="'+esc(ch)+'" style="transform:translateY('+((rnd()-.5)*d*10).toFixed(1)+'px) rotate('+((rnd()-.5)*d*20).toFixed(1)+'deg)">'+RUNES[Math.floor(rnd()*RUNES.length)]+'</span>'
        :'<span aria-hidden="true">'+esc(ch)+'</span>').join('');
    }
    // Под курсором слова отползают — медленно, по одному разу.
    const g=window.gsap;
    if(!g||reduce.matches||d<.35)return;
    // Пока читатель водит мышью, несколько слов медленно всплывают и опускаются.
    if(d>.5){
      let moves=0;
      book.addEventListener('pointermove',()=>{
        if(++moves%12)return;
        const all=book.querySelectorAll('.mad-word');if(!all.length)return;
        for(let i=0;i<Math.ceil(4*d);i++){
          const w=all[Math.floor(rnd()*all.length)];
          g.to(w,{x:'+='+((rnd()-.5)*d*8).toFixed(1),y:'+='+((rnd()-.5)*d*7).toFixed(1),duration:2.8,yoyo:true,repeat:1,ease:'sine.inOut'});
        }
      });
    }
    book.addEventListener('pointerover',e=>{
      const w=e.target.closest?.('.mad-word');if(!w||w.dataset.fled)return;w.dataset.fled='1';
      g.to(w,{x:(rnd()-.5)*d*18,y:'+='+((rnd()-.2)*d*8).toFixed(1),rotation:'+='+((rnd()-.5)*d*14).toFixed(1),duration:1.6,ease:'sine.out'});
    });
  }

  // Руны, проступающие по странице: обрывки имени существа (строка-шифр под заголовком) или случайные знаки.
  function scrawl(book,d){
    if(d<.2)return;
    const cipher=(book.querySelector('.cipher')?.textContent||'').split(/[\s·]+/).filter(w=>w.length>1);
    const token=()=>cipher.length&&rnd()<.75?cipher[Math.floor(rnd()*cipher.length)]:Array.from({length:3+Math.floor(rnd()*6)},()=>RUNES[Math.floor(rnd()*RUNES.length)]).join('');
    const g=window.gsap,marks=[];
    for(const page of book.querySelectorAll('.book-page')){
      if(getComputedStyle(page).position==='static')page.style.position='relative';
      const n=Math.round(3+16*d);
      for(let i=0;i<n;i++){
        const m=document.createElement('span');m.className='rune-scrawl';m.setAttribute('aria-hidden','true');
        m.textContent=token();
        m.style.left=(rnd()*88+2).toFixed(1)+'%';m.style.top=(rnd()*90+3).toFixed(1)+'%';
        m.style.fontSize=(14+rnd()*34*d).toFixed(0)+'px';
        m.style.transform='rotate('+((rnd()-.5)*80).toFixed(0)+'deg)';
        m.style.opacity=(.1+rnd()*.38*d).toFixed(2);
        if(rnd()<.35)m.classList.add('blood');
        page.append(m);marks.push(m);
      }
    }
    if(g&&!reduce.matches&&marks.length)g.from(marks,{opacity:0,duration:1.8,stagger:.05,ease:'sine.out'});
  }
  // «Всё плывёт»: абзацы покачиваются сдвигами (дёшево для видеокарты), быстро откликаясь на движение мыши.
  function sway(book,w){
    const g=window.gsap;if(w<.05)return;
    const blocks=[...book.querySelectorAll('.book-page p,.book-page li,.book-page h2,.book-page h3,.book-page blockquote,.book-page dl,.book-page .guide-field')].filter(b=>!b.closest(SKIP));
    for(const b of blocks)b.style.transform='translate('+((rnd()-.5)*w*4).toFixed(1)+'px,'+((rnd()-.5)*w*3).toFixed(1)+'px) rotate('+((rnd()-.5)*w*1.4).toFixed(2)+'deg)';
    if(!g||reduce.matches||!blocks.length)return;
    let moves=0;
    book.addEventListener('pointermove',()=>{
      if(++moves%6)return;
      for(let i=0;i<Math.ceil(3*w);i++){
        const b=blocks[Math.floor(rnd()*blocks.length)];
        g.to(b,{x:(rnd()-.5)*w*9,y:(rnd()-.5)*w*6,rotation:(rnd()-.5)*w*2.2,skewX:(rnd()-.5)*w*3,duration:.9,ease:'sine.inOut',yoyo:true,repeat:1,overwrite:'auto'});
      }
    });
  }
  function decorate(host,hash){
    atmosphere(false);
    const v=level(),lv=levels(v),d=lv.disorder;
    if(d<=0||hash==='#cover')return;
    seed=(([...String(hash)].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,7)^Math.round(v)*7919)>>>0)%2147483646+1;
    disorder(host,d);
    const book=host.querySelector('.open-book')||host;
    scrawl(book,d);
    sway(book,lv.swim);
  }

  addEventListener('sanitychange',()=>atmosphere(false));
  if(document.readyState!=='loading')atmosphere(true);else document.addEventListener('DOMContentLoaded',()=>atmosphere(true),{once:true});
  window.sanityAtmosphere=Object.freeze({decorate,levels,refresh:()=>atmosphere(false)});
})();
