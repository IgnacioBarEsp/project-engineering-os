# Evidencia de validación

Fecha operativa: 1 de septiembre de 2026. Runtime: Node 24.18.0, npm 11.16.0, Windows x64.

## Instalación limpia

```text
npm ci
added 85 packages; audit 0 vulnerabilities
npm exec --yes=false -- openspec --version
1.6.0
```

`node_modules/.bin/openspec` y `node_modules/.bin/openspec.cmd` existen. El manifiesto instalado declara
versión 1.6.0 y licencia MIT. `package.json` lo declara solo en `devDependencies`; `dependencies` permanece
vacío para OpenSpec.

La segunda instalación limpia conservó el lockfile con SHA-256
`1FD185A4E9E7B444B46ECB3712A4E44B51598259D1FABED29B4218BF0861EE07`.

## Gates

```text
OpenSpec strict: 9 passed, 0 failed
npm run check: PASS; 235 tests, 0 failed
npm run check:audit: PASS; 0 high-or-critical findings, 0 exceptions
npm run fixture -- --skip-install: PASS
npm run fixture: PASS
npm run pack:verify: PASS
```

`npm pack --dry-run --json` produjo 151 entradas, cero paquetes bundled y ningún `node_modules`. El tarball
verificado por `pack:verify` tuvo SHA-256
`a1b14b9e556ffec21f496d0c28cf3d9b3af33ae830e9228c652925c52e342757`.

## Límite conocido

El doctor del upstream todavía no puede clasificar `sdd.openspec-local` porque #49 debe sembrar primero la
política de readiness/perfil upstream. No es un fallo de la instalación: el binario, lockfile y auditoría se
verificaron de forma independiente. No se reporta ese doctor como PASS.
