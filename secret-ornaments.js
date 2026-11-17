'use strict';
/* Вымышленные знаки Р’льеха: декоративное письмо, не переводимый алфавит. */
(function(){
  const themes={
    tide:['cthulhu','deep-ones','dagon','hydra','bokrug','gnorri','cloud-beast','beings-of-ib'],
    web:['atlach-nacha','leng-spider'],
    blood:['star-vampire','hemophore','ghouls','gug','ghast','voonith','wamp','dunwich-horror','chaugnar-faugn','brown-jenkin'],
    frost:['elder-things','shoggoth','ithaqua'],
    ash:['fire-worm','servant-karakal','haunter','lamp-newt'],
    cosmic:['yog','azathoth','nyarlathotep','yith','mi-go','flying-polyps','dimensional-shambler','hound-tindalos','byakhee','servitor','larva-outer-gods','star-spawn']
  };
  const themeFor=id=>Object.keys(themes).find(t=>themes[t].includes(id))||'claw';
  function seed(text){let n=17;for(const ch of text)n=(n*31+ch.charCodeAt(0))>>>0;return n;}
  const visits=new Map(),activeVariant=new Map();
  const frame=()=>'<span class="rlyeh-symbol-frame" aria-hidden="true"></span>';
  function motif(theme,extra=''){
    return '<span class="raster-vignette raster-'+theme+' '+extra+'" aria-hidden="true"></span>';
  }
  function creatureMotif(id,extra='',variant='record'){
    const entry=window.MONSTER_ENGRAVINGS?.[id];
    const primaryIndex=activeVariant.get(id)||0;
    const useAlternate=variant==='secret'?primaryIndex===0:primaryIndex===1;
    const asset=useAlternate?(entry?.alternate||entry):entry;
    if(!asset)return motif(themeFor(id),extra);
    const col=asset.tile%4,row=Math.floor(asset.tile/4);
    const zoom=asset.zoom||1,visible=1/zoom;
    const x=(col+(1-visible)*(asset.focusX??.5))/(4-visible)*100;
    const y=(row+(1-visible)*(asset.focusY??.5))/(2-visible)*100;
    const token=asset.atlas.replace(/[^a-zA-Z0-9-]/g,'-');
    return '<span class="raster-vignette raster-'+themeFor(id)+' monster-vignette '+extra+'" data-engraving="'+id+'" data-variant="'+variant+'" style="background-image:var(--book-image-'+token+',url(\''+asset.atlas+'\'));background-size:'+(400*zoom)+'% '+(200*zoom)+'%;background-position:'+x+'% '+y+'%" aria-hidden="true"></span>';
  }
  function traces(id,variant){
    return '<div class="secret-traces raster-traces" aria-hidden="true">'+frame()+'</div>';
  }
  // Notes are text only; the single accent belongs to the spread, not each block.
  function noteMark(){return '';}
  function wrap(leaf,markup){
    const figure='<figure class="secret-evidence-figure" aria-label="Гравюрная деталь из полевого архива">'+creatureMotif(leaf.entry,'secret-evidence-image','secret')+'</figure>';
    const withFigure=markup.includes('<div class="folio-page">')
      ?markup.replace('<div class="folio-page">',figure+'<div class="folio-page">')
      :markup.replace('</section>',figure+'</section>');
    return withFigure.replace('class="open-book secret-book"','class="open-book secret-book secret-theme-'+themeFor(leaf.entry)+'"')
      .replace('<section class="book-page verso">','<section class="book-page verso">'+traces(leaf.entry,'front'))
      .replace('<section class="book-page recto">','<section class="book-page recto">'+traces(leaf.entry,'back'));
  }
  function decorateEntry(root,id){
    const book=root.querySelector('.open-book');
    if(!book||book.dataset.engraved===id)return;
    const visit=visits.get(id)||0;
    activeVariant.set(id,visit%2);visits.set(id,visit+1);
    book.dataset.engraved=id;book.classList.add('engraved-record','secret-theme-'+themeFor(id));
    const left=book.querySelector('.book-page.verso');
    if(left)left.insertAdjacentHTML('afterbegin','<div class="record-engraving raster-record" aria-hidden="true">'+frame()+'</div>');
    const page=book.querySelector('.book-page.recto');
    if(page)page.insertAdjacentHTML('afterbegin','<div class="record-engraving raster-record" aria-hidden="true">'+frame()+'</div>');
  }
  window.secretOrnaments={wrap,noteMark,decorateEntry};
})();
