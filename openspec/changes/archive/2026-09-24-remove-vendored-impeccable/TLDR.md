# Retirar Impeccable vendorizado — #152

Se retiraron del repositorio la skill de terceros, sus cuatro agentes, el hook activo y el sidecar de diseño; el plugin sigue disponible mediante instalación externa documentada. `check:neutrality` ahora rechaza cualquier hook local y `check:package` compara las notas de terceros con los inventarios de producción del núcleo y Companion.

La suite completa pasó 371/371 pruebas. La cifra original de 60,000 líneas no describe el contenido que existía en `a3b1efd`: los 57 archivos afectados sumaban 19,744 terminaciones de línea. La medición y la corrección de ese criterio quedan registradas antes de cerrar el issue.

- Propuesta: [proposal.md](proposal.md)
- Diseño: [design.md](design.md)
- Especificaciones: [project-hook-policy](specs/project-hook-policy/spec.md), [supply-chain-governance](specs/supply-chain-governance/spec.md)
- Tareas: [tasks.md](tasks.md)
- Baseline: [brownfield-baseline.md](brownfield-baseline.md)
- Validaciones: [evidence/validation.md](evidence/validation.md)
- Revisión adversarial: [evidence/adversarial-review.md](evidence/adversarial-review.md)
- Decisiones: [evidence/maintainer-decisions.md](evidence/maintainer-decisions.md)
- Assessment de deuda: [evidence/debt-input.json](evidence/debt-input.json)
