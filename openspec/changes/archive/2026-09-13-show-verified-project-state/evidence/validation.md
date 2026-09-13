# Validación — estado verificado por proyecto

Todo lo de aquí se ejecutó en esta rama. Cada número viene de la corrida cuyo archivo se nombra, no de una
suma hecha a mano. Lo que la revisión adversarial independiente encontró está en `independent-review.md`, con
lo que se hizo de cada cosa; aquí quedan las mediciones ya con esas correcciones dentro.

## Puertas

| Comprobación | Resultado |
| --- | --- |
| `npm run check` (raíz) | **317 pruebas, 0 fallos** |
| `apps/companion` `npm test` | **94 pruebas, 0 fallos** |
| `apps/companion` `npm run evidence:mutations` | **11 mutaciones, 11 detectadas**, fuente restaurada |
| `apps/companion` `npm run evidence:contract` | **39 mutaciones, 39 detectadas**, 1 sonda de construcción sostenida |
| `openspec validate --all --strict` | **20 de 20** |
| `npm run evidence:landing` | PASS, con los patrones de afirmación prohibida reparados (abajo) |
| `debt check` | PASS, plan en **4/5** |

## Los cinco recorridos en la ventana instalada

`evidence/native-journeys.json`. **5 perfiles, 0 hallazgos, 10 etapas sin verificar** con las mismas causas de
la línea base archivada. El arnés se niega a correr contra una instalación que no sea esta rama; se sincronizó
con `--sync-app` y volvió a medir.

Lo que este cambio añadió a esa medición, leído de la ventana instalada:

- **La fila, antes de abrir el proyecto**: la marca solo donde el estado es verificado, la aclaración al mismo
  tamaño que el estado, ningún código interno, la tarjeta como el control que abre y ninguna acción principal
  solo dentro del menú. Se comprobó en cada recorrido con `READY_CLAIMS` y `ROW_MENUS`.
- **La fila, después de leer los archivos**: el último recorrido dejó cinco proyectos en el historial y la
  lista mostró `✓ Listo` en los tres perfiles cuyas etapas esta máquina puede comprobar —investigación,
  contenido y trabajo general— y `Le falta algo` en software y videojuego, cada uno nombrando **dos** etapas
  pendientes. La palomita es alcanzable y se niega donde las etapas no están.
- **La guía dentro del proyecto**: 4 pasos para investigación, contenido y trabajo general; 6 para software y
  videojuego. Cada guía declaró los términos que usa —incluidos los que aparecen dentro del texto para la IA,
  que es la corrección de un hallazgo de la revisión: `cita` en los cinco perfiles, `openspec`, `recuperación`,
  `deuda` y `revisión adversarial` en software, `SDD` en videojuego, `receta` en contenido— y la pantalla
  ofreció sus definiciones.

`native-proyectos.png` es esa lista, con las cinco rutas ancladas (`pathElements: 5, anchored: 5, leaking: 0`).

## Los cinco recorridos de navegador

`evidence/browser-evidence.json`. Renderer y motores reales, capacidades nativas inyectadas. **36 pantallas,
0 hallazgos**, **423 controles de definición** comprobados contra el término que abren, **10 acciones
navegables** con un solo nombre cada una.

- Estado por fila medido: `research=verified, software=incomplete, unity=incomplete, media=verified,
  general=verified`. Software y videojuego no llegan a listo aquí porque esta instalación no tiene la cadena de
  herramientas administrada, y la fila lo dice en lugar de callarlo.
- **La guía difiere entre los cinco perfiles**, comparada por sus pasos y no por el panel: un texto que
  cambiara solo por el nombre del proyecto haría parecer distintos a dos proyectos sin que nada de su trabajo lo
  fuera. Por eso los textos que se entregan a una IA no nombran carpeta ni proyecto.
- **Romper una etapa de un proyecto verificado, desde la interfaz**: se deshizo la lectura de archivos con el
  control de recuperación, la guía ganó el paso que faltaba, y la lista dejó de mostrar la palomita y nombró
  «la lectura de tus archivos».
- **Duplicar**: se eligió otra carpeta, el asistente llegó con las respuestas del original ya puestas y
  editables, y **no había nada escrito en la carpeta nueva** antes de aprobar el plan, comprobado sobre el disco
  (`ENOENT` en `.project-os/companion/receipt.json`).
- **Copiar un paso**: el texto que llegó al portapapeles es el que compuso la aplicación, y no contiene ninguna
  ruta absoluta.

## Los dos arneses de mutación

Una prueba que sobrevive a reintroducir el defecto no prueba nada.

