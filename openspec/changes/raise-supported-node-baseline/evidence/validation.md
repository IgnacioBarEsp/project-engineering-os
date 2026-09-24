# Validación de #155

Fecha: 2026-09-24. Rama `codex/155-raise-supported-node-baseline`, runtime local Node 24.18.0.

## Validaciones automáticas

| Comprobación | Resultado | Evidencia |
| --- | --- | --- |
| OpenSpec strict | PASS | `node_modules/.bin/openspec.cmd validate raise-supported-node-baseline --strict --no-interactive` |
| Suite del repositorio | PASS, 354/354, 0 fallos | `npm run check`; incluye package, neutralidad, docs, workflows, deuda y `node --test` |
| Fixture normal empaquetada | PASS | [bootstrap-fixture.json](bootstrap-fixture.json) |
| Fixture de toolchain aislado | PASS | [isolated-fixture.json](isolated-fixture.json) |
| Fixture limpia y rollback de transacción | PASS; restauró 90 elementos | [rollback-fixture.json](rollback-fixture.json), transacción `tx-2026-09-24T02-10-27-042Z-ba0b43c0` |
| `git diff --check` | PASS | comando ejecutado sobre el cambio |
| Captura y check de deuda | PASS, resultado de este flujo `clean` | [assessment](../../../../.project-os/debt/assessments/raise-supported-node-baseline.json); `debt check` detecta solo deuda preexistente y no pausa el plan |
| Matriz multiplataforma protegida | PENDIENTE | Se comprobará en CI del PR para Ubuntu, Windows y macOS con Node 22.22.0 y 24.x; el estado actual del gate temporal queda en [disposable-archive-gate.md](disposable-archive-gate.md) |

La inspección manual del consumidor normal confirmó `engines.node` igual en `package.json`, raíz del lock y entrada instalada del paquete; versión instalada `1.0.0`; tres celdas Node 22.22.0 y tres Node 24.x; ninguna celda Node 20. La app Companion conserva su runtime propio. El tarball local fue `create-project-engineering-os-1.0.0.tgz`, 506213 bytes, SHA-256 `a13218806ed340d1cc7618e26d3105e7aa42a45ff615c34eecb0abbd7e16bbdc`. El fixture verificó instalación desde ese tarball, primer bootstrap, segundo bootstrap no-op, `sync --check`, `opsx-check` y doctor JSON; los comandos terminaron con código 0.

El ensayo de rollback posterior a una modificación del fixture aislado fue rechazado con `ROLLBACK_CONFLICT` antes de escribir, porque `package.json`, `package-lock.json`, configuración y estado habían cambiado después de bootstrap. El ensayo de control se repitió en una fixture limpia sin instalación posterior y terminó `ROLLED_BACK`, restaurando 90 elementos. Esto demuestra tanto el rechazo conservador del fixture modificado como el rollback de una transacción intacta.

## Revisión manual y degradaciones declaradas

- API pública: no cambian las rutas `exports` ni los contratos públicos del paquete; `src/cli.mjs` no es una ruta exportada. El bump a `1.0.0` comunica la incompatibilidad deliberada de quitar Node 20.
- Licencias/dependencias: los lockfiles solo cambian versión, URL del tarball propio y engines; no se añade ni actualiza dependencia de terceros.
- Decisión registrada: [comentario del issue #155](https://github.com/IgnacioBarEsp/project-engineering-os/issues/155#issuecomment-5805918794) define el rango, major, Node 24 recomendado y Companion fuera de alcance.
- Migración: Node 20 requiere cambiar al menos a Node 22.22.0 o 24.18.0; no hay migración de datos. Los artefactos previos permanecen inmutables y el rollback de código previo a publicación es revertir el PR.
- Node 26 permanece excluido hasta LTS y revisión en el checkpoint documentado. No se altera la política de package manager ni el runtime de Companion.
- `npm run pack:verify` no se usó como gate: este checkout arrastra dos fallos EOL históricos ya documentados (font-index de Impeccable y `status.txt` vacío de #166). El chequeo de artefacto relevante se realizó con `npm pack` e instalación/ejecución desde el tarball en los fixtures indicados.

La revisión adversarial fue realizada por el agente de implementación y queda registrada en [adversarial-review.md](adversarial-review.md); no se atribuye aprobación humana o independiente. La revisión requerida en el PR sigue siendo un gate distinto.
