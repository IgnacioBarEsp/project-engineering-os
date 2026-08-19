## Why

Issue de origen: [#20](https://github.com/IgnacioBarEsp/project-engineering-os/issues/20).

`github-plan` afirma que leyó una ruta inexistente cuando en realidad usa un seed, y sobre el upstream
propone la gobernanza de discovery de un consumidor. El comando read-only debe decir de dónde obtuvo sus
datos y describir el repositorio que recibió como target.

## What Changes

- Distinguir fuentes `target`, `blueprint-seed` e `inline-manifest` en salida humana y JSON.
- Usar `.project-os/repository-governance.json` como fuente upstream cuando existe.
- Mantener `.project-os/github/product-os.json` como contrato de repositorios consumidores.
- Normalizar project, statuses, labels, ruleset, tags y environment como recursos del dry-run.
- Declarar cero discovery issues en el upstream y conservar los del seed consumidor.
- Documentar ambas fuentes sin presentar sus taxonomías como una sola política.

## Capabilities

### New Capabilities

- Ninguna.

### Modified Capabilities

- `runtime`: el plan read-only de GitHub debe reportar procedencia real y respetar la gobernanza del target.

## Impact

- Afecta `src/github-plan.mjs`, salida CLI, pruebas, documentación y el manifest upstream.
- El campo `source` del fallback pasa de una ruta target ficticia a la ruta real del seed; se añade
  `provenance` para que consumidores no tengan que inferir el origen.
- No añade dependencias, costos, licencias, autenticación ni mutaciones remotas.
- Rollback por revert; el Project remoto permanece sin cambios.
