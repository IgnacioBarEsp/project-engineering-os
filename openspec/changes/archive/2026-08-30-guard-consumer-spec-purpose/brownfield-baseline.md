# Brownfield baseline - gate de Purpose en el consumidor

## 1. Superficie acotada

El módulo de inspección de Purpose, el gate de documentación del upstream, el comando read-only `opsx-check`
y la superficie exportada de `src/index.mjs`.

## 2. Fuentes vigentes

- `scripts/spec-purpose.mjs` y `test/spec-purpose.test.mjs`, introducidos por el Issue
  [#42](https://github.com/IgnacioBarEsp/project-engineering-os/issues/42) y el PR
  [#44](https://github.com/IgnacioBarEsp/project-engineering-os/pull/44).
- `scripts/check-docs.mjs`, único llamador actual.
- `src/opsx-check.mjs` y `src/index.mjs`.
- `blueprint/core/package.json`, que define lo que ejecuta un repositorio bootstrapeado.
- `package.json`, cuyo campo `files` publica `bin`, `blueprint`, `docs`, `schema` y `src`.
- Issue [#45](https://github.com/IgnacioBarEsp/project-engineering-os/issues/45) y su comentario de diseño.

## 3. Comportamiento actual

`check:docs` falla cuando una capability publicada del upstream no declara Purpose, lo declara vacío o
conserva el texto que siembra el archive. Ese gate no se distribuye. En un repositorio bootstrapeado,
`project-os:check` encadena `sync --check`, `opsx-check` y `debt:check`, y `openspec:validate` corre
`validate --all --strict`; ninguno lee el cuerpo de las specs publicadas.

## 4. Comportamiento objetivo

El mismo veredicto lo emite `opsx-check` en cualquier repositorio, con severidad `FAIL`, recuperación que
nombra el archivo y fallo cerrado ante un árbol de specs ilegible. La lógica es única y compartida entre el
gate del upstream y el comando publicado.

## 5. Compatibilidad heredada

Los cinco modos de fallo del Issue #42 se conservan sin renombrar ni fusionar. `check:docs` conserva su
salida. `opsx-check` conserva sus checks actuales y añade los suyos. Ningún consumidor guarda estado del
gate, y `opsx-check` sigue siendo read-only.

Migración declarada: un consumidor cuyas specs publicadas ya arrastran el texto sembrado verá un fallo nuevo
después del upgrade. Es deuda preexistente que se vuelve observable, no un falso positivo.

## 6. Owner de spec y contexto

Project Engineering OS upstream posee el módulo, el comando y el requisito. OpenSpec conserva la propiedad
de su proceso de archive y del texto que siembra; este cambio no lo modifica, solo lo observa. El issue #45
gobierna el cambio y su decisión de diseño quedó aprobada en el issue.

## 7. Evidencia prevista

OpenSpec estricto, `npm run check`, `npm run fixture -- --skip-install`, casos negativos nuevos sobre
`opsx-check`, y comprobación manual sobre un target bootstrapeado real de que el gate rechaza la spec
sembrada por el archive y acepta la redactada.

## 8. Exclusiones

Cambiar OpenSpec o su archive; reescribir specs de consumidores; extender el gate a los deltas de
`openspec/changes`; escribir el contrato de spec completo de `opsx-check` y `readiness-check`, que es deuda
aparte.
