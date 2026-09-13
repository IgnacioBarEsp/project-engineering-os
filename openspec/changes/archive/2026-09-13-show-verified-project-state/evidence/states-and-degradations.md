# Estados y degradaciones

Qué muestra esta parte de la aplicación cuando algo no está disponible, y qué se midió de cada caso. Todo lo
de aquí se observó ejecutando el arnés que se nombra en cada fila, no por lectura del código.

## La lista de proyectos

| Situación | Qué muestra | Cómo se midió |
| --- | --- | --- |
| Ningún proyecto | «Aún no hay proyectos en esta lista.» y el control para empezar. | `verify-interface-contract.mjs`, estado `empty`. |
| El historial no se puede leer | El error del servicio con su causa y su acción, visible en la pantalla. | `verify-interface-contract.mjs`, estado `error`. |
| Una carpeta no responde | Esa fila queda `unreadable` con la causa que dio el servicio («Esta carpeta no respondió a tiempo»), y el resto del listado se dibuja. | `verify-interface-contract.mjs` (fila en una unidad de red) y `qa/project-list.mjs`. |
| Una carpeta se borró | `unreadable` con su causa; la fila vecina sigue en su estado. | `qa/project-list.mjs`. |
| Nunca se comprobó | `Sin comprobar`, sin palomita. | `qa/project-list.mjs`. |
| El veredicto es de otra carpeta | `Sin comprobar`: el resumen de la ubicación no coincide. | `qa/project-list.mjs`, reescribiendo `rootHash`. |
| El veredicto no pudo registrar todo | `Sin comprobar`: un testigo truncado no sostiene la palomita. | `qa/project-list.mjs`, marcando `witnessTruncated`. |
| El archivo de veredictos no se puede leer | Se degrada a «sin veredicto»: cada proyecto aparece `Sin comprobar`, la lista sigue funcionando y el proyecto se sigue abriendo. El historial **no** hace esto y no debe: perderlo pierde los proyectos de la persona. | `qa/project-list.mjs`, con `{version:2,items:'no'}` (forma irreconocible) **y** con un archivo de 9 MiB, que es más de lo que el lector acepta. Una revisión independiente encontró que el segundo caso rompía la lista entera y también abrir cualquier proyecto. |
| No se puede escribir el veredicto | La comprobación responde igual y el estado dice `saved: false` con su causa; la fila conserva el último veredicto que sí se guardó, con su fecha. | `qa/project-list.mjs`, dejando un candado abandonado en el directorio de datos de la aplicación. |
| Un veredicto sin etapas, sin testigo o con fecha ilegible | `Sin comprobar`: una etapa ausente cuenta como no lista, y un veredicto que nada puede desmentir sería una marca permanente. | `qa/project-list.mjs`, reescribiendo cada campo por separado. |
| Cambió un archivo del que dependía el veredicto | `Hay que comprobarlo de nuevo`, nombrando la etapa dueña de ese archivo. | `qa/project-list.mjs` y el recorrido de navegador. |
| Se restauran los bytes exactos | Vuelve a `Listo`: la comparación es de contenido, no de fecha. | `qa/project-list.mjs`. |
| Falta una etapa del perfil | `Le falta algo` y la enumeración de cuáles, en palabras. | `qa/project-list.mjs` y los cinco recorridos nativos. |
| El módulo de la interfaz no carga | La ventana dice qué pasó en lugar de quedarse en blanco, sin cambios respecto a #97. | `verify-interface-contract.mjs`. |

## Dentro del proyecto

