# Validación — fix-marker-homograph-detection

Ejecutada el 20 de septiembre de 2026 sobre `ff91d4c`. El árbol del change está limpio salvo los artefactos
de esta evidencia y los archivos históricos de EOL que ya existían en el checkout. Ninguna comprobación se
presenta como revisión humana.

## Resultado por validación

| Validación | Resultado | Evidencia |
| --- | --- | --- |
| `openspec-strict` | PASS | `npx openspec validate fix-marker-homograph-detection --strict --no-interactive` |
| `unit-and-contract-tests` | PASS, 351/351 en `npm run check`; el archivo específico añade el corpus 34/19 | `npm run check`, `test/readiness.test.mjs` |
| `package-artifact-test` | PASS, `npm pack --dry-run --json` produjo 192 entradas; instalación local del tarball cargó el paquete | `npm pack --dry-run --json`, smoke en `work/issue-162-install-smoke` |
| `backward-compatibility-test` | PASS, 34/34 y 19/19, 50 cambios archivados sin flags nuevos | `evidence/after/marker-measurement.json` |
| `constructor-tests` | PASS, incluido en la suite completa | `npm run check` |
| `capability-matrix-check` | PASS, `check:workflows` y las pruebas de matriz en verde | `npm run check` |
| `second-run-idempotence` | PASS, la suite de constructor comprueba convergencia sin drift | `npm run check` |
| `multi-platform-smoke` | PENDIENTE: se ejecutaron Windows fixture normal y `--isolated-toolchain`; falta la matriz protegida de CI | `npm run fixture`, `npm run fixture -- --isolated-toolchain` |

## Checks de harness y target de ejecución

El checkout upstream no tiene la forma de consumidor que esos runners esperan:
su ejecución directa conserva los fallos históricos descritos abajo. La guía de
self-application exige ejecutar el gate con `--run-local` sobre un consumidor
bootstrapeado. En esa fixture, después de un `sync` explícito y aislado, los
tres runners pasan; el recibo está en
[disposable-archive-gate.md](disposable-archive-gate.md).

Resultados directos sobre el upstream, sin mutación:

- `sync --check`: **FAIL preexistente**, `PROJECT_OS_PROFILE_SELECTION_DRIFT` entre `config.json` y
  `.project-os/profiles.json` (#122).
- `opsx-check`: **FAIL preexistente**, falta `.project-os/openspec-ownership.json`.
- `doctor --json`: **FAIL preexistente**, 4 FAIL, incluido `profile.ui`, `profile.auth-security`,
  `profile.library-cli` y `github.project`.
- `npm run pack:verify`: **FAIL preexistente**, dos archivos históricos no respetan EOL LF:
  `.github/skills/impeccable/scripts/data/font-index.json` y el `status.txt` vacío de la vía `via-b` de #166.
  `npm pack --dry-run` y la instalación del tarball sí pasan; no se tocaron esos archivos fuera de alcance.

El change no corrige #115/#122 ni la contaminación del checkout porque el diseño
los declara fuera de alcance. La evidencia del consumidor es la que respalda los
estados `passed` de `sync-check`, `opsx-check` y `doctor-json-check` en
`readiness.json`; el gate sigue pendiente por la matriz protegida y las tareas
de cierre, no por esos runners.

## Evidencia manual

- `public-api-review`: no cambian exports públicos ni dependencias; el cambio está en el detector interno y su
  prueba.
- `license-review`: no se añadieron paquetes; el `npm pack` se instaló sin vulnerabilidades reportadas.
- `install-and-rollback-smoke`: instalación local del tarball y ensayo de revert documentado en
  [rollback-rehearsal.md](rollback-rehearsal.md).
- `recovery-rehearsal-for-one-transaction`: PASS, el test `rollback normal restaura el repositorio previo y
  conserva evidencia del journal` pasó junto con 29 casos del archivo de integración (30/30, 0 fallos).
- `review-of-declared-degradations`: los tres fallos de harness y el EOL histórico están listados arriba sin
  convertirlos en PASS.
