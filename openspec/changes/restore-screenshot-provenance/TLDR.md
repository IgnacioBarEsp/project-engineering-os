# Capturas con procedencia — #143

Segundo issue de la ola 0 del [handoff #167](https://github.com/IgnacioBarEsp/project-engineering-os/issues/167).
**Estado: change preparado; detenido antes del apply por decisión del mantenedor.**

Las siete imágenes que la documentación presenta como Companion son, byte a byte, los mocks de Google Stitch.
Este change las sustituye por capturas de la ventana real en Electron, cada una con un registro de procedencia.
Añade a `check:docs` una comprobación que rechaza imágenes sin procedencia válida o idénticas a un mock. Rotula
los mocks como prototipo y corrige los textos que los presentaban como producto.

- [Propuesta y límites](proposal.md)
- [Diseño y decisiones](design.md)
- [Spec de documentación pública](specs/public-documentation-experience/spec.md)
- [Tareas](tasks.md)
- [Baseline](brownfield-baseline.md) y [plan de evidencia](evidence/plan.md)
- [Validaciones de preparación](evidence/pre-apply.md) y [decisiones del mantenedor](evidence/maintainer-decisions.md)
