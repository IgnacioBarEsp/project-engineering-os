## Why

Project Engineering OS documenta tres rutas de adopción, pero hoy no puede distinguir de forma reproducible
una carpeta nueva de un repositorio brownfield ni conservar esa decisión en un contrato machine-readable.
El Issue #30 convierte la decisión aprobada en #23 en un clasificador local y read-only antes de orquestar
prompts o integrar servicios remotos.

## What Changes

- Añadir un comando `onboarding-plan` que inspecciona señales acotadas del target sin escribir ni usar red.
- Aceptar un archivo JSON opcional con hasta cinco respuestas normalizadas; `unknown` y `defer` son válidos.
- Elegir `beginner`, `experienced-new` o `brownfield`, dando prioridad a evidencia existente explicable.
- Emitir el mismo plan canónico en texto y JSON, con inventario, preguntas pendientes y próximos pasos.
- Definir un estado de onboarding versionado, una migración en memoria desde v0 y rechazo explícito de
  estados corruptos o creados por una versión futura.
- Añadir schemas, documentación y pruebas negativas, de idempotencia, empaquetado y multiplataforma.
- No cambiar Prompt 00/01, crear trackers, instalar skills/MCP ni elegir arquitectura o CI/CD de producto.

## Capabilities

### New Capabilities

- `adaptive-onboarding`: Clasificación read-only, contrato de respuestas, estado canónico, migración y
  representación humana/JSON para las tres rutas de onboarding.

### Modified Capabilities

Ninguna. El bootstrap, doctor, GitHub plan y las demás capacidades actuales conservan su contrato.

## Impact

- Runtime y API pública: `src/cli.mjs`, nuevo módulo de onboarding y export desde `src/index.mjs`.
- Contratos: schema público del estado/respuestas y salida estable del nuevo comando.
- Distribución: el comando y los schemas deben quedar incluidos en el tarball sin dependencia de runtime.
- Evidencia: tests unitarios/negativos, integración sobre paquete instalado, `npm run check`, `pack:verify`
  y matriz CI en Windows, macOS y Linux.
- Costo y licencia: cero; solo módulos estándar de Node y licencia MIT existente.

## Risks and Rollback

Las heurísticas pueden producir falsos brownfield o leer más de lo necesario. La implementación solo usa
nombres y metadatos allowlisted, no sigue symlinks fuera del target y explica cada señal. Un estado futuro,
inválido o ambiguo falla con recuperación; nunca habilita una mutación. El rollback es revertir el cambio y
volver a la release previa: `onboarding-plan` no habrá escrito estado ni recursos remotos.
