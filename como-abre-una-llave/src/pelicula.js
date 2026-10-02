/* =====================================================================
   PELÍCULA — «Cómo abre una llave»
   ---------------------------------------------------------------------
   ESCALETA (tiempos absolutos en segundos; 45,8 s, 9 escenas)
   inicio dur  escena           mundo    cámara        qué cambia                                        qué se escribe                                       qué suena
    0.0  4.2  I   La puerta     PASILLO  fija          puerta cerrada, lámpara; entra la llave            CÓMO ABRE / UNA LLAVE                                pasos, bajo, tintineo
    4.2  5.6  II  Por dentro    PLANO    fija          se dibuja el cilindro cortado al medio y A-A       CARCASA: FIJA · CONTRAPINES · RESORTES · LÍNEA DE     hoja, lápiz por rótulo
                                                                                                          CORTE · TAMBOR: GIRA · PINES · cajetín
    9.8  4.4  III Trabado       PLANO    fija          contrapines cruzan (óxido); el tambor intenta      SIN LLAVE, LOS CONTRAPINES / CRUZAN LA LÍNEA. /       golpe sordo = trabado
                                                       girar en A-A, choca, X                             EL TAMBOR NO GIRA.
   14.2  5.8  IV  La llave justa PLANO   fija          entra 3·5·1·4·2; los pines suben y caen; la línea  CADA DIENTE DEJA SU PIN / JUSTO EN LA LÍNEA.          roce, 5 notas (el código),
                                                       se enciende                                        NADA LA CRUZA.                                        campana = alineado
   20.0  4.6  V   Gira          PLANO    zoom a A-A    el tambor gira un cuarto de vuelta; contrapines    EL TAMBOR GIRA. / LOS CONTRAPINES QUEDAN ARRIBA. · 90° aire, clic = gira
                                                       quedan arriba
   24.6  4.0  VI  Se abre       PASILLO  fija          la llave gira (clic), el pestillo entra, la puerta GIRA. / EL PESTILLO ENTRA.                            clic, pestillo, crujido
   28.6  5.2  VII La otra llave PLANO    fija          hoja nueva; entra 1·5·1·6·2: un pin cruza arriba,  OTRA LLAVE: 1·5·1·6·2 / UNO ARRIBA, OTRO ABAJO.       melodía equivocada,
                                                       un contrapín abajo; choca, X                       NO GIRA.                                              golpe sordo
   33.8  6.4  VIII Las cuentas  PLANO    baja 900 px   la misma hoja, más abajo: llave grande, código,    ESTA LLAVE: 6 ALTURAS POR PIN / 6×6×6×6×6 = 7776      6 alturas, código,
                                                       grilla 5×6, la cuenta                              LLAVES / UNA SOLA ALINEA LOS CINCO / (EN TEORÍA)      campana
   40.2  5.6  IX  Cierre        PASILLO  fija          puerta abierta, llave puesta, firma                LA LLAVE / NO FUERZA NADA. / ALINEA, · Y GIRA.        melodía de la llave, acorde
   ===================================================================== */

/* ---------- los dos mundos ---------- */
var PASILLO={id:'a',bg:'#2b1d14',bg2:'#3a2a1c',bg3:'#1a110b',grano:'#6a4f38',
  tinta:'#efe3cc',dim:'#a8947a',ambar:'#e0a63e',oxido:'#c9654a',cons:'#8aa0b4',
  sombra:'#0d0806',canto:'#7a5a3e',rejilla:'#6a4f38',seed:41,grid:0};
var PLANO={id:'z',bg:'#1d4a7a',bg2:'#245a91',bg3:'#153a61',grano:'#7fa3c8',
  tinta:'#eef3f8',dim:'#a9c1da',ambar:'#f2d27a',oxido:'#f09a7a',cons:'#cfe0f0',
  sombra:'#0d2742',canto:'#5f86b0',rejilla:'#9dbbd8',seed:31,grid:1};
GL['=']=[46,[[6,40,40,40],[6,64,40,64]]];   // el alfabeto del núcleo no trae el igual

/* ---------- geometría del cilindro (hoja 1600×900) ---------- */
var YSH=400;                       // línea de corte
var HX0=170,HX1=930,HY0=250;       // carcasa (arriba de la línea), cara en HX0
var PY1=548;                       // fondo del tambor
var KW0=466,KW1=532,KWEND=900;     // canal de la llave
var CHT=272,CHW=44;                // tope y ancho de cámara
var CHX=[330,440,550,660,770];     // cámaras
var BIT=[3,5,1,4,2];               // código de dientes de la llave justa
var BIT2=[1,5,1,6,2];              // la otra llave: el 1.º diente más chico (pin más alto), el 4.º más hondo (pin más bajo)
var STEP=9,LD=70,PW=16;            // px por altura, largo del contrapín, media meseta
var LK=[];(function(){for(var i=0;i<5;i++)LK.push(KW0+STEP*BIT[i]-YSH);})();
var SHO=HX0,TIP=850,LHOJA=TIP-SHO; // hombro y punta de la llave metida del todo
var PC=(YSH+PY1)/2;                // centro del tambor en el corte
var EVX=1180,EVY=470,EVR=102,EVRP=(PY1-YSH)/2,EVTW=52;   // vista A-A, misma escala; torre de la carcasa
var LEVA={x0:HX1,x1:HX1+32,y0:PC-34,y1:PC+34};
var NOTAS=[220,261.63,293.66,329.63,392,440];   // las seis alturas, en pentatónica
var ESCR=function(n){return 0.4+0.045*n;};      // cuánto tarda en escribirse un rótulo de n letras
var S0=720;                                     // corrida de la llave cuando está afuera del todo

/* ---------- la llave ---------- */
function topLocal(x,bit){           // superficie superior de la hoja (0 = sin cortar), x desde el hombro
  if(x<0||x>LHOJA)return 0;
  var y=0,i;
  for(i=0;i<5;i++){var cx=CHX[i]-SHO,yc=STEP*bit[i],dx=Math.abs(x-cx);
    var yy=dx<=PW?yc:yc-(dx-PW);if(yy>y)y=yy;}
  if(x>LHOJA-22){var yt=(x-(LHOJA-22))*1.2;if(yt>y)y=yt;}
  return y;
}
function fondoPin(i,s,bit){         // y absoluta donde apoya el pin i con la llave corrida s px (null: sin llave)
  if(s===null)return KW1;
  var xl=CHX[i]-SHO+s;if(xl>LHOJA||xl<0)return KW1;
  return Math.min(KW1,KW0+topLocal(xl,bit||BIT));
}
function poligonoLlave(bit){        // coordenadas locales: hombro en (0,0), y hacia abajo
  var p=[],x;
  for(x=0;x<=LHOJA;x+=6)p.push([x,topLocal(x,bit)]);
  p.push([LHOJA,topLocal(LHOJA,bit)]);p.push([LHOJA,52]);p.push([LHOJA-12,66]);p.push([0,66]);
  p.push([-4,80]);p.push([-26,100]);p.push([-70,102]);p.push([-98,76]);p.push([-100,-8]);
  p.push([-76,-34]);p.push([-30,-36]);p.push([-6,-16]);p.push([0,0]);
  return p;
}
var LLAVE1=poligonoLlave(BIT),LLAVE2=poligonoLlave(BIT2);
function llave(ox,oy,ang,k,o){      // hombro en (ox,oy), rotada ang, escala k; o: frac, alpha, p, seed, pol
  o=o||{};var c=Math.cos(ang),s=Math.sin(ang),P=o.p||PLANO,sd=o.seed||120,pol=o.pol||LLAVE1;
  function T(q){return [ox+(q[0]*c-q[1]*s)*k,oy+(q[0]*s+q[1]*c)*k];}
  var pts=pol.map(T),f=o.frac===undefined?1:o.frac;
  if(f<=0)return;
  relleno(pts,{color:P.ambar,alpha:(o.alpha===undefined?0.92:o.alpha)*clamp(f*1.3-0.3,0,1),seed:sd+1,amp:0.9,step:10});
  trazo(pts,{color:P.tinta,w:o.w||1.8,close:true,seed:sd,amp:1,frac:f,alpha:o.alpha,step:10});
  var oj=T([-56,34]);
  circulo(oj[0],oj[1],12*k,{color:P.tinta,w:1.4,seed:sd+2,frac:clamp(f*1.5-0.5,0,1),alpha:o.alpha});
}
function cabezaFrontal(x,y,ang,k,o){   // la cabeza de la llave vista de frente (puesta en la cerradura), girada ang
  o=o||{};var P=o.p||PASILLO,c=Math.cos(ang),s=Math.sin(ang),pts=[],i,n=22;
  for(i=0;i<=n;i++){var a=i/n*6.2832,px=Math.cos(a)*20*k,py=Math.sin(a)*28*k;
    if(py<-14*k)px*=0.72;pts.push([x+px*c-py*s,y+px*s+py*c]);}
  relleno(pts,{color:P.ambar,alpha:0.95*(o.alpha===undefined?1:o.alpha),seed:131,amp:0.7,step:8});
  trazo(pts,{color:P.tinta,w:1.6,close:true,seed:130,amp:0.8,alpha:o.alpha,step:8});
  circulo(x-(-16*k)*s,y+(-16*k)*c,5*k,{color:P.tinta,w:1.3,seed:132,alpha:o.alpha});
}

