# Validación de #155 — integridad de release y gate EOL

Fecha: 2026-09-24. Branch `codex/155-release-eol-fix`; base/tag `v1.0.0` en
`71b86233ee5fbd6eef0c1a838c53b504db217d1f`.

## Reproducción y verificaciones

| Comprobación | Resultado | Evidencia |
| --- | --- | --- |
| Intento oficial anterior | FAIL antes de producir assets o publicar | [run 35949205399](https://github.com/IgnacioBarEsp/project-engineering-os/actions/runs/35949205399), [pre-apply.md](pre-apply.md) |
| Clasificador EOL y workflow | PASS, 11 tests focalizados; workflow checks PASS | `node --test test/supply-chain.test.mjs test/release-source.test.mjs`; `npm run check:workflows` |
| Tag/source del repo | PASS con el tag remoto actual y `HEAD` exactos | `node scripts/validate-release.mjs --tag v1.0.0 --verify-tag-source` |
| Colisión entre branch y tag homónimos | PASS: el checkout del branch `9d5eeca…` se rechaza (exit 1), el tag `4144b57…` se acepta (exit 0) | Reproducción dinámica con repositorio bare y clone desechables bajo `%TEMP%`; el input consultó el ref exacto `refs/tags/v1.0.0` |
| Transporte a Bash | PASS: `RELEASE_TAG` imprime literalmente `$(touch SHOULD_NOT_BE_CREATED_BY_LITERAL_TEST);v1.0.0`, exit 0, sin crear marcador | Prueba con Git Bash desde el clone desechable |
| Identidad del tarball del tag exacto | PASS; 193 rutas públicas, mismo SHA-256 `a13218806ed340d1cc7618e26d3105e7aa42a45ff615c34eecb0abbd7e16bbdc`, 506213 bytes, smoke test PASS | `node scripts/pack-release.mjs --dry-run` en worktree limpio de `v1.0.0` con overlay temporal del clasificador; tooling de release se excluye del paquete |
| Candidate dry-run de la rama | PASS; SHA-256 `7ffe3513649634c1e1a81d7a8620f2b097196cccc496178991d51c2182ef0305`, 506829 bytes, smoke test PASS | `node scripts/pack-release.mjs --dry-run`; el manifest aún registra el `HEAD` base porque no se ha hecho commit |
| Rechazo de prerelease | PASS; `1.2.3` permitido y `1.2.3-rc.1` rechazado en helper del preflight | Regresión unitaria; el build falla antes de candidate o GitHub Release |
| Suite completa | PASS, `npm run check`: 359/359 tests, 0 fallos y todos los checks de paquete, neutralidad, docs, workflow y deuda en PASS | Ejecución final en el worktree del follow-up, 2026-09-24 |
| OpenSpec strict | PASS; 21/21 items, 0 fallos | `openspec validate --all --strict --no-interactive`, 2026-09-24 |
| Revisión adversarial | PASS; cero findings abiertos tras correcciones | [adversarial-review.md](adversarial-review.md) |
| Debt assessment | PASS, `clean`; captura oficial registrada por el CLI del repo | [debt-assessment.json](debt-assessment.json), `.project-os/debt/assessments/fix-release-pack-eol-classification.json` |
| Archive readiness | PASS; 20 PASS, 0 FAIL, 0 EXCEPTION, `mutationPerformed: false` | [disposable-archive-gate.md](disposable-archive-gate.md), [archive-readiness.json](archive-readiness.json) |

La configuración externa se verificó por API en [release-environments.md](release-environments.md): ambos
environments admiten solo `main`, el bypass administrativo está deshabilitado y se conservó el reviewer
de `npm-publish`. Un segundo ruleset activo bloquea actualización y borrado de tags `v*` y `companion-v*`
sin bypass, conservando el flujo existente de creación. El job GitHub Release revalida el tag remoto y
compara el commit del manifest candidato con el commit del checkout antes de adjuntar assets.

No se movieron tags ni se editaron los archivos históricos. El Release workflow no se ha iniciado de
nuevo, no hay assets publicados para `v1.0.0`, npm no recibió la versión y el issue #155 sigue abierto.
La publicación solo se intentará desde el `main` protegido después del merge del PR y sus checks.
