// Arma film.html: lámina + núcleo + película, en un solo archivo.
import fs from 'fs';
const d=new URL('./src/',import.meta.url).pathname;
const html=fs.readFileSync(d+'lamina.html','utf8')+fs.readFileSync(d+'nucleo.js','utf8')+'\n'+fs.readFileSync(d+'pelicula.js','utf8')+'\n</script>\n';
fs.writeFileSync(new URL('./film.html',import.meta.url).pathname,html);
console.log('film.html',html.length,'bytes');
