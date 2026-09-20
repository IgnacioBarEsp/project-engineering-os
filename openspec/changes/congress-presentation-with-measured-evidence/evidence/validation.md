# Validación — congress-presentation-with-measured-evidence

Ejecutada el 20 de septiembre de 2026 por un agente (Claude Opus 5 en Claude Code). **Ninguna persona ejecutó
estas comprobaciones.** Las decisiones que las enmarcan son del mantenedor y están en
[decisiones](maintainer-decisions.md).

## Qué entrega este change

| Artefacto | Dónde | Estado |
| --- | --- | --- |
| Guion de 21 diapositivas | `docs/presentations/2026-09-24-congreso.md` | Versionado, enlazado desde el índice de documentación |
| Comprobación de las cifras | [verify-deck-figures.mjs](verify-deck-figures.mjs) | **16 de 16 afirmaciones cuadran** con su registro |
| Material visual elegido | [visual-assets.md](visual-assets.md) | Tres capturas de `d744c47`, con sus hashes |
| Mazo generado | [deck-build.md](deck-build.md) | 21 diapositivas, validado y revisado visualmente |

## Resultado por validación

| Validación | Resultado | Evidencia |
| --- | --- | --- |
| `openspec-strict` | Change válido en modo estricto | [openspec-strict.json](openspec-strict.json) |
| `critical-document-presence` | `check-docs` PASS | [docs.json](docs.json) |
| `relative-link-check` | Los enlaces del change y de los documentos públicos que toca existen | [artifact-links.json](artifact-links.json) |
| `findability-two-hop-check` | README → [índice](../../../../docs/README.md) → [guion](../../../../docs/presentations/2026-09-24-congreso.md) | [artifact-links.json](artifact-links.json) |
| `neutrality-check` | PASS | [neutrality.json](neutrality.json) |

`npm run check` completo: ver [check.json](after/check.json).

## La regla del mazo, hecha ejecutable

Una sola: **si una cifra no está en la tabla de procedencia del guion, no entra en una diapositiva.**
`verify-deck-figures.mjs` la comprueba: extrae cada afirmación del guion y la recalcula desde su registro —los
JSON del change archivado de #166 y la página de evidencia—. Falla si una cifra no coincide, si la tabla de
procedencia no nombra sus fuentes, o **si el guion presenta el microcorpus sin el resultado adverso**.

Encontró un hueco real al escribirse: el guion se dejaba fuera la cuarta medición, la del arranque documentado.
Está corregido y ahora la comprobación pasa 16 de 16.

## Dos comprobaciones sobre el mazo, y lo que cada una no ve

| Comprobación | Resultado | Qué no ve |
| --- | --- | --- |
| Esquema, relaciones y XML del archivo | PASS | Nada sobre cómo se ve |
| Geometría: bordes, márgenes y solapes | 21 diapositivas, 0 problemas | Texto que desborda **dentro** de su caja |
| Revisión visual con las diapositivas renderizadas | 1 defecto, corregido | Lo que cambie al abrirlo en otro programa |

La geometría atrapó tres defectos en la primera versión —un bloque fuera de la diapositiva, el rótulo superior
por debajo del margen y una etiqueta pisando su cifra—. La revisión visual atrapó un cuarto que la geometría
daba por bueno. El detalle está en [deck-build.md](deck-build.md).

## Decisiones de deriva registradas

- **Las demos no se graban en vídeo.** Son las dos ejecuciones reales que midió #166, con sus artefactos.
  Decisión del mantenedor.
- **Contenido antes que diseño.** El guion se escribió y se aprobó como texto antes de crear nada en Canva.
- **Canva no pudo generar el mazo:** la generación de diseños no está habilitada en el equipo y no hay
  plantillas de marca. Se entregó un archivo importable, generado desde el guion. Está en
  [deck-build.md](deck-build.md).
- **La decisión de encuadre de la evidencia** que el issue dejaba pendiente se registró como aprobada en su
  metadata: se eligió re-medir, #166 lo ejecutó y el número no cambió.

## Lo que esta evidencia no demuestra

- **Ninguna revisión humana** de este change.
- **El mazo no se ha abierto en PowerPoint ni en Canva.** LibreOffice sustituye fuentes, así que el ajuste
  fino del texto puede variar en el programa donde se presente.
- **El guion no es la charla.** Que las cifras cuadren no dice nada sobre si la exposición funciona ante un
  público.
- **Ninguna cifra nueva se midió aquí.** Todas salen de mediciones anteriores, y este change solo comprueba
  que lo publicado coincide con ellas.
