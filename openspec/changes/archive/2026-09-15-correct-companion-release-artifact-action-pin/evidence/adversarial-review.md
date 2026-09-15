# Revisión adversarial — pin de artefacto Companion

Autorrevisión posterior a la corrección; no se presenta como revisión humana independiente.

| Riesgo | Resultado |
| --- | --- |
| Cambiar a una referencia flotante para salir del fallo. | Rechazado: se conserva SHA y se verifica contra el tag oficial. |
| Corregir un hash equivocado de Actions. | Refutado por consulta directa al tag oficial v7.0.1 y aserción exacta de QA. |
| El run fallido pudo publicar bytes parcialmente. | Refutado: log muestra fallo durante setup, antes de todos los steps; no existe release 0.2.0. |
| Reintentar con tag desplazado. | Rechazado: `companion-v0.2.0` sigue anotado en `c716f3a`; no se recrea ni mueve. |

**PASS: 0 Blockers y 0 Majors.**
