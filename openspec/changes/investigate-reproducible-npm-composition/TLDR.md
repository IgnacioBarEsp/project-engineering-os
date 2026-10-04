# #204 — ampliación para un parche propio, reversible y acotado

**Propuesta pendiente de aprobación.** Tu «si» autoriza prepararla; no aplicar todavía el parche. La aprobación anterior de fa279d9 conserva su alcance y tu requisito de reversibilidad.

Propongo permitir un único parche revisable en `index.js` de `http-cache-semantics4.3.0`, solo en copias desechables. No parchear npm ni otra dependencia, ni cambiar tu instalación, catálogo, locks, auditorías o protecciones.

El parche tendrá fuente/licencia/autoría, hashes de entrada/parche/salida, diferencias permitidas y pruebas de seguridad y usos legítimos. Dos construcciones deben producir los mismos bytes. Después seguirá pendiente comprobar todo el npm: grafo real, auditor independiente, compatibilidad Node, instalación, reparación y recursos. Un fix de este componente no resuelve todos los avisos ni #208.

El modelo reversible existente pasó14/14 pruebas **sintéticas**. No hay un derivado seguro instalado. La evidencia anterior se conserva; una [nota de interpretación](evidence/cache-interpretation.md) separa los dos casos normativos del caso de cookies, que responde a una política conservadora del componente disputada por upstream.

Cuando aparezca un oficial candidato, se probará **sin nuestro parche**, con los mismos controles, en un slot separado. Solo si pasa podremos volver al oficial. Ni fallo/cancelación ni una versión vulnerable se aceptan como cambio seguro; se conserva el estado y la historia anteriores.

IgnacioBarEsp decide continuidad/retirada del parche. Ese mantenimiento propio se evalúa como costo y deuda, no como compromiso indefinido. Antes del archivo se requiere revisión adversarial independiente y evaluación formal; el trabajo del autor no se presentará como aprobación humana.

**La futura adopción/publicación sigue fuera de esta prueba** y necesitará otro acuerdo con recuperación durable y PR protegido/CI verde. #204/#208 siguen abiertos; no se mezcla #207 ni se inicia ola4.

[Ampliación completa](patch-amendment.md) · [Proposal](proposal.md) · [Diseño](design.md) · [Requisitos](specs/companion-npm-composition/spec.md) · [Tareas](tasks.md)

[Selección recibida](evidence/patch-amendment-selection.md) · [Aprobación anterior](evidence/spec-approval.md) · [Evidencia previa](evidence/apply-preflight.md) · [Validación de esta propuesta](evidence/patch-amendment-validation.json)
