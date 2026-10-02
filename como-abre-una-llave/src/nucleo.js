/* =====================================================================
   NÚCLEO — motor de películas dibujadas cuadro por cuadro.
   Copiar tal cual. Debajo, la película: paletas, escenas, línea de tiempo.
   ===================================================================== */
var W=1600,H=900,FPS=12;
var cv=document.getElementById('pantalla'), ctx=cv.getContext('2d');
/* ---------- azar con semilla (mulberry32) ---------- */
function rng(s){var a=s>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);
  t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
var FR=0;                                   // cuadro actual (para el temblor)
function boil(base){return (base*7919 + Math.floor(FR/2)*104729)>>>0;}  // cambia cada 2 cuadros
function lerp(a,b,t){return a+(b-a)*t;}
function clamp(v,a,b){return v<a?a:v>b?b:v;}
function ease(t){return t<0?0:t>1?1:t*t*(3-2*t);}
function easeOut(t){return 1-Math.pow(1-clamp(t,0,1),3);}
function easeIn(t){return Math.pow(clamp(t,0,1),2.4);}
function al(hex,a){var n=parseInt(hex.slice(1),16);
  return 'rgba('+((n>>16)&255)+','+((n>>8)&255)+','+(n&255)+','+a+')';}

/* ---------- paletas: dos mundos, mismas claves ----------
   sombra = la sombra que deja el canto de la hoja; canto = el borde iluminado;
   rejilla = el cuadriculado (sólo si grid:1).                            */
var CIELO={id:'c',bg:'#101725',bg2:'#182137',bg3:'#0a0f1c',grano:'#33405c',
  tinta:'#e9e3d3',dim:'#93a0b8',ambar:'#e5a747',oxido:'#cd6047',cons:'#7fa6c9',
  sombra:'#05080f',canto:'#2a3a56',rejilla:'#5f7391',seed:11,grid:0};
var PAPEL={id:'p',bg:'#dcd3bd',bg2:'#cfc5ae',bg3:'#efe9da',grano:'#8f8a76',
  tinta:'#28304a',dim:'#7d7a6b',ambar:'#a8641f',oxido:'#b0442c',cons:'#5b6d88',
  sombra:'#3a3529',canto:'#efe9da',rejilla:'#5f7391',seed:23,grid:1};

/* ---------- papel (se dibuja una sola vez) ---------- */
function makePaper(p){
  var c=document.createElement('canvas');c.width=W;c.height=H;var x=c.getContext('2d');
  x.fillStyle=p.bg;x.fillRect(0,0,W,H);
  var r=rng(p.seed),i,j;
  for(i=0;i<110;i++){                                  // manchas suaves
    var mx=r()*W,my=r()*H,mr=50+r()*230;
    var g=x.createRadialGradient(mx,my,0,mx,my,mr);
    g.addColorStop(0,al(r()<0.5?p.bg2:p.bg3,p.grid?0.22:0.5));g.addColorStop(1,al(p.bg2,0));
    x.fillStyle=g;x.fillRect(mx-mr,my-mr,mr*2,mr*2);
  }
  if(p.grid){                                          // cuadriculado del cuaderno
    x.strokeStyle=al(p.rejilla,0.3);x.lineWidth=1;
    for(i=0;i<=W;i+=44){x.beginPath();x.moveTo(i+0.5,0);x.lineTo(i+0.5,H);x.stroke();}
    for(j=2;j<=H;j+=44){x.beginPath();x.moveTo(0,j+0.5);x.lineTo(W,j+0.5);x.stroke();}
    x.strokeStyle=al(p.rejilla,0.4);
    for(i=0;i<=W;i+=220){x.beginPath();x.moveTo(i+0.5,0);x.lineTo(i+0.5,H);x.stroke();}
    for(j=2;j<=H;j+=220){x.beginPath();x.moveTo(0,j+0.5);x.lineTo(W,j+0.5);x.stroke();}
  }
  for(i=0;i<16000;i++){                                // grano
    var gx=r()*W,gy=r()*H,a=0.03+r()*0.1;
    x.fillStyle=al(r()<0.62?p.grano:p.bg3,a);
    x.fillRect(gx,gy,1+(r()<0.12?1:0),1);
  }
  for(i=0;i<220;i++){                                  // fibras
    var fx=r()*W,fy=r()*H,fa=r()*Math.PI,fl=6+r()*26;
    x.strokeStyle=al(r()<0.5?p.grano:p.bg3,0.07+r()*0.1);x.lineWidth=0.7+r()*0.6;
    x.beginPath();x.moveTo(fx,fy);
    x.quadraticCurveTo(fx+Math.cos(fa)*fl*0.5-3+r()*6,fy+Math.sin(fa)*fl*0.5-3+r()*6,
                       fx+Math.cos(fa)*fl,fy+Math.sin(fa)*fl);x.stroke();
  }
  var v=x.createRadialGradient(W*0.5,H*0.46,H*0.24,W*0.5,H*0.5,H*1.02);  // viñeta
  v.addColorStop(0,al(p.bg3,0));v.addColorStop(1,al(p.bg3,p.grid?0.42:0.62));
  x.fillStyle=v;x.fillRect(0,0,W,H);
  return c;
}
var PAPERS={};
function lamina(p){if(!PAPERS[p.id])PAPERS[p.id]=makePaper(p);return PAPERS[p.id];}
function paper(p,k){        // k>1 acerca la cámara sobre la hoja
  var im=lamina(p);
  if(!k||k<=1.001){ctx.drawImage(im,0,0);return;}
  ctx.save();ctx.translate(W/2,H/2);ctx.scale(k,k);ctx.drawImage(im,-W/2,-H/2);ctx.restore();
}

