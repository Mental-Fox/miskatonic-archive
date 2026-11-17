'use strict';
(function(){
  const shapes={
    crown:{width:20,phase:.1,curves:[[[370,82],[427,54],[475,113],[507,71]],[[507,71],[549,17],[597,36],[579,78]],[[579,78],[569,101],[541,96],[548,79]]]},
    upper:{width:14,phase:1.2,curves:[[[370,175],[407,158],[441,188],[462,170]],[[462,170],[489,147],[466,122],[453,136]],[[453,136],[444,147],[454,158],[460,149]]]},
    middle:{width:9.5,phase:2.3,curves:[[[370,285],[400,300],[438,298],[445,270]],[[445,270],[450,245],[478,239],[490,253]],[[490,253],[499,264],[486,276],[479,265]]]},
    lower:{width:18,phase:3.4,curves:[[[370,385],[424,357],[455,394],[491,385]],[[491,385],[548,372],[550,428],[517,433]],[[517,433],[492,437],[490,412],[510,415]]]},
    heel:{width:8.5,phase:4.5,curves:[[[370,485],[400,471],[440,483],[456,510]],[[456,510],[472,539],[505,520],[487,503]],[[487,503],[480,497],[471,503],[478,511]]]},
    bottom:{width:8,phase:5.6,curves:[[[265,538],[254,570],[286,575],[286,605]],[[286,605],[286,628],[258,632],[256,612]],[[256,612],[255,602],[268,598],[271,607]]]},
    rootlet:{width:6.5,phase:6.7,curves:[[[105,538],[104,561],[74,574],[79,599]],[[79,599],[84,621],[112,609],[106,594]],[[106,594],[101,585],[92,590],[96,598]]]},
    sprout:{width:4.2,phase:7.8,curves:[[[370,124],[398,116],[414,129],[427,118]],[[427,118],[442,104],[451,117],[440,124]]]},
    thread:{width:4.8,phase:8.9,curves:[[[370,331],[393,319],[413,338],[425,326]],[[425,326],[438,312],[447,330],[433,334]]]},
    touchUpper:{width:10,phase:10,touch:true,curves:[[[396,211],[432,198],[448,233],[419,248]],[[419,248],[387,267],[363,229],[343,216]],[[343,216],[327,206],[314,221],[326,231]]]},
    touchSide:{width:7,phase:11.1,touch:true,curves:[[[396,354],[425,340],[448,376],[423,390]],[[423,390],[400,403],[365,377],[351,359]],[[351,359],[337,341],[318,350],[324,364]]]},
    touchBottom:{width:12.5,phase:12.2,touch:true,curves:[[[211,546],[221,586],[169,596],[150,566]],[[150,566],[132,536],[155,512],[174,501]],[[174,501],[196,489],[215,508],[202,519]]]},
    leftLarge:{width:17,phase:13.3,curves:[[[16,215],[-42,200],[-48,135],[-99,145]],[[-99,145],[-148,154],[-137,207],[-106,194]],[[-106,194],[-88,186],[-98,168],[-111,177]]]},
    leftLow:{width:11,phase:14.4,curves:[[[16,420],[-25,440],[-85,410],[-101,445]],[[-101,445],[-121,487],[-73,493],[-70,466]],[[-70,466],[-69,453],[-89,449],[-90,462]]]},
    leftWhisker:{width:4.7,phase:15.5,curves:[[[16,75],[-11,64],[-22,85],[-39,72]],[[-39,72],[-58,57],[-68,77],[-52,83]]]},
    topCurl:{width:9,phase:16.6,curves:[[[95,18],[100,-25],[55,-45],[35,-18]],[[35,-18],[15,7],[-3,-17],[10,-31]],[[10,-31],[17,-39],[30,-32],[23,-25]]]},
    topLong:{width:13.5,phase:17.7,curves:[[[275,18],[285,-42],[330,-63],[353,-33]],[[353,-33],[376,-2],[399,-42],[381,-63]],[[381,-63],[368,-77],[351,-58],[365,-49]]]},
    bottomWhisker:{width:4.3,phase:18.8,curves:[[[335,538],[340,569],[378,574],[372,598]],[[372,598],[368,615],[349,607],[355,595]]]},
    touchLeft:{width:9.5,phase:19.9,touch:true,curves:[[[5,315],[-28,296],[-43,338],[-17,351]],[[-17,351],[18,369],[44,328],[63,314]],[[63,314],[79,302],[93,320],[79,330]]]},
    touchTop:{width:7.5,phase:21,touch:true,curves:[[[225,6],[234,-31],[186,-44],[169,-17]],[[169,-17],[152,10],[181,48],[200,62]],[[200,62],[225,80],[219,104],[203,94]]]}
  };
  const fmt=n=>n.toFixed(2);
  const pt=p=>fmt(p[0])+' '+fmt(p[1]);
  function curve(c,u){
    const v=1-u;
    return [0,1].map(k=>v*v*v*c[0][k]+3*v*v*u*c[1][k]+3*v*u*u*c[2][k]+u*u*u*c[3][k]);
  }
  function path(points,closed=false){
    if(!points.length)return '';
    let d='M'+pt(points[0]);
    const at=i=>closed?points[(i+points.length)%points.length]:points[Math.max(0,Math.min(i,points.length-1))];
    const count=closed?points.length:points.length-1;
    for(let i=0;i<count;i++){
      const a=at(i-1),b=at(i),c=at(i+1),e=at(i+2);
      d+='C'+pt([b[0]+(c[0]-a[0])/6,b[1]+(c[1]-a[1])/6])+' '+pt([c[0]-(e[0]-b[0])/6,c[1]-(e[1]-b[1])/6])+' '+pt(c);
    }
    return d+(closed?'Z':'');
  }
  function geometry(kind,time,amount,pointer=0,start=0){
    const shape=shapes[kind]||shapes.upper,N=48;
    function center(t){
      const q=t*shape.curves.length,i=Math.min(Math.floor(q),shape.curves.length-1);
      const p=curve(shape.curves[i],q-i);
      const reach=t*t*(shape.touch?1-.9*Math.pow(t,6):1),phase=time*(.95+Math.sin(shape.phase)*.12)+shape.phase;
      // The binding holds the root; the wave builds toward the tip.
      p[0]+=reach*amount*(Math.sin(phase+t*4.8)*3.2+pointer*1.8);
      p[1]+=reach*amount*(Math.sin(phase*1.13+t*5.4)*4.2+Math.sin(time*1.7+t*7)*.55);
      return p;
    }
    function section(t){
      const p=center(t),a=center(Math.max(0,t-.002)),b=center(Math.min(1,t+.002));
      const dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy)||1;
      return {p,n:[-dy/length,dx/length],width:.18+shape.width*Math.pow(1-t,1.28),angle:Math.atan2(dy,dx)*180/Math.PI};
    }
    const side=(s,f)=>[s.p[0]+s.n[0]*s.width*f,s.p[1]+s.n[1]*s.width*f];
    const sections=Array.from({length:N+1},(_,i)=>section(start+(1-start)*i/N));
    const body=path([...sections.map(s=>side(s,-1)),...sections.slice().reverse().map(s=>side(s,1))],true);
    const belly=path([...sections.map(s=>side(s,.25)),...sections.slice().reverse().map(s=>side(s,.94))],true);
    const ridge=path(sections.map(s=>side(s,-.48)));
    let folds='';
    for(let i=1;i<13;i++){
      const s=section(start+(1-start)*i/15),a=side(s,-.8),b=side(s,.22);
      folds+='M'+pt(a)+'Q'+pt([s.p[0]-1.2,s.p[1]+1.6])+' '+pt(b);
    }
    const cups=[];
    for(let i=0;i<15;i++){
      const t=start+(1-start)*(.09+i*.054),s=section(t),p=side(s,.65);
      const irregular=.94+Math.sin(i*1.8+shape.phase)*.09;
      cups.push({x:p[0],y:p[1],rx:Math.max(.4,s.width*.28*irregular),ry:Math.max(.27,s.width*.16*irregular),angle:s.angle});
    }
    return {body,belly,ridge,folds,cups,root:center(start),tip:center(1),touch:!!shape.touch,size:shape.width};
  }
  function mount(svg){
    if(!svg)return ()=>{};
    const ns='http://www.w3.org/2000/svg';
    const onCover=svg.getAttribute?.('data-surface')==='cover';
    const make=(tag,attrs,parent)=>{
      const el=document.createElementNS(ns,tag);
      for(const [name,value] of Object.entries(attrs))el.setAttribute(name,value);
      parent.append(el);return el;
    };
    const rigs=[...svg.querySelectorAll('[data-tentacle]')].map(group=>{
      group.replaceChildren();
      const kind=group.getAttribute('data-tentacle');
      const shadow=onCover&&shapes[kind]?.touch?make('path',{'class':'tentacle-contact-shadow'},group):null;
      const body=make('path',{'class':'tentacle-skin'},group);
      const pores=make('path',{'class':'tentacle-pores'},group);
      const belly=make('path',{'class':'tentacle-belly'},group);
      const folds=make('path',{'class':'tentacle-folds'},group);
      const ridge=make('path',{'class':'tentacle-ridge'},group);
      const cups=Array.from({length:15},()=>{
        const ring=make('g',{},group);
        return {ring,outer:make('ellipse',{'class':'tentacle-cup'},ring),hole:make('ellipse',{'class':'tentacle-cup-hole'},ring)};
      });
      return {kind,shadow,start:onCover ? .32 : 0,body,pores,belly,folds,ridge,cups};
    });
    return (time,amount,pointer=0)=>{
      for(const rig of rigs){
        const g=geometry(rig.kind,time,amount,pointer,rig.start);
        if(rig.shadow)rig.shadow.setAttribute('d',g.body);
        rig.body.setAttribute('d',g.body);rig.pores.setAttribute('d',g.body);
        for(const key of ['belly','folds','ridge'])rig[key].setAttribute('d',g[key]);
        rig.cups.forEach((cup,i)=>{
          const p=g.cups[i];
          cup.ring.setAttribute('transform','translate('+fmt(p.x)+' '+fmt(p.y)+') rotate('+fmt(p.angle)+')');
          for(const [key,factor] of [['outer',1],['hole',.47]]){
            cup[key].setAttribute('rx',fmt(p.rx*factor));cup[key].setAttribute('ry',fmt(p.ry*factor));
          }
        });
      }
    };
  }
  const api={geometry,mount,kinds:Object.keys(shapes)};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else window.bookTentacles=api;
})();