/* ---------- papel alto: la segunda hoja del plano mide 1600×1800 y la cámara baja ---------- */
function makePaperAlto(p){
  var H2=H*2,c=document.createElement('canvas');c.width=W;c.height=H2;var x=c.getContext('2d');
  x.fillStyle=p.bg;x.fillRect(0,0,W,H2);
  var r=rng(p.seed+100),i,j;
  for(i=0;i<220;i++){var mx=r()*W,my=r()*H2,mr=50+r()*230,g=x.createRadialGradient(mx,my,0,mx,my,mr);
    g.addColorStop(0,al(r()<0.5?p.bg2:p.bg3,p.grid?0.22:0.5));g.addColorStop(1,al(p.bg2,0));x.fillStyle=g;x.fillRect(mx-mr,my-mr,mr*2,mr*2);}
  if(p.grid){x.strokeStyle=al(p.rejilla,0.3);x.lineWidth=1;
    for(i=0;i<=W;i+=44){x.beginPath();x.moveTo(i+0.5,0);x.lineTo(i+0.5,H2);x.stroke();}
    for(j=2;j<=H2;j+=44){x.beginPath();x.moveTo(0,j+0.5);x.lineTo(W,j+0.5);x.stroke();}
    x.strokeStyle=al(p.rejilla,0.4);
    for(i=0;i<=W;i+=220){x.beginPath();x.moveTo(i+0.5,0);x.lineTo(i+0.5,H2);x.stroke();}
    for(j=2;j<=H2;j+=220){x.beginPath();x.moveTo(0,j+0.5);x.lineTo(W,j+0.5);x.stroke();}}
  for(i=0;i<32000;i++){var gx=r()*W,gy=r()*H2,a=0.03+r()*0.1;x.fillStyle=al(r()<0.62?p.grano:p.bg3,a);x.fillRect(gx,gy,1+(r()<0.12?1:0),1);}
  for(i=0;i<440;i++){var fx=r()*W,fy=r()*H2,fa=r()*Math.PI,fl=6+r()*26;
    x.strokeStyle=al(r()<0.5?p.grano:p.bg3,0.07+r()*0.1);x.lineWidth=0.7+r()*0.6;x.beginPath();x.moveTo(fx,fy);
    x.quadraticCurveTo(fx+Math.cos(fa)*fl*0.5-3+r()*6,fy+Math.sin(fa)*fl*0.5-3+r()*6,fx+Math.cos(fa)*fl,fy+Math.sin(fa)*fl);x.stroke();}
  var v=x.createRadialGradient(W*0.5,H,H*0.5,W*0.5,H,H*1.55);
  v.addColorStop(0,al(p.bg3,0));v.addColorStop(1,al(p.bg3,p.grid?0.42:0.62));x.fillStyle=v;x.fillRect(0,0,W,H2);
  return c;
}
function laminaAlta(p){var k=p.id+'alto';if(!PAPERS[k])PAPERS[k]=makePaperAlto(p);return PAPERS[k];}
function hojaCam(p,k,cx,cy){  // la hoja normal vista por una cámara (k>1 acerca; cx,cy = centro)
  var im=lamina(p);ctx.save();ctx.translate(W/2,H/2);ctx.scale(k,k);ctx.translate(-cx,-cy);ctx.drawImage(im,0,0);ctx.restore();
}

/* ---------- trama con recorte nítido (la carcasa, el tambor, el anillo) ---------- */
function tramaClip(pathFn,o){
  o=o||{};var ang=o.ang===undefined?-0.7:o.ang,gap=o.gap||10;
  if((o.alpha===undefined?1:o.alpha)<=0)return;
  ctx.save();ctx.beginPath();pathFn(ctx);ctx.clip('evenodd');
  ctx.strokeStyle=o.color;ctx.lineWidth=o.w||1.1;ctx.lineCap='round';
  ctx.globalAlpha=o.alpha===undefined?0.45:o.alpha;
  var cx=o.cx,cy=o.cy,rad=o.rad,r=rng(boil(o.seed||5)),d,ox=Math.cos(ang),oy=Math.sin(ang);
  for(d=-rad;d<=rad;d+=gap){
    var ax=cx-oy*d-ox*rad,ay=cy+ox*d-oy*rad,bx=cx-oy*d+ox*rad,by=cy+ox*d+oy*rad;
    var p=jitter(resample([[ax,ay],[bx,by]],30),0.9,(r()*1e9)>>>0);
    pathOf(ctx,p,false);ctx.stroke();
  }
  ctx.restore();
}

/* ---------- piezas del corte ---------- */
function pin(x,y0,y1,w,tipo,seed,f,col,alpha){   // cápsula vertical; 'llave' con punta abajo
  if(f<=0||y1-y0<4)return;
  var h=w/2,p;
  if(tipo==='llave')p=[[x-h,y0+2],[x-h+3,y0],[x+h-3,y0],[x+h,y0+2],[x+h,y1-13],[x+5,y1],[x-5,y1],[x-h,y1-13]];
  else p=[[x-h,y0+3],[x-h+4,y0],[x+h-4,y0],[x+h,y0+3],[x+h,y1-3],[x+h-4,y1],[x-h+4,y1],[x-h,y1-3]];
  relleno(p,{color:col,alpha:0.85*(alpha===undefined?1:alpha)*clamp(f*2-1,0,1),seed:seed+1,amp:0.7,step:9});
  trazo(p,{color:PLANO.tinta,w:1.5,close:true,seed:seed,amp:0.8,frac:f,step:9,alpha:alpha});
}
function resorte(x,y0,y1,seed,f,alpha){
  if(f<=0||y1-y0<6)return;
  var n=7,p=[[x,y0]],i;for(i=1;i<n;i++)p.push([x+(i%2?12:-12),y0+(y1-y0)*i/n]);p.push([x,y1]);
  trazo(p,{color:PLANO.dim,w:1.6,amp:0.6,seed:seed,frac:f,step:7,alpha:alpha});
}
function cruzaOxido(x,y0,y1,f,seed,alpha){   // el tramo de pin que cruza la línea, pintado de óxido
  if(f<=0||Math.abs(y1-y0)<2)return;var hh=(CHW-8)/2,a=Math.min(y0,y1),b=Math.max(y0,y1);
  relleno([[x-hh,a],[x+hh,a],[x+hh,b],[x-hh,b]],{color:PLANO.oxido,alpha:0.78*f*(alpha===undefined?1:alpha),seed:seed,amp:0.5,step:8});
}
function clipCarcasa(c){var i;c.rect(HX0,HY0,HX1-HX0,YSH-HY0);
  for(i=0;i<5;i++)c.rect(CHX[i]-CHW/2,CHT,CHW,YSH-CHT);}
