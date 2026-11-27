# Enmienda propuesta: sincronización determinista del harness instalado `verify-native-journeys.mjs`

**Pendiente de aprobación literal sobre esta revisión inmutable.** No está aplicada ni autoriza cambios en `apps/companion/` ni otro ciclo de Windows Sandbox hasta recibir aprobación explícita y DoR `13/13`. Owner: `IgnacioBarEsp`. El presupuesto anterior del ciclo VM corregido (`1/1` sobre `20fbe4c`) quedó consumido con fallo en la Fase 2 y **no se reinicia**.

## Por qué hace falta esta decisión acotada

Sobre `20fbe4cc685023a3bf27a9483d592c94cb0cf307` (CI `45906034881` `12/12 SUCCESS`, autorización literal registrada):

1. Los **`2/2` builds reproducibles** pasaron (`win-unpacked/` `2,662` archivos / `458,983,230` bytes `100%` idénticos, `d8ea18bb...`; `resources/npm-dist.zip` idéntico `fef16d4e...`; `verify-app-artifact.mjs` `2/2 PASS`, `NotSigned`; delta NSIS `5` bytes documentado). Véase [reproducible-builds-20fbe4c.md](evidence/reproducible-builds-20fbe4c.md).
2. El único ciclo VM corregido (`1/1`) pasó la **Fase 1** (`packaged-runtime.json` `PASS`: actualización `0.3.6 -> 0.3.7`, métricas emparejadas, migración legacy intacta, reparación cancelada y crash real recuperado, matriz Node `22.22.0`/`24.18.0`/`24.20.0`, desinstalación), pero **FALLÓ en la Fase 2** (`canonical-0.1.0-update-native-uninstall`, `exit 1`, `288,799 ms`) en `apps/companion/scripts/verify-native-journeys.mjs:520:29` con `Timeout 180000ms exceeded` en `Archivos`. Véase [corrected-vm-cycle-20fbe4c.md](evidence/corrected-vm-cycle-20fbe4c.md).
3. El diagnóstico estático demostró que el fallo corresponde a carreras de sincronización del propio harness `verify-native-journeys.mjs` (no a un cambio pedido en el producto):
   - `:505` duerme un fijo `1,500 ms` tras pulsar `Leer mis archivos`, mientras `previewContext` crea un `Worker` e importa `pdfjs-dist` para `research/articulo.pdf` (acotado en el producto por `PARSER_STARTUP_MS = 60000`). Al superar `1,500 ms` en la VM fría, `:506` omite `Guardar y continuar`, `:516` abre `#project-tools` aún en `workspace` (`<summary>` no se deshabilita con `setBusy`), `:519` espera a que `previewContext` termine y `showContextReview()` reemplace `#view` (eliminando `Archivos` del DOM), dejando `:520` en timeout `180 s` sin nodo coincidente (`0` matches confirmado por Playwright `1.62.1` `coreBundle.js:23490-23520`).
   - En el mismo archivo, `notBusy()`/`settle()` (`:455-460`) observan `Detener` (`#cancel`), que `ui/components/progress.mjs:25` oculta los primeros `1,000 ms` y oculta antes de `showWorkspace()` + `renderReady` (a diferencia de `#content[aria-busy="false"]` usado por `verify-ui.mjs:72,156` y `verify-project-screens.mjs:82,109,212`), y `revealDetails(...)` en `:516`, `:580`, `:672`, `:717` y `:789` (especialmente `native-tu-ia` `:786-790`) corre antes de esperar al panel destino y al estado inactivo.
   - Además, `verify-native-journeys.mjs` no guarda estado ni captura de fallo en su `catch` antes de cerrar Electron.

## Allowlist exacta propuesta (2 archivos de harness/QA, 0 archivos de producto)

Solo estos dos archivos, más documentación/evidencia OpenSpec de `#150`/`#218`:

1. `apps/companion/scripts/verify-native-journeys.mjs`
   - Preimage actual: `56,749` bytes, SHA256 `91e0e9311fe731c40900582290ccdca280a6b04828185ad2360b04fb9050c01c`.
   - Cambio acotado:
     - Definir espera determinista sobre `#content[aria-busy="false"]` (conservando el límite de `180,000 ms` y el registro de `finding` ante bloqueo real), en coherencia con `ui/lib/core.mjs:108,129`, `verify-ui.mjs` y `verify-project-screens.mjs`.
     - Eliminar el sleep fijo de `1,500 ms` tras `Leer mis archivos` (`:505`): esperar a que la acción termine (`#content[aria-busy="false"]`), pulsar `Guardar y continuar` si aparece (o registrar el mismo `finding` si falta ya inactivo) y esperar a `#content[aria-busy="false"]` y `#project-panel[data-project-tab="overview"]` antes de abrir `#project-tools` con `revealDetails`.
     - Aplicar la misma espera de inactividad + panel esperado antes de `revealDetails(...)` y clics en `:515-525` (`Archivos`/búsqueda), `:579-582` (`Preparación`), `:668-682` (reapertura → `Archivos`), `:716-720` (`Preparación` → tecnología) y `:784-792` (`capture('native-tu-ia')`, esperando primero el detach de `article.project`, el panel `overview` y estado inactivo).
     - En caso de error no capturado dentro del `try`, escribir `failure-state.json` (escenario activo, URL/hash, título, botones visibles, texto de `#feedback` y error) y `failure.png` (pasando por `anchor()` para no filtrar rutas de cuenta) antes del `finally`, **relanzando el error con salida distinta de 0** (nunca ocultar ni convertir un fallo en `PASS`).
     - No relajar ninguna aserción, ningún `finding`, ningún control de citas/reflow/tecnología/preservación/anclaje ni ningún timeout.
