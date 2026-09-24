# Gate archive en consumidor desechable

Ejecutado el 2026-09-24 sobre la fixture creada por `npm run fixture -- --keep --json`, identificada como `project-constructor-empty-HkF4sv` bajo TEMP. Conserva instalado el tarball local 1.0.0; se refrescaron ahí los artefactos del cambio y el assessment `clean` antes del gate. El preflight `sync --check` devolvió `IN_SYNC`, sin deriva.

## Resultado final

`readiness-check --phase archive --change raise-supported-node-baseline --run-local --json`: **PASS (20 PASS, 0 FAIL, 0 EXCEPTION)**. El resumen estructurado completo está en [archive-readiness.json](archive-readiness.json).

La primera corrida fue correctamente FAIL (18 PASS, 2 FAIL) mientras faltaba la matriz CI: `change.tasks` tenía una tarea pendiente y `multi-platform-smoke` estaba pendiente. Tras aprobar la ejecución multiplataforma del [PR #185](https://github.com/IgnacioBarEsp/project-engineering-os/actions/runs/35946948408), se actualizaron las tareas y la evidencia, y se repitió el gate en la fixture sincronizada. Los runners fijos `sync-check`, `opsx-check`, `doctor-json-check` y `openspec-strict` pasaron; también pasaron el assessment y debt gate.

La verificación fue read-only (`mutationPerformed: false`); no se ejecutó `project-os sync` mutante. La prueba comprueba los campos declarados en readiness, no convierte la revisión registrada en aprobación humana: [adversarial-review.md](adversarial-review.md) identifica al agente que preparó el cambio y declara expresamente que no es una revisión humana ni independiente. PR #185 sigue en borrador y necesita la decisión/revisión real del mantenedor antes de integración.