function clipTambor(c){var i;c.rect(HX0,YSH,HX1-HX0,PY1-YSH);c.rect(HX0,KW0,KWEND-HX0,KW1-KW0);
  for(i=0;i<5;i++)c.rect(CHX[i]-CHW/2,YSH,CHW,KW0-YSH);
  c.rect(LEVA.x0,LEVA.y0,LEVA.x1-LEVA.x0,LEVA.y1-LEVA.y0);}
/* s: llave corrida (null = sin llave); g: fracciones {cuerpo,camaras,pines,linea}; o: {alpha, bit, pol, lineaAmbar, cruz} */
function corte(s,g,o){
  o=o||{};var i,A=o.alpha===undefined?1:o.alpha,P=PLANO,bit=o.bit||BIT;
  tramaClip(clipCarcasa,{color:P.dim,gap:11,ang:-0.7,cx:(HX0+HX1)/2,cy:(HY0+YSH)/2,rad:410,seed:51,alpha:0.42*A*clamp(g.cuerpo*1.6-0.6,0,1)});
  tramaClip(clipTambor,{color:P.cons,gap:9,ang:0.6,cx:(HX0+HX1)/2,cy:(YSH+PY1)/2,rad:410,seed:52,alpha:0.28*A*clamp(g.cuerpo*1.6-0.7,0,1)});
  var w2=1.9;
  trazo([[HX0,YSH],[HX0,HY0],[HX1,HY0],[HX1,YSH]],{color:P.tinta,w:w2,seed:53,frac:g.cuerpo,alpha:A});
  trazo([[HX0,YSH],[HX0,PY1],[HX1,PY1],[HX1,YSH]],{color:P.tinta,w:w2,seed:54,frac:g.cuerpo,alpha:A});
  trazo([[LEVA.x0,LEVA.y0],[LEVA.x1,LEVA.y0],[LEVA.x1,LEVA.y1],[LEVA.x0,LEVA.y1]],{color:P.tinta,w:1.6,seed:55,frac:clamp(g.cuerpo*1.5-0.5,0,1),alpha:A});
  trazo([[HX0,KW1],[KWEND,KW1],[KWEND,KW0]],{color:P.tinta,w:1.5,seed:56,frac:g.camaras,alpha:A});
  var xs=HX0;
  for(i=0;i<5;i++){trazo([[xs,KW0],[CHX[i]-CHW/2,KW0]],{color:P.tinta,w:1.5,seed:57+i,frac:g.camaras,alpha:A});xs=CHX[i]+CHW/2;}
  trazo([[xs,KW0],[KWEND,KW0]],{color:P.tinta,w:1.5,seed:63,frac:g.camaras,alpha:A});
  for(i=0;i<5;i++)trazo([[CHX[i]-CHW/2,KW0],[CHX[i]-CHW/2,CHT],[CHX[i]+CHW/2,CHT],[CHX[i]+CHW/2,KW0]],
    {color:P.tinta,w:1.5,seed:70+i,frac:clamp(g.camaras*1.4-i*0.08,0,1),alpha:A});
  if(s!==null)llave(SHO-s,KW0,0,1,{frac:1,alpha:A,seed:120,pol:o.pol||LLAVE1});
  for(i=0;i<5;i++){
    var fb=fondoPin(i,s,bit),ft=fb-LK[i],fp=clamp(g.pines*1.5-i*0.1,0,1);
    pin(CHX[i],ft,fb,CHW-8,'llave',80+i*3,fp,P.ambar,A);
    pin(CHX[i],ft-LD,ft,CHW-8,'contra',81+i*3,fp,P.cons,A);
    resorte(CHX[i],CHT,ft-LD,82+i*3,fp,A);
    if(o.cruz){var cf=clamp(o.cruz*1.6-i*0.15,0,1);
      if(ft>YSH+1)cruzaOxido(CHX[i],YSH,ft,cf,90+i,A);        // el contrapín cruza hacia abajo
      else if(ft<YSH-1)cruzaOxido(CHX[i],ft,YSH,cf,90+i,A);   // el pin de llave cruza hacia arriba
    }
  }
  trazo([[HX0-6,YSH],[HX1+6,YSH]],{color:P.cons,w:1.7,dash:[14,9],seed:100,frac:g.linea,alpha:A,amp:0.8,step:12});
  if(o.lineaAmbar>0){
    trazo([[HX0-6,YSH],[HX1+6,YSH]],{color:P.ambar,w:7,seed:101,alpha:0.28*o.lineaAmbar*A,amp:0.6,step:12});
    trazo([[HX0-6,YSH],[HX1+6,YSH]],{color:P.ambar,w:2.2,seed:102,alpha:0.95*o.lineaAmbar*A,amp:0.6,step:12});
  }
}
/* marca del plano de corte A-A: sólo los extremos, como en los planos */
function marcaAA(f,alpha){
  if(f<=0)return;var x=CHX[0],P=PLANO;
  trazo([[x,HY0-34],[x,HY0-6]],{color:P.tinta,w:2.2,seed:110,frac:f,alpha:alpha});
  trazo([[x,PY1+6],[x,PY1+34]],{color:P.tinta,w:2.2,seed:111,frac:f,alpha:alpha});
  trazo([[x-14,HY0-20],[x,HY0-34],[x+14,HY0-20]],{color:P.tinta,w:1.6,seed:112,frac:f,alpha:alpha});
  trazo([[x-14,PY1+20],[x,PY1+34],[x+14,PY1+20]],{color:P.tinta,w:1.6,seed:113,frac:f,alpha:alpha});
  texto('A',x+22,HY0-18,22,{color:P.tinta,seed:114,frac:clamp(f*2-1,0,1),alpha:alpha});
  texto('A',x+22,PY1+36,22,{color:P.tinta,seed:115,frac:clamp(f*2-1,0,1),alpha:alpha});
}
/* vista A-A (de frente, cortada por la primera cámara), misma escala que el corte: la carcasa es un círculo con una torre.
   th = giro del tambor; s = llave; g = {anillo,tambor,piezas}; o = {alpha, bit, lineaAmbar, choque} */
