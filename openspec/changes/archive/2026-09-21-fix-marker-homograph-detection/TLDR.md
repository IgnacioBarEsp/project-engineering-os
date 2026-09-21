# Detector de marcadores — #162

**Estado:** propuesta preparada y validada; `apply` no iniciado.

El detector actual rechaza castellano ordinario y un nombre de change que incluya la palabra del defecto. La
comparación de #166 probó además que una corrección aparente puede dejar pasar un marcador real: su vía
completa obtuvo 34/34 frases legítimas, pero solo 18/19 marcadores.

Este change exige las dos cosas a la vez: 34/34 frases aceptadas y 19/19 marcadores rechazados. La excepción
para nombres se limita al campo `change`; no se relaja el resto de la metadata.

- [Propuesta](proposal.md)
- [Diseño](design.md)
- [Delta de runtime](specs/runtime/spec.md)
- [Tareas](tasks.md)
- [Baseline](brownfield-baseline.md)
- [Plan de evidencia](evidence/plan.md)
