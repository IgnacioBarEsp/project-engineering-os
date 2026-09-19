# Preparación verificada

Issue: [#143](https://github.com/IgnacioBarEsp/project-engineering-os/issues/143).
Base: `eefa1bc2141146da0d82abd7791191e4acb79e6a` (`main`).
Rama: `codex/143-screenshot-provenance`.
Los registros usan fecha UTC (19 de septiembre).

La sesión de preparación anterior creó proposal, design, tasks, TLDR, baseline y specs, y se detuvo antes del
apply por decisión del mantenedor. Esta sesión completó la evidencia de preparación faltante con mediciones
nuevas y recibió del mantenedor la autorización de apply completo
([decisiones](maintainer-decisions.md)).

## Evidencia ejecutada por este agente

| Control | Resultado | Registro |
| --- | --- | --- |
| Identidad de hashes imagen pública ↔ mock de Stitch | 7 de 7 idénticas, sobre `eefa1bc` | [before/mock-identity.json](before/mock-identity.json) |
| DoR propose #143 | PASS: 13 PASS, 0 FAIL, 0 EXCEPTION; sin mutación | [readiness-propose.json](readiness-propose.json) |
| OpenSpec 1.6.0 local, validate strict/no-interactive | PASS, exit 0 | [openspec-strict.json](openspec-strict.json) |
| Documentación del repositorio | PASS, 25 enlaces README y 20 Purpose | [docs.json](docs.json) |
| Neutralidad | PASS tras corregir una ruta absoluta de máquina en design.md (decisión 2 citaba una carpeta con letra de unidad; se reescribió de forma neutra) | [neutrality.json](neutrality.json) |
| Enlaces relativos de los artefactos del change | Resultado y referencias en el registro | [artifact-links.json](artifact-links.json) |
| Preflight archive con run-local | FAIL esperado por trabajo pendiente de apply | [archive-preflight.json](archive-preflight.json) |
| Snapshot del issue y hash/fecha de captura | OPEN, actualizado 2026-09-19T02:24:31Z | [issue-143.json](issue-143.json), [source-provenance.json](source-provenance.json) |

## Preflight de archivado

Se ejecutó el comando read-only:

```sh
node bin/project-os.mjs readiness-check --phase archive --change restore-screenshot-provenance --run-local --target . --json
```

En la primera ejecución de esta sesión, con `readiness.json` ausente, el resultado fue 2 PASS y 3 FAIL:
`change.artifacts` (faltaba readiness.json), `change.tasks` (15 pendientes) y `readiness.contract`. Tras
completar la preparación se repitió: 10 PASS y 6 FAIL — `change.tasks`, `readiness.validations`,
`readiness.evidence`, `readiness.rollback`, `readiness.adversarial-review` y `debt.debt-gate` — y
`local.openspec-strict` pasó mediante runner fijo. Los seis fallos son trabajo posterior a apply y a su
aceptación; no se crearon excepciones, approvals ni assessments vacíos. Con
`surfaces: [documentation]` el catálogo solo ejecuta el runner local `openspec-strict`; no se ejecutaron
doctor, sync ni OPSX, por lo que #115/#122 no aparecen como bloqueadores de este preflight. Esto **no
demuestra que estén corregidos**.

## Revisión documental propia

Se revisó la correspondencia entre los cinco criterios observables del issue, las deltas de la spec y las
tareas. La metadata del issue declara `surfaces: [documentation, harness-tooling]`; el change declara solo
`documentation` con la aprobación registrada del mantenedor. La comprobación nueva vive en `scripts/` y se
ejecuta desde `check:docs`, que es documentación, no arnés de agentes: no toca matriz de capacidades, doctor
ni idempotencia del constructor.

Esta lectura es del agente autor. No constituye revisión adversarial independiente ni revisión humana; la
revisión adversarial de cierre sigue pendiente en [tasks.md](../tasks.md) 5.1.

## Procedencia y límite

- No se modificó código, paquetes, lockfiles, tests, documentación pública ni specs principales durante la
  preparación. Solo existen los archivos de este change.
- No se generaron capturas ni se invocó archive, merge ni publicación en la fase de preparación.
- La auditoría histórica del handoff #167 (identidad de hashes, siete trampas) se heredó; la identidad se
  re-midió en esta sesión y el resultado coincide.

Próximo paso: apply completo autorizado — tarea 1.1 en adelante.
