# Evidencia de validación

Fecha: 2026-09-24. Cliente de empaquetado: npm 11.19.1; Node 24.18.0.

## Inventario del tarball

Mismo paquete `create-project-engineering-os@1.0.0`, comparación del checkout base `30ff16d` con la
allowlist propuesta:

| Medida | Base | Candidato |
| --- | ---: | ---: |
| Archivos | 193 | 167 |
| Bytes empaquetados | 506.829 | 266.291 |
| Bytes sin comprimir | 1.404.376 | 1.019.023 |
| Entradas bajo `docs/companion/`, `docs/stitch uxui/` o `docs/assets/`, o status/releases upstream | presentes | 0 |

El checker crea y extrae un `.tgz` temporal, compara su árbol con el inventario de `npm pack` y revisa los
destinos relativos Markdown/HTML de los documentos extraídos. `npm pack --dry-run --json` confirmó 167
entradas, 32 bajo `docs/`, y ninguna de las rutas excluidas; `npm run check:package` confirmó los mismos
conteos y tres métricas de tamaño. El índice `docs/README.md` permanece como guía core-only; las guías de
Companion siguen en el repositorio, accesibles desde su portada, no dentro del tarball.

## Verificaciones automáticas

- `npm exec --yes --package=@fission-ai/openspec@1.6.0 -- openspec change validate trim-npm-documentation-payload --strict --json`: PASS, 0 errores/advertencias.
- `npm exec --yes --package=npm@11.19.1 -- npm run check`: PASS en la worktree completa; 362/362 pruebas, incluido `check:package`, neutralidad, docs, workflows y deuda.
- `node bin/project-os.mjs debt capture --root . --flow trim-npm-documentation-payload --input openspec/changes/trim-npm-documentation-payload/evidence/debt-input.json --json`: PASS, assessment `clean`; no cambió el registro. `debt check`, `npm run check:debt` y `debt gate --phase pre-archive` también pasaron.
- `npm exec --yes --package=npm@11.19.1 -- npm run pack:verify`: exploratorio PASS; el packer instaló el tarball y verificó versión, CLI/help, bootstrap, segundo run y deuda (SHA `bedb5138…`, 266.291 bytes, 167 archivos, 1.019.023 bytes sin comprimir). Esta ejecución aún apuntó al HEAD base porque el cambio no estaba committed; no se usa como evidencia final y se repetirá desde el commit archivado.

La primera ejecución de `npm run check` en la worktree no tenía dependencias instaladas y falló al importar
`ajv`; se instalaron desde el lockfile con npm 11.19.1, y la repetición completa pasó. `npm ci` no cambió
el lockfile.

## Revisión manual y límites

- Se revisó que los documentos retenidos describan la propiedad upstream y enlacen externamente las guías
  que ya no viajan con npm. `docs/README.md` queda como índice del núcleo; los documentos excluidos siguen
  en el repositorio. La allowlist de exportación permanece intacta.
- No cambia una API, runtime o dependencia: `bin/`, `blueprint/`, `schema/`, `src/` y ambos lockfiles
  quedan fuera del diff funcional. Licencias y notices no cambian; no se añadió dependencia.
- La revisión adversarial de `evidence/adversarial-review.md` cerró los cuatro hallazgos de iteración y no
  deja Blockers/Majors abiertos. Fue una revisión delegada a Codex; no se presenta como aprobación humana
  independiente. La política de integración requerida sigue siendo el check protegido del PR.
- El smoke de instalación/uso se registra con `pack:verify`. La verificación final se repetirá en el
  commit que contenga el archive; la limpieza del artefacto y su directorio es temporal y no publica ni
  altera la release inmutable `1.0.0`.
- La validación multiplataforma de CI queda pendiente hasta que el PR corra la matriz Ubuntu/Windows/macOS
  en Node 22.22.0 y 24.x. No se declarará como pasada antes de ver esos resultados.
