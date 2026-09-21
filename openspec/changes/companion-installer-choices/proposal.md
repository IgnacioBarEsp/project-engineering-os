## Why

El instalador asistido de Companion crea hoy un acceso directo de escritorio sin que la persona pueda
rechazarlo y oculta la opción de abrir la aplicación al terminar. Además, sus diálogos propios están en
español, pero no declara el idioma de NSIS; el empaquetador fijado usa inglés estadounidense por defecto,
por lo que el recorrido puede mezclar idiomas.

El [issue #168](https://github.com/IgnacioBarEsp/project-engineering-os/issues/168) pide que estas
preferencias sean visibles y comprobables sin degradar la instalación silenciosa que usa la publicación.

## What Changes

- Añadir al asistente una elección explícita para crear el acceso directo de escritorio, marcada por
  defecto, y hacer que instalar, actualizar y desinstalar respeten esa elección sin dejar enlaces propios.
- Restaurar la opción estándar de abrir Companion al finalizar, marcada por defecto y reversible por la
  persona antes de terminar.
- Declarar español para las páginas y controles estándar de NSIS, conservando en español los mensajes
  contextuales y la guía de instalación.
- Extender las pruebas de configuración y el recorrido de publicación para comprobar el valor por defecto
  silencioso y el ciclo de creación/eliminación del acceso directo; registrar una observación interactiva
  real de Windows separada de esa automatización.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `companion-distribution`: la instalación asistida pasa a ofrecer elecciones de acceso directo y apertura
  final, mantiene un recorrido silencioso seguro y expone un idioma coherente y observable.

## Impact

Cambian `apps/companion/electron-builder.yml`, el include NSIS local, las aserciones de
`apps/companion/qa/packaging.mjs`, el verificador de instalación de release y
`docs/companion/INSTALLER.md`. No hay nuevas dependencias, servicios, permisos, costes, firma,
elevación, actualización automática, cambio de núcleo ni publicación de una versión en este change.

La prueba real se hará exclusivamente en GitHub Actions o en una VM Windows declarada desechable. Un
ensayo silencioso demuestra los valores por defecto y el ciclo de archivos; no se presentará como prueba
de que una persona vio o seleccionó una casilla.
