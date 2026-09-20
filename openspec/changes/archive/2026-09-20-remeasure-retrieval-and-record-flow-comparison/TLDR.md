# Re-medir la recuperación y comparar los dos flujos — #166

Tercer issue de la ola 0 del [handoff #167](https://github.com/IgnacioBarEsp/project-engineering-os/issues/167).
**Estado: change en apply.** Alcance completo decidido por el mantenedor el 20 de septiembre de 2026.

La evidencia publicada dice que el contexto preparado no devolvió **ninguna** de veinte respuestas sobre
Kubernetes y CPython, y que el barrido literal devolvió las veinte. Eso se midió sobre la versión **0.1.0** el
13 de septiembre; desde entonces se publicaron 0.2.x y 0.3.x y nadie volvió a medir. El mazo del congreso
depende de ese número.

Este change vuelve a medir con la 0.3.2 instalada y el mismo protocolo congelado, publica las dos corridas una
junto a otra, registra una comparación de los dos flujos sobre una tarea declarada de antemano, contrasta el
arnés actual contra el commit que el anterior certificó limpio, y convierte el arranque documentado en una
comprobación que falla si un paso deja de salir con código 0.

- [Propuesta y límites](proposal.md)
- [Diseño y decisiones](design.md)
- [Spec de evaluación](specs/companion-evaluation/spec.md) y
  [spec de verificación de publicación](specs/published-release-verification/spec.md)
- [Tareas](tasks.md)
- [Baseline medida](brownfield-baseline.md) y [plan de evidencia](evidence/plan.md)
- [Decisiones del mantenedor](evidence/maintainer-decisions.md)
