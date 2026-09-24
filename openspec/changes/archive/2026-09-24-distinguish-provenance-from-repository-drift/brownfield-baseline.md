# Baseline de #154 antes de apply

La worktree aislada se creó desde `main` en `264367aef79e0ab1beacf7b4e0fef5e7fa3f4aed`, después del merge de #156. El issue #154 estaba abierto, su propuesta pasó readiness (13 PASS, 0 FAIL), no había un PR abierto que lo implementara y no existía un change OpenSpec activo coincidente.

## Estado observado

| Superficie | Estado antes del cambio |
| --- | --- |
| `src/distribution.mjs` | La identidad del paquete se deriva de archivos de distribución permitidos, incluidos `bin/`, `blueprint/`, `schema/`, `src/` y archivos raíz seleccionados. |
| `src/plan.mjs` | `packageHash` distinto fuerza `requiresStateWrite`; no hay delta de campos. |
| `src/commands.mjs` | `sync --check` convierte cualquier cambio de estado en `DRIFT`/1, aun con cero cambios materiales. |
| `src/cli.mjs` | La salida humana solo muestra `state=update`; el JSON tampoco identifica el campo cambiado. |
| `docs/CLI_GUIDE.md` | No documenta `EXIT_CODES` ni un resultado específico de procedencia. |
| `docs/RECOVERY.md` | No explica qué hacer ante un hash del paquete distinto. |

Se reprodujo el baseline desde `264367a` con dos raíces aisladas que conservaban la misma versión, código, blueprint y configuración, y diferían solo en `README.md`, una entrada incluida en el hash. El CLI anterior produjo `DRIFT`, código 1, cero operaciones materiales y `state=update`; el JSON no tenía delta de estado. `packageHash` se conservó; no se encontró evidencia que justifique debilitar `release.identity`.

La raíz histórica indicada por el issue era un consumidor creado desde npm y verificado desde checkout. La política `.npmrc` impide instalar artefactos publicados con menos de siete días; por ello, la reproducción local usa dos raíces de paquete aisladas con idénticos binario, blueprint, configuración y versión, y una diferencia controlada en un archivo incluido en la identidad. No se deshabilitó esa política.

## Límites confirmados

El change no cambia el esquema ni versión del estado, no toca el motor transaccional ni `upgrade --apply`, no añade dependencias, no modifica tags/releases y no edita la implementación del manifiesto de comandos perteneciente a #157. El resultado nuevo se limita a `sync --check` cuando `packageHash` es la única diferencia de estado y no hay operaciones, conflictos ni transacciones incompletas.
