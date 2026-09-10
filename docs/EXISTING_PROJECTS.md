# Preparar un proyecto existente

El constructor puede adoptar archivos de semilla cuyo propietario sea el proyecto, como `README.md` o
`package.json`, conservando todos sus bytes. Esta opción es explícita: una colisión no da permiso para
reescribir archivos. La opción se incorpora al núcleo 0.4.0; no está en la versión 0.3.0.

## Revisar antes de aplicar

Desde una carpeta Git, solicita el plan con el constructor instalado:

```sh
project-os bootstrap --target . --dry-run --json
```

`plan.adoptionCandidates` contiene las rutas elegibles y sus hashes SHA-256. Revisa cuáles pertenecen a tu
proyecto y copia solamente esas entradas a un archivo JSON local, por ejemplo `adoption.json`:

```json
[
  {
    "target": "README.md",
    "hash": "REEMPLAZAR_POR_EL_SHA256_DE_64_CARACTERES_DEL_PLAN"
  }
]
```

El hash ilustrativo debe reemplazarse; no es consentimiento válido. Guarda el archivo fuera de las rutas
que el constructor administra. Revisa el nuevo plan y aplica la misma lista:

```sh
project-os bootstrap --target . --adopt-project-seeds ../adoption.json --dry-run --json
project-os bootstrap --target . --adopt-project-seeds ../adoption.json --json
project-os sync --target . --check --json
```

La ruta del ejemplo supone que guardaste `adoption.json` en la carpeta superior. La API equivalente usa
`runBootstrapOrSync({ command: 'bootstrap', targetRoot, adoptProjectSeeds: [{ target, hash }] })`.
También se acepta la opción en `sync`; `sync --check` continúa siendo solo lectura.

## Qué significa el resultado

`adopt` registra el archivo existente sin escribirlo; `create` instala una semilla o un archivo nuevo.
El estado de una adopción contiene `owner: "project"`, `seeded: false` y `adopted: true`. Después puedes
editarlo y ejecutar sync normalmente. No necesitas volver a proporcionar una lista para mantenerlo.
Una segunda ejecución sin cambios es idempotente.

Adoptar un `package.json` conserva scripts, dependencias, nombre y licencia. No instala dependencias ni
añade los scripts del constructor. No demuestra que OpenSpec o un índice estén activos. La activación
del entorno requiere su propio plan; Companion la resuelve en el flujo de herramientas del programa #66.

No son adoptables mediante esta opción los archivos del constructor, overlays humanos ni archivos de
OpenSpec. No se aceptan rutas desconocidas, ausentes, duplicadas o enlazadas. El archivo de consentimiento
admite hasta 64 KiB y 256 entradas, cada una con una ruta relativa normalizada y un hash SHA-256.

## Si algo cambió o se interrumpió

Un hash distinto exige revisar de nuevo. Para reanudar una transacción incompleta, conserva la misma lista
revisada y sus archivos; el constructor comprueba los originales antes de escribir y antes de guardar
el estado. Si necesitas abandonar esa transacción, usa su identificador:

```sh
project-os rollback --target . --transaction ID_DE_LA_TRANSACCION --json
```

Rollback verifica sus propias escrituras y recupera el estado anterior. No borra ni restaura los archivos
adoptados, incluso cuando los editaste después. Consulta [recuperación](RECOVERY.md) y el
[modelo de ownership](architecture/OWNERSHIP.md) para las demás colisiones.
