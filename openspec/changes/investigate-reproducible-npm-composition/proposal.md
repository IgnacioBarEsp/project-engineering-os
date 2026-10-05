## Why

[#204](https://github.com/IgnacioBarEsp/project-engineering-os/issues/204) bloquea la auditoría de producción del npm incluido en Companion. El mantenedor eligió preparar una alternativa reproducible para no depender exclusivamente de la siguiente publicación completa de npm; necesitamos comprobar su viabilidad antes de asumir mantenimiento o distribuirla.

## What Changes

- Añadir un expediente y un harness de investigación de composición npm, limitado a carpetas desechables propias, sin reemplazar herramientas del host ni del Companion.
- Partir de fuentes oficiales npm11.21.0 fijadas por commit e integridad, declarar las diferencias de metadata/dependencias y generar un lock e inventario candidatos fuera de los locks oficiales.
- Probar reproducibilidad, auditoría independiente del árbol físico, regresiones de avisos y contrato de instalación/runtime de Companion.
- Ensayar transición reversible entre identidades oficiales y derivadas, y versiones del mismo canal, con slots separados y cambio de selección solo tras verificar el destino; una versión vulnerable no será un rollback aceptable.
- Emitir un dictamen trazable viable/no-viable. No declarar corrección integrada, release apta o cierre de #204 por completar la investigación.
- Ampliación aprobada en6b3997: permitir un parche reproducible y revisado de datos limitado a index.js de http-cache-semantics4.3.0 en copia experimental, con política/criterios separados, procedencia/licencia y retirada verificable al oficial; detalle en [patch-amendment.md](patch-amendment.md).
- Mantener separada la adopción: si hay evidencia suficiente, proponer después el cambio de catálogo/locks/avisos/hashes y la validación del instalador mediante otra aprobación.
- Segunda ampliación aprobada en d6e2b543d632dc35b099037746891dbe2f3983db: permitir los fixes de casing/expiry/304-Vary necesarios en el mismo index.js y un parche acotado de tres archivos del caller make-fetch-happen15.0.6, solo experimental. [Aprobación literal](evidence/boundary-amendment-approval.md); motivo, allowlist, costo, presupuesto restante y gates en [boundary-amendment.md](boundary-amendment.md).

- Final refinement [proposed, not approved](final-recipe-amendment.md): one additional frozen recipe (cumulative maximum4 only after explicit approval) and exact representation/304-expiry/history/matching corrections under the same two components/four files. The second amendment is already applied and blocked; no new source change is authorized by preparing this proposal.

## Capabilities

### New Capabilities

- `companion-npm-composition`: evaluación reproducible, aislada y verificable de una composición npm candidata sin adopción automática.

### Modified Capabilities

Ninguna. No se cambia el contrato actual de distribución, instalación, preparación o CLI público en esta fase.

## Impact

Superficies: `documentation` y `harness-tooling`. Implementación futura, después de aprobación: harness y pruebas de investigación bajo `apps/companion/scripts/` y `apps/companion/test/`, expediente OpenSpec y evidencia. No se modifica el núcleo universal ni los workflows OPSX generados.

La fase original permite obtener y evaluar fuentes/dependencias oficiales solo en temporales, sin scripts de instalación ni compilación arbitrarios. La ampliación aprobada permite un diff/manifiesto de parche bajo apps/companion/patches y su verificador/pruebas internos. Apply ya produjo copias experimentales; no se instala nada en el host/Companion. La distribución de producción sigue fuera de alcance.

## Non-Goals

No reemplazar npm en runtime; no cambiar catálogo, locks oficiales, avisos publicados, pin OpenSpec, gestor, baseline Node, CI o protecciones; no editar dependencias vendorizadas a mano, parchear código npm/otros componentes ni aplicar el parche acotado antes de aprobar la ampliación; no publicar artefactos o ejecutar instaladores en el host; no resolver #208 ni iniciar ola4.

## Risk and Recovery

Podríamos obtener un audit verde que omita archivos bundled o no represente una corrección real. Contrastaremos inventario físico, grafo y avisos/regresiones; una discrepancia bloquea la candidata. Conservaremos fuentes e inputs/resultados separados y sus hashes. Un fracaso termina en dictamen no-viable, no en excepciones o rollback a una release vulnerable.

## Gates

Issue enriquecido y DoR original **13/13 PASS** en [evidence/readiness-propose.json](evidence/readiness-propose.json). Change creado por OpenSpec local fijo **1.6.0**. **El mantenedor aprobó proposal/design/spec de fa279d952784cd0138fb78ec91226f5cefe00ba2 con la condición explícita de reversibilidad oficial/derivado**, incorporada en este expediente; véase [evidence/spec-approval.md](evidence/spec-approval.md). La aprobación sigue limitada a viabilidad, no a distribución/adopción.

El archivo futuro exige evidencia real, revisión adversarial y assessment de deuda. Cualquier integración espera `CI / required` verde bajo protecciones existentes; #208 y el orden de los PR de ola3 permanecen obligaciones separadas. No se mezclará este trabajo en #207.

**Ampliación aprobada:** después de presentar la revisión inmutable6b3997 el mantenedor respondió «apruebo», registrado en [evidence/patch-amendment-approval.md](evidence/patch-amendment-approval.md). La aprobación de fa279d9 conserva su alcance original. Esa primera aprobación no autorizó automáticamente la segunda. La segunda aprobación concreta d6e2b54 sí autorizó sus cuatro archivos y ya fue aplicada. Sus fallos conservados y presupuesto3 agotado bloquean aceptación. La propuesta final aún necesita aprobación real; no se infiere de ninguna aprobación anterior.
