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

**La comparación se ha ejecutado dos veces** con el mismo protocolo, las mismas veinte preguntas y los mismos
dos commits: el 13 de septiembre de 2026 sobre la versión **0.1.0** instalada, y el 20 de septiembre de 2026
sobre la **0.3.2** instalada. Las dos se publican aquí. **El resultado no cambió.**

### 13 de septiembre de 2026, versión 0.1.0 instalada

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

### 20 de septiembre de 2026, versión 0.3.2 instalada

Entre las dos mediciones se publicaron 0.2.x y 0.3.x. La re-medición usó el instalador publicado de 0.3.2,
con su SHA-256 comprobado contra el `SHA256SUMS` de la release, instalado y desinstalado para la ocasión. No se
tocaron el protocolo, las preguntas ni los commits; el arnés vuelve a verificar su digest antes de medir.

| Corpus | Método | Respuesta conocida en las 3 repeticiones | Bytes devueltos, 30 observaciones | Bytes de contenido leídos por consulta |
| --- | --- | --- | ---: | ---: |
| Kubernetes | Abrir todo | 10 / 10 | 2 704 134 330 | 90 137 811 |
| Kubernetes | Barrido literal | 10 / 10 | 405 129 | 90 137 811 |
| Kubernetes | Contexto preparado | 0 / 10 | 17 919 | 50 562 446 |
| CPython | Abrir todo | 10 / 10 | 4 168 731 060 | 138 957 702 |
| CPython | Barrido literal | 10 / 10 | 320 586 | 138 957 702 |
| CPython | Contexto preparado | 0 / 10 | 3 006 | 61 967 261 |

**El contexto preparado sigue sin devolver ninguna de las veinte respuestas**, y el barrido literal sigue
devolviendo las veinte. La causa observada tampoco cambió: la preparación indexó **45 de 2654** fuentes en
Kubernetes y **42 de 2753** en CPython, y las dos volvieron a reportar `entry-limit`.

Lo que se movió son los tiempos —y, por unas decenas de bytes, la lectura por consulta, visible en las dos
tablas—, y no lo bastante: la mediana preparada bajó de 17,159 s a 13,576 s en
Kubernetes y de 9,134 s a 6,842 s en CPython, pero el barrido literal sigue respondiendo antes, en 2,739 s y
3,531 s. Preparar el contexto tardó 100,4 s en Kubernetes y 41,6 s en CPython. Son tiempos descriptivos con
caché caliente no controlada.

**Qué demuestra y qué no.** Demuestra que el defecto de recuperación medido en 0.1.0 **sigue presente en la
0.3.2 publicada**, bajo los mismos dos corpora y las mismas consultas congeladas. No demuestra que todo
repositorio grande falle, no evalúa una respuesta generada por un modelo y no mide alucinaciones ni tokens.
Las versiones intermedias no cambiaron el resultado porque no tocaron los límites de indexación; corregirlos
sigue perteneciendo a otro cambio.

Los cuatro JSON crudos de esta corrida están en
`remeasure-retrieval-and-record-flow-comparison/evidence/after/run-02`, con la misma estructura que los de la
primera. El verificador independiente del benchmark solo sabía revisar la primera corrida; esa limitación la
destapó esta re-medición y se corrige en el change.

## Una comprobación que certificó limpio lo que estaba roto

El 18 de septiembre el arnés visual certificó «38 pantallas, 0 hallazgos» sobre una aplicación en la que no se
podía terminar el asistente: corría con movimiento reducido, que desactiva la animación que rompía el diseño, y
recorría un flujo que ya no era el del producto. La corrección entró con 0.3.2.

Para que eso sea comprobable y no una anécdota, el 20 de septiembre de 2026 se ejecutaron tres combinaciones.
Lo que cambia entre ellas es **la comprobación, no la aplicación**: al árbol de `a3b1efd` solo se le copiaron
`verify-ui.mjs` e `interface-contract.mjs`.

| Arnés | Aplicación | Resultado |
| --- | --- | --- |
| El de `a3b1efd` | `a3b1efd` (0.3.1) | **Pasa.** Código 0, 41 s: es la certificación limpia de entonces |
| El de hoy | `a3b1efd` (0.3.1) | **Falla.** Código 1, 351 s, con **360 hallazgos** listados |
| El de hoy | El commit corregido | **Pasa.** Código 0, 92 s |

La misma aplicación, dos comprobaciones: **0 hallazgos contra 360**. Los 360 se reparten en 42 controles que no
se pueden pulsar, 72 avisos de que la barra final no queda fija, 36 de que tapa contenido y 210 hallazgos más,
repetidos por cada tamaño de ventana y cada modo de movimiento. No todos esos 210 son consecuencia del
solapamiento: al menos cuarenta son defectos aparte —veinte de controles sin nombre accesible y veinte de una
navegación que se declara pulsada sin estarlo—.

Los siete controles distintos que el arnés de hoy declara inalcanzables sobre 0.3.1 son exactamente los que la
gente no podía pulsar:

- «¿Cuánta guía prefieres?»
- «Flexible Prototipo o Arquitectura Propia», la última tarjeta de Delimitación
- «Público Objetivo», «Problema Principal» y «Alcance Inicial», las tres sugerencias de Visión
- «Instalar stack base y obtener prompt →» y «Preparar carpeta y generar prompt maestro →», los dos botones de
  Instalación

