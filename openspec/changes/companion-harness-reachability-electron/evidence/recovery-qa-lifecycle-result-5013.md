# QA5013 aprobada y aplicada: 9/9 enfocados; cualificación bloqueada

La respuesta literal «Sí, apruebo la enmienda 5013e0c» aprueba exactamente
5013e0c44cd8f0bcf54c2e4170269103aafee237. [Registro](recovery-qa-lifecycle-approval-5013.md).
Una variante congelada y una invocación enfocada consumidas, cero restantes.
No se repitieron d812/e978, instalaciones, fullsuite local, TLS, builds o VM.

Preparación5527ms,DoR13/13 sin excepciones,sintaxis3/3. El14nov2026 a11:45:34.803Z
se ejecutaron secuencialmente cuatro escenarios reales y cinco regresiones del
helper:9PASS/0FAIL/0CANCELLED/0SKIP,exit0,172725ms. Cada escenario conserva90s;
la primera reparación tardó87.400s,con margen estrecho. No se garantiza el
rendimiento en otros hosts. Los hashes congelados y otros220archivos de app
permanecieron intactos;solo los tres QA aprobados difieren. El hogar aislado
terminó con AppData y la lectura posterior no encontró procesos propios vivos.

Los escenarios usan manager real y conservan aserciones de journal,generación,
selección,árbol,restart y proyecto/historia. El helper posee handles de hijos,
testigo nonce/PID/punto y cierre antes de limpieza. Los cinco controles propios
no sustituyen VM o humanos. [Índice de hashes y raws managed](recovery-qa-lifecycle-result-5013.json).

## Revisión incompleta y P2 confirmado estáticamente

El único reviewer fresh readonly autorizado,/root/qa5013_candidate_review,
envió un hallazgo parcial y luego terminó por límite de uso del servicio.
No entregó un informe final ni terminó la revisión. No se lanzó otro reviewer.
Su nota parcial y la reconciliación del padre se conservan como artefacto managed,
no como aprobación humana,servicioBugbot o review limpio.

El padre confirmó estáticamente el P2:en
apps/companion/qa/helpers/owned-crash-fixture.mjs:75–84 se accede a child.stderr
antes de registrar close. Node24.18.0 retorna temprano ante EMFILE/ENFILE antes
de asignar streams;su spawn público devuelve el ChildProcess. La completion
rechaza con TypeError,la causa original se guarda después y no se observa close.
waitForExit pierde la causa,cleanup rechaza y retiene el root. La prueba real
ENOENT pasó,pero Node continúa asignando streams en esa otra rama.

Fuentes primarias:
[ChildProcess interno](https://github.com/nodejs/node/blob/v24.18.0/lib/internal/child_process.js#L378),
[spawn público](https://github.com/nodejs/node/blob/v24.18.0/lib/child_process.js#L738).
No se ejecutó agotamiento de recursos o una reproducción adicional. No es
evidencia de vulnerabilidad,pérdida de proyecto,cleanup externo o causa del
timeout histórico. La ausencia de listener error de stderr es también un hecho
de fuente;no se ensayó una segunda ruta nativa de error del stream.

## Deuda y gates

Se evalúa como defecto de QA que debe corregirse antes de cualificar,no como
deuda aceptada o excepción. No se captura assessment clean ni se recaptura206.
Los assessments y fallos históricos permanecen. Una nueva modificación de los
hashes congelados requiere decisión concreta nueva;5013 no se reabre ni resetea.

La CI43585134556SUCCESS pertenece al head documental5013 y no acredita estos
fuentes nuevos. Se exige CI completa vigente y terminar la revisión con P2
resuelto. No reconciliar el gate QA solo por9/9. Builds0/2,VM corregida0/1,
humanos146/147,deuda/archivos218y144→150 y protectedmerge permanecen pendientes.
PR217 sigue draft. Sin release,hostinstall o ola4.
