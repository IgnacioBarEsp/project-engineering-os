# Validación — poll-uninstaller-removal

Fecha: 2026-09-15. Rama `codex/117-poll-uninstaller-removal` sobre `main` dde882e.
Origen: ejecución local en la workstation bajo delegación registrada; ningún paso
publicó releases, movió tags, reemplazó assets ni publicó el núcleo npm.

## Controles automáticos

| Control | Comando | Resultado |
| --- | --- | --- |
| QA de Companion | `npm test` en `apps/companion` | 139/139 PASS, 0 omitidos (37,1 s). Incluye 3 nuevas pruebas unitarias para `waitForRemoval`. |
| Control completo de raíz | `npm run check` | EXIT 0: package, neutrality, docs, workflows, debt y 326/326 tests |
| Workflows | `npm run check:workflows` | PASS workflows 6 |
| Docs | `npm run check:docs` | PASS docs 25 README links, prompt contract y 20 spec purposes |
| OpenSpec oficial local 1.6.0 | `npx openspec validate poll-uninstaller-removal --strict --no-interactive` | PASS estricto |
| Deuda | `npm run check:debt` | PASS política y registro |

## Controles de diagnóstico preexistentes (no causados por este change)

| Control | Comando | Resultado y destino |
| --- | --- | --- |
| Doctor | `node bin/project-os.mjs doctor` | EXIT 1. FAIL `profile.ui`, `profile.auth-security`, `profile.library-cli`: hueco de Ola 0 ya rastreado en el issue #115. |
| Sync read-only | `node bin/project-os.mjs sync --check` | EXIT 2 `PROJECT_OS_PROFILE_SELECTION_DRIFT`: bug preexistente registrado en el issue #122. |

Estos diagnósticos corresponden a los issues abiertos #115 y #122 y se conservan sin alteración de alcance.

## Propiedades verificadas del diff

- `disposable-cleanup.mjs` implementa `waitForRemoval` con sondeo no bloqueante y presupuesto de timeout.
- `verify-release-installation.mjs` espera la remoción de la carpeta de instalación con un presupuesto de hasta 60 segundos tras el desinstalador silencioso de NSIS.
- Identidad Companion 0.2.3 sincronizada en `package.json`, `package-lock.json`, `THIRD-PARTY-NOTICES.md`, `RELEASE_NOTES_0.2.3.md`, `qa/packaging.mjs`, `verify-release-installation.mjs` y `.github/workflows/companion-release.yml`.
