# Revisión adversarial independiente del registro de decisión

Revisión de un registro de decisión que este revisor **no escribió**, hecha con el supuesto de partida de que
la comparación podía estar construida para llegar a la conclusión que ya se quería. Sigue un playbook local
prestado de otro proyecto: cargar primero el lado de la especificación, después el de la entrega, y refutar en
vez de aprobar por inercia.

El riesgo central que se atacó es el simétrico al que este repositorio ya pagó dos veces en sus mediciones:
**una comparación cuyos criterios favorecen una respuesta no compara, justifica.** Aquí la sospecha se
persiguió en las dos direcciones: que los criterios estuvieran sesgados hacia «no», y que la conclusión fuera
equivocada aunque el razonamiento pareciera honesto.

**Fuentes**: `docs/companion/HOSTED_INFERENCE.md`; `openspec/changes/decide-on-a-hosted-inference-gateway/`
(proposal, design, tasks, brownfield-baseline, issue, delta de spec); `docs/README.md`;
`docs/companion/SECURITY.md`; el código de `apps/companion/`; el historial de ediciones del cuerpo del issue
107 en GitHub; y la evidencia publicada de cambios ya archivados.

---

## Veredicto

**FAIL — 0 blockers, 3 majors, 7 minors.**

Y con una precisión que importa más que la etiqueta: **la recomendación es correcta.** Se construyó el mejor
caso posible a favor del gateway (sección siguiente) y no se sostiene. Los tres majors no reabren la decisión:
dos son sobre **cómo el registro la sostiene** —un número de coste que contradice una medición del propio
repositorio, y un conjunto de opciones incompleto— y uno es sobre el delta de spec, que se contradice a sí
mismo. Ninguno cambia el «no ofrecerlo».

El FAIL es por la regla del playbook —un major abierto basta— y porque los tres se arreglan sin volver a
evaluar nada.

---

## El mejor caso a favor del gateway, construido y puesto a prueba

El documento resuelve el criterio 1 diciendo que el gateway solo ahorra «crear una cuenta gratuita», «un
obstáculo verdadero pero pequeño» (`docs/companion/HOSTED_INFERENCE.md:60-62`). Leído el código, **la fricción
del nivel `provider` no es un obstáculo, son cuatro**:

1. **Crear una cuenta** en Cerebras o Groq.
2. **Teclear a mano el identificador exacto del modelo.** `apps/companion/ui/app.mjs:547-550` pone un campo de
   texto libre con la ayuda «El identificador exacto que usa tu proveedor». Para el nivel `local` la misma
   pantalla ofrece un desplegable con los modelos detectados (`app.mjs:551-552`); para `provider` y `own-key`,
   no hay lista.
3. **Volver a pegar la clave en cada arranque**, por diseño: «No se guarda en ninguna parte. Si cierras la
   aplicación, se pide de nuevo» (`app.mjs:558`), y el servicio lo confirma con `keySaved:false` y la clave
   solo en memoria (`apps/companion/desktop/service.mjs:618, 637-639`).
4. **Ningún sitio en la aplicación dice dónde se consigue una clave gratuita.** `inferenceStatus` devuelve
   `providers:[{id,label,origin}]` y nada más (`service.mjs:620`).

Para el público declarado de este producto —alguien que revisa proyectos **sin terminal**, con un glosario y un
procedimiento de lectura en frío para comprobar que el lenguaje se entiende— «teclea el identificador exacto de
tu modelo» no es fricción pequeña: es una pared. Así que el criterio 1 se contestó contra una línea base
subestimada, y el gateway aporta más de lo que el documento le concede.

**Y sin embargo el gateway sigue perdiendo, por un motivo que el documento no considera.** Si el problema es
esa fricción, existe una cuarta opción que la quita sin nada de lo que hace mala idea al gateway:

