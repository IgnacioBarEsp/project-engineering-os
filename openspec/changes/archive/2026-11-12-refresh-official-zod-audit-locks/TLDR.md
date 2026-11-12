# #214 — candidata oficial comprobada en integración conjunta

Spec013ac784 aprobada por el mantenedor; [registro literal](evidence/spec-approval.md). Fuente comprobada: `ed08b7484d5e1b4198cca01a76c1694b22e57abb`. La CI conjunta de#216 head346e3bd pasó en los tres sistemas, con los bytes214 intactos. **Faltan archivo e integración protegida; el issue sigue abierto.**

Se actualizaron únicamente versión, URL e integridad de zod en ambos locks al artefacto oficial4.6.6. OpenSpec1.6.0, manifests, resto del grafo y política permanecen intactos.

- Auditorías root/root-runtime/consumer-blueprint: **0 high/critical, cero excepciones nuevas**. Root mantiene1moderate permitido por la política.
- Núcleo **396/396** y OpenSpec strict **21/21** en Node22.22.0,24.18.0,24.20.0.
- Fixtures normal y aislada PASS; consumidor realmente generado con `npm ci` y lock byte-idéntico.
- Regresiones ESM/CJS/compile y ruta real ChangeSchema/Validator PASS; revisión independiente sin hallazgos accionables en el flujo OpenSpec.
- Recuperación real por git revert en una copia propia: árbol completo anterior y ambos grafos originales restaurados. El baseline afectado no se declara seguro.
- Assessment clean de este cambio capturado por CLI; registro50objetos/37abiertos y73assessments anteriores intactos. La captura nueva no cierra deuda histórica.

El límite demostrado es el rechazo temprano con un máximo inicial en parseo forward; no se promete presupuesto global de OpenSpec, de encode o de arrays sin máximo. Fallos iniciales y degradaciones siguen en el [índice de evidencia](evidence/manifest.json).

#204 tiene su propia spec aprobada y verificación. La integración conjunta conserva ambos expedientes;
[readback y límites](evidence/joint-integration-verification.md). No hubo quinto parche npm ni trabajo de ola4.

[Propuesta](proposal.md) · [Diseño](design.md) · [Requisitos](specs/supply-chain-governance/spec.md) · [Tareas](tasks.md) · [Baseline](brownfield-baseline.md)

## Official archive checkpoint — 2026-11-12

Readiness16PASS/0FAIL/0exceptions for each phase was verified without mutation. Fixed official
OpenSpec1.6.0 then archived both changes and updated the three canonical specs with validation enabled.
This is an actual local archive, not integration. Protected merge still waits for required CI at the
closure head; published download remains0.3.6. The rejected research was not archived.
