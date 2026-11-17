'use strict';

// Point locations mark the region of a literary episode, never a measured range.
const earthRegions=[
  {id:'antarctic',label:'Антарктида',lat:-77,lon:100,ids:['elder-things','shoggoth'],detail:'Экспедиция Дайера находит подо льдом тела Старцев и следы жителей подземного города.'},
  {id:'pacific',label:'Южная часть Тихого океана',lat:-47,lon:-126,ids:['cthulhu','dagon'],detail:'Плавание к Р’льеху и рассказ о поднявшемся морском дне связаны с разными эпизодами в Тихом океане.'},
  {id:'new-england',label:'Новая Англия',lat:43,lon:-72,ids:['deep-ones','mi-go','brown-jenkin','ghouls','dunwich-horror','haunter'],detail:'Аркхэм, Данвич, Иннсмут, Бостон, Провиденс и горы Вермонта — разные места встреч в одном регионе.'},
  {id:'australia',label:'Западная Австралия',lat:-22,lon:125,ids:['yith','flying-polyps'],detail:'В пустыне Пизли узнаёт руины из своих воспоминаний. Они связывают этот район с Великой расой и её противниками.'},
  {id:'plains',label:'Оклахома',lat:35,lon:-98,ids:['yig'],detail:'В рассказе «Проклятие Йига» историю переселенцев собирают в Оклахоме.'}
];
const realmImages={dream:'kadath',space:'yuggoth',beyond:'azathoth',unknown:'pnakotic-manuscripts'};
const realmDescriptions={
  earth:'Выберите отметку на глобусе или название под ним. Каждая отметка указывает район одного или нескольких эпизодов.',
  dream:'Города и земли, доступные сновидцам. Их расположение задают маршруты героев в рассказах.',
  space:'Другие планеты, звёздные миры и пути между ними в свидетельствах архива.',
  beyond:'Места вне обычного пространства и времени в описаниях рассказчиков.',
  unknown:'Свидетельства дают слишком мало сведений для уверенной привязки к миру.'
};
function inRealm(profile,key){return profile && (profile.realm===key || profile.secondaryRealms?.includes(key));}
function openHabitats(id,place,layer){
  const keys=Object.keys(realmNames).filter(key=>records.some(r=>inRealm(window.speciesProfiles[r.id],key)));
  const realm=keys.includes(id)?id:'earth';
  const region=realm==='earth'?earthRegions.find(x=>x.id===place):null;
  const tabs=keys.map(key=>'<a href="#habitats/'+key+'" '+(key===realm?'aria-current="page"':'')+'>'+realmNames[key]+'</a>').join('');
  if(realm==='earth' && !region && place!=='globe'){openPeriodMap(place,layer,tabs);return;}
  const filter=realm==='earth'?'<div class="region-choices"><a href="#habitats/earth/globe" '+(!region?'aria-current="page"':'')+'>Вся Земля</a>'+earthRegions.map(x=>'<a href="#habitats/earth/'+x.id+'" '+(x===region?'aria-current="page"':'')+'>'+x.label+'</a>').join('')+'</div>'+detailsLink('habitats/earth','Восемь карт эпох'):'';
  const picture=realm==='earth'
    ?'<div class="globe-shell" id="globe-shell"><canvas width="300" height="300" aria-label="Глобус с отметками литературных эпизодов"></canvas><div class="globe-pins"></div></div><div class="spin-controls"><button type="button" data-spin="-45" aria-label="Повернуть глобус на запад">←</button><span>Вращать глобус</span><button type="button" data-spin="45" aria-label="Повернуть глобус на восток">→</button></div>'
    :'<img class="realm-plate" src="art/'+realmImages[realm]+'.webp" alt="">';
  const items=region?region.ids.map(k=>byId.get(k)).filter(Boolean):records.filter(r=>inRealm(window.speciesProfiles[r.id],realm));
  let labels=region?region.label:realmNames[realm];
  openFolio('<div class="book-binding"><span>'+icon('book')+' Руководство натуралиста</span></div><header class="sheet-head period-head"><h2 id="dialog-title">Где они обитали</h2><div class="cipher" aria-hidden="true">'+cipherLine(realmNames[realm]==='Земля'?'earth':'beyond the stars')+'</div></header>'+'<div class="realm-tabs">'+tabs+'</div><div class="habitat-panel"><div class="world-art">'+picture+'</div><div class="map-copy">'+smallHeading('Место наблюдения')+'<h3>'+escapeHTML(labels)+'</h3><p>'+escapeHTML(region?region.detail:realmDescriptions[realm])+'</p>'+filter+'</div></div><div class="manual-body habitat-list"><h3 class="manual-sub">Записи · '+items.length+'</h3>'+
    specimenListing(items,r=>window.speciesProfiles[r.id].habitat)+(realm==='earth'?'<p class="map-credit">Современные берега служат ориентиром для эпизодов разных эпох. Основа карты — '+externalSource('https://www.naturalearthdata.com/downloads/110m-physical-vectors/110m-land/','Natural Earth')+'.</p>':'')+'</div>','manual-mode parchment-mode realm-mode');
  if(realm==='earth')mountGlobe(region);
}