- **Pedir la lista de modelos al proveedor con la ruta que el código ya declara.**
  `apps/companion/runtime/inference.mjs:28-31` guarda `models: '/v1/models'` para Cerebras y
  `'/openai/v1/models'` para Groq. Esa ruta **no se usa nunca**: `inferenceStatus` dice explícitamente en su
  comentario «Nothing here talks to a provider» (`service.mjs:613-614`). El mismo patrón ya está construido
  para `local` en `detectLocal()` (`inference.mjs:161-173`), que llena el desplegable.
- Y decir en la pantalla dónde se pide una clave gratuita.

Esa opción **domina a B y a C en los seis criterios**: da casi todo lo del criterio 1, no cambia ninguna
promesa (c2), no mueve datos de terceros (c3), cuesta 0 (c4), no necesita disponibilidad (c5) y no añade
trabajo continuo (c6). El mejor caso a favor del gateway resulta ser, al examinarlo, un caso a favor de **otro
cambio**. Por eso la recomendación sobrevive.

Lo que no sobrevive es la fila «Qué aporta (c1)» de la opción A: **«nada nuevo, y nada falta»**
(`HOSTED_INFERENCE.md:168`). Falta algo —la fricción que el propio documento admite que es real— y no hace
falta un gateway para darlo. Eso es el Major 1.

Los otros dos ángulos del caso a favor se probaron y se caen solos:

- **«La promesa se podría matizar en vez de romper.»** Cierto, y el documento ya escribe cómo
  (`HOSTED_INFERENCE.md:212-215`). Pero el valor de una afirmación sin matices es que no hay que leerla, y tras
  la opción D el beneficio restante del gateway es casi cero. El veredicto del criterio 2 aguanta.
- **«Sin gateway no hay forma de medir el uso real», y el documento pide medirlo antes de dimensionar**
  (`HOSTED_INFERENCE.md:222-223`). Es circular, pero inofensivo: la condición de reapertura no es una medición,
  es que alguien lo pida (`:22-23`).

---

## Auditoría de los criterios: ¿se escribieron antes?

**Sí, y se puede demostrar.** El historial de ediciones del cuerpo del issue tiene exactamente dos versiones
(`userContentEdits.totalCount = 2`, consultado por GraphQL):

| Versión | Fecha | Contenido |
| --- | --- | --- |
| Original | `2026-09-12T10:13:36Z` | 3 024 caracteres. Ya trae **Acceptance Criteria** y **Decision Criteria** —«no ofrecerlo es una respuesta perfectamente buena»—. **No** trae los seis criterios de comparación |
| Enriquecida | `2026-09-13T22:19:09Z` | 10 707 caracteres. Añade los seis criterios y el bloque de readiness |

Los artefactos se escribieron después: `proposal.md` a las 22:21:52, `design.md` a las 22:23:21,
`tasks.md` a las 22:23:37, el delta a las 22:23:59, y `docs/companion/HOSTED_INFERENCE.md` **a las 22:25:11**.
El orden es el que el documento afirma.

Dos matices honestos:

- El criterio que decide —el 1— **no es del autor del documento**: es el `Decision Criteria` que el mantenedor
  escribió el 12 de septiembre, y está preservado palabra por palabra sobre la línea «Historia Original» de
  `issue.md`. Se comparó con el cuerpo original recuperado de GitHub: coincide. Esa es la defensa más fuerte
  contra la sospecha de sesgo, y es verificable.
- Los criterios 2 a 6 se fijaron **seis minutos antes** del documento, en la misma sesión y por el mismo autor.
  Es un orden real, no una congelación independiente. Que la afirmación «escritos antes» sea comprobable hoy es
  un accidente del historial de GitHub, no una propiedad del proceso — y ahí está el tercer punto del Major 3.

**La asimetría estructural que sí existe.** De los seis criterios, un gateway no puede ganar ninguno: el 1 es
una compuerta («qué aporta que los tres no den»), el 5 empata, y el 2, 3, 4 y 6 solo pueden salir peor cuanto
más se haga. No hay ningún criterio que mida **la magnitud** del beneficio. Eso es sesgo de construcción — pero
está declarado, no escondido: el documento dice que el criterio 1 casi resuelve el issue por sí solo
(`design.md:25-26`) y que el caso contra el gateway **no** está en los criterios 4 ni 5
(`HOSTED_INFERENCE.md:177-179`). Un documento amañado habría hecho lo contrario: apoyarse en la cifra de abuso,
que es la más aparatosa. La consecuencia accionable de esta asimetría es el Major 1, y no se cuenta dos veces.

