## 1. Artefactos y baseline

- [x] 1.1 Vincular el issue #48 y registrar why, scope, no objetivos, riesgo y rollback.
- [x] 1.2 Crear TLDR, baseline brownfield, diseño y delta de supply-chain-governance.
- [x] 1.3 Registrar que readiness in situ falla por #49 y conservar la evidencia previa PASS 13/13 del spike.

## 2. Dependencia reproducible

- [x] 2.1 Añadir `@fission-ai/openspec` 1.6.0 exacto a `devDependencies` y `allowScripts`.
- [x] 2.2 Regenerar `package-lock.json` y comprobar una instalación limpia.
- [x] 2.3 Verificar que el binario local existe y reporta 1.6.0.

## 3. Evidencia automática

- [x] 3.1 Validar todos los artefactos OpenSpec en modo estricto.
- [x] 3.2 Ejecutar `npm run check` y `npm run check:audit`.
- [x] 3.3 Ejecutar fixture acotado, fixture completo y verificación del paquete.
- [x] 3.4 Repetir `npm ci` y confirmar que no aparece drift.

## 4. Cierre local

- [x] 4.1 Completar revisión adversarial y resolver Blockers/Majors.
- [x] 4.2 Registrar assessment de deuda y readiness con evidencia verificable.
- [x] 4.3 Archivar el change con OpenSpec local; dejar push/PR/merge para una sesión autenticada.
