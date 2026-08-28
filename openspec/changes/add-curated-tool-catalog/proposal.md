## Why

Issue de origen: [#34](https://github.com/IgnacioBarEsp/project-engineering-os/issues/34).
Spike de origen: [#23](https://github.com/IgnacioBarEsp/project-engineering-os/issues/23).

La decisión sobre qué herramientas puede recomendar el núcleo ya está tomada y escrita en
`docs/ADAPTIVE_ONBOARDING.md`: tres tablas de catálogo, ocho pasos de investigación segura y una tabla de
amenazas con controles obligatorios. Nada de eso es verificable por máquina.

Lo que sí es ejecutable no cubre la decisión. `blueprint/core/project-os/skills.json` declara tres skills
con `enabled: false` y ninguna registra procedencia, licencia, costo, permisos, mantenimiento ni rollback.
`blueprint/core/project-os/mcp.json` declara `servers: []` y un `optionalCatalog` de cuatro entradas cuyo
`activationGate` es texto libre. `schema/` no contiene ningún schema de herramientas.

La consecuencia es concreta: hoy no se puede recomendar un CLI, una skill o un servidor MCP con procedencia
fijada, ni retirar una recomendación obsoleta sin editar prosa, ni demostrar que investigar una candidata no
escribió configuración.

## What Changes

- Añadir un schema versionado de entrada de catálogo con necesidad, procedencia fijada, licencia, costo,
  auth, datos, permisos, mantenimiento y rollback.
- Modelar los cuatro estados `universal`, `condicional`, `rechazado` y `pospuesto`, e impedir que un dato
  desconocido resuelva en un estado aprobado.
- Sembrar el registro inicial con GitHub, documentación vigente/Context7, Playwright y conocimiento
  estructural, citando la fuente oficial y la fecha de verificación de cada entrada.
- Añadir un comando read-only que evalúe una candidata y emita veredicto sin escribir configuración ni
  descargar ejecutables.
- Registrar la revisión obligatoria de `SKILL.md`, scripts y recursos, y dejar allowlist, pinning, diff y
  receipt declarados como insumos de una instalación futura y separada.
- Documentar el contrato y enlazarlo desde el índice de documentación y la decisión de onboarding
  adaptativo.

## Capabilities

### New Capabilities

- `tool-catalog`: el núcleo puede describir una herramienta con procedencia verificable y resolver su estado
  sin activarla, y puede evaluar una candidata sin escribir configuración ni descargar contenido remoto.

### Modified Capabilities

- Ninguna. `skills.json`, `mcp.json` y `permissions.json` conservan su contrato y su significado.

## Impact

- Añade `schema/tool-catalog.schema.json`, `blueprint/core/project-os/tool-catalog.json`,
  `src/tool-catalog.mjs`, el subcomando read-only en `src/cli.mjs` y `docs/TOOL_CATALOG.md`.
- No activa ningún proveedor: `servers` permanece vacío y las skills permanecen en `enabled: false`.
- No añade dependencias de runtime, licencias nuevas, servicios contratados ni costo. El runtime permanece
  MIT y sin dependencias de producción.
- No implementa autenticación, manejo de tokens ni sesiones: el registro describe requisitos de auth y no
  autentica.
- Riesgo medio y contenido: enumerar proveedores puede leerse como recomendación por defecto y una licencia
  copiada puede envejecer en silencio. Se mitiga exigiendo decisión aprobada para activar y fecha de
  verificación por entrada. Rollback por revert; el cambio es aditivo y no deja configuración activada.
