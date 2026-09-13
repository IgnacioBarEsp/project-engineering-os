# Revisión adversarial independiente

Conducida por una sesión que **no** implementó este cambio, con un playbook local prestado para revisión
adversarial. El veredicto completo se conserva abajo tal como llegó, incluido todo lo que estaba mal, y cada
hallazgo va seguido de qué se hizo con él.

**Veredicto: FAIL — 1 blocker y 9 majors**, más 7 minors y una pregunta.

La revisión corrió `npm run check` (317/0), `apps/companion npm test` (89/0), `npm run evidence:mutations`
(6/6), `openspec validate --all --strict` (20/20), un barrido de caracteres de retroceso y otro de rutas
absolutas, abrió las siete capturas PNG una por una, y escribió cinco sondas propias contra el renderer real y
contra el servicio real. Restauró todo lo que tocó.

Lo que la revisión reconoció explícitamente, porque importa para juzgar el resto: el arnés de mutaciones de
servicio **acredita la detección a la prueba que falló y no al código de salida**, que es la corrección del
defecto que una revisión anterior encontró; el umbral de la palomita está declarado por perfil y argumentado; y
la decisión de no bajar la exigencia del inventario se tomó en contra de la conveniencia. Su conclusión sobre
por qué el cambio aun así falla merece citarse:

> Lo que falla es otra cosa: **las propiedades nuevas se comprueban solo en los estados que los arneses
> alcanzan**, y los tres estados que no alcanzan (mapa de código desactualizado, inventario vencido por un
> archivo de la persona, herramientas administradas retiradas) son justo donde el cambio se rompe.

---

## Blocker

### El paso que resuelve el estado más común mandaba a la persona a un asistente en blanco

El paso `base` de la guía ofrecía la acción `prepare-project`, que **abandona el proyecto y abre el asistente
vacío**: nombre y objetivo en blanco y perfil reseteado. La revisión lo comprobó con una sonda contra el
renderer real: tras hacer clic en el control del paso, `h1 = "Empecemos por lo que quieres lograr."`,
`name=""`, `goal=""`, `profile checked = research`. Los recorridos de navegador **renderizaban ese paso** para
software y videojuego, y solo comprobaban que existiera *algún* control.

**Resuelto.** La guía enruta ese paso a `resave-base`, una acción declarada nueva que revisa las respuestas ya
guardadas contra esa misma carpeta y muestra el plan como cualquier otra preparación. Solo un proyecto que
nunca tuvo respuestas (`profile` nulo o `not-prepared`) empieza el asistente. Lo protegen una prueba
(`a project whose answers are already saved is never sent to a blank wizard`, que además comprueba el caso del
proyecto sin respuestas) y una mutación de servicio
(`the-guidance-sends-a-prepared-project-to-a-blank-wizard`).

---

## Majors

### 1. La fila decía que faltaban unas elecciones que sí estaban guardadas

Añadir **un archivo cualquiera** a la carpeta saca al proyecto de listo —correcto— pero la fila lo enunciaba
como «Le falta algo: tus elecciones guardadas», que es falso. Lo vencido es el inventario. El `design.md`
justificaba la exigencia solo para el caso de software y nunca confrontaba el caso que domina.

**Resuelto.** La fila lleva ahora la etapa **y su motivo**, y la palabra depende del motivo: para
`inventory-stale` nombra el `Inventario` con su propio término de glosario, no una paráfrasis. El título del
paso correspondiente cambia igual («Tu carpeta cambió desde que se miró por última vez»). El `design.md` y
`states-and-degradations.md` corrigen la justificación para el caso general.

### 2. El control del mapa de código se ofrecía dos veces en la misma pantalla

Con un mapa `stale`, `corrupt` o `requires-repair`, el paso de la guía y el panel del mapa ofrecían ambos
`review-code-map`. `once()` se había aplicado a `read-files` y `review-development` y no a este. Ningún arnés
alcanzaba ese estado.

