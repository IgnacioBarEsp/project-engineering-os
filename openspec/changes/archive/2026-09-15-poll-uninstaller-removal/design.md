## Context

`verify-release-installation.mjs` ejecuta `uninstaller.exe /S` en un runner Windows efímero. Por diseño interno de NSIS, el ejecutable invocado se clona en `%TEMP%\~nsu.tmp\Au_.exe`, lanza ese hijo en background y el proceso padre sale de inmediato con código 0. La comprobación directa `present(installation)` se ejecutaba de forma instantánea y fallaba porque el proceso hijo estaba en plena eliminación de archivos.

## Decision

1. **Helper de espera con presupuesto:** `scripts/disposable-cleanup.mjs` exporta `waitForRemoval(target, { timeoutMs = 60000, intervalMs = 500, check, sleep })`. Realiza un sondeo periódico de `access(target)` hasta que retorne `false` o venza el tiempo límite (`timeoutMs`). Si desaparece dentro del plazo, retorna `true`; si vence el plazo, retorna `false`.
2. **Integración en el arnés de release:** En `verify-release-installation.mjs`, tras `await execute(uninstaller, ['/S'])`, se invoca `await waitForRemoval(installation, { timeoutMs: 60000, intervalMs: 500 })` y se verifica `assert.equal(uninstalled, true)`.
3. **Identidad nueva:** La app privada pasa a 0.2.3 con lockfile, notices y notas de versión alineados; el núcleo sigue fijado en 0.5.0. El tag anotado `companion-v0.2.3` se cortará sólo tras fusionar esta corrección en `main` protegido. `companion-v0.2.2` no se mueve ni recibe release.
4. **Pruebas unitarias:** `qa/packaging.mjs` verifica `waitForRemoval` simulando:
   - Remoción exitosa tras 3 intentos (retorna `true`).
   - Timeout cuando el archivo persiste continuamente (retorna `false`).
   - Inmediata cuando el archivo ya está ausente (retorna `true` sin demoras).

## Recovery

Si el run 0.2.3 volviera a presentar algún inconveniente, el log de GitHub Actions reflejará exactamente la etapa y evidencia. Companion 0.1.0 sigue siendo la única descarga oficial y ningún tag ni release previa se altera; un revert deja las versiones públicas intactas.
