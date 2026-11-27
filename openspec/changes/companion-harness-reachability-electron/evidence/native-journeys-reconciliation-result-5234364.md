# Resultado de `8f3fb73` (`5234364`): regresión local `7/8 PASS / 1/8 FAIL` en regex de contrato — STOP sin reintento

Tras la [aprobación literal](native-journeys-reconciliation-approval-8f3fb73.md) de `8f3fb73` y DoR fresca `13/13` en `#150` y `#218`, se congeló la variante de los `2` archivos del allowlist (`5234364e6a9df78d0824d5c002270b50f7d3b622`) y se ejecutó la única regresión local autorizada (`1/1`), que devolvió **`7/8 PASS, 1/8 FAIL` (`exit 1`)**. Conforme a la regla de parada de `8f3fb73` (*«si cualquier prueba o la reconciliación falla, detenerse sin reintento»*), se detuvo inmediatamente sin reintento, sin lanzar la reconciliación incremental del revisor (`0/1`) y sin lanzar el ciclo corto de Windows Sandbox (`0/1`).

## 1. Variante congelada (`5234364`, `0` cambios en producto)

- **Commit congelado**: `5234364e6a9df78d0824d5c002270b50f7d3b622` (`2` archivos únicamente; `0` archivos de producto, empaquetado, dependencias, CI o `.project-os/debt/` tocados; los `5` directorios empaquetados `desktop/`, `ui/`, `engine/`, `context/`, `runtime/` y `build/npm-dist.zip` `fef16d4e...` coinciden byte a byte con `20fbe4c`).
  - `apps/companion/scripts/verify-native-journeys.mjs`: `64,993` bytes, SHA256 `fd13431524b9baea8ff9441a2d873b800c47061330c7f6da0a75fdcfe3697759` (contiene las correcciones completas de los `3` Major, `3` Minor y `3` notas de la revisión independiente, además de redacción recursiva `redactValue(diag)` y cota de `5,000 ms` en la espera de animaciones finitas).
  - `apps/companion/qa/verification-harness-contract.mjs`: `7,206` bytes, SHA256 `f792526ab00259d64cf4c27247d1a837c840d28ee3a6437d3fd8eef89c3e4b79`.
- **Instalador reutilizado sin cambios (`0` builds adicionales)**: Build 1 `20fbe4c` (`133,698,243` bytes, SHA256 `3b6410b47da3e141ee00786aedc91ac673f28faed31e3a36a2aae474581d8197`).

## 2. Regresión local (`7/8 PASS, 1/8 FAIL`) y causa raíz exacta

- **Comando**: `node --test --test-reporter=tap qa/verification-harness-contract.mjs` en copia limpia `b8f3` (Node `v24.18.0`, SHA256 `9a4eb5f1...`).
- **Resultado**: **`8 tests / 7 PASS / 1 FAIL / 0 CANCELLED / 0 SKIP`**, `exit 1`, `208.59 ms` TAP (`288 ms` proceso, `0` bytes stderr).
- **Subtests `1` a `7`**: `PASS`.
- **Subtest `8` (`installed journey harness synchronizes on renderer busy state, bounds teardown, redacts paths and waits for finite animations`)**: `FAIL` únicamente en la última aserción (`qa/verification-harness-contract.mjs:99:10`); las `13` aserciones previas (`:86–:98`) pasaron todas.
- **Causa raíz probada (error de orden de tokens en el regex del propio test, no en `verify-native-journeys.mjs`)**:
  - En `verify-native-journeys.mjs` (`5234364`), `leakingCount` se construye en `anchoredSummary` en la línea `932` (`anchoredSummary = { nodes: anchored.nodes, replaced: anchored.replaced, leakingCount: anchored.leaking.length };`), **antes** de la guarda de `failure.png` (líneas `934–935`) y de `writeFile(path.join(output, 'failure-state.json'), ... anchored: anchoredSummary ...)` (líneas `942–954`).
  - La línea `99` de `qa/verification-harness-contract.mjs` exigió el token literal `leakingCount` **después** de `writeFile(path.join(output, 'failure-state.json')` en lugar de antes del bloque `if (anchored && anchored.leaking.length === 0)` (seguido por `anchored: anchoredSummary` dentro de `writeFile`).
  - `verify-native-journeys.mjs` en `5234364` **no** requiere cambios adicionales.

## 3. Siguiente paso (pendiente de aprobación literal)

- La corrección de `1` línea exclusivamente en `apps/companion/qa/verification-harness-contract.mjs` queda propuesta en [native-journeys-contract-regex-amendment.md](../native-journeys-contract-regex-amendment.md) (**sin aprobar ni aplicar**, `0` cambios en `verify-native-journeys.mjs`, `0` cambios en producto, `0` builds adicionales).
- Todos los fallos y consumos previos (`d812`, `e978`, `fa15`, `0999922`, `20fbe4c` Fase 2, `b022eb2` revisión `CHANGES_REQUESTED`, y ahora `5234364` regresión `7/8`) se conservan íntegramente.

## Artefactos persistentes

Prefijo: `artifacts/wave3-current/native-journeys-reconciliation-8f3fb73/`.

| Archivo | Bytes | SHA256 |
| --- | ---: | --- |
| `approval.json` | 1477 | `6dcb0d8f3f3dc313acb174c03a006f2341a5fa715b881a6eb0af7fb7b59b7133` |
| `dor-150.txt` | 3499 | `e336e234d879cda1821d077d7af6cff7d066fb1e5d7f386a398535bb3854a132` |
| `dor-218.txt` | 3532 | `db6e6c8f0165ac218a25224cdce386848866a430ff21599065ed6ca7061e85ba` |
| `frozen-variant.json` | 1793 | `d0445392e1beadc168612911c10f5f89952c7fb61307dec7d685fa03d39affdd` |
| `regression-stdout.tap` | 83785 | `cb736e266bd24a55d8f28be5030b9274fc7705446cde38a81e60d0db8252e1bf` |
| `regression-stderr.log` | 0 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