En 36 de los 42 avisos el arnés dice qué había encima: «en su centro está `div.actions`», la barra de acciones;
en los otros seis, otro control. Los registros están en `evidence/after/harness-contrast.json` y
`harness-contrast-detail.json`, y el commit corregido de la tabla es el de esta rama, no el de la corrección de
0.3.1 a 0.3.2: lo que cambia entre las dos primeras filas es la comprobación, no la aplicación.

**Qué demuestra y qué no.** Demuestra que la comprobación anterior daba por buena una pantalla en la que un
control quedaba tapado, y que la de hoy lo detecta sobre esa misma versión. No demuestra que el arnés de hoy
detecte todo: [#150](https://github.com/IgnacioBarEsp/project-engineering-os/issues/150) sigue abierto con el
recorrido de los seis perfiles, los dos modos de movimiento y las pruebas sobre Electron que aún faltan.

## El arranque documentado funciona, y ahora se comprueba

El README publica seis pasos para empezar en la terminal. Hasta ahora nadie los repetía: si uno dejara de
funcionar, el repositorio no se enteraría. `scripts/verify-documented-start.mjs` los **lee del propio README**
—no los copia— y los ejecuta contra el paquete publicado en una carpeta desechable.

Ejecución del 20 de septiembre de 2026 contra `create-project-engineering-os@0.5.0`, con Node 24.18.0:

| Paso | Código de salida | Tiempo |
| --- | --- | --- |
| `npx --yes create-project-engineering-os@0.5.0 bootstrap --target .` | 0 | 3 s |
| `npm ci` | 0 | 3 s |
| `npm run openspec:init` | 0 | 7 s |
| `npm run project-os:opsx:adapt` | 0 | 1 s |
| `npm run project-os:check` | 0 | 2 s |
| `npm run project-os:doctor` | 0 | 1 s |

El doctor del proyecto recién sembrado reporta **29 comprobaciones y ningún FAIL**. Conviene no confundirlo con
el doctor sobre este repositorio, que sí reporta FAIL esperados y explicados en
[SELF_APPLICATION](../SELF_APPLICATION.md).

La comprobación necesita red hacia el registro de npm, así que no entra en `npm run check`, que es offline. Si
el registro no responde informa **NO EJECUTADA**, nunca PASS: una comprobación que no pudo correr no es una
comprobación que pasó.

## Un prompt suelto contra el flujo completo, sobre una misma tarea

El 20 de septiembre de 2026 se comparó lo que hacen dos formas de trabajar con **el mismo defecto real**: el
gate de Definition of Ready rechazaba frases correctas en castellano. La tarea y sus criterios se escribieron y
se congelaron con su digest **antes** de ejecutar ninguna de las dos vías, y cada vía corrió en contexto limpio,
en su propio árbol, recibiendo el mismo párrafo de partida. Lo único que cambió entre ellas fue el proceso.

Las dos entregas las evaluó quien publica esto, no ellas mismas: se importó el detector de cada árbol y se
sometió al mismo corpus, tomado de los documentos reales del repositorio.

| Criterio | Prompt suelto | Flujo completo |
| --- | --- | --- |
| Frases legítimas que pasan | 33 de 34 | 34 de 34 |
| Marcadores de verdad que siguen rechazados | 19 de 19 | 18 de 19 |
| Una regresión hace fallar su suite | Sí, caen 3 pruebas | Sí, cae 1 |
| Changes archivados que cambian de veredicto | 0 de 50 | 0 de 50 |
| `npm run check` en el árbol entregado | 344 de 344 | 344 de 344 |
| Reloj de pared | 8 min 44 s | 31 min 3 s |
| Archivos tocados | 2 | 28 |

Para leer esas columnas: el detector original rechaza **32 de esas 34** frases legítimas y deja colar **3 de
los 19** marcadores.

**Ninguna de las dos entregó el arreglo completo, y no fallan en lo mismo.** El prompt suelto dejó sin tocar el
segundo síntoma del defecto —que un identificador con guiones cuente como marcador— y el flujo completo dejó
sin detectar una cadena literal de una plantilla sembrada que ya se colaba antes. Las dos, en cambio,
encontraron sin que nadie se lo pidiera un escape que nadie había visto: la frontera de palabra de JavaScript
no conoce la `í`, así que un marcador escrito con acento nunca se detectaba.

Lo que el proceso produjo y el prompt suelto no: dejar **pendiente lo que no se pudo ejecutar** en vez de
rellenarlo, registrar las decisiones que no le tocaban al ejecutor, y encontrar de paso un defecto ajeno —el
empaquetador trata un archivo sin saltos de línea como fin de línea no canónico— sin arreglarlo de pasada. Lo
que el prompt suelto produjo sin que se lo pidieran: pruebas, y un corpus más sensible que el del flujo.

**Qué demuestra y qué no.** Demuestra qué pasó en **esta** tarea. No demuestra una ventaja general de ninguna
de las dos vías, no predice otra tarea y no mide a las personas que usarían cada una. No se midieron tokens,
porque ningún proveedor los reportó en un registro conservable, y nadie juzgó la calidad de las respuestas: los
criterios se comprueban sobre el código y se comprobaron ejecutándolo. Las dos vías tampoco partían de cero: la
memoria del proyecto ya nombraba este defecto, y las dos la heredaron por igual.

El protocolo, los prompts literales, la evaluación y sus límites están en
`remeasure-retrieval-and-record-flow-comparison/evidence/flow-comparison/`.

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
