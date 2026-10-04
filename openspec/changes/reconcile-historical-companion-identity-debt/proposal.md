## Why

El issue [#206](https://github.com/IgnacioBarEsp/project-engineering-os/issues/206) reúne 37 registros históricos abiertos. El hallazgo `debt-bee2fa0c0549` sigue abierto aunque su corrección está integrada: el assessment de saneamiento cerró `debt-53f4fcdb6a67`, un registro equivalente con otro título. La primera fase corrige esa trazabilidad sin repetir el trabajo ni declarar resueltos los otros hallazgos.

## What Changes

- Versionar el inventario de los 37 IDs y el triage ya publicado, con procedencia, límites y prioridades estimadas; no convertir sus etiquetas diagnósticas en estados de resolución.
- Después de aprobar esta spec, capturar un assessment nuevo con `resolves.id` igual exclusivamente a `debt-bee2fa0c0549`, mediante el CLI oficial existente.
- Verificar 50 items conservados, abiertos 37 → 36, otros 49 objetos idénticos, assessments históricos byte-idénticos, configuración y presupuesto sin cambio, y recaptura sin cambios.
- Añadir evidencia de identidad, pruebas negativas y recuperación acotada; enlazarla desde la documentación upstream.
- Mantener #206 abierto como paraguas: esta fase no resuelve los otros 36. El futuro PR usará `Refs #206`, no cierre automático.

## Capabilities

### New Capabilities

Ninguna: no se añade una API ni un motor de deuda alternativo.

### Modified Capabilities

- `debt-control`: explicitar el cierre histórico por ID inequívoco, la conservación de la evidencia y los límites de una reconciliación parcial en el requisito upstream existente.

## Impact

Se tocarán el expediente OpenSpec, documentación upstream, verificaciones de la reconciliación, un assessment nuevo y el estado de un único item del registro. No hay cambio de CLI público, matching, schemas, runtime, UI, dependencias, configuración ni políticas de presupuesto.

Superficies: `documentation` y `harness-tooling`. Coste/licencia: herramientas locales ya fijadas, MIT existente, sin compras, servicios, credenciales ni nueva instalación. Owner: IgnacioBarEsp.

## Non-Goals

No resolver automáticamente los otros 36; no usar el cierre de un issue como prueba de resolución; no presentar el diagnóstico completo como auditoría exhaustiva; no simular pruebas humanas, nueva instalación o identidad binaria actual. No cambiar npm, gestor, excepciones de auditoría o protecciones; no iniciar ola 4.

## Risk and Recovery

El riesgo principal es cerrar el ID equivocado o atribuir alcance nuevo a evidencia antigua. Se mitigará con preflight por ID, diffs completos, hashes y límites explícitos. Antes de integrar, se conservarán el baseline y la captura candidata por separado; una captura incorrecta no se publicará como resolución válida. No se promete reabrir mediante el CLI: no ofrece esa operación y un revert aislado del registro conservaría un assessment de resolución contradictorio. Véase [design.md](design.md).

## Gates

DoR pasó 13/13, sin excepciones. **Spec aprobada por el mantenedor («apruebo»); Apply en curso**, según evidence/spec-approval.md. #204 no bloquea preparar ni comprobar esta fase local, pero el CI requerido sigue siendo obligatorio: no habrá merge rojo, debilitamiento de protecciones ni declaración de cierre de ola 3.
