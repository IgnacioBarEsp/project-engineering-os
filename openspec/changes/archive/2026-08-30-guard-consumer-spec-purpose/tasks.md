## 1. Fuente única publicada

- [x] 1.1 Mover el módulo a `src/spec-purpose.mjs` conservando sus cinco modos de fallo.
- [x] 1.2 Exportar `inspectSpecPurposes` y `SPECS_ROOT` desde `src/index.mjs`.
- [x] 1.3 Hacer que `scripts/check-docs.mjs` importe el módulo publicado y conserve su salida.

## 2. Gate en el comando publicado

- [x] 2.1 Cablear la inspección en `src/opsx-check.mjs` con severidad `FAIL`.
- [x] 2.2 Emitir un check por capability publicada y nombrar su ruta concreta.
- [x] 2.3 Redactar una recuperación por modo que diga qué escribir, no solo qué falta.
- [x] 2.4 Mantener el comando read-only: sin escrituras y sin `mutationPerformed`.

## 3. Casos negativos

- [x] 3.1 Fallar si una capability publicada conserva el texto sembrado por el archive.
- [x] 3.2 Fallar si el Purpose está vacío o la sección no existe.
- [x] 3.3 Fallar cerrado si el árbol de specs o una spec concreta no se puede leer.
- [x] 3.4 Comprobar que los deltas de `openspec/changes` quedan fuera del gate.
- [x] 3.5 Comprobar que un árbol de specs vacío no inventa un veredicto.

## 4. Documentación y evidencia

- [x] 4.1 Documentar el contrato nuevo y enlazarlo desde el índice de documentación.
- [x] 4.2 Registrar la entrada de CHANGELOG con nota de migración explícita.
- [x] 4.3 Ejecutar OpenSpec estricto, `npm run check` y `npm run fixture -- --skip-install`.
- [x] 4.4 Verificar el gate a mano sobre un target bootstrapeado, con el texto sembrado y con el redactado.
- [x] 4.5 Completar revisión adversarial, Debt Control y readiness de archive.
- [x] 4.6 Preparar el PR protegido con evidencia, licencias afectadas y assessment de deuda.
