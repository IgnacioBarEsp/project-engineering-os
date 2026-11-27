# #150 — Propuesta de cualificación de la reparación pendiente

**Estado posterior:** revisión `f41af246138fcfbae8d528f71fa933e99f9c1820` aprobada literalmente
(«apruebo»), DoR `13/13` y único presupuesto consumido (`1/1` preparación en `40,436 ms`,
`1/1` ejecución sin instrumentación con `1 PASS / 0 FAIL / 0 CANCELLED / 0 SKIP` en
`69,049.573 ms` TAP / `69,197 ms` proceso). Equivalencia exacta verificada con los 9 `PASS`
de `fa15` y los 2 `PASS` de `d812` (`223/223` archivos de app, Node `v24.18.0`, `1,944`
archivos de `npm 11.21.2`, `9/9` entradas de `d812`), sin declarar un `10/10` de la misma
corrida. [Aprobación](evidence/remaining-repair-qualification-approval-f41af24.md) y
[resultado con hashes](evidence/remaining-repair-qualification-result-f41af24.md).
CI `45902071618` de `f41af24` terminó `12/12 SUCCESS`; quedan pendientes la CI del nuevo head
documental y la revisión de la evidencia antes de autorizar builds (`0/2`), VM (`0/1`),
recorridos humanos `#146`/`#147`, deuda, archivos oficiales y merge protegido. El texto
siguiente conserva la propuesta presentada originalmente.

Pendiente de aprobación. El diagnóstico aprobado en 4a88216 consumió su único
intento. El caso instrumentado pasó en 64,865 ms (TAP), con los 1.944 archivos
de npm 11.21.2 verificados en una copia física. El registro persistente
artifacts/wave3-current/physical-source-observation/result.json tiene SHA256
f4a836dac72e3c43731316d757624a3e7cbc84c66c077047ab9786e5fc10a7f4.
La CI 45885753453 de 4a88216 terminó en success.

La traza mide 15.94 s de instalación inicial, 8.59 s de inspección tras
el reinicio, 12.01 s de planificación final y 23.79 s de reparación final.
Estas cuatro llamadas sumaron 60.34 s. La prueba terminó dentro de 90 s.
La traza no identifica la causa del timeout histórico.

## Decisión

Autorizar una preparación adicional (hasta 180 s) y una sola ejecución
(proceso hasta 120 s) del caso original de reparación interrumpida en
Windows x64 con Node 24.18.0. Aplicar el filtro exacto del caso de fa15
y conservar los 90 s del caso y los 5 s de limpieza. Usar la fuente QA
original sin instrumentación, la copia física de npm con inventario exacto
y el entorno aislado ya verificados. Congelar hashes, argumentos y entorno
antes de ejecutar. Si cambia cualquier entrada o falla una comprobación,
detenerse con el resultado y sin reintento.

La decisión también autoriza reutilizar los nueve PASS de fa15 únicamente
si coinciden los hashes de código, runtime, dependencias y entradas
pertinentes. Presentar sus recibos junto al resultado independiente del caso
pendiente, sin declarar un 10/10 de la misma corrida. Si falta la equivalencia
o la prueba falla, mantener abierta la cualificación. Requerir además CI
vigente y revisar la evidencia antes de pasar a los gates posteriores.

Los fallos previos y el resultado DIAGNOSTIC_ONLY se conservan. No cambia
producto, QA, protecciones, dependencias ni límites. No se autoriza un arreglo
futuro ni comenzar builds, VM o cierre con la sola aprobación. Registrar la
decisión literal y completar la DoR antes de cualquier ejecución. El owner
es IgnacioBarEsp. Recuperación: conservar resultados y descartar solo la
copia propia conforme a las reglas de ownership existentes.
