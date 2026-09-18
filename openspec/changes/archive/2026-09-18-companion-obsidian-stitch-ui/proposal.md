# Proposal: Obsidian Precision Studio / Stitch UI en Companion

Enlaza al issue #139.

## Motivación
Tras la distribución de la versión 0.3.0, se identificó que los archivos CSS y HTML reales de producción aún utilizaban la paleta retro beige/verde (#F8F8F3) y la barra lateral antigua, lo que provocaba que la aplicación instalada en Windows se viera idéntica a las versiones previas. Se requiere aplicar fielmente el diseño Obsidian Precision Studio / Stitch en la interfaz real de Companion, alineando la paleta oscura (#0B0F19, #121826, #6366F1, #06B6D4, #10B981), la cabecera superior moderna tipo Topbar, las tarjetas de acción y pilares en Inicio, la eliminación del parpadeo inicial, la regeneración del icono nativo de Windows y la validación estricta de contraste y contratos con incremento a versión 0.3.1.

## Alcance
1. Reemplazar la barra lateral retro por una barra superior moderna tipo Topbar en `apps/companion/ui/index.html`.
2. Implementar los tokens y estilos de Obsidian Precision Studio / Stitch en `apps/companion/ui/app.css`.
3. Actualizar la vista de Inicio en `apps/companion/ui/app.mjs` con doble tarjeta de acción y 3 pilares locales, preservando intactos los contratos de lenguaje y puntos de prueba.
4. Regenerar el icono nativo de Windows (`build/icon.ico`) con la paleta Obsidian mediante `apps/companion/scripts/build-icon.mjs`.
5. Eliminar destellos claros en el arranque fijando `backgroundColor: '#0b0f19'` en `apps/companion/desktop/main.mjs`.
6. Incrementar versión a 0.3.1 en `package.json`, `package-lock.json`, `THIRD-PARTY-NOTICES.md`, `qa/packaging.mjs` y redactar `RELEASE_NOTES_0.3.1.md`.
7. Validar todas las suites automatizadas: 38 pantallas en `verify-ui.mjs`, 40/40 mutaciones en `verify-interface-contract.mjs`, 141 tests de Companion y 326 checks del monorepo.
