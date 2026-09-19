# Hotfix Companion 0.3.2 — #142

Primer issue del [handoff #167](https://github.com/IgnacioBarEsp/project-engineering-os/issues/167).
**Estado: implementado y verificado; se archiva y se entrega por PR protegido.** La integración espera a
la CI requerida. La publicación de 0.3.2 viene después del merge, por delegación del mantenedor
([decisiones](evidence/maintainer-decisions.md)).

La corrección saca la barra del asistente de la animación y la deja sticky dentro del flujo. Además, la
copia pasa por el proceso principal con validación y errores visibles, la navegación sigue activa hasta la
pantalla final, una sugerencia o un salto de línea en Visión ya no detienen la instalación (una visión sin
texto conserva el objetivo del primer paso) y el prompt de «Instalación rápida» deja de afirmar dependencias
que nadie instaló. El núcleo continúa en 0.5.0.

- [Propuesta y límites](proposal.md)
- [Diseño y decisiones](design.md)
- [Contrato de interfaz](specs/companion-experience/spec.md)
- [Contrato IPC y copia nativa](specs/companion-desktop/spec.md)
- [Contrato de distribución](specs/companion-distribution/spec.md)
- [Tareas](tasks.md)
- [Baseline](brownfield-baseline.md) y [plan de evidencia](evidence/plan.md)
- [El defecto, antes de corregirlo](evidence/before/README.md)
- [Validación](evidence/validation.md), [revisión adversarial](evidence/adversarial-review.md) y [decisiones del mantenedor](evidence/maintainer-decisions.md)