/* ---------- trazo a mano ---------- */
function resample(pts,step){
  var out=[],i,j;
  for(i=0;i<pts.length-1;i++){
    var a=pts[i],b=pts[i+1],d=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.round(d/step));
    for(j=0;j<n;j++){var t=j/n;out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}
  }
  out.push(pts[pts.length-1]);return out;
}
function jitter(pts,amp,seed){
  var r=rng(seed),out=[],i;
  for(i=0;i<pts.length;i++){
    var e=(i===0||i===pts.length-1)?0.5:1;
    out.push([pts[i][0]+(r()*2-1)*amp*e,pts[i][1]+(r()*2-1)*amp*e]);
  }
  return out;
}
function cut(pts,f){
  if(f>=1)return pts; if(f<=0)return null;
  var tot=0,seg=[],i;
  for(i=0;i<pts.length-1;i++){var d=Math.hypot(pts[i+1][0]-pts[i][0],pts[i+1][1]-pts[i][1]);seg.push(d);tot+=d;}
  var want=tot*f,acc=0,out=[pts[0]];
  for(i=0;i<seg.length;i++){
    if(acc+seg[i]>=want||i===seg.length-1){
      var t=seg[i]?clamp((want-acc)/seg[i],0,1):1;
      out.push([lerp(pts[i][0],pts[i+1][0],t),lerp(pts[i][1],pts[i+1][1],t)]);break;
    }
    acc+=seg[i];out.push(pts[i+1]);
  }
  return out.length>1?out:null;
}
function pathOf(c,pts,close){
  var i;c.beginPath();
  if(pts.length<3){c.moveTo(pts[0][0],pts[0][1]);for(i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);}
  else{
    c.moveTo(pts[0][0],pts[0][1]);
    for(i=1;i<pts.length-1;i++)c.quadraticCurveTo(pts[i][0],pts[i][1],
      (pts[i][0]+pts[i+1][0])/2,(pts[i][1]+pts[i+1][1])/2);
    c.lineTo(pts[pts.length-1][0],pts[pts.length-1][1]);
  }
  if(close)c.closePath();
}
/* o: color, w, amp, seed, close, alpha, dash, step, frac, pasadas */
function trazo(pts,o){
  o=o||{}; if(!pts||pts.length<2)return;
  var p=resample(pts,o.step||16);
  p=jitter(p,o.amp===undefined?1.5:o.amp,boil(o.seed||1));
  if(o.frac!==undefined){p=cut(p,o.frac);if(!p)return;}
  ctx.save();
  ctx.strokeStyle=o.color||'#e9e3d3';ctx.lineWidth=o.w||2;
  ctx.lineCap='round';ctx.lineJoin='round';
  ctx.globalAlpha=o.alpha===undefined?1:o.alpha;
  if(o.dash)ctx.setLineDash(o.dash);
  var n=o.pasadas||1,k;
  for(k=0;k<n;k++){
    if(k){var q=jitter(p,0.9,boil((o.seed||1)+97*k));pathOf(ctx,q,o.close);}
    else pathOf(ctx,p,o.close);
    if(k)ctx.globalAlpha=(o.alpha===undefined?1:o.alpha)*0.55;
    ctx.stroke();
  }
  ctx.restore();
}
function relleno(pts,o){
  o=o||{};var p=jitter(resample(pts,o.step||18),o.amp===undefined?1.2:o.amp,boil(o.seed||2));
  ctx.save();ctx.fillStyle=o.color;ctx.globalAlpha=o.alpha===undefined?1:o.alpha;
  pathOf(ctx,p,true);ctx.fill();ctx.restore();
}
/* trama: líneas paralelas recortadas a un polígono */
function trama(pts,o){
  o=o||{};var ang=(o.ang===undefined?-0.6:o.ang),gap=o.gap||9;
  var xs=pts.map(function(q){return q[0];}),ys=pts.map(function(q){return q[1];});
  var x0=Math.min.apply(null,xs),x1=Math.max.apply(null,xs);
  var y0=Math.min.apply(null,ys),y1=Math.max.apply(null,ys);
  var cx=(x0+x1)/2,cy=(y0+y1)/2,rad=Math.hypot(x1-x0,y1-y0)/2+8;
  ctx.save();pathOf(ctx,jitter(resample(pts,20),1.4,boil(o.seed||3)),true);ctx.clip();
  ctx.strokeStyle=o.color;ctx.lineWidth=o.w||1.1;ctx.lineCap='round';
  ctx.globalAlpha=o.alpha===undefined?0.5:o.alpha;
  var r=rng(boil(o.seed||3)),d;
  for(d=-rad;d<=rad;d+=gap){
    var ox=Math.cos(ang),oy=Math.sin(ang);
    var ax=cx-oy*d-ox*rad,ay=cy+ox*d-oy*rad;
    var bx=cx-oy*d+ox*rad,by=cy+ox*d+oy*rad;
    var p=jitter(resample([[ax,ay],[bx,by]],26),1.6,(r()*1e9)>>>0);
    pathOf(ctx,p,false);ctx.stroke();
  }
  ctx.restore();
}
/* ---------- luces: cualquier punto que brilla (lámpara, chispa, ciudad, estrella) ---------- */
function luz(x,y,r,col,seed,glow){
  if(x<-40||x>W+40||y<-40||y>H+40)return;
  var rr=rng(seed),wob=0.85+rr()*0.3,g;
  if(glow>0){
    var R=r*3.4+3.5;
    g=ctx.createRadialGradient(x,y,r*0.6,x,y,R);
    g.addColorStop(0,al(col,0.30*glow));g.addColorStop(0.5,al(col,0.07*glow));g.addColorStop(1,al(col,0));
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,R,0,6.2832);ctx.fill();
  }
  ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y,r*wob,0,6.2832);ctx.fill();
  if(r>1.7){
    ctx.save();ctx.strokeStyle=col;ctx.lineWidth=Math.max(0.7,r*0.26);ctx.lineCap='round';
    ctx.globalAlpha=0.7;var L=r*(2.9+rr()*1.1),a0=rr()*0.5;
    ctx.beginPath();
    ctx.moveTo(x-Math.cos(a0)*L,y-Math.sin(a0)*L);ctx.lineTo(x+Math.cos(a0)*L,y+Math.sin(a0)*L);
    ctx.moveTo(x-Math.cos(a0+1.5708)*L*0.66,y-Math.sin(a0+1.5708)*L*0.66);
    ctx.lineTo(x+Math.cos(a0+1.5708)*L*0.66,y+Math.sin(a0+1.5708)*L*0.66);
    ctx.stroke();ctx.restore();
  }
}
function circulo(x,y,r,o){
  var pts=[],i,n=Math.max(10,Math.round(r*0.9));
  for(i=0;i<=n;i++){var a=i/n*6.2832;pts.push([x+Math.cos(a)*r,y+Math.sin(a)*r]);}
  trazo(pts,o);
}
/* rótulo con línea de guía */
function rotulo(px,py,dx,dy,txt,size,o){
  o=o||{};var f=o.frac===undefined?1:o.frac;
  if(f<=0)return;
  var d=Math.hypot(dx,dy),ux=dx/d,uy=dy/d,r0=o.r0||16;
  trazo([[px+ux*r0,py+uy*r0],[px+dx,py+dy]],
    {color:o.color,w:o.lw||1.4,amp:1,seed:o.seed||9,alpha:(o.alpha||1)*0.8,frac:clamp(f*1.8,0,1)});
  if(f>0.35)texto(txt,px+dx+(dx>=0?12:-12),py+dy+size*0.36,size,
    {color:o.color,align:dx>=0?'l':'r',seed:(o.seed||9)+7,frac:clamp((f-0.35)/0.5,0,1),
     alpha:o.alpha,w:o.tw,track:o.track});
}
/* marca de punto señalado: circulito + punto */
function marca(p,r,col,seed,f){
  if(!p||f<=0)return;
  circulo(p[0],p[1],r,{color:col,w:1.6,amp:0.9,seed:seed,frac:clamp(f*1.5,0,1)});
  if(f>0.5){ctx.fillStyle=col;ctx.beginPath();ctx.arc(p[0],p[1],r*0.28,0,6.2832);ctx.fill();}
}
/* =====================================================================
   Alfabeto de un solo trazo — se escribe a mano, letra por letra.
   x:0..ancho   y:0 (altura de mayúscula) .. 100 (línea de base)
   ===================================================================== */
