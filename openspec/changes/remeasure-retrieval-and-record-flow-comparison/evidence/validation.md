# Validación — remeasure-retrieval-and-record-flow-comparison

Ejecutada el 20 de septiembre de 2026 por agentes: el que midió y cerró el change (Claude Opus 5 en Claude
Code) y los dos que ejecutaron las vías de la prueba 2, cada uno en contexto limpio. **Ninguna persona ejecutó
ni revisó estas comprobaciones.** Las decisiones que las enmarcan son del mantenedor y están en
[decisiones](maintainer-decisions.md).

- **Equipo:** Windows 11 IoT Enterprise LTSC 2024, x64, con Node 24.18.0 y Electron 44.1.1 (Chromium 152).
- **Aplicación medida:** Companion 0.3.2, instalada desde el instalador publicado y desinstalada al terminar.
- **Corpus:** `kubernetes/website` en `d6e659c1` y `python/cpython` en `9bd9c746`, fuera del repositorio, como
  exige el protocolo congelado.

## Las cuatro mediciones

| Prueba | Resultado | Evidencia |
| --- | --- | --- |
| 1. Re-medir la recuperación | **0 de 20** con la 0.3.2, igual que con la 0.1.0. Barrido literal, 20 de 20 | [run-02](after/run-02), [revisión](after/review-run-02.json) |
| 2. Prompt suelto contra flujo completo | Ninguna de las dos vías entregó el arreglo completo, y fallan en cosas distintas | [resultado](flow-comparison/resultado.md) |
| 3. Contraste del arnés | **0 hallazgos contra 360** sobre la misma aplicación | [contraste](after/harness-contrast.json), [detalle](after/harness-contrast-detail.json) |
| 4. Arranque documentado | Los seis pasos con código 0; el doctor del proyecto sembrado, 29 comprobaciones y 0 FAIL | [documented-start](after/documented-start.json) |

## Resultado por validación

| Validación | Resultado | Evidencia |
| --- | --- | --- |
| `openspec-strict` | Change válido en modo estricto | [openspec-strict.json](openspec-strict.json) |
| `critical-document-presence` | `check-docs` PASS | [docs.json](docs.json) |
| `relative-link-check` | Los enlaces relativos del change y de la página de evidencia existen | [artifact-links.json](artifact-links.json) |
| `findability-two-hop-check` | README → [evidencia](../../../../docs/companion/EVIDENCE.md) | [artifact-links.json](artifact-links.json) |
| `neutrality-check` | PASS | [neutrality.json](neutrality.json) |

`npm run check` completo: ver [check.json](after/check.json).

## Lo que la prueba 1 no cambió, y por qué importa

Entre las dos mediciones se publicaron 0.2.x y 0.3.x. **El número no se movió**: el contexto preparado sigue
sin devolver ninguna de las veinte respuestas. La causa observada tampoco cambió —45 de 2654 fuentes indexadas
en Kubernetes, 42 de 2753 en CPython, `entry-limit` en las dos—, así que las versiones intermedias no tocaron
los límites de indexación. Lo único que mejoró fueron los tiempos de la búsqueda preparada, y siguen siendo
peores que los del barrido literal.

Se publica igual que se habría publicado una mejora: esa simetría es lo que hace creíble cualquiera de los dos
resultados, y ahora la exige la spec.

## Un verificador que no podía verificar

Al intentar pasar el revisor independiente sobre la corrida nueva se descubrió que **no podía ejecutarse sobre
`main` en absoluto**. Los tres defectos y su corrección están en [reviewer-gap.md](after/reviewer-gap.md).

Lo que sigue sin poder probarse desde `main` es que las preguntas se congelaron antes de medir: el
precompromiso y el resultado eran dos commits de la misma rama y el squash los fundió en uno. El orden consta
en el PR #113. El registro del revisor lo dice con esas palabras en vez de afirmar una garantía que el
historial no sostiene.

## Decisiones de deriva registradas

- **Superficie:** `documentation` en lugar de `harness-tooling, documentation`, aprobado por el mantenedor. Ese
  perfil no admite N/A y exige `sync-check` y `doctor-json-check`, que hoy fallan por #122 y #115, medidos el
  20 de septiembre: `sync --check` sale con código 2 y `doctor` con código 1 y cuatro FAIL.
- **Alcance:** las cuatro pruebas, por decisión del mantenedor.
- **Insumos:** instalar el instalador publicado en el equipo del mantenedor y traer los dos corpus.
- **Tarea comparada:** #162, elegida por el mantenedor antes de congelar el protocolo.
- **Ejecución de la prueba 2:** una vía por contexto limpio, decidido por el mantenedor antes de ejecutar.
- **La prueba 3 no esperó a #150:** parte del arnés corregido ya estaba en `main` desde #142, y el contraste se
  midió en vez de suponerse.

## Lo que esta evidencia no demuestra

- **Ninguna revisión humana:** las mediciones, su inspección y la revisión adversarial las hicieron agentes.
- **Que el producto recupere bien en repositorios grandes:** demuestra lo contrario, y sigue siendo el estado
  publicado.
- **Una ventaja general de ninguna forma de trabajar:** la prueba 2 mide una tarea, y lo dice en su propio
  registro.
- **Que el arnés de hoy lo detecte todo:** detecta lo que el anterior no veía; #150 sigue abierto con lo que
  falta.
- **Reproducibilidad en la CI:** la re-medición depende de Windows, de una instalación real y de dos corpus de
  casi un gigabyte que no se versionan. La CI no la repite.
- **Tokens ni calidad de respuesta:** no se midieron, y no se estiman.