| Situación | Qué muestra | Cómo se midió |
| --- | --- | --- |
| No hay veredicto todavía | La guía dice que hay que comprobar el proyecto, con su causa, en su propio panel: la pantalla no se cae. | Ruta de error de `guide()` con `VERDICT_MISSING`, renderizada por `guidePanel`. |
| Una etapa quedó pendiente | Un paso con el control que la resuelve y ningún texto para dar a la IA. | `qa/project-list.mjs` y los cinco recorridos nativos. |
| Dos etapas comparten su control | El control se dibuja una sola vez y el segundo paso lo dice. | `guideProblems` acepta ese paso solo si un paso anterior con la misma acción sí dibujó el control; las mutaciones `the-same-action-in-two-controls-of-one-screen` y `the-code-map-control-offered-twice-on-one-screen` lo comprueban por el otro lado. |
| Las respuestas ya están guardadas y la carpeta cambió | El paso revisa esas respuestas contra la misma carpeta. No abre el asistente, que saldría del proyecto y dejaría los campos en blanco. | `qa/project-list.mjs` y la mutación de servicio `the-guidance-sends-a-prepared-project-to-a-blank-wizard`. |
| El proyecto cambió después de componer la guía | Copiar un paso se rechaza con `GUIDE_STALE` y dice qué hacer. | `qa/project-list.mjs`. |
| Un paso que hace la aplicación | Copiar se rechaza con `GUIDE_STEP_LOCAL`: el texto no existe porque la IA no hace ese trabajo. | `qa/project-list.mjs`. |
| Esta instalación no puede comprobar las herramientas | La etapa aparece como `no disponible` con esa causa, y el proyecto no es `Listo`. No se afirma nada sobre las herramientas. | Recorridos de navegador para los perfiles de software y videojuego. |
| El inventario de la carpeta quedó desactualizado | `Tus elecciones` deja de estar `Preparado` y dice que la carpeta cambió desde la primera mirada, en la lista y en la tarjeta de estado, con la misma regla en las dos. | Recorridos de navegador (software y videojuego) y `qa/project-list.mjs`. |

## Degradaciones declaradas

- La comparación de resúmenes **solo desmiente**. Que coincidan no prueba que el proyecto siga listo. La fila
  lo dice, con la fecha de la comprobación, y la aclaración se dibuja al mismo tamaño que el estado.
- El veredicto **no cubre el contenido de los archivos de la persona**. Detectar un archivo editado exige
  reinspeccionar la carpeta, que es el costo que este cambio evita. La fila lista lo dice.
- El veredicto **no cubre el mapa de código, las herramientas de desarrollo ni la IA de la persona**. El mapa
  porque es una adición que la interfaz ofrece y un proyecto sin código no tiene nada que mapear. Las
  herramientas porque viven fuera de la carpeta: su recibo está dentro, pero la cadena administrada no, así que
  ningún resumen que la lista pueda releer notaría que se retiró. La IA porque esta aplicación no puede
  verificar el producto de otro. Las tres exclusiones están en la misma frase que la palomita, y la de las
  herramientas solo aparece en los perfiles que las necesitan.
- El testigo tiene un límite de 200 archivos, de 256 caracteres por ruta y de 8 MiB por archivo, y el archivo
  de veredictos completo se recorta para no pasar de 8 MiB. Pasado cualquiera de esos límites, el veredicto se
  marca truncado y nunca puede mostrarse como listo.

## Decisiones registradas por desviación

- El issue pide una entrada «eliminar» además de «quitar del historial», y su propio criterio de aceptación
  define *eliminar* como quitar del historial sin tocar la carpeta. Es una sola acción; sobrevive el nombre que
  describe el efecto. Razón en `design.md`.
- El issue pide «prompts para terminar de configurar». Los pasos que ejecuta esta aplicación no llevan prompt,
  porque pedirle a una IA que lea tus archivos por ti describiría una capacidad que no tiene. Llevan el control
  que hace el trabajo. Razón en `design.md`.
- Exigir que el inventario esté vigente para la palomita saca del estado listo a cualquier proyecto en cuya
  carpeta aparezca un archivo nuevo, sea de la persona o de las etapas de desarrollo. Se conserva la exigencia
  —el inventario de verdad quedó viejo— y lo que se corrige es la palabra: la fila nombra el inventario, no las
  elecciones guardadas, y el paso que lo resuelve revisa esas mismas respuestas contra esa misma carpeta. Bajar
  el umbral para que el estado alcance habría sido el instrumento decidiendo el resultado.
