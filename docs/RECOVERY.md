# Recuperación

Esta guía responde una pregunta: **¿cómo vuelvo a un estado conocido sin perder trabajo?** Las operaciones
mutables dejan una transacción verificable; el rollback usa esa evidencia en lugar de borrar el historial.

**Úsala si:** un bootstrap, sync, upgrade o PR se interrumpió o encontró contenido inesperado.

Cada bootstrap, sync o upgrade crea una transacción antes de escribir. La salida incluye su ID.

## Interpretar `sync --check`

- `IN_SYNC` (código `0`): no hay diferencias administradas.
- `PROVENANCE_MISMATCH` (código `0`): solo difiere el `packageHash` del CLI; el resultado nombra el valor
  guardado y el observado, no propone operaciones y no cambia el repositorio. Es informativo y no
  requiere reparación. Si esperabas usar una release concreta, comprueba que el comando se ejecutó desde
  esa distribución y no desde un checkout distinto.
- `DRIFT` (código `1`): revisa cada operación y campo de estado informado. Conserva las ediciones del
  proyecto y ejecuta el `sync` mutante solo después de aceptar el plan.

Los códigos `2` y `3` indican entrada/estado inválidos o un fallo transaccional, respectivamente. Para
`3`, conserva el journal y usa la sección de ejecución interrumpida antes de reintentar o revertir. El
check es read-only en todos estos casos.

## Ejecución interrumpida

Repite exactamente el comando y versión originales. Si blueprint, configuración o contenido planeado no
cambiaron, el journal permite reanudar.

## Cancelar la transacción

```sh
project-os rollback --target . --transaction <id>
```

El rollback verifica hashes antes de restaurar. Si detecta una edición posterior, se detiene sin aplicar
una restauración parcial. Conserva esa edición, revisa el journal y decide manualmente.

## Fallo de `--open-pr`

La rama local, commit o push ya realizados se conservan. La salida indica la rama y el comando de
recuperación. El CLI nunca hace merge. Para cancelar, vuelve a la rama base solo después de preservar o
revertir el cambio mediante un PR normal.

Nunca borres el registro de deuda para reanudar un plan, no elimines journals como reparación y no uses
`git reset --hard`.

## Después de recuperar

Repite el check que falló y conserva su salida. Si el problema es de versión o plataforma, revisa
[compatibilidad](COMPATIBILITY.md); si dejó hallazgos residuales, clasifícalos con
[Debt Control Loop](DEBT_CONTROL.md).
