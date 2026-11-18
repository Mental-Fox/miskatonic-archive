'use strict';
/* Иллюстративные реконструкции, а не документальные фотографии. */
(function(){
  const atlas='art/secret-dossier/contact-sheet-v1.png';
  const captions=[
    'Следы у причала','Чешуя и карманные часы','Приливная камера','Маяк после шторма',
    'Стол патологоанатома','Препараты и аномальная анатомия','След волочения в тоннеле','Каменный алтарь',
    'Брошенный полярный лагерь','Проём с невозможной тенью','Закрытый цилиндр и наушники','Подземная лаборатория',
    'Пустая палата изолятора','Стол частного сыщика','Подвал в портовом квартале','Маска за кулисами'
  ];
  const themes={
    sea:{tiles:[0,1,2],ids:['cthulhu','deep-ones','dagon','hydra','bokrug','gnorri','cloud-beast','beings-of-ib','rlyeh','innsmouth','sarnath','ponape','cthaat','rlyeh-text','wilcox-relief']},
    frost:{tiles:[8,9,11],ids:['elder-things','shoggoth','ithaqua','polar-city','polar-reliefs','eltdown']},
    anatomy:{tiles:[5,4,11],ids:['mi-go','yith','shub','chaugnar-faugn','star-vampire','hemophore','ghatanothoa','yig','serpent-people','abhoth','larva-outer-gods','de-vermis','glaaki','tyog-scroll','yith-archive']},
    underground:{tiles:[6,5,7],ids:['ghast','gug','ghouls','wamp','chthonian','dhole','atlach-nacha','leng-spider','formless-spawn','tsathoggua','voonith','nameless-city','gharne','cultes-goules']},
    cult:{tiles:[7,13,2],ids:['dark-young','moon-beast','leng-man','hastur','unaussprechlichen','zanthu','commoriom','daemonolatreia']},
    mind:{tiles:[12,15,9],ids:['azathoth','servitor','lamp-newt','great-ones','magah-bird','nightgaunts','zoog','nodens','celephais','hsan','dzyan','pnakotic']},
    urban:{tiles:[13,14,15],ids:['nyarlathotep','brown-jenkin','haunter','dunwich-horror','arkham','dunwich','carcosa','ulthar','king-in-yellow','yellow-sign','necronomicon','sussex','thaumaturgical']}
  };
  const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function photo(leaf,role){
    const theme=Object.values(themes).find(t=>t.ids.includes(leaf.entry))||{tiles:[9,10,11]};
    const index={discovery:0,conclusion:1,incident:2}[role]??0,tile=theme.tiles[index];
    const label=captions[tile],x=tile%4*100/3,y=Math.floor(tile/4)*100/3;
    return '<figure class="secret-photo secret-photo-'+role+'" data-record="'+esc(leaf.entry)+'"><span class="secret-photo-print" role="img" aria-label="'+esc(label)+' · иллюстративная реконструкция" style="--evidence-x:'+x+'%;--evidence-y:'+y+'%"></span><figcaption><span>'+esc(leaf.number)+' / '+String(index+1).padStart(2,'0')+' · '+esc(label)+'</span><small>Реконструкция по материалам дела</small></figcaption></figure>';
  }
  window.secretEvidence={photo,atlas};
})();
