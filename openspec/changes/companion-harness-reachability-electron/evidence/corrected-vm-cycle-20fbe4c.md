# Ciclo VM canónico corregido (1/1 consumido) sobre 20fbe4c — Fase 1 PASS, Fase 2 FAIL

Tras completar los `2/2` builds reproducibles de `20fbe4cc685023a3bf27a9483d592c94cb0cf307`, se ejecutó el único ciclo canónico corregido en Windows Sandbox offline (`1/1` consumido, `0` restantes, sin reintento) sobre el instalador Build 1 verificado (`ProjectEngineeringOS-Setup-0.3.7-x64.exe`, `133,698,243` bytes, SHA256 `3b6410b47da3e141ee00786aedc91ac673f28faed31e3a36a2aae474581d8197`, `Electron 44.9.1`, `npm 11.21.2`).

**Dictamen final del ciclo: `FAIL`** (el `PASS` de la Fase 1 conserva únicamente su alcance acotado de runtime/migración/recuperación/multi-Node y no convierte en verde el fallo real de la Fase 2 ni cualifica los recorridos nativos instalados).

## Configuración y ejecución del Sandbox

- **Aislamiento**: Windows Sandbox offline (`4096 MB`, `<Networking>Disable</Networking>`, `<ProtectedClient>Enable</ProtectedClient>`, todas las carpetas de entrada montadas en solo lectura, evidencia escrita únicamente en directorio propio).
- **ID de sandbox**: `7fa7018d-eded-40ed-81ee-86dbedfc8b5f` (host `8203d5fa-cf62-42ed-a4ee-3f6f7dcecb5c`, usuario `WDAGUtilityAccount`).
- **Nota operativa**: `wsb start --raw` inició la instancia sin sesión interactiva de `WDAGUtilityAccount`; adjuntar la misma instancia en curso mediante `wsb connect --id 7fa7018d-eded-40ed-81ee-86dbedfc8b5f` disparó `<LogonCommand>` en `33 s` (`started.json` a las `2026-11-26T23:50:18.904Z`) sin crear una segunda VM. Al finalizar el ciclo (`2026-11-27T00:00:43.956Z`), la VM se detuvo limpiamente (`wsb stop` `exit 0`; `wsb list` vacío).

## Fase 1 — Actualización 0.3.6 → 0.3.7, runtime empaquetado, migración, recuperación y multi-Node: `PASS`

Fuente: `vm-evidence/packaged-runtime.json` (`8,823` bytes, SHA256 `97fcc659079fcb6a4a4bdea0222e4df35935f8bf7f2e417c7ef687281232e329`).

- **Instalación y actualización silenciosa**:
  - `0.3.6` baseline `/S`: `64,496 ms` (`exit 0`).
  - `0.3.6 -> 0.3.7` candidato `/S`: `46,073 ms` (`exit 0`); los `5` directorios de fuente instalados (`runtime`, `engine`, `ui`, `context`, `desktop`) coinciden en hash de árbol con `20fbe4c`.
- **Métricas emparejadas (una muestra por trabajador aislado; baseline `0.3.6` no es apta ni fallback)**:
  - `baseline036` (`npm 11.19.1`, `ee294c53...`): `cold` `17,793.63 ms` (`maxRSS 164,792`), `warm` `9,158.45 ms` (`maxRSS 73,684`), `repair` `31,329.55 ms` (`maxRSS 207,360`).
  - `candidate037` (`npm 11.21.2`, `treeHash 5f3ed514...`, `distribution eac8d055...`): `cold` `10,568.04 ms` (`maxRSS 184,576`, `selectionGeneration 1`), `warm` `3,277.18 ms` (`maxRSS 71,992`, `selectionGeneration 1`), `repair` `24,258.63 ms` (`maxRSS 195,280`, `selectionGeneration 2`).
- **Migración legacy**: `legacyTreeUnchanged: true`, `priorNpmNotExecuted: true`, `unfitFallbackRejected: true` (`NPM_UNKNOWN`), `projectHistoryPreserved: true`.
- **Recuperación**: reparación cancelada (`AbortController` en `npm-quarantined`, `cancelledRepair: true`) y caída real por terminación abrupta (`realCrashRepair: { exit: { code: 1, signal: null }, recovered: true }`) completadas.
- **Matriz multi-Node contra `npm 11.21.2` empaquetado**:
  - Node `22.22.0` (`bae898ad...`) → `npm 11.21.2` (`PASS`)
  - Node `24.18.0` (`9a4eb5f1...`) → `npm 11.21.2` (`PASS`)
  - Node `24.20.0` (`5c976096...`) → `npm 11.21.2` (`PASS`)
