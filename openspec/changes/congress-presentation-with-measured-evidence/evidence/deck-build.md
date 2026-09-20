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

Un archivo de presentación real, importable a Canva o abrible en PowerPoint, generado **desde el guion
versionado**, no escrito a mano por segunda vez.

| Dato | Valor |
| --- | --- |
| Archivo | `congreso-2026-09-24.pptx` |
| Diapositivas | 21 |
| Bytes | 633 093 |
| SHA-256 | `03f3196f6b53819cdfd15447867f4005682ae50d9bc25b257c98184468139c67` |
| Capturas incluidas | Las tres de [material visual](visual-assets.md), de la ventana real en `d744c47` |
| Notas de orador | En las 21, tomadas del «Se dice» del guion |

**No se versiona en el repositorio.** Es un binario derivado: la fuente de verdad es el guion en
`docs/presentations/`, que sí está versionado y cuyas cifras comprueba `verify-deck-figures.mjs`. El generador
depende de `pptxgenjs`, que no es una dependencia de este repositorio y no se añade por un entregable.

## Qué se comprobó, y qué no

| Comprobación | Resultado |
| --- | --- |
| Esquema, relaciones, tipos de contenido y XML de diapositiva | **All validations PASSED** |
| Geometría: nada fuera de la diapositiva, margen mínimo y solapes entre cajas de texto | **21 diapositivas, 0 problemas** |
| Revisión visual mirando las diapositivas renderizadas | **1 defecto encontrado y corregido** |

La comprobación geométrica encontró tres defectos reales en la primera versión y los tres están corregidos:

1. En la diapositiva 4, un bloque de texto terminaba en 8,40 pulgadas sobre una diapositiva de 7,5: **se salía
   por abajo**.
2. El rótulo superior de dieciocho diapositivas quedaba a 0,34 pulgadas del borde, por debajo del margen
   mínimo del propio guion de diseño.
3. En la diapositiva 17, la etiqueta y su cifra **se pisaban** 0,10 pulgadas.

## La revisión visual, después de instalar LibreOffice

La primera versión de este registro decía que las diapositivas no se habían mirado porque el equipo no tenía
con qué renderizarlas. El mantenedor instaló LibreOffice, así que **sí se miraron**: las 21 se convirtieron a
PDF y se rasterizaron, y se inspeccionaron once, elegidas por riesgo estructural —tablas, imágenes, listas
numeradas, las dos de fondo oscuro y la del resultado adverso—.

**Encontró un defecto que la comprobación geométrica no podía ver.** En la diapositiva 19, el texto del
bloque «Comprobado» desbordaba *dentro* de su propia caja y la última línea chocaba con el encabezado
siguiente, «Lo que falta». La geometría no lo detecta porque ninguna caja se salía de la diapositiva ni se
solapaba con otra: lo que se salía era el texto de su caja. Corregido acortando ese texto y separando los
bloques de 1,08 a 1,12 pulgadas.

Es el mismo patrón que esta charla cuenta en la diapositiva 18: una comprobación que pasa no significa que no
haya defectos, significa que no los detecta esa comprobación.

**Lo que sigue sin comprobarse:** el archivo no se ha abierto en PowerPoint ni en Canva. LibreOffice sustituye
fuentes, así que el ajuste exacto del texto puede variar en el programa donde se presente. Conviene abrirlo
una vez en el destino real antes del día 24.
