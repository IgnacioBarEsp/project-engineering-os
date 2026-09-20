# Revisión adversarial — remeasure-retrieval-and-record-flow-comparison

Una ronda, hecha por un agente sin la conversación del apply, en solo lectura. Según
[CONTRIBUTING.md](../../../../../CONTRIBUTING.md), la revisión de un agente sobre trabajo de agentes **no es
revisión humana ni independiente**, y esta no lo es. Las correcciones las verificó quien las hizo, no el
revisor.

| Ronda | Quién | Contexto | Alcance |
| --- | --- | --- | --- |
| 1 | Un agente revisor (Claude Opus 5) | Solo el repositorio y las instrucciones de revisión | `git diff a02c991..HEAD` completo, más los documentos públicos que toca. Recalculó cada cifra publicada contra su registro y ejecutó las pruebas nuevas |

Resultado: **1 Blocker, 7 Majors, 9 Minors y 3 Info**, todos corregidos.

## Blocker

**Cifras publicadas sin registro.** La página y el resultado publicaban «19 de 19» y «18 de 19» marcadores —en
su momento escritos como 9 y 8—, pero el único registro declaraba 8 marcadores y otras cadenas. Los números
salían de una comprobación que hice a mano y nunca guardé: exactamente el defecto que este change denuncia.

Corregido de raíz: el script que mide, [evaluate.mjs](flow-comparison/evaluate.mjs), vive ahora en la
evidencia, y el corpus no se escribe a mano —los marcadores se leen literalmente de las plantillas sembradas—.
La medición se rehízo con él, y las cifras publicadas son las que produce.

## Majors

| # | Hallazgo | Resolución |
| --- | --- | --- |
| 1 | El revisor del benchmark degradaba el ancla en silencio: si el precompromiso no era ancestro, comparaba los archivos congelados contra el propio commit de la corrida, que los contiene por definición | Se comparan **siempre** contra los blobs del precompromiso, que `git rev-parse` resuelve aunque el squash lo dejara fuera del historial |
| 2 | El registro de la revisión decía anclar «a blobs publicados» cuando se ancló a un commit de esta rama, y citaba un orden que no correspondía a esa ancla | El registro dice ahora qué se cotejó contra qué, y separa lo comprobado —contenido— de lo que solo atestigua el PR #113 —el orden— |
| 3 | El comentario afirmaba que cada fila publicada es única por corrida. Es falso en cuatro de las seis: con dos mediciones publicadas, borrar una fila de una tabla la encontraría en la otra | Comentario corregido y comprobación reforzada: las seis filas de la corrida revisada tienen que convivir en **una misma tabla** |
| 4 | `OFFLINE` incluía el nombre del registro de npm, que aparece en casi cualquier error suyo. Un 404 por una versión inexistente daba «NO EJECUTADA» en vez de FAIL | Solo códigos de error de red. Con prueba: un paso que falla citando `registry.npmjs.org` da FAIL |
| 5 | Un doctor con esquema desconocido daba cero comprobaciones, cero FAIL y veredicto PASS: no es «ningún FAIL», es no haber mirado | `readDoctor()`, función pura y probada, distingue no legible, sin lista reconocible, lista vacía y FAIL reales |
| 6 | El resultado decía que los scripts estaban en la evidencia y no había ninguno: la única medición cuantitativa de la prueba 2 no era reproducible | Los dos evaluadores viven ahora en `evidence/flow-comparison/` |
| 7 | Se citaba como marcador colado una cadena literal con su `archivo:línea` que la evaluación nunca sometió al detector | El corpus lee las plantillas, así que la cadena citada es la medida |

## Minors

Corregidos: el árbol `openspec/changes/…` extraviado dentro de `apps/companion/`, commiteado por error con doce
PNG, se eliminó; «162 líneas» comparaba el tamaño de un archivo `.diff` con inserciones reales y pasa a
111 añadidas y 14 borradas frente a 1822 y 4; el descuadre de 11 s en el reloj de la vía B venía de una marca
de inicio mal copiada; «en cada caso» eran 36 de 42; «210 consecuencias» incluía al menos cuarenta defectos
independientes; «lo único que se movió» omitía que la lectura por consulta también cambió; la landing publicaba
el resultado sin nombrar versión, justo lo que exige la spec nueva, y ahora la nombra —con la comprobación
correspondiente en el revisor—; `ancestor()` tragaba cualquier fallo de git como «no es ancestro»; y tres
documentos del change seguían declarando decisiones abiertas que el mantenedor ya había tomado.

## Info

`--evidence` sin `--result-commit` moría con un error de git sin explicación, y ahora lo dice; un comentario en
el bloque del README se ejecutaba como un paso, y ahora se ignora, con prueba; y la tabla del contraste no
aclaraba qué commit es «el corregido».

## Lo que la revisión confirmó

- **La imparcialidad de la comparación de flujos: sin hallazgos.** El digest congelado cuadra, el protocolo
  entró en el repositorio media hora antes de lanzar la primera vía y ningún commit posterior lo toca, y los
  dos prompts difieren solo en la línea de proceso.
- **Las cifras de las pruebas 1, 3 y 4: exactas** contra sus registros.
- El único sesgo numérico que encontró perjudicaba a la vía B, no la favorecía.

## Lo que esta revisión no cubre

- Ninguna persona revisó este change.
- El revisor leyó, recalculó y ejecutó pruebas; no repitió ninguna de las cuatro mediciones.
- Las correcciones a sus hallazgos no las revisó nadie más que quien las escribió.