2. `apps/companion/qa/verification-harness-contract.mjs`
   - Preimage actual: `5,063` bytes, SHA256 `6b0eeb27edf955c073be3f3171604fa7b53b8122be40b40bc44a6db9f24384de`.
   - Cambio acotado: añadir pruebas unitarias/estáticas que verifiquen que `verify-native-journeys.mjs` sincroniza mediante `#content[aria-busy="false"]` y espera del panel destino antes de `revealDetails(...)` (sin el `waitForTimeout(1500)` tras `Leer mis archivos` y con captura diagnóstica de fallo que preserva el rechazo) manteniendo íntegros todos los contratos actuales.

**Fuera de allowlist (0 cambios):** `apps/companion/desktop/`, `ui/`, `engine/`, `context/`, `runtime/`, `package.json`, `package-lock.json`, `scripts/pack-app.mjs`, `scripts/verify-app-artifact.mjs`, `scripts/verify-release-installation.mjs`, `scripts/project-disclosures.mjs`, `Electron 44.9.1`, `npm 11.21.2`, workflows de CI, `.project-os/debt/` (`97` archivos) y políticas.

## Reutilización del instalador verificado y presupuesto adicional explícito

- **Reutilización del instalador `20fbe4c` (`0` builds adicionales)**: como los cinco directorios empaquetados (`desktop/`, `ui/`, `engine/`, `context/`, `runtime/`), manifiestos, dependencias, Electron `44.9.1` y `resources/npm-dist.zip` permanecen **100% byte-idénticos**, se reutiliza el instalador Build 1 ya verificado (`ProjectEngineeringOS-Setup-0.3.7-x64.exe`, `133,698,243` bytes, SHA256 `3b6410b47da3e141ee00786aedc91ac673f28faed31e3a36a2aae474581d8197`, `win-unpacked` `d8ea18bb...`, `2/2` builds reproducibles `PASS`) y se conserva el recibo `PASS` de la Fase 1 (`packaged-runtime.json`, SHA256 `97fcc659...`) sobre esos mismos bytes, registrando explícitamente por separado el SHA del instalador/producto (`20fbe4c`) y el SHA del harness corregido (sin modificar `artifact-manifest.json`).
- **Presupuesto adicional solicitado (acumulativo; conserva los fallos y consumos previos de `e713` y `20fbe4c`)**:
  - `1` variante congelada de los `2` archivos listados arriba;
  - `1` ejecución local de `node --test qa/verification-harness-contract.mjs` (límites sin cambio);
  - `1` ciclo adicional de Windows Sandbox offline (`4 GiB`, `<Networking>Disable</Networking>`, `<ProtectedClient>Enable</ProtectedClient>`, entradas RO, evidencia propia) ejecutando `verify-release-installation.mjs` (`0.1.0 -> 0.3.7` usando el instalador Build 1 `20fbe4c`, `6` perfiles canónicos / `7` escenarios nativos, reapertura, reflow, tecnología, conservación de archivos originales, capturas ancladas, desinstalación y conservación de centinelas);
  - `1` revisión independiente acotada de solo lectura sobre el diff de los `2` archivos + CI requerida completa (`12/12` en 3 SO) sobre el commit resultante.
- **Condición de parada**: si la regresión o el ciclo VM adicional falla o revela un defecto real de producto, **detenerse inmediatamente sin reintento**, conservar `failure-state.json`, `failure.png` y todos los recibos, y presentar el resultado real.
- **Gates posteriores intactos**: esta enmienda no sustituye los recorridos humanos reales (`#146` y Software A/B `#147`), el assessment final append-only de deuda, los archivos oficiales en orden (`#218`, luego `#144`→`#150`), ni el merge protegido de PR `#217`. Sin instalación en host, sin release pública y sin ola 4.
- **Recuperación**: `git revert` revisado sobre los `2` archivos de harness/QA; sin migración ni alteración de datos, artefactos ni fallos retenidos.
