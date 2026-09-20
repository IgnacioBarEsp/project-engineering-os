# Plan de evidencia — remeasure-retrieval-and-record-flow-comparison

Qué va a producir cada prueba, dónde se guarda y qué tendría que ocurrir para que fallara. Escrito antes de
ejecutar, para que el resultado no elija su propio criterio.

| Prueba | Evidencia | Falla si |
| --- | --- | --- |
| 1. Re-medición | `after/run-02/`: preflight, un reporte por corpus y el agregado, más la salida del revisor | El digest del protocolo no coincide, un checkout no está en su commit, o el directorio de evidencia no está vacío |
| 2. Dos flujos | `flow-comparison/protocol.md` con su digest, y `flow-comparison/` con los artefactos de ambas vías | La tarea o sus criterios cambian después de empezar cualquiera de las dos ejecuciones |
| 3. Contraste del arnés | `after/harness-contrast.json` con las dos ejecuciones y lo que el arnés anterior certificó | Se presenta el contraste sin haber ejecutado el arnés sobre `a3b1efd` |
| 4. Arranque documentado | El script de comprobación y `after/documented-start.json` con el código de salida de cada paso | Un paso no sale con código 0, el doctor reporta un FAIL no justificado, o la comprobación pasa sin haber podido ejecutar |
| Cierre | `validation.md`, `adversarial-review.md`, `check.json`, `openspec-strict.json`, `docs.json`, `neutrality.json`, `artifact-links.json`, `after/rollback.json` | Cualquier estado de readiness se rellena sin evidencia ejecutada |

## Reglas que valen para las cuatro

- **La regla de publicación es simétrica:** favorable, neutro o adverso se publican igual. Es la condición que
  hace creíble el número, y ya está en la spec de evaluación.
- **Ningún número de tokens** sin que un proveedor lo haya reportado y quede el reporte.
- **Ninguna ruta absoluta ni el nombre de la cuenta** en evidencia commiteada: el arnés ancla las rutas con
  `portable()` y los registros nuevos siguen la misma regla.
- **Los corpus no se versionan**: viven fuera del repositorio, como exige el protocolo congelado.

## Intentos abortados

Se conservan. `after/aborted-01/` es un intento del 20 de septiembre que no llegó a medir nada: el `tar` del
shell desde el que se lanzó interpretaba `C:\...` como un host remoto y la exportación del corpus falló antes
de la primera pregunta. No es un resultado del producto y no se cuenta como corrida; se guarda para que el
registro de intentos esté completo.
