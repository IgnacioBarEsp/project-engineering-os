# Gate archive en consumidor desechable

Ejecutado el 2026-09-24 sobre la fixture normal mantenida por `npm run fixture -- --keep --json`. La fixture está bajo TEMP, tiene el tarball local 1.0.0 instalado y el bootstrap del issue copiado junto con su assessment de deuda `clean`.

## Resultado actual

`readiness-check --phase archive --change raise-supported-node-baseline --run-local --json`: **FAIL intencional mientras CI de PR no termine** (18 PASS, 2 FAIL).

- `local.sync-check`: PASS.
- `local.opsx-check`: PASS.
- `local.doctor-json-check`: PASS.
- `local.openspec-strict`: PASS.
- Los únicos bloqueos son `change.tasks` por 1 tarea pendiente (CI multiplataforma) y `readiness.validations` por `multi-platform-smoke` pendiente.

El primer intento, antes de separar el cierre post-archive de `tasks.md`, mostraba también las acciones futuras de merge/publicación como tareas previas al archivo. Se corrigió el orden del plan sin marcarlas como completadas: merge y release permanecen pendientes en el issue #155. Tras actualizar solo `tasks.md` en la fixture, la segunda ejecución pasó todos los runners locales y conserva como bloqueos únicamente la evidencia de CI aún no disponible.

No se ejecutó `project-os sync` mutante en la fixture: el runner fijo `sync-check` ya confirmó `IN_SYNC`. El checkout upstream no fue mutado por este gate.