---

## Hallazgos

| Sev. | Área | Hallazgo |
| --- | --- | --- |
| **Major 1** | documento | El conjunto de opciones omite la única que domina al gateway, y la opción A se acredita con «nada falta» cuando falta algo |
| **Major 2** | documento | El supuesto de tokens de entrada es ~4× la medición publicada por este repositorio, y el documento afirma que nada está medido |
| **Major 3** | spec | El delta se contradice a sí mismo, es más estricto que el registro que codifica, duplica un requisito existente y su escenario de proceso no es comprobable |
| Minor 1 | documento | «Degrada al nivel de abajo» describe una cascada que el código no implementa |
| Minor 2 | documento | Falta la tercera superficie donde vive la promesa que se rompería, y la que se cita está mal atribuida |
| Minor 3 | documento | El inventario de «qué viaja» omite tres campos que sí viajan |
| Minor 4 | documento | El único límite que de verdad acota el abuso se queda sin número |
| Minor 5 | docs | El párrafo nuevo de `SECURITY.md` está insertado en la sección que no le toca |
| Minor 6 | artefactos | Faltan `TLDR.md` y `readiness.json`, que los siete cambios archivados sí tienen, y `tasks.md` va 0/24 |
| Minor 7 | documento | La condición de reapertura no nombra el único hecho externo del que depende todo el criterio 1 |

### Major 1 — La comparación no incluye la opción que gana

**Qué está mal.** `docs/companion/HOSTED_INFERENCE.md:166-179` compara tres opciones: A no ofrecerlo, B función
sin servidor, C servidor propio. Falta una cuarta —**bajar la fricción del nivel `provider` que ya existe**— y
es la que domina a B y a C en los seis criterios. Como consecuencia, la fila «Qué aporta (c1)» de A dice «nada
nuevo, y nada falta» (`:168`), que contradice al propio documento cuando admite doce líneas antes que el
obstáculo es «verdadero» (`:61-62`).

**Escenario comprobado.** Una persona sin modelo local enciende `provider`. Además de la cuenta gratuita tiene
que teclear el identificador exacto del modelo en un campo libre (`apps/companion/ui/app.mjs:547-550`) sin
lista de la que elegir, y volver a pegar la clave en cada arranque (`app.mjs:558`;
`apps/companion/desktop/service.mjs:637-639`). El desplegable que le falta se puede llenar con la ruta que
`apps/companion/runtime/inference.mjs:28-31` ya declara por proveedor y que
`apps/companion/desktop/service.mjs:613-623` nunca llama — el mismo patrón que `detectLocal()` ya usa para el
nivel `local` (`inference.mjs:161-173`). No hay ningún issue abierto que cubra esto: los abiertos son 101-104
(landing) y este.

**Qué haría falta.** Añadir la opción D a la tabla con sus siete filas, corregir la fila c1 de A a «falta bajar
la fricción del nivel que ya existe, y eso no necesita un gateway», y abrir el issue de seguimiento. El
veredicto del criterio 1 y la recomendación no cambian: se refuerzan.

### Major 2 — El coste supone 4× lo que este repositorio ya midió

**Qué está mal.** `docs/companion/HOSTED_INFERENCE.md:112-116` dice «**Ninguno está medido**: son estimaciones
declaradas como tales» y acto seguido supone «del orden de 1500 tokens de entrada». El tamaño del cuerpo **sí
está medido y publicado en este repositorio**.

