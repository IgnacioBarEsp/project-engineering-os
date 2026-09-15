## Why

La descarga pública existe, pero README y varias guías siguen orientando hacia una fase anterior del producto.
El mantenedor pide recuperar el propósito portable del método y confirma «Sí, Companion primero» el 2026-09-14.

## What Changes

- Entrada visual y guía breve en español; mantener una ruta CLI reproducible para automatización.
- Estado fechado que separe Companion publicado, cambios integrados y landing en construcción.
- Actualizar documentación operativa contradictoria y explicar función/ownership de las piezas del repositorio.
- Incorporar capturas reales con procedencia explícita; conservar originales, límites y detalle técnico.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `public-documentation-experience`: entrada Companion-first, versiones por canal, procedencia de capturas y
  lenguaje por tareas; el núcleo y la ruta CLI conservan su contrato.

## Impact

Issue: https://github.com/IgnacioBarEsp/project-engineering-os/issues/116.
Superficie: documentación y validaciones documentales. Sin nuevas dependencias, costo o licencia.
No cambia el runtime, sus APIs, la identidad visual ni los workflows oficiales de OpenSpec.
Publicar el instalador es #117; consolidar la landing y retirar duplicados confirmados es #118.
Riesgo principal: atribuir al instalador 0.1.0 cambios que solo existen en main.
Rollback: revertir el PR protegido, conservando assets publicados, historia SDD y archivos de usuarios.
