# #150 — ola 3: builds 2/2 PASS en 20fbe4c; ciclo VM 1/1 FAIL en fase 2 (enmienda de sync pendiente)

## Builds reproducibles (2/2 PASS) y ciclo VM corregido (1/1 FAIL en Fase 2) — 26–27 de noviembre de 2026

- **CI y autorización sobre `20fbe4c`**: CI [45906034881](https://github.com/IgnacioBarEsp/project-engineering-os/actions/runs/45906034881) terminó **`12/12 SUCCESS`**; el mantenedor registró autorización literal («continua donde te quedaste, autorizo», DoR `13/13` en `#150` y `#218`). [Recibo de aprobación](evidence/builds-and-vm-approval-20fbe4c.md).
- **Dos builds reproducibles (`2/2 PASS`, `0` restantes)**: construidos sobre copias limpias de `20fbe4c` (Electron `44.9.1`, `npm 11.21.2`, Node `v24.18.0`, sin `npm install`/descargas). `verify-app-artifact.mjs` pasó `2/2` (`NotSigned`, `tree: clean`, `151` paquetes). **`win-unpacked/` es `100%` byte-idéntico** (`0` diffs en `2,662` archivos / `458,983,230` B, digest `d8ea18bb...`) y `resources/npm-dist.zip` es idéntico (`fef16d4e...`, coincide con `e713`). Los `.exe` NSIS difieren en `5` bytes por timestamps del contenedor (`133,698,243` B `3b6410b4...` vs `133,698,238` B `e05bda0f...`; `+390,821` B respecto a `e713`). [Resultado y hashes](evidence/reproducible-builds-20fbe4c.md).
- **Ciclo VM canónico corregido (`1/1` consumido, `0` restantes, sin reintento — dictamen final `FAIL`)**: Windows Sandbox offline (`4 GiB`, red desactivada, entradas RO, sandbox `7fa7018d-...` detenido limpiamente) sobre Build 1 `20fbe4c`:
  - **Fase 1 (`packaged-runtime.json`): `PASS`** (`0.3.6 -> 0.3.7` `46.07 s`, métricas emparejadas cold/warm/repair con `resourceUsage`, migración legacy intacta y fallback `ee294c53...` rechazado, reparación cancelada y caída real recuperadas, Node `22.22.0`/`24.18.0`/`24.20.0` contra `npm 11.21.2`, desinstalación limpia).
  - **Fase 2 (`canonical-0.1.0-update-native-uninstall`): `FAIL`** (`exit 1`, `288,799 ms`, `stdout: ""`) en `verify-native-journeys.mjs:520:29` (`Timeout 180000ms` esperando `Archivos` sin ningún nodo coincidente en el DOM). Diagnóstico estático probado: `:505` duerme un fijo `1,500 ms` tras `Leer mis archivos` mientras `previewContext` arranca el worker `pdfjs-dist` para `research/articulo.pdf`, omitiendo `Guardar y continuar`, abriendo `#project-tools` aún en `workspace` y aterrizando en `context-review` (sin botón `Archivos`) cuando `notBusy()` termina; además `notBusy()`/`settle()` dependen de `Detener` (retrasado `1,000 ms` y oculto antes de `renderReady`) en vez de `#content[aria-busy="false"]` y `revealDetails(...)` se invoca antes del render destino. [Resultado, trazas y límites](evidence/corrected-vm-cycle-20fbe4c.md).
- **Siguiente decisión concreta (PENDIENTE de aprobación literal)**: [native-journeys-sync-amendment.md](native-journeys-sync-amendment.md) propone ajustar **solo 2 archivos de harness/QA** (`verify-native-journeys.mjs` y `qa/verification-harness-contract.mjs`, **0 archivos de producto**), reutilizar el instalador Build 1 `20fbe4c` ya verificado (`0` builds extra) y autorizar `1` ciclo VM adicional de `verify-release-installation.mjs` + revisión acotada + CI. Sin cambios en `apps/companion/` ni `.project-os/debt/`, sin instalación en host, sin humanos `#146`/`#147` sustituidos, sin archivos oficiales ni ola 4.

## Cualificación local f41af24 completada — 26 de noviembre de 2026

- **Diagnóstico físico `4a88216` (consumido, `DIAGNOSTIC_ONLY`)**: aprobación literal
  registrada, DoR `13/13`, copia física de los `1,944` archivos de `npm 11.21.2` verificada.
  El único caso observado pasó en `64,865 ms` TAP (`64,999 ms` proceso, `54` eventos); causa
  del timeout histórico sigue `UNKNOWN`. CI `45885753453`: `12/12 SUCCESS`.
  [Aprobación](evidence/physical-source-observation-approval-4a88216.md),
  [resultado](evidence/physical-source-observation-result-4a88216.md).
- **Cualificación `f41af24` (aprobada y consumida, `1/1`)**: la revisión
  [remaining-repair-qualification-proposal.md](remaining-repair-qualification-proposal.md)
  recibió aprobación literal («apruebo») y DoR fresca `13/13`. La copia **sin instrumentación**
  (`changed: []`, `40,436 ms`, `1,944` archivos físicos de `npm 11.21.2`) ejecutó una sola vez
  el caso original `interrupted repair restores only the journal-owned unchanged quarantine, and retains project/history bytes`:
  **1 PASS / 0 FAIL / 0 CANCELLED / 0 SKIP** en `69,049.573 ms` TAP (`69,197 ms` proceso,
  `exit 0`, `0` trazas, limpieza del helper completa, `0` procesos restantes).
- **Equivalencia verificada (recibos separados, sin declarar 10/10 en una sola corrida)**:
  `223/223` archivos de `apps/companion`, Node `v24.18.0` (`9a4eb5f1...`), `1,944` archivos de
  `npm 11.21.2` (`6265d0c8...`) y `9/9` entradas de `d812` coinciden byte a byte entre `fa15`,
  `f41af24` y el árbol actual. Se presentan juntos los `9 PASS` de `fa15`, el `1 PASS` de
  `f41af24` y los `2 PASS` de copia/pack de `d812`, conservando todos los fallos históricos
  (`d812`, `e978`, `fa15` + root retenido, `0999922`) y `4a88216` (`DIAGNOSTIC_ONLY`).
  [Aprobación](evidence/remaining-repair-qualification-approval-f41af24.md),
  [resultado y hashes](evidence/remaining-repair-qualification-result-f41af24.md),
  [recibo JSON](evidence/remaining-repair-qualification-result-f41af24.json).
- **CI y gates abiertos**: CI `45902071618` de `f41af24` terminó `12/12 SUCCESS`. Quedan
  pendientes la CI del nuevo head documental de evidencia y la revisión del mantenedor sobre
  esta evidencia antes de autorizar los gates posteriores: builds `0/2`, ciclo VM corregido
  `0/1`, recorridos humanos `#146` y Software A/B `#147`, assessment final de deuda, archivos
  oficiales `#218` y `#144`→`#150` en orden y merge protegido de PR `#217`. Sin cambios de
  producto/QA/locks/CI ni inicio de ola 4.

## Historial anterior — 26 de noviembre de 2026 (propuesta 4a88216)

El siguiente paso real es la [corrección del transporte en la copia](physical-source-observation-amendment.md):
copiar físicamente el MISMO npm11.21.2(1944archivos/12296462bytes),sin enlaces,
con inventarios iguales antes/después,ypedir un único intento adicional.
**Esta nueva revisión no está aprobada ni aplicada.** No cambia runtime,guardas,
instrumentación,assertions o límites;no autoriza una reparación futura.
0999922 sí fue aprobada yconsumida con el fallo de preparación siguiente.
[DoR12/13 por nueva aprobación pendiente;strict29/29 ycontroles documentalesPASS](evidence/physical-source-proposal-checks-20261126.json).

**Actualización posterior a la respuesta:**0999922 recibió «Sí, apruebo la enmienda 0999922»
([recibo literal](evidence/remaining-repair-observation-approval-0999922.md)).
DoR13/13 y única copia/invocación consumidas:0PASS/1FAIL porLINK_REJECTED en
instalación inicial.El agente introdujo una junction para dependencias;la guarda
la rechazó correctamente antes de alcanzar reparación.No retry o cambio de guardas.
[Resultado,causa de setup y límites](evidence/remaining-repair-observation-result-0999922.md).
El timeout original continúaUNKNOWN;no falta aprobación de0999922 ni queda presupuesto.
La descripción de preparación siguiente es el snapshot anterior a esa respuesta.

La CI de077a5f8 está **12/12SUCCESS**, incluida required;se comprobó nuevamente
en GitHub. La revisión original de fuente está completa. El bloqueo sigue
siendo9PASS/1CANCELLED local por90s en una reparación real,sin causa demostrada.

Está preparada una [nueva decisión concreta de observación](remaining-repair-observation-amendment.md),
**todavía sin aprobar ni ejecutar**:una copia temporal,solo el caso fallido,
entrada/salida de sus APIs,90s por caso y120s de proceso,180s de preparación.
No cambia producto/helper/expectativas,ni repite otros nueve controles.
Su resultado será DIAGNOSTIC_ONLY,incluso con PASS;no habilita builds o VM.
Los presupuestos anteriores siguen consumidos. Esta propuesta debe recibir
aprobación de su revisión real antes de instrumentar o ejecutar.
La DoR actual es12PASS/1FAIL por esa intervención humana pendiente;se conserva
abierta y debe pasar sin excepciones tras registrar la decisión,antes de Apply.

[Readback,fuentes y límites de esta preparación](evidence/remaining-repair-proposal-readback-20261126.json).
[Controles nuevos y DoR pendiente](evidence/remaining-repair-proposal-checks-20261126.json):
strict local1.6.0 29/29,docs/neutralidad/deuda read-only/diffPASS;
223archivos de app y97deuda intactos.Archive14PASS/2FAIL,sin mutación.
Las secciones siguientes conservan la historia y sus fechas;los recibos
antiguos no son ejecuciones nuevas ni aprobación de esta propuesta.

[Progreso por fase y tareas cumplidas](evidence/current-wave3-progress-20261114.md).
Hay **7 implementaciones de UI** en la composición de PR217 y **0/7 issues de ola 3 cerrados**.
Npm/Zod, #152 y fase 1 de #206 sí están integrados en main7073033.

Aprobaciones f9ed23c/2667452/c8/e978 y #218 7af/2d2/1cb/d812 resueltas.
C8 dejó 7/7 regresiones, 37/37 mutaciones de servicio retenidas y reconciliación
independiente recibida. El padre de tasks compuestos permanece abierto cuando
queda VM/deuda/integración; sus subpasos terminados ahora se muestran marcados.
No repetir revisiones o aceptaciones humanas ya recibidas.

Electron oficial 44.9.1 pasó el contraste real 9/9 por runtime y nativo 18 capturas/12 copias.
D812 se ejecutó una vez y falló el gate 4/4: 2 PASS/2 CANCELLED a los 90s en recuperación
de la distribución npm. Builds 0/2 y mismo ciclo VM corregido 0/1 no iniciados.
La evidencia local y los fallos originales se conservan; no son una regresión
TLS o pérdida de datos demostrada.

## Diagnóstico e978 aprobado y completado

El [diagnóstico aprobado](bounded-recovery-qa-diagnostic-amendment.md) se ejecutó
una vez: **1 PASS/1 CANCELLED**,178799ms,98eventos. La primera recuperación pasó
87.232s. La segunda agrupaba tres puntos bajo un90s;las dos primeras iteraciones
consumieron64.535s y el cleanup empezó con el último hijo aún activo.
[Hechos,trazas y límites](evidence/recovery-diagnostic-result-e978.md).
No cualifica la candidata,borra D812 o demuestra un fallo de producto.

## Historia5013:9/9 y P2 detectado;continuaciónfa15 abajo

[Corrección del ciclo de vida de QA](recovery-qa-lifecycle-amendment.md)
aprobada literalmente en5013e0c. Una variante/una ejecución consumidas:9/9PASS,
172725ms,0cancel/SKIP y producto intacto. La primera reparación tardó87.400s.
[Resultado y fuentes congeladas](evidence/recovery-qa-lifecycle-result-5013.md).
No repetir estos inputs;la aprobación5013 ya está resuelta.

El único reviewer fresh envió un P2 y se interrumpió por límite del servicio:
su revisión quedó entonces incompleta. El padre confirmó estáticamente que un error
EMFILE/ENFILE puede dejar stderr ausente y el helper accede antes de registrar
close,perdiendo la causa. No se reprodujo por agotamiento de recursos ni se
demostró fallo de producto. EseP2 y ciclo de fuente se resolvieron mediante la
continuaciónfa15 siguiente;no cambian el resultado histórico5013. La cualificación
sigue bloqueada.43585134556SUCCESS acredita solo el head documental5013.

## fa15 aprobada/aplicada:9PASS/1CANCELLED;STOP

[Corrección mínima de spawn/stdio](recovery-qa-spawn-error-amendment.md)
aprobada literalmente enfa15e43 y aplicada solo a helper/unit QA. Una variante
adicional y una invocación consumidas,cero restantes. El test sintético nuevo,
los cinco helper originales y tres interrupciones separadas pasaron. La primera
reparación volvió a agotar90s:9PASS/1CANCELLED,200117ms,exit1. No retry,capraise,
producto o inputs externos cambiados. [Resultado y hashes](evidence/recovery-qa-spawn-result-fa15.md).
Se conserva físicamente su root con journals/selección/proyecto y snapshots
acotados;sin procesos propios restantes. El supervisor exit0 solo recogió el
resultado,el proceso de tests dioexit1. No se cualificó la candidata.

El MISMO reviewer terminó el ciclo de fuente y resolvióP2,
sin otro hallazgo concreto dentro de tresQA;[informe real](evidence/independent-recovery-qa-review-fa15.md).
Ese resultado no borra la cancelación ni acredita producto,VM o humanos.
[DoR13/13,strict29/29 y comprobaciones documentales actuales](evidence/recovery-qa-spawn-error-readiness.json).
Ese recibo corresponde a la preparación de la propuesta original. La evidencia
actual distingue las dosQA modificadas,la invocación fallida y los gates abiertos.

No queda autorización de fa15 para otra variante,invocación o diagnóstico instrumentado.
La propuesta distinta de observación preparada26nov figura arriba;su revisión
real todavía requiere aprobación,no la obtiene automáticamente por este fallo.
[Comprobaciones documentales actuales](evidence/recovery-qa-spawn-publication-checks-fa15.json):
DoR13/13,strict fijo1.6.0 29/29,docs/neutralidad/deuda read-only/diffPASS,
97archivosdeuda y fuentes congeladas intactos. Archive readiness14PASS/2FAIL,
sin mutación:tasks y cualificación pendientes. No esCI ni archivo oficial.

Después de una candidata realmente apta siguen humanos #146/Software A-B #147,
assessment/archivos #218 y #144→#150 en orden, CI requerida del head final y merge protegido.
PR217 permanece OPEN/DRAFT; no release ni ola 4.

DoR fresca: **13 PASS/0 FAIL/0 excepciones**. OpenSpec local fijo 1.6.0 strict
**29/29**, docs, neutralidad, deuda read-only y diffcheck PASS.
[Recibos, hashes y límites](evidence/status-reconciliation-20261114.json).
Estas comprobaciones documentales no son aprobación de la enmienda ni ejecución QA.

[Handoff anterior íntegro](evidence/handoff-167-snapshot-20261114T0920.md).
La [matriz histórica](evidence/coordinated-final-head-matrix.md), fallos,
aprobaciones y reportes independientes conservan sus autores, fuentes y alcances.