**Resuelto.** `once('review-code-map')` en el panel. Y el arnés de mutación ahora **sí alcanza ese estado**: su
proyecto de prueba es de software, con `code.status='stale'`, `capabilities.codeGraph=true` e inventario
vencido, así que la pantalla del proyecto que inspecciona es la que tiene los tres pasos. La mutación
`the-code-map-control-offered-twice-on-one-screen` lo comprueba.

### 3. Un veredicto sin etapas o sin testigo llevaba palomita

`missing` se calculaba desde `verdict.stages` sin contrastarlo contra `verdict.required`, y `validVerdict`
aceptaba `stages: []` y `witness: []`. Un veredicto con etapas requeridas y sin entradas de etapa mostraba
verde; uno con testigo vacío era **verde permanente e infalsificable**. La spec dice literalmente que una etapa
ausente cuenta como no lista.

**Resuelto.** `validVerdict` exige que cada id de `required` aparezca en `stages`, que `witness` no esté vacío y
que `at` sea una fecha legible. Tres mutaciones de servicio nuevas y una prueba
(`a verdict that could never be disproved, or that is missing a required stage, is refused`).

### 4. Un registro de veredictos ilegible rompía la lista y también abrir cualquier proyecto

`states-and-degradations.md` publicaba que se degradaba a «sin veredicto». Solo era cierto para el caso de
forma JSON: un archivo de 9 MiB, o un directorio en su lugar, hacía que la lectura lanzara **fuera** del
guardia por fila. Además los topes elegidos (50 × 400 × rutas de 512 caracteres) excedían el tope de escritura
de 8 MiB, así que el propio almacén podía negarse a escribirse.

**Resuelto.** Cualquier fallo de lectura degrada a «sin veredicto». Los topes bajaron a 200 entradas de testigo
y 256 caracteres por ruta, y el archivo se recorta hasta caber en los 8 MiB que el lector acepta. Una prueba
escribe los 9 MiB y comprueba que la lista y la apertura siguen funcionando; una mutación reintroduce el
defecto. La fila de la tabla dice ahora qué casos se midieron.

### 5. Un candado abandonado impedía abrir cualquier proyecto

Escribir el veredicto dentro de `status()` hacía que un `write.lock` olvidado en el directorio de datos de la
aplicación convirtiera cada «abrir proyecto» en `BUSY`. `recoverAbandonedLock` existe en el código pero no se
invoca desde ningún sitio, así que no había salida desde la interfaz.

**Resuelto.** Guardar el veredicto es de mejor esfuerzo: si falla, la comprobación responde igual, el estado
lleva `saved:false` con su causa, y la fila conserva el último veredicto que sí se guardó con su fecha. Cubre
también un directorio de datos de solo lectura. Prueba y mutación propias.

### 6. La palomita afirmaba algo que ningún testigo podía desmentir

Para software y videojuego la marca afirma «las herramientas administradas preparadas», pero el testigo de esa
etapa es un solo recibo dentro de la carpeta: la cadena vive fuera. Borrado el runtime, la fila seguía diciendo
«✓ Listo». La aclaración enumeraba tres exclusiones y no esta.

**Resuelto.** La frase de la fila nombra las herramientas de desarrollo entre lo que no comprueba, y solo en
los perfiles que las necesitan. `design.md`, `EXPERIENCE.md` y `states-and-degradations.md` pasan de dos
límites a tres.

### 7. Palabras del glosario llegaban a la pantalla dentro del bloque de texto para la IA

`UNDEFINED_VOCABULARY` excluye `pre` por tipo de elemento, y `guide.terms` solo se calculaba sobre título y
motivo. En un proyecto de investigación, `cita` y `firma` estaban visibles sin ningún control que abriera su
definición y ninguna sonda se quejaba. Es la misma clase de ruta de escape que el `placeholder` y el
`aria-label` de la revisión anterior.

**Resuelto.** `glossaryIdsIn` recorre también `step.prompt`, así que el panel ofrece las definiciones de las
palabras que ese texto usa, y la prueba de palabras prohibidas recorre los prompts además de los títulos.

### 8. Una medición prometida que no existía

