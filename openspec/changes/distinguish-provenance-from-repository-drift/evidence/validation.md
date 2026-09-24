# Evidencia de validación

Fecha: 2026-09-24. Worktree de Windows; Node 24.18.0 y npm 11.19.1. La verificación remota de CI
queda pendiente hasta que exista el PR.

## Reproducción y regresión

- En el commit base `264367aef79e0ab1beacf7b4e0fef5e7fa3f4aed`, un consumidor preparado con una raíz
  del paquete y comprobado con una segunda raíz idéntica salvo por `README.md` devolvió `DRIFT`/1,
  cero operaciones materiales y `stateUpdate=true`; no informó el campo divergente.
- Con el cambio candidato, el mismo fixture devuelve `PROVENANCE_MISMATCH`/0, `hasDrift=false`, cero
  operaciones y `stateChanges` con `packageHash`/valores guardado y observado, en JSON y en salida
  humana. El snapshot exacto del consumidor no cambia.
- El fixture automatizado conserva `DRIFT`/1 para un archivo administrado modificado, un conflicto y
  metadatos reales distintos; comprueba también que `npm run project-os:check` termina 0 ante solo
  procedencia y termina 1 ante deriva de `AGENTS.md`.
- La prueba de compatibilidad migra un estado antiguo, repite el check y revierte la transacción; el
  snapshot previo y `stateFormatVersion=0` se restauran.
- La versión publicada 1.0.0 no se ejecutó: `.npmrc` aplica una espera mínima de siete días. Se usó un
  artefacto generado desde el candidato y una segunda raíz temporal para no desactivar esa política.

## Verificaciones automáticas locales

- `npm exec --yes --package=npm@11.19.1 -- npm run check`: PASS; paquete, neutralidad, enlaces/docs,
  workflows y deuda; 364/364 pruebas, 0 fallidas.
- `npm exec --yes --package=@fission-ai/openspec@1.6.0 -- openspec validate --all --strict`: PASS,
  21/21 specs y changes.
- Navegación documental de dos saltos comprobada: `docs/README.md` descubre `CLI_GUIDE.md`, y la guía
  CLI enlaza a `RECOVERY.md`; `check:docs` valida además los enlaces relativos.
- `node bin/project-os.mjs debt capture --root . --flow distinguish-provenance-from-repository-drift --input openspec/changes/distinguish-provenance-from-repository-drift/evidence/debt-input.json --json`:
  PASS, assessment `clean`, sin cambio del registro de deuda.
- `node bin/project-os.mjs debt check --root . --json` y `debt gate --phase pre-archive --change
  distinguish-provenance-from-repository-drift --json`: PASS; 4 hallazgos históricos abiertos, sin
  deuda nueva ni Blocker/Major abierto del flujo.
- `npm exec --yes --package=npm@11.19.1 -- npm run pack:verify`: PASS; generó e instaló el tarball
  local exacto, validó versión/help, bootstrap, segundo check y deuda. SHA-256
  `17f8159c84b7fee4f6452e6e6920de130ec8340e80de8ab95d7e3eeef42435bf`, 167 archivos, 267947 bytes.
  Esta ejecución fue antes del commit candidato; se repetirá con el commit integrado para fijar la
  procedencia del manifest.
- El primer `readiness-check --phase archive --run-local` confirmó 15 checks locales PASS, incluidos
  OpenSpec estricto y los gates de deuda; falló solo por cuatro tareas aún abiertas y las dos
  validaciones deliberadamente pendientes en esa etapa. Se repetirá cuando CI esté completo.

## Revisión, compatibilidad y rollback

- `evidence/adversarial-review.md` registra una auto-revisión adversarial del agente, no una revisión
  independiente. Identificó dos riesgos de clasificación, ambos corregidos y cubiertos por pruebas.
- La revisión de API confirma que no se agregan flags, dependencias ni formatos de estado; el contrato
  público es un nuevo valor de estado solo para `sync --check` y una lista JSON `stateChanges`.
- No cambia `package.json`, lockfiles, dependencias, licencia ni notices. No se incorpora proveedor,
  servicio externo o código de producto.
- El rollback de la migración legado quedó probado en integración; para revertir el cambio funcional
  basta revertir el PR. `sync --check` no escribe en el consumidor.

## CI protegido

Pendiente: la matriz multiplataforma, compatibilidad de Node, auditoría y checks externos se llenarán
con la URL y el resultado exactos del PR; no se anticipa un PASS.
