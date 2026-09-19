# Preparación verificada, sin apply

Issue: [#142](https://github.com/IgnacioBarEsp/project-engineering-os/issues/142).
Base: `a3b1efda6a53501a2a06e277cf0b7f18f11c6bed`.
Rama: `codex/142-companion-hotfix-spec`.
Los registros usan fecha UTC (19 de septiembre); corresponde al 18 de septiembre en America/Mexico_City.

## Evidencia ejecutada por este agente

| Control | Resultado | Registro |
| --- | --- | --- |
| DoR propose #142 | PASS: 13 PASS, 0 FAIL, 0 EXCEPTION; sin mutación | [readiness-propose.json](readiness-propose.json) |
| OpenSpec 1.6.0 local, validate strict/no-interactive | PASS, exit 0 | [openspec-strict.json](openspec-strict.json) |
| Documentación del repositorio | PASS, 25 enlaces README y 20 Purpose | [docs.json](docs.json) |
| Neutralidad | PASS, árbol y allowlist | [neutrality.json](neutrality.json) |
| Enlaces relativos de los artefactos nuevos | Resultado y número de referencias en registro | [artifact-links.json](artifact-links.json) |
| Preflight archive con run-local | FAIL esperado: 10 PASS, 6 FAIL, 0 EXCEPTION | [archive-preflight.json](archive-preflight.json) |

La metadata declara como pasados solo strict y neutralidad medidos durante preparación; deben volver a
medirse al cambiar código. El resto de la evidencia funcional/documental de cierre permanece pendiente.
`readiness-propose.json` acredita el issue, no la aprobación de esta nueva spec.

## Preflight de archivado y #115

Se ejecutó el comando read-only:

```sh
node bin/project-os.mjs readiness-check --phase archive --change companion-0-3-2-hotfix-actions-bar-clipboard --run-local --target . --json
```

Los seis fallos son `change.tasks` (19 pendientes, 0 completadas), `readiness.validations`,
`readiness.evidence`, `readiness.rollback`, `readiness.adversarial-review` y `debt.debt-gate`.
Son trabajo posterior a apply y a su aceptación; no se crearon excepciones, approvals ni assessments vacíos.

`local.openspec-strict` pasó. Para `surfaces: [documentation, ui]`, el catálogo solo ejecuta ese runner
local. No se ejecutaron doctor, sync ni OPSX, por lo que #115/#122 no aparecen como bloqueadores de este
preflight. Esto **no demuestra que estén corregidos** ni que un change con superficie harness-tooling
pueda archivarse. Si cambia el alcance, repetir el preflight con las superficies reales y registrar sus
fallos. Este change todavía no puede archivarse por las seis causas indicadas.

## Revisión documental propia

Se revisó correspondencia entre los seis criterios del issue, las tres deltas y las tareas. Decisiones
que evitan una implementación incompleta: usar el envelope mediante call; admitir texto multilínea sin
trim; conservar validación de contexto en copias existentes; distinguir barra final de acciones de tarjetas;
mantener submit por Enter; exigir observaciones y detección geométrica en la mutación; separar candidato
de descarga verificada. El diseño de sticky debe validarse durante apply, no se da por demostrado.

Esta lectura es del agente autor. No constituye revisión adversarial independiente ni revisión humana;
ambas etiquetas de evidencia mantienen su estado real. La revisión adversarial de cierre sigue pendiente.

## Procedencia y límite de entrega

- [Snapshot del issue #142](issue-142.json) y [hash/fecha de captura](source-provenance.json).
- La reproducción original de Electron se atribuye al dossier en [baseline](../brownfield-baseline.md).
- No se ejecutaron suites de producto, Electron, instalador ni `npm run check` completo en esta preparación.
  Son validaciones programadas en [tasks.md](../tasks.md); el handoff ya contiene una auditoría histórica
  y no se la presenta como resultado nuevo.
- No se modificó código, paquetes, lockfiles, tests, documentación pública ni specs principales.
  Solo se añadieron archivos de este change; no se invocó apply, archive, merge ni publicación.

Próximo paso: revisión y aprobación de esta spec, después continuar con la tarea 1.1. La instrucción
vigente del usuario detiene esta sesión aquí, antes de apply.
