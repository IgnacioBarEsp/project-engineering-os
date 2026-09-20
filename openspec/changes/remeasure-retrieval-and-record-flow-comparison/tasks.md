# Tareas — remeasure-retrieval-and-record-flow-comparison

## 1. Preparación medible

- [x] 1.1 Verificar el gate de Definition of Ready del issue #166 con `readiness-check --phase propose`.
- [x] 1.2 Traer los dos corpus a sus commits congelados, fuera del repositorio, y comprobar que `HEAD` coincide.
- [x] 1.3 Descargar el instalador publicado 0.3.2 y comprobar su SHA-256 contra el `SHA256SUMS` de la release.
- [x] 1.4 Medir y registrar la salida de `sync --check` y `doctor`, que sostienen la superficie propuesta.
- [ ] 1.5 Registrar la baseline y el plan de evidencia.

## 2. Prueba 1: re-medir la recuperación

- [ ] 2.1 Instalar el instalador comprobado en una ruta corta y registrar la identidad de la instalación.
- [ ] 2.2 Ejecutar `verify-real-repository-benchmark.mjs` contra esa instalación y los dos checkouts, con el
  protocolo, las preguntas y los commits sin tocar, en un directorio de evidencia vacío.
- [ ] 2.3 Pasar el revisor del benchmark sobre los cuatro JSON producidos.
- [ ] 2.4 Desinstalar y comprobar que la desinstalación terminó.
- [ ] 2.5 Publicar el resultado junto al del 13 de septiembre, con la versión y la identidad de cada corrida,
  salga favorable o adverso.

## 3. Prueba 2: los dos flujos sobre una tarea

- [ ] 3.1 Escribir y congelar la tarea y sus criterios de aceptación antes de ejecutar nada, con su digest.
- [ ] 3.2 Ejecutar la vía del prompt suelto, sin comprobación, y conservar sus artefactos.
- [ ] 3.3 Ejecutar la vía del flujo completo y conservar los suyos.
- [ ] 3.4 Registrar lo observable de ambas y declarar en el propio registro que una tarea no demuestra una
  ventaja general.

## 4. Prueba 3: el contraste del arnés

- [ ] 4.1 Ejecutar el arnés de hoy sobre `a3b1efd` en un árbol aparte, sin tocar el renderer de ese commit.
- [ ] 4.2 Ejecutar el arnés de hoy sobre el commit corregido.
- [ ] 4.3 Registrar el contraste frente a lo que el arnés anterior certificó, o registrar que no aparece y que
  #150 sigue haciendo falta.

## 5. Prueba 4: el arranque documentado

- [ ] 5.1 Escribir la comprobación reproducible de los seis pasos contra el paquete publicado, fuera de
  `npm run check`, con su declaración de que necesita red.
- [ ] 5.2 Ejecutarla y registrar el resultado de cada paso.
- [ ] 5.3 Probar que falla cuando un paso no sale con código 0.

## 6. Publicación y cierre

- [ ] 6.1 Actualizar `docs/companion/EVIDENCE.md` con las cuatro mediciones, su método y sus límites.
- [ ] 6.2 Pasar la revisión adversarial desde contexto limpio y resolver sus Blockers y Majors.
- [ ] 6.3 Capturar el assessment de deuda después de la última pasada de revisión.
- [ ] 6.4 Sustituir los estados pendientes de readiness solo con evidencia ejecutada, y pasar strict y el gate
  de archive con `--run-local`.
- [ ] 6.5 Archivar con el CLI local, corregir los enlaces del change archivado, firmar los commits con DCO y
  entregar por PR protegido.

Alcance decidido por el mantenedor el 20 de septiembre de 2026: las cuatro pruebas, e instalar la aplicación
publicada para medirla ([decisiones](evidence/maintainer-decisions.md)). Quedan dos decisiones abiertas: la
superficie y la tarea de la comparación.
