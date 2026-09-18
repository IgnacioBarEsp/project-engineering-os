## Why

La experiencia de preparación actual de Companion presenta fricción técnica: restringe la clasificación a 5 perfiles generales, fuerza la elección de tecnología de manera prematura y no provee un mecanismo para delegar la exploración y aprovisionamiento fino a la IA predilecta del usuario (Cursor, Claude, Windsurf, ChatGPT). Esta propuesta rediseña el flujo en 4 pasos intuitivos, captura la intención en `PROJECT_VISION.md`, ofrece dos vías de instalación (inmediata vs delegada a IA) e implementa el estándar visual Obsidian Precision Studio con microcopia empática sin jerga técnica.

## What Changes

- **Taxonomía de 7 perfiles**: Soporte canónico para Software / TI, Investigación / Ciencia, Estudios / Universidad, Contenido / Documentación, Prototipos / MVPs, Personal / Libre y Automatización / Bots en `engine/inventory.mjs` y `ui/app.mjs`, manteniendo alias retrocompatibles.
- **Persistencia de Visión**: Captura del objetivo en lenguaje natural, métricas de densidad de contexto en tiempo real y escritura de `PROJECT_VISION.md` en la raíz del proyecto preparado.
- **Flujo de 4 Pasos & Bifurcación**: Secuencia intuitiva (Perfil -> Delimitación -> Visión -> Instalación) con dos rutas claras en la fase final: *Vía Rápida* (aprovisionamiento inmediato) vs *Que mi IA se encargue* (prompt maestro estructurado).
- **Orquestación con IA**: Generación de Prompt Maestro en `context/prompts.mjs` con directivas para entrevista no técnica de 3 preguntas, consulta de documentación viva de Project Engineering OS, conversión de fuentes a Markdown sin eliminar originales y verificación de entorno.
- **Artesanía Visual & Copywriting**: Sistema de diseño Obsidian Precision Studio en `ui/app.css`, transiciones fluidas, elevación física, loaders con pulso y eliminación de tecnicismos intimidantes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `companion-experience`: define la secuencia de preparación en 4 pasos, la taxonomía de 7 perfiles y la bifurcación de instalación.
- `companion-preparation`: incorpora la persistencia de `PROJECT_VISION.md` como archivo administrado respetando la no eliminación de fuentes originales.
- `companion-prompt-composition`: genera el prompt maestro para la IA de cabecera adaptado a la modalidad de instalación y con protocolo de verificación.

## Impact

Issues: https://github.com/IgnacioBarEsp/project-engineering-os/issues/128, https://github.com/IgnacioBarEsp/project-engineering-os/issues/129, https://github.com/IgnacioBarEsp/project-engineering-os/issues/130, https://github.com/IgnacioBarEsp/project-engineering-os/issues/131, https://github.com/IgnacioBarEsp/project-engineering-os/issues/132, https://github.com/IgnacioBarEsp/project-engineering-os/issues/133.

Mantiene el core universal `create-project-engineering-os` fijado en 0.5.0 sin cambios. No introduce dependencias de telemetría, servicios externos obligatorios ni costo adicional. Todo opera 100% local y offline.
