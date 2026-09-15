# Validación — correct-companion-authenticode-probe

Fecha: 2026-09-15. Rama `codex/117-authenticode-probe-and-0-2-1` sobre `main` 17d1458.
Origen: ejecución local en la workstation del mantenedor bajo delegación registrada; ningún paso
publicó releases, movió tags, reemplazó assets ni publicó el núcleo npm.

## Controles automáticos

| Control | Comando | Resultado |
| --- | --- | --- |
| QA de Companion | `npm test` en `apps/companion` | 131/131 PASS, 0 omitidos (37,5 s) |
| QA de Companion tras corregir Minors 2-3 | `npm test` en `apps/companion` | 131/131 PASS, 0 omitidos (35,3 s) |
| Control completo de raíz | `npm run check` | EXIT 0: package, neutrality, docs, workflows, debt y 326/326 tests (149 s) |
| Workflows tras la guarda tag↔versión | `npm run check:workflows` | PASS workflows 6 |
| Docs tras el párrafo de `pwsh` | `npm run check:docs` | PASS docs 25 README links, prompt contract y 20 spec purposes |
| OpenSpec oficial local 1.6.0 | `npx openspec validate --all --strict --no-interactive` | 21/21 PASS, incluido el change |
| Deuda | `npm run check:debt` | PASS política y registro (49 items tras capturar este flujo); plan 4/5, sin pausa |

## Controles de diagnóstico preexistentes (no causados por este change)

| Control | Comando | Resultado y destino |
| --- | --- | --- |
| Doctor | `node bin/project-os.mjs doctor` | EXIT 1. FAIL `profile.ui`, `profile.auth-security`, `profile.library-cli`: hueco de Ola 0 ya rastreado en el issue #115. FAIL `github.project` y WARN `ci.execution` preexistentes. WARN `git.working-tree` esperado: árbol con trabajo en curso. |
| Sync read-only | `node bin/project-os.mjs sync --check` | EXIT 2 `PROJECT_OS_PROFILE_SELECTION_DRIFT`: `config.json` y `.project-os/profiles.json` declaran perfiles activos distintos. Bug preexistente registrado en el issue #122 con esta evidencia; no se sincronizó ni se migró desde este change. |

Estos diagnósticos no se cuentan como PASS del change ni como motivo para alterar su alcance. Se
rastrean en el tracker como bugs con issue abierto (#115 y #122), siguiendo el precedente del
registro de deuda: un bug con issue y criterios de aceptación no se duplica como item de deuda,
porque duplicarlo pausaría el plan y dejaría CI en rojo sin aportar saneamiento.

## Propiedades verificadas del diff

- `verify-app-artifact.mjs` usa `pwsh` con `Import-Module Microsoft.PowerShell.Security -ErrorAction Stop`
  y `$ErrorActionPreference='Stop'`; host, módulo u observación ausentes fallan duro (`assert.equal`
  contra `NotSigned`), sin fallback que convierta falta de inspección en éxito.
- El workflow deriva asset, título y notas de `apps/companion/package.json`, exige las notas en disco y
  re-afirma `$tag -eq "companion-v$version"` antes de cualquier mutación; `gh release view` previo impide
  reemplazar una release existente y el delete sólo alcanza al draft recién creado.
- Versiones alineadas: `package.json`, `package-lock.json`, `THIRD-PARTY-NOTICES.md`,
  `RELEASE_NOTES_0.2.1.md`, `qa/packaging.mjs`, `verify-release-installation.mjs` y el ejemplo del
  workflow dicen 0.2.1; el núcleo sigue fijado en 0.5.0.
- `companion-v0.2.0` no se mueve ni recibe release: las notas y la docs pública siguen nombrando
  descargable sólo 0.1.0 (`docs/RELEASES.md`, `docs/companion/INSTALLER.md`).
