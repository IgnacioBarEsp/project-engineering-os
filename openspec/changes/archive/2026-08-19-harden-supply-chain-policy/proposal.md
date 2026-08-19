## Why

Issue de origen: [#18](https://github.com/IgnacioBarEsp/project-engineering-os/issues/18).

El paquete publicado no tiene dependencias de runtime y sus lockfiles están limpios, pero CI no impide
que reaparezca una vulnerabilidad alta, las señales de Socket no tienen un triage versionado y los
comandos OpenSpec del blueprint heredan telemetría sin un default conservador del proyecto.

## What Changes

- Añadir un gate de `npm audit` para la raíz y la plantilla consumidora, con umbral `high` y excepciones
  exactas, aprobadas, temporales y recuperables.
- Hacer que el check requerido de CI dependa de ese gate y comprobar su contrato con pruebas unitarias.
- Desactivar por defecto la telemetría en los comandos OpenSpec administrados por Project Engineering OS,
  conservar un valor explícito del usuario y no modificar su configuración global.
- Registrar el triage de Socket, la atribución correcta de dependencias y el límite de invocaciones
  directas fuera de los scripts del proyecto.
- Mantener el contrato que alinea `allowScripts` con la versión fijada de OpenSpec.

## Capabilities

### New Capabilities

- `supply-chain-governance`: auditoría obligatoria de dependencias, excepciones acotadas, atribución de
  señales de terceros y default local de privacidad para herramientas administradas por el proyecto.

### Modified Capabilities

- Ninguna. Los requisitos actuales de distribución permanecen válidos y la nueva política se expresa en
  una capacidad independiente.

## Impact

- Afecta scripts de validación, CI, pruebas, documentación y archivos administrados del blueprint.
- No añade dependencias de runtime, servicios de pago ni cambios de licencia; el costo incremental es cero.
- OpenSpec 1.6.0 solo soporta configuración global de telemetría. El proyecto gobernará sus propios scripts
  mediante un wrapper y documentará que una invocación directa de `npm exec openspec` queda fuera.
- Riesgo principal: que npm audit esté indisponible o que una excepción oculte más de un advisory. Ambos
  casos fallarán de forma explícita. Rollback: revertir el change y repetir los checks y el fixture.

