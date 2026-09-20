# Revisión adversarial — congress-presentation-with-measured-evidence

**Quién.** Un agente (Claude Opus 5 en Claude Code) desde contexto limpio, sin ver cómo se escribió el guion.
**No es revisión humana ni independiente**, y el PR de este change lo dice. Su encargo era el contrario del
habitual: buscar afirmaciones que la evidencia no sostenga y comprobaciones que no puedan fallar.

**Sobre qué.** `git diff 693f9b6..HEAD` —los commits de este change— con la evidencia de #166 como fuente
contra la que recalcular. Recalculó cada cifra de las diapositivas 13 a 19 desde su registro y ejecutó cuatro
pruebas de mutación contra `verify-deck-figures.mjs` en una copia aislada.

**Resultado:** 31 hallazgos — **3 Blockers, 12 Majors, 14 Minors y 2 Info**. Todos los Blockers y todos los
Majors están resueltos. Los Minors resueltos, aceptados o diferidos están abajo, cada uno con su razón.

## Los tres Blockers

### 1. La charla afirmaba una revisión de sí misma que no se había hecho

`docs/presentations/2026-09-24-congreso.md:231` decía que «la revisión adversarial de esta semana encontró un
error en las cifras de esta misma presentación». Ningún registro lo sostenía, y el propio change lo
contradecía: `readiness.json` declaraba `adversarialReview: pending` y este archivo no existía. El escenario
es concreto: el 24 de septiembre se afirma en público una revisión que no se había hecho.

**Resuelto.** La frase salió del guion. La tercera lección de la diapositiva 18 ahora habla de la revisión
adversarial como método, sin atribuirse ninguna sobre este mazo.

### 2. La comprobación de las cifras pasaba con un registro que decía lo contrario

`verify-deck-figures.mjs` comparaba `deck.includes(claim.value)`: bastaba con que el valor recalculado
apareciera **en cualquier sitio** del guion. El revisor lo demostró: puso `legitimateRejected = 32` y
`markersRejected = 16` en el registro —es decir, la vía A no arregló nada— y el script seguía diciendo
`PASS`, porque «2 de 34» y «16 de 19» estaban en la columna «Sin arreglar» de la misma tabla. Con la misma
mecánica, un archivo de cinco renglones sin una sola diapositiva pasaba 16 de 16.

**Resuelto.** Cada afirmación declara ahora en qué diapositiva vive, el guion se parte por diapositivas y la
cifra se busca **solo dentro de la suya**, comparando cadena contra cadena. Se añadieron reglas
estructurales: veinte diapositivas numeradas, la de límites, la de procedencia, el resultado adverso dentro
de la 17 y el microcorpus dentro de la 16. Pasa **26 de 26**; cambiando el guion a «12 de 20» falla.

### 3. El archivo que se proyecta no era el que se comprobaba

`build-deck.mjs` no lee el guion: el texto de cada diapositiva está escrito dentro del generador.
`deck-build.md` afirmaba lo contrario —«generado desde el guion versionado, no escrito a mano por segunda
vez»—. La consecuencia estaba medida, no era teórica: el `.pptx` **ya divergía** en cuatro sitios, y **no
tenía diapositiva de procedencia**, que es justo el `SHALL` de la spec delta de este change.

**Resuelto en tres partes.**

1. La afirmación falsa se corrigió, y `deck-build.md` explica ahora qué es el generador y qué riesgo trae.
2. Las cuatro divergencias se alinearon con el guion, y el `.pptx` pasó de 21 a **22 diapositivas** con la de
   procedencia dentro.
3. El riesgo no se puede quitar sin reescribir el generador, así que **se comprueba**: `check-deck-figures.py`
   extrae toda cifra de cada diapositiva y de sus notas y exige que esté en el guion. 90 cifras, 0 problemas.
   Mutando el generador —`45 de 2654` por `4711 de 2654`— la comprobación falla y nombra la diapositiva.

## Los doce Majors

