# Archive readiness — correct-companion-authenticode-probe

Fecha: 2026-09-15.

| Control | Comando | Resultado |
| --- | --- | --- |
| Assessment de deuda | `node bin/project-os.mjs debt capture --flow correct-companion-authenticode-probe --input <assessment>` | PASS: dos candidatos `optional-improvement` capturados (debt-cb6e469cd84f, debt-018320fa77f0); sin unidades de presupuesto |
| Gate pre-archive | `node bin/project-os.mjs debt gate --phase pre-archive --change correct-companion-authenticode-probe` | PASS: assessment válido (debt), sin Blockers/Majors abiertos del flujo ni deuda crítica transversal |
| Estado del plan | `node bin/project-os.mjs debt check` | PASS: plan `upstream-core` 4/5 unidades, sin pausa. Los bugs preexistentes (#115, #122) se rastrean en el tracker, no en el registro |
| OpenSpec | `npx openspec validate --all --strict --no-interactive` | 21/21 PASS antes de archivar |
| QA y checks | `npm test` (companion), `npm run check`, check:workflows, check:docs | Ver `evidence/validation.md` |

## Recuperación y límites

- Si el workflow corregido falla antes de publicar: Companion 0.1.0 sigue siendo la única descarga
  pública; ningún tag ni asset se sustituye; un revert deja versiones públicas y datos sin cambios.
- Este change no publica: el tag anotado `companion-v0.2.1` se corta sólo tras merge en `main`
  protegido, y el dispatch verifica tag anotado, ancestro de main, árbol limpio, tag↔versión y
  ausencia de release previa antes de crear el draft.
- La deriva de perfiles (#122) y el hueco de Ola 0 (#115) quedan abiertos en el tracker con su
  evidencia aquí; su saneamiento será un flujo propio y no se adelanta en este change.
