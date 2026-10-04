# #204 — probar una composición reproducible de npm

**Spec aprobada para la prueba de viabilidad, con requisito humano de reversibilidad. DoR original: 13/13 PASS, sin excepciones.**

**Avance actual:** el modelo reversible pasó14/14 pruebas sintéticas. El primer componente oficial comprobado (`http-cache-semantics4.3.0`) falló tres regresiones de seguridad, por lo que la candidata se detuvo antes de construir npm. [Resultado y límites](evidence/apply-preflight.md). No hay todavía un derivado seguro ni cambio real instalado en Companion.

Queremos comprobar si podemos dejar de esperar el paquete completo de npm, conservando todos los controles de seguridad. La primera fase hará una prueba en carpetas desechables con fuentes oficiales fijadas y dependencias realmente corregidas.

Comprobaremos que dos construcciones produzcan los mismos archivos, que se audite todo el código incluido y que funcionen las operaciones que Companion necesita. Un resultado verde de auditoría no basta: también revisaremos las correcciones y sus casos negativos.

**No cambiaremos todavía el npm de Companion, tu instalación, el catálogo ni los locks del repositorio.** No reduciremos auditorías o protecciones. Si hacen falta parches propios o falta una corrección comprobable, conservaremos la evidencia y pediremos una nueva decisión.

El resultado puede ser «viable» o «no viable». Incluso si es viable, adoptar y publicar el derivado necesitará una spec posterior con instalación, reparación, identidad y CI protegido. #204 seguirá abierto; el bloqueo separado #208 no se resuelve con esta prueba. No iniciaremos ola4.

El mantenedor aprobó el [acuerdo completo](proposal.md), su [diseño](design.md) y sus [requisitos](specs/companion-npm-composition/spec.md), y pidió poder cambiar reversiblemente entre la distribución oficial y la propia. La [aprobación literal](evidence/spec-approval.md) conserva la revisión aprobada y esa condición.

La prueba incluirá selección por identidad (canal, versión, hash y origen), slots separados y cambio solo después de verificar el destino. Ensayaremos oficial → derivado → oficial, actualizaciones dentro de cada canal y cancelación/fallo conservando la selección anterior. No habrá cambio automático a una versión vulnerable, ni borrado de proyectos/caché/historial. Una futura adopción tendrá que implementar este mismo contrato con evidencia real; aquí no se cambia el runtime del Companion.

[Tareas](tasks.md) · [Baseline](brownfield-baseline.md) · [Decisión recibida](evidence/strategy-selection.md).
