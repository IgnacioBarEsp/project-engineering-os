# Validation — 2026-09-18

Scope: Issue #128 (`companion-redesign-flow`), Rediseño de flujo del Companion según especificaciones de Stitch (Obsidian Precision Studio), principios de pbakaus/impeccable, taxonomía de 7 perfiles canónicos, persistencia de `PROJECT_VISION.md`, bifurcación de instalación ("Instalación Rápida" vs "Que mi IA se encargue") y generación de Prompt Maestro para LLMs.

## Automatic Evidence

- PASS DoR pre-propose: 13 comprobaciones completas validadas con `readiness-check --phase propose --issue 128`.
- PASS OpenSpec: `npx openspec validate companion-redesign-flow --strict --no-interactive` ejecutado con éxito sin desviaciones de esquema.
- PASS Companion tests: 140/140 pruebas pasan limpiamente en `apps/companion` (`npm test`).
  - Cobertura de perfiles canónicos expandidos (`software`, `science`, `studies`, `docs`, `mvp`, `personal`, `automation`) y retrocompatibilidad con perfiles legados.
  - Validación del generador `masterActivationPrompt` para Vía Rápida e IA delegada.
  - Exclusión de `PROJECT_VISION.md` en `CONTROL_PATHS` para preservar huella digital de inventario en `inspectFolder`.
- PASS Interface Contract: `node scripts/verify-interface-contract.mjs` en `apps/companion` finaliza con 0 findings y 40 mutaciones detectadas. Cumplimiento de contraste, tokens semánticos y reglas de accesibilidad.
- PASS Monorepo workspace check: 326/326 pruebas pasan en `npm run check` a nivel raíz.
  - Lenguaje y aserciones verificadas contra `test/companion-language.test.mjs` sin afirmaciones no demostradas.

## Observed Review

- Se verificó la consistencia visual y de diseño con los prototipos Obsidian Precision Studio de Google Stitch (`docs/stitch uxui/stitch_project_engineering_os_companion`).
- Tipografía técnica JetBrains Mono / Inter, acentos esmeralda oscuro (`#10b981`), bordes con opacidad sutil y badges de modo.
- Flujo interactivo en 4 pasos:
  1. Paso 1: Tu proyecto (nombre, rol, perfil ampliado a 7 opciones canónicas, objetivo y selección de IA).
  2. Paso 2: Delimitación técnica (subtipo específico por perfil con tags y tecnologías sugeridas).
  3. Paso 3: Visión del proyecto (editor interactivo con chips de inspiración y persistencia en `PROJECT_VISION.md`).
  4. Paso 4: Instalación bifurcada (Vía rápida con Companion vs. "Que mi IA se encargue" con preguntas no técnicas y conversión no destructiva de fuentes).
  5. Pantalla Final: Resumen de activación, copia de ruta, copia de Prompt Maestro y pilares de seguridad 100% offline.

## Recovery & Rollback

- Reversión atómica mediante `git revert` del commit correspondiente.
- Los archivos originales del usuario se preservan intactos sin sobreescritura destructiva.