var GL={
 'A':[62,[[2,100,31,0,60,100],[14,62,48,62]]],
 'B':[56,[[0,0,0,100],[0,0,38,8,42,40,4,50],[4,50,46,60,48,92,0,100]]],
 'C':[60,[[56,14,32,0,10,20,5,52,12,84,34,100,58,86]]],
 'D':[58,[[0,0,0,100],[0,0,34,10,50,50,34,92,0,100]]],
 'E':[52,[[50,0,0,0,0,100,52,100],[0,50,38,50]]],
 'F':[50,[[48,0,0,0,0,100],[0,50,36,50]]],
 'G':[60,[[56,14,32,0,10,20,5,52,12,84,36,100,58,84,58,54,34,54]]],
 'H':[54,[[0,0,0,100],[52,0,52,100],[0,52,52,52]]],
 'I':[20,[[10,0,10,100]]],
 'J':[46,[[44,0,44,76,30,98,8,88]]],
 'K':[54,[[0,0,0,100],[46,0,4,56],[14,46,52,100]]],
 'L':[46,[[0,0,2,100,46,98]]],
 'M':[68,[[0,100,6,0,34,66,62,0,68,100]]],
 'N':[56,[[0,100,2,0,54,100,56,0]]],
 'O':[62,[[32,0,10,18,4,52,12,86,34,100,54,84,60,50,50,14,32,0]]],
 'P':[54,[[0,100,0,0,42,8,46,40,2,54]]],
 'Q':[62,[[32,0,10,18,4,52,12,86,34,100,54,84,60,50,50,14,32,0],[36,74,64,108]]],
 'R':[56,[[0,100,0,0,42,8,46,40,2,52],[16,50,52,100]]],
 'S':[54,[[52,12,26,0,6,18,14,42,42,56,50,78,28,100,4,88]]],
 'T':[52,[[0,2,52,0],[26,2,26,100]]],
 'U':[54,[[0,0,2,74,26,100,50,74,52,0]]],
 'V':[56,[[0,0,28,100,56,0]]],
 'W':[76,[[0,0,16,100,38,36,58,100,76,0]]],
 'X':[54,[[0,0,52,100],[52,0,0,100]]],
 'Y':[56,[[0,0,28,52,56,0],[28,52,28,100]]],
 'Z':[54,[[0,2,52,0,2,98,54,100]]],
 '0':[52,[[26,0,6,20,4,52,10,84,28,100,46,82,50,50,44,16,26,0]]],
 '1':[30,[[2,18,16,0,16,100]]],
 '2':[52,[[4,18,24,0,46,12,44,40,4,100,50,98]]],
 '3':[52,[[4,10,26,0,46,14,38,46,12,50],[38,46,52,70,32,100,4,88]]],
 '4':[54,[[38,0,2,72,52,72],[38,0,38,100]]],
 '5':[52,[[48,0,8,2,4,44,26,38,46,52,48,78,26,100,2,90]]],
 '6':[52,[[46,8,24,0,8,26,4,60,10,88,30,100,46,86,48,62,30,52,10,60]]],
 '7':[50,[[0,2,50,0,20,100]]],
 '8':[54,[[30,50,10,40,8,16,28,0,48,14,46,38,30,50,50,62,52,88,28,100,6,86,8,62,30,50]]],
 '9':[52,[[48,40,30,50,10,42,6,18,26,0,44,10,50,42,44,76,26,100,6,94]]],
 ' ':[34,[]],
 '.':[22,[[10,98,12,98]]],
 ',':[24,[[12,92,6,112]]],
 ':':[22,[[10,36,12,36],[10,96,12,96]]],
 '·':[24,[[10,52,12,52]]],
 '-':[42,[[4,54,38,54]]],
 '/':[42,[[38,0,4,100]]],
 '(':[28,[[22,-4,6,30,6,70,22,104]]],
 ')':[28,[[6,-4,22,30,22,70,6,104]]],
 '!':[22,[[11,0,9,68],[10,94,12,94]]],
 '¡':[22,[[11,100,13,32],[12,6,10,6]]],
 '?':[48,[[6,22,18,2,38,6,42,26,24,44,22,64],[22,94,24,94]]],
 '¿':[48,[[42,78,30,98,10,94,6,74,24,56,26,36],[26,6,24,6]]],
 '°':[32,[[16,4,7,11,7,23,16,30,25,23,25,11,16,4]]],
 '×':[46,[[7,34,39,70],[39,34,7,70]]],
 '±':[52,[[6,32,46,32],[26,14,26,50],[6,74,46,74]]],
 '+':[50,[[6,50,44,50],[25,31,25,69]]],
 '½':[86,[[6,14,17,4,17,48],[56,0,22,58],[42,60,52,53,63,62,60,78,42,98,68,96]]],
 '′':[22,[[15,0,6,28]]],
 '…':[60,[[6,98,8,98],[28,98,30,98],[50,98,52,98]]]
};
var ACC={'Á':'A','É':'E','Í':'I','Ó':'O','Ú':'U'};
function glifo(ch){
  if(GL[ch])return GL[ch];
  if(ACC[ch]){
    var b=GL[ACC[ch]],w=b[0],st=b[1].slice();
    st.push([w*0.30,-20,w*0.66,-40]);
    return [w,st];
  }
  if(ch==='Ñ'){var n=GL['N'],s2=n[1].slice();
    s2.push([4,-26,18,-40,38,-24,56,-38]);return [n[0],s2];}
  return GL[' '];
}
function anchoTexto(s,size,track){
  var k=size/100,t=(track===undefined?0.16:track)*size,w=0,i;
  s=s.toUpperCase();
  for(i=0;i<s.length;i++)w+=glifo(s[i])[0]*k+t;
  return w-t;
}
/* o: color,w,seed,align('l'|'c'|'r'),track,frac,alpha,amp,pasadas,rot */
function texto(s,x,y,size,o){
  o=o||{};s=s.toUpperCase();
  var k=size/100,t=(o.track===undefined?0.16:o.track)*size;
  var tot=anchoTexto(s,size,o.track);
  var ox=o.align==='c'?x-tot/2:o.align==='r'?x-tot:x;
  var strokes=[],i,j,g,st,pts,cur=ox;
  for(i=0;i<s.length;i++){
    g=glifo(s[i]);
    for(j=0;j<g[1].length;j++){
      st=g[1][j];pts=[];
      for(var m=0;m<st.length;m+=2)pts.push([cur+st[m]*k,y+st[m+1]*k]);
      strokes.push(pts);
    }
    cur+=g[0]*k+t;
  }
  var lens=[],total=0;
  for(i=0;i<strokes.length;i++){
    var L=0;for(j=0;j<strokes[i].length-1;j++)
      L+=Math.hypot(strokes[i][j+1][0]-strokes[i][j][0],strokes[i][j+1][1]-strokes[i][j][1]);
    L=Math.max(L,size*0.1);lens.push(L);total+=L;
  }
  var f=o.frac===undefined?1:clamp(o.frac,0,1),want=total*f,acc=0;
  ctx.save();
  if(o.rot){ctx.translate(x,y);ctx.rotate(o.rot);ctx.translate(-x,-y);}
  for(i=0;i<strokes.length;i++){
    if(acc>=want)break;
    var lf=clamp((want-acc)/lens[i],0,1);acc+=lens[i];
    trazo(strokes[i],{color:o.color,w:o.w||Math.max(1.1,size*0.085),amp:o.amp===undefined?size*0.018:o.amp,
      seed:(o.seed||7)+i*31,alpha:o.alpha,frac:lf,step:Math.max(5,size*0.16),pasadas:o.pasadas});
  }
  ctx.restore();
  return tot;
}

