"use strict";
/* Перенос прежних списков без изменения литературных записей существ. */
function cultureAllMedia(){
  const media=window.CULTURE_MEDIA.map(item=>({...item}));
  (window.readingList||[]).forEach((group,groupIndex)=>group.items.forEach(([title,year,code,ids],index)=>{
    const original=groupIndex<2;
    const url=code.startsWith('http')?code:'https://www.hplovecraft.com/writings/texts/fiction/'+code+'.aspx';
    const query=(original?'Говард Филлипс Лавкрафт ':'')+title;
    media.push({id:'reading-'+groupIndex+'-'+index,title,year,type:'book',relation:'literature',creator:original?'Г. Ф. Лавкрафт':group.title,
      summary:original?'Литературное произведение из группы «'+group.title+'».':'Книга или цикл из библиографической группы «'+group.title+'».',
      interpretation:original?'Это литературный первоисточник. Дата рядом с названием может обозначать время написания или первого издания.':'Литературное произведение или справочник. Связи с существами приведены как библиографические ссылки и не задают общую версию Мифов.',
      links:ids.filter(id=>byId.has(id)).map(entity=>({entity,form:'Литературная связь',role:'Связанная запись энциклопедии. В ней доступны описание существа и его литературные источники.'})),
      origins:[title],sources:[{title:code.startsWith('http')?'Об авторе / источнике':'Оригинал · EN',url}],
      library:{kind:'reading',group:group.title,original,resources:[{title:'Найти на русском',url:russianSearch(query+' читать на русском')},{title:'Литрес',url:'https://www.litres.ru/search/?q='+encodeURIComponent(query)}]}
    });
  }));
  (window.boardGames||[]).forEach(([ru,en,type,pub,players,text,official],index)=>{
    const resources=[{title:'Найти на русском',url:russianSearch(ru+' настольная игра русское издание')},{title:'Найти правила',url:russianSearch(ru+' правила на русском')}];
    if(russianGamePages[ru])resources.push({title:'Hobby World · RU',url:russianGamePages[ru]});
    const sources=[{title:'BoardGameGeek · поиск игры',url:bgg(en)}];
    if(official)sources.unshift({title:official[1],url:official[0]});
    const library={kind:'game',group:type,players,publisher:pub,englishTitle:en,resources};
    if(en==='Call of Cthulhu'){
      const existing=media.find(item=>item.id==='coc-rpg-1981');
      if(existing){existing.title=ru+' · '+en;existing.library=library;existing.sources=[...existing.sources,...sources];return;}
    }
    media.push({id:'tabletop-library-'+index,title:ru,year:(pub.match(/\b(?:19|20)\d{2}\b/)||['Не указан'])[0],type:'tabletop',relation:'adaptation',creator:pub,summary:text,
      interpretation:'Игровая версия Мифов. Правила, свойства существ и результат партии относятся к выбранной редакции игры.',links:[],
      origins:['Мифы Ктулху; самостоятельная настольная игра.'],sources,library});
  });
  return media;
}
function cultureLibraryResources(media){
  const library=media.library;if(!library)return '';
  return '<section class="culture-detail-wide culture-library-resources"><h3>'+(library.kind==='game'?'Издание и правила':'Чтение и издания')+'</h3>'+ 
    (library.kind==='game'?'<p>'+escapeHTML(library.englishTitle)+' · '+escapeHTML(library.publisher)+' · Игроки: '+escapeHTML(library.players)+'</p><p>Число игроков и использование приложения зависят от редакции и дополнений. Уточняйте их на странице выбранного издания.</p>':'<p>«Найти на русском» и «Литрес» открывают поиск, а не полный текст. Дата может обозначать время написания или издания.</p>')+
    '<div class="culture-library-links">'+library.resources.map(source=>cultureLink(source.url,source.title)).join('')+'</div></section>';
}
function cultureLibraryFooter(type){
  if(type!=='book')return '';
  return '<details class="culture-library-footer"><summary>Другие энциклопедии и полный список произведений</summary><ul><li>'+cultureLink('https://universeoflovecraft.github.io/index.html','Энциклопедия существ по вселенной Г. Ф. Лавкрафта')+'</li><li>'+cultureLink('https://www.hplovecraft.com/creation/bestiary.aspx','A Lovecraftian Bestiary')+'</li><li>'+cultureLink('https://www.hplovecraft.com/writings/fiction/','Полный список рассказов Лавкрафта')+'</li></ul></details>';
}
