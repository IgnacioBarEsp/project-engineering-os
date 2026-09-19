## 1. Entrada a implementación

- [x] 1.1 Registrar la aprobación del mantenedor de esta spec y de la superficie `documentation`; releer el límite de la propuesta y el preflight. ([decisiones](evidence/maintainer-decisions.md): «Solo documentation», «Desde el código», «Sí, apply completo hasta PR»)
- [x] 1.2 Revalidar la DoR de #143 y la baseline si cambiaron `main`, el issue o los artefactos. (13 PASS, 0 FAIL en [readiness-propose.json](evidence/readiness-propose.json); `main` sigue en `eefa1bc`, issue OPEN sin cambios desde 2026-09-19T02:24:31Z)

## 2. Comprobación de procedencia

- [x] 2.1 Crear `scripts/screenshot-provenance.mjs` con las reglas de la decisión 4 y ejecutarlo desde `scripts/check-docs.mjs`.
- [x] 2.2 Probar cada rechazo con un fixture temporal: imagen idéntica a un mock, registro ausente o ilegible, hash o tamaño distintos, campo inválido, ruta de usuario y generador inexistente. Probar también el repositorio real en verde.
- [x] 2.3 Actualizar `scripts/public-guidance.mjs` y su prueba para que el entorno declarado sea «ventana real de la aplicación».

## 3. Generador y capturas

- [x] 3.1 Crear `apps/companion/scripts/capture-screenshots.mjs` según las decisiones 1 a 3: Electron aislado, carpeta de proyecto neutra, árbol limpio, pantallas y registros.
- [x] 3.2 Hacer commit del código, generar las siete capturas desde ese commit y comprobar que ninguna coincide con un mock y que ningún registro nombra la cuenta.
- [x] 3.3 Inspeccionar cada captura contra la ventana real y registrar la inspección con su autoría.

## 4. Documentación

- [x] 4.1 Crear `docs/stitch uxui/README.md` que rotule el prototipo y enlace la galería real.
- [x] 4.2 Reescribir `docs/companion/SCREENSHOTS.md`, el pie del README, `docs/README.md` y `docs/PROJECT_STATUS.md` según la decisión 6.
- [x] 4.3 Pasar `npm run check`, los enlaces relativos y la neutralidad.

## 5. Cierre

- [ ] 5.1 Pasar la revisión adversarial desde contexto limpio y resolver sus Blockers y Majors.
- [ ] 5.2 Capturar el assessment de deuda después de la última pasada de revisión.
- [ ] 5.3 Sustituir los estados pendientes de readiness solo con evidencia ejecutada, y pasar strict y el gate de archive con `--run-local`.
- [ ] 5.4 Archivar con el CLI local, corregir los enlaces del change archivado, firmar los commits con DCO y entregar por PR protegido. La integración queda sujeta a la CI requerida y a la decisión del mantenedor.

Preparación completada y apply autorizado por el mantenedor el 19 de septiembre de 2026
([decisiones](evidence/maintainer-decisions.md)).
