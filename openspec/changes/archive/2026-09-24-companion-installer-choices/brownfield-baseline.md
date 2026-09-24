# Baseline de #168 antes de apply

El checkout de preparación se creó desde `origin/main` en `2384fab` sobre la rama
`codex/168-installer-choices`. El árbol estaba limpio salvo por la carpeta nueva del change. Companion declara
0.3.2, el núcleo fijado es 0.5.0 y electron-builder es 26.15.3. El issue #168 pasó el gate de propuesta con
13 PASS, 0 FAIL y 0 EXCEPTION antes de modificar la fuente.

## Estado observado

| Fuente | Estado antes del apply |
| --- | --- |
| `apps/companion/electron-builder.yml` | `createDesktopShortcut: true`, `runAfterFinish: false` y sin `language`; la plantilla usa su valor de idioma por defecto. |
| `apps/companion/build/installer.nsh` | Macros de detección de versión, limpieza de caché y verificación de carpeta; no había página de elección de escritorio. |
| `apps/companion/qa/packaging.mjs` | La aserción exigía `createDesktopShortcut === true`; no protegía idioma, Finish ni propiedad del enlace. |
| `apps/companion/scripts/verify-release-installation.mjs` | Instalaba 0.1.0, actualizaba a 0.3.2 y desinstalaba, pero no observaba accesos directos. La guardia rechazaba estaciones normales. |
| `docs/companion/INSTALLER.md` | Afirmaba que el acceso directo siempre se creaba y no explicaba una elección de apertura. |

## Decisiones de alcance

No se cambia la instalación por usuario, la detección contextual, el menú Inicio, la limpieza de caché, la
licencia, la firma, la elevación, la actualización automática ni la versión de Companion. La publicación de
la release y la instalación asistida real pertenecen al workflow protegido sobre Windows desechable.

## Evidencia previa leída

El registro archivado de #142 documenta una instalación silenciosa y una desinstalación en Windows IoT, incluida
la preservación de proyecto, historial y runtime. Ese registro se usa como contexto histórico, no como evidencia
de las nuevas casillas o del idioma de #168.
