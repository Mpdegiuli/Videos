# Cómo abre una llave

Corto animado de 46 segundos, dibujado cuadro por cuadro con JavaScript sobre un canvas.
Sin video, sin imágenes, sin librerías: una sola página HTML que se reproduce sola y se exporta a mp4.

Una puerta de noche y un cilindro de pines cortado al medio. Cinco pines partidos en dos,
una línea invisible (la línea de corte), una llave con cinco dientes que los deja justo ahí,
y otra llave que entra pero no gira. **La llave no fuerza nada: alinea, y recién ahí gira.**

## Archivos

| archivo | qué es |
|---|---|
| `film.html` | la lámina completa: reproductor, lista de escenas, notas. Se arma con `node build.mjs` a partir de `src/`. |
| `src/lamina.html` | la página que enmarca la película (título, bajada, reproductor, escenas, cifras). |
| `src/nucleo.js` | el motor de la skill *animación dibujada con código*, copiado tal cual (sólo se ajustó la ganancia de salida del audio, 3,4 → 1,7, medida sobre el pico). |
| `src/pelicula.js` | la película: paletas, geometría del cilindro, la llave, las nueve escenas, la línea de tiempo y la partitura. |
| `render.mjs` | renderiza con Chromium sin ventana: hoja de contactos, cuadros sueltos, o todos los cuadros + `score.wav` para el mp4. |
| `ESCALETA.md` | ficha y escaleta final, con las cifras verificadas y lo que cambió con el panel de revisión. |
| `como-abre-una-llave.mp4` | la exportación: 1600×900, 24 cuadros/s, con la música. |

## Cómo se renderiza

```bash
node build.mjs                      # arma film.html
node render.mjs sheet 24            # 24 cuadros repartidos + hoja de contactos (en ./cuadros)
node render.mjs frames 116,238,549  # cuadros sueltos a tamaño real
node render.mjs all                 # todos los cuadros + score.wav
ffmpeg -y -framerate 12 -i cuadros/f%04d.jpg -i cuadros/score.wav \
  -filter_complex "[1:a]atrim=0:45.8,afade=t=out:st=44.8:d=1[a]" -map 0:v -map "[a]" \
  -c:v libx264 -preset medium -crf 19 -pix_fmt yuv420p -r 24 -movflags +faststart \
  -c:a aac -b:a 160k -shortest como-abre-una-llave.mp4
```

Hace falta `playwright` (con Chromium) y `ffmpeg`. `render.mjs` busca `playwright` en la instalación global si no está en el proyecto.

## Cómo está hecha

- Cada cuadro es una función pura del tiempo. El azar está sembrado (`rng`), el temblor del trazo cambia cada dos cuadros, y la película sale igual siempre.
- Dos mundos: **el pasillo** (nogal, crema, bronce; donde pasa) y **el plano** (cianotipo; donde se entiende). Entre los dos, una hoja que sube o se va.
- La geometría es real dentro de la película: la altura de cada pin se calcula sobre el perfil de la llave que está entrando, con rampas de 45° entre dientes. Por eso los pines suben y bajan al entrar, por eso la llave justa alinea los cinco, y por eso la otra llave (1·5·1·6·2) deja un pin arriba y un contrapín abajo sin ninguna trampa.
- La vista frontal (A-A) está a la misma escala que el corte y es un corte transversal por la primera cámara: al girar el tambor se ve que el contrapín se queda arriba.
- La partitura sale de los datos: las seis alturas son seis notas de la pentatónica menor de La; cada llave toca su código cuando la punta levanta cada pin. Un sonido por idea: golpe sordo cuando traba, clic cuando gira, campana cuando los cinco quedan en la línea.
- El alfabeto del motor no tenía el signo igual: se dibujó para el «6×6×6×6×6 = 7776».

## Cifras

- 5 pines, cada uno en dos partes (pin de llave + contrapín) con resorte.
- En esta llave, 6 alturas por diente: 6⁵ = 7776 llaves, en teoría. Los cilindros comunes usan 7 o 10 alturas y las fábricas descartan saltos grandes entre dientes vecinos.
- Patente del cilindro de llave plana: Linus Yale Jr., US 48.475, 1865.
- El tambor gira un cuarto de vuelta en esta cerradura; otros giran media o una entera.
