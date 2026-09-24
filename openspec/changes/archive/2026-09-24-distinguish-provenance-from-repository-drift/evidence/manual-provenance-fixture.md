# Recorrido manual de procedencia y drift

Fecha: 2026-09-24. Entorno: Windows, Node 24.18.0, npm 11.19.1. Fixture temporal desechable bajo `%TEMP%`; el repositorio y el equipo host no se usaron como destino de bootstrap.

1. En el commit base `264367a`, se inicializó un consumidor Git vacío con `bootstrap` desde una copia exacta del checkout. Después se copió el paquete a una segunda raíz temporal manteniendo versión, código, blueprint y configuración, y se cambió solo `README.md`, una entrada de la identidad.
2. El CLI base de la segunda raíz ejecutó `sync --target <fixture> --check --json`. Resultado antes del fix: `DRIFT`, exit 1, `creates=0`, `updates=0`, `deletes=0`, `conflicts=0`, `stateUpdate=true` y sin delta de campos en JSON. Eso reproduce el resultado ambiguo del issue sin alterar archivos del consumidor.
3. Se repitió el fixture con el CLI candidato, primero con `--json` y después en salida humana.

Resultado posterior al fix en ambas salidas: `PROVENANCE_MISMATCH`, exit 0, `plan.hasDrift=false`, `plan.operations=[]`, sin cambio en hashes de archivos del consumidor. La salida humana nombró `packageHash`, imprimió los valores guardado/observado y dijo que no proponía reparar ni escribir. La salida JSON incluyó el mismo par en `plan.stateChanges`.

Después se modificó `.claude/settings.json`, un archivo constructor-owned. Al repetir el check junto con la misma diferencia de procedencia, el resultado fue `DRIFT`/1 con una operación `conflict`; el caso no se ocultó como aviso. Se restauró el archivo dentro del fixture.

Por separado, el estado guardado se cambió a `activeProfiles=[]` y a `stateFormatVersion=1`: cada check informó el campo, el valor guardado y el observado, devolvió `DRIFT`/1 y no mutó la fixture. El escenario de formato legado aplicó la migración mediante `sync` y verificó rollback al snapshot previo.

La release de registry 1.0.0 no se ejecutó en este recorrido: aún estaba dentro de la espera mínima definida por `.npmrc`. La misma prueba de dos orígenes queda automatizada en `test/constructor.integration.test.mjs`.
