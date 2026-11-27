## Why

[#145](https://github.com/IgnacioBarEsp/project-engineering-os/issues/145) encontró once identificadores de perfil y cuatro módulos que solo conocen cinco de ellos. Elegir un perfil nuevo muestra una etiqueta, pero en recetas, etapas y recomendaciones cae silenciosamente al caso general. Unity y contenido creativo, en cambio, dependen de identificadores antiguos. Un recibo 0.3.x debe seguir abriendo sin reescribir los archivos de la persona.

## What Changes

- Definir exactamente seis perfiles y sus enfoques en `apps/companion/engine/profiles.mjs`, junto con capacidades, etapas, reglas, recetas, tecnologías y nombres humanos.
- Hacer que preparación, servicio, inventario, prompts, recetas, catálogo y renderer consulten esa fuente. Eliminar comprobaciones de listas dispersas y el fallback de enfoques de Software para otros perfiles.
- Recomendar perfil y enfoque con señales observables de la carpeta (Unity, Godot, package.json, LaTeX/BibTeX, notebooks y presentaciones) sin ejecutar ni confiar en código de la carpeta.
- Leer recibos 0.3.x con un mapa cerrado sin mutarlos; los proyectos nuevos usan únicamente la taxonomía nueva. `PROJECT_VISION.md` y la lista muestran nombres humanos.
- Probar todas las combinaciones, el legado Unity y recibos viejos con pruebas negativas, vocabulario y recorridos de UI.

## Impact

Solo Companion, su renderer, specs y evidencia. No cambia el núcleo neutral, servicios externos, cuentas ni descargas de modelos. El flujo visual definitivo y las dos vías de instalación quedan en #146 y #147. El cambio depende en código del commit de fundación #144 (`f8d8b54`), aún pendiente de sus gates de integración.
