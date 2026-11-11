## Why

Root y consumer-blueprint fallan la política de auditoría por zod anterior a 4.6.6, dependencia dev del OpenSpec local 1.6.0. Existe una corrección oficial dentro del rango ya declarado; debe comprobarse sin convertir el desbloqueo en una actualización de herramienta o de política.

Refs [#214](https://github.com/IgnacioBarEsp/project-engineering-os/issues/214). Base main `9751c301976fe27e9bbad33e69f39372b69f901e`. Owner: IgnacioBarEsp. Propuesta sin aprobación ni implementación.

## What Changes

- Actualizar únicamente `version`, `resolved` e `integrity` de `packages["node_modules/zod"]` en `package-lock.json` y `blueprint/core/package-lock.json` al zod oficial 4.6.6 fijado en diseño.
- Conservar manifests, OpenSpec 1.6.0, los demás nodos de lock, dependencias de producción y herramientas/controles de instalación.
- Añadir comprobaciones proporcionales de identidad/diff y regresiones del aviso, y verificar instalaciones desechables, auditorías originales y compatibilidad real de OpenSpec/constructor.
- Conservar baseline, fallos, revisión independiente, deuda, recuperación y gates de integración.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `supply-chain-governance`: el requisito de CLI SDD reproducible explicita la versión mínima corregida de su dependencia de validación y la correspondencia entre los dos locks.

## Impact

Producción: dos entradas de lock, tres campos cada una. Los cambios adicionales permitidos son pruebas de integridad/regresión, evidencia y este expediente; no se cambia código de zod o OpenSpec. No hay cambio de API pública, servicio, costo externo o licencia propuesta: MIT existente. El tarball y su LICENSE siguen pendientes de verificación.

No se modifican package.json, política de auditoría, excepciones, .npmrc, CI, Node soportado, gestor, npm de Companion, catálogo, notices de producción, instalador o generados OPSX. Una identidad/licencia inesperada o una necesidad de otro nodo/archivo de producción detiene este alcance.

Riesgos: el rango semver no demuestra compatibilidad; las fixtures o el registry pueden revelar otros fallos. Cada fallo conserva su alcance y bloquea su gate. La propuesta no resuelve npm/Companion ni permite integrar PR con CI requerido rojo.

Rollback: rechazo preintegración con baseline intacto; después de una integración permitida, revert completo y revisado. No borrar evidencia o declarar seguro el baseline anterior. No inicia ola 4.
