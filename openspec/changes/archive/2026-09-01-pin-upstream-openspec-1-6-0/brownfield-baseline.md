# Brownfield baseline - OpenSpec local en el upstream

## 1. Superficie acotada

`package.json`, `package-lock.json`, la instalación de desarrollo del upstream y las comprobaciones de SDD,
doctor, auditoría y fixture. No se modifica el blueprint consumidor ni el runtime publicado.

## 2. Fuentes vigentes

- Issue [#48](https://github.com/IgnacioBarEsp/project-engineering-os/issues/48).
- `AGENTS.md`, que exige la CLI local fijada.
- `docs/SELF_APPLICATION.md`, sección de OpenSpec y desglose del issue #48.
- `openspec/specs/supply-chain-governance/spec.md`.
- `package.json` y `package-lock.json` actuales.

## 3. Comportamiento actual

La raíz declara únicamente `ajv` como dependencia de desarrollo. `npm ci` deja seis paquetes y elimina
OpenSpec. El binario solo existía en un `node_modules` heredado e incompleto, por lo que un clon o worktree
nuevo no puede ejecutar el paso SDD documentado.

## 4. Comportamiento objetivo

Cada `npm ci` instala exactamente OpenSpec 1.6.0, el binario local reporta esa versión y el doctor puede
clasificar `sdd.openspec-local` como PASS cuando se ejecuta sobre un target que aplica el perfil upstream.

## 5. Compatibilidad heredada

Se conserva OpenSpec 1.6.0, ya usado por consumidores y fixtures. No cambia el formato de artefactos ni los
workflows OPSX. La dependencia es de desarrollo y no altera `dependencies` del tarball publicado.

## 6. Owner de spec y contexto

Project Engineering OS posee el manifiesto, lockfile, gates y esta spec. OpenSpec conserva la propiedad del
CLI y de los workflows que genera. El issue #48 gobierna el cambio.

## 7. Evidencia prevista

`npm ci`, versión del binario local, validación estricta de OpenSpec, `npm run check`, `npm run check:audit`,
`npm run fixture -- --skip-install`, fixture completo, inspección del tarball y segunda instalación limpia.

## 8. Exclusiones

Actualizar OpenSpec; modificar archive o telemetría; bootstrapear el upstream como consumidor; adoptar
readiness/deuda in situ de los issues #49/#50; cambiar adaptadores o publicar una release.