**Escenario comprobado.** `openspec/changes/archive/2026-09-13-compose-project-specific-prompts/evidence/prompts.json`
registra `request.characters = 1228`. Ese número es el **cuerpo completo** de la petición interceptada —la
instrucción de sistema, los siete campos y los parámetros— porque
`apps/companion/scripts/verify-prompts.mjs:101-103` lo calcula como `JSON.stringify(intercepted.body).length`.
1 228 caracteres de JSON en español son del orden de **350 tokens**, no 1 500. El mismo archivo mide la
respuesta real de un modelo local en `modelCharacters: 732`, unos 210 tokens, frente a los 1 200 supuestos
—aunque aquí el supuesto se defiende, porque 1 200 es el tope `MAX_OUTPUT_TOKENS` (`inference.mjs:41`) y un
texto que supere el piso tiene que ser al menos tan largo como la plantilla (`MIN_LENGTH_RATIO = 1`,
`inference.mjs:42`, con `draftCharacters: 2611` medido).

Rehaciendo la tabla con la entrada medida y la salida en su tope (1 550 tokens por composición en vez de
2 700), las tres filas bajan en torno al 43 %: el caso feliz corto a ~310 000, el sostenido a ~3,1 millones y
**el caso de abuso a ~134 millones en vez de 233**. El sesgo va, en las tres filas por igual, en la dirección
que hace parecer peor el abuso. No inclina la comparación A/B/C porque se aplica a todas, pero infla el único
número que un lector se lleva de memoria, y lo hace en el criterio con el que este documento argumenta que el
daño no tiene techo.

**Qué haría falta.** Usar los 1 228 caracteres medidos, cambiar «ninguno está medido» por «el tamaño del cuerpo
está medido; la frecuencia de composición no», y recalcular las tres filas. El veredicto del criterio 4 —el
caso feliz es barato, el abuso es lo que hay que presupuestar— aguanta con los números corregidos.

### Major 3 — El delta de spec se contradice y no es comprobable

Tres problemas en
`openspec/changes/decide-on-a-hosted-inference-gateway/specs/companion-prompt-composition/spec.md`:

1. **Se contradice a sí mismo.** La prosa del requisito (`:4-5`) dice que un nivel «SHALL NOT depend on a
   credential shipped inside the application **or on one machine belonging to the project**». Su propio segundo
   escenario (`:14-17`) dice que un nivel que enrute peticiones por una máquina del proyecto «**SHALL be
   recorded as** making every person who uses it depend on that machine» — es decir, permitido si se declara.
   Una prohíbe, el otro documenta. Y el registro que este delta dice codificar trata la opción C (servidor
   propio) como evaluable, no como prohibida (`HOSTED_INFERENCE.md:166-179`, y «**B** es mejor que **C** si
   alguna vez se hace», `:177`). Archivado así, un lector futuro no puede saber si C está vetada.
2. **Duplica un requisito que ya existe.** «depend only on ... a credential the person supplies» (`:4-5`) es lo
   que ya dice el escenario `No key is required from the maintainer` en
   `openspec/specs/companion-prompt-composition/spec.md:88-90`. Dos fuentes de verdad para la misma regla.
3. **El escenario de proceso no es comprobable.** «the criteria SHALL be written before the options are
   compared» (`:26-29`) no lo puede observar ningún script ni ninguna conducta del producto. El precedente del
   repositorio sí es comprobable: `openspec/specs/companion-evaluation/spec.md:47-51` exige un protocolo
   versionado **con un digest declarado**, y un script lo verifica. Esta vez el «antes» solo se pudo comprobar
   por el historial de ediciones de GitHub, que es suerte, no diseño.

**Qué haría falta.** Decidir si una máquina del proyecto está prohibida o solo hay que declararla, y que prosa
y escenario digan lo mismo; referenciar el requisito existente en vez de reescribirlo; y anclar el «antes» a
algo verificable —los criterios registrados en el issue o en un artefacto versionado antes de que exista la
carpeta del change—.

### Minor 1 — «Degrada al nivel de abajo» no es lo que hace el código