var CARCASA_FRONTAL=(function(){
  var cx=EVX,cy=EVY,yt=EVY+(HY0-PC),t0=Math.acos(EVTW/EVR),pts=[[cx-EVTW,yt]],n=40,i;
  for(i=0;i<=n;i++){var a=(Math.PI+t0)-(Math.PI+2*t0)*i/n;pts.push([cx+Math.cos(a)*EVR,cy+Math.sin(a)*EVR]);}
  pts.push([cx+EVTW,yt]);return pts;
})();
function vistaFrontal(th,s,g,o){
  o=o||{};var cx=EVX,cy=EVY,P=PLANO,A=o.alpha===undefined?1:o.alpha,hw=CHW/2,bit=o.bit||BIT;
  function Y(y){return cy+(y-PC);}
  if(g.anillo<=0)return;
  tramaClip(function(c){var q=CARCASA_FRONTAL;c.moveTo(q[0][0],q[0][1]);for(var k=1;k<q.length;k++)c.lineTo(q[k][0],q[k][1]);c.closePath();
    c.moveTo(cx+EVRP,cy);c.arc(cx,cy,EVRP,0,6.2832);c.rect(cx-hw,Y(CHT),2*hw,Y(YSH)-Y(CHT));},
    {color:P.dim,gap:11,ang:-0.7,cx:cx,cy:cy,rad:250,seed:140,alpha:0.42*A*clamp(g.anillo*1.6-0.6,0,1)});
  trazo(CARCASA_FRONTAL,{color:P.tinta,w:2,seed:141,frac:g.anillo,alpha:A,amp:1.1,close:true,step:14});
  var fb=fondoPin(0,s,bit),ft=fb-LK[0];
  ctx.save();ctx.translate(cx,cy);ctx.rotate(th);ctx.translate(-cx,-cy);
  tramaClip(function(c){c.arc(cx,cy,EVRP,0,6.2832);c.rect(cx-hw,Y(YSH),2*hw,Y(KW0)-Y(YSH));
    c.rect(cx-15,Y(KW0),30,Y(KW1)-Y(KW0));},
    {color:P.cons,gap:9,ang:0.6,cx:cx,cy:cy,rad:EVRP+8,seed:142,alpha:0.28*A*clamp(g.tambor*1.6-0.7,0,1)});
  circulo(cx,cy,EVRP,{color:P.tinta,w:1.8,seed:143,frac:g.tambor,alpha:A,amp:1});
  trazo([[cx-hw,Y(YSH)],[cx-hw,Y(KW0)],[cx-15,Y(KW0)],[cx-15,Y(KW1)],[cx+15,Y(KW1)],[cx+15,Y(KW0)],[cx+hw,Y(KW0)],[cx+hw,Y(YSH)]],
    {color:P.tinta,w:1.5,seed:144,frac:g.piezas,alpha:A,step:8});
  if(s!==null&&fb<KW1){   // sección de la hoja: del diente al fondo del canal, con su ondulación
    var y0=Y(fb),y1=Y(KW1),q=[[cx-12,y0],[cx+12,y0],[cx+12,y0+(y1-y0)*0.35],[cx+7,y0+(y1-y0)*0.5],[cx+12,y0+(y1-y0)*0.65],[cx+12,y1],[cx-12,y1],[cx-12,y0+(y1-y0)*0.7],[cx-6,y0+(y1-y0)*0.55],[cx-12,y0+(y1-y0)*0.3]];
    relleno(q,{color:P.ambar,alpha:0.9*A,seed:146,amp:0.6,step:8});
    trazo(q,{color:P.tinta,w:1.4,close:true,seed:145,amp:0.7,step:8,alpha:A});
  }
  pin(cx,Y(ft),Y(fb),CHW-8,'llave',147,g.piezas,P.ambar,A);
  if(o.cruz&&ft<YSH-1)cruzaOxido(cx,Y(ft),Y(YSH),o.cruz,96,A);
  ctx.restore();
  trazo([[cx-hw,Y(YSH)],[cx-hw,Y(CHT)],[cx+hw,Y(CHT)],[cx+hw,Y(YSH)]],{color:P.tinta,w:1.5,seed:148,frac:g.piezas,alpha:A,step:8});
  var dt=ft;if(th>0.001&&Math.abs(ft-YSH)<0.5)dt=YSH;   // con la llave justa, al girar el contrapín apoya sobre el tambor
  pin(cx,Y(dt-LD),Y(dt),CHW-8,'contra',149,g.piezas,P.cons,A);
  if(o.cruz&&dt>YSH+1)cruzaOxido(cx,Y(YSH),Y(dt),o.cruz,97,A);
  resorte(cx,Y(CHT),Y(dt-LD),150,g.piezas,A);
  circulo(cx,cy,EVRP,{color:P.cons,w:1.6,dash:[12,8],seed:151,frac:g.tambor,alpha:A,amp:0.6});
  if(o.lineaAmbar>0){circulo(cx,cy,EVRP,{color:P.ambar,w:6,seed:152,alpha:0.25*o.lineaAmbar*A,amp:0.5});
    circulo(cx,cy,EVRP,{color:P.ambar,w:2,seed:153,alpha:0.9*o.lineaAmbar*A,amp:0.5});}
  if(o.choque>0){   // el punto donde el tambor choca contra lo que cruza la línea
    var px=cx+hw+2,py=Y(YSH),k;
    for(k=0;k<5;k++){var a=-0.9+k*0.45,L=14+(k%2)*8;
      trazo([[px+Math.cos(a)*6,py+Math.sin(a)*6],[px+Math.cos(a)*L,py+Math.sin(a)*L]],{color:P.oxido,w:2.2,seed:160+k,alpha:o.choque*A,amp:0.6,step:6});}
  }
}
/* flecha de giro alrededor de un centro, de a0 a a1 (radianes), con punta */
function flechaArco(cx,cy,r,a0,a1,o){
  var pts=[],n=24,i;for(i=0;i<=n;i++){var a=a0+(a1-a0)*i/n;pts.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);}
  trazo(pts,o);
  var f=o.frac===undefined?1:o.frac;if(f<0.95)return;
  var a=a1,dir=a1>a0?1:-1,tx=cx+Math.cos(a)*r,ty=cy+Math.sin(a)*r,ux=-Math.sin(a)*dir,uy=Math.cos(a)*dir;
  trazo([[tx-ux*14+Math.cos(a)*9,ty-uy*14+Math.sin(a)*9],[tx,ty],[tx-ux*14-Math.cos(a)*9,ty-uy*14-Math.sin(a)*9]],{color:o.color,w:o.w,seed:(o.seed||1)+5,alpha:o.alpha});
}
/* intento de giro en la vista A-A: flecha, tambor que se mueve unos grados y vuelve, choque y cruz */
function intentoGiro(t,t0){
  var P=PLANO,fa=clamp((t-t0)/0.5,0,1),fx=clamp((t-t0-1.1)/0.4,0,1);
  flechaArco(EVX,EVY,EVR+16,-0.95,-0.15,{color:P.oxido,w:2.4,seed:290,frac:fa});
  if(fx>0){var cx=EVX+150,cy=EVY-40;
    trazo([[cx-22,cy-22],[cx+22,cy+22]],{color:P.oxido,w:3.2,seed:291,frac:clamp(fx*2,0,1)});
    trazo([[cx+22,cy-22],[cx-22,cy+22]],{color:P.oxido,w:3.2,seed:292,frac:clamp(fx*2-1,0,1)});}
}
function bamboleo(t,t0){var u=clamp((t-t0)/0.7,0,1);return 0.07*Math.sin(Math.PI*u);}   // el tambor se mueve 4° y vuelve

