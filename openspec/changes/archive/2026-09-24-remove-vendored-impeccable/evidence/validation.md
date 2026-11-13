# Evidencia de validación de #152

Entorno: Windows x64, Node.js 24.18.0, npm 11.16.0, worktree `codex/152-remove-impeccable-vendor` sobre `6763040d42158bd0b06839b10993fd9a13eb2d75`. Se instaló el lockfile existente con `npm ci`; no se agregaron dependencias. El entorno local de npm difiere de npm 11.19.1 fijado en CI; los checks definitivos de CI deben ejecutarse con el runtime fijado antes de merge.

## Resultado

| Comando / comprobación | Resultado |
| --- | --- |
| `node_modules/.bin/openspec.cmd validate remove-vendored-impeccable --strict` | PASS; change válido. |
| `npm run check:package` (dentro de `npm run check`) | PASS; contrato de paquete: 167 archivos, 1,024,794 bytes desempaquetados, 268,131 comprimidos; compara avisos del núcleo y Companion con los locks. |
| `npm run check:neutrality` (dentro de `npm run check`) | PASS; árbol público neutral y allowlist de exportación. Incluye política de hooks vacía. |
| `npm run check:docs` | PASS; 12 enlaces README, contrato de prompts y 21 propósitos de specs después de reemplazar el Purpose de plantilla que creó el archive. |
| `npm run check:workflows` | PASS; 6 workflows. |
| `npm run check:debt` | PASS; política/registro válidos, plan existente 4/5 unidades y 3 flujos con deuda abierta. |
| Comprobación de enlaces relativos en los Markdown del change | PASS; 11 archivos Markdown, cero destinos rotos. |
| `node bin/project-os.mjs debt capture --flow remove-vendored-impeccable --input openspec/changes/archive/2026-09-24-remove-vendored-impeccable/evidence/debt-input.json` | PASS; assessment `clean`, sin cambios de deuda. |
| `node bin/project-os.mjs readiness-check --phase archive --change remove-vendored-impeccable --target . --run-local --json` | PASS; 17/17 checks del gate de archivo. |
| `node_modules/.bin/openspec.cmd archive remove-vendored-impeccable --yes` | PASS; specs delta aplicadas y change archivado con fecha 2026-09-24. |
| `node --test test/supply-chain.test.mjs test/neutrality.test.mjs` | PASS; 19/19, incluidos hook rechazado sin ejecución, aviso ausente, lock Companion desactualizado, paquete sin versión, `dev` inválido, mapas nulos en manifiestos/locks, peers opcionales ausentes y dependencias directas/transitivas mal clasificadas como `dev`. |
| `npm run check` | PASS; 371/371 pruebas, sin fallos ni tests omitidos. |
| `git diff --check` y `git diff --cached --check` | PASS; sin whitespace errors. |
| `git ls-files .github` filtrado por `impeccable` | Sin rutas restantes. |
| Inspección de `.github/hooks` | El directorio no contiene hooks; la regla falla ante cualquier archivo o symlink futuro sin ejecutar su contenido. |

El valor Apache-2.0 de `qrcode-terminal@0.12.0` se obtuvo de su metadato/package redistribuido y el texto de Companion se regeneró desde el lock. El conteo actualizado declara 10 paquetes Apache-2.0. No se añadieron ni descargaron binarios.

## Alcance y evidencia no afirmada

La superficie de archive se clasifica como `documentation`: el cambio no altera templates, artefactos generados, contratos de CLI ni los cinco harnesses de consumidores. Sí añade una política de gobernanza y checks de autoría/redistribución. Los runners de `harness-tooling` no se reclasifican como verdes: `sync --check` sigue reportando drift preexistente de #122, `opsx-check` no puede leer `.project-os/openspec-ownership.json`, y `doctor` conserva fallos preexistentes asociados a #115/recibos antiguos. No se corrigieron esos issues posteriores incidentalmente. La decisión y autorización del mantenedor están registradas en [maintainer-decisions.md](maintainer-decisions.md).

No se afirma que la clonación completa se reduzca en 60,000 líneas: la medición del blob de referencia contradice esa cifra. La cifra corregida y la actualización pública de issue quedan descritas en [brownfield-baseline.md](../brownfield-baseline.md) y el comentario vinculado en #152.

Los checks locales no sustituyen CI, aprobación humana independiente ni revisión del PR protegido. El mantenedor es autor del issue y puede revisar el PR; la revisión adversarial de agente se registra por separado.
