## Why

Refs #147, programa #141. El asistente de #146 guarda solamente la base; sus dos vías aún no preparan contexto ni herramientas. La autorización del mantenedor cubre completar la ola 3, conservando las comprobaciones y los límites del núcleo.

## What Changes

- Encadenar los motores existentes en el mismo paso Preparar: base/contexto y, solo para Software en la vía local, herramientas, ingeniería, activación y tecnología elegida.
- Mostrar cada plan real antes de aplicarlo, progreso nativo, cancelación recuperable, reintento y pendientes explícitos; no afirmar una unión futura que todavía no puede calcularse.
- Componer el prompt de activación en el servicio con hechos comprobados, perfil, enfoque y palabras del usuario, sin ruta absoluta añadida ni inferencia.
- Derivar el resultado final del veredicto real y conservar copia IPC/handoff verificado.
- Ampliar rutas de instrucciones sin alterar textos ajenos ni romper recibos/transacciones previos.

## Capabilities

### New Capabilities

- `companion-preparation-orchestration`: etapas revisadas, dos vías, recuperación y resultado verificable.
- `companion-activation-prompt`: composición determinista y comprobaciones concretas para continuar con la IA.
- `companion-agent-route-migration`: destinos adicionales e importación de AGENTS preservando compatibilidad.

### Modified Capabilities

Ninguna spec archivada se reemplaza; estas capacidades complementan los contratos existentes de motores y aislamiento.

## Impact

Renderer, servicio/preload, composición, rutas/contexto y QA de Companion. Sin paquetes, proveedores, telemetría ni red nuevos. Riesgos: invalidación de planes entre etapas, estados a medias y rutas antiguas. Mitigación: previews nuevamente comprobados, recibos/versiones compatibles y nunca marcar éxito por elegir una vía. Rollback por git-revert; conservar recuperación de transacciones y archivos originales. No incluye ola 4, releases ni sustituye revisión humana.