**Interfaz** — `evidence/interface-contract.json`: **39 mutaciones deliberadas, 39 detectadas por la propiedad
que cada una nombra**, más **1 sonda de construcción** que se sostuvo. Las pantallas se cuentan por nombre y no
con una constante: `inicio`, `ayuda`, `asistente`, `tus proyectos`, `mi proyecto`, `diálogo de un término`,
`ancho mínimo`, `lista vacía` y `lista con error`. Dieciséis mutaciones son nuevas de este cambio, y la
pantalla del proyecto entra por primera vez al arnés, con un proyecto de software cuyo inventario está vencido
y cuyo mapa de código quedó desactualizado — los estados que la revisión señaló como no alcanzados.

| Mutación nueva | Lo que reintroduce |
| --- | --- |
| `a-ready-mark-on-a-project-that-is-not-ready` | la palomita en una fila que no está lista |
| `a-ready-row-that-stops-saying-what-it-did-not-check` | la fila lista deja de decir que no vuelve a leer los archivos |
| `the-qualifier-made-smaller-than-the-state-it-qualifies` | la aclaración dibujada más chica que el estado |
| `a-row-that-stops-saying-when-it-was-checked` | un estado que viene de una comprobación sin su fecha |
| `an-internal-name-where-a-stage-should-be-named` | el identificador interno de la etapa en la pantalla |
| `a-row-that-stops-naming-what-is-missing` | «le falta algo» sin decir qué |
| `the-only-way-to-open-a-project-moves-into-the-secondary-menu` | la única forma de abrir, dentro del menú |
| `the-code-map-control-offered-twice-on-one-screen` | el control del mapa de código ofrecido dos veces |
| `opening-a-project-offered-again-under-another-name` | abrir con un segundo nombre dentro del menú |
| `the-card-stops-being-the-control-that-opens-the-project` | la tarjeta deja de abrir el proyecto |
| `a-row-action-outside-the-declared-set` | una acción de fila sin declarar |
| `the-same-row-action-in-two-controls-of-one-card` | la misma acción dos veces en una tarjeta |
| `a-guide-step-without-its-reason` | un paso de la guía sin motivo |
| `a-guide-step-whose-text-cannot-be-copied` | texto para la IA sin forma de copiarlo |
| `a-guide-that-drops-the-definitions-of-its-own-words` | palabras del glosario sin definición alcanzable |
| `the-same-action-in-two-controls-of-one-screen` | la misma acción ofrecida por dos controles |

La última existe porque el arnés de recorridos la encontró primero: al hacer clic en «Leer mis archivos» el
selector resolvió a **dos** controles, porque la guía ofrecía el paso pendiente y otro panel ofrecía la misma
acción. Un control por acción y por pantalla pasó de ser un descuido a ser una propiedad comprobada, con el
alcance acotado al contenido: la navegación persistente es otra región, y quitar la acción principal de Inicio
porque la barra lateral lista ese destino sería una pantalla peor, no más clara.

**Servicio** — `evidence/service-mutations.json`, `npm run evidence:mutations` (nuevo). Ninguna mutación de
pantalla alcanza lo que decide el estado, así que hay un arnés para eso: parcha el archivo real del servicio,
corre la suite contra cada parche y restaura la fuente incluso si falla. **11 mutaciones, 11 detectadas**, y la
detección se atribuye a **la prueba que falló**, nunca al código de salida: un arnés que se cuelga produce el
mismo código, y una revisión anterior de este repositorio encontró tres mutaciones acreditadas exactamente así.

| Mutación | La prueba que la atrapó |
| --- | --- |
| el testigo nunca reporta un cambio | a ready row stops being ready when a file the check depended on changes |
| el veredicto se acepta sin comprobar su carpeta | a verdict does not travel to another folder |
| un testigo truncado puede mostrarse como listo | a verdict does not travel to another folder and a truncated witness is never ready |
| la palomita ignora el inventario desactualizado | the ready mark is refused whenever a required stage is not ready |
| la guía deja de rechazar una copia vencida | the guidance says what is missing, differs between projects, and refuses a stale copy |
| un veredicto sin la etapa requerida se acepta | a verdict that could never be disproved, or that is missing a required stage, is refused |
| un veredicto sin testigo se acepta | a verdict that could never be disproved, or that is missing a required stage, is refused |
| un registro ilegible se lleva la lista | a verdict store that cannot be read degrades instead of taking the list and the project with it |
| no poder guardar el veredicto tumba la comprobación | a check still answers when this application cannot write its own record |
| la guía manda a un asistente en blanco | a project whose answers are already saved is never sent to a blank wizard |
| una etapa que no reportó nada cuenta como lista | the ready mark is refused whenever a required stage is not ready |

## El tiempo de la lista, medido