/* =====================================================================
   Línea de tiempo y transiciones. TL lo define la película.
   ===================================================================== */
var INI=[],DUR=0,TOTALF=0,TRD=0.44;
var buf1=null,buf2=null;
function buf(){var b=document.createElement('canvas');b.width=W;b.height=H;return b;}
function pintarEn(c,fn,t){var viejo=ctx;ctx=c;fn(t);ctx=viejo;}
function bordeRoto(y,seed){
  var r=rng(seed),p=[],x;
  for(x=-40;x<=W+40;x+=38)p.push([x,y+(r()*2-1)*9+Math.sin(x*0.011+seed)*4]);
  return p;
}
function escenaDe(t){var k=0;while(k<TL.length-1&&t>=INI[k+1])k++;return k;}
function drawFrame(i){
  FR=i;
  var t=Math.min(i/FPS,DUR-0.0001), k=escenaDe(t), lt=t-INI[k], sc=TL[k];
  if(sc.tr&&lt<TRD&&k>0){
    if(!buf1){buf1=buf();buf2=buf();}
    var b1=buf1.getContext('2d'),b2=buf2.getContext('2d');
    b1.clearRect(0,0,W,H);b2.clearRect(0,0,W,H);
    pintarEn(b1,sc.f,lt);                        // escena nueva
    pintarEn(b2,TL[k-1].f,TL[k-1].d-0.001);      // último cuadro de la anterior
    var u=ease(lt/TRD), nueva=sc.p||CIELO, vieja=TL[k-1].p||CIELO;
    if(sc.tr==='sube'){                          // la hoja sube y tapa lo anterior
      var dy=(1-u)*H, e=bordeRoto(dy,77);
      ctx.drawImage(buf2,0,0);
      ctx.save();
      ctx.beginPath();ctx.moveTo(-60,H+80);
      for(var m=0;m<e.length;m++)ctx.lineTo(e[m][0],e[m][1]);
      ctx.lineTo(W+60,H+80);ctx.closePath();ctx.clip();
      ctx.drawImage(buf1,0,dy);
      ctx.restore();
      trazo(e,{color:vieja.sombra,w:3,amp:0.6,seed:78,alpha:0.7,step:40});
      trazo(e.map(function(q){return [q[0],q[1]+3];}),
        {color:nueva.canto,w:1.6,amp:0.5,seed:79,alpha:0.5,step:40});
    }else{                                       // la hoja se va para arriba
      var dy2=-u*H, e2=bordeRoto(H+dy2,77);
      ctx.drawImage(buf1,0,0);
      ctx.save();
      ctx.beginPath();ctx.moveTo(-60,-80);
      for(var m2=0;m2<e2.length;m2++)ctx.lineTo(e2[m2][0],e2[m2][1]);
      ctx.lineTo(W+60,-80);ctx.closePath();ctx.clip();
      ctx.drawImage(buf2,0,dy2);
      ctx.restore();
      trazo(e2,{color:nueva.sombra,w:3,amp:0.6,seed:78,alpha:0.6,step:40});
      trazo(e2.map(function(q){return [q[0],q[1]-3];}),
        {color:vieja.canto,w:1.6,amp:0.5,seed:79,alpha:0.45,step:40});
    }
  }else{
    sc.f(lt);
  }
}
/* =====================================================================
   Partitura. La película la llena con ev(t,tipo,a,b,c):
   campana(frec,dur,vol) bajo(frec,dur,vol) tic(frec,dur,vol)
   lapiz(-,dur,vol) hoja(-,dur,vol) aire(-,dur,vol) swell(mult,dur,vol)
   ===================================================================== */
