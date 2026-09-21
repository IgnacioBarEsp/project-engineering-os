# Baseline — fix-marker-homograph-detection

Medida el 20 de septiembre de 2026 sobre `main` en `2384fab`, después del merge de la ola 0.

## Identidad del detector

Los blobs relevantes son idénticos a los que midió la comparación de #166 sobre `a02c991`:

| Archivo | Blob en `a02c991` y `2384fab` |
| --- | --- |
| `src/readiness.mjs` | `24e3a29dd8c27123070833c8ae8bb49379c961b0` |
| `test/readiness.test.mjs` | `e962bc9b29c086aa0a669603d54c86512eefa2af` |

`git diff --exit-code a02c991..2384fab -- src/readiness.mjs test/readiness.test.mjs` terminó con código 0.
Por tanto, la evaluación independiente archivada en
`openspec/changes/archive/2026-09-20-remeasure-retrieval-and-record-flow-comparison/evidence/flow-comparison/evaluation.json`
describe exactamente el detector que este change va a modificar.

## Resultado medido

| Árbol evaluado | Frases legítimas que pasan | Marcadores reales rechazados | Límite |
| --- | ---: | ---: | --- |
| `main`, detector actual | 2 de 34 | 16 de 19 | Rechaza prosa y deja pasar tres instrucciones |
| Vía de prompt suelto de #166 | 33 de 34 | 19 de 19 | Conserva un falso positivo |
| Vía de flujo completo de #166 | 34 de 34 | 18 de 19 | Deja pasar `Complete the review…` |

Ninguna vía es una implementación aceptable. La condición de entrada a archive será simultánea: 34 de 34 y
19 de 19, con cero metadata histórica nueva en fallo.

## Estado operativo

- Issue #162 abierto, dentro de `Project Engineering OS` y DoR en 13 PASS / 0 FAIL.
- Núcleo 0.5.0 y OpenSpec local 1.6.0.
- Sin change activo previo: #165 quedó archivado e integrado.
- Fallos conocidos de `sync --check`, `upgrade --check` y `doctor` pertenecen a #122 y #115; no forman parte
  del alcance.
