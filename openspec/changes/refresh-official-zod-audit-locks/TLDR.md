# #214 — propuesta de corrección oficial de zod

**Pendiente de aprobación de esta spec. No hay cambio de locks, instalación ni fix aplicado.**

Las auditorías del 11 de noviembre detectaron un high en zod: raíz resuelve 4.5.4 y la plantilla 4.4.3. El CLI publicado no tiene esa dependencia de producción. [El aviso primario](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5) registra 4.6.6 como primera versión corregida.

Propongo actualizar **sólo tres campos de la entrada zod en cada lock** al artefacto oficial **4.6.6**: versión, URL e integridad. Mantener OpenSpec **1.6.0**, manifests, resto del grafo, runtime, política y protecciones. Después: instalación desechable sin scripts, auditorías de los tres scopes, pruebas reales de OpenSpec/constructor, regresiones acotadas, revisión independiente y PR protegido. Si aparece drift o falla una comprobación, se detiene y conserva la evidencia.

La DoR pasó **13/13, cero excepciones** antes de crear el change con OpenSpec local fijo. Eso permite presentar la propuesta; no aprueba el Apply ni acredita compatibilidad funcional.

Recuperación: rechazar la candidata antes de integrar o revertir el cambio completo mediante PR protegido. Conservar los locks originales y los resultados adversos; el baseline con el aviso sigue sin ser apto.

#204 sigue independiente: npm 11.21.1 falló por undici; 11.21.2 aún no alcanza su plazo de edad. No hay quinto parche propio de npm ni trabajo de ola 4.

[Propuesta](proposal.md) · [Diseño y límites](design.md) · [Requisitos](specs/supply-chain-governance/spec.md) · [Tareas](tasks.md) · [Baseline](brownfield-baseline.md) · [Índice de evidencia](evidence/manifest.json)
