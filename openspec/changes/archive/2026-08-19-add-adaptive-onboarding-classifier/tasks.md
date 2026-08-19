## 1. Contratos versionados

- [x] 1.1 Añadir schemas públicos estrictos para respuestas y estado canónico de onboarding.
- [x] 1.2 Definir constantes, vocabulario de preguntas/rutas y exports públicos sin dependencias nuevas.

## 2. Inspección y clasificación

- [x] 2.1 Implementar scanner local acotado con exclusiones, límites y symlinks visibles pero no seguidos.
- [x] 2.2 Añadir detección Git read-only para historial, dirty state y proveedor remoto saneado.
- [x] 2.3 Normalizar y validar las cinco respuestas, incluyendo `unknown` y `defer`.
- [x] 2.4 Implementar precedencia brownfield, rutas nuevas, próximos pasos y fingerprint determinista.

## 3. Estado anterior y salida CLI

- [x] 3.1 Leer estado opcional dentro del target y migrar draft v0 a v1 en memoria con receipt.
- [x] 3.2 Rechazar estados futuros, corruptos y shapes desconocidos con recuperación explícita.
- [x] 3.3 Integrar `onboarding-plan`, sus flags y salida humana/JSON equivalente en la CLI.
- [x] 3.4 Documentar uso, respuestas, estado read-only, privacidad, migración y límites.

## 4. Evidencia automatizada

- [x] 4.1 Cubrir carpeta vacía, principiante, experimentado, brownfield y prioridad de preservación.
- [x] 4.2 Cubrir ambigüedad, inputs inválidos, symlinks/límites y ausencia de filtración.
- [x] 4.3 Cubrir estado v0/v1/futuro, reejecución byte-idéntica y source sin mutar.
- [x] 4.4 Añadir integración del comando instalado y comprobar contenido del tarball.
- [x] 4.5 Ejecutar OpenSpec strict, `npm run check`, `pack:verify` y `git diff --check`.

## 5. Cierre SDD

- [x] 5.1 Registrar evidencia manual, revisión adversarial y assessment de deuda.
- [x] 5.2 Completar metadata de readiness, confirmar tareas/evidencia y preparar el archive OpenSpec.
