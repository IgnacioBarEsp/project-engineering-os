# #204 — probar una composición reproducible de npm

**Propuesta pendiente de aprobación. DoR: 13/13 PASS, sin excepciones.**

Queremos comprobar si podemos dejar de esperar el paquete completo de npm, conservando todos los controles de seguridad. La primera fase hará una prueba en carpetas desechables con fuentes oficiales fijadas y dependencias realmente corregidas.

Comprobaremos que dos construcciones produzcan los mismos archivos, que se audite todo el código incluido y que funcionen las operaciones que Companion necesita. Un resultado verde de auditoría no basta: también revisaremos las correcciones y sus casos negativos.

**No cambiaremos todavía el npm de Companion, tu instalación, el catálogo ni los locks del repositorio.** No reduciremos auditorías o protecciones. Si hacen falta parches propios o falta una corrección comprobable, conservaremos la evidencia y pediremos una nueva decisión.

El resultado puede ser «viable» o «no viable». Incluso si es viable, adoptar y publicar el derivado necesitará una spec posterior con instalación, reparación, identidad y CI protegido. #204 seguirá abierto; el bloqueo separado #208 no se resuelve con esta prueba. No iniciaremos ola4.

Tu «si» autorizó preparar esta propuesta; no se registra como aprobación de sus requisitos. Para empezar la prueba hace falta aprobar este [acuerdo completo](proposal.md), su [diseño](design.md) y sus [requisitos](specs/companion-npm-composition/spec.md).

[Tareas](tasks.md) · [Baseline](brownfield-baseline.md) · [Decisión recibida](evidence/strategy-selection.md).
