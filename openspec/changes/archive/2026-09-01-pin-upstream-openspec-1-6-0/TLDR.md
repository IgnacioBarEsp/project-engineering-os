# OpenSpec debe viajar con el clon

El repositorio exige usar OpenSpec local y fijado, pero un `npm ci` limpio elimina el único binario que
existía por una instalación manual. Un worktree nuevo no puede ejecutar el flujo SDD que `AGENTS.md` ordena.

## Qué cambia

`@fission-ai/openspec` 1.6.0 entra como dependencia exacta de desarrollo y queda resuelta en el lockfile. Su
script de instalación se autoriza solo para ese nombre y versión.

## Qué no cambia

OpenSpec no se convierte en dependencia de runtime ni entra como código duplicado al paquete publicado. No
cambia la versión de la CLI, el archive, los adaptadores OPSX ni la telemetría del consumidor.

## Cómo se demuestra

Después de `npm ci`, el binario local reporta 1.6.0. OpenSpec estricto, el doctor, el gate de auditoría, el
fixture y las 235 pruebas del upstream deben seguir pasando.

## Rollback

Revertir el commit retira la dependencia y restaura el lockfile. No hay estado de producto, migración de
datos ni configuración remota que deshacer.
