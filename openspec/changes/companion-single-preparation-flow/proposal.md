## Why

[#146](https://github.com/IgnacioBarEsp/project-engineering-os/issues/146) identifica dos recorridos de preparación coexistentes: uno nuevo de perfil, enfoque y visión, y otro antiguo de revisiones por etapas. El usuario puede saltarse el nombre al abrir una carpeta existente, obtener `NAME_INVALID` al final y perder respuestas al cerrar la app. La dirección de cuatro pasos con plan plegado fue aprobada en la entrevista del 2026-09-18.

## What Changes

- Unificar la creación en Tu proyecto → Enfoque → Visión → Preparar → Listo, con el riel y la ruta derivados de una tabla cerrada.
- Conservar respuestas al volver y al reabrir mediante un borrador acotado en el directorio de datos de Companion, nunca en la carpeta elegida; no escribir ni instalar antes de aprobar el plan.
- Resolver Abrir carpeta existente: abrir el proyecto preparado o entrar en Tu proyecto con carpeta y recomendación ya cargadas.
- Retirar las pantallas independientes del flujo antiguo. La revisión de archivos, descargas y destinos va plegada en Preparar; las acciones de mantenimiento quedan en la pantalla del proyecto.
- Sustituir relleno declarativo, indicadores falsos y controles decorativos de Visión por preguntas, guía medible y una vista previa fiel de `PROJECT_VISION.md`.
- Cubrir seis perfiles y dos vías en navegador, ida/vuelta, reinicio con borrador, accesibilidad, movimiento, tamaños y caso negativo de carpeta existente.

## Capabilities

### New Capabilities

Ninguna; se corrige un contrato de preparación ya publicado.

### Modified Capabilities

- `companion-experience`: una sola secuencia visible de cuatro pasos y un final honesto, sin callejones del recorrido antiguo.
- `companion-desktop`: borrador local acotado, navegación de carpeta existente y aislamiento de privilegios.
- `companion-preparation`: vista previa de visión fiel a las palabras de la persona y plan previo a escritura.

## Impact

Companion renderer, IPC acotado, pruebas y documentación. No cambia el núcleo neutral ni instala servicios, cuentas, modelos o frameworks. #147 implementa la orquestación real de las dos vías; #148 reconstruye la pantalla de proyecto. Dependencia de código: #144 y #145 apilados, todavía en PR borrador.

Riesgos: retirar pantallas puede dejar una acción declarada sin destino; el contrato cerrado lo detectará. El borrador es dato nuevo: tamaño, shape y ruta se validan, y los errores no escriben en la carpeta de proyecto. Rollback: revertir el PR; los proyectos y sus archivos siguen intactos.