- **Desinstalación de Fase 1**: `Uninstall Project Engineering OS.exe /S` (`106 ms`, `exit 0`) y eliminación de `C:\Scratch\application` verificadas.

## Fase 2 — Ciclo canónico 0.1.0 → 0.3.7, recorridos nativos y desinstalación: `FAIL`

- **Comando**: `verify-release-installation.mjs C:/Input/Candidate C:/Input/Baseline010 C:\Evidence\canonical-cycle` → invocó `verify-native-journeys.mjs`.
- **Resultado**: `code: 1`, `elapsedMs: 288,799 ms` (`4 min 48.8 s`), `stdout: ""`.
- **Error exacto**:
  ```text
  locator.click: Timeout 180000ms exceeded.
  Call log:
    - waiting for getByRole('button', { name: 'Archivos', exact: true, includeHidden: true }).first()
      at C:\Input\Source\apps\companion\scripts\verify-native-journeys.mjs:520:29
  ```
- **Alcance no completado**: no se completó ni siquiera el primer perfil (`research`); los perfiles 2–7 (`software`, `software-game`, `studies`, `content`, `business`, `personal`), las capturas nativas y la desinstalación/preservación de centinelas de la Fase 2 no se ejecutaron. `canonical-cycle/native` quedó vacío porque `verify-native-journeys.mjs` solo escribe `native-journeys.json` en la línea 817 tras finalizar el bucle.

## Diagnóstico estático forense (hechos demostrados vs. límites no observados)

### Hechos demostrados por los recibos de la VM y el código fuente

1. **Ocurrió en el primer perfil (`research`)**: `verify-native-journeys.mjs:739` imprime una línea en `stdout` al terminar cada perfil. `commands.json` registra `stdout: ""` en el proceso hijo, probando que el perfil #1 (`research`, el único con `articulo.pdf`) nunca llegó a la línea 739.
2. **La línea 517 NO agotó `180 s`; solo la línea 520 agotó `180 s`**: el tiempo total de `verify-release-installation.mjs` fue `288.8 s` (`108.8 s` antes del timeout de `180 s` en `:520`, que incluye instalar `0.1.0`, actualizar a `0.3.7`, verificar hashes, preparar 7 fixtures y lanzar Electron). Si `:517` (`sources.first().waitFor({ timeout: 180000 })`) también hubiera expirado, el total superaría `360 s`. Por tanto, en `:517` el botón `Archivos` **estuvo visible** y `:518` (`sources.count()`) fue verdadero.
3. **Durante los `180 s` de `:520`, NO existió ningún botón `Archivos` en el DOM (ni visible ni oculto)**: en el código de Playwright `1.62.1` ejecutado (`playwright-core/lib/coreBundle.js:23490-23520`), si `getByRole(..., { includeHidden: true })` resuelve a cualquier nodo (incluso oculto dentro de un `<details>` cerrado), `click()` agrega la línea `locator resolved to <...>` al Call log. El Call log de una sola línea demuestra `0` nodos coincidentes en todo el DOM durante los `180 s`.
4. **Causa raíz de sincronización en `verify-native-journeys.mjs:504-520`**:
   - Al pulsar `Leer mis archivos` (`:504`), `prepareContext()` ejecuta `previewContext`, que crea un `Worker` (`context/sources.mjs:77-92`) e importa dinámicamente `pdfjs-dist/legacy/build/pdf.mjs` para `research/articulo.pdf` (`context/parser-worker.mjs:25-27`, acotado por `PARSER_STARTUP_MS = 60000` precisamente porque el arranque en frío supera segundos en equipos lentos).
   - `verify-native-journeys.mjs:505` duerme un fijo `await page.waitForTimeout(1500)` en lugar de esperar a `#content[aria-busy="false"]`.
   - Cuando `previewContext` tarda `> 1,500 ms` en la VM fría, `:506` evalúa `save.count()` mientras la pantalla sigue en `workspace` (`0` coincidencias), omite `save.click()`, y continúa inmediatamente a `:516`, donde `revealDetails(sources.first())` hace clic en `<summary>Herramientas opcionales</summary>` (no deshabilitado por `ui/lib/core.mjs:108` `setBusy(true)`), abriendo `#project-tools` y haciendo visible `Archivos` para que `:517` y `:518` pasen al instante.
   - A continuación `:519` (`notBusy()`) espera a que `previewContext` termine; al terminar, `showContextReview()` reemplaza `#view` por la pantalla `context-review` (que no tiene botón `Archivos`), y `:520` queda esperando `180 s` por un botón que ya no está en el DOM.
