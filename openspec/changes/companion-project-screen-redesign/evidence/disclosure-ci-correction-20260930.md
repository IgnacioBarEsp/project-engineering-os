# Corrección del recorrido de tecnología plegada — 2026-09-30

La reorganización aprobada de Tus proyectos mantiene las herramientas opcionales plegadas. En las ramas #148/#149, verify-ui pulsaba review-stack directamente y falló antes de completar su recorrido. CI originales: [#148 run36820222529](https://github.com/IgnacioBarEsp/project-engineering-os/actions/runs/36820222529/job/110233994210) y [#149 run36820222712](https://github.com/IgnacioBarEsp/project-engineering-os/actions/runs/36820222712/job/110233995012); la omisión no se cuenta como negativo detectado.

Se reutilizó exactamente la solución que ya tenía #150: `click(page,'Revisar tecnología del proyecto')`. El helper existente activa los summaries reales de sus ancestros antes de pulsar el botón normalmente. No hay force, cambios de details.open, UI, engine, runtime, lock, transporte ni reducción de probes. La spec aprobada exige ejercitar plegado/expandido y conservar controles medidos; no es otro rediseño ni otra aprobación visual.

[Reproducciones, extractos y hashes de originales](disclosure-ci-correction-20260930.json) conserva los dos intentos CI fallidos y las dos ejecuciones propias completas:

| Rama | SHA limpio ejecutado | Recorridos/pantallas | Controles | Copias exactas | Resultado completo |
| --- | --- | --- | --- | --- | --- |
| #148 | 2798be077b5522a86079651b39ac2495b1fff441 | 20/120 | 1360/1360 | 40/40 | exit0 |
| #149 | 576fe028c4d76d32d5e8cd260b96f54ce60aa362 | 20/120 | 1340/1340 | 40/40 | exit0 |

Cada comando fue `node apps/companion/scripts/verify-ui.mjs <directorio propio>`, Node24.18.0, sin argumento runtime cache. Las siete variantes del proyecto, 56 pantallas de calidad, lectura/exclusiones/recetas/handoff, gestión, rollback y preservación de originales terminaron sin hallazgos. Cada ejecución completó después compatibilidad (22 casos; completed=true, el formato no declara failures) e aislamiento (10 casos; completed=true, failures=[]). No basta la emisión anterior de browser-evidence.json: se esperó la terminación final con exit0.

El primer intento de gate propose usó por error --change y solo falló argumentos, sin evaluar DoR; el reintento --issue148 pasó13/13. El fix de una línea pertenece a la spec ya aprobada, validada con el OpenSpec local fijo1.6.0; no se atribuye una aprobación nueva a un gate posterior. Syntax/diff-check pasan. Los informes previos permanecen intactos.

Esto es evidencia propia de browser/servicio con frontera nativa inyectada, **no revisión independiente de ambas cabezas, instalador, aprobación humana ni auditoría de producción**. #204 y los gates integrales siguen pendientes. No se archiva, integra o cierra ola3 con esta reprueba, y no se inicia ola4.

