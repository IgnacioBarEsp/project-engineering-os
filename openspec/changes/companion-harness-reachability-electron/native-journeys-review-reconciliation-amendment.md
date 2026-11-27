# Enmienda propuesta: reconciliación de la revisión independiente sobre `b022eb2` (`3` Major, `3` Minor)

**Pendiente de aprobación literal sobre esta revisión inmutable.** No está aplicada ni modifica `apps/companion/` hasta recibir aprobación explícita y DoR `13/13`. Owner: `IgnacioBarEsp`. El presupuesto de `8443595` (`1/1` variante, `1/1` regresión, `1/1` VM, `1/1` revisión) quedó consumido y **no se reinicia**.

## Por qué hace falta esta reconciliación acotada

Sobre `b022eb221ef796a632bba9158bdebd29c86521e9`, el ciclo adicional de Windows Sandbox offline pasó completo (`0.1.0 -> 0.3.7`, `6` perfiles / `7` escenarios, `0` hallazgos, `5/5` capturas ancladas, desinstalación limpia, `156.6 s`) y CI `45920686534` terminó `12/12 SUCCESS`. Sin embargo, la revisión adversarial independiente ([independent-harness-sync-review-b022eb2.md](evidence/independent-harness-sync-review-b022eb2.md)) devolvió **`CHANGES_REQUESTED`** con **`3` hallazgos Major** (en rutas de error/teardown y el bucle `press()`) y **`3` hallazgos Minor** (incluyendo Minor 5 confirmado visualmente en `native-proyectos.png`, donde la 3.ª tarjeta salió a mitad del fade escalonado). `#150` exige `0` Blockers y `0` Majors antes de archivar.

## Allowlist exacta propuesta (los mismos 2 archivos de harness/QA, `0` archivos de producto)

1. `apps/companion/scripts/verify-native-journeys.mjs`
   - Preimage actual (`b022eb2`): `60,511` bytes, SHA256 `6aa388182ded87e88005f5a77551533cb65ac88a12d9d263142fe956bbeb8afb`.
   - Cambios exactos para resolver los `3` Major y `3` Minor:
     - **Major 1 (privacidad/anclaje en `catch`)**: extender `anchor()` y añadir un sanitizador compartido para redactar `workspace`, `output`, `LOCALAPPDATA`, `APPDATA`, `tmpdir()` y `homedir()` mediante `portable()`; escribir `failure.png` **solo** cuando `anchored && anchored.leaking.length === 0` (registrando el motivo si se omite); sanitizar `error.message`, `feedback`, `evaluateError` y `findingsSoFar` en `failure-state.json` y guardar únicamente `leakingCount` (nunca rutas crudas).
     - **Major 2 (teardown acotado en `catch`)**: acotar `evaluate()` y `anchor()` dentro de `catch` con un timeout de `5,000 ms`, pasar `{ timeout: 10000 }` a `activePage.screenshot(...)`, y escribir `failure-state.json` siempre (incluso si `activePage` es `null` o falla/expira la evaluación diagnóstica) antes de relanzar `throw failure`.
     - **Major 3 (manejo de bloqueo en `press()` del bucle de ingeniería)**: comprobar `const settled = await notBusy(wait)` después de `control.click()`; si `!settled`, registrar `finding(id, 'engineering', ...)` y abortar el bucle `STAGES` inmediatamente; comprobar `notBusy` una sola vez por iteración externa en lugar de repetir `900 s` por cada patrón de `STAGES`.
     - **Minor 4 (`waitWorkspaceTab()`)**: cortar con `if (!settled) return false;` si `notBusy()` expira, y registrar `finding` si volver a `Preparación` antes del bucle de ingeniería devuelve `false`.
     - **Minor 5 (animaciones finitas en `capture()`)**: esperar a que concluyan las animaciones CSS finitas (`document.getAnimations().filter(a => Number.isFinite(a.effect?.getComputedTiming().iterations))`, igual que `verify-ui.mjs:100`) antes de tomar cada captura para que `native-proyectos.png` muestre todas las tarjetas con opacidad completa.
2. `apps/companion/qa/verification-harness-contract.mjs`
   - Preimage actual (`b022eb2`): `5,908` bytes, SHA256 `b446b22a3f427ead63e544304872be9a2ad34b569bd5fe6fcd4eeea474e31d55`.
   - **Minor 6**: reforzar las aserciones de contrato para exigir `#content` explícito, todos los sitios de `revealDetails(...)` (`sources`, `status`, `afterReopen`, `preparation`, `native-tu-ia`), límites de timeout y guarda de `anchor()` limpio antes de `failure.png`, manejo de bloqueo en `press()` y espera de animaciones finitas en `capture()`.

**Fuera de allowlist (`0` cambios):** todos los archivos empaquetados (`desktop/`, `ui/`, `engine/`, `context/`, `runtime/`), `package.json`, `package-lock.json`, `Electron 44.9.1`, `npm 11.21.2`, workflows de CI y `.project-os/debt/` (`97` archivos).

## Presupuesto adicional mínimo solicitado (acumulativo; sin reiniciar consumos previos)

- **`0` builds adicionales**: reutilizar el mismo instalador verificado Build 1 `20fbe4c` (`3b6410b4...`, `5` directorios empaquetados `100%` idénticos).
- `1` variante congelada de los `2` archivos listados arriba;
- `1` ejecución local de `node --test qa/verification-harness-contract.mjs`;
- `1` reconciliación incremental de solo lectura por el **mismo revisor independiente** (`c4e8612c-998e-4803-8d7a-cbcdc0384eba`) verificando `0` Blockers y `0` Majors;
- `1` ciclo corto de Windows Sandbox offline (`verify-release-installation.mjs`, ~2.5 min) sobre el instalador reutilizado `20fbe4c` para confirmar la variante reconciliada y capturar `native-proyectos.png` con todas las tarjetas en opacidad completa + CI requerida (`12/12`).
- **Parada**: si cualquier prueba o la reconciliación falla, detenerse sin reintento. Los recorridos humanos `#146` y Software A/B `#147`, el assessment final append-only de deuda, los archivos oficiales en orden (`#218`, luego `#144`→`#150`) y el merge protegido de PR `#217` siguen siendo gates separados.
- **Recuperación**: `git revert` revisado sobre los `2` archivos de harness/QA.
