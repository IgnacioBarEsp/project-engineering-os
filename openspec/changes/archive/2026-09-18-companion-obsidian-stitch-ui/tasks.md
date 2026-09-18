# Tasks: companion-obsidian-stitch-ui

## 1. Interfaz y Tokens
- [x] 1.1 Rediseñar la navegación a Topbar superior moderna en `apps/companion/ui/index.html`.
- [x] 1.2 Implementar los tokens de color Obsidian Precision Studio en `apps/companion/ui/app.css`.
- [x] 1.3 Adaptar las vistas de Inicio y pasos del wizard con tarjetas y pilares en `apps/companion/ui/app.mjs`.
- [x] 1.4 Garantizar contraste accesible WCAG y soporte responsivo hasta 240px.

## 2. Iconografía y Experiencia Nativa
- [x] 2.1 Actualizar `build-icon.mjs` y regenerar `build/icon.ico` en paleta Obsidian.
- [x] 2.2 Fijar `backgroundColor: '#0b0f19'` en `desktop/main.mjs` para evitar flicker.

## 3. Identidad 0.3.1 y Contratos
- [x] 3.1 Incrementar versión a 0.3.1 en `package.json`, `package-lock.json`, `THIRD-PARTY-NOTICES.md` y `qa/packaging.mjs`.
- [x] 3.2 Redactar `RELEASE_NOTES_0.3.1.md`.
- [x] 3.3 Calibrar mutaciones en `verify-interface-contract.mjs` para tema oscuro.

## 4. Verificación y Auditoría
- [x] 4.1 Ejecutar `verify-ui.mjs` (38 pantallas con 0 hallazgos).
- [x] 4.2 Ejecutar `verify-interface-contract.mjs` (40/40 mutaciones detectadas).
- [x] 4.3 Ejecutar tests de Companion (141/141) y suite monorepo `npm run check` (326/326).
- [x] 4.4 Registrar revisión adversarial y evaluación de deuda técnica.
