## Why

Issue de origen: [#48](https://github.com/IgnacioBarEsp/project-engineering-os/issues/48). El spike
[#46](https://github.com/IgnacioBarEsp/project-engineering-os/issues/46) demostró que `AGENTS.md` exige una
CLI local fijada mientras `package.json` y `package-lock.json` no declaran OpenSpec. Tras `npm ci`, un clon o
worktree nuevo no puede ejecutar el propio flujo SDD del upstream.

## What Changes

- Declarar `@fission-ai/openspec` 1.6.0 como dependencia exacta de desarrollo.
- Autorizar el script de instalación únicamente para el par nombre/versión fijado.
- Regenerar el lockfile y demostrar que una instalación limpia expone `node_modules/.bin/openspec` 1.6.0.
- Verificar que OpenSpec estricto, auditoría, fixture, paquete y suite completa siguen sanos.

## Non-goals

- Actualizar OpenSpec o cambiar su proceso de archive.
- Añadir OpenSpec a las dependencias de runtime del paquete publicado.
- Aplicar al upstream el bootstrap completo de un consumidor.
- Publicar, hacer push o abrir PR desde esta tarea local.

## Capabilities

### Modified Capabilities

- `supply-chain-governance`: el upstream declara y audita la misma CLI exacta que exige para su SDD, sin
  contaminar el grafo de runtime ni el tarball público.

## Impact

Se amplía únicamente el grafo de desarrollo y el lockfile. OpenSpec 1.6.0 es MIT y no requiere cuenta ni
costo para el flujo local. El rollback es revertir el commit.
