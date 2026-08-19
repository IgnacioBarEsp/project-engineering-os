# Evidencia técnica vigente

Fecha operativa: 18 de agosto de 2026.

## Validación automática

```text
npm run check
PASS package contract
PASS public tree neutrality and export allowlist
PASS docs 18 README links
PASS workflows 3
132 tests passed, 0 failed

npm run check:audit
PASS dependency audit 0 high-or-critical findings, 0 exceptions

npm run fixture
PASS project-constructor empty repository fixture

openspec validate harden-supply-chain-policy --strict --no-interactive
Change 'harden-supply-chain-policy' is valid

openspec validate supply-chain-governance --type spec --strict --no-interactive
Specification 'supply-chain-governance' is valid
```

Las pruebas incluyen advisory high inyectado, errores de evidencia, excepción exacta, fechas inválidas,
cadena transitiva, default y opt-in de telemetría, binario ausente, status del child y contrato requerido
del workflow. El fixture completo instaló el blueprint y ejecutó OpenSpec mediante el wrapper.

## Repositorio recién bootstrapeado

Sobre una carpeta Git vacía creada con el blueprint de este change:

```text
npm run openspec:status
No active changes. Exit 0.

openspecEnvironment({}).OPENSPEC_TELEMETRY
0

openspecEnvironment({ OPENSPEC_TELEMETRY: '1' }).OPENSPEC_TELEMETRY
1
```

No se ejecutó `openspec config set`; la preferencia global del usuario quedó fuera de la mutación.

## Señal histórica separada

La comprobación adicional `openspec validate --all --strict` detectó que cuatro specs creadas antes de este
change carecen de `## Purpose`. La spec nueva valida y no causó esa deriva. El hallazgo está capturado como
deuda técnica Minor transversal y trazado en el Issue
[#25](https://github.com/IgnacioBarEsp/project-engineering-os/issues/25); no se reescriben contratos
históricos dentro del #18.

## Compatibilidad, costo y recuperación

- El wrapper usa solo Node ESM y `spawnSync` sin shell; el fixture y la suite cubren el contrato portable.
- El paquete conserva cero dependencias de runtime y costo incremental cero.
- MIT y notices permanecen vigentes; no se adopta Socket ni otro servicio.
- El cambio se revierte por commit. Las pruebas de política demuestran que retirar una excepción o restaurar
  el workflow vuelve a cambiar el gate de forma observable.