let textureLoad;
window.addEventListener('bookimageschange',()=>{textureLoad=null;});
function earthTexture(){
  if(!textureLoad)textureLoad=new Promise((resolve,reject)=>{
    const image=new Image();
    image.onload=()=>{
      try{
        const layer=document.createElement('canvas');
        layer.width=image.width;layer.height=image.height;
        const ctx=layer.getContext('2d');
        ctx.drawImage(image,0,0);resolve(ctx.getImageData(0,0,layer.width,layer.height));
      }catch(error){reject(error);}
    };
    image.onerror=reject;image.src=window.bookImages?.resolve('art/earth-surface.webp')||'art/earth-surface.webp';
  });
  return textureLoad;
}
const radians=Math.PI/180;
function mountGlobe(region){
  const shell=$('globe-shell'),canvas=shell.querySelector('canvas'),pins=shell.querySelector('.globe-pins');
  let lon=region?.lon??-53,lat=region?.lat??12,texture=null,frame=0,drag=null;
  const buttons=earthRegions.map(x=>{
    const a=document.createElement('a');a.href='#habitats/earth/'+x.id;a.className='globe-point';a.title=x.label;a.setAttribute('aria-label',x.label);
    if(x===region)a.setAttribute('aria-current','location');
    pins.append(a);return a;
  });
  const ctx=canvas.getContext('2d'),N=canvas.width,rad=N/2,im=ctx.createImageData(N,N);
  function draw(){
    frame=0;
    if(!shell.isConnected)return;
    const sin=Math.sin(lat*radians),cos=Math.cos(lat*radians);
    if(texture){
      const {width:w,height:h,data}=texture;
      for(let j=0;j<N;j++){
        const y=(rad-j-.5)/rad;
        for(let i=0;i<N;i++){
          const x=(i+.5-rad)/rad,z2=1-x*x-y*y;
          if(z2<0)continue;
          const z=Math.sqrt(z2),lambda=lon*radians+Math.atan2(x,z*cos-y*sin),phi=Math.asin(Math.max(-1,Math.min(1,y*cos+z*sin)));
          const u=((Math.floor((lambda/(2*Math.PI)+.5)*w)%w)+w)%w,v=Math.max(0,Math.min(h-1,Math.floor((.5-phi/Math.PI)*h)));
          const src=4*(v*w+u),dst=4*(j*N+i),light=.65+.31*z+.10*y-.05*x;
          for(let k=0;k<3;k++)im.data[dst+k]=data[src+k]*light;
          im.data[dst+3]=255;
        }
      }
      ctx.putImageData(im,0,0);
    }
    earthRegions.forEach((x,i)=>{
      const theta=(x.lon-lon)*radians,phi=x.lat*radians,c=Math.cos(phi),s=Math.sin(phi);
      const visible=s*sin+c*Math.cos(theta)*cos>.08;
      const a=buttons[i];a.hidden=!visible;
      if(visible){a.style.left=(50+50*c*Math.sin(theta))+'%';a.style.top=(50-50*(s*cos-c*Math.cos(theta)*sin))+'%';}
    });
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(draw);}
  shell.parentElement.querySelectorAll('[data-spin]').forEach(b=>b.addEventListener('click',()=>{lon+=Number(b.dataset.spin);schedule();}));
  canvas.addEventListener('pointerdown',e=>{drag=[e.clientX,e.clientY,lon,lat];canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{
    if(!drag)return;
    lon=drag[2]-(e.clientX-drag[0])*.6;lat=Math.max(-85,Math.min(85,drag[3]+(e.clientY-drag[1])*.55));schedule();
  });
  canvas.addEventListener('lostpointercapture',()=>{drag=null;});
  draw();earthTexture().then(t=>{texture=t;schedule();}).catch(()=>{shell.classList.add('map-fallback');});
}
