'use strict';
/* Живая гравюра: рисунок существа перерисовывается на видеокарте (OGL), движением управляет GSAP.
   Принцип — медленный страх, а не мельтешение: никакой ряби, мерцания и радужных переливов.
   Чем дольше читатель смотрит на рисунок, тем гуще тьма подползает от краёв к существу,
   а оно медленно дышит и чуть поворачивается к курсору. У каждого существа своя черта по Лавкрафту.
   Отрисовка идёт только пока курсор на рисунке и пока доигрывает затухание; своих циклов и таймеров нет.
   Рассудок 70+ — не включается; 40–69 — слабо; ниже 40 — в полную силу.
   Без WebGL, OGL, GSAP или при «уменьшить движение» остаётся обычная картинка. */
(function(){
  const reduce=typeof matchMedia==='function'?matchMedia('(prefers-reduced-motion: reduce)'):{matches:false};
  const level=()=>{const v=window.readerSanity?.current?.();return Number.isFinite(v)?v:100;};
  // Все существа и боги. Первые восемь — отдельная проработка. focus — главная точка рисунка (голова, глаз, пасть) в координатах изображения, y снизу.
  const CREATURES={
    'shoggoth':{kind:1,focus:[.62,.5]},        // глаза-пузыри из «Хребтов Безумия»
    'cthulhu':{kind:2,focus:[.5,.74]},         // спящий в Р'льехе, красные глаза, щупальца
    'deep-ones':{kind:3,focus:[.22,.86]},      // немигающий взгляд, вода
    'hound-tindalos':{kind:4,focus:[.95,.54]}, // углы и голубая слизь с языка
    'nyarlathotep':{kind:5,focus:[.43,.9]},    // Чёрный Фараон без лица
    'yog':{kind:6,focus:[.43,.4]},             // «скопление радужных шаров», врата
    'mi-go':{kind:7,focus:[.17,.56]},          // голова, меняющая цвет
    'nightgaunts':{kind:8,focus:[.5,.8]},      // безликие, маслянистая кожа, крылья
    // Остальные существа и боги: общий режим, свой характер движения и света.
    'azathoth':{kind:0,motion:6,light:1,tint:[0.62,0.52,0.8],focus:[.5,.6],glow:[0.5,0.4,0.1]}, // кипящий хаос в сердце мироздания
    'shub':{kind:0,motion:1,light:1,tint:[0.5,0.66,0.5],focus:[.5,.6],glow:[0.2,0.4,0.06]}, // Чёрная Коза Лесов, вздымающаяся масса
    'dagon':{kind:0,motion:3,light:1,tint:[0.45,0.62,0.66],focus:[.5,.6],glow:[0,0.3,0.36]}, // исполин из глубин
    'chaugnar-faugn':{kind:0,motion:9,light:5,tint:[0.72,0.42,0.4],focus:[.5,.6]}, // статуя, пьющая кровь
    'hastur':{kind:0,motion:5,light:1,tint:[0.78,0.68,0.42],focus:[.5,.6],glow:[0.45,0.4,0.05]}, // Жёлтый знак
    'tsathoggua':{kind:0,motion:1,light:0,tint:[0.6,0.5,0.4],focus:[.5,.6]}, // сонный бог в пещере Н’кай
    'hydra':{kind:0,motion:3,light:1,tint:[0.45,0.62,0.66],focus:[.5,.6],glow:[0,0.3,0.36]}, // праматерь глубоководных
    'yig':{kind:0,motion:11,light:1,tint:[0.62,0.66,0.46],focus:[.5,.6],glow:[0.45,0.4,0.05]}, // отец змей
    'ghatanothoa':{kind:0,motion:13,light:8,tint:[0.6,0.6,0.62],focus:[.5,.6]}, // взгляд, обращающий в мумию
    'bokrug':{kind:0,motion:3,light:1,tint:[0.45,0.62,0.66],focus:[.5,.6],glow:[0.2,0.4,0.06]}, // ящер с горящими глазами
    'nodens':{kind:0,motion:9,light:1,tint:[0.7,0.72,0.78],focus:[.5,.6],glow:[0.3,0.32,0.36]}, // владыка бездны
    'ithaqua':{kind:0,motion:10,light:6,tint:[0.68,0.8,0.95],focus:[.5,.6]}, // шагающий по ветру
    'abhoth':{kind:0,motion:1,light:1,tint:[0.6,0.6,0.62],focus:[.5,.6],glow:[0.25,0.3,0.22]}, // фосфоресцирующая серая масса
    'atlach-nacha':{kind:0,motion:9,light:5,tint:[0.72,0.42,0.4],focus:[.5,.6]}, // паук-бог
    'great-ones':{kind:0,motion:5,light:0,tint:[0.76,0.73,0.68],focus:[.5,.6]}, // кроткие боги Земли
    'bugg-shash':{kind:0,motion:1,light:1,tint:[0.5,0.66,0.5],focus:[.5,.6],glow:[0.2,0.4,0.06]}, // глаза и рты
    'byatis':{kind:0,motion:11,light:1,tint:[0.6,0.5,0.4],focus:[.5,.6],glow:[0.5,0.04,0.02]}, // одноглазый змеебородый
    'glaaki-god':{kind:0,motion:1,light:1,tint:[0.6,0.6,0.62],focus:[.5,.6],glow:[0.25,0.3,0.22]}, // обитатель озера
    'daoloth':{kind:0,motion:4,light:4,tint:[0.6,0.6,0.62],focus:[.5,.6]}, // разрывающий завесы
    'cthugha':{kind:0,motion:12,light:7,tint:[0.75,0.5,0.38],focus:[.5,.6]}, // живое пламя
    'rhan-tegoth':{kind:0,motion:9,light:1,tint:[0.7,0.6,0.5],focus:[.5,.6],glow:[0.5,0.04,0.02]}, // три глаза в восковом теле
    'ubbo-sathla':{kind:0,motion:1,light:0,tint:[0.5,0.66,0.5],focus:[.5,.6]}, // праматерь протоплазмы
    'umr-at-tawil':{kind:0,motion:5,light:1,tint:[0.62,0.52,0.8],focus:[.5,.6],glow:[0.3,0.32,0.36]}, // страж врат под покрывалом
    'shudde-mell':{kind:0,motion:11,light:0,tint:[0.62,0.52,0.42],focus:[.5,.6]}, // роющий в глубине
    'gug':{kind:0,motion:9,light:0,tint:[0.6,0.5,0.4],focus:[.5,.6]}, // подземный великан
    'zoog':{kind:0,motion:9,light:1,tint:[0.5,0.66,0.5],focus:[.5,.6],glow:[0.45,0.4,0.05]}, // обитатели Зачарованного леса
    'moon-beast':{kind:0,motion:1,light:0,tint:[0.76,0.73,0.68],focus:[.5,.6]}, // жабоподобные хозяева галер
    'shantak':{kind:0,motion:10,light:0,tint:[0.48,0.5,0.62],focus:[.5,.6]}, // чешуйчатые крылья
    'brown-jenkin':{kind:0,motion:9,light:0,tint:[0.66,0.55,0.45],focus:[.5,.6]}, // фамильяр ведьмы
    'elder-things':{kind:0,motion:9,light:0,tint:[0.62,0.66,0.46],focus:[.5,.6]}, // Старцы
    'yith':{kind:0,motion:5,light:0,tint:[0.66,0.55,0.45],focus:[.5,.6]}, // обмен разумом
    'flying-polyps':{kind:0,motion:6,light:0,tint:[0.48,0.5,0.62],focus:[.5,.6]}, // полуматериальные
    'ghouls':{kind:0,motion:9,light:0,tint:[0.62,0.52,0.42],focus:[.5,.6]}, // пожиратели мертвецов
    'haunter':{kind:0,motion:10,light:1,tint:[0.48,0.5,0.62],focus:[.5,.6],glow:[0.5,0.04,0.02]}, // трёхдольный горящий глаз
    'dunwich-horror':{kind:0,motion:1,light:0,tint:[0.6,0.6,0.62],focus:[.5,.6]}, // невидимый брат
    'byakhee':{kind:0,motion:10,light:0,tint:[0.48,0.5,0.62],focus:[.5,.6]}, // межзвёздные скакуны
    'chthonian':{kind:0,motion:11,light:0,tint:[0.62,0.52,0.42],focus:[.5,.6]}, // подземные черви
    'dark-young':{kind:0,motion:1,light:0,tint:[0.5,0.66,0.5],focus:[.5,.6]}, // порождения Шуб-Ниггурат
    'dhole':{kind:0,motion:11,light:0,tint:[0.62,0.52,0.42],focus:[.5,.6]}, // колоссальные черви
    'dimensional-shambler':{kind:0,motion:4,light:0,tint:[0.6,0.6,0.62],focus:[.5,.6]}, // ковыляет между измерениями
    'formless-spawn':{kind:0,motion:1,light:0,tint:[0.5,0.66,0.5],focus:[.5,.6]}, // чёрная жидкая масса
    'ghast':{kind:0,motion:9,light:0,tint:[0.76,0.73,0.68],focus:[.5,.6]}, // гасты, боятся света
    'hunting-horror':{kind:0,motion:11,light:0,tint:[0.48,0.5,0.62],focus:[.5,.6]}, // летучий змей
    'serpent-people':{kind:0,motion:5,light:1,tint:[0.62,0.66,0.46],focus:[.5,.6],glow:[0.45,0.4,0.05]}, // змеиные глаза
    'servitor':{kind:0,motion:6,light:0,tint:[0.5,0.66,0.5],focus:[.5,.6]}, // флейтисты Внешних богов
    'star-spawn':{kind:0,motion:3,light:1,tint:[0.5,0.66,0.5],focus:[.5,.6],glow:[0.2,0.4,0.06]}, // звёздное потомство
    'star-vampire':{kind:0,motion:1,light:5,tint:[0.72,0.42,0.4],focus:[.5,.6]}, // невидимый кровопийца
    'basilisk':{kind:0,motion:11,light:8,tint:[0.62,0.66,0.46],focus:[.5,.6]}, // каменящий
    'beings-of-ib':{kind:0,motion:3,light:1,tint:[0.45,0.62,0.66],focus:[.5,.6],glow:[0.2,0.4,0.06]}, // безголосые существа Иба
    'bloop':{kind:0,motion:6,light:1,tint:[0.76,0.73,0.68],focus:[.5,.6],glow:[0,0.3,0.36]}, // светится в темноте
    'buopoth':{kind:0,motion:9,light:0,tint:[0.66,0.55,0.45],focus:[.5,.6]}, // травоядный зверь
    'butterfly-dragon':{kind:0,motion:10,light:4,tint:[0.76,0.73,0.68],focus:[.5,.6]}, // садовое диво
    'saturnian-cat':{kind:0,motion:9,light:4,tint:[0.62,0.52,0.8],focus:[.5,.6]}, // филигрань и арабески
    'cloud-beast':{kind:0,motion:1,light:0,tint:[0.6,0.6,0.62],focus:[.5,.6]}, // живое облако
    'fire-worm':{kind:0,motion:11,light:7,tint:[0.75,0.5,0.38],focus:[.5,.6]}, // светящийся змей
    'gnorri':{kind:0,motion:3,light:0,tint:[0.45,0.62,0.66],focus:[.5,.6]}, // бородатый водяной
    'hemophore':{kind:0,motion:9,light:5,tint:[0.72,0.42,0.4],focus:[.5,.6]}, // кровопийца
    'lamp-newt':{kind:0,motion:11,light:1,tint:[0.76,0.73,0.68],focus:[.5,.6],glow:[0.5,0.4,0.1]}, // светящийся тритон
    'larva-outer-gods':{kind:0,motion:1,light:4,tint:[0.62,0.52,0.8],focus:[.5,.6]}, // бесконечные формы
    'leng-spider':{kind:0,motion:9,light:0,tint:[0.62,0.52,0.8],focus:[.5,.6]}, // ленгские пауки
    'magah-bird':{kind:0,motion:10,light:4,tint:[0.76,0.73,0.68],focus:[.5,.6]}, // певчая хищница
    'leng-man':{kind:0,motion:5,light:0,tint:[0.6,0.5,0.4],focus:[.5,.6]}, // полулюди под тюрбаном
    'servant-karakal':{kind:0,motion:12,light:7,tint:[0.72,0.42,0.4],focus:[.5,.6]}, // из красных молний
    'voonith':{kind:0,motion:3,light:0,tint:[0.62,0.66,0.46],focus:[.5,.6]}, // болотная амфибия
    'wamp':{kind:0,motion:11,light:0,tint:[0.76,0.73,0.68],focus:[.5,.6]}, // падальщик мёртвых городов
    'kn-yan':{kind:0,motion:5,light:0,tint:[0.62,0.52,0.42],focus:[.5,.6]}, // развоплощаются
    'nameless-folk':{kind:0,motion:9,light:8,tint:[0.6,0.5,0.4],focus:[.5,.6]}, // мумии рептилий
    'yaddith-beings':{kind:0,motion:9,light:0,tint:[0.66,0.55,0.45],focus:[.5,.6]}, // колдуны Яддита
    'yekub-beings':{kind:0,motion:11,light:0,tint:[0.6,0.6,0.62],focus:[.5,.6]}, // черви-многоножки с Йекуба
  };

  const vertex=`
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main(){vUv=uv;gl_Position=vec4(position,0.,1.);}`;

  const fragment=`
precision highp float;
uniform sampler2D tMap;
uniform float uTime,uPower,uDark,uKind,uMotion,uLight;
uniform vec2 uMouse,uAspect,uFit,uFocus;
uniform vec3 uTint,uGlow;
varying vec2 vUv;
float h21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1.,0.)),f.x),mix(h21(i+vec2(0.,1.)),h21(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p*=2.;a*=.5;}return v;}
vec3 hue(vec3 c,float a){vec3 k=vec3(.57735);float ca=cos(a);return c*ca+cross(k,c)*sin(a)+k*dot(k,c)*(1.-ca);}
float lum(vec3 c){return dot(c,vec3(.299,.587,.114));}
void main(){
  vec2 uv=(vUv-.5)/uFit+.5;
  vec2 m=uMouse,f=uFocus;float t=uTime;
  float near=smoothstep(.6,0.,length((uv-m)*uAspect))*uPower;
  float nearF=smoothstep(.3,0.,length((uv-f)*uAspect));
  float br=.5+.5*sin(t*.9);
  vec2 off=vec2(0.);
  off-=(uv-f)*.012*uPower*br;                       // медленное дыхание вокруг головы
  off+=(m-uv)*.018*near;                            // существо чуть тянется к читателю
  off+=(vec2(noise(uv*2.2+t*.1),noise(uv*2.2-t*.08))-.5)*.018*uPower;
  float mk=uKind>0.?uKind:uMotion;
  if(mk==1.){        // шоггот: вязкая масса медленно вздымается и оседает
    off+=(vec2(fbm(uv*2.6+vec2(0.,t*.18)),fbm(uv*2.6-vec2(t*.14,0.)))-.5)*.055*uPower;
    off.y+=(fbm(uv*1.8+t*.08)-.5)*.035*uPower;
  } else if(mk==2.){ // Ктулху: щупальца на лице шевелятся, как во сне
    float face=smoothstep(.84,.56,uv.y)*smoothstep(.3,.5,uv.y)*smoothstep(.22,.05,abs(uv.x-f.x));
    off.x+=sin(uv.y*15.+t*1.+fbm(uv*3.5)*3.)*.024*uPower*face;
    off.y+=sin(uv.x*12.+t*.7)*.008*uPower*face;
  } else if(mk==3.){ // глубоководный: покачивается, словно стоит под водой
    off.x+=sin(uv.y*6.+t*.6)*.011*uPower;
    off.y+=sin(uv.x*4.+t*.45)*.006*uPower;
  } else if(mk==4.){ // пёс Тиндалоса: пространство вокруг ломается углами
    off.x+=(abs(fract(uv.y*2.4+.2)-.5)-.25)*.05*uPower;
    off.y+=(abs(fract(uv.x*1.9+.35)-.5)-.25)*.03*uPower;
  } else if(mk==5.){ // Ньярлатхотеп: складки одежд медленно ползут
    off.x+=sin(uv.y*8.+t*.55+fbm(uv*3.)*2.)*.013*uPower*smoothstep(.78,.1,uv.y);
  } else if(mk==6.){ // Йог-Сотот: шары медленно набухают
    vec2 g=uv*5.,id=floor(g),fp=fract(g)-.5;
    float pulse=.5+.5*sin(t*.7+h21(id)*6.283);
    off-=fp/5.*smoothstep(.5,0.,length(fp))*pulse*.55*uPower;
  } else if(mk==7.){ // ми-го: перепончатые крылья едва дрожат
    float wing=smoothstep(.42,.6,uv.x)*smoothstep(.48,.72,uv.y);
    off.y+=sin(t*2.+uv.x*5.)*.007*uPower*wing;
  } else if(mk==8.){ // ночной призрак: крылья медленно поднимаются
    float wing=smoothstep(.12,.42,abs(uv.x-.5))*smoothstep(.42,.8,uv.y);
    off.y+=br*.022*uPower*wing;
  } else if(mk==10.){ // крылья или верх тела медленно колышутся
    off.y+=sin(t*1.5+uv.x*4.)*.009*uPower*smoothstep(.4,.9,uv.y);
  } else if(mk==11.){ // червь, змей: медленная волна вдоль тела
    off.y+=sin(uv.x*7.+t*.8)*.012*uPower;
  } else if(mk==12.){ // жар: воздух над телом медленно поднимается
    off+=vec2(noise(uv*5.+vec2(0.,-t*.4))-.5,noise(uv*4.+vec2(t*.1,-t*.5))-.5)*.025*uPower;
  } else if(mk==13.){ // окаменелость: почти неподвижно
    off*=.35;
  }
  vec2 s=uv+off;
  vec4 c=texture2D(tMap,s);
  if(s.x<0.||s.x>1.||s.y<0.||s.y>1.)c=vec4(0.);
  vec3 col=c.rgb;float L=lum(col);
  if(uKind==1.){        // глаза-гнойники светятся зелёным, масса чернеет
    float p=smoothstep(.42,.72,L)*(.55+.45*sin(t*.9+fbm(uv*5.)*6.));
    col+=vec3(.22,.42,.06)*p*uPower;
    col=mix(col,col*vec3(.5,.66,.46),uDark*.75);
  } else if(uKind==2.){ // красные глаза разгораются, зелень темнеет до чёрной
    float red=smoothstep(.12,.32,col.r-col.g)*nearF;
    col+=vec3(.65,.05,.02)*red*(.55+.45*br)*uPower;
    col=mix(col,col*vec3(.42,.58,.48),uDark*.75);
  } else if(uKind==3.){ // тусклые отсветы воды и немигающий глаз
    float ca=pow(noise(uv*8.+vec2(t*.15,t*.1))*noise(uv*6.-t*.08),2.)*1.5;
    col+=vec3(.04,.15,.17)*ca*uPower*c.a;
    col+=vec3(0.,.4,.45)*smoothstep(.03,0.,length((uv-f)*uAspect))*uPower;
    col=mix(col,col*vec3(.42,.6,.64),uDark*.75);
  } else if(uKind==4.){ // голубая слизь медленно стекает с языка, тело синеет
    float below=f.y-uv.y,x=uv.x-f.x+.012*sin(uv.y*18.);
    float drip=smoothstep(.02,0.,abs(x))*step(0.,below)*smoothstep(uDark*.45+.04,0.,below);
    col=mix(col,vec3(.16,.3,.78),drip*.9*uPower);
    col=mix(col,col*vec3(.66,.72,.95),uDark*.55);
  } else if(uKind==5.){ // на месте лица — пустота
    float face=smoothstep(.12,.02,length((uv-f)*uAspect));
    col=mix(col,vec3(.01,0.,.02),face*uDark);
    col=mix(col,col*vec3(.55,.48,.42),uDark*.65);
  } else if(uKind==6.){ // светлые шары медленно переливаются, провалы между ними — в черноту
    float bright=smoothstep(.55,.85,L);
    col=mix(col,hue(col,t*.12+uv.x*1.5)*1.05,bright*.3*uPower);
    col=mix(col,col*smoothstep(0.,.6,L)*vec3(.68,.58,.86),uDark*.7);
  } else if(uKind==7.){ // голова ми-го меняет цвет
    float head=smoothstep(.2,.02,length((uv-f)*uAspect));
    col=mix(col,hue(col,t*.45),head*uPower);
    col=mix(col,col*vec3(.58,.52,.58),uDark*.65);
  } else if(uKind==8.){ // безликость и маслянистый отблеск на коже
    float face=smoothstep(.09,0.,length((uv-f)*uAspect));
    col=mix(col,vec3(0.),face*(.35+.65*uDark)*uPower);
    float sheen=smoothstep(.07,0.,abs(uv.x+uv.y*.6-fract(t*.04)*2.2+.3))*smoothstep(.08,.3,L);
    col+=vec3(.1,.12,.18)*sheen*uPower;
    col=mix(col,col*vec3(.5,.55,.72),uDark*.65);
  }
  if(uKind==0.){
    if(uLight==1.){col+=uGlow*smoothstep(.55,.85,L)*(.6+.4*br)*uPower;}                       // светящиеся глаза и пятна
    else if(uLight==2.){col+=uGlow*smoothstep(.12,0.,length((uv-f)*uAspect))*uPower;}            // свечение в главной точке
    else if(uLight==3.){col=mix(col,vec3(.01,0.,.02),smoothstep(.12,.02,length((uv-f)*uAspect))*uDark);} // пустота
    else if(uLight==4.){col=mix(col,hue(col,t*.12+uv.x*1.5),smoothstep(.5,.85,L)*.35*uPower);}     // медленный перелив
    else if(uLight==5.){col=mix(col,col*vec3(1.25,.55,.5)+vec3(.12,0.,0.)*c.a,(1.-smoothstep(.15,.6,L))*.6*uPower);} // кровь в тенях
    else if(uLight==6.){col=mix(col,vec3(.86,.93,1.),smoothstep(.45,.8,L)*.4*uPower);col=mix(col,vec3(lum(col)),.35*uDark);} // иней
    else if(uLight==7.){col+=vec3(.55,.2,.02)*(1.-smoothstep(.1,.5,L))*(.6+.4*noise(uv*3.+vec2(0.,-t*.3)))*uPower*c.a;} // жар изнутри
    else if(uLight==8.){float gr=lum(col);col=mix(col,vec3(gr*1.02,gr*.97,gr*.9),.85*(uPower*.5+uDark*.5));} // камень
    col=mix(col,col*uTint,uDark*.72);
  }
  float edge=smoothstep(.18,.8,length((uv-f)*uAspect));
  col*=1.-edge*uDark*(uKind==4.?.35:.6);                            // тьма ползёт от краёв к существу
  if(uKind==4.){                                    // у псов — острыми клиньями из углов
    vec2 q=abs(uv-.5)*2.;
    col*=1.-smoothstep(.95-uDark*.45,1.05,max(q.x,q.y)+min(q.x,q.y)*.35)*.5*uDark;
  }
  gl_FragColor=vec4(col,c.a);
}`;

  let active=null;
  function supported(){
    if(!window.OGL||!window.gsap||reduce.matches)return false;
    try{const c=document.createElement('canvas');return !!(c.getContext('webgl2')||c.getContext('webgl'));}catch{return false;}
  }

  function mount(img,cfg,s){
    const {Renderer,Program,Mesh,Texture,Triangle}=window.OGL,g=window.gsap;
    const box=img.parentElement;
    const renderer=new Renderer({dpr:Math.min(1.5,window.devicePixelRatio||1),alpha:true,premultipliedAlpha:false,antialias:false});
    const gl=renderer.gl;gl.clearColor(0,0,0,0);
    const canvas=gl.canvas;canvas.className='living-engraving';canvas.setAttribute('aria-hidden','true');
    const texture=new Texture(gl,{image:img,generateMipmaps:false,minFilter:gl.LINEAR});
    const nw=img.naturalWidth,nh=img.naturalHeight;
    const uniforms={tMap:{value:texture},uTime:{value:0},uPower:{value:0},uDark:{value:0},uKind:{value:cfg.kind},
      uMouse:{value:cfg.focus},uAspect:{value:[nw/nh,1]},uFit:{value:[1,1]},uFocus:{value:cfg.focus},
      uMotion:{value:cfg.motion||9},uLight:{value:cfg.light||0},uTint:{value:cfg.tint||[.6,.58,.6]},uGlow:{value:cfg.glow||[0,0,0]}};
    const program=new Program(gl,{vertex,fragment,uniforms,transparent:true});
    const mesh=new Mesh(gl,{geometry:new Triangle(gl),program});
    const render=()=>{if(canvas.isConnected)renderer.render({scene:mesh});};
    let fit=[1,1];
    function size(){
      const w=img.clientWidth,h=img.clientHeight;if(!w||!h)return;
      const k=Math.min(w/nw,h/nh);fit=[nw*k/w,nh*k/h];
      renderer.setSize(w,h);uniforms.uFit.value=fit;render();
    }
    if(getComputedStyle(box).position==='static')box.style.position='relative';
    box.append(canvas);size();
    img.classList.add('living-source');

    const maxP=s===2?1:.5,maxD=s===2?1:.4;
    const state={t:0,p:0,d:0,mx:cfg.focus[0],my:cfg.focus[1]};
    const sync=()=>{uniforms.uTime.value=state.t;uniforms.uPower.value=state.p;uniforms.uDark.value=state.d;uniforms.uMouse.value=[state.mx,state.my];render();};
    let hovering=false,breath=null;
    const tweens=[];const keep=tw=>{tweens.push(tw);if(tweens.length>40)tweens.splice(0,20);return tw;};
    function breathe(){breath=keep(g.to(state,{t:'+=10',duration:10,ease:'none',onUpdate:sync,onComplete:()=>{if(hovering)breathe();}}));}
    const point=e=>{
      const r=canvas.getBoundingClientRect();
      const bx=(e.clientX-r.left)/r.width,by=1-(e.clientY-r.top)/r.height;
      return [(bx-.5)/fit[0]+.5,(by-.5)/fit[1]+.5];
    };
    const enter=e=>{
      hovering=true;
      keep(g.to(state,{p:maxP,duration:1.6,ease:'sine.out',overwrite:'auto',onUpdate:sync}));
      keep(g.to(state,{d:maxD,duration:8,ease:'sine.in',overwrite:'auto',onUpdate:sync}));  // страх нарастает, пока смотришь
      if(!breath||!breath.isActive())breathe();
      move(e);
    };
    const move=e=>{const [x,y]=point(e);keep(g.to(state,{mx:x,my:y,duration:1.4,ease:'sine.out',overwrite:'auto',onUpdate:sync}));};
    const leave=()=>{
      hovering=false;
      keep(g.to(state,{p:0,duration:2,ease:'sine.inOut',overwrite:'auto',onUpdate:sync}));
      keep(g.to(state,{d:0,duration:2.6,ease:'sine.inOut',overwrite:'auto',onUpdate:sync,onComplete:()=>{if(!hovering)breath?.kill();}}));
    };
    box.addEventListener('pointerenter',enter);box.addEventListener('pointermove',move);box.addEventListener('pointerleave',leave);
    addEventListener('resize',size);

    // На низком рассудке существо один раз медленно шевелится при открытии страницы — и замирает.
    if(s===2){
      keep(g.fromTo(state,{p:.75},{p:0,duration:4,delay:.4,ease:'sine.inOut',onUpdate:sync}));
      keep(g.to(state,{t:'+=4',duration:4,delay:.4,ease:'none',onUpdate:sync}));
    }

    return {destroy(){
      tweens.forEach(tw=>tw.kill());breath?.kill();
      box.removeEventListener('pointerenter',enter);box.removeEventListener('pointermove',move);box.removeEventListener('pointerleave',leave);
      removeEventListener('resize',size);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      canvas.remove();img.classList.remove('living-source');
    }};
  }

  function decorate(host,hash){
    active?.destroy();active=null;
    const m=/^#entry\/([^/]+)$/.exec(hash||'');
    const cfg=m&&CREATURES[m[1]];
    if(!cfg||!supported())return;
    const v=level(),s=v<40?2:v<70?1:0;if(!s)return;
    const img=host.querySelector('.specimen-art .living img');if(!img)return;
    const start=()=>{
      if(!img.isConnected||!img.naturalWidth)return;
      try{active=mount(img,cfg,s);}catch{active=null;img.classList.remove('living-source');}
    };
    if(img.complete&&img.naturalWidth)start();else img.addEventListener('load',start,{once:true});
  }
  window.livingEngraving=Object.freeze({decorate,kinds:Object.fromEntries(Object.entries(CREATURES).map(([k,v])=>[k,v.kind]))});
})();