var PART=[];
function ev(t,tipo,a,b,c){PART.push({t:t,k:tipo,a:a,b:b,c:c});}
function reverb(a){
  var len=Math.floor(a.sampleRate*2.8),b=a.createBuffer(2,len,a.sampleRate),ch,i;
  for(ch=0;ch<2;ch++){var d=b.getChannelData(ch),r=rng(7+ch*5);
    for(i=0;i<len;i++)d[i]=(r()*2-1)*Math.pow(1-i/len,2.8)*0.7;}
  var c=a.createConvolver();c.buffer=b;return c;
}
function grafo(a){
  var m=a.createGain();m.gain.value=0.92;
  var lp=a.createBiquadFilter();lp.type='lowpass';lp.frequency.value=7200;
  var rv=reverb(a),send=a.createGain();send.gain.value=0.42;
  var out=a.createGain();out.gain.value=1.7;    // medido: con 1.7 el pico queda en ~55 %
  m.connect(lp);lp.connect(out);m.connect(send);send.connect(rv);rv.connect(out);
  out.connect(a.destination);
  return m;
}
function tono(a,m,t,f,d,v,tipo,nodos){
  var o=a.createOscillator(),g=a.createGain();
  o.type=tipo||'sine';o.frequency.setValueAtTime(f,t);
  g.gain.setValueAtTime(0.0001,t);
  g.gain.exponentialRampToValueAtTime(Math.max(v,0.0003),t+(tipo==='triangle'?0.5:0.014));
  g.gain.exponentialRampToValueAtTime(0.0001,t+d);
  o.connect(g);g.connect(m);o.start(t);o.stop(t+d+0.08);if(nodos)nodos.push(o);
}
function ruidoEv(a,m,t,d,v,f,q,nodos,sube){
  var len=Math.max(1,Math.floor(a.sampleRate*d)),b=a.createBuffer(1,len,a.sampleRate);
  var dd=b.getChannelData(0),r=rng((Math.floor(t*997)+13)>>>0),i;
  for(i=0;i<len;i++)dd[i]=(r()*2-1);
  var s=a.createBufferSource();s.buffer=b;
  var bp=a.createBiquadFilter();bp.type='bandpass';bp.frequency.setValueAtTime(f,t);
  if(sube)bp.frequency.exponentialRampToValueAtTime(f*sube,t+d);
  bp.Q.value=q;
  var g=a.createGain();g.gain.setValueAtTime(0.0001,t);
  g.gain.linearRampToValueAtTime(v,t+d*0.3);g.gain.exponentialRampToValueAtTime(0.0001,t+d);
  s.connect(bp);bp.connect(g);g.connect(m);s.start(t);s.stop(t+d+0.02);if(nodos)nodos.push(s);
}
function programar(a,m,desde,ahora,nodos){
  for(var i=0;i<PART.length;i++){
    var e=PART[i],t=ahora+(e.t-desde),dur=e.b;
    if(e.k==='bajo'){
      if(e.t+e.b<desde)continue;
      if(e.t<desde){dur=e.t+e.b-desde;t=ahora+0.02;}
    } else if(e.t<desde-0.02)continue;
    if(e.k==='campana')tono(a,m,t,e.a,e.b,e.c,'sine',nodos);
    else if(e.k==='bajo'){tono(a,m,t,e.a,dur,e.c,'triangle',nodos);}
    else if(e.k==='tic')ruidoEv(a,m,t,e.b,e.c,e.a,7,nodos);
    else if(e.k==='lapiz')ruidoEv(a,m,t,e.b,e.c,1900,1.1,nodos,2.4);
    else if(e.k==='hoja')ruidoEv(a,m,t,e.b,e.c*0.09,700,0.8,nodos,3.2);
    else if(e.k==='aire')ruidoEv(a,m,t,e.b,e.c,320,1.6,nodos,1.8);
    else if(e.k==='swell'){tono(a,m,t,110*e.a,e.b,0.09*e.c,'triangle',nodos);
                           tono(a,m,t,165*e.a,e.b,0.05*e.c,'sine',nodos);}
  }
}