`proposal.md` y `design.md` declaraban como mitigación «medir la lista con una fila inalcanzable y reportar el
tiempo». Ningún artefacto contenía ese número.

**Resuelto.** La prueba `the list stays inside its budget with several projects, one of them unreadable` mide y
**imprime** el número: cinco filas, cuatro con testigo completo y una ilegible, **71 ms** con un presupuesto de
1500 ms por fila. El número se lee de la corrida, no se calcula.

### 9. Faltaban artefactos para poder archivar

34 tareas sin marcar, sin `TLDR.md`, sin `readiness.json`, sin este archivo, y sin entradas en el registro de
deuda pese a que el propio `design.md` registraba un hallazgo.

**Resuelto.** Los cuatro artefactos existen y el registro de deuda lleva lo que corresponde.

---

## Minors

| Hallazgo | Qué se hizo |
| --- | --- |
| `validVerdict` no validaba que `at` fuera una fecha: con una ilegible, la fila mostraba la palomita junto a la frase que dice que el estado no viene de una comprobación | Resuelto: `Date.parse` en la validación, con su caso en la prueba |
| El patrón reparado se publicó como `\bl[íi]der\b` y el código real tenía un espacio dentro de la clase (`[í i]`), sobreviviente de la reparación del `0x08` | Resuelto: clase corregida en `verify-landing.mjs` |
| `interface-contract.json` publicaba `screens: 10` como cinco medidas más una constante `+5` | Resuelto: el registro nombra las pantallas contadas una por una y el total sale de esa lista |
| `states-and-degradations.md` citaba una mutación de acciones de fila para una propiedad de la guía | Resuelto: cita corregida |
| No había mutación que dejara una acción principal **solo** dentro del menú | Resuelto: `the-only-way-to-open-a-project-moves-into-the-secondary-menu`, y el probe dejó de considerar que una tarjeta abre el proyecto cuando su control está dentro de un desplegable |
| La palomita para software y videojuego nunca se demostró de punta a punta | Registrado en «lo que no se midió»: en las dos mediciones esos perfiles terminan en `incomplete` porque esta máquina no tiene la cadena administrada, y el umbral para ellos solo está cubierto por la prueba unitaria |
| Duplicar prellena el nombre idéntico al original | Decisión registrada en `design.md` y en `EXPERIENCE.md`: es la respuesta que dio la persona, el campo está editable antes de escribir nada, y las filas se distinguen por su carpeta |
| El escenario de spec decía que **la fila** ofrece el siguiente paso | Corregido: la fila enumera, y abrir el proyecto ofrece el paso. El issue no pide lo primero; era una afirmación mía más amplia que su criterio |

## Pregunta

La revisión notó que `docs/volantedepago.pdf` y `docs/CONASIE_Emprendimiento_LLENO.docx` están versionados en
`main` y suenan a documentos personales. No los abrió. **Queda para el mantenedor**: no pertenecen a este
cambio, ninguno se toca aquí, y sacarlos del repositorio es una decisión suya.

## Sin verificar, con su causa

- Nadie leyó la interfaz en frío y ningún modelo ocupó ese lugar.
- Ningún lector de pantalla se condujo.
- La revisión no reconstruyó el instalador ni corrió los recorridos nativos contra la ventana instalada, ni el
  arnés de contrato completo; verificó sus artefactos y su lógica de atribución en su lugar. Las tres cosas sí
  se corrieron en esta rama, y sus registros están en este directorio.

---

## Veredicto de la revisión, íntegro

**FAIL** — 1 Blocker y 9 Majors. Los nueve pasos que pidió antes de archivar están hechos: reenrutar el paso
`base`, decidir y registrar qué dice la fila con el inventario vencido, `once('review-code-map')` más un estado
con mapa desactualizado en el arnés, cerrar el hueco de `validVerdict` con su mutación, degradar la lectura del
registro y hacer la escritura de mejor esfuerzo reconciliando los topes, añadir la cadena de herramientas a la
frase de exclusión, cerrar la ruta de escape del `<pre>`, publicar la medición de la lista, y completar los
artefactos.