5. **Otras carreras de sincronización co-localizadas en `verify-native-journeys.mjs`**:
   - `notBusy()`/`settle()` (`:455-460`) observan `Detener` (`#cancel`), que `ui/components/progress.mjs:25` oculta los primeros `1,000 ms` y oculta al recibir `stage: 'idle'` antes de que `showWorkspace()` termine `call('guide')` + `render(...)` + `startViewTransition` (a diferencia de `#content[aria-busy="false"]`, que `ui/lib/core.mjs:108,129` mantiene hasta completar `await state.renderReady` y que ya usan `verify-ui.mjs:72,156` y `verify-project-screens.mjs:82,109,212`).
   - `revealDetails(...)` en `:516`, `:580`, `:672`, `:717` y `:789` (en particular `capture('native-tu-ia')` `:786-790`, que ni siquiera espera el detach de `article.project`) puede ejecutarse antes de que el panel destino exista en el DOM, haciendo que `project-disclosures.mjs:4` (`if (await locator.count() !== 1) return`) retorne sin abrir `<details id="project-tools">`.

### Límites honestos no observados

- `verify-native-journeys.mjs` no guardó captura de pantalla ni volcado del DOM al lanzar la excepción en la VM; la atribución a `context-review` se demuestra por eliminación y trazado exacto del código fuente + Call log de Playwright `1.62.1` + `stdout: ""` + aritmética de tiempos, pero no incluye una captura directa del instante del timeout.
- Ninguno de los perfiles 2–7 ni la desinstalación final de Fase 2 fueron observados en esta corrida.
- El presupuesto `1/1` del ciclo VM corregido queda **agotado** (`0` restantes). No se modificó ningún archivo de `apps/companion/` ni se lanzó ningún reintento. La propuesta concreta siguiente está en [native-journeys-sync-amendment.md](../native-journeys-sync-amendment.md) (**pendiente de aprobación**).

## Artefactos persistentes

Prefijo: `artifacts/wave3-current/builds-and-vm-20fbe4c/`.

| Archivo | Bytes | SHA256 |
| --- | ---: | --- |
| `candidate-20fbe4c.wsb` | 3267 | `5247883353a3ba1347cadcff858da41efb693ffbff1b1dd455666465a12bceb1` |
| `vm-start.json` | 148 | `e7139d6ede308e2e8886a666b9af4703e3e2264365b2e8b6e8494c8f96815cb0` |
| `vm-summary.json` | 9482 | `89ea6f67ecd0595f1960cda28da6212d95b9f83240a3b4f6abe15d8f2928b03b` |
| `vm-evidence/started.json` | 443 | `d1c7d2ad27abf2e55197198b9035a746e0b727e137e759585eaca7d2371a71c7` |
| `vm-evidence/baseline036-cold.json` | 1032 | `ece212ee019fc8c1ce41afa7702b55f599e5cc71fd83ea8bf2701e7f249b0658` |
| `vm-evidence/baseline036-warm.json` | 1025 | `ff146ceebb527f51d069cfa8ee4638ccc24c5bc4d3dc5125f6dca7a468f9cb95` |
| `vm-evidence/baseline036-repair.json` | 1036 | `c9bfaeb41ac02116b93b5d30db0d2022cad64906ef76e0482412282ac5ba4a62` |
| `vm-evidence/candidate037-cold.json` | 1261 | `d15e4882f8acc149271d22afca4d632a7de0c0c3f99d20f958d577f234d2d8e2` |
| `vm-evidence/candidate037-warm.json` | 1254 | `e9a26bf54ebe93699344312923ece0a34805d3dada2adf5d68d72ea2b2ac256b` |
| `vm-evidence/candidate037-repair.json` | 1264 | `8a14909940c1bb752410a6c5bb2ab0db1dcd4816137751f9e3cf32401c5707ab` |
| `vm-evidence/packaged-runtime.json` | 8823 | `97fcc659079fcb6a4a4bdea0222e4df35935f8bf7f2e417c7ef687281232e329` |
| `vm-evidence/commands.json` | 7045 | `0dbd39b745ea350feb9803e5091c74c6e5a10ba47c3595450916feda0a14a9d2` |
| `vm-evidence/final.json` | 7158 | `a45be3aae4c78186bbde25d65936d156b821836963f2ecee107f7a24270227af` |
| `vm-evidence/finished.json` | 54 | `4be2ad4bd7ebdefa5ab2a345c295833e670305de410ca163a028c4bea0a2408b` |