`HOSTED_INFERENCE.md:140-142`, `:145` y `:196`, y `brownfield-baseline.md:54-55`, dicen que un proveedor caído
«degrada al nivel de abajo». El código hace **un** intento al nivel configurado y, si falla, devuelve
`used:'off'` con su motivo (`apps/companion/runtime/inference.mjs:180-213`) y el llamador entrega la plantilla
(`apps/companion/desktop/service.mjs:399-406`). No hay cascada. La expresión viene del spec vigente
(`openspec/specs/companion-prompt-composition/spec.md:70-73`), así que el documento hereda un vocabulario laxo
más que inventarlo — pero en un registro sobre un **quinto** nivel invita a imaginar un repliegue
gateway → own-key → local que no existe. Arreglo: una cláusula que diga «degrada a la plantilla, diciendo por
qué». El veredicto del criterio 5 no cambia: para el público del gateway la plantilla **es** el nivel de abajo.

### Minor 2 — Falta una superficie de la promesa, y la citada está mal atribuida

Las dos frases citadas existen palabra por palabra, comprobadas: «Tus documentos se leen aquí y no se envían a
ninguna IA durante la preparación. No hay cuenta, suscripción ni telemetría» está en
`apps/companion/ui/app.mjs:129`, y «Tus archivos, en este equipo · Sin cuenta» en
`apps/companion/ui/index.html:17` (`id="scope-line"`). Ninguna cita es inventada.

Pero la primera **no está en la pantalla de privacidad**: está en el panel «Qué se queda en este equipo» de
Inicio (`app.mjs:128-131`). La pantalla de privacidad de verdad es el diálogo `showPrivacy()`
(`app.mjs:213-219`), y dice otra cosa que también dejaría de ser cierta: «No tiene cuenta, telemetría ni envío
automático de documentos» (`app.mjs:214`). Falta además `docs/companion/SECURITY.md:17`, que enumera «secreto
de proveedor, telemetría ni envío de documentos». La tarea 2.2 pide las promesas «citadas tal como están hoy en
pantalla»: las citas son fieles, el inventario está incompleto en dos superficies.

### Minor 3 — El inventario de «qué viaja» omite tres campos que viajan

`HOSTED_INFERENCE.md:80-81` enumera perfil, experiencia, rol, objetivo, agentes, pendientes y «un conteo de
archivos por tipo». `shareableFacts` también envía `files.excluded`, `files.complete` y
`files.limitations[].reason` (`apps/companion/runtime/inference.mjs:64-73`). Son siete campos de primer nivel
—el «siete» del documento y del `design.md:48` es correcto, y coincide con
`prompts.json → request.fields`— pero el desglose se queda corto justo en el criterio que trata de qué datos
pasarían por dónde, y se queda corto en la dirección que favorece la conclusión de que la frontera aguanta.
Las rutas **no** viajan: `limitations` se remapea a `{reason, count}` y descarta `path`. Arreglo: enumerar los
tres.

### Minor 4 — El único límite que acota el abuso se queda sin número

El documento admite que un identificador no es barrera, «quien quiera abusar genera mil» (`:190`). Con eso, el
tope de 20 composiciones por instalación y día (`:194-195`) no acota nada: para llegar a los 233 millones de la
tabla bastan ~4 300 identificadores, cuatro veces los mil que el propio documento da por triviales. Quedan dos
controles reales, y el «tope global diario» (`:196`) es el único del lado del código — y es el que se queda sin
valor y sin método para elegirlo. El criterio de aceptación «límites que sobrevivan a alguien que intente
usarlo como API gratuita» se cumple en forma, no en magnitud. Arreglo: dar al tope global un número derivado
del presupuesto, o decir explícitamente que el presupuesto del proveedor es el único límite dimensionado.

### Minor 5 — El párrafo de `SECURITY.md` está en la sección equivocada

