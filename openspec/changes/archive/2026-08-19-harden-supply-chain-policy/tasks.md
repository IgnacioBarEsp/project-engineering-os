## 1. Auditoría y política

- [x] 1.1 Crear la política versionada y el evaluador fail-closed para raíz, runtime y blueprint.
- [x] 1.2 Cubrir hallazgos high/critical, excepciones exactas y errores de evidencia con pruebas unitarias.
- [x] 1.3 Integrar el job de auditoría al agregado requerido de CI y verificar su contrato.

## 2. Privacidad de OpenSpec

- [x] 2.1 Añadir al blueprint un wrapper Node administrado que use telemetría apagada por defecto.
- [x] 2.2 Reencaminar los scripts `openspec:*`, conservar opt-in explícito y actualizar el manifest del blueprint.
- [x] 2.3 Verificar default, opt-in, binario ausente y propagación del exit code en pruebas y fixture.

## 3. Documentación y triage

- [x] 3.1 Versionar el triage de Socket con superficie, veredicto, evidencia y seguimiento por señal.
- [x] 3.2 Enlazar costos/licencias, avisos, quickstarts y prompts al contrato real y su límite.

## 4. Evidencia y cierre

- [x] 4.1 Ejecutar las tres auditorías, `npm run check`, fixture y OpenSpec strict.
- [x] 4.2 Verificar manualmente un repositorio recién bootstrapeado con default y opt-in de telemetría.
- [x] 4.3 Completar readiness, revisión adversarial y captura de deuda; dejar el change listo para archive.
