# Qué se midió y qué no

Esta página publica el método antes que los números, y dice de cada número qué no respalda. Los datos
crudos —el corpus, las preguntas con su clave de respuestas, el resultado por pregunta y lo que no se
pudo medir— viven en el repositorio, bajo `openspec/changes/` en las carpetas de evidencia de
`validate-companion-journeys` y `measure-prepared-context-on-real-repositories`. No viajan en el paquete
publicado: este documento sí, así que las rutas se describen en vez de enlazarse.

**Úsala si:** te preguntas si la promesa del producto está respaldada, o vas a repetir la medición.

## Microcorpus sintético: qué se comparó

Diez preguntas con respuesta conocida sobre el mismo corpus de 6812 bytes: notas, una especificación, un
registro de decisiones, un archivo de registro, un PDF con texto y un documento de Word. Cada pregunta
tiene una única fuente correcta. Se resolvieron de tres maneras sobre ese mismo corpus.

| Método | Fuente correcta | Devolvió la respuesta | Localizador | Bytes devueltos | Bytes leídos | Archivos abiertos |
| --- | --- | --- | --- | --- | --- | --- |
| Abrir todo el corpus | 10 / 10 | 8 / 10 | archivo | 68 120 | 6812 | 60 |
| Barrido literal, `grep -a -n -r` | 8 / 10 | 8 / 10 | archivo:línea | **1129** | **6812** | 60 |
| Contexto preparado por la app | **10 / 10** | **10 / 10** | pasaje | 957 | 88 814 | 50 |

La columna que importa es *devolvió la respuesta*: cuenta las preguntas cuya respuesta conocida estaba
realmente dentro del texto que el método devolvió. Encontrar el archivo correcto no es responder.

*Fuente correcta* para «abrir todo el corpus» es 10 / 10 por construcción, no por acertar: devuelve todos
los archivos, así que el correcto siempre está. No discrimina, y el dato crudo lo marca como tal.

*Bytes leídos* es por consulta: lo que el método tuvo que leer para responder, que no es lo mismo que lo
que devolvió. Las dos líneas base leen el corpus entero. El arnés sintético anterior contó el índice que
leyó el contexto preparado, pero no separó las fuentes que la aplicación relee para comprobar frescura;
por eso esos bytes no se comparan con la contabilidad corregida del experimento a escala que sigue.

## Dónde la línea base empata o gana

**Un barrido literal responde las mismas ocho preguntas que abrir el corpus entero**, y lo hace leyendo
6812 bytes por consulta frente a los 88 814 de índice que lee el contexto preparado. No necesita
preparación, no escribe nada y devuelve `archivo:línea`, un localizador tan comprobable como el del
contexto preparado, solo que menos preciso.

Las dos preguntas que el barrido falla están en el documento de Word, cuyas partes van comprimidas y son
ilegibles sin un analizador. **El PDF de este corpus sí lo lee**, porque lleva sus flujos de texto sin
comprimir. Con un PDF comprimido o escaneado el barrido perdería también esas tres, y la diferencia sería
mayor. Se reporta el corpus que se midió, no el que convendría.

Una versión anterior de esta medición publicaba 5 / 10 para el barrido literal. Ese número era un
artefacto del instrumento: el script decidía por extensión qué archivos abrir y nunca abría el PDF. Una
revisión adversarial independiente lo detectó, se corrigió el script para medir sobre los bytes en vez de
sobre la extensión, y se volvió a medir. Esta tabla es el resultado corregido.

## Qué aporta preparar, medido

Sobre este corpus, frente a un barrido competente, exactamente dos cosas:

- **Dos preguntas más**: 10 de 10 frente a 8 de 10, y la diferencia son las dos del documento de Word.
- **Un localizador de pasaje** —`página 1`, `párrafo 2`, `línea 3`— en lugar de un número de línea.

Devuelve además menos bytes, 957 frente a 1129, pero la diferencia es pequeña y va en sentido contrario
al de los bytes leídos. Nada más que eso está medido aquí.

