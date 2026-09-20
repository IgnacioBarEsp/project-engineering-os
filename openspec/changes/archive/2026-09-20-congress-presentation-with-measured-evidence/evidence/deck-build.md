# El mazo: por qué no salió de Canva y qué se entregó

## Canva no pudo crearlo

El issue daba por bloqueado el conector de Canva. **Ya está autorizado** —`list-brand-kits` responde y hay un
brand kit, `kAGaaDAtI_k`—, así que se intentó la vía prevista: revisión del esquema y generación del diseño.

El esquema de 21 diapositivas se envió a revisión y el mantenedor lo aprobó. La generación falló:

> Design generation is not enabled in your team (Request ID: a3e29128ce39553b-IAD)

Es un ajuste del equipo de Canva, no algo que se pueda sortear desde aquí. La segunda vía tampoco existe:
`search-brand-templates` sobre presentaciones devuelve **cero plantillas**, así que no hay nada que autorellenar.

El propio issue anticipaba esta salida: «producir el contenido completo diapositiva por diapositiva con sus
notas de orador y los archivos de imagen listos, para pegarlo en una plantilla de Canva a mano».

## Lo que se entregó

Un archivo de presentación real, importable a Canva o abrible en PowerPoint.

| Dato | Valor |
| --- | --- |
| Archivo | `congreso-2026-09-24.pptx` |
| Diapositivas | 22: las veinte de la charla, la de límites y la de procedencia |
| Bytes | 664 822 |
| SHA-256 | `d165e89849b8f1bc7a226bedac389197d952ea93922d1272552a344e61d213a0` |
| Capturas incluidas | Las tres de [material visual](visual-assets.md), de la ventana real en `d744c47` |
| Notas de orador | En las 22, tomadas del «Se dice» del guion |

Se genera con `node build-deck.mjs <repositorio>`, que escribe el `.pptx` en el directorio desde el que se
ejecuta. El archivo cuyo SHA-256 sale en la tabla se generó en un directorio de trabajo fuera del repositorio,
junto a `pptxgenjs`.

**No se versiona en el repositorio.** Es un binario derivado: la fuente de verdad es el guion en
`docs/presentations/`, que sí está versionado y cuyas cifras comprueba `verify-deck-figures.mjs`. El generador
depende de `pptxgenjs`, que no es una dependencia de este repositorio y no se añade por un entregable.

### El generador no lee el guion, y eso tiene una consecuencia

Una versión anterior de este registro decía que el mazo estaba «generado desde el guion versionado, no escrito
a mano por segunda vez». **Era falso**: `build-deck.mjs` tiene el texto de cada diapositiva escrito dentro, y
no abre el guion en ningún momento. La revisión adversarial lo marcó y se comprobó: `grep -c
"congreso-2026-09-24.md" build-deck.mjs` devuelve `0`.

Escrito a mano por segunda vez es exactamente lo que es, y el riesgo que eso trae es que el mazo se separe del
guion sin que nadie lo note —que es el defecto que ya apareció una vez, cuando el guion se corrigió y el
generador se quedó con las cifras viejas—. Como no se puede quitar el riesgo sin reescribir el generador,
**se comprueba**: `check-deck-figures.py` extrae toda cifra que aparezca en una diapositiva o en sus notas y
exige que esté en el guion. El guion, a su vez, está atado a los registros por `verify-deck-figures.mjs`. La
cadena queda cerrada por los dos extremos.

| Comprobación | Qué ata | Resultado |
| --- | --- | --- |
| `verify-deck-figures.mjs` | Guion ↔ registros de #166 y `EVIDENCE.md` | 26 afirmaciones, 0 fallos |
| `check-deck-figures.py` | Mazo ↔ guion | 90 cifras, 0 problemas ([registro](deck-figures-in-pptx.json)) |

La segunda se probó mutando el generador: cambiando `45 de 2654 fuentes` por `4711 de 2654` en la diapositiva
17, la comprobación falla y nombra la diapositiva y la cifra. Sin mutación pasa. Lo que no cubre: el texto que
no lleva cifras, que sigue transcrito a mano y sin comprobar automáticamente.

## Qué se comprobó, y qué no

| Comprobación | Resultado |
| --- | --- |
| Esquema, relaciones, tipos de contenido y XML de diapositiva | **All validations PASSED** |
| Geometría: nada fuera de la diapositiva, margen mínimo y solapes entre cajas, imágenes y tablas | **22 diapositivas, 0 problemas** ([salida](geometry.txt)) |
| Cifras del mazo contra el guion | **90 cifras, 0 problemas** ([registro](deck-figures-in-pptx.json)) |
| Revisión visual mirando las diapositivas renderizadas | **2 defectos encontrados y corregidos** |

La comprobación geométrica encontró tres defectos reales en la primera versión y los tres están corregidos:

1. En la diapositiva 4, un bloque de texto terminaba en 8,40 pulgadas sobre una diapositiva de 7,5: **se salía
   por abajo**.
2. El rótulo superior de dieciocho diapositivas quedaba a 0,34 pulgadas del borde, por debajo del margen
   mínimo del propio guion de diseño.
3. En la diapositiva 17, la etiqueta y su cifra **se pisaban** 0,10 pulgadas.

## La revisión visual, después de instalar LibreOffice

La primera versión de este registro decía que las diapositivas no se habían mirado porque el equipo no tenía
con qué renderizarlas. El mantenedor instaló LibreOffice, así que **sí se miraron**: las 22 se convirtieron a
PDF y se rasterizaron, y se inspeccionaron trece, elegidas por riesgo estructural —tablas, imágenes, listas
numeradas, las dos de fondo oscuro y la del resultado adverso—.

**Encontró dos defectos que la comprobación geométrica no podía ver**, los dos del mismo tipo: texto que
desborda *dentro* de su caja. La geometría no los detecta porque ninguna caja se sale de la diapositiva ni se
solapa con otra.

1. En la diapositiva 19, el bloque «Comprobado» desbordaba y su última línea chocaba con el encabezado
   siguiente, «Lo que falta». Corregido acortando ese texto y separando los bloques de 1,08 a 1,12 pulgadas.
2. En la diapositiva 13, el párrafo literal del prompt pasó a ocupar dos líneas al corregirse el guion, y las
   cifras grandes quedaban pegadas debajo. Corregido bajándolas de 2,60 a 2,85 pulgadas.

Es el mismo patrón que esta charla cuenta en la diapositiva 18: una comprobación que pasa no significa que no
haya defectos, significa que no los detecta esa comprobación.

**Lo que sigue sin comprobarse:** el archivo no se ha abierto en PowerPoint ni en Canva. LibreOffice sustituye
fuentes, así que el ajuste exacto del texto puede variar en el programa donde se presente. Conviene abrirlo
una vez en el destino real antes del día 24.
