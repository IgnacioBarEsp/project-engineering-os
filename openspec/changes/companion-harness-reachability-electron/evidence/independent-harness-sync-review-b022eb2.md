# Revisión independiente acotada sobre `b022eb2` (`CHANGES_REQUESTED`)

- **Revisor**: subagente independiente de solo lectura (`c4e8612c-998e-4803-8d7a-cbcdc0384eba`; no ejecutó código, pruebas ni VM).
- **Fecha/hora UTC**: `2026-11-27T01:13:54Z`
- **Diff revisado**: `8443595b8702fb96f6e9a09a8a313779024054fe..b022eb221ef796a632bba9158bdebd29c86521e9` (`2` archivos: `apps/companion/scripts/verify-native-journeys.mjs` y `apps/companion/qa/verification-harness-contract.mjs`; `0` cambios en producto).
- **Veredicto**: **`CHANGES_REQUESTED`** (`0` Blocker, **`3` Major**, **`3` Minor**, `3` Notes).
- **Recibo persistente**: `artifacts/wave3-current/native-journeys-sync-8443595/independent-review-b022eb2.md` (`8,076` bytes, SHA256 `ffaa875617a486a088e596ccb41379e15a53ad9ece69d8e9f4b9345ecfaa54ad`).

## Confirmaciones de alcance

- Allowlist exacta respetada (`2` archivos; `0` archivos en `desktop/`, `ui/`, `engine/`, `context/`, `runtime/`, locks, CI o `.project-os/debt/`).
- La sincronización principal (`#content[aria-busy="false"]`, `#activity.hidden`, `#cancel.offsetParent === null`, eliminación de `waitForTimeout(1500)` tras `Leer mis archivos` y espera de `#project-panel[data-project-tab=...]` antes de `revealDetails(...)`) coincide con `core.mjs`, `progress.mjs` y `workspace.mjs` y mantiene las 7 pruebas previas intactas.

## Hallazgos registrados

### Major (`3`)

1. **Fuga potencial de rutas/usuario en `failure-state.json` y `failure.png` sin guarda en `catch (failure)`** (`verify-native-journeys.mjs:444-462, 848-874`):
   - `failure-state.json` serializa `error.message`, `feedback`, `evaluateError`, `findingsSoFar` y `anchored.leaking` sin redactar rutas.
   - `anchor()` solo reemplaza `workspace`, no `LOCALAPPDATA`, `APPDATA`, `tmpdir()`, `output` ni `homedir()` (visibles en `.path` de `environment-review`/`code-review`/`repair-review`/`stack-review`).
   - `:862-863` ignoran errores de `anchor()` y escriben `failure.png` incluso si `anchor()` falla o reporta fugas (`leaking.length > 0`).
2. **`evaluate()`/`anchor()` sin límite de tiempo y `screenshot()` con timeout por defecto de `180 s` en `catch (failure)`** (`verify-native-journeys.mjs:473, 848-864`):
   - Si el renderer queda colgado, `catch` puede bloquearse antes de escribir `failure-state.json`, relanzar `failure` o alcanzar `finally` (`taskkill`).
3. **Bucle de ingeniería `press()` ignora el retorno de `notBusy(900000)` y amplifica bloqueos hasta `105+` min** (`verify-native-journeys.mjs:614-622, 657-664`):
   - `:620` descarta el booleano de `notBusy(wait)` y devuelve `true`, registrando una etapa colgada como `walked` sin `finding`.
   - Llamar `notBusy(900000)` antes de `control.count()` (`:615`) hace que un bloqueo se repita `900 s` por cada patrón de `STAGES`.

### Minor (`3`)

4. `waitWorkspaceTab()` (`:490-496`) no corta cuando `notBusy` falla y sus 7 invocaciones ignoran el booleano (en `:631` un fallo silencioso degradaría el bucle de ingeniería a `unverified`).
5. `capture()` (`:805, 816-820`) no espera a que terminen las animaciones CSS finitas escalonadas de `.project-list > article`; **confirmado visualmente** al inspeccionar `native-proyectos.png`, donde la tercera tarjeta (`Serie de imágenes`) apareció a mitad del fade de entrada.
6. Las comprobaciones estáticas en `qa/verification-harness-contract.mjs:84-92` omiten verificar `#content` explícito, los otros sitios de `revealDetails(...)` y el gating de `failure.png` por `anchor()` limpio.

### Límites

Revisión estática de solo lectura de los `2` archivos modificados en `b022eb2`; no certifica producto, VM, recorridos humanos `#146`/`#147` ni cierre de ola 3. La reconciliación de estos hallazgos requiere aprobación literal de [native-journeys-review-reconciliation-amendment.md](../native-journeys-review-reconciliation-amendment.md).
