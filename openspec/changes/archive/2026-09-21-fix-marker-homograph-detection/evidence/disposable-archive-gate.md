# Gate archive en consumidor desechable

Ejecutado el 20 de septiembre de 2026 con el CLI del repositorio y una fixture
bootstrapeada por `npm run fixture -- --keep --json`. La ruta concreta de la
fixture se omite porque es temporal y no forma parte del contrato.

## Secuencia

1. Se copió el change y su assessment al consumidor bootstrapeado.
2. El primer `readiness-check --phase archive --run-local` detectó el cambio de
   estado provocado por esa copia.
3. Se ejecutó `project-os sync` únicamente sobre la fixture temporal.
4. Se repitió el gate con el mismo target.

Resultado de la segunda ejecución:

- `local.sync-check`: PASS, `IN_SYNC`, 89 preservaciones y ningún update.
- `local.opsx-check`: PASS, 30 superficies OPSX y CLI local fijada.
- `local.doctor-json-check`: PASS, journal terminal y código de salida 0.
- `readiness.evidence`, rollback y revisión adversarial: PASS.
- En ese momento el gate quedó bloqueado solo por `multi-platform-smoke` y las
  tres tareas de cierre aún sin marcar (`4.4`, `5.3`, `5.4`).

Tras el PASS de la matriz protegida [35575048504](https://github.com/IgnacioBarEsp/project-engineering-os/actions/runs/35575048504),
se marcó la evidencia y se repitió el gate con el mismo target. La tercera
ejecución terminó `PASS` con 20/20 comprobaciones y sin mutación.

La ejecución no mutó el repositorio upstream; la única mutación fue el `sync`
de la fixture temporal, que quedó fuera del árbol de trabajo.
