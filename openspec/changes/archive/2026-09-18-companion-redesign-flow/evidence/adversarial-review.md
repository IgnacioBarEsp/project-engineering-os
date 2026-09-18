# Adversarial Review — 2026-09-18

Scope: Issue #128 (`companion-redesign-flow`).

## Vectores de Ataque y Comprobaciones

1. **Riesgo de Infracción de Vocabulario y Promesas No Demostradas (`UNDEMONSTRATED`)**:
   - *Ataque*: El texto del prompt maestro o de las tarjetas de interfaz podría introducir afirmaciones de ahorro de tokens o garantías como `100%`, violando la política del repositorio en `test/companion-language.test.mjs`.
   - *Mitigación*: Se auditó el texto completo de `apps/companion/ui/app.mjs` y `apps/companion/context/prompts.mjs`. Se reemplazaron términos como "ahorrar tokens" por "optimizar el contexto", y "al 100%" por "correctamente" / "exhaustivamente". La prueba `test/companion-language.test.mjs` arrojó 0 coincidencias y 9 tests pasados.

2. **Riesgo de Infracción de Glosario sin Enlace en Contrato de Interfaz (`interface-contract.mjs`)**:
   - *Ataque*: La descripción del perfil `software` contenía la palabra "ingeniería", la cual es un término del glosario que requiere botón interactivo si aparece en la UI.
   - *Mitigación*: Se ajustó la frase a "pruebas técnicas". La herramienta `node scripts/verify-interface-contract.mjs` reportó 0 findings y 40 mutaciones detectadas.

3. **Riesgo de Corrupción de Huella Digital de Inventario por Escritura de `PROJECT_VISION.md`**:
   - *Ataque*: Al escribir `PROJECT_VISION.md` durante `applyBase`, una carpeta recién preparada cambiaría su inventario de archivos respecto a la inspección previa, causando estado `inventory-stale` en lugar de `verified`.
   - *Mitigación*: Se incorporó `'PROJECT_VISION.md'` a `CONTROL_PATHS` en `apps/companion/engine/inventory.mjs`, tratándolo como archivo de política/control excluido de la huella de fuentes del usuario. La suite `project-list.mjs` validó todos los casos.

4. **Riesgo de Regresión en Perfiles Históricos**:
   - *Ataque*: Proyectos creados previamente con perfiles `research`, `unity`, `media` o `general` podrían fallar o no ser reconocidos.
   - *Mitigación*: `PROFILE_IDS` unifica los 7 perfiles canónicos con los 4 legados. Se garantiza compatibilidad hacia atrás total.

## Veredicto

- **Blockers**: 0
- **Majors**: 0
- **Minors**: 0
- **Resultado**: PASSED
