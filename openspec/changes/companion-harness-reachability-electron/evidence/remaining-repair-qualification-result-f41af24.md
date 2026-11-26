# Cualificación f41af24: 1 PASS sin instrumentación y equivalencia verificada con fa15

La [aprobación literal](remaining-repair-qualification-approval-f41af24.md) de
`f41af246138fcfbae8d528f71fa933e99f9c1820` y la DoR fresca `13 PASS / 0 FAIL / 0 EXCEPTION`
precedieron a la única preparación e invocación autorizadas. El presupuesto de `f41af24`
está completamente consumido (`1/1` preparación, `1/1` ejecución, `0` restantes, sin reintento).

## Resultado real de la única ejecución (26 de noviembre de 2026 UTC)

- Preparación congelada (`2026-11-26T22:02:47.160Z` – `22:03:27.595Z`): `40,436 ms`
  (<= `180,000 ms`).
  - Fuente QA original sin instrumentación: `223/223` archivos de `apps/companion`
    idénticos entre worktree, stage `k218b` y copia `qual-s-1jKuNP/app` (`changed: []`,
    `patchSha256: e3b0c442...` vacío).
  - Copia física verificada de `npm 11.21.2`: `1,944` archivos regulares (`nlink === 1`,
    sin symlinks, junctions ni ancestros vinculados), `12,296,462` bytes, digest de inventario
    `6265d0c895db1a5185ab99bea58611055572066754901ade9639edea59953ead` idéntico en origen y destino.
  - Verificación sintáctica de `qa/distribution-identity.mjs`: `exit 0`.
  - Node verificado: `v24.18.0` (`win32`/`x64`), SHA256
    `9a4eb5f1c29c6a2e93852ead46b999e284a6a5ca8bab4d4e241d587d025a52de`.
- Ejecución única (`2026-11-26T22:30:40.693Z` – `2026-11-26T22:31:49.891Z`):
  - Resultado TAP: **1 tests, 1 PASS, 0 FAIL, 0 CANCELLED, 0 SKIP**, `exit 0`,
    `signal: null`, `closed: true`, `failure: null`.
  - Target exacto: `interrupted repair restores only the journal-owned unchanged quarantine, and retains project/history bytes`
    (`--test-concurrency=1`, patrón anclado exacto `^...$`, límite de caso `90,000 ms`,
    limpieza `5,000 ms`, límite de proceso `120,000 ms`).
  - Duración: `69,049.573 ms` del caso en TAP (`69,132.2385 ms` TAP total; `69,197 ms`
    de proceso supervisor).
  - Trazas emitidas: `0` eventos / `0` bytes (QA sin instrumentación).
  - Integridad y limpieza posterior: `sourceAppUnchanged: true`,
    `observedAppUnchangedSinceFreeze: true`; el helper limpió normalmente su root propio
    (`homeChildren: ["diag-trace"]`, `diagTraceChildren: []`); `0` procesos propios restantes.

## Equivalencia verificada con los recibos independientes de fa15 y d812

Se contrastaron byte a byte código, runtime, dependencias y entradas pertinentes
(`equivalence-verified.json`, SHA256 `4903e9db6e884b26b32fec8a6b625db57008c211be5800000bc35f3eda40cf2a`):

1. **Código (`apps/companion`)**: `223/223` archivos coinciden byte a byte entre el
   inventario post-overlay de `fa15` (`qa-spawn-fa15/frozen.json`), la copia congelada de
   `f41af24` (`remaining-repair-qualification/frozen.json`) y el árbol rastreado actual
   (`0` diferencias). En particular:
   - `apps/companion/qa/distribution-identity.mjs`: `a97ac1e84cddda5fb4e9b05a0170a905ee8a126cc1cf8fd993decc1ecaa9565c`
   - `apps/companion/qa/helpers/owned-crash-fixture.mjs`: `990166fcc3ad1b6237edc8a2710007be8125f0ac9aaa5a06074317318afb2306`
   - `apps/companion/qa/owned-crash-fixture.mjs`: `c7942e9e8efbaa03ef28a1296e880abec818b9b4b3319182fd3f5266de38f125`
2. **Runtime**: mismo ejecutable `node.exe` `v24.18.0` (`win32/x64`), SHA256
   `9a4eb5f1c29c6a2e93852ead46b999e284a6a5ca8bab4d4e241d587d025a52de`.
3. **Dependencias (`npm 11.21.2`)**: los `1,944` archivos (`12,296,462` bytes) del
   `node_modules/npm` del stage `k218b` usado por `fa15` coinciden exactamente con el
   inventario físico de `f41af24` (`6265d0c895db1a5185ab99bea58611055572066754901ade9639edea59953ead`),
   además de `package.json`, `package-lock.json` y `runtime/catalog.mjs` idénticos.
