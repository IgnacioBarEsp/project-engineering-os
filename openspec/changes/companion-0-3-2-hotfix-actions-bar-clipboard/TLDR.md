# Hotfix Companion 0.3.2 — #142

Primer issue del [handoff #167](https://github.com/IgnacioBarEsp/project-engineering-os/issues/167).
**Estado: preparación de spec; detenido antes de apply por instrucción del usuario.**

La propuesta reubica la barra del asistente fuera de la animación, añade copia de texto validada por IPC,
mantiene activa la navegación hasta la pantalla final y exige evidencia con animaciones y Electron real.
El candidato 0.3.2 se distingue de una release verificada; el núcleo continúa en 0.5.0.

- [Propuesta y límites](proposal.md)
- [Diseño y decisiones](design.md)
- [Contrato de interfaz](specs/companion-experience/spec.md)
- [Contrato IPC y copia nativa](specs/companion-desktop/spec.md)
- [Contrato de distribución](specs/companion-distribution/spec.md)
- [Tareas pendientes](tasks.md)
- [Baseline](brownfield-baseline.md) y [plan de evidencia](evidence/plan.md)
- [Validaciones de preparación](evidence/pre-apply.md)

La aprobación previa del issue para priorizar el hotfix no es aprobación de esta spec. Antes de continuar,
revisar estos artefactos y registrar la decisión. No se implementó, archivó, integró ni publicó el hotfix.
