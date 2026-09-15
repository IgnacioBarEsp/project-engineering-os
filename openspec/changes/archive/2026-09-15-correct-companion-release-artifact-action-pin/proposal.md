## Why

El primer dispatch de `companion-v0.2.0` falló durante la preparación del job: el SHA de
`actions/upload-artifact` terminaba en `d` y la referencia oficial de v7.0.1 termina en `a`. No hubo
checkout, build, draft, asset ni publicación. La fuente de la release se mantiene íntegra; sólo se corrige
el pin del workflow antes de reintentar el mismo tag.

## What Changes

- Corregir el SHA exacto de `actions/upload-artifact@v7.0.1` en el workflow Companion.
- Convertir esa identidad en una aserción de QA, no sólo una cadena de 40 caracteres.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `companion-distribution`: el workflow de publicación debe resolver cada acción fijada antes de poder
  construir, verificar o publicar un candidato.

## Impact

Issue: https://github.com/IgnacioBarEsp/project-engineering-os/issues/117.

No modifica tag, release, asset, documentación pública, core npm ni datos de usuario.