## Qué cuesta

Preparar ese corpus tomó **668 ms** y escribió **97 271 bytes**, catorce veces el tamaño del corpus. Ese
costo se paga una vez por proyecto y se vuelve a pagar cuando las fuentes cambian. Además, cada consulta
lee 88 814 bytes de ese índice. En un corpus pequeño los artefactos pesan más que los documentos.

## Qué no se midió

- **Consumo de tokens de un modelo.** Esta medición no lo expone y no se estima a partir de bytes. Los
  bytes se reportan como bytes.
- **Calidad de respuesta de un modelo.** Evaluarla con el mismo agente que construyó el producto sería
  juez y parte, y no sería reproducible.
- **Alucinaciones.** El método no puede observarlas, así que no se afirma nada sobre ellas.
- **Otros productos.** No se compara con ninguno.

## Límites del método

Compara métodos de recuperación sobre un corpus sintético, no dos productos ni dos personas. Un corpus
de este tamaño no predice el comportamiento en repositorios grandes. El resultado depende del corpus:
con documentos comprimidos o escaneados la línea base perdería más, y con puro texto plano no perdería
nada. Se ejecutó en un equipo Windows.

## Repositorios grandes reales: resultado desfavorable

El 13 de septiembre de 2026 se repitió la comparación sobre dos repositorios públicos, ajenos y fijados
por commit: `kubernetes/website` (`d6e659c193bba313791e6ace4475a475093153f1`, subtree `content/en`,
CC-BY-4.0) y `python/cpython` (`9bd9c7461dabddcd2688b0f14ce00722edbdfee3`, Python-2.0). El protocolo,
las veinte preguntas y el arnés se precomprometieron en `c808967cd46abc4b340d148834a24e3005cc0247`;
el SHA-256 del protocolo es `9c43e965d4f860a5bb260e2f2ca9db23c21ff1c6d4f8d7905245dbf187782e93`.

Cada pregunta se ejecutó tres veces. Las tres vías recibieron el mismo término y la misma exportación
limpia. La columna de bytes devueltos suma las 30 observaciones; los bytes leídos son bytes de contenido
abiertos por consulta. No son tokens ni I/O físico.

| Corpus | Método | Respuesta conocida en las 3 repeticiones | Bytes devueltos, 30 observaciones | Bytes de contenido leídos por consulta |
| --- | --- | --- | ---: | ---: |
| Kubernetes | Abrir todo | 10 / 10 | 2 704 134 330 | 90 137 811 |
| Kubernetes | Barrido literal | 10 / 10 | 405 129 | 90 137 811 |
| Kubernetes | Contexto preparado | 0 / 10 | 17 919 | 50 562 396 |
| CPython | Abrir todo | 10 / 10 | 4 168 731 060 | 138 957 702 |
| CPython | Barrido literal | 10 / 10 | 320 586 | 138 957 702 |
| CPython | Contexto preparado | 0 / 10 | 3 006 | 61 967 211 |

El resultado contradice cualquier generalización del microcorpus: **en estos dos repositorios grandes el
contexto preparado no devolvió ninguna de las veinte respuestas**, mientras el barrido literal devolvió
las veinte. Leer menos bytes de contenido no compensó la pérdida de cobertura ni produjo una búsqueda
más rápida: la mediana preparada fue 17,159 s frente a 2,795 s para el barrido en Kubernetes, y 9,134 s
frente a 3,875 s en CPython. Son tiempos descriptivos con caché caliente no controlada, no una promesa de
rendimiento.

