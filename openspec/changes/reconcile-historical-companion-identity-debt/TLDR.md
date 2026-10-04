# #206 — primera fase propuesta

Hay un registro abierto de una corrección ya implementada. Su saneamiento anterior cerró otro ID con distinto título; no necesitamos rehacer el código.

Propuesta: resolver **solo `debt-bee2fa0c0549`**, usando el comando oficial y un assessment nuevo. Mantener los 50 registros, los otros 36 abiertos, los otros 49 objetos intactos y toda la evidencia histórica. Comprobar hashes, reintentos y casos negativos; conservar el diagnóstico de los 37 para ordenar las siguientes fases.

No cambiaremos la app, npm, las dependencias, la política de deuda ni las protecciones. Tampoco diremos que hemos vuelto a probar la instalación actual: distinguiremos inspección de código y pruebas históricas. El presupuesto permanecerá en 4/5.

Antes del merge, un candidato incorrecto se conservará separado y recuperaremos el baseline verificado. No existe un comando oficial para reabrir un registro; no prometemos ese rollback ni borraremos assessments.

DoR: **13/13 PASS**, sin excepciones. **Spec aprobada; captura oficial realizada en la rama:** 50 registros, 36 abiertos, otros 49 objetos y 73 assessments históricos intactos, presupuesto 4/5. La recaptura fue no-op. Bugbot no encontró bugs en la candidata previa. Captura, archive e integración son etapas separadas; no se afirma merge ni cierre de #206.

#206 seguirá abierto por los 36 restantes. Cualquier merge esperará CI requerido verde; #204 sigue bloqueándolo y no iniciaremos ola 4.

Detalles: [propuesta](proposal.md), [diseño](design.md), [requisitos verificables](specs/debt-control/spec.md), [tareas](tasks.md), [baseline](brownfield-baseline.md).
