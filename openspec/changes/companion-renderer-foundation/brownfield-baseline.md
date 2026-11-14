# Baseline brownfield antes de #144

La rama aislada `codex/144-renderer-foundation` partió de `origin/main` en `9751c301976fe27e9bbad33e69f39372b69f901e`, tras el merge de #160. #144 y #150 estaban abiertos sin PR activo que implementara esta fundación. La DoR de ambos issues pasó con 13/13 comprobaciones el 2026-09-24. La dirección del renderer nuevo fue aprobada en la entrevista del 2026-09-18 y el usuario autorizó completar la ola 3.

Antes de aplicar, `app.mjs` concentraba más de mil líneas de navegación, estado y pantallas; `app.css` mezclaba tokens y dos generaciones de reglas; Inicio mantenía controles decorativos y el protocolo enumeraba a mano cuatro archivos. `DESIGN.md` todavía documentaba el sistema verde/crema. La barra final usaba `fixed` dentro de contenido animado y se había observado una regresión de alcance en #142.

La línea base comprobable pasó: 146 pruebas Companion; 20 recorridos del asistente con 140 pantallas y 1100/1100 controles; 45/45 mutaciones del contrato detectadas y 318/318 controles del asistente alcanzables. Se conservan los contratos `data-action`, `data-row-action`, glosario alcanzable, `data-content="person"`, DOM sin `innerHTML`, CSP local y funcionalidad del motor. El cambio no altera proyectos del usuario ni recibos persistidos.

Los detalles de entrada y los límites de la prueba de Electron están en [evidence/apply-entry.md](evidence/apply-entry.md) y [evidence/electron/electron-shell.json](evidence/electron/electron-shell.json).
