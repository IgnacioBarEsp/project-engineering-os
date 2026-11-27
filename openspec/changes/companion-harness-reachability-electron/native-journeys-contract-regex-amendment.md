# Enmienda propuesta: corrección de 1 línea en el regex del test de contrato (`qa/verification-harness-contract.mjs:99`)

**Pendiente de aprobación literal sobre esta revisión inmutable.** No está aplicada ni modifica `apps/companion/` hasta recibir aprobación explícita y DoR `13/13`. Owner: `IgnacioBarEsp`. El presupuesto de `8f3fb73` quedó detenido por regla de parada tras `5234364` (`1/1` variante congelada, `1/1` regresión local `7/8 PASS / 1/8 FAIL`, `0/1` revisor, `0/1` VM) y **no se reinicia**.

## Por qué hace falta esta enmienda mínima de 1 solo archivo

En `5234364e6a9df78d0824d5c002270b50f7d3b622`, las correcciones de los `3` hallazgos Major, `3` Minor y `3` notas en `apps/companion/scripts/verify-native-journeys.mjs` quedaron aplicadas íntegramente y pasaron las primeras `13` aserciones (`:86–:98`) de `qa/verification-harness-contract.mjs`. Sin embargo, la línea `99` de `qa/verification-harness-contract.mjs` falló ([native-journeys-reconciliation-result-5234364.md](evidence/native-journeys-reconciliation-result-5234364.md)) por un error de orden de tokens dentro del propio regex del test:

- `verify-native-journeys.mjs` (`5234364`) construye `anchoredSummary = { nodes: anchored.nodes, replaced: anchored.replaced, leakingCount: anchored.leaking.length };` en la línea `932` (inmediatamente después de `diag-anchor`), luego condiciona `failure.png` (`timeout: 10000`) en las líneas `934–935`, y escribe `anchored: anchoredSummary` dentro de `writeFile(path.join(output, 'failure-state.json'), ...)` en las líneas `942–954`.
- La línea `99` de `qa/verification-harness-contract.mjs` buscó el literal `leakingCount` **después** de `writeFile(path.join(output, 'failure-state.json')` en lugar de ubicarlo entre `diag-anchor` e `if (anchored && anchored.leaking.length === 0)` y exigir `anchored: anchoredSummary` dentro de `writeFile`.

## Allowlist exacta propuesta (`1` solo archivo QA, `0` cambios en `verify-native-journeys.mjs`, `0` archivos de producto)

1. `apps/companion/qa/verification-harness-contract.mjs`
   - Preimage actual (`5234364`): `7,206` bytes, SHA256 `f792526ab00259d64cf4c27247d1a837c840d28ee3a6437d3fd8eef89c3e4b79`.
   - Cambio exacto (exclusivamente línea `99`):
     - De:
       `assert.match(source,/catch\s*\(failure\)[\s\S]*withTimeout\([\s\S]*diag-evaluate[\s\S]*withTimeout\([\s\S]*diag-anchor[\s\S]*if\s*\(anchored && anchored\.leaking\.length === 0\)[\s\S]*failure\.png[\s\S]*timeout:\s*10000[\s\S]*writeFile\(path\.join\(output,\s*'failure-state\.json'\)[\s\S]*leakingCount[\s\S]*throw failure;/);`
     - A:
       `assert.match(source,/catch\s*\(failure\)[\s\S]*withTimeout\([\s\S]*diag-evaluate[\s\S]*withTimeout\([\s\S]*diag-anchor[\s\S]*leakingCount[\s\S]*if\s*\(anchored && anchored\.leaking\.length === 0\)[\s\S]*failure\.png[\s\S]*timeout:\s*10000[\s\S]*writeFile\(path\.join\(output,\s*'failure-state\.json'\)[\s\S]*anchored:\s*anchoredSummary[\s\S]*throw failure;/);`

**Fuera de allowlist (`0` cambios):** `apps/companion/scripts/verify-native-journeys.mjs` (`5234364`, `fd134315...`), todos los archivos empaquetados (`desktop/`, `ui/`, `engine/`, `context/`, `runtime/`), `package.json`, `package-lock.json`, `Electron 44.9.1`, `npm 11.21.2`, workflows de CI y `.project-os/debt/` (`97` archivos).

## Presupuesto adicional mínimo solicitado (acumulativo; sin reiniciar consumos previos)

- **`0` builds adicionales**: reutilizar el mismo instalador verificado Build 1 `20fbe4c` (`3b6410b4...`, `5` directorios empaquetados `100%` idénticos).
- `1` variante congelada de `1` solo archivo (`apps/companion/qa/verification-harness-contract.mjs` línea `99`);
- `1` ejecución local de `node --test --test-reporter=tap qa/verification-harness-contract.mjs` (esperado `8/8 PASS`);
- `1` reconciliación incremental de solo lectura por el **mismo revisor independiente** (`c4e8612c-998e-4803-8d7a-cbcdc0384eba`) cubriendo `b022eb2..<nuevoCommit>` (`verify-native-journeys.mjs` de `5234364` + `qa/verification-harness-contract.mjs` corregido) para verificar `0` Blockers y `0` Majors;
- `1` ciclo corto de Windows Sandbox offline (`verify-release-installation.mjs`, ~2.5 min) sobre el instalador reutilizado `20fbe4c` para verificar la variante reconciliada y comprobar visualmente `native-proyectos.png` con todas las tarjetas en opacidad completa + CI requerida (`12/12`).
- **Parada**: si cualquier prueba o la reconciliación falla, detenerse sin reintento. Los recorridos humanos `#146` y Software A/B `#147`, el assessment final append-only de deuda, los archivos oficiales en orden (`#218`, luego `#144`→`#150`) y el merge protegido de PR `#217` siguen siendo gates separados.
- **Recuperación**: `git revert` revisado sobre `apps/companion/qa/verification-harness-contract.mjs`.
