# Brownfield baseline - catálogo curado de herramientas

## 1. Superficie acotada

Registro de herramientas y su schema, comando read-only de evaluación, semillas del blueprint para skills y
MCP, y la documentación que hoy contiene la decisión en prosa.

## 2. Fuentes vigentes

- `docs/ADAPTIVE_ONBOARDING.md`, secciones "Catálogo de herramientas", "Investigación segura de skills" y
  "Amenazas y controles".
- `blueprint/core/project-os/skills.json` y `blueprint/core/project-os/mcp.json`.
- `blueprint/core/project-os/permissions.json` y `harness-capabilities.json`.
- `schema/onboarding-answers.schema.json` y `schema/onboarding-state.schema.json` como precedente de
  contrato versionado.
- Issue [#34](https://github.com/IgnacioBarEsp/project-engineering-os/issues/34) y spike
  [#23](https://github.com/IgnacioBarEsp/project-engineering-os/issues/23).

## 3. Comportamiento actual

`skills.json` declara tres skills con `enabled: false` y ningún campo de procedencia, licencia, costo,
permisos o rollback. `mcp.json` declara `servers: []` y un `optionalCatalog` de cuatro entradas cuyo
`activationGate` es texto libre. No existe schema de herramientas en `schema/`. Ninguna recomendación es
verificable por máquina ni retirable sin editar prosa.

## 4. Comportamiento objetivo

Un registro versionado describe cada herramienta con campos obligatorios y resuelve uno de cuatro estados.
Un comando read-only evalúa una candidata, emite veredicto y no escribe configuración ni descarga contenido.
Retirar una entrada deja el catálogo y el bootstrap válidos.

## 5. Compatibilidad heredada

Se preservan `skills.json`, `mcp.json`, `permissions.json` y sus políticas actuales. El catálogo describe;
no activa. `servers` permanece vacío, las skills permanecen en `enabled: false` y ninguna semilla existente
cambia de significado.

## 6. Owner de spec y contexto

Project Engineering OS upstream posee el schema, el registro y el comando. Cada herramienta de terceros
conserva su propia licencia y términos, que el registro cita con fecha sin apropiarse de ellos. El issue #34
gobierna el cambio.

## 7. Evidencia prevista

OpenSpec estricto, pruebas negativas de schema y de frontera read-only, `npm run check`,
`npm run check:audit`, segunda ejecución sin drift, revisión adversarial, Debt Control y verificación
fechada de licencia, costo y auth por entrada sembrada.

## 8. Exclusiones

Instalar, descargar, activar proveedores, implementar autenticación, crear un marketplace y el planner/apply
de trackers remotos quedan fuera.