/* ===================== Reproductor ===================== */
var AC=null,MST=null,nodos=[],tiempo=0,ultimo=-1,corriendo=false,t0pared=0,t0film=0,mudo=false;
var velo=document.getElementById('velo'),btnPlay=document.getElementById('btnPlay'),
    btnVolver=document.getElementById('btnVolver'),btnSon=document.getElementById('btnSon'),
    barra=document.getElementById('barra'),lleno=document.getElementById('lleno'),
    reloj=document.getElementById('reloj'),listaEsc=document.getElementById('escenas');
var ICO={
 play:'<svg width="15" height="16" viewBox="0 0 15 16" aria-hidden="true"><path d="M2 1 L13.5 8 L2 15 Z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>',
 pausa:'<svg width="14" height="16" viewBox="0 0 14 16" aria-hidden="true"><path d="M4 1v14M10 1v14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
 son:'<svg width="18" height="16" viewBox="0 0 18 16" aria-hidden="true"><path d="M2 6h3l4-3.5v11L5 10H2z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M12 5.2a4 4 0 0 1 0 5.6M14.6 3a7.4 7.4 0 0 1 0 10" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>',
 mudo:'<svg width="18" height="16" viewBox="0 0 18 16" aria-hidden="true"><path d="M2 6h3l4-3.5v11L5 10H2z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M12 5.5l4.5 5M16.5 5.5l-4.5 5" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>'
};
btnPlay.innerHTML=ICO.play;btnSon.innerHTML=ICO.son;
function mmss(s){var m=Math.floor(s/60),g=Math.floor(s%60);return m+':'+(g<10?'0':'')+g;}
function pintar(t){
  var fi=Math.min(Math.floor(t*FPS),TOTALF-1);
  if(fi!==ultimo){ultimo=fi;drawFrame(fi);}
}
function audioOn(){
  if(mudo)return null;
  if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)();MST=grafo(AC);}
          catch(e){return null;}}
  if(AC.state==='suspended')AC.resume();
  return AC;
}
function audioStop(){
  for(var i=0;i<nodos.length;i++){try{nodos[i].stop(0);}catch(e){}}
  nodos=[];
}
function audioDesde(t){
  audioStop();var a=audioOn();
  if(a&&MST)programar(a,MST,t,a.currentTime+0.08,nodos);
}
function play(){
  if(corriendo)return;
  if(tiempo>=DUR-0.02)tiempo=0;
  corriendo=true;t0pared=performance.now();t0film=tiempo;
  velo.hidden=true;btnPlay.innerHTML=ICO.pausa;btnPlay.setAttribute('aria-label','Pausar');
  audioDesde(tiempo);
}
function pausa(dejar){
  if(!corriendo)return;
  corriendo=false;if(!dejar)audioStop();nodos=dejar?[]:nodos;
  btnPlay.innerHTML=ICO.play;btnPlay.setAttribute('aria-label','Reproducir');
}
function irA(t,seguir){
  tiempo=clamp(t,0,DUR-0.001);
  if(corriendo){t0pared=performance.now();t0film=tiempo;audioDesde(tiempo);}
  pintar(tiempo);ui();
  if(seguir&&!corriendo)play();
}
function ui(){
  var p=tiempo/DUR;
  lleno.style.width=(p*100).toFixed(2)+'%';
  barra.setAttribute('aria-valuenow',Math.round(p*100));
  reloj.textContent=mmss(tiempo)+' / '+mmss(DUR);
  var k=escenaDe(Math.min(tiempo,DUR-0.001));
  for(var i=0;i<caps.length;i++)caps[i].setAttribute('aria-current',i===k?'true':'false');
}
var caps=[];
function lazo(){
  if(corriendo){
    tiempo=t0film+(performance.now()-t0pared)/1000;
    if(tiempo>=DUR){tiempo=DUR-0.001;pintar(tiempo);pausa(true);velo.hidden=false;ui();}
    else{pintar(tiempo);ui();}
  }
  requestAnimationFrame(lazo);
}
velo.addEventListener('click',function(){if(tiempo>=DUR-0.02||!corriendo){irA(0,false);play();}});
btnPlay.addEventListener('click',function(){corriendo?pausa():play();});
btnVolver.addEventListener('click',function(){irA(0,false);});
btnSon.addEventListener('click',function(){
  mudo=!mudo;btnSon.innerHTML=mudo?ICO.mudo:ICO.son;
  btnSon.setAttribute('aria-pressed',mudo?'true':'false');
  btnSon.setAttribute('aria-label',mudo?'Activar sonido':'Silenciar');
  if(mudo)audioStop(); else if(corriendo)audioDesde(tiempo);
});
cv.addEventListener('click',function(){corriendo?pausa():play();});
function desdeEvento(e){
  var r=barra.getBoundingClientRect(),x=(e.touches?e.touches[0].clientX:e.clientX)-r.left;
  return clamp(x/r.width,0,1)*DUR;
}
var arrastre=false;
barra.addEventListener('pointerdown',function(e){arrastre=true;barra.setPointerCapture(e.pointerId);
  irA(desdeEvento(e));});