`the list stays inside its budget with several projects, one of them unreadable`: cinco filas, cuatro con su
testigo completo releído y una cuya carpeta ya no existe, **71 ms** con un presupuesto de 1500 ms por fila. La
prueba **imprime** el número además de acotarlo, así que se lee de la corrida en lugar de calcularse. Una fila
en una unidad de red de verdad no estaba disponible para medir; el límite en sí lo comprueba la prueba del
presupuesto con una lectura que no responde nunca.

## Un defecto encontrado de paso, y lo que no fue

Buscando caracteres de retroceso en los archivos que toqué —el escape que un heredoc convierte en `0x08`—
aparecieron **20 en dos archivos**: 6 en `interface-contract.mjs`, introducidos por mí en esta sesión, y **14
preexistentes en `scripts/verify-landing.mjs`**, en `HEAD`.

En la landing, siete de los quince patrones que rechazan una afirmación sin respaldo tenían un `0x08` donde
debía ir un límite de palabra, así que **no podían coincidir con nada**. Se corrigieron y **la landing sigue
pasando**. Eso importa decirlo con precisión: no se ocultaba ninguna afirmación prohibida; lo que había era una
comprobación que no podía encontrarla. El defecto era del instrumento, no del producto, y el resultado tras
repararlo es el mismo que antes — que es justamente lo que permite afirmar que la landing estaba limpia.

La revisión encontró además que uno de los patrones reparados quedó con un espacio dentro de su clase de
caracteres (`[í i]`), sobreviviente de la misma reparación. Corregido. Un barrido del repositorio completo
después: **cero caracteres de retroceso**.

## Pruebas nuevas y qué propiedad protege cada una

`apps/companion/qa/project-list.mjs` (16 pruebas):

- el veredicto de la última comprobación real por fila, y una fila rota que no se lleva el resto;
- una fila lista que deja de serlo cuando cambia un archivo del que dependió, nombrando la etapa, y que
  **vuelve** a estarlo si se restauran los bytes exactos —la comparación es de contenido, no de fecha—;
- un veredicto que no viaja a otra carpeta, uno con el testigo truncado, uno **sin etapas requeridas**, uno
  **sin testigo** y uno **con fecha ilegible**: ninguno sostiene la marca;
- un archivo de veredictos irreconocible **y uno de 9 MiB** degradan a «sin comprobar» en vez de romper la
  lista o impedir abrir el proyecto;
- un candado abandonado en el directorio de datos no impide comprobar: el estado dice que no se pudo guardar,
  con su causa, y la fila conserva el veredicto anterior con su fecha;
- quitar de la lista deja **cada archivo byte a byte idéntico**, comparando el árbol completo antes y después;
- duplicar no deja artefactos del original y la preparación nueva lleva sus propios resúmenes;
- la guía enumera lo pendiente, difiere entre proyectos, rechaza copiar un paso local y rechaza copiar cuando
  el proyecto cambió;
- un proyecto con respuestas guardadas **nunca** se manda al asistente en blanco, y uno que nunca las tuvo sí;
- la guía compuesta no usa ninguna palabra prohibida en los cinco perfiles —incluido el texto para la IA— y
  declara los términos que sí usa;
- la palomita se niega ante cualquier etapa requerida que no esté lista, incluida una que no reportó nada
  reconocible;
- el tiempo de la lista, impreso.

`test/companion-language.test.mjs` gana la construcción de las acciones de fila: la tabla cerrada, que `rowBtn`
no acepte etiqueta, y que ninguna acción de fila se declare a mano fuera de ese constructor. Sus frases de
límite fijadas incluyen ahora las cuatro que este cambio añade.

## Lo que no se midió

- **Nadie leyó la interfaz en frío**, y ningún modelo ocupó ese lugar.
- **Ningún lector de pantalla se condujo**; `keyboard-and-assistive-technology.md` dice dónde está la línea.
  En particular, nadie escuchó si el nombre de un proyecto seguido de «Abrir este proyecto» se lee como un
  control o como dos.
- **La palomita para software y videojuego no se demostró de punta a punta.** En las dos mediciones esos
  perfiles terminan incompletos, porque esta máquina no completa las etapas de la cadena administrada; el
  umbral para ellos solo está cubierto por la prueba unitaria de `stageReport`. La causa es la que el registro
  de deuda ya tiene desde #94, y se anotó como ocurrencia suya en lugar de contarla dos veces.
- **Diez etapas nativas siguen sin verificar**, con las causas que el registro nombra.
- **Nadie usó la interfaz a mano**: todo recorrido lo condujo un arnés.
- No se reconstruyó ningún instalador ni se publicó nada. El núcleo sigue en 0.5.0.