/* ---------- el pasillo (mundo A) ---------- */
var DX0=560,DX1=1040,DY0=56,DY1=900,DW=DX1-DX0,DH=DY1-DY0;
var KNOB={u:430,v:414,r:26},CIL={u:430,v:484,r:22};
/* th = apertura (hacia adentro, bisagra a la izquierda); tk = giro de la llave puesta (null: sin llave); g = fracción de dibujo */
function pasillo(th,tk,g){
  var P=PASILLO,c=Math.cos(th),sn=Math.sin(th),D=1400,i,j;
  function dp(u,v){var s=1/(1+u*sn/D);return [DX0+u*c,470+(v+DY0-470)*s];}
  function ds(u){return 1/(1+u*sn/D);}
  paper(P);
  var gr=ctx.createRadialGradient(300,126,10,300,126,760);gr.addColorStop(0,al(P.ambar,0.16));gr.addColorStop(0.45,al(P.ambar,0.05));gr.addColorStop(1,al(P.ambar,0));
  ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);
  trazo([[300,0],[300,88]],{color:P.dim,w:1.6,seed:201,frac:g});
  relleno([[268,88],[332,88],[320,116],[280,116]],{color:P.bg3,alpha:0.9,seed:202,amp:0.8});
  trazo([[268,88],[332,88],[320,116],[280,116]],{color:P.dim,w:1.6,close:true,seed:203,frac:g});
  if(g>0.5)luz(300,126,9,P.ambar,204,1);
  trazo([[0,870],[516,870]],{color:P.dim,w:1.4,seed:205,alpha:0.6,frac:g});
  trazo([[1084,870],[W,870]],{color:P.dim,w:1.4,seed:206,alpha:0.6,frac:g});
  trazo([[520,900],[520,24],[1080,24],[1080,900]],{color:P.tinta,w:2.4,seed:207,frac:g,pasadas:2});
  trazo([[548,900],[548,52],[1052,52],[1052,900]],{color:P.dim,w:1.5,seed:208,frac:g});
  if(th>0.002){   // la luz de adentro, entre el canto de la hoja y la jamba
    var tr=dp(DW,0),br=dp(DW,DH);
    relleno([[tr[0],tr[1]],[1052,52],[1052,900],[br[0],br[1]]],{color:P.ambar,alpha:0.32,seed:209,amp:0.4,step:30});
    relleno([[tr[0],tr[1]],[1052,52],[1052,900],[br[0],br[1]]],{color:P.tinta,alpha:0.14,seed:210,amp:0.4,step:30});
    trazo([[tr[0]+3,tr[1]],[br[0]+3,br[1]]],{color:P.ambar,w:3,seed:211,alpha:0.6});
  }
  var q=[dp(0,0),dp(DW,0),dp(DW,DH),dp(0,DH)];
  relleno(q,{color:P.bg2,alpha:clamp(g*1.5,0,1),seed:212,amp:0.5,step:40});
  trazo(q,{color:P.tinta,w:2.2,close:true,seed:213,frac:g,pasadas:2});
  var pan=[[40,54,350,334],[40,414,350,784]];
  for(i=0;i<2;i++){var a=pan[i],pp=[dp(a[0],a[1]),dp(a[2],a[1]),dp(a[2],a[3]),dp(a[0],a[3])];
    trazo(pp,{color:P.dim,w:1.5,close:true,seed:214+i,frac:clamp(g*1.4-0.2,0,1)});
    var b=[a[0]+16,a[1]+16,a[2]-16,a[3]-16],pq=[dp(b[0],b[1]),dp(b[2],b[1]),dp(b[2],b[3]),dp(b[0],b[3])];
    trazo(pq,{color:P.dim,w:1.1,close:true,seed:216+i,alpha:0.7,frac:clamp(g*1.4-0.4,0,1)});
    for(j=0;j<4;j++)trazo([pp[j],pq[j]],{color:P.dim,w:1,seed:218+i*4+j,alpha:0.6,frac:clamp(g*1.4-0.4,0,1)});
  }
  var kp=dp(KNOB.u,KNOB.v),ks=ds(KNOB.u),cp=dp(CIL.u,CIL.v),cs=ds(CIL.u),ros=[],kn=[],ci=[];
  for(i=0;i<=20;i++){var a1=i/20*6.2832;
    ros.push([kp[0]+Math.cos(a1)*KNOB.r*1.35*ks,kp[1]+Math.sin(a1)*KNOB.r*1.35*ks]);
    kn.push([kp[0]+Math.cos(a1)*KNOB.r*ks,kp[1]+Math.sin(a1)*KNOB.r*ks]);
    ci.push([cp[0]+Math.cos(a1)*CIL.r*cs,cp[1]+Math.sin(a1)*CIL.r*cs]);}
  trazo(ros,{color:P.dim,w:1.2,seed:230,alpha:0.7,frac:clamp(g*1.6-0.6,0,1)});
  relleno(kn,{color:P.ambar,alpha:0.85,seed:231,amp:0.6,step:8});
  trazo(kn,{color:P.tinta,w:1.6,seed:232,frac:clamp(g*1.6-0.6,0,1),amp:0.8,step:8});
  if(g>0.7)luz(kp[0]-KNOB.r*0.35*ks,kp[1]-KNOB.r*0.4*ks,3,P.tinta,233,0);
  relleno(ci,{color:P.ambar,alpha:0.75,seed:234,amp:0.6,step:8});
  trazo(ci,{color:P.tinta,w:1.6,seed:235,frac:clamp(g*1.6-0.6,0,1),amp:0.8,step:8});
  if(tk===null)trazo([[cp[0],cp[1]-13*cs],[cp[0],cp[1]+13*cs]],{color:P.bg3,w:5,seed:236,frac:clamp(g*1.6-0.7,0,1)});
  else cabezaFrontal(cp[0],cp[1]+2*cs,tk,cs,{p:P});
  return {cp:cp,cs:cs,kp:kp};
}
function firma(t0,t){
  var f=clamp((t-t0)/1.1,0,1),P=PASILLO;
  if(f<=0)return;
  llave(1332,842,-0.18,0.34,{p:P,frac:f,seed:300,w:1.4});
  texto('CLAUDE · 2026',1372,852,22,{color:P.dim,seed:301,frac:clamp((f-0.35)/0.65,0,1)});
}
/* los rótulos de la primera hoja (II), que después quedan apagados al 40 % */
function rotulosII(t,alpha){
  var P=PLANO,A=alpha;function fe(a){return t===null?1:clamp((t-a)/0.95,0,1);}
  rotulo(240,320,30,-200,'CARCASA: FIJA',28,{color:P.tinta,seed:270,frac:fe(2.3),alpha:A});
  rotulo(660,395,-30,-215,'CONTRAPINES',28,{color:P.tinta,seed:271,frac:fe(2.55),alpha:A});
  rotulo(770,310,40,-190,'RESORTES',28,{color:P.tinta,seed:272,frac:fe(2.8),alpha:A});
  rotulo(931,400,40,-200,'LÍNEA DE CORTE',28,{color:P.ambar,seed:273,frac:fe(3.05),alpha:A});
  rotulo(240,548,0,100,'TAMBOR: GIRA',28,{color:P.tinta,seed:274,frac:fe(3.3),alpha:A});
  rotulo(550,520,20,140,'PINES',28,{color:P.tinta,seed:275,frac:fe(3.55),alpha:A});
  texto('A-A · DE FRENTE',EVX,612,24,{color:P.tinta,align:'c',seed:260,frac:t===null?1:clamp((t-2.9)/0.8,0,1),alpha:A});
  texto('CILINDRO YALE · PAT. 1865',1570,110,20,{color:P.dim,align:'r',seed:280,frac:t===null?1:clamp((t-3.9)/0.9,0,1),alpha:A});
  texto('CORTADO AL MEDIO, DE COSTADO',1570,140,20,{color:P.dim,align:'r',seed:281,frac:t===null?1:clamp((t-4.2)/1.2,0,1),alpha:A});
}
function textosIII(t,alpha){
  var P=PLANO;function fe(a,n){return t===null?1:clamp((t-a)/ESCR(n),0,1);}
  texto('SIN LLAVE, LOS CONTRAPINES',1010,760,26,{color:P.tinta,seed:293,frac:fe(0.5,26),alpha:alpha});
  texto('CRUZAN LA LÍNEA.',1010,805,26,{color:P.oxido,seed:294,frac:fe(1.8,16),alpha:alpha});
  texto('EL TAMBOR NO GIRA.',1010,850,26,{color:P.tinta,seed:295,frac:fe(2.6,18),alpha:alpha});
}
function textosIV(t,alpha){
  var P=PLANO;function fe(a,n){return t===null?1:clamp((t-a)/ESCR(n),0,1);}
  texto('CADA DIENTE DEJA SU PIN',170,790,36,{color:P.tinta,seed:320,frac:fe(2.6,23),alpha:alpha});
  texto('JUSTO EN LA LÍNEA. NADA LA CRUZA.',170,846,36,{color:P.ambar,seed:321,frac:fe(3.7,33),alpha:alpha});
}
var G1={cuerpo:1,camaras:1,pines:1,linea:1},GF1={anillo:1,tambor:1,piezas:1};
function entra(t,t0,dur){return S0*(1-ease((t-t0)/dur));}

