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
| Bytes | 633 102 |
| SHA-256 | `7d703a2a23c92dcd913dc437bebe930d081aadadf683fb1dc131d43bf0f4fa5e` |
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
| Revisión visual mirando las diapositivas renderizadas | **No se pudo hacer** |

La comprobación geométrica encontró tres defectos reales en la primera versión y los tres están corregidos:

1. En la diapositiva 4, un bloque de texto terminaba en 8,40 pulgadas sobre una diapositiva de 7,5: **se salía
   por abajo**.
2. El rótulo superior de dieciocho diapositivas quedaba a 0,34 pulgadas del borde, por debajo del margen
   mínimo del propio guion de diseño.
3. En la diapositiva 17, la etiqueta y su cifra **se pisaban** 0,10 pulgadas.

**Lo que no se pudo comprobar, y hay que decirlo:** en este equipo no hay LibreOffice ni PowerPoint, así que
las diapositivas **no se renderizaron ni se miraron**. La comprobación geométrica atrapa lo que se sale de la
caja, pero no ve si un texto desborda *dentro* de su caja, si un contraste queda flojo o si una imagen quedó
mal encuadrada. **Esa revisión la tiene que hacer una persona abriendo el archivo**, y no está hecha.
