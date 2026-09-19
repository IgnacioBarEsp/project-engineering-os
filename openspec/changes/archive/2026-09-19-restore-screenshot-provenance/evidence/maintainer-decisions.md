# Decisiones del mantenedor

Tomadas por el mantenedor, IgnacioBarEsp. Las de la sesión de aplicación del 19 de septiembre de 2026 se
citan como se respondieron a las preguntas del agente.

| Fecha | Pregunta / contexto | Decisión | Consecuencia |
| --- | --- | --- | --- |
| 2026-09-19 (preparación) | Preparar el change de #143 y detenerse antes del apply para revisarlo | «Preparar y detenerse antes del apply» | La sesión de preparación creó proposal, design, tasks, TLDR, baseline y specs sin tocar código ni documentación pública. Quedó registrado en [tasks.md](../tasks.md) y en el TLDR. |
| 2026-09-19 (preparación) | Entorno de las capturas: renderer en navegador frente a ventana real en Electron | Ventana real en Electron | Decisión 1 del [diseño](../design.md). Se descarta el navegador porque no ve lo que bloquea la CSP de la aplicación. |
| 2026-09-19 (preparación) | Mover los mocks de Stitch a otra carpeta o rotularlos donde están | Rotularlos donde están | Decisión 5 del [diseño](../design.md): `docs/stitch uxui/README.md` los declara prototipo; no se mueve nada y no se rompe ningún enlace. |
| 2026-09-19 (aplicación) | La metadata de #143 declara `surfaces: [documentation, harness-tooling]`; la propuesta declara solo `documentation` porque el change no toca arneses de agentes y `harness-tooling` exigiría `sync-check`, `opsx-check` y `doctor-json-check`, que hoy fallan por #122 y #115 | «Solo documentation» | `readiness.json` declara `surfaces: ["documentation"]`. La desviación frente a la metadata del issue queda aprobada y registrada aquí. No se arreglan #115 ni #122 de pasada. |
| 2026-09-19 (aplicación) | ¿Las siete capturas se generan solo desde el código con `electron .`, o también con la app empaquetada/instalada? | «Desde el código» | Los registros declaran `ran: "electron ."`. No se instala ni se ejecuta la app empaquetada; cierra la pregunta abierta del [diseño](../design.md). |
| 2026-09-19 (aplicación) | La preparación se detuvo antes del apply por decisión del mantenedor. ¿Se autoriza ejecutar el apply completo (implementar, capturas reales, documentación, revisión adversarial, archivar y PR)? | «Sí, apply completo hasta PR» | Se ejecutan las tareas 1 a 5 de [tasks.md](../tasks.md). La revisión adversarial la hace un agente sin el contexto de esta sesión; el merge del PR protegido queda sujeto a la CI requerida y a la decisión final del mantenedor. |

Las revisiones adversariales de este change las hacen agentes, no el mantenedor ni una persona independiente;
así constará en su registro y en el PR.
