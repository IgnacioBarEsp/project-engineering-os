# Decisiones del mantenedor

Decisiones registradas durante la aplicación de #152 el 24 de septiembre de 2026.

| Contexto | Decisión | Consecuencia |
| --- | --- | --- |
| El issue y la instrucción de esta tarea identifican `documentation` y `harness-tooling`; los runners genéricos de harness fallan por drift/issues anteriores (#122 y #115), no por este parche. Este cambio no toca templates, generación ni contratos de los cinco harnesses consumidores. | El mantenedor autorizó continuar con todos los cambios y movimientos sin detenerse a pedir permisos adicionales; la clasificación del archive se reduce a `documentation` según el efecto real. | Se ejecutan y reportan por separado los checks del cambio (neutralidad, notices, pruebas completas). No se maquillan ni reparan los fallos preexistentes de `sync --check`, `opsx-check` o `doctor`; la deriva se documenta. |
| El issue afirmaba que los 57 archivos del alcance tenían 62,116 líneas y requería una reducción neta del repositorio de 60,000 líneas frente a `a3b1efd`. | La inspección reproducible del árbol de referencia encontró 19,744 terminaciones LF en los 57 archivos; el resto del árbol de trabajo presenta +41,024 líneas netas frente a ese commit, excluyendo el paquete de evidencia de este mismo change. | Corregir públicamente el conteo y reemplazar el criterio imposible por la eliminación íntegra de los archivos del vendoring, sin borrar trabajo ajeno para forzar una métrica engañosa. |

La autorización general del mantenedor aparece en el mensaje de esta tarea. No equivale a revisión humana independiente del PR; la revisión adversarial automatizada se acredita a su agente y la CI de rama protegida sigue siendo obligatoria.