/* ===================== ESCENAS ===================== */
/* I — La puerta */
function escPuerta(t){
  var P=PASILLO,g=clamp(t/0.9,0,1),fin=clamp((t-2.9)/0.8,0,1);
  var r=pasillo(0,fin>=0.85?0:null,g);
  if(t>=0.5&&fin<0.85){
    var m=easeOut(clamp((t-0.5)/2.4,0,1)),x=lerp(1540,r.cp[0]+96,m),y=lerp(860,r.cp[1],m),ang=lerp(-0.55,0,m);
    ctx.save();ctx.beginPath();ctx.rect(r.cp[0],0,W,H);ctx.clip();   // lo que entra en el cilindro se recorta
    llave(x-fin*100,y,Math.PI+ang,0.72,{p:P,seed:240,w:1.6});
    ctx.restore();
  }
  texto('CÓMO ABRE',70,330,64,{color:P.tinta,seed:250,frac:clamp((t-0.9)/ESCR(9),0,1),pasadas:2});
  texto('UNA LLAVE',70,414,64,{color:P.ambar,seed:251,frac:clamp((t-1.5)/ESCR(9),0,1),pasadas:2});
}
/* II — Por dentro */
function escDentro(t){
  var P=PLANO;paper(P);
  corte(null,{cuerpo:clamp(t/1.0,0,1),camaras:clamp((t-0.6)/0.9,0,1),pines:clamp((t-1.2)/1.0,0,1),linea:clamp((t-1.8)/0.6,0,1)},{});
  marcaAA(clamp((t-2.2)/0.6,0,1),1);
  vistaFrontal(0,null,{anillo:clamp((t-1.6)/0.8,0,1),tambor:clamp((t-2.0)/0.8,0,1),piezas:clamp((t-2.4)/0.8,0,1)},{});
  rotulosII(t,1);
}
/* III — Trabado */
function escTrabado(t){
  var P=PLANO;paper(P);
  corte(null,G1,{cruz:clamp((t-0.3)/1.0,0,1)});
  marcaAA(1,0.4);
  var th=bamboleo(t,1.6);
  vistaFrontal(th,null,GF1,{cruz:clamp((t-0.3)/1.0,0,1),choque:th/0.07});
  rotulosII(null,0.4);
  intentoGiro(t,1.2);
  textosIII(t,1);
}
/* IV — La llave justa */
function escJusta(t){
  var P=PLANO;paper(P);
  var s=entra(t,0.3,1.8),la=clamp((t-2.3)/0.5,0,1),i;
  corte(s,G1,{lineaAmbar:la});
  marcaAA(1,0.4);
  vistaFrontal(0,s,GF1,{lineaAmbar:la});
  rotulosII(null,0.4);
  textosIII(null,0.3);
  for(i=0;i<5;i++)marca([CHX[i],YSH],15,P.ambar,310+i,clamp((t-2.4-i*0.12)/0.6,0,1));
  textosIV(t,1);
}
/* V — Gira (zoom a la vista A-A) */
function escGira(t){
  var P=PLANO,u=ease(t/0.9),k=lerp(1,1.95,u),cx=lerp(800,EVX,u),cy=lerp(450,EVY-10,u);
  var th=1.5708*ease((t-1.1)/1.3);
  hojaCam(P,k,cx,cy);
  ctx.save();ctx.translate(W/2,H/2);ctx.scale(k,k);ctx.translate(-cx,-cy);
  corte(0,G1,{lineaAmbar:1});
  marcaAA(1,0.4);
  rotulosII(null,0.4);
  textosIII(null,0.3);
  textosIV(null,0.4);
  vistaFrontal(th,0,GF1,{lineaAmbar:1});
  var fa=clamp((t-1.0)/0.8,0,1);
  flechaArco(EVX,EVY,EVRP+40,-1.0,-1.0+1.5*fa,{color:P.ambar,w:2.2,seed:330,frac:fa>0?1:0,alpha:fa});
  texto('90°',EVX+128,EVY-62,18,{color:P.ambar,seed:331,frac:clamp((t-2.3)/0.6,0,1)});
  ctx.restore();
  texto('EL TAMBOR GIRA.',800,800,36,{color:P.tinta,align:'c',seed:340,frac:clamp((t-1.3)/ESCR(15),0,1)});
  texto('LOS CONTRAPINES QUEDAN ARRIBA.',800,854,32,{color:P.ambar,align:'c',seed:341,frac:clamp((t-2.3)/ESCR(30),0,1)});
}
/* VI — Se abre */
function escAbre(t){
  var P=PASILLO,tk=1.5708*ease((t-0.3)/0.8),th=0.49*ease((t-1.3)/1.9);
  pasillo(th,tk,1);
  texto('GIRA.',1120,330,44,{color:P.ambar,seed:350,frac:clamp((t-0.4)/ESCR(5),0,1),pasadas:2});
  texto('EL PESTILLO ENTRA.',1120,392,30,{color:P.tinta,seed:351,frac:clamp((t-1.0)/ESCR(18),0,1)});
}
/* VII — La otra llave (hoja nueva, la alta) */
function dibujoVII(t,A){   // t: tiempo local de VII (null = estado final); A: alpha
  var P=PLANO,tt=t===null?99:t;
  function c(a,d){return clamp((tt-a)/d,0,1);}
  var s=t===null?0:(tt<1.2?S0:entra(tt,1.2,1.6)),cz=c(2.9,0.6),th=t===null?0:bamboleo(tt,3.4);
  corte(s,{cuerpo:c(0.2,0.7),camaras:c(0.5,0.6),pines:c(0.8,0.6),linea:c(1.0,0.4)},{alpha:A,bit:BIT2,pol:LLAVE2,cruz:cz});
  vistaFrontal(th,s,{anillo:c(0.9,0.5),tambor:c(1.1,0.5),piezas:c(1.3,0.5)},{alpha:A,bit:BIT2,cruz:cz,choque:th/0.07});
  if(t!==null)intentoGiro(tt,3.0);else{
    flechaArco(EVX,EVY,EVR+16,-0.95,-0.15,{color:P.oxido,w:2.4,seed:290,alpha:A});
    var cx=EVX+150,cy=EVY-40;
    trazo([[cx-22,cy-22],[cx+22,cy+22]],{color:P.oxido,w:3.2,seed:291,alpha:A});
    trazo([[cx+22,cy-22],[cx-22,cy+22]],{color:P.oxido,w:3.2,seed:292,alpha:A});}
  texto('OTRA LLAVE: 1·5·1·6·2',170,790,36,{color:P.tinta,seed:360,frac:c(0.5,ESCR(21)),alpha:A,pasadas:2});
  texto('UNO ARRIBA, OTRO ABAJO. NO GIRA.',170,846,36,{color:P.oxido,seed:361,frac:c(3.0,ESCR(32)),alpha:A});
}
function escOtra(t){
  ctx.drawImage(laminaAlta(PLANO),0,0);
  dibujoVII(t,1);
}
/* VIII — Las cuentas (la misma hoja, 900 px más abajo) */
function escCuentas(t){
  var P=PLANO,dy=900*ease(t/0.9),OY=900,i,j;
  ctx.drawImage(laminaAlta(P),0,-dy);
  ctx.save();ctx.translate(0,-dy);
  if(dy<900)dibujoVII(null,0.4);
  var X0=330,X1=1270,Y0=150+OY,ST=14,CX=[450,630,810,990,1170];
  var fl=clamp((t-0.8)/1.0,0,1),pts=[],x;
  function top(xx){var y=0;for(var k=0;k<5;k++){var dx=Math.abs(xx-CX[k]),yc=ST*BIT[k],yy=dx<=28?yc:yc-(dx-28);if(yy>y)y=yy;}
    if(xx>X1-30){var yt=(xx-(X1-30))*1.1;if(yt>y)y=yt;}return y;}
  for(x=X0;x<=X1;x+=8)pts.push([x,Y0+top(x)]);
  pts.push([X1,Y0+top(X1)]);pts.push([X1,Y0+82]);pts.push([X1-16,Y0+100]);pts.push([X0,Y0+100]);
  pts.push([X0-6,Y0+118]);pts.push([X0-40,Y0+148]);pts.push([X0-104,Y0+150]);pts.push([X0-146,Y0+112]);pts.push([X0-148,Y0-12]);
  pts.push([X0-112,Y0-50]);pts.push([X0-44,Y0-52]);pts.push([X0-8,Y0-22]);pts.push([X0,Y0]);
  relleno(pts,{color:P.ambar,alpha:0.9*clamp(fl*1.3-0.3,0,1),seed:360,amp:0.9,step:12});
  trazo(pts,{color:P.tinta,w:2,close:true,seed:361,frac:fl,step:12});
  circulo(X0-84,Y0+50,18,{color:P.tinta,w:1.6,seed:362,frac:clamp(fl*1.5-0.5,0,1)});
  for(i=0;i<5;i++)texto(String(BIT[i]),CX[i],Y0+172,44,{color:P.ambar,align:'c',seed:370+i,frac:clamp((t-1.2-i*0.25)/0.5,0,1)});
  texto('CÓDIGO',CX[0]-80,Y0+174,22,{color:P.dim,align:'r',seed:369,frac:clamp((t-1.1)/0.6,0,1)});
  var GY=360+OY,GS=46,fg=clamp((t-1.4)/1.0,0,1);
  for(j=0;j<6;j++){var y=GY+j*GS;
    trazo([[CX[0]-60,y],[CX[4]+60,y]],{color:P.dim,w:1.1,seed:380+j,alpha:0.7,frac:clamp(fg*1.5-j*0.1,0,1),step:30});
    texto(String(j+1),CX[0]-80,y+8,22,{color:P.dim,align:'r',seed:390+j,frac:clamp(fg*1.5-j*0.1,0,1)});}
  texto('ALTURA',CX[0]-150,GY+2.5*GS,20,{color:P.dim,align:'c',rot:-1.5708,seed:399,frac:clamp((t-1.3)/0.6,0,1)});
  for(i=0;i<5;i++)trazo([[CX[i],GY-10],[CX[i],GY+5*GS+10]],{color:P.dim,w:1.1,seed:400+i,alpha:0.5,frac:clamp(fg*1.5-i*0.1,0,1),step:30});
  for(i=0;i<5;i++){var fm=clamp((t-2.3-i*0.15)/0.4,0,1);if(fm>0){var y2=GY+(BIT[i]-1)*GS;
    ctx.save();ctx.globalAlpha=fm;ctx.fillStyle=P.ambar;ctx.beginPath();ctx.arc(CX[i],y2,9,0,6.2832);ctx.fill();ctx.restore();
    circulo(CX[i],y2,14,{color:P.tinta,w:1.4,seed:410+i,frac:fm});}}
  texto('ESTA LLAVE: 6 ALTURAS POR PIN',800,660+OY,36,{color:P.tinta,align:'c',seed:420,frac:clamp((t-2.4)/ESCR(29),0,1)});
  texto('6×6×6×6×6 = 7776 LLAVES',800,722+OY,40,{color:P.tinta,align:'c',seed:421,frac:clamp((t-3.6)/ESCR(23),0,1),pasadas:2});
  texto('UNA SOLA ALINEA LOS CINCO',800,786+OY,36,{color:P.ambar,align:'c',seed:422,frac:clamp((t-4.6)/ESCR(25),0,1),pasadas:2});
  texto('(EN TEORÍA)',800,844+OY,22,{color:P.dim,align:'c',seed:423,frac:clamp((t-5.2)/ESCR(11),0,1)});
  ctx.restore();
}
/* IX — Cierre */
function escCierre(t){
  var P=PASILLO;
  pasillo(0.49,1.5708,1);
  texto('LA LLAVE',60,330,46,{color:P.tinta,seed:430,frac:clamp((t-0.4)/ESCR(8),0,1),pasadas:2});
  texto('NO FUERZA NADA.',60,400,44,{color:P.tinta,seed:431,frac:clamp((t-1.0)/ESCR(15),0,1),pasadas:2});
  texto('ALINEA,',60,470,46,{color:P.ambar,seed:432,frac:clamp((t-1.8)/ESCR(7),0,1),pasadas:2});
  texto('Y GIRA.',1120,440,64,{color:P.ambar,seed:433,frac:clamp((t-2.5)/ESCR(7),0,1),pasadas:2});
  firma(3.4,t);
}

