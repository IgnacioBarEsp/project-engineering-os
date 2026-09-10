# Herramientas separadas del producto

Un proyecto puede conservar su `package.json`, lockfile y dependencias mientras instala las herramientas
de ingeniería en otra subcarpeta. El soporte se incorpora en 0.5.0; requiere actualizar el wrapper y su
resolver mediante el constructor. No está disponible en 0.4.0.

## Selección explícita

En el archivo existente `.project-constructor/config.json`, conserva sus demás propiedades y añade:

```json
{
  "toolchainRoot": ".project-os/toolchain"
}
```

El fragmento muestra solamente la propiedad nueva; no reemplaza la configuración completa. La ruta usa
`/`, es relativa a la carpeta del proyecto y no puede estar vacía, contener `.` o `..`, apuntar a
metadatos reservados ni atravesar enlaces simbólicos. La configuración admite hasta 64 KiB. Los
manifiestos y metadatos de paquetes se leen como objetos JSON regulares de hasta 16 MiB cada uno.

Seleccionar una carpeta no instala nada. Prepárala con su propio `package.json` y `package-lock.json`,
fijando exactamente `@fission-ai/openspec` a `1.6.0` y `create-project-engineering-os` a la misma release
del estado del constructor. Revisa el lockfile, licencias y política de instalación antes de ejecutar
`npm ci --ignore-scripts` **desde esa subcarpeta**. No ejecutes este paso en el manifiesto del producto.
Companion proporciona la preparación visual en el issue #87.

## Uso y verificación

Desde la raíz del proyecto preparado, estos comandos usan el entorno del ejemplo:

```sh
node ./.project-constructor/openspec.mjs --version
node ./.project-os/toolchain/node_modules/create-project-engineering-os/bin/project-os.mjs sync --target . --dry-run
node ./.project-os/toolchain/node_modules/create-project-engineering-os/bin/project-os.mjs sync --target .
node ./.project-constructor/openspec.mjs init --tools codex,claude,cursor,github-copilot,opencode
node ./.project-os/toolchain/node_modules/create-project-engineering-os/bin/project-os.mjs opsx-adapt --target .
node ./.project-os/toolchain/node_modules/create-project-engineering-os/bin/project-os.mjs opsx-check --target .
node ./.project-os/toolchain/node_modules/create-project-engineering-os/bin/project-os.mjs doctor --target .
```

Revisa el plan de sync antes de aplicarlo: registra el cambio de configuración y conserva las semillas
del producto. Doctor puede detectar estado pendiente si aún no sincronizaste. `init` genera los workflows
oficiales. El wrapper conserva el aislamiento temporal de preferencias de
generación y desactiva la telemetría de OpenSpec salvo elección explícita del entorno. Usa el mismo Node
con el que se lo ejecuta; no instala un runtime ni cambia PATH. Los scripts del producto no se modifican.

El wrapper, OPSX y doctor resuelven la misma ubicación y exigen versión exacta en manifiesto, lock e
instalación, nombre correcto y archivo de entrada del paquete. Un shim de `node_modules/.bin` por sí solo
no demuestra una instalación válida. Los checks no ejecutan la CLI seleccionada ni scripts del proyecto.
Esto comprueba identidad declarada y ubicación; no sustituye la verificación de integridad del paquete
descargado ni ofrece un bloqueo de archivos frente a cambios simultáneos de otros procesos.

## Recuperación

Si falta la instalación seleccionada, la verificación falla con su ubicación y una acción de recuperación.
No se busca una instalación global ni se vuelve silenciosamente a la raíz. Restaura el lockfile revisado
y la instalación en esa ubicación, o selecciona explícitamente otra ubicación previamente verificada.

Para volver al modo tradicional, elimina solamente `toolchainRoot` de la configuración, después de
comprobar que las versiones exactas están instaladas en la raíz. El cambio de selección no mueve,
sobrescribe ni elimina ninguna carpeta. [Sync y rollback](RECOVERY.md) mantienen sus reglas de ownership;
la configuración y los entornos pertenecen al consumidor. [Adoptar semillas](EXISTING_PROJECTS.md) conserva
los archivos existentes, pero no añade dependencias ni demuestra que las herramientas estén activas.
