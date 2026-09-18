## Context

Los prototipos aprobados en `docs/stitch uxui/stitch_project_engineering_os_companion/` establecen la dirección visual y de interacción para Companion. La arquitectura existente de `apps/companion` separa claramente `ui/` (renderizado nativo vanilla ES modules), `engine/` (inspección de inventario, transacciones y escritura atómica) y `context/` (composición de prompts y enrutamiento contextual).

## Decision

1. **Motor de Taxonomía y Perfiles**:
   - En `engine/inventory.mjs`, expandir `PROFILE_IDS` a `['software', 'science', 'studies', 'docs', 'mvp', 'personal', 'automation']`, reconociendo además los identificadores históricos (`research`, `unity`, `media`, `general`) como alias válidos.
   - En `ui/app.mjs`, estructurar la metadata de cada perfil con iconos representativos, badges de stack y descripciones funcionales concisas.
2. **Delimitación Dinámica (Paso 2)**:
   - Presentar una grilla contextual según el perfil seleccionado (e.g. en Software: Plataforma Web/SaaS, Página Web/Landing, App Móvil, Prototipo Propio, Guiado por IA).
3. **Visión & PROJECT_VISION.md (Paso 3)**:
   - Editor de texto con sugerencias rápidas ("Público Objetivo", "Dolor Principal", "Alcance MVP").
   - El motor `engine/preparation.mjs` persiste `PROJECT_VISION.md` en la raíz junto a `project.json` y `START.md`.
4. **Bifurcación de Instalación (Paso 4)**:
   - Comparativa de 2 columnas: Vía Rápida (velocidad inmediata) vs Que mi IA se encargue (personalización y exploración viva).
   - Ejecuta la preparación en disco mediante `api.prepareProject` sin bloqueos de interfaz.
5. **Pantalla Final & Prompt Maestro**:
   - Muestra el estado 100% verificado y provee botones de copia para la ruta de la carpeta y el Prompt Maestro generado.
   - El prompt instruye a la IA a leer `PROJECT_VISION.md`, realizar 3 preguntas accesibles, investigar herramientas, convertir documentos a Markdown sin alterar originales y verificar que todo funcione.
6. **Tokens Visuales y Rendimiento**:
   - `ui/app.css` implementa la paleta Obsidian Precision Studio (#0F131D, #171B26, #1C1F2A, #8083FF, #4CD7F6, #4EDEA3).
   - Animaciones aceleradas por GPU, loaders sutiles y estados accesibles WCAG.

## Recovery

Si algún paso de preparación fallara en disco, el journal transaccional existente de Companion permite revertir o continuar de forma atómica. Un revert en git devuelve los módulos de `ui/`, `engine/` y `context/` a su estado previo sin pérdida de datos.
