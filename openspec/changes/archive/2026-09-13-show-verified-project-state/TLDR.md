# TLDR

Issue [#98](https://github.com/IgnacioBarEsp/project-engineering-os/issues/98).

Quien preparó una carpeta hace dos semanas vuelve y no tiene forma de saber en qué quedó. El mantenedor lo
pidió así: *«cuando los proyectos ya estén listos salgan en verde o con una palomita»*, y *«si el proyecto
detecta que le faltan cosas, que te ponga un apartado en cada proyecto en el que te dé prompts para terminar de
configurar»*.

El issue trae una tensión que hay que nombrar antes de tocar nada: el estado mostrado debe venir de **una
comprobación real, nunca de la presencia de una carpeta**, y esa comprobación son minutos de trabajo que #97
midió y sacó de la lista a propósito. La salida no fue elegir un extremo, sino que **un veredicto es un
registro, y un registro se puede fechar y se puede desmentir barato**.

## Qué hace

- **La comprobación real guarda lo que encontró**, junto al resumen de cada archivo del que dependió. La lista
  relee esos resúmenes —que ya pagaba, porque leer recibos es lo que hacía— y puede decir tres cosas distintas
  y todas ciertas: verificado y nada cambió; verificado pero algo cambió; nunca comprobado.
- **La palomita solo aparece en la primera**, y dice de cuándo es. La comparación **solo puede desmentir**: que
  los resúmenes coincidan no prueba que el proyecto siga listo. Por eso la fila lista dice también lo que no
  cubre —tus archivos, el mapa de código, las herramientas de desarrollo y tu IA— al mismo tamaño que el
  estado.
- **Un proyecto incompleto enumera qué le falta en palabras**, y la palabra depende del motivo: un inventario
  vencido no es lo mismo que unas elecciones sin guardar.
- **La tarjeta abre el proyecto.** No hay un segundo control para abrir, así que tampoco hay un segundo nombre.
  Duplicar y quitar de la lista viven en un menú por fila, y ninguna acción principal vive solo ahí.
- **Duplicar** reusa las respuestas contra una carpeta nueva y no copia nada, porque **no existe ninguna
  operación que copie una carpeta preparada**.
- **«Cómo trabajar en este proyecto»**: primero lo que falta, en orden, y después las formas de trabajar de ese
  tipo de proyecto. Un paso que hace esta aplicación lleva el control que lo hace, no un prompt: pedirle a una
  IA que lea tus archivos describiría una capacidad que no tiene.

## Qué se midió

- **Cinco perfiles en la ventana de la aplicación instalada: 0 hallazgos**, con el guarda de identidad de #97
  intacto. La lista mostró `✓ Listo` en los tres perfiles cuyas etapas esta máquina puede comprobar y
  `Le falta algo` con dos etapas nombradas en los otros dos.
- **Cinco recorridos de navegador: 0 hallazgos** en 36 pantallas, 423 controles de definición, 10 acciones con
  un solo nombre. La guía difiere entre los cinco perfiles, comparada por sus pasos.
- **39 mutaciones de interfaz, 39 detectadas**, en 9 pantallas nombradas una por una, y **11 mutaciones de
  servicio, 11 detectadas**, cada una acreditada a la prueba que falló y no al código de salida.
- **71 ms** para una lista de cinco filas con el testigo releído y una carpeta ilegible.
- Quitar de la lista deja **cada archivo byte a byte idéntico**; duplicar deja la carpeta nueva sin un solo
  artefacto del original, comprobado sobre el disco.

## Una revisión independiente, FAIL, resuelta

Devolvió **FAIL: 1 blocker y 9 majors**. El blocker: el paso que resolvía el estado más común mandaba a la
persona a un asistente en blanco, fuera del proyecto y con los campos borrados. Los majors, en resumen: la fila
decía que faltaban unas elecciones que sí estaban guardadas; el control del mapa de código se ofrecía dos
veces; un veredicto sin etapas o sin testigo llevaba palomita; un registro ilegible rompía la lista y también
abrir cualquier proyecto; un candado abandonado impedía abrir; la marca afirmaba de las herramientas algo que
ningún resumen podía desmentir; palabras del glosario llegaban a la pantalla dentro del bloque de texto para la
IA; y una medición prometida en el `proposal.md` no existía.

Su diagnóstico de fondo vale más que la lista: *las propiedades nuevas se comprobaban solo en los estados que
los arneses alcanzaban*. Los tres que no alcanzaban eran justo donde el cambio se rompía. El arnés de mutación
ahora inspecciona un proyecto de software con el inventario vencido y el mapa desactualizado.

`evidence/independent-review.md` conserva el veredicto completo y todo lo que estaba mal.

## Qué NO demuestra

Nadie leyó la interfaz en frío. Ningún lector de pantalla se condujo. La palomita para software y videojuego no
se demostró de punta a punta, porque esta máquina no completa las etapas de la cadena administrada — la misma
causa que el registro de deuda ya tiene desde #94, anotada como ocurrencia suya en lugar de contarse dos veces.
Diez etapas nativas siguen sin verificar. Nadie usó la interfaz a mano. No se reconstruyó ningún instalador ni
se publicó nada; el núcleo sigue en 0.5.0.