| Dónde | Qué decía | Qué se hizo |
| --- | --- | --- |
| Guion 227 | «encontró **360**» presentaba como hallazgos las entradas de un diff | Ahora: **66 problemas distintos** en **23 combinaciones**, **360 renglones** |
| Guion 229 | «siete botones… porque una barra los tapaba»: 6 de los 42 renglones dicen `button.primary`, y dos de los siete no son botones | Ahora: «siete **controles**», y «en **seis de los siete**, lo que los tapaba era la barra de acciones» |
| Guion 139 | Entrecomillaba como «el párrafo que recibió» un texto que nadie recibió, y decía que los dos prompts eran idénticos | Ahora se cita el párrafo **literal** de `prompt-via-a.md`, y se dice cuál es la única línea que añade la vía B |
| Guion 211 | «indexó 45 de 2654» explicaba el 0 de 20 de **dos** repositorios con el dato de uno | Ahora las dos coberturas: 45 de 2654 en Kubernetes y **42 de 2753** en CPython |
| Guion 202 | «las mismas **tres** formas de buscar» sobre una tabla de **dos** filas: faltaba la línea base ingenua | Añadida la fila «Abrir todo el corpus, **20 de 20**», en el guion y en la diapositiva |
| Guion 307 | La regla de procedencia la rompía el propio guion: seis cifras sin fila | Las seis tienen fila: `30000-32767`, 2 y 28 archivos, 6812 bytes y diez preguntas, el barrido literal y las veinte preguntas congeladas |
| `verify:62-64` | `arranque-pasos` no miraba ni «seis pasos» ni «29 comprobaciones» | Las dos se comprueban contra `documented-start.json` |
| `verify:54-55` | Solo leía la cobertura de Kubernetes | Dos afirmaciones, una por repositorio |
| `verify:71-78` | Comprobaba presencia de subcadenas: pasaba sobre un archivo sin diapositivas | Reglas estructurales y cifras atadas a su diapositiva |
| `verify:86-88` | La regla simétrica no podía fallar: «0 de 20» aparece cinco veces, dos fuera de la 17 | Se comprueba dentro de `slide(17)` y `slide(16)` |
| `deck-build.md:38-42` | Tres resultados de verificación sin ninguna salida capturada | [geometry.txt](geometry.txt) y [deck-figures-in-pptx.json](deck-figures-in-pptx.json) |
| `check-geometry.py:39` | El barrido de solapes excluía **imágenes y tablas**, justo donde el defecto pasa inadvertido | Ahora entran las tres clases de forma; la diapositiva 19 tiene dos imágenes junto a cuatro bloques |

## Los Minors, uno por uno

**Corregidos:** «111 líneas» y «1822 líneas» omitían las borradas (ahora 111/14 y 1822/4, en el guion y en el
mazo); «un fallo que llevaba **meses** ahí», que ningún registro fecha (ahora «que nadie había visto», también
en el generador, donde había sobrevivido); el recuento de diapositivas, incoherente entre seis documentos
(ahora **22** en todos); las filas 18 y 19 de la tabla de procedencia decían «el mismo change» apuntando al
archivo de #166 (ahora la tabla declara la ruta del archivo una vez y marca esas filas con `#166`); la
diapositiva 6 ilustraba una buena recuperación con la pregunta del NodePort, que es una de las veinte que el
producto **no** respondió (ahora lo dice, y remite a la 17); `verify-deck-figures.mjs` moría con un
`TypeError` sin argumentos (ahora sale con código 2 y un mensaje de uso); el comentario de
`check-geometry.py` anunciaba un margen distinto del que aplicaba; `text[:40]` servía a la vez de mensaje y
de filtro; la ruta absoluta con el nombre de la cuenta en `build-deck.mjs` (ahora el repositorio es un
argumento); `W = 13.3` frente a los 13.333 reales de `LAYOUT_WIDE`; y `check.json`, capturado con cinco
archivos sin commitear.

**Aceptados, con su razón:**

- `verify-deck-figures.mjs` corta las etiquetas de control por `': '`, que se rompería con una etiqueta que
  contuviera ese separador. Se acepta porque el corpus está congelado y porque el script **afirma** que salen
  exactamente siete controles distintos: si el corte fallara, la comprobación fallaría, no mentiría.
- `version-medida` enseña una frase —«la versión publicada de hoy»—, no una cifra. Se acepta: su `check`
  ata esa frase a dos registros, la versión medida en `measurement.json` y la publicada en `EVIDENCE.md`.
- `pptxgenjs` no está en `package.json` y el `.pptx` no se versiona. Se acepta: es un binario derivado y la
  fuente de verdad es el guion. Un checkout limpio puede reconstruirlo instalando `pptxgenjs` aparte, y el
  SHA-256 del archivo entregado está publicado para contrastarlo.
- Los dos **Info**: que la diapositiva 19 enumere aciertos que la de límites dice que no se midieron va
  enmarcado como objetivo y como apuesta, no como resultado; y el rango del ensayo de rollback, que dejaba
  fuera su propio commit, se volvió a ejecutar sobre el rango completo.

## Lo que la revisión dio por bueno

Recalculadas y correctas: 33/34, 19/19, 34/34, 18/19 y la base 2/34 y 16/19; 524 094 ms = 8 min 44 s y
1 863 214 ms = 31 min 3 s; 2 y 28 archivos; 8/10, 8/10, 10/10 y 6812 bytes; 0+0 de 20 y 10+10 de 20; la
versión 0.3.2 y «cuatro días antes»; seis pasos con código 0 y 29 comprobaciones sin fallos; y las tres
capturas con sus SHA-256 contra `SCREENSHOTS.md`. Sin hallazgos en `readiness.json` frente a `tasks.md`, en
la spec delta, ni en los cuatro registros de validación, que son ejecuciones reales con código 0. Tampoco
encontró condiciones invertidas ni errores tragados en los scripts.