La causa observada está en los límites publicados del producto, no en preguntas cambiadas después del
resultado. Kubernetes tenía 3262 archivos, de los cuales 3096 y 41 608 178 bytes cumplían el criterio
UTF-8; la preparación tomó 101 451,843 ms, escribió 5 564 372 bytes e indexó 45 de 2654 fuentes observadas,
con una fuente parcial y 2608 no disponibles. CPython tenía 6285 archivos, 6118 archivos UTF-8 y
118 834 078 bytes UTF-8; preparar tomó 49 367,548 ms, escribió 4 853 188 bytes e indexó 42 de 2753 fuentes,
con una parcial y 2710 no disponibles. Ambos reportaron `entry-limit`; CPython también agotó el presupuesto
de bytes durante la colección.

Los cuatro JSON crudos están en `measure-prepared-context-on-real-repositories/evidence/run-01`: preflight,
un reporte por corpus y el agregado. Registran cada repetición, orden, localizador, hashes de los pasajes,
identidad de la aplicación instalada y las categorías de lectura. No se versionaron copias de los
repositorios externos.

**Qué demuestra y qué no.** Demuestra una falla de recuperación de la versión instalada 0.1.0 bajo estos
dos corpora y estas consultas congeladas. No demuestra que todo repositorio grande falle, no evalúa una
respuesta generada por un modelo y no mide alucinaciones ni tokens. Mejorar los límites o el orden de
indexación pertenece a otro cambio: este experimento no alteró el producto para favorecer el resultado.

## Los cinco recorridos

Los cinco perfiles se recorrieron completos sobre la aplicación instalada desde el artefacto verificado,
con la caché de herramientas vacía: elegir carpeta, revisar y preparar, y para software y Unity además
revisar e instalar herramientas, preparar ingeniería, activar los workflows oficiales de OpenSpec, crear
el mapa de código y buscar un símbolo. Cada perfil cerró con casos negativos y recuperación.

| Perfil | Pasos | Ingeniería |
| --- | --- | --- |
| Investigación | 7 | no aplica |
| Software | 15 | herramientas, constructor, OpenSpec, mapa de código |
| Unity | 15 | herramientas, constructor, OpenSpec, mapa de código |
| Contenido | 7 | no aplica |
| General | 7 | no aplica |

Casos negativos comprobados en cada perfil: una fuente modificada deja el contexto desactualizado y la
búsqueda se rechaza en vez de citar algo viejo; regenerar lo recupera; un índice corrupto produce un
estado que pide revisión y restaurarlo lo recupera; en los perfiles sin ingeniería la etapa de
herramientas se rechaza y la búsqueda documental sigue funcionando. Cada perfil termina reabriendo el
proyecto desde el historial con una instancia nueva del servicio.

**Qué demuestra y qué no.** Los recorridos se ejecutaron con un script a través de la capa de servicio de
la aplicación instalada, con la elección de carpeta, el portapapeles y la apertura externa inyectados.
Eso ejercita los motores instalados, el núcleo instalado y las herramientas que este equipo descargó. No
ejercita la interfaz, que cubren los cinco recorridos de navegador, ni las páginas del asistente del
instalador. **Ninguna persona usuaria participó: son pruebas, no un estudio.**

## La landing

`site/index.html` se construyó sobre un proyecto preparado por la propia aplicación instalada. Se
comprobó en un navegador real: ninguna petición externa, un solo `h1` con los encabezados en orden,
enlace para saltar al contenido que mueve el foco, **80 nodos de texto medidos en los dos esquemas de
color** —claro y oscuro— todos por encima del mínimo de contraste para su tamaño, con 5.35 como peor
caso, y reflujo sin desplazamiento horizontal desde 1180 hasta 240 píxeles y con el texto al doble de
tamaño. La comprobación de reflujo además verifica que ningún texto quede fuera de la ventana dentro de
un contenedor que recorte, que es donde un desbordamiento no produce barra y pasa desapercibido. Pesa
14 527 bytes y no necesita JavaScript.

Una comprobación automática no es una auditoría de accesibilidad ni certifica conformidad. No se probó
con un lector de pantalla real ni con personas usuarias, y se midió en un motor basado en Chromium.

Vuelve a [documentación](../README.md) o a [la app de escritorio](DESKTOP.md).
