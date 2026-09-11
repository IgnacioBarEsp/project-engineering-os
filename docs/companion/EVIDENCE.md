# Qué se midió y qué no

Esta página publica el método antes que los números, y dice de cada número qué no respalda. Los datos
crudos —el corpus, las preguntas con su clave de respuestas, el resultado por pregunta y lo que no se
pudo medir— viven en el repositorio, bajo `openspec/changes/` en la carpeta de evidencia del cambio
`validate-companion-journeys`. No viajan en el paquete publicado: este documento sí, así que la ruta se
describe en vez de enlazarse.

**Úsala si:** te preguntas si la promesa del producto está respaldada, o vas a repetir la medición.

## Qué se comparó

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
que devolvió. Las dos líneas base leen el corpus entero; el contexto preparado lee el índice que él mismo
escribió.

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
enlace para saltar al contenido que mueve el foco, **78 nodos de texto medidos en los dos esquemas de
color** —claro y oscuro— todos por encima del mínimo de contraste para su tamaño, con 5.35 como peor
caso, y reflujo sin desplazamiento horizontal desde 1180 hasta 240 píxeles y con el texto al doble de
tamaño. La comprobación de reflujo además verifica que ningún texto quede fuera de la ventana dentro de
un contenedor que recorte, que es donde un desbordamiento no produce barra y pasa desapercibido. Pesa
13 649 bytes y no necesita JavaScript.

Una comprobación automática no es una auditoría de accesibilidad ni certifica conformidad. No se probó
con un lector de pantalla real ni con personas usuarias, y se midió en un motor basado en Chromium.

Vuelve a [documentación](../README.md) o a [la app de escritorio](DESKTOP.md).
