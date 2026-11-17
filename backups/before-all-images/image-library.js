'use strict';
(function(){
  const overrides=new Map();let db=null,storageError='';
  const source=id=>overrides.has(id)?overrides.get(id):(window.BOOK_IMAGES||{})[id];
  const get=id=>source(id)?.src||'';
  const assetKey=path=>'asset:'+path;
  function resolve(path){
    if(get(assetKey(path)))return get(assetKey(path));
    if(path==='art/hero.webp')return get('hero')||path;
    const entry=(window.ENTRIES||[]).find(r=>
      typeof artPath==='function' && (artPath(r)===path ||
      ['art/plates/'+r.id+'.webp','art/plates/'+r.id+'.png','art/cutouts/'+(typeof fileAliases!=='undefined'?(fileAliases[r.id]||r.id):r.id)+'.webp'].includes(path)));
    return (entry&&get(entry.id))||path;
  }
  function refreshImages(root=document){
    root.querySelectorAll('img').forEach(img=>{
      if(img.closest('.image-library'))return;
      const src=img.getAttribute('src')||'';
      if(!img.dataset.imageOriginal || (src!==img.dataset.imageApplied && src!==img.dataset.imageOriginal)){
        if(/^(data:|blob:)/.test(src))return;
        img.dataset.imageOriginal=src;
      }
      const original=img.dataset.imageOriginal;
      const next=get(img.dataset.imageId)||resolve(original);
      if(src!==next){img.dataset.imageApplied=next;img.setAttribute('src',next);}
    });
  }
  function update(){
    for(const path of window.BOOK_IMAGE_ASSETS||[]){
      document.documentElement.style.setProperty('--book-image-'+assetToken(path),'url('+JSON.stringify(resolve(path))+')');
    }
    window.dispatchEvent(new Event('bookimageschange'));
    refreshImages();
  }
  function assetToken(path){return path.replace(/[^a-zA-Z0-9-]/g,'-');}
  const ready=new Promise(resolve=>{
    try{
      const request=indexedDB.open('bestiary-pictures',1);
      request.onupgradeneeded=()=>request.result.createObjectStore('images',{keyPath:'id'});
      request.onerror=()=>{storageError='Не удалось открыть хранилище браузера.';resolve();};
      request.onblocked=()=>{storageError='Хранилище занято другой вкладкой.';resolve();};
      request.onsuccess=()=>{
        db=request.result;
        const read=db.transaction('images').objectStore('images').getAll();
        read.onsuccess=()=>{read.result.forEach(r=>overrides.set(r.id,r.value));resolve();};
        read.onerror=()=>{storageError='Не удалось прочитать сохранённые картинки.';resolve();};
      };
    }catch{storageError='В этом браузере картинки сохраняются только на время просмотра.';resolve();}
  }).then(update);
  async function save(id,value){
    await ready;
    if(db)await new Promise((resolve,reject)=>{
      const tx=db.transaction('images','readwrite');
      tx.objectStore('images').put({id,value});
      tx.oncomplete=resolve;tx.onerror=()=>reject(new Error('Не удалось сохранить картинку. Возможно, хранилище браузера заполнено.'));
      tx.onabort=()=>reject(new Error('Сохранение было отменено.'));
    });
    overrides.set(id,value);update();return !!db;
  }
  window.bookImages={get,ready,resolve};
  new MutationObserver(()=>refreshImages()).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['src']});
  let dialog,selected='hero',pending=null,previewURL='',busy=false,selectionVersion=0;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function items(){
    const chapterItems=(typeof chapters!=='undefined'?chapters:window.bookChapters||[]).map(ch=>({
      id:'chapter:'+ch.id,name:'Заставка главы '+ch.num+' · '+ch.title,src:'art/'+ch.art+'.webp',href:'#chapter/'+ch.id,category:'Главы'
    }));
    const names={'mark.svg':'Эмблема в шапке','logo.svg':'Логотип на странице «О проекте»','art/paper-grain.webp':'Фактура бумаги','art/book-binding-wear.svg':'Фактура переплёта','art/earth-surface.webp':'Карта Земли и поверхность глобуса','art/placeholder.svg':'Запасная иллюстрация'};
    const assets=(window.BOOK_IMAGE_ASSETS||[]).map(path=>{
      const entry=(window.ENTRIES||[]).find(r=>typeof artPath==='function'&&artPath(r)===path);
      const bookPartNames={'art/intro-book-bare.png':'Стартовая книга · исходная основа','art/intro-cover-board.png':'Стартовая книга · отдельная передняя обложка','art/intro-page-block.png':'Стартовая книга · отдельный блок листов и корешок','art/intro-tentacle-textured.png':'Стартовая книга · щупальце','art/intro-book-hardware.png':'Стартовая книга · эмблема и две застёжки','art/intro-book-brown.png':'Стартовая книга · целое изображение'};
      return {id:assetKey(path),name:names[path]||bookPartNames[path]||((entry?entry.name+' · ':'')+path),src:path,category:'Файлы и фоны',href:entry?'#entry/'+entry.id:location.hash||'#cover'};
    });
    return [{id:'intro-book',name:'Книга на стартовом экране',src:'art/intro-vector-preview.svg',href:'#cover',category:'Обложка'},
      {id:'hero',name:'Главный рисунок — первый разворот',src:'art/hero.webp',href:'#cover',category:'Обложка'},...chapterItems,
      ...(window.ENTRIES||[]).map(r=>({...r,href:'#entry/'+r.id,category:'Записи каталога'})).sort((a,b)=>a.name.localeCompare(b.name,'ru')),...assets];
  }
  function announce(message){dialog.querySelector('[data-image-status]').textContent=message;}
  function release(){
    selectionVersion++;pending=null;if(previewURL){URL.revokeObjectURL(previewURL);previewURL='';}
    dialog.querySelector('[data-image-new]').innerHTML='<span>Выберите файл, чтобы увидеть его здесь</span>';
    dialog.querySelector('[data-image-file]').value='';dialog.querySelector('[data-image-apply]').disabled=true;
  }
  function current(){
    const item=items().find(r=>r.id===selected);
    dialog.querySelector('[data-image-name]').textContent=item.name;
    const box=dialog.querySelector('[data-image-current]');
    box.innerHTML=item.src?'<img src="'+esc(get(item.id)||resolve(item.src))+'" alt="Текущая иллюстрация">':plateImage(item,'','Текущая иллюстрация');
    const custom=source(selected);
    dialog.querySelector('[data-image-filename]').textContent=custom?.name||'Исходная иллюстрация проекта';
    dialog.querySelector('[data-image-reset]').disabled=!custom;
    dialog.querySelector('[data-image-open-entry]').href=item.href;
  }
  function options(){
    release();
    const query=dialog.querySelector('[data-image-query]').value.toLocaleLowerCase('ru').replaceAll('ё','е');
    const category=dialog.querySelector('[data-image-category]').value;
    const found=items().filter(r=>(!category||r.category===category)&&(r.name+' '+(r.latin||'')).toLocaleLowerCase('ru').replaceAll('ё','е').includes(query));
    const select=dialog.querySelector('[data-image-select]');
    dialog.querySelector('[data-image-file]').disabled=!found.length;
    select.innerHTML=[...new Set(found.map(r=>r.category))].map(group=>'<optgroup label="'+esc(group)+'">'+found.filter(r=>r.category===group).map(r=>'<option value="'+esc(r.id)+'">'+esc(r.name)+'</option>').join('')+'</optgroup>').join('');
    if(!found.length){select.disabled=true;release();dialog.querySelector('[data-image-reset]').disabled=true;announce('По этому названию ничего не найдено. Измените поиск.');return;}
    select.disabled=false;
    if(found.some(r=>r.id===selected))select.value=selected;
    else{selected=found[0].id;select.value=selected;}
    current();
  }
  function build(){
    dialog=document.createElement('dialog');dialog.className='image-library';
    dialog.setAttribute('aria-labelledby','image-library-title');
    dialog.innerHTML='<header><div><small>Мастерская иллюстратора</small><h2 id="image-library-title">Ваши иллюстрации</h2></div><button type="button" data-image-close aria-label="Закрыть">×</button></header>'+
      '<p class="image-instruction">Выберите иллюстрацию → загрузите свою картинку → нажмите «Применить». Здесь доступны заставки глав, записи каталога, логотипы и фоны. Подойдут PNG, JPG, WebP и GIF до 15 МБ.</p>'+
      '<div class="image-fields"><label>Раздел<select data-image-category><option value="">Все картинки</option><option>Обложка</option><option>Главы</option><option>Записи каталога</option><option>Файлы и фоны</option></select></label><label>Поиск картинки<input type="search" data-image-query placeholder="Например, Библиотека, Ктулху или бумага"></label><label class="image-target">Что заменить<select data-image-select></select></label></div>'+
      '<p class="image-scope">Заставки глав меняются отдельно. Картинки из «Файлы и фоны» заменяются во всех местах, где используется этот файл. Нарисованные интерактивные схемы и карты остаются интерактивными.</p>'+
      '<h3 data-image-name></h3><div class="image-comparison"><section><h4>Сейчас в книге</h4><div class="image-preview" data-image-current></div><small data-image-filename></small></section>'+
      '<section><h4>Ваше изображение</h4><div class="image-preview" data-image-new><span>Выберите файл, чтобы увидеть его здесь</span></div><label class="image-file">Выбрать картинку<input type="file" data-image-file accept="image/png,image/jpeg,image/webp,image/gif"></label></section></div>'+
      '<div class="image-actions"><button type="button" data-image-apply disabled>Применить к книге</button><a class="image-entry-link" data-image-open-entry href="#cover">Посмотреть страницу →</a><button type="button" data-image-reset disabled>Вернуть исходную</button></div>'+
      '<p class="image-status" data-image-status role="status" aria-live="polite">Изменения сохраняются в этом браузере. Исходные файлы проекта остаются на месте.</p>'+
      '<details class="image-export"><summary>Как сохранить картинки вместе с проектом</summary><p>Для просмотра достаточно «Применить». Для переноса в другой браузер или публикации скачайте файл и положите его в папку проекта вместо <b>my-images.js</b>. Он содержит все ваши картинки.</p><button type="button" data-image-export>Сохранить для проекта</button></details>';
    document.body.append(dialog);
    dialog.querySelector('[data-image-close]').onclick=()=>dialog.close();
    dialog.addEventListener('close',release);
    dialog.addEventListener('cancel',e=>{if(busy)e.preventDefault();});
    dialog.querySelector('[data-image-open-entry]').onclick=()=>dialog.close();
    dialog.querySelector('[data-image-query]').oninput=options;
    dialog.querySelector('[data-image-category]').onchange=options;
    dialog.querySelector('[data-image-select]').onchange=e=>{selected=e.target.value;release();current();announce('Теперь выберите свою картинку для этой записи.');};
    dialog.querySelector('[data-image-file]').onchange=async e=>{
      const file=e.target.files[0];release();if(!file)return;
      if(!['image/png','image/jpeg','image/webp','image/gif'].includes(file.type)){announce('Выберите PNG, JPG, WebP или GIF.');return;}
      if(file.size>15*1024*1024){announce('Файл слишком большой. Выберите изображение до 15 МБ.');return;}
      const id=selected,version=selectionVersion,url=URL.createObjectURL(file),img=new Image();
      try{
        await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=url;});
        if(!dialog.open||selected!==id||version!==selectionVersion){URL.revokeObjectURL(url);return;}
        if(previewURL)URL.revokeObjectURL(previewURL);
        previewURL=url;pending={file,id};img.alt='Предпросмотр вашего изображения';
        dialog.querySelector('[data-image-new]').replaceChildren(img);
        dialog.querySelector('[data-image-apply]').disabled=false;
        announce(file.name+' · '+img.naturalWidth+' × '+img.naturalHeight+'. Нажмите «Применить к книге».');
      }catch{URL.revokeObjectURL(url);announce('Этот файл не удалось открыть как изображение.');}
    };
    dialog.querySelector('[data-image-apply]').onclick=async()=>{
      if(!pending||busy)return;const choice=pending;busy=true;lock(true);
      try{
        const src=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(choice.file);});
        const persistent=await save(choice.id,{src,name:choice.file.name});
        current();release();announce(persistent?'Готово! Картинка применена и сохранена в этом браузере. Нажмите «Посмотреть страницу».':'Картинка применена на время просмотра. Используйте «Сохранить для проекта», чтобы не потерять её.');
      }catch(error){announce(error.message||'Не удалось применить изображение.');}
      finally{busy=false;lock(false);}
    };
    dialog.querySelector('[data-image-reset]').onclick=async()=>{
      if(busy)return;busy=true;lock(true);
      try{await save(selected,null);release();current();announce('Возвращена исходная иллюстрация проекта.');}
      catch(error){announce(error.message);}
      finally{busy=false;lock(false);}
    };
    dialog.querySelector('[data-image-export]').onclick=()=>{
      const data={};for(const id of new Set([...Object.keys(window.BOOK_IMAGES||{}),...overrides.keys()])){const value=source(id);if(value)data[id]=value;}
      const text='// Ваши иллюстрации. Скопируйте этот файл в папку проекта.\nwindow.BOOK_IMAGES = '+JSON.stringify(data,null,2)+';\n';
      const url=URL.createObjectURL(new Blob([text],{type:'text/javascript;charset=utf-8'}));
      const a=document.createElement('a');a.href=url;a.download='my-images.js';a.click();
      setTimeout(()=>URL.revokeObjectURL(url),10000);
      announce('Файл my-images.js подготовлен. Сохраните его в папку проекта, заменив прежний файл с этим названием.');
    };
  }
  function lock(on){
    dialog.querySelectorAll('input,select,button,a').forEach(el=>{
      if(el.tagName==='A'){el.style.pointerEvents=on?'none':'';return;}
      el.disabled=on;
    });
    if(!on){dialog.querySelector('[data-image-apply]').disabled=!pending;dialog.querySelector('[data-image-reset]').disabled=!source(selected);}
  }
  document.addEventListener('click',async e=>{
    if(!e.target.closest('[data-edit-images]'))return;
    await ready;if(!dialog)build();
    dialog.querySelector('[data-image-query]').value='';dialog.querySelector('[data-image-category]').value='';
    const chapter=location.hash.match(/^#chapter\/([^/]+)/);
    const entry=location.hash.match(/^#entry\/([^/]+)/);
    selected=chapter?'chapter:'+chapter[1]:entry?entry[1]:'hero';
    if(!items().some(r=>r.id===selected))selected='hero';
    release();options();current();
    announce(storageError||'Изменения сохраняются в этом браузере. Исходные файлы проекта остаются на месте.');
    dialog.showModal();
  });
})();
