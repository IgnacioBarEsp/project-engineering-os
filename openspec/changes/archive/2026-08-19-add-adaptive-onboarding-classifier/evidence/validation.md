# Evidencia de validación

## Resultado integral

- `npm run check`: PASS, 164/164 tests.
- Package contract: PASS para `create-project-engineering-os@0.1.6`.
- Neutralidad y allowlist pública: PASS.
- Documentación: PASS, 20 enlaces del README verificados.
- Workflows: PASS, 3 workflows.
- `npm run pack:verify`: PASS; tarball exacto instalado, ejercitado y con schemas/módulo incluidos.
- OpenSpec 1.6.0 `validate --all --strict`: PASS, 7/7 items antes de archive.
- `git diff --check`: PASS.
- Node 20.20.0/Windows, suite específica de onboarding: PASS, 24/24 después de confirmar junctions con
  `lstat`; corrige la diferencia observada en la primera ejecución de CI.

## Clasificador y contrato

`test/onboarding.test.mjs` aporta 24 casos específicos: cinco respuestas, tres rutas, precedencia brownfield,
Git vacío/historia/dirty/remoto, symlinks, límites, directorio vacío, privacidad, estado v0/v1/futuro,
canonicalidad, size cap, schemas, distribución, salida humana/JSON y errores CLI redactados.

`test/constructor.integration.test.mjs` ejecuta `onboarding-plan` desde un consumidor bootstrapeado, valida
el estado con JSON Schema y compara el snapshot exacto antes/después. El resultado conserva
`mutationPerformed=false`, remoto `not-contacted` y `rebootstrapAllowed=false` en brownfield.

## Compatibilidad y distribución

La suite existente sigue cubriendo bootstrap, segundo run, sync, doctor, cinco harnesses, OPSX, rollback,
upgrade, deuda, readiness, cadena de suministro y release. `pack:verify` instaló el tarball real y ejecutó
bootstrap desde él. El módulo usa Node estándar y rutas de `node:path`; la matriz CI del PR deberá repetir
Node 20/22 en Windows, macOS y Ubuntu.

## Seguridad y privacidad

- Git usa `shell=false`, timeout, optional locks off, fsmonitor/untracked cache off y submodules ignorados.
- Inputs se limitan a 256 KiB y no atraviesan symlinks.
- Scanner usa `opendir`, profundidad/entradas acotadas y no lee contenido arbitrario.
- URL remota, file contents, claves desconocidas y mensajes nativos de parseo no aparecen en output.
- Estado canónico rechaza hash, ruta, listas, orden, versión o respuestas inconsistentes.

## Nota sobre el tarball

El hash del dry-run corresponde al árbol de trabajo previo al commit y no se presenta como artefacto de
release. La identidad publicable se recalculará en el workflow protegido después del merge.
