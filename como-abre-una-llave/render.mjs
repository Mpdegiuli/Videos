// Renderiza la película con Chromium sin ventana.
//   node render.mjs sheet [N]        → N cuadros repartidos (24) + hoja de contactos
//   node render.mjs frames 12,80,…   → cuadros sueltos a tamaño real
//   node render.mjs wav              → sólo score.wav (para medir el pico)
//   node render.mjs all              → todos los cuadros (jpg) + score.wav, para el mp4
import { createRequire } from 'module';
const require=createRequire(import.meta.url);
let chromium;try{({chromium}=require('playwright'));}catch(e){({chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright'));}
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
const modo=process.argv[2]||'sheet';
const out=process.env.OUT||path.resolve('cuadros'); fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch({args:['--no-sandbox']});
const p=await b.newPage({viewport:{width:1280,height:900}});
const errores=[];
p.on('pageerror',e=>{errores.push(e.message);console.log('PAGEERROR',e.message);});
p.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text());});
await p.goto('file://'+path.resolve('film.html'),{waitUntil:'domcontentloaded'});
await p.waitForFunction('window.__film!==undefined');
const info=await p.evaluate(()=>({N:window.__film.TOTALF,DUR:window.__film.DUR,FPS:window.__film.FPS}));
console.log('cuadros',info.N,'duración',info.DUR.toFixed(2),'s');
async function cuadro(i,nombre,q){
  const t0=Date.now();
  const d=await p.evaluate(i=>{const a=performance.now();window.__film.dibujar(i);const b=performance.now();
    return {ms:b-a,png:document.getElementById('pantalla').toDataURL('image/jpeg',0.93)};},i);
  fs.writeFileSync(nombre,Buffer.from(d.png.split(',')[1],'base64'));
  return d.ms;
}
if(modo==='sheet'){
  const grid=parseInt(process.argv[3]||'24'),N=info.N,files=[],tiempos=[];
  for(let k=0;k<grid;k++){
    const i=Math.round(k*(N-1)/(grid-1));
    const f=`${out}/s${String(i).padStart(4,'0')}.jpg`;tiempos.push(await cuadro(i,f));files.push(f);
  }
  console.log('ms por cuadro (max/med)',Math.max(...tiempos).toFixed(1),(tiempos.reduce((a,b)=>a+b,0)/tiempos.length).toFixed(1));
  const cols=4;
  execSync(`montage ${files.join(' ')} -tile ${cols}x -geometry 400x225+4+4 -background '#222' -fill '#ddd' -pointsize 14 -set label '%t' ${out}/hoja.jpg`);
  console.log('hoja',`${out}/hoja.jpg`);
}else if(modo==='frames'){
  for(const i of process.argv[3].split(',').map(Number)){
    const ms=await cuadro(i,`${out}/f${String(i).padStart(4,'0')}.jpg`);console.log('cuadro',i,ms.toFixed(1),'ms');
  }
}else if(modo==='wav'){
  const wav=await p.evaluate(()=>window.__film.wav());
  fs.writeFileSync(`${out}/score.wav`,Buffer.from(wav,'base64'));console.log('score.wav listo');
}else if(modo==='all'){
  const tiempos=[];
  for(let i=0;i<info.N;i++)tiempos.push(await cuadro(i,`${out}/f${String(i).padStart(4,'0')}.jpg`));
  console.log('ms por cuadro (max/med)',Math.max(...tiempos).toFixed(1),(tiempos.reduce((a,b)=>a+b,0)/tiempos.length).toFixed(1));
  const wav=await p.evaluate(()=>window.__film.wav());
  fs.writeFileSync(`${out}/score.wav`,Buffer.from(wav,'base64'));
  console.log('score.wav listo');
}
await b.close();
if(errores.length){console.log('ERRORES DE PÁGINA:',errores.length);process.exit(1);}
