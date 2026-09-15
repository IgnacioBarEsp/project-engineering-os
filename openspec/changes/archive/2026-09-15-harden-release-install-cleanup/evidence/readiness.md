# Archive readiness — harden-release-install-cleanup

Fecha: 2026-09-15.

| Control | Comando | Resultado |
| --- | --- | --- |
| Assessment de deuda | `node bin/project-os.mjs debt capture --flow harden-release-install-cleanup --input <assessment>` | PASS: assessment capturado sin deuda abierta |
| Gate pre-archive | `node bin/project-os.mjs debt gate --phase pre-archive --change harden-release-install-cleanup` | PASS: assessment válido sin blockers |
| Estado del plan | `node bin/project-os.mjs debt check` | PASS: plan activo sin pausa |
| OpenSpec | `npx openspec validate harden-release-install-cleanup --strict --no-interactive` | PASS estricto |
| QA y checks | `npm test` en `apps/companion`, `npm run check` | Ver `evidence/validation.md` |

## Recuperación y límites

- Si el workflow 0.2.2 falla antes de publicar: Companion 0.1.0 sigue siendo la única descarga pública oficial; ningún tag ni asset se sustituye; un revert deja versiones y fuentes sin cambios.
- Este change no publica: el tag anotado `companion-v0.2.2` se corta únicamente tras el merge en `main` protegido.
