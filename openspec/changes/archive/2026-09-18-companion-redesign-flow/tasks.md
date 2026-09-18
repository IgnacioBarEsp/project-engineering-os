## 1. Taxonomía de Perfiles y Persistencia de Visión

- [x] 1.1 Expandir `PROFILE_IDS` en `engine/inventory.mjs` soportando 7 perfiles canónicos y retrocompatibilidad.
- [x] 1.2 Capturar visión del usuario y escribir `PROJECT_VISION.md` en `engine/preparation.mjs`.
- [x] 1.3 Adaptar pruebas unitarias de inventario y preparación en `qa/`.

## 2. Orquestación del Prompt Maestro y Bifurcación

- [x] 2.1 Implementar generador de Prompt Maestro en `context/prompts.mjs` con soporte para Vía Rápida y Delegada a IA.
- [x] 2.2 Incluir protocolo de 3 preguntas no técnicas, conversión segura a Markdown y verificación de entorno.
- [x] 2.3 Proteger composición de prompts con pruebas en `qa/prompts.mjs`.

## 3. Rediseño Visual Obsidian Precision Studio y Flujo de 4 Pasos

- [x] 3.1 Implementar tokens de color, componentes y animaciones de Obsidian Precision Studio en `ui/app.css`.
- [x] 3.2 Implementar los 4 pasos interactivos y la pantalla final en `ui/app.mjs` con microcopia empática.
- [x] 3.3 Sincronizar catálogo de acciones y accesibilidad con `interface-contract.mjs`.

## 4. Verificación, Evidencia y Cierre de Cambios

- [x] 4.1 Ejecutar suite completa `npm test` en `apps/companion` y `npm run check` en raíz.
- [x] 4.2 Completar revisión adversarial, evaluación de deuda limpia y gates pre-archive.
- [x] 4.3 Archivar change con `npx openspec archive companion-redesign-flow --yes`.