4. **Entradas reutilizadas de `d812`**: `9/9` archivos registrados en
   `d812-reused-source-inputs.jsonl` coinciden byte a byte con el árbol actual.

### Recibos combinados por alcance separado (sin declarar 10/10 en una misma corrida)

- **9 PASS de `fa15`** ([recovery-qa-spawn-result-fa15.md](recovery-qa-spawn-result-fa15.md), 14 nov 2026):
  3 puntos de interrupción independientes (`npm-published`, `npm-selection-written`, `npm-confirmed`),
  5 controles reales del helper y 1 control sintético de `spawn`/stdio (2 aserciones internas).
- **1 PASS de `f41af24`** (este registro, 26 nov 2026):
  caso original de reparación interrumpida en `69.05 s` TAP, sin instrumentación.
- **2 PASS de `d812`** ([local-qa-resource-result.md](../../refresh-official-electron-certificate-runtime/evidence/local-qa-resource-result.md), 14 nov 2026):
  copia/sellado canónico (`57.66 s`) y limpieza de prefijo en `npm pack` (`48.80 s`), `9/9` entradas sin deriva.
- **Revisión independiente de fuente QA**: completa por el mismo revisor (`/root/qa5013_candidate_review`),
  `P2` resuelto por fuente y `0` hallazgos accionables adicionales ([informe](independent-recovery-qa-review-fa15.md)).
- **CI en `f41af24`**: run [45902071618](https://github.com/IgnacioBarEsp/project-engineering-os/actions/runs/45902071618)
  terminó `SUCCESS` (`12/12` jobs, incluido `CI / required`, 3 SO y Electron Windows). El nuevo
  head documental de evidencia requerirá su propia CI verde.

## Fallos previos y límites conservados

Se conservan íntegros todos los fallos históricos y resultados `DIAGNOSTIC_ONLY`:
- `d812`: `2 PASS / 2 CANCELLED` (y ambos full-suite `FAIL` previos).
- `e978`: `1 PASS / 1 CANCELLED` (`DIAGNOSTIC_ONLY`).
- `fa15`: `9 PASS / 1 CANCELLED` y su root físico retenido (`qfa15-lFWgJs/npm-identity-0aG2kt`, intacto).
- `0999922`: `0 PASS / 1 FAIL` por `LINK_REJECTED` de preparación (`DIAGNOSTIC_ONLY`).
- `4a88216`: `1 PASS / 0 FAIL` en `64.865 s` TAP (`DIAGNOSTIC_ONLY`, causa histórica `UNKNOWN`).

Este resultado **no** declara la causa del timeout histórico de `fa15`, **no** cambia
producto, QA, protecciones, dependencias ni límites, y **no** inicia automáticamente
builds (`0/2`), VM corregida (`0/1`), recorridos humanos `#146`/`#147`, captura de deuda,
archivos oficiales (`#218` y `#144`→`#150`) ni merge protegido. Quedan pendientes la CI
vigente de este head documental y la revisión de la evidencia antes de autorizar los
gates posteriores.

## Artefactos persistentes

Prefijo: `artifacts/wave3-current/remaining-repair-qualification/`.

| Archivo | Bytes | SHA256 |
| --- | ---: | --- |
| `approval.json` | 167 | `dcf103a483243f049cafc170305e9626796f853b1d4f40cf4890df97e3e576eb` |
| `driver.mjs` | 45420 | `65b719a342c25ebcdf69d9a27d1ba5ecc93de37634c20f00470183edb305797b` |
| `preparation-start.json` | 177 | `f218963fea4ffb0fc805a5871ca69fb2eb5c44951e0fd41db7ab635ff4f35cb6` |
| `dor.stdout` | 4863 | `00aa9865569281f4e7671f23b60c1de42503ed4b6a62b4dd176d0533b717044f` |
| `dor.stderr` | 0 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| `physical-inventories.json` | 340615 | `0d634931a3b5e524ad5a3191cc501caf0a6aef03c38fbd3f6becf9fb95f41cb4` |
| `syntax.stdout` | 0 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| `syntax.stderr` | 0 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| `frozen.json` | 71172 | `84ff67c0c7ed5a591c20d917fa8738ce307fb0d57833de4afb34d441db933aec` |
| `invocation-start.json` | 1340 | `50f8129afbe65e6161bfaefa99c065a12da077b8ee8a78022e6f4ae1ce68a586` |
| `stdout.tap` | 403 | `47ec4c437b442943098e251aa4490c8dd1357f0f4e4c2ed5eb928babb6cda296` |
| `stderr.log` | 0 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| `result.json` | 1127 | `cb187e822993520d6d0d8620e12a808a795275c1b5aceb84e4fe41edcf006d20` |
| `equivalence-verified.json` | 8129 | `4903e9db6e884b26b32fec8a6b625db57008c211be5800000bc35f3eda40cf2a` |