barra.addEventListener('pointermove',function(e){if(arrastre)irA(desdeEvento(e));});
barra.addEventListener('pointerup',function(e){arrastre=false;});
barra.addEventListener('keydown',function(e){
  if(e.key==='ArrowRight'){irA(tiempo+1);e.preventDefault();}
  if(e.key==='ArrowLeft'){irA(tiempo-1);e.preventDefault();}
});
document.addEventListener('keydown',function(e){
  var t=e.target;
  if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'))return;
  if(e.key===' '||e.key==='k'){corriendo?pausa():play();e.preventDefault();}
  else if(e.key==='ArrowRight'&&t===document.body){irA(tiempo+1);e.preventDefault();}
  else if(e.key==='ArrowLeft'&&t===document.body){irA(tiempo-1);e.preventDefault();}
});
/* arrancar(poster): la película llama a esto al final, con TL y PART ya
   definidos. poster = segundo que se muestra quieto antes de reproducir. */
function arrancar(poster){
  var i,j;
  for(i=0;i<TL.length;i++){INI.push(DUR);DUR+=TL[i].d;}
  TOTALF=Math.round(DUR*FPS);
  PART.sort(function(x,y){return x.t-y.t;});
  var frag=document.createDocumentFragment();
  for(i=0;i<TL.length;i++){
    var li=document.createElement('li'),b=document.createElement('button');
    b.type='button';b.className='cap';
    b.innerHTML='<span class="n">'+TL[i].n+' · '+mmss(INI[i])+'</span>'+
      '<span class="t">'+TL[i].nom+'</span><span class="d">'+TL[i].txt+'</span>';
    (function(k){b.addEventListener('click',function(){irA(INI[k]+0.001,true);});})(i);
    li.appendChild(b);frag.appendChild(li);caps.push(b);
  }
  listaEsc.appendChild(frag);
  for(j=1;j<TL.length;j++){
    var d=document.createElement('div');d.className='pua';
    d.style.left=(INI[j]/DUR*100)+'%';barra.appendChild(d);
  }
  tiempo=poster||0;pintar(tiempo);tiempo=0;ultimo=-1;ui();
  requestAnimationFrame(lazo);
  window.__film={W:W,H:H,FPS:FPS,DUR:DUR,TOTALF:TOTALF,
    dibujar:function(i){drawFrame(i);},wav:renderWav};
}
function renderWav(){
  var OC=window.OfflineAudioContext||window.webkitOfflineAudioContext;
  var a=new OC(2,Math.ceil(44100*(DUR+3)),44100),m=grafo(a);
  programar(a,m,0,0.05,null);
  return a.startRendering().then(function(b){
    var n=b.length,ch=2,bytes=44+n*ch*2,ab=new ArrayBuffer(bytes),dv=new DataView(ab),o=0,i,c;
    function s(str){for(var j=0;j<str.length;j++)dv.setUint8(o++,str.charCodeAt(j));}
    s('RIFF');dv.setUint32(o,bytes-8,true);o+=4;s('WAVEfmt ');
    dv.setUint32(o,16,true);o+=4;dv.setUint16(o,1,true);o+=2;dv.setUint16(o,ch,true);o+=2;
    dv.setUint32(o,44100,true);o+=4;dv.setUint32(o,44100*ch*2,true);o+=4;
    dv.setUint16(o,ch*2,true);o+=2;dv.setUint16(o,16,true);o+=2;s('data');
    dv.setUint32(o,n*ch*2,true);o+=4;
    var d0=b.getChannelData(0),d1=b.numberOfChannels>1?b.getChannelData(1):d0;
    for(i=0;i<n;i++)for(c=0;c<2;c++){var v=clamp(c?d1[i]:d0[i],-1,1);
      dv.setInt16(o,v<0?v*32768:v*32767,true);o+=2;}
    var u=new Uint8Array(ab),bin='',K=0x8000;
    for(i=0;i<u.length;i+=K)bin+=String.fromCharCode.apply(null,u.subarray(i,i+K));
    return btoa(bin);
  });
}