/* ===================== LÍNEA DE TIEMPO ===================== */
var TL=[
 {n:'I',   nom:'La puerta',      txt:'Una puerta de noche. Entra la llave.',                         d:4.2, f:escPuerta,  p:PASILLO},
 {n:'II',  nom:'Por dentro',     txt:'El cilindro cortado al medio: cinco pines partidos en dos.',    d:5.6, f:escDentro,  p:PLANO, tr:'sube'},
 {n:'III', nom:'Trabado',        txt:'Sin llave, los contrapines cruzan la línea de corte.',          d:4.4, f:escTrabado, p:PLANO},
 {n:'IV',  nom:'La llave justa', txt:'Cada diente deja su pin justo en la línea. Nada la cruza.',    d:5.8, f:escJusta,   p:PLANO},
 {n:'V',   nom:'Gira',           txt:'El tambor gira; los contrapines quedan arriba.',                d:4.6, f:escGira,    p:PLANO},
 {n:'VI',  nom:'Se abre',        txt:'La llave gira, el pestillo entra, la puerta cede.',             d:4.0, f:escAbre,    p:PASILLO, tr:'saca'},
 {n:'VII', nom:'La otra llave',  txt:'Otra llave entra, pero un pin cruza arriba y otro abajo.',      d:5.2, f:escOtra,    p:PLANO, tr:'sube'},
 {n:'VIII',nom:'Las cuentas',    txt:'Seis alturas, cinco pines: 7776 llaves. Una sola alinea.',     d:6.4, f:escCuentas, p:PLANO},
 {n:'IX',  nom:'Cierre',         txt:'La llave no fuerza nada: alinea, y gira.',                     d:5.6, f:escCierre,  p:PASILLO, tr:'saca'}
];

/* ===================== PARTITURA =====================
   Un sonido por idea: golpe sordo = trabado; clic brillante = gira; campana larga = alineado;
   las notas cortas son las alturas (las seis) y el código de cada llave. */
