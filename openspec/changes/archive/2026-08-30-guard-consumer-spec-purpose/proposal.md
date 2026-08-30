## Why

Issue de origen: [#45](https://github.com/IgnacioBarEsp/project-engineering-os/issues/45).
Dependencia cerrada: [#42](https://github.com/IgnacioBarEsp/project-engineering-os/issues/42).

`openspec archive` publica una capability nueva con un texto sembrado bajo `## Purpose` que invita a
redactarlo después. `validate --all --strict` lo acepta, porque solo exige que la sección exista. El Issue
#42 cerró ese hueco en el upstream cableando `scripts/spec-purpose.mjs` en `check:docs`.

Ese gate no llega a nadie más. `files` del `package.json` publica `bin/`, `blueprint/`, `docs/`, `schema/` y
`src/`, y no `scripts/`. Un repositorio creado con el blueprint ejecuta el mismo archive, recibe el mismo
texto sembrado y ninguno de sus gates lo mira: `project-os:check` encadena `sync --check`, `opsx-check` y
`debt:check`, y ninguno lee el cuerpo de las specs.

La deuda es reproducible en cada capability nueva de cada repositorio consumidor, y su recurrencia ya está
demostrada en el upstream: #25 la cerró y #42 la volvió a encontrar.

## What Changes

- Mover el módulo de inspección de Purpose a `src/spec-purpose.mjs`, que sí se publica, conservando sus
  cinco modos de fallo.
- Cablearlo en `opsx-check`, el comando read-only que el consumidor ya ejecuta en cada `project-os:check`,
  con severidad `FAIL` y una recuperación que nombre el archivo concreto y qué escribir en él.
- Hacer que `scripts/check-docs.mjs` importe ese mismo módulo, de forma que upstream y consumidor compartan
  una única fuente de verdad.
- Exportar el módulo desde `src/index.mjs` y documentar el contrato nuevo.
- Registrar la entrada de CHANGELOG con nota de migración para consumidores cuyas specs ya arrastran el
  texto sembrado.

## Capabilities

### Modified Capabilities

- `runtime`: el diagnóstico read-only de la superficie OPSX pasa a exigir que cada capability publicada
  declare un Purpose redactado, con recuperación accionable y fallo cerrado ante un árbol de specs ilegible.

## Impact

Cambio de comportamiento de un comando publicado: `opsx-check` falla donde antes pasaba. Versión minor con
nota de migración. Sin dependencias, licencias ni costo nuevos: solo módulos estándar de Node.
