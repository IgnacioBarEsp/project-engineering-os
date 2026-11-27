# Resultado de `8443595` (`b022eb2`): regresión 8/8 PASS, VM canónica PASS, CI 12/12 SUCCESS y revisión CHANGES_REQUESTED

Tras la [aprobación literal](native-journeys-sync-approval-8443595.md) de `8443595` y DoR fresca `13/13` en `#150` y `#218`, se consumió por completo el presupuesto adicional autorizado (`1/1` variante congelada, `1/1` regresión, `0` builds extra, `1/1` ciclo VM offline adicional, `1/1` revisión independiente acotada y CI requerida; `0` restante).

## 1. Variante congelada y regresión local (`8/8 PASS`)

- **Commit congelado del harness**: `b022eb221ef796a632bba9158bdebd29c86521e9` (`0` archivos de producto tocados; los `5` directorios empaquetados `desktop/`, `ui/`, `engine/`, `context/`, `runtime/`, `package.json`, `package-lock.json` y `97` archivos de `.project-os/debt/` coinciden byte a byte con `20fbe4c`).
  - `apps/companion/scripts/verify-native-journeys.mjs`: `60,511` bytes, SHA256 `6aa388182ded87e88005f5a77551533cb65ac88a12d9d263142fe956bbeb8afb`.
  - `apps/companion/qa/verification-harness-contract.mjs`: `5,908` bytes, SHA256 `b446b22a3f427ead63e544304872be9a2ad34b569bd5fe6fcd4eeea474e31d55`.
- **Instalador reutilizado sin cambios (`0` builds adicionales)**: `ProjectEngineeringOS-Setup-0.3.7-x64.exe` de Build 1 `20fbe4c` (`133,698,243` bytes, SHA256 `3b6410b47da3e141ee00786aedc91ac673f28faed31e3a36a2aae474581d8197`, `Electron 44.9.1`, `npm 11.21.2`, `resources/npm-dist.zip` `fef16d4e...`).
- **Regresión local (`node --test qa/verification-harness-contract.mjs`, Node `v24.18.0`)**: **`8 tests / 8 PASS / 0 FAIL / 0 CANCELLED / 0 SKIP`** en `167.19 ms` TAP (`232 ms` proceso, `exit 0`, `0` bytes stderr).

## 2. Ciclo adicional de Windows Sandbox offline (`PASS`)

- **Sandbox**: `109a11db-0ea2-4221-a1fe-5e4a2bee5504` (`4096 MB`, `<Networking>Disable</Networking>`, `<ProtectedClient>Enable</ProtectedClient>`, entradas RO, detenido limpiamente `exit 0`; `wsb list` vacío).
- **Duración total**: `156,640 ms` (`142,754 ms` en `verify-release-installation.mjs`, `exit 0`).
- **Actualización y desinstalación (`installer-cycle.json`, SHA256 `3f9bfe9e...`)**: **`PASS`** (`0.1.0 -> 0.3.7`), `removed: ["installation", "Project Engineering OS.lnk"]`, `preserved: ["project-sentinel.txt", "history-sentinel.txt", "runtime-sentinel.txt"]`.
- **Identidad verificada dentro de la ventana instalada (`native-journeys.json`, SHA256 `27837a9b...`)**:
  - `branchCommit: b022eb221ef796a632bba9158bdebd29c86521e9`, `branchTreeClean: true`, **`100/100`** archivos fuente coincidentes (`mismatched: []`, `onlyInstalled: []`), `runtimeMatches: true`, `sealedArchiveMatches: true`.
  - **`6` perfiles canónicos / `7` escenarios completados (`0` hallazgos)**:
    - `research` (`paper`, `9,327 ms`): cita `articulo.pdf · página 1` (`ok: true`), sobrevivió reapertura, `3/3` originales intactos.
    - `software` (`service`, `7,468 ms`): cita `README.md · línea 3` (`exact-line`, `ok: true`), sobrevivió reapertura, `2/2` originales intactos.
    - `software-game` (`game`, `7,531 ms`): cita `notas.txt · línea 1` (`exact-line`, `ok: true`), sobrevivió reapertura, `3/3` originales intactos.
    - `studies` (`course`, `5,810 ms`): cita `rubrica.md · línea 3` (`exact-line`, `ok: true`), sobrevivió reapertura, `2/2` originales intactos.
    - `content` (`creative`, `5,908 ms`): cita `ficha.docx · párrafo 1` (`ok: true`), sobrevivió reapertura, `3/3` originales intactos.
    - `business` (`plan`, `5,875 ms`): cita `notas.txt · línea 1` (`exact-line`, `ok: true`), sobrevivió reapertura, `2/2` originales intactos.
    - `personal` (`open`, `5,939 ms`): cita `notas.txt · línea 1` (`exact-line`, `ok: true`), sobrevivió reapertura, `2/2` originales intactos.
  - **`14` entradas `unverified` (comportamiento honesto en VM offline)**: en `software` y `software-game`, las etapas de descarga/herramientas gestionadas (`prepareTools`, `applyEnvironment`, `applyEngineering`, `activateWorkflows`, `reviewCodeMap`, `buildCodeMap`, `searchSymbols`) quedaron registradas explícitamente como `unverified` sin fingir `PASS`.
  - **Capturas y navegación**: `4/4` destinos (`Inicio`, `Tus proyectos`, `Preparar proyecto`, `Ayuda`) y `5/5` capturas con `screenshotPathAnchored: true` (`0` fugas de ruta). Al inspeccionar visualmente las 5 PNGs, `native-inicio.png`, `native-ayuda.png`, `native-window.png` y `native-tu-ia.png` son nítidas, mientras `native-proyectos.png` capturó la 3.ª tarjeta (`Serie de imágenes`) a mitad del fade escalonado (confirmando el hallazgo Minor 5 de la revisión independiente).
  - **Recibo previo de Fase 1 conservado**: `packaged-runtime.json` (`97fcc659...`) de `20fbe4c` cubre exactamente los mismos bytes del instalador Build 1 (`3b6410b4...`) y se conserva junto a los fallos históricos (`e713` y `20fbe4c` Fase 2).

