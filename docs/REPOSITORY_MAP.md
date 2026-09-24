# Qué pertenece al repositorio y qué recibe quien instala npm

El repositorio mantiene dos superficies upstream distintas: el núcleo universal CLI/biblioteca y la
aplicación Companion para Windows. La publicación `create-project-engineering-os` contiene el núcleo y las
guías para su consumidor; no instala Companion ni transfiere al proyecto consumidor las herramientas del
repositorio upstream.

## Contenido del paquete npm

`package.json#files` declara las rutas publicables. `scripts/check-package.mjs` empaca y extrae el artefacto
real, rechaza rutas que no coinciden con esa declaración y comprueba los enlaces relativos desde el `.tgz`.
La allowlist del [export del repositorio en GitHub](https://github.com/IgnacioBarEsp/project-engineering-os/blob/main/config/export-allowlist.json) cubre otra superficie: preserva
el checkout completo y no concede por sí sola permiso para incluir un archivo en npm.

| Ruta incluida | Para qué la necesita el consumidor |
| --- | --- |
| `bin/`, `src/`, `schema/`, `blueprint/` | CLI, API, contratos y semillas que bootstrap prepara en el repositorio consumidor |
| `CHANGELOG.md`, `LICENSE`, avisos y `README.md` | Historia de cambios, licencia y entrada obligatoria/documentación del paquete |
| `docs/README.md`, `CLI_GUIDE.md`, `EXISTING_PROJECTS.md`, `ISOLATED_TOOLCHAIN.md` | Instalación, adopción segura y uso del núcleo |
| `docs/COMPATIBILITY.md`, `PATH_RULES.md`, `TOOL_CATALOG.md`, `ONBOARDING_PLAN.md`, `GUIA_MANUAL_USUARIO.md` | Límites, selección de herramientas y decisiones del usuario |
| `docs/DEBT_CONTROL.md`, `PROJECT_OS.md`, `RECOVERY.md`, `SPEC_PURPOSE.md` | Operación, diagnóstico y recuperación del método |
| `docs/ADAPTIVE_ONBOARDING.md`, `AI_OPPORTUNITY_GUIDE.md`, `COSTS_AND_LICENSES.md`, `INSTALL_HARDENING.md`, `SELF_APPLICATION.md`, `TRACKERS.md`, `UPSTREAM_CONSUMERS.md`, `UPSTREAM_OPERATIONS.md` | Orientación neutral y contratos de operación del núcleo |
| `docs/adr/`, `docs/architecture/`, `docs/prompts/`, `docs/security/` | Decisiones, ownership/versionado, prompts base y política de cadena de suministro |

La lista exacta de documentos está en `package.json#files`; las carpetas de documentación permitidas se
limitan a `adr/`, `architecture/`, `prompts/` y `security/`. El checker detecta archivos Markdown nuevos o
imágenes fuera de esas rutas antes de una release.

## Contenido que permanece solo en el repositorio

No se distribuyen `docs/companion/`, `docs/stitch uxui/`, `docs/assets/`, `docs/USER_GUIDE.md`,
`docs/PROJECT_STATUS.md`, `docs/RELEASES.md` ni las presentaciones. Explican la aplicación, su diseño
visual, capturas o estado del upstream, no el CLI que se acaba de instalar; tampoco
se envían imágenes, incluida la captura antigua que no debe interpretarse como evidencia del Companion.
Estos documentos siguen versionados en GitHub y no se borran al recortar el tarball. El índice de npm es
esta [guía neutral](README.md); la portada del repositorio mantiene los enlaces a las guías del app.

La app vive en `apps/companion/`, con dependencias y ciclo de release propios; no está en `files`. Las
pruebas, scripts, configuración, workflows, landing y archivos de OpenSpec son del mantenimiento upstream,
no del consumidor npm. La documentación completa de Companion sigue en el árbol público
[`docs/companion`](https://github.com/IgnacioBarEsp/project-engineering-os/tree/main/docs/companion).

## Qué verificar al cambiar la distribución

1. Revisar `package.json#files`, no inferir el paquete a partir de la allowlist de exportación.
2. Ejecutar `npm run check:package` y comprobar las rutas y enlaces del tarball extraído.
3. Registrar `fileCount`, `unpackedBytes`, `bytes` y SHA-256 del mismo tarball en el manifest de release.
4. Confirmar que no se borraron guías del repositorio y que la reversión propuesta conserva tags y releases.

El [modelo de ownership](architecture/OWNERSHIP.md) asigna responsables. Para instalar el núcleo, sigue la
[guía CLI](CLI_GUIDE.md); para las fechas y la integridad de cada ciclo de publicación, consulta la
[guía de releases del repositorio](https://github.com/IgnacioBarEsp/project-engineering-os/blob/main/docs/RELEASES.md).
