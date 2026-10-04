# #204 — parche experimental probado; ampliación pendiente

**Sigue bloqueado, no instalado.** El parche de un archivo aprobado en `6b3997` pasó 121/123 casos y dos copias son idénticas. Se corrigió el fallo temporal hallado en revisión. Pasaron 29 tests y los 14 límites de producción siguen intactos. El componente completo aún no es apto.

Quedan dos casos de interpretación de directivas/metadata 304 y rutas del caller npm que devuelven caché sin consultar el guard. El [registro de avance](evidence/component-apply-ledger.json) conserva evidencia original, derivados y revisión. No se repiten las instalaciones oficiales fallidas ni se disfraza un exit 0 de auditoría/seguridad verde.

La [segunda ampliación propuesta](boundary-amendment.md) permitiría corregir solo esos límites dentro de `index.js` de http-cache-semantics 4.3.0 y tres archivos de make-fetch-happen 15.0.6. Fuentes/hashes fijos, originales/licencias intactos, pruebas negativas y legítimas, dos construcciones iguales, revisión independiente y auditoría/runtime/reparación completos siguen obligatorios.

**Todavía no aprobaste ni apliqué esa ampliación.** Aprobar esta revisión de proposal/design/spec permite solo Apply experimental de esos cuatro archivos en copias desechables. No cambia tu instalación, gestor, baseline, OpenSpec, locks, catálogo, auditorías ni protecciones. Dos variantes consumieron 2/3 del presupuesto acumulado; no se reinicia.

La vuelta al oficial sigue siendo reversible, en slots/identidades separados y únicamente tras pasar los mismos controles sin nuestro parche. Un oficial vulnerable no es un rollback aceptable. IgnacioBarEsp decide mantenimiento/retirada; no se promete un fork indefinido.

Adopción/publicación requiere otra aprobación y PR protegido/CI verde. #204/#208 y ola 3 siguen abiertos; no se inició ola 4 ni se archivó una fase incompleta.

[Proposal](proposal.md) · [Diseño](design.md) · [Requisitos](specs/companion-npm-composition/spec.md) · [Tareas](tasks.md) · [Ampliación anterior aprobada](patch-amendment.md) · [Aprobación anterior](evidence/patch-amendment-approval.md)