## 3. CI requerida y revisión independiente (`CHANGES_REQUESTED`)

- **CI sobre `b022eb2`**: run [45920686534](https://github.com/IgnacioBarEsp/project-engineering-os/actions/runs/45920686534) — **`12/12 SUCCESS`** (incluido `CI / required`, `CI / Companion Electron / windows-latest`, `CI / dependency audit`, 3 SO core y Companion).
- **Revisión independiente acotada** ([independent-harness-sync-review-b022eb2.md](independent-harness-sync-review-b022eb2.md)): **`CHANGES_REQUESTED`** (`0` Blocker, **`3` Major** en rutas de error/teardown y `press()`, `3` Minor). Conforme a gobernanza, **no** se modificó `apps/companion/` fuera del presupuesto consumido de `8443595`; la reconciliación queda propuesta en [native-journeys-review-reconciliation-amendment.md](../native-journeys-review-reconciliation-amendment.md) (**pendiente de aprobación**).

## Artefactos persistentes

Prefijo: `artifacts/wave3-current/native-journeys-sync-8443595/`.

| Archivo | Bytes | SHA256 |
| --- | ---: | --- |
| `approval.json` | 1493 | `a4b34f8b37fc4d13b9d925ca941115eb6d86abd469d641e3ccb4b22d24e0d14a` |
| `dor-150.txt` | 3499 | `e336e234d879cda1821d077d7af6cff7d066fb1e5d7f386a398535bb3854a132` |
| `dor-218.txt` | 3532 | `db6e6c8f0165ac218a25224cdce386848866a430ff21599065ed6ca7061e85ba` |
| `frozen-variant.json` | 1793 | `3adfdd21872d242f8aa02ff02d5cc7598e98fd0df5f32304bfe7976e53e46d12` |
| `regression-stdout.tap` | 1952 | `34c0bf0e862aea42d1beddd8c60cd862991719dcc2abeb6402c9bcc3bc6a715d` |
| `candidate-b022eb2.wsb` | 2378 | `df9b1935412a58764e144933503bc43637daf9e350e4300db7e4ed4b99dd5b98` |
| `vm-start.json` | 159 | `fb45a9dcf26d92d9ef14da25142c46e60eb32320a89f02cb3ce5368d0b792828` |
| `vm-summary.json` | 11589 | `fa1e93e32bffd0024192eacb81174a841f916864e8f86dcd5f5d53b68958c57b` |
| `vm-evidence/canonical-cycle/installer-cycle.json` | 3040 | `3f9bfe9ed077859ae8dcd40f321586d786bcd2b9594b9fb0690bf06aa7588d43` |
| `vm-evidence/canonical-cycle/native/native-journeys.json` | 58438 | `27837a9bd2615eab525c0b92338d641eabf4f63430362e340c5192b399809ef2` |
| `vm-evidence/canonical-cycle/native/native-window.png` | 195609 | `b338316593fcfe27d4ec80d042126ac7e011663d6e1438cb3f507698b4907789` |
| `vm-evidence/canonical-cycle/native/native-inicio.png` | 517192 | `609251e0ef4437a37cc95134c9e242976410886708ec942b00275fb1c8e72f11` |
| `vm-evidence/canonical-cycle/native/native-proyectos.png` | 620859 | `599b95d796592f39b7fb149f9a649bcb61377b85617f945bd8be1161855956a1` |
| `vm-evidence/canonical-cycle/native/native-ayuda.png` | 306935 | `c1f1d774fe102fda916660add8266a95e963dca1bce83abe4fd031b981d8bd4c` |
| `vm-evidence/canonical-cycle/native/native-tu-ia.png` | 477295 | `954369b356a977ebc7e6eb4b3aaf79f7b831794afe60dc65ff002bcc46decf42` |
| `vm-evidence/commands.json` | 584 | `144b5a8da6fd979a1c35916c83c0875168920bb35b18792166d5ac9dc2d85cb2` |
| `vm-evidence/final.json` | 8784 | `480c7ebdacfc170ba726e60af676128593b53cc0d5db117482c289de6bd3824b` |
| `independent-review-b022eb2.md` | 8076 | `ffaa875617a486a088e596ccb41379e15a53ad9ece69d8e9f4b9345ecfaa54ad` |