(function(){
  var T=[0],i;for(i=0;i<TL.length;i++)T.push(T[i]+TL[i].d);
  var A=function(k,t){return T[k]+t;};
  function golpe(t){ev(t,'tic',120,0.12,0.6);ev(t,'bajo',50,0.35,0.16);}
  function clic(t){ev(t,'tic',2000,0.03,0.55);ev(t+0.01,'tic',900,0.05,0.3);}
  function nota(t,n,v){ev(t,'campana',NOTAS[n-1],0.7,v||0.2);}
  function tiempoPin(i,t0,dur){   // cuándo la punta de la llave llega a la cámara i (fracción del gesto, por bisección)
    var si=TIP+22-CHX[i],lo=0,hi=1,m,f=0;for(m=0;m<40;m++){f=(lo+hi)/2;if(S0*(1-ease(f))<si)hi=f;else lo=f;}
    return t0+dur*f;
  }
  // I — la puerta
  ev(A(0,0.0),'aire',0,1.6,0.10);ev(A(0,0.0),'bajo',55,4.2,0.10);
  ev(A(0,0.25),'tic',110,0.14,0.35);ev(A(0,0.85),'tic',110,0.14,0.32);ev(A(0,1.45),'tic',110,0.14,0.28);
  ev(A(0,0.9),'lapiz',0,0.8,0.35);ev(A(0,1.5),'lapiz',0,0.8,0.35);
  ev(A(0,2.0),'tic',3200,0.04,0.22);ev(A(0,2.15),'tic',2700,0.04,0.2);ev(A(0,2.6),'tic',3400,0.04,0.18);
  ev(A(0,3.5),'tic',1400,0.08,0.4);
  // II — por dentro
  ev(A(1,0.0),'hoja',0,0.5,1);ev(A(1,0.1),'swell',1,5.4,0.5);
  ev(A(1,0.0),'lapiz',0,1.0,0.35);ev(A(1,1.2),'lapiz',0,1.0,0.3);
  var R=[2.3,2.55,2.8,3.05,3.3,3.55];for(i=0;i<6;i++)ev(A(1,R[i]),'lapiz',0,0.7,0.32);
  ev(A(1,1.8),'tic',2000,0.05,0.3);ev(A(1,3.9),'lapiz',0,0.8,0.25);
  // III — trabado
  for(i=0;i<5;i++)ev(A(2,0.3+i*0.12),'tic',500,0.06,0.3);
  ev(A(2,0.5),'lapiz',0,1.2,0.3);ev(A(2,1.2),'lapiz',0,0.5,0.3);
  golpe(A(2,1.95));ev(A(2,2.3),'lapiz',0,0.3,0.35);ev(A(2,2.5),'lapiz',0,0.3,0.35);
  ev(A(2,1.8),'lapiz',0,0.9,0.3);ev(A(2,2.6),'lapiz',0,1.0,0.3);
  // IV — la llave justa: el roce, y cada pin que la punta levanta toca su nota
  ev(A(3,0.3),'aire',0,1.8,0.14);
  for(i=0;i<5;i++){var ti=tiempoPin(i,0.3,1.8);ev(A(3,ti),'tic',2400,0.05,0.3);nota(A(3,ti),BIT[i],0.2);}
  ev(A(3,2.1),'tic',1800,0.07,0.4);
  ev(A(3,2.35),'campana',440,2.0,0.16);ev(A(3,2.35),'campana',660,2.0,0.1);ev(A(3,2.35),'campana',880,1.6,0.06);
  for(i=0;i<5;i++)ev(A(3,2.4+i*0.12),'tic',2600,0.04,0.2);
  ev(A(3,2.6),'lapiz',0,1.3,0.3);ev(A(3,3.7),'lapiz',0,1.6,0.3);
  // V — gira
  ev(A(4,0.0),'aire',0,0.9,0.08);ev(A(4,1.1),'aire',0,1.3,0.12);clic(A(4,2.4));
  nota(A(4,2.45),6,0.18);ev(A(4,1.3),'lapiz',0,0.9,0.3);ev(A(4,2.3),'lapiz',0,1.4,0.3);
  // VI — se abre
  ev(A(5,0.0),'hoja',0,0.5,1);ev(A(5,0.0),'bajo',55,4.0,0.10);
  ev(A(5,0.3),'aire',0,0.8,0.08);clic(A(5,1.1));ev(A(5,1.3),'tic',380,0.12,0.45);
  ev(A(5,1.5),'aire',0,1.8,0.16);ev(A(5,0.4),'lapiz',0,0.6,0.3);ev(A(5,1.0),'lapiz',0,1.0,0.3);
  // VII — la otra llave: su melodía empieza distinto, y el golpe sordo de III
  ev(A(6,0.0),'hoja',0,0.5,1);ev(A(6,0.1),'swell',1,5.0,0.45);ev(A(6,0.2),'lapiz',0,1.2,0.35);
  ev(A(6,1.2),'aire',0,1.6,0.14);
  for(i=0;i<5;i++){var tj=tiempoPin(i,1.2,1.6);ev(A(6,tj),'tic',2400,0.05,0.3);nota(A(6,tj),BIT2[i],0.2);}
  for(i=0;i<5;i++)ev(A(6,2.9+i*0.1),'tic',500,0.06,0.25);
  golpe(A(6,3.75));ev(A(6,4.1),'lapiz',0,0.3,0.35);ev(A(6,4.3),'lapiz',0,0.3,0.35);
  ev(A(6,0.5),'lapiz',0,1.3,0.3);ev(A(6,3.0),'lapiz',0,1.8,0.3);
  // VIII — las cuentas: la cámara baja, la escala de las seis alturas, el código, 7776
  ev(A(7,0.0),'hoja',0,0.9,0.7);ev(A(7,0.8),'lapiz',0,1.0,0.35);
  for(i=0;i<5;i++){nota(A(7,1.2+i*0.25),BIT[i],0.16);ev(A(7,1.2+i*0.25),'tic',2400,0.04,0.2);}
  for(i=0;i<6;i++)nota(A(7,1.5+i*0.15),i+1,0.1);
  for(i=0;i<5;i++)ev(A(7,2.3+i*0.15),'tic',2200,0.04,0.25);
  ev(A(7,2.4),'lapiz',0,1.6,0.3);ev(A(7,3.6),'lapiz',0,1.4,0.3);ev(A(7,4.9),'campana',880,1.6,0.14);
  ev(A(7,4.6),'lapiz',0,1.5,0.3);ev(A(7,5.2),'lapiz',0,0.9,0.25);
  // IX — cierre: la melodía de la llave y el acorde
  ev(A(8,0.0),'hoja',0,0.5,1);ev(A(8,0.0),'bajo',55,5.6,0.10);
  for(i=0;i<5;i++)nota(A(8,0.4+i*0.32),BIT[i],0.2);
  ev(A(8,2.5),'campana',220,2.8,0.14);ev(A(8,2.5),'campana',330,2.8,0.09);ev(A(8,2.5),'campana',440,2.8,0.07);
  ev(A(8,2.3),'swell',1,3.0,0.35);clic(A(8,2.5));
  ev(A(8,0.4),'lapiz',0,0.8,0.3);ev(A(8,1.0),'lapiz',0,1.0,0.3);ev(A(8,1.8),'lapiz',0,0.7,0.3);ev(A(8,2.5),'lapiz',0,0.7,0.3);
  ev(A(8,3.4),'lapiz',0,1.0,0.25);
})();

arrancar(3.9);   // portada: el título escrito y la llave tocando la cerradura
