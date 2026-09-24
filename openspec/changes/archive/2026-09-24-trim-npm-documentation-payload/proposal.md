## Why

[Issue #156](https://github.com/IgnacioBarEsp/project-engineering-os/issues/156) identifica el payload upstream que llega al consumidor de npm y fija el alcance de esta propuesta.

El paquete npm del núcleo incluye documentación específica de Companion, archivos de diseño Stitch y una captura que no pertenece al producto publicado. La allowlist amplia de Markdown permite que contenido upstream y visual llegue por omisión a quienes instalan solo la CLI; el inventario actual contiene 193 archivos y 1.404.376 bytes sin comprimir.

## What Changes

- Sustituir los globs amplios de documentación por rutas explícitas del núcleo, CLI, recuperación, ownership, ADRs, herramientas y cadena de suministro. La exclusión afecta solo al tarball, no al repositorio.
- Empacar y comprobar el tarball real contra las rutas permitidas; comprobar también sus enlaces relativos tras extraerlo.
- Registrar en el manifest de release la cantidad de archivos y los bytes sin comprimir, conservando la verificación de versiones ya publicadas que aún no incluyan esas métricas.
- Actualizar el mapa del repositorio, la guía de releases y las entradas de documentación para que reflejen el paquete y no enlacen localmente a contenido excluido.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `distribution`: el tarball SHALL cumplir su allowlist declarada, sus documentos SHALL tener enlaces relativos resolubles dentro del paquete y el manifest SHALL registrar conteo de archivos y bytes sin comprimir en nuevas releases.

## Impact

`package.json`, `scripts/check-package.mjs`, `scripts/pack-release.mjs`, verificadores y pruebas del manifest, documentación pública y OpenSpec. No se añaden dependencias ni se modifican `blueprint/`, `src/`, `schema/`, `bin/`, Companion, tags ni releases existentes. La reversión es `git revert` del PR; las publicaciones ya existentes conservan sus bytes.
