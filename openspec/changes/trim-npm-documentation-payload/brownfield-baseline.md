# Baseline de #156 antes de apply

La worktree se creó desde `main` en `30ff16d7d67db2b5dc56809c0c573c46fd4e2aff`, después del merge
de #155. Issue #156 estaba abierto, su propuesta había pasado readiness (13 PASS, 0 FAIL), no había un
PR que lo implementara y no existía otro change activo con esta allowlist.

## Estado observado

`npm pack --dry-run --json` con npm 11.19.1 en el commit base reportó 193 entradas, 1.404.376 bytes sin
comprimir y 506.829 bytes comprimidos. La observación inicial del issue, tomada en `a3b1efd`, reportó
190 entradas; se conserva como diagnóstico histórico, no como la medición comparable de esta worktree.

| Fuente | Estado antes del cambio |
| --- | --- |
| `package.json#files` | Permitía `docs/**/*.md` e imágenes bajo `docs/assets/`, además de los árboles de runtime. |
| Contenido observado por npm | Incluía 56 documentos Markdown, assets y documentación de Companion, Stitch y estado/releases upstream. |
| `docs/README.md` | Índice general enlazado a documentos que el consumidor CLI no necesariamente recibe. |
| `scripts/check-package.mjs` | Validaba parte de la lista de archivos, pero no contrastaba el tarball extraído ni sus enlaces relativos. |
| Manifests de release | Registraban bytes comprimidos; no archivaban conteo de archivos ni bytes sin comprimir. |
| Verificación publicada | Debía seguir leyendo manifests históricos inmutables que carecen de futuras métricas de inventario. |

## Límites confirmados

La allowlist de `config/export-allowlist.json` controla exportación del repositorio y no debe reducirse
por este cambio. Se preservan las guías en GitHub y el README compartido del paquete; sus enlaces hacia
documentos excluidos deben ser explícitos y externos. No se modifican `bin/`, `blueprint/`, `schema/`,
`src/`, Companion, lockfiles, tags ni releases publicadas.

La decisión de contenido fue aprobada en el alcance enriquecido de #156. El nombre del paquete y la
versión candidata son `create-project-engineering-os@1.0.0`; la comparación final se hace en el mismo
cliente npm fijado, sin publicar una versión.
