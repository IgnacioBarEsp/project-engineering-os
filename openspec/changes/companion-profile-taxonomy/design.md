## Context

El inventario actual produce cinco ids históricos. La UI ofrece once, pero el servicio, recetas y tecnologías no los comparten. `selection.subtype` guarda un título libre, lo que impide validar que pertenezca al perfil. El recibo y `project.json` usan hashes de contenido: cambiarlos por el simple acto de abrir una carpeta rompería la comprobación de ownership.

## Decisions

### Una fuente cerrada, sin dependencia circular

`engine/profiles.mjs` exporta `PROFILES`, `PROFILE_IDS`, `LEGACY_PROFILE_MAP`, `resolveProfile`, `focusFor`, `isEngineering`, `requiredStages`, `profileLabel` y funciones de catálogo. Cada perfil declara nombre, descripción breve, etapas, capacidad de ingeniería, tecnologías ofrecidas, plantilla de visión, reglas `setup`/`method` y recetas. Cada enfoque declara id, nombre, descripción y diferencias explícitas en esas reglas. El módulo es puro, sin DOM, filesystem, red ni import de servicio/contexto/runtime; los consumidores dependen de él, nunca a la inversa.

Los seis ids nuevos son `software`, `research`, `studies`, `content`, `business` y `personal`. `software/game` conserva las reglas de Unity cuando hay `ProjectSettings/ProjectVersion.txt`; `content/creative` conserva las de medios. `mvp` y `automation` son enfoques de Software. Cada perfil tiene un enfoque abierto válido para una elección sin subtipo histórico.

### Compatibilidad por lectura, no migración silenciosa

`resolveProfile` convierte selecciones de 0.3.x a un par canónico perfil/enfoque para mostrar y decidir: `unity→software/game`, `media→content/creative`, `general→personal/open`, `science→research/open`, `docs→content/technical`, `mvp→software/prototype`, `automation→software/automation`; `research` y `software` sin enfoque siguen abiertos. Un recibo viejo conserva exactamente sus bytes y hash al abrirse; ninguna lectura escribe el perfil nuevo. Una nueva preparación normaliza y valida solo los seis ids y enfoques de su perfil. La selección heredada todavía puede validarse para verificar recibos/journals existentes, con una ruta explícita distinta de la de escritura.

### Inventario y consumidores

`inspectFolder` conserva `recommendation` como id de perfil para compatibilidad de transporte y añade `focusRecommendation` y señales fechables; no lee contenido privado más allá del inventario acotado. Prioridad: Unity/Godot, proyecto de código o package.json, LaTeX/BibTeX de investigación, notebooks de datos, presentaciones académicas/negocio, medios creativos, documentos y general. La recomendación es orientación, no cambia la elección de la persona.

Servicio y preparación derivan etapas/capacidades del par resuelto; prompts y recetas ensamblan reglas de perfil más diferencias de enfoque; tecnologías usan el catálogo cerrado, con Unity externo y sin instalación automática. La lista y `PROJECT_VISION.md` usan `profileLabel`/`focusLabel`, nunca el id. `role`/`experience` de recibos antiguos se toleran al leer; la UI nueva deja de preguntar rol y #146 mueve la preferencia de guía fuera del asistente.

## Verification strategy

| Límite | Prueba |
| --- | --- |
| Taxonomía | Matriz de seis perfiles × enfoques: ids únicos, pertenencia cerrada, etiquetas/descripciones breves, etapas y diferencias de receta/setup/method dentro de cada perfil. |
| Compatibilidad | Fixtures 0.3.x para ids antiguos; verificar apertura, etiqueta humana y bytes/hashes inalterados. Enfoque ajeno y perfil desconocido fallan antes de escribir. |
| Motor | UI y servicio consultan las mismas etapas; Unity conserva verificaciones `.meta`/editor, contenido creativo no descarga modelos, stacks no ofrecen tecnología impropia. |
| Inventario | Carpetas mínimas con `ProjectVersion.txt`, `project.godot`, `package.json`, `.tex/.bib`, `.ipynb` y `.pptx`; señales no ejecutan archivos ni vencen la elección humana. |
| Experiencia | `verify-ui`, contrato de vocabulario y lenguaje; `PROJECT_VISION.md` y lista con nombres humanos; `npm run check` y OpenSpec strict. |

## Risks / Rollback

Centralizar muchos consumidores puede producir ciclos o alterar proyectos viejos. La dependencia de una sola dirección y fixtures con hashes cierran ese riesgo. El cambio se entrega por PR protegido; revertirlo antes de release restaura el mapeo anterior, sin migración de datos. No se declara lista ninguna etapa por observar solo un archivo.
