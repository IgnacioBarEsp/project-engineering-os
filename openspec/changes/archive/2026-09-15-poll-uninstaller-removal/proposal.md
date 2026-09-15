## Why

En el run 34967616274 correspondiente a `companion-v0.2.2`, la preservación del error de medición desenmascaró el defecto real: el desinstalador silencioso de NSIS (`/S`) copia su ejecutable en `%TEMP%\~nsu.tmp\Au_.exe`, genera ese subproceso en segundo plano para realizar el borrado y sale de inmediato. La aserción de verificación comprobaba de inmediato la ausencia del directorio de instalación (`installation`), fallando por escasos milisegundos mientras el worker de NSIS aún estaba activo borrando los archivos. La verificación de desinstalación debe esperar de forma asíncrona mediante sondeo con un presupuesto de tiempo finito (hasta 60 s).

## What Changes

- Exportar la función `waitForRemoval(target, { timeoutMs, intervalMs, check, sleep })` desde `scripts/disposable-cleanup.mjs` para sondear la desaparición del directorio con presupuesto acotado.
- En `verify-release-installation.mjs`, esperar la eliminación de `installation` mediante `waitForRemoval` antes de evaluar la aserción de desinstalación.
- Preparar Companion 0.2.3 como nueva identidad del candidato corregido, sin tocar el núcleo 0.5.0 ni los tags/releases existentes; `companion-v0.2.2` permanece como intento inmutable sin release.
- Proteger el comportamiento con pruebas unitarias para `waitForRemoval` y aserciones de QA de release para 0.2.3.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `companion-distribution`: la verificación de desinstalación debe esperar la delegación asíncrona del desinstalador NSIS con un presupuesto acotado antes de evaluar la remoción del directorio del programa.

## Impact

Issue: https://github.com/IgnacioBarEsp/project-engineering-os/issues/117.

No publica nada, no mueve tags ni assets, no publica el núcleo npm y no toca datos de usuario. La identidad 0.2.3 permite que la verificación de release complete de forma determinista la fase de desinstalación sin falsos negativos.