`docs/companion/SECURITY.md:149-151` inserta el párrafo sobre niveles de inferencia dentro de «## Frontera de
escritorio (#79)», entre un párrafo sobre recibos e historial y otro sobre copiar y abrir la IA. La sección que
le toca existe: «## Cuando hay un modelo de por medio» (`:78`), que ya explica `asar: false` y que la clave es
de la persona (`:91-94`) — y es justo la que el propio registro señala como modelo de forma
(`HOSTED_INFERENCE.md:213-215`).

### Minor 6 — Faltan dos artefactos, y `tasks.md` va 0/24

La carpeta del change tiene `.openspec.yaml`, `README.md`, `brownfield-baseline.md`, `design.md`, `issue.md`,
`proposal.md`, `tasks.md` y `specs/`. Los **siete** cambios archivados el 12 y el 13 de septiembre tienen
además `TLDR.md`, `readiness.json` y `evidence/`. Ningún script los exige —`openspec validate --all --strict`
pasa sin ellos— pero la ausencia rompe la convención con la que se archivó todo lo demás. (Este revisor creó
`evidence/` para depositar este archivo; `.openspec.yaml` sí estaba, y una primera pasada de esta revisión lo
dio por ausente por listar el directorio sin incluir los archivos ocultos. Queda anotado aquí antes que
corregido en silencio.)

`tasks.md` tiene **0 casillas marcadas y 24 sin marcar**; los dos `tasks.md` archivados que se comprobaron van
15/15 y 27/27. Lo bueno del caso: **ninguna casilla afirma algo que el documento no haga** —el error va en la
dirección segura—. Las tareas 6.3 y 6.4 son legítimamente abiertas: esta revisión es la 6.3, y no existe
ninguna valoración de deuda para este change en `.project-os/debt/assessments/`.

### Minor 7 — La reapertura no nombra el hecho externo del que depende todo

Todo el veredicto del criterio 1 se apoya en que «Cerebras y Groq la dan sin tarjeta» (`:60`;
`brownfield-baseline.md:23`). Si eso deja de ser cierto, `provider` deja de ser un camino de coste cero y el
gateway pasa a ser el único nivel sin instalar ni pagar. La condición de reapertura (`:22-23`) subsume ese caso
—alguien pediría algo que ningún nivel cubre— pero no lo nombra, y es el único hecho del documento que no
controla este proyecto. Arreglo: una línea en «Se reabre si».

---

## Afirmaciones sobre el código, verificadas una por una

| Afirmación del documento | Resultado | Dónde se comprobó |
| --- | --- | --- |
| `asar: false` hace extraíble una clave empaquetada | **Cierta** | `apps/companion/electron-builder.yml:12`, con aserción en `apps/companion/qa/packaging.mjs:44` |
| `LEVELS` son cuatro, con esas etiquetas | **Cierta**, literal | `apps/companion/runtime/inference.mjs:19-25`; la tabla de `:46-51` del documento coincide palabra por palabra |
| `off` es de primera clase y la recomendación de #100 se decide sin modelo | **Cierta** | prueba «a recommendation comes from profile and inventory … and never from a model», verde en `npm test` del companion |
| `shareableFacts` reconstruye campo por campo | **Cierta** | `inference.mjs:54-75`; siete campos, confirmados contra `prompts.json → request.fields` |
| `projectDataIn` compara en NFC y minúsculas | **Cierta** | `inference.mjs:85-98` (`normalize('NFC').toLowerCase()`), con casos en `apps/companion/qa/prompts.mjs:148-153` |
| El borrador y las notas pegadas no viajan | **Cierta** | `shareableFacts` no tiene campo para ellos; `apps/companion/qa/prompts.mjs:322` lo afirma con una nota real |
| `MAX_OUTPUT_TOKENS` es 1200 | **Cierta** | `inference.mjs:41` |
| `PROVIDER_TIMEOUT_MS` es 25000 | **Cierta** | `inference.mjs:40` |
| La degradación con su motivo ya está construida | **Cierta en el fondo, imprecisa en la forma** | `inference.mjs:180-213` y `service.mjs:399-406`: degrada a la plantilla, no al nivel de abajo → Minor 1 |
| «Tus documentos se leen aquí … No hay cuenta, suscripción ni telemetría» | **Cita fiel, atribución laxa** | `apps/companion/ui/app.mjs:129`, panel de Inicio, no el diálogo de privacidad → Minor 2 |
| «Tus archivos, en este equipo · Sin cuenta» en la barra lateral | **Cierta**, literal | `apps/companion/ui/index.html:17` |
| Lo que viaja son siete cosas | **Siete campos sí; el desglose omite tres** | `inference.mjs:64-73` → Minor 3 |
| Un gateway heredaría la degradación «gratis» | **Cierta** | el repliegue es del llamador, no del nivel (`service.mjs:403`) |

Y las dos comprobaciones de alcance que el issue pone como límite:

- **No se construyó nada.** `git diff main --stat` toca exactamente dos archivos: `docs/README.md` (+3/-1) y
  `docs/companion/SECURITY.md` (+4). Ni una línea de `apps/`. `LEVELS` sigue con cuatro entradas,
  `inference.mjs` sin tocar, ningún servidor, ningún dominio, ningún quinto nivel.
- **CI y protección de rama intactos.** `git diff main -- .github/` está vacío.

## Higiene

Búsqueda en los archivos nuevos y modificados de rutas absolutas —de usuario en Windows, de home en Unix y del
directorio de datos de aplicación—, de nombres de cuenta del sistema y de identificadores con forma de UUID de
sesión: **cero coincidencias**.

## Compuertas ejecutadas

| Compuerta | Resultado |
| --- | --- |
| `npm run check` (raíz) | **verde** — 317 tests, 0 fallos |
| `npm test` (`apps/companion`) | **verde** — 129 tests, 0 fallos |
| `npx openspec validate --all --strict` | **verde** — 21/21, incluido `change/decide-on-a-hosted-inference-gateway` |
| `npm run check:docs` | **verde** — 27 enlaces de README, incluido el nuevo a `HOSTED_INFERENCE.md` |

Ningún archivo se mutó durante esta revisión; el único añadido es este documento y su carpeta `evidence/`.

## Lo que no se pudo comprobar, y por qué

- **Que Cerebras y Groq den una clave gratuita sin tarjeta** (`HOSTED_INFERENCE.md:60`,
  `brownfield-baseline.md:23`). Hecho externo; no se hizo ninguna consulta de red y el repositorio no lo
  respalda en ningún otro sitio. Es el supuesto que sostiene el veredicto del criterio 1 → Minor 7.
- **«Cientos de dólares» por un día de abuso y «miles» por un mes** (`:126`). No se cita ninguna tarifa ni
  proveedor, así que no hay nada que recalcular. Con la aritmética del documento el orden es plausible para
  modelos rápidos de gama media y se queda corto para un modelo de frontera; con los tokens corregidos del
  Major 2, baja un 43 %.
- **«Decenas de dólares al mes» de infraestructura** (`:128-129`). Sin fuente ni proveedor; no comprobable.
- **Entre 1 y 5 composiciones por proyecto y persona** (`:116`). Declarado como estimación, y es la única
  parte del modelo de coste que de verdad no está medida en ningún sitio.
- **Si los criterios 2 a 6 se habrían escrito igual sin conocer la conclusión.** Se comprobó el orden de las
  ediciones, no la intención. Lo que sí quedó demostrado es que el criterio que decide es del mantenedor y es
  del día anterior.

## Siguientes pasos antes de archivar

1. Arreglar el **Major 2** (tokens medidos, recalcular las tres filas, corregir «ninguno está medido»).
2. Arreglar el **Major 3** (prosa y escenario de acuerdo sobre la máquina del proyecto; no duplicar el
   requisito existente; anclar el «antes» a algo verificable).
3. Arreglar el **Major 1**: opción D en la tabla, corregir la fila c1 de la opción A, y abrir el issue de
   seguimiento para bajar la fricción de `provider` con la ruta `/v1/models` que el código ya declara.
4. Minors 1 a 5 y 7: cambios de una o dos frases cada uno.
5. Minor 6: `TLDR.md`, `readiness.json`, marcar `tasks.md`, y capturar estos hallazgos en
   `.project-os/debt/` con la categoría que cada uno tenga de verdad (tarea 6.4).

Con los tres majors cerrados, archivar es aconsejable: **la recomendación de no ofrecer el gateway es la
correcta**, y resiste el mejor caso que se pudo construir en contra.
