# Snapshot histórico de #167 antes de reconciliar la presentación de progreso

Cuerpo leído de GitHub el14nov2026; updated_at2026-11-14T09:20:34Z. Se conserva íntegro a continuación. Sus estados anteriores no sustituyen la matriz vigente. Snapshot managed github-before.json SHA2560240b4aa4fc4c13240d4ade92aad9dfb1e3159627e7b1161eb95532585f8786c.

---

> **Handoff vigente.** Lee primero «Estado actual» y «Siguiente acción». La auditoría original del 18–20 de septiembre queda conservada al final como historial, no como descripción del producto actual.

## Historia Original

> Ordéname los issues por orden de aplicación, junto con un handoff del contexto para que otro agente o en un nuevo chat pueda empezar a aplicarlos. Le meteré velocidad ya que tengo muchas suscripciones de IA para que los acabe todos antes de las fechas. (18 de septiembre de 2026)

## Enriquecida

### 0. Estado actual verificado

### Estado vigente — d812 aprobada, ejecutada; cualificación bloqueada

El mantenedor aprobó exactamente d812f92 con «Sí, apruebo la enmienda d812f92». **7af/2d2/1cb/d812 están resueltas; no volver a pedirlas.** [Aprobación literal](https://github.com/IgnacioBarEsp/project-engineering-os/blob/03f6a2e1206e0f8694ef07fa8d346bcefe64396b/openspec/changes/refresh-official-electron-certificate-runtime/evidence/local-qa-resource-approval.md).

La única ejecución adicional autorizada terminó el 14nov2026, 09:04:14–09:09:06 UTC, sobre fuente limpia d812 y el mismo aggregate de app90e066…, Node24.18.0/npm11.21.2. Secuencial, límites originales90s/80s/600s, sin cambios de fuentes/tests/dependencias: **4 controles,2PASS,2CANCELLED por timeout90s,0SKIP,exit1. El gate4/4 NO se cumplió.**

- Interrupción de reparación y restauración del quarantine propio: CANCELLED tras91.108s.
- Interrupción real en publicación/selector y recuperación al reiniciar: CANCELLED tras91.845s.
- Copia oficial con exactamente27auxiliares y sellado determinista: PASS.
- Limpieza de copia temporal en preparación real de npm pack: PASS.

[Resultado y límites completos](https://github.com/IgnacioBarEsp/project-engineering-os/blob/03f6a2e1206e0f8694ef07fa8d346bcefe64396b/openspec/changes/refresh-official-electron-certificate-runtime/evidence/local-qa-resource-result.md). Raw result.json SHA7de927cad5e87bf8a899e0982dcb1e6eba6320313d377c9561d078ef41e3d361; stdout.tap SHA661fd4d7066ffe79d3126dd663ab881ebb66b9d6727eda5930813fca45787c68. Se conservan ambos full-suite FAIL anteriores. La secuencia no prueba que la contención sea la única causa ni demuestra pérdida de datos o explotación.

**STOP aplicado: targeted1/1 consumido,0restantes; sin otra ejecución, variante, owner probe, nativo o review bajo este alcance. Builds0/2 y mismaVM0/1 no iniciados.** No elevar caps, editar QA/fuentes o borrar negativos. No hay otra propuesta preparada/aprobada, ni nueva pregunta pendiente. Hace falta una decisión concreta nueva antes de ampliar este protocolo; no inferirla de continuar, heartbeat o CI.

Diez inputs congelados/tresQA/locks intactos, stage limpio y sin procesos propios restantes. Se retuvo el directorio de prueba npm-identity-53PS3B; no se declara limpieza completa. Documentación/OpenSpec fijo1.6.0strict29/29/neutralidad/debt-read-only/diffcheck PASS,97debtfiles intactos; archive readiness10PASS/5FAIL,mutationPerformed:false.

Head documental publicado03f6a2e1206e0f8694ef07fa8d346bcefe64396b, productoeaf2 y main7073033. PR217OPEN/DRAFT; CI nueva43579647419 en curso al consultar, sin resultado final atribuido. CI previa d81243573539658 dio12/12SUCCESS y no borra el fallo local. Sin archive/merge, instalador nuevo, hostinstall, release o cierre de ola3. Humanos146/SoftwareA-B147 siguen pendientes en candidata apta; recibos humanos previos conservan alcance. Vigilancia read-only continúa.

Los checkpoints anteriores se conservan como historia; sus decisiones pendientes y estados de CI corresponden a sus fechas. Manda el estado vigente anterior.


<!-- wave3-qualification-2667452 -->
### Historial conservado — c8 y reparación TLS de #218

**f9ed23c,2667452 y c8cd8d5 están aprobadas y aplicadas. No pedirlas otra vez.**
El mantenedor respondió a c8: «CONTINUA DONDE TE QUEDASTE, apruebo».
Implementación716f9e2c714670bcaa45ee1b64ed352ad831c3a2: solo analyst→freelancer.
[Recibo](https://github.com/IgnacioBarEsp/project-engineering-os/blob/7af8a2a298e1281b1c7230539a7472550ba94d9b/openspec/changes/companion-harness-reachability-electron/evidence/fixture-role-approval.md).

- Regresiones nuevas ejecutadas una vez sobre la entrada corregida:7/7PASS,0FAIL/SKIP/cancelación, Node24.18.0/Windows, copia limpia. El5/7 anterior conserva su raw/causa ROLE_INVALID.
- Runner de servicio:37/37 detectadas por comportamiento, fuentes restauradas; no reejecutado porque el mismo revisor verificó entradas idénticas.
- La única reconciliación incremental por el MISMO agente está realmente recibida: [informe](https://github.com/IgnacioBarEsp/project-engineering-os/blob/7af8a2a298e1281b1c7230539a7472550ba94d9b/openspec/changes/companion-harness-reachability-electron/evidence/independent-incremental-review-716f9e2.md). F1 corregido en fuente/contrato; F2 corregido con ejecución retenida. Sin nuevos P0-P3 accionables en cinco archivos. No certifica instalación, Electron, humanos o futuros diffs.
- [Resultado/hashes/límites](https://github.com/IgnacioBarEsp/project-engineering-os/blob/7af8a2a298e1281b1c7230539a7472550ba94d9b/openspec/changes/companion-harness-reachability-electron/evidence/fixture-role-c8-result.json). Presupuesto2/2variantes,0restantes; regresiones2acumuladas/runner1/incremental1consumidos. VM canónica corregida0/1, todavía sin iniciar.
- DoR pre-Apply13/13,0excepciones. Docs/neutralidad/debt-read-only/fixedOpenSpec1.6.0 strict29/29/diffcheck PASS. Registro50/36 y94assessments de rama intactos, sin captura de cierre. Readiness15014PASS/2FAIL,8tareas; no archive.

PR217 OPEN/DRAFT head documentald812f92ff98db80ebaeb462ada92c327c701944f; Applyeaf2dd21a24261ce28a74623a3fa6bfe6a9e255f tiene CI12/12SUCCESS, nueva CI documental se consulta por su SHA. No archive/mergeUI.



La CI del Applyeaf2dd21a24261ce28a74623a3fa6bfe6a9e255f, run43571554648/attempt1, realmente terminó SUCCESS12/12jobs el14nov07:53:15UTC, incluido required132381693611, seiscorejobs, audit, tresCompanionSO y ElectronWindows. CompanionWindows261tests/260PASS/1SKIP; macOS/Ubuntu261/256PASS/5SKIP;0FAIL/0cancel en los tres. Browser completo y47mutaciones finalizaron. Electron18/12 conserva aggregate90e066…igualfreeze2. Resultado persistente bootstrap-v2/ci-eaf2dd2/final-result.json SHAe1bd238a122029499c030593fe7040caa1cbac77b42e93dc821d2f031cb9fb44. Ese verde no borra FAIL local ni acredita CI del head documentald812f92ff98db80ebaeb462ada92c327c701944f.

DoR de esta nueva propuesta13/13,0excepciones; OpenSpec local fijo1.6.0strict29/29/docs/neutralidad/deuda-read-only/diffcheck PASS;97debtfiles/10inputs congelados intactos. Readiness10PASS/5FAIL,mutationPerformed:false, sin archive ni assessmentfinal. Checks MCP bootstrap-v2/local-qa-proposal-checks.json SHAa0ba8fa5637030243a0aaefcf8f636c8e246b5981e52b72325ac4b2c26704cd8. Source d812 difiere de eaf2 únicamente en nueve documentos de este expediente; helper6695 y aggregate permanecen exactos. PR217OPEN/DRAFT,ola3abierta/ola4noiniciada.

**Cualificación detenida tras owning QA local — 14nov2026 UTC.** La aprobación1cb sigue resuelta y el arreglo/TLS9/9por runtime, nativo18/12 y review incremental permanecen válidos para su alcance. No se repiten ni se revierten por este fallo distinto.

La suite local inicial terminó261tests:241PASS/16FAIL/3cancel/1SKIP; se conservan rutas MAX_PATH/ENOENT y límites. Se corrigió únicamente la preparación temporal elegida por el padre (pathGit263→199caracteres) y se vinculó el mismo stage/deps a fuente limpiaeaf2; no fuentes/tests/assertions/límites/dependencias nuevos ni reset. La única repetición acotada terminó261tests:256PASS/1FAIL/3cancel/1SKIP,exit1,431380ms. Desaparecieron los errores de rutas largas; permanecieron tres timeouts90s en qa/distribution-identity.mjs:75,89 y qa/npm-development-source.mjs:29, más un fixture pack-preparation con SIGKILL frente a null esperado. No se considera PASS ni se atribuyen todos los fallos a setup.

Raw persistente artifacts/wave3-current/electron218/bootstrap-v2/qualification-app-short-home.json SHAfb72b62f21b95f7c203109fa761aac49f9c10af7dcf537acd0259ecbf920f0db; qualification-stop.json SHAf6274e72d3661369650a5b39ccd05190a4ebe92468487f64621a4b936c414944. Sin procesos restantes ni cambios de fuente tras medir. **Outcome actual blocked**: no más localQA/contrastes/variantes/build/VM hasta resolver explícitamente este gate; no elevar caps ni borrar negativos. Builds0/2 y mismaVM0/1 intactos. Cualquier revisión del protocolo o ampliación debe ser concreta, presentada y realmente aprobada; todavía no hay una nueva propuesta aplicada ni aprobación futura inferida. La CI actual tiene su alcance separado y su estado real se consulta; no elimina silenciosamente este FAIL local.

Auditorías nuevas bajo política original: root0high/critical+1moderate; root-runtime0; blueprint0; Companion-runtime0high/critical+32moderate; grafo Companion completo2high+38moderate/exit1, conservado. Locks inmutables, cero excepciones o fixes ajenos. No seguridad global, archive, integración o cierre humano inferido. PR217 permanece DRAFT; ola3 abierta, ola4 sin iniciar.

**#218 — aprobación1cb recibida y reparación aplicada (14nov2026 UTC).** El mantenedor respondió «Sí, apruebo la enmienda 1cbfe2a». [Registro literal](https://github.com/IgnacioBarEsp/project-engineering-os/blob/eaf2dd21a24261ce28a74623a3fa6bfe6a9e255f/openspec/changes/refresh-official-electron-certificate-runtime/evidence/bootstrap-amendment-approval.md). Las aprobaciones7af/2d2/1cb están resueltas; no volver a pedirlas ni mantener esos gates pendientes.

La variante2 aplicó exactamente el diff de un archivo: postimage6695b1dcc2f4d6b2079b2c0d4b37614ed8a0e90884e2ff92a045131fc2486089. Otros9inputs congelados intactos. Freeze14nov07:20:57Z,recipe0b979f38812f7c25afd683169e98b46bd1e8a41902648ffb335a78a13cf1fd95. Sin otra descarga/instalación/generación, cambios TLS/política/límites o aplicación en el host.

El contraste real14nov07:23:00–07:23:34UTC pasó9/9baseline y9/9candidata. Electron44.1.1 devolvió CERT_SIGNATURE_FAILURE en los tres testigos blocked-chain;44.9.1 devolvió CERT_REVOKED en TLS/HTTPS/fetch. Ambos aceptaron los3controles trusted y rechazaron las3hojas no confiables con UNABLE_TO_VERIFY_LEAF_SIGNATURE. Máximo26ms por caso y heap216MiB dentro de límites20s/120s/256MiB. El verificador nativo completo dio18capturas/12copias coincidentes,completed:true,failures:[],exit0. [Resultados y raws](https://github.com/IgnacioBarEsp/project-engineering-os/blob/eaf2dd21a24261ce28a74623a3fa6bfe6a9e255f/openspec/changes/refresh-official-electron-certificate-runtime/evidence/bootstrap-variant2-result.md). No son prueba de explotación o de networking Chromium.

El MISMO reviewer completó su única reconciliación incremental: F1 resuelto, sin nuevos hallazgos concretos dentro de ese cambio. [Informe íntegro](https://github.com/IgnacioBarEsp/project-engineering-os/blob/eaf2dd21a24261ce28a74623a3fa6bfe6a9e255f/openspec/changes/refresh-official-electron-certificate-runtime/evidence/independent-incremental-review-variant2.md),SHA45dace94c7373a43504abbfae01f73a683408aa854948bb92b1793acc23a6868. Conserva dirty:true/commit1ba y huella90e066…del stage realmente ejecutado, avisos MAX_PATH/GPU y alcance. No certifica un build limpio, instalador, aceptación humana o seguridad global.

Fuente publicadaeaf2dd21a24261ce28a74623a3fa6bfe6a9e255f; CI nueva [43571554648](https://github.com/IgnacioBarEsp/project-engineering-os/actions/runs/43571554648) en curso al consultar, sin resultado final atribuido. CI anterior43489079282/1cb falló Electron120s y required; se conserva con su SHA. No rerun manual. PR217OPEN/DRAFT. La primera variante/timeout y ambos informes originales siguen intactos.

Presupuesto218 acumulado: variantes2/2,baselineowner2/2,candidateowner1/1,investigaciónfresh1/1,reviewfresh1/1 e incremental1/1 consumidos; no tercer variante/intento/review o reset. Builds0/2 y misma VMcorregida0/1 siguen pendientes, junto a owning checks/auditorías/recuperación/licencias/deuda/archive/CIactual y humanos146/147 en candidata apta. La reparación enfocada pasó; #218 y ola3 todavía no están cerrados. No ola4/tag/release/hostinstall.

Se conserva el installer e713/SHA63754b6a9311ef45ecabe2968265cbb7bbb4a6ca58a3beb8a599934b89bec499 y el FAIL canónico original. No promoverlo como candidata final apta. Humanos146 y SoftwareA/B147 quedan pendientes en candidata apta; no se repiten recibos humanos anteriores ni se simulan con CI/review/VM. Ola3 0/7cerrados; sin mergeUI/release/ola4.


#204/#214/#152 y fase1#206 siguen integrados en main7073033724a20ee60bb76bc1791a7c3ae7cfca34;206OPEN36restantes. No recapturar/rearchivar/cerrar el paraguas. PR196→202 intactos;218security/ownerIgnacioBarEsp/Project3Inreview, tres aprobaciones7af/2d2/1cb resueltas y variante2 aplicada con contraste/nativo PASS; demás gates pendientes. Los checkpoints anteriores siguientes son historia y no sustituyen este estado.

<!-- peos-wave3-final-head-proposal-20261113 -->
### Checkpoint vigente — 13 de noviembre de 2026

Main verificado `7073033724a20ee60bb76bc1791a7c3ae7cfca34`. **#204/#214, #152 y fase 1 de #206 realmente integrados** por PR #216/#192/#207, cada uno con CI requerida verde y protección normal. #204/#214/#152 están CLOSED/COMPLETED; #206 permanece OPEN/Backlog con 36 registros abiertos. Ola 1: 5/5; ola 3: 0/7 cerrados. Deuda actual: 50 IDs / 36 abiertos / 77 assessments; sin recaptura ni cierre del paraguas.

La [enmienda de coordinación f9ed23c](https://github.com/IgnacioBarEsp/project-engineering-os/blob/f9ed23cf599178bbc02b3e1083c7cf102b5027a5/openspec/changes/companion-harness-reachability-electron/coordinated-final-head-amendment.md) fue aprobada bajo #150; su respuesta literal y Apply documental están registrados. Propone cualificar una fuente final y conservar el orden y los archivos de las siete fases antes de un PR conjunto protegido. No aplica ese protocolo por una autorización anterior ni aprueba layouts históricos, resultados futuros o recorridos humanos.

Composición local `332a261`, documento `f9ed23c`, rama `codex/wave3-current-source-verification`. Source/owner comparisons y strict 28/28 PASS; producto sin cambios nuevos. La cualificación sigue **NO apta**: núcleo agotó 360 s; Companion simultáneo 247/254 con 2 FAIL, 4 cancelados y 1 SKIP; un ensayo en serie agotó 600 s y mantuvo crash/restart fallido. Sin CI actual ni instalador nuevo de UI calificado. No repetir suites iguales por rutina, elevar límites, atribuir una causa no demostrada o usar el instalador npm con la UI antigua para #146/#147.

**Checkpoint anterior del protocolo:** f9ed23c ya fue aprobado; la decisión pendiente actual es2667452, descrita arriba. Conservar aceptaciones humanas literales ya recibidas y no repetir lectores. Recorridos reales #146 y Software A/B #147 siguen pendientes sobre candidata apta. No archive/merge UI ni ola 4. Los checkpoints fechados siguientes conservan historia y no sustituyen este estado.

<!-- peos204-integrated-20261112 -->
### Integrado y cerrado de verdad — 12nov2026 22:06UTC

[PR#216](https://github.com/IgnacioBarEsp/project-engineering-os/pull/216) **MERGED** mediante protección normal, headbb28cb6 y merge/main **ba31e06f157eb64150a54e2488257d8de7e06e1c**. [CI43315582343](https://github.com/IgnacioBarEsp/project-engineering-os/actions/runs/43315582343) completaSUCCESS en3SO y required, sin bypass. El árbol de main coincide exactamente con el head revisado. Archivos oficiales1.6.0, review/deuda/installer/recovery y auditorías ya completados; [evidencia archivada](https://github.com/IgnacioBarEsp/project-engineering-os/blob/ba31e06f157eb64150a54e2488257d8de7e06e1c/openspec/changes/archive/2026-11-12-adopt-reviewed-official-npm-distribution/evidence/final-product-verification.md).

#204 adopta npm oficial11.21.2 intacto, identidad/slots/selector y copia Windows0/27 aprobada; #214 conserva zod4.6.6 exacto aprobado. **Ambos issues CLOSED/COMPLETED por integración**, no por un commit o archive aislado. GitHub reconoció automáticamente#215 comoMERGED al entrar su head3335cc7 como ancestro de#216; no se ejecutó otro merge ni se borró su historia.

Auditorías0high/critical; quedan1moderate raíz y32app bajo política original, sin excepción. Instalador candidato0.3.7 real verificado/VM PASS y VM detenida;0hallazgos/14aspectos nativos no verificados, sin sustituir humanos. Sin publicación/tag/download0.3.7: la descarga sigue0.3.6. La receta4 queda rechazada4/4, y deuda50objetos/37abiertos/75assessments conserva historia.

#152 se integró después por #192/main cde47a5; la fase 1 de #206 también se integró por #207/main 7073033, sin recaptura. La pila #196→#202 sigue separada y pendiente. Las lecturas/aceptaciones anteriores mantienen alcance; recorridos reales#146/#147 y juicio visual siguen humanos. **Ola3 no cerrada; ola4 no iniciada.**


<details><summary>Checkpoint anterior preservado; su gate f3b4ff2 ya fue resuelto</summary>

<!-- peos204-current-apply-20261112 -->
**Actualización de adopción204 (12nov):** aprobación8d335a2 ya recibida y registrada, **no volver a pedirla**. Código f4db025 en [PR216](https://github.com/IgnacioBarEsp/project-engineering-os/pull/216), draft y sin merge. CI43250487942: matriz núcleo6/6PASS, auditoríaPASS y CompanionmacOS/LinuxPASS; CompanionWindowsFAIL/requiredFAIL por27auxiliares `.bin` generados durante instalaciónCI. Ningún archivo oficial cambió. [Enmienda nueva f3b4ff2](https://github.com/IgnacioBarEsp/project-engineering-os/blob/f3b4ff25cf21ae1690c28f07bf378d2afb8678f7/openspec/changes/adopt-reviewed-official-npm-distribution/windows-development-source-amendment.md) concreta y todavía sin aprobación/Apply, para tratar únicamente esos auxiliares con copia canónica verificada, sin relajar hash/CI/política. Prototipo positivo/negativos retenidos; originales intactos. Próxima decisión es **solo esta enmienda**, no la vieja autorización de214/8d335a2. Mantener216/215draft, fuente214intacta y orden de pila; ola3 sigue7implementaciones/0issuescerrados. No ola4. Los estados anteriores debajo conservan fecha e historia y no sustituyen este checkpoint.



</details>

Actualizado el **12 de noviembre de 2026 (UTC)** tras integrar #204/#214 mediante PR#216, main actual `7073033724a20ee60bb76bc1791a7c3ae7cfca34`, después de#192y#207. CI43315582343 requeridoSUCCESS del headbb28cb6 y árbol de main idéntico; archivos/revisiones/deuda/instalador comprobados. Release pública sigue0.3.6 y ola3 sigue abierta.

- **Ola 0: 4/4 cerrados. Ola 1: 5/5 cerrados. Ola 2: 4/4 cerrados. Ola 3: 7 implementaciones en PR, 0/7 issues cerrados.**
- No marcar un issue «hecho» por tener código o pruebas en una rama: ✅ / checkbox marcado significa **integrado y CLOSED/COMPLETED**. «Implementado / draft» no es merge, archive ni release.
- El mantenedor pidió **terminar ola 3 y detenerse antes de ola 4**. #152 ya quedó cerrado por integración; no iniciar trabajos de las olas 4–6.
- Releases actuales comprobadas: núcleo **1.0.0** ([v1.0.0](https://github.com/IgnacioBarEsp/project-engineering-os/releases/tag/v1.0.0)) y Companion **0.3.6** ([companion-v0.3.6](https://github.com/IgnacioBarEsp/project-engineering-os/releases/tag/companion-v0.3.6)). La reconstrucción 0.4 de ola 3 **no está publicada**.
- Main actual integra zod4.6.6 y npm oficial11.21.2 tras seis jobs de núcleo/fixtures, auditoría y tres jobs Companion verdes. Los389/389 y doctor anteriores conservan su fecha; el baseline de doctor clasifica WARN/SKIP/FAIL conocidos, no cero FAIL universales.
- **#204 y #214 CLOSED/COMPLETED, tarjetasDone:** adopción oficial/selección y zod integrados mediante#216. 0high/critical en auditorías originales,1moderate raíz y32app conservados. Instalador candidato0.3.7 verificado/VM PASS, sin release/tag nuevo; receta4rechazada4/4sin cambio. GitHub marcó automáticamente#215MERGED porque entró como ancestro, sin segundo merge.
- Se conserva el archivado histórico de81tarjetas y la tarjeta recuperable#208cerradaNOT_PLANNED por aviso retirado, sin borrar historias. Hay **22issues abiertos** tras cerrar204/214/152. #205 Backlog y el resto de #206 OPEN/Backlog se conservan; su fase 1 está integrada por #207; main50objetos/36open/77assessments. Archivo de tablero y OpenSpec son operaciones distintas.
<!-- peos-debt206-progress-20261003 -->
<details><summary>Checkpoint histórico de #206 del 4 de octubre; fase 1 ya integrada el 12 de noviembre</summary>

- **Avance de #206 sin duplicar trabajo (2026-10-04 UTC):** primera fase aprobada, capturada y archivada oficialmente; [PR #207](https://github.com/IgnacioBarEsp/project-engineering-os/pull/207) draft, head `9feea6597d4fc43ab1f4dfb6a45f5bf4c797ac92`. DoR 13/13, readiness archive 16/16, core 393/393, deuda 62/62 y strict 20/20 PASS; Bugbot independiente 0 hallazgos en a6127ce previo a captura, revisión posterior del implementador separada. Solo `debt-bee2fa0c0549` reconciliado: **50 items / 36 abiertos en la rama**, otros 49 objetos y 73 assessments históricos intactos, recaptura no-op, 12 detecciones negativas, presupuesto 4/5 y tres flujos. **Main mantiene 37 abiertos; sin merge ni cierre.** [CI 37171002125](https://github.com/IgnacioBarEsp/project-engineering-os/actions/runs/37171002125): seis jobs core PASS, auditoría raíz/blueprint FAIL por #208 (braces), tres auditorías Companion FAIL por #204, required FAIL. #206 OPEN / Blocked, no Done/archivado del tablero; no inicia ola 4.

</details>

### 1. Siguiente acción y condiciones de cierre

1. **#152/#192 MERGED/CLOSED/COMPLETED.** CI43317586627/head00b19b4SUCCESS en3SO/required, maincde47a5.25/25controles y21/21specs locales,403tests núcleoCI. Fuente previamente revisada conservada; no nueva revisión humana o archive/captura repetidos. Ola1cerrada5/5.
2. **#204 y#214 ya integrados/cerrados** por#216/mainba31e06. Aprobaciones8d335a2/f3b4ff2/013ac784 resueltas, no preguntar/reaplicar. Ambosarchivosoficiales y assessment75+historia conservados. #215autorreconocidoMERGED por ancestro; no cerrar como si nunca hubiera integrado. No tag/release/download0.3.7 automático.
3. **#206fase1integrada, paraguasOPEN/Backlog:** #207MERGED/main7073033, CI43319307144/headcd1f90cSUCCESS. Main50IDs/36open/77assessments;49otrosobjetos y76previos intactos, sin recaptura/rearchive. No cerrar206ni resolverrestantesporinferencia. #208NOT_PLANNEDconservado.
4. **#218 bloqueado tras d812 aprobada y ejecutada una vez:2PASS/2CANCELLED;4/4no satisfecho.** Sin otra QA/variante/build/VM bajo alcance agotado. No hay otra propuesta o pregunta pendiente. Conservar resultados y vigilancia read-only; una ampliación exige propuesta concreta y aprobación real. Humanos146/147 y cierres continúan pendientes.
5. Con#152 realmenteintegrado, conservar pila **#196→#197→#198→#199→#200→#201→#202**; el orden del producto es144→145→146→147→148→149, y150acompaña y cierra la pila. Revalidar cada capa/head/base sin tratar todos los commits intermedios como ya aprobados. Conservar aceptaciones humanas siguientes y no simular recorridos146/SoftwareA-B147.
6. Tras cerrar de verdad los sieteissues y programa#141, **detenerse antes deola4**, avisar y pausar seguimiento. Este handoff permanece abierto por olasposteriores.

No reabrir ni reimplementar cierres históricos por una limitación que ya tiene seguimiento. #205/#206 registran deuda distinta del alcance ya entregado y no amplían esta sesión a ola 4.

### 2. Aceptación humana y evidencia de ola 3: no duplicar

Head de la pila de trabajo #202: `658e505031b195ed2d088447eec5c5d841c7c319`; no está en main. Expedientes en [la rama de #150](https://github.com/IgnacioBarEsp/project-engineering-os/tree/codex/150-harness-electron/openspec/changes).

**Ya recibida, con su alcance literal:**

- Dos personas nuevas confirmadas vieron Inicio y después paso 1 sin explicación previa; palabras literales y resultados adversos de rondas anteriores conservados.
- Una persona ajena explicó el control renombrado «Revisar texto de mis archivos para mi IA». No se necesitan otros dos lectores ni repetir esa pregunta por la reorganización exclusiva de Tus proyectos.
- El mantenedor aprobó Inicio y la preparación principal de #148; Archivos tiene aceptación condicionada a la reorganización acordada, implementada y comprobada. Quitar de la lista **no borra ni desconfigura** la carpeta; duplicar reutiliza respuestas en otra carpeta.
- El 1 de octubre aprobó nombres/descripciones de los seis tipos en el primer paso integrado.
- Aprobó distribución del FAQ cerrado y, posteriormente, **texto y presentación del FAQ expandido y de Privacidad**. No solicitar de nuevo estas aprobaciones; no atribuirlas a tamaños, ramas antiguas o recorridos no vistos.

**Todavía separados del cierre:** recorrido real del mantenedor correspondiente a #146; Software A/B de #147 con prompt en su propia IA y resultados reales, usando una build identificada y apta después de #204; revalidación de aceptación por capa/head/base final cuando corresponda. Una captura o una suite de agente no es una sesión humana de instalación.

La revisión independiente de cierre es **compuesta**: recibos de ejecución de un revisor en 5706 más inspección posterior de otro en 429c644 y comparación de bytes. Sin nuevos P0–P3 en ese alcance, pero no se atribuyen las primeras ejecuciones al segundo revisor ni se certifica automáticamente cada head intermedio. Readiness/archive siguen separados. Ver `evidence/wave3-closeout-20260930.md`, las decisiones del 2026-10-01 y `docs/companion/reviews/` en la rama.

CI de #202 en la ejecución 36820222842: matriz raíz, Electron y comportamiento pasaron; auditorías Companion y CI required fallaron por #204. Es CI de su SHA de entonces, no una corrida de un commit documental posterior.

### 3. Orden original actualizado

Los 28 issues de trabajo originales mantienen su orden. Las referencias de PR son respaldo de entrega histórica, no una certificación nueva de todos los instaladores/proveedores.

#### Ola 0 — Congreso: cerrada

- [x] #142 — Hotfix de barra de acciones y portapapeles. Integrado y CLOSED/COMPLETED; respaldo [#169](https://github.com/IgnacioBarEsp/project-engineering-os/pull/169), [#170](https://github.com/IgnacioBarEsp/project-engineering-os/pull/170).
- [x] #143 — Capturas reales con procedencia. Integrado y CLOSED/COMPLETED; respaldo [#171](https://github.com/IgnacioBarEsp/project-engineering-os/pull/171).
- [x] #166 — Re-medición y comparación de flujos. Integrado y CLOSED/COMPLETED; respaldo [#172](https://github.com/IgnacioBarEsp/project-engineering-os/pull/172).
- [x] #165 — Mazo y comprobaciones de la presentación. Integrado y CLOSED/COMPLETED; respaldo [#191](https://github.com/IgnacioBarEsp/project-engineering-os/pull/191).

#### Ola 1 — Fricción y riesgo: queda #152

- [x] #162 — Detector de marcadores. Integrado y CLOSED/COMPLETED; respaldo [#176](https://github.com/IgnacioBarEsp/project-engineering-os/pull/176).
- [x] #168 — Experiencia del instalador, accesos directos, apertura e idioma. Integrado y CLOSED/COMPLETED; respaldo [#184](https://github.com/IgnacioBarEsp/project-engineering-os/pull/184).
- [x] #155 — Runtime Node soportado y publicación trazable. Integrado y CLOSED/COMPLETED; respaldo [#185](https://github.com/IgnacioBarEsp/project-engineering-os/pull/185), [#186](https://github.com/IgnacioBarEsp/project-engineering-os/pull/186), [#187](https://github.com/IgnacioBarEsp/project-engineering-os/pull/187), [#188](https://github.com/IgnacioBarEsp/project-engineering-os/pull/188).
- [x] #152 — Retirar vendoring de Impeccable y verificar hooks/notices. #192integrado/maincde47a5, issueCLOSED/COMPLETED; CI43317586627requiredSUCCESS.
- [x] #156 — Retirar payload documental del paquete npm. Integrado y CLOSED/COMPLETED; respaldo [#189](https://github.com/IgnacioBarEsp/project-engineering-os/pull/189).

La previsión antigua de publicar #168 como 0.3.3 quedó superada por las correcciones y releases posteriores: la release vigente del Companion es 0.3.6. Los intentos y fallos del instalador permanecen en la evidencia; no reetiquetarlos como PASS.

#### Ola 2 — Diagnóstico del núcleo: cerrada

- [x] #122 — Deriva de selección de perfiles. Integrado y CLOSED/COMPLETED; respaldo [#193](https://github.com/IgnacioBarEsp/project-engineering-os/pull/193).
- [x] #115 — Doctor/readiness con evidencia de perfiles técnicos. Integrado y CLOSED/COMPLETED; respaldo [#194](https://github.com/IgnacioBarEsp/project-engineering-os/pull/194).
- [x] #154 — Distinguir deriva del repositorio de procedencia del CLI. Integrado y CLOSED/COMPLETED; respaldo [#190](https://github.com/IgnacioBarEsp/project-engineering-os/pull/190).
- [x] #160 — Baseline del doctor y ciclo de vida de recibos. Integrado y CLOSED/COMPLETED; respaldo [#195](https://github.com/IgnacioBarEsp/project-engineering-os/pull/195).

#### Ola 3 — Reconstrucción del Companion: en cierre, bloqueada

- [ ] #144 — Fundación del renderer 0.4. Implementado en [#196](https://github.com/IgnacioBarEsp/project-engineering-os/pull/196), **draft / no integrado**, head `6784baf`; falta cierre protegido y gates aplicables.
- [ ] #150 — Harness de alcanzabilidad y Electron; acompaña desde #144. Implementado en [#202](https://github.com/IgnacioBarEsp/project-engineering-os/pull/202), **draft / no integrado**, head `658e505`; falta cierre protegido y gates aplicables.
- [ ] #145 — Taxonomía de seis perfiles. Implementado en [#197](https://github.com/IgnacioBarEsp/project-engineering-os/pull/197), **draft / no integrado**, head `35ad9b2`; falta cierre protegido y gates aplicables.
- [ ] #146 — Un solo flujo de cuatro pasos y borrador durable. Implementado en [#198](https://github.com/IgnacioBarEsp/project-engineering-os/pull/198), **draft / no integrado**, head `4ffca45`; falta cierre protegido y gates aplicables.
- [ ] #147 — Preparación real de paso 4 y resultado de activación. Implementado en [#199](https://github.com/IgnacioBarEsp/project-engineering-os/pull/199), **draft / no integrado**, head `bb99791`; falta cierre protegido y gates aplicables.
- [ ] #148 — Tus proyectos y preparación con gestión prioritaria. Implementado en [#200](https://github.com/IgnacioBarEsp/project-engineering-os/pull/200), **draft / no integrado**, head `d8e1713`; falta cierre protegido y gates aplicables.
- [ ] #149 — Movimiento, carga y microcopia. Implementado en [#201](https://github.com/IgnacioBarEsp/project-engineering-os/pull/201), **draft / no integrado**, head `d89830e`; falta cierre protegido y gates aplicables.

Los PR anteriores tienen fallos actuales de CI Companion; no convertir resultados locales/históricos en CI requerida verde. Los gates no se dispensan por una autorización general.

#### Ola 4 — Superficie para agentes: NO INICIAR en esta sesión

- [ ] #157 — Manifiesto de comandos legible por máquina.
- [ ] #159 — Catálogo de agentes en datos y vocabulario de capacidades.
- [ ] #158 — Frescura de decisiones fijadas; acuerdo de alcance antes del cambio.

#### Ola 5 — Decisiones registradas: pendiente, fuera de alcance actual

- [ ] #163 — Motor SDD: OpenSpec, Spec Kit y alternativas.
- [ ] #164 — Ingeniería agéntica y sustrato de verificación.
- [ ] #161 — Forma del proyecto, síntesis continua y golden paths.

#### Ola 6 — Cierre: pendiente, fuera de alcance actual

- [ ] #151 — Shell integrado; propuesta opcional, no activar por inferencia.
- [ ] #118 — Consolidar la landing; solo retirar archivos con reemplazo comprobado en su repositorio consumidor. Las capturas de ola 0, por sí solas, no prueban ese reemplazo.

### 4. Coordinación y seguimientos añadidos

No duplican las 28 tareas originales ni autorizan comenzar otra ola:

| Issue | Estado y función |
| --- | --- |
| #141 | OPEN: programa Companion 0.4; cerrar solo con sus entregas/gates completos |
| #153 | OPEN: programa de auditoría del core y futuras capacidades |
| #167 | OPEN: este handoff; debe mantenerse actualizado, no cerrar porque termine una sola ola |
| #204 | CLOSED/COMPLETED por PR#216/mainba31e06; oficial11.21.2 integrado, no release nueva |
| #173 | OPEN: medición controlada de resultado con prompt/entorno/mapa; no afirmar mejoras universales |
| #174 | OPEN: firma de editor del instalador; hash no es firma |
| #205 | OPEN / Backlog: reproducir y mejorar cobertura a escala preservando límites |
| #206 | OPEN/Backlog: fase1integrada por#207/main7073033,50IDs/36open; resto requiere nuevas fases aprobadas |
| #208 | OPEN / Blocked: auditoría root/blueprint por braces 3.0.3, distinta de npm bundled; seguimiento sin implementación ni nueva spec aprobada |

#205 recoge el resultado histórico **0/20 preparado frente a 20/20 literal** de #105/#166. Medirlo no lo corrigió; debe reproducirse en el código actual antes de cambiar selección/paginación. #206 distingue defectos vigentes, limitaciones deliberadas, evidencia posterior y comprobaciones humanas pendientes; no resuelve filas porque el issue origen esté cerrado. Deuda actual de main: 50registros,36open,77assessments, plan4/5 y tresflujos. Solo debt-bee2fa0c0549 cambia por la captura206aprobada e integrada.

### 5. Contexto operativo vigente

- Núcleo neutral en `src/`, `blueprint/`, `schema/`, `bin/`; Companion en `apps/companion` con ciclo de app/release independiente. No añadir frameworks, proveedores, secretos, telemetría ni servicios pagados al core universal.
- Instrucciones: `AGENTS.md` → `CONTRIBUTING.md` → `docs/architecture/OWNERSHIP.md`; después PRODUCT, SELF_APPLICATION y UPSTREAM_OPERATIONS. Node soportado por el núcleo: `^22.22.0 || ^24.18.0`.
- Issue enriquecido → DoR → **CLI OpenSpec local fijado 1.6.0 y spec aprobada** → implementación/evidencia → revisión adversarial y deuda → archive oficial → PR protegido. Nada de CLI global o actualización silenciosa del pin. No editar OPSX generado manualmente.
- Un issue nuevo debe añadirse al Project #3 antes de DoR. Secciones literales `## Historia Original` / `## Enriquecida` y metadata válida. Un pendiente humano real bloquea DoR; no inventar aprobación.
- `surfaces` debe corresponder al efecto real y al catálogo; no retirar un perfil para esconder un fallo del mismo cambio.
- #162 **ya corrigió** el falso rechazo de español y acotó términos reservados en el nombre del change. #122/#115/#154/#160 **ya están integrados**: las trampas antiguas no son su estado actual ni motivo para arreglarlos otra vez.
- No editar mientras corre una suite que valida exportación; medir sobre SHA/árbol identificados. CI verde de otro head/base no basta.
- `doctor`, `sync --check`, `upgrade --check`, `debt check` son read-only. No cambiar perfiles, evidencia cruda, excepciones, presupuesto o protecciones para forzar PASS.
- Preservar ejecuciones adversas, corpus congelados, capturas con procedencia y distinción agente/humano. Reusar evidencia solo con comparación y alcance explícitos.
- #196–#202 forman una pila; no hacer merges/squashes/rebases desordenados ni usar force push por conveniencia. Antes de cada integración, comprobar base, CI, gates y bytes de la entrega real.
- No abrir nuevos changes de producto para «avanzar mientras espera npm». Trabajar sobre pendientes autorizados y evidencias existentes; esta sesión se detiene antes de ola 4.

### Criterios de seguimiento

- [x] Los 28 issues de trabajo originales aparecen en el orden actualizado con cerrado/integrado frente a pendiente explícito.
- [x] Los issues añadidos y los programas tienen una sección propia sin mezclarlos con entregas completadas.
- [x] Las trampas resueltas se distinguen de los límites vigentes; se conservan mediciones y fallos históricos.
- [x] Actualización de estado contrastada con GitHub, merges y expedientes; las tarjetas archivadas siguen recuperables.
- [ ] Prueba nueva de autonomía de un agente que cree un issue/DoR usando solo este handoff. No se simula ni se atribuye a esta actualización.
- [ ] Ola 3 integrada, gates reales completados y programa cerrado.
- [ ] Todas las olas terminadas; hasta entonces #167 permanece abierto.

### Historial preservado

El texto anterior, sus métricas, hipótesis, decisiones y metadata quedan íntegros debajo. Sus referencias a «hoy», «en curso», versiones o gates describen **septiembre**, no prevalecen sobre el estado actual. Casos históricos sin resolución demostrada deben reconciliarse en #206, no desaparecer por esta limpieza.

<details>
<summary>Handoff anterior completo (snapshot del 20 de septiembre de 2026)</summary>

> **Si eres un agente que acaba de llegar a este repositorio, empieza por aquí.** Este documento te dice en qué orden aplicar los 30 issues abiertos, qué ya está comprobado para que no lo vuelvas a investigar, y las siete trampas que te harán perder tiempo si no las conoces. Lee la sección 3 antes de escribir tu primer issue o change.

## Historia Original

> Ordéname los issues por orden de aplicación, junto con un handoff del contexto para que otro agente o en un nuevo chat pueda empezar a aplicarlos. Le meteré velocidad ya que tengo muchas suscripciones de IA para que los acabe todos antes de las fechas. (18 de septiembre de 2026)

## Enriquecida


### 0. Estado en este momento

Actualizado el 20 de septiembre de 2026 a las 21:30 (UTC−6).

**La ola 0 está cerrada.** Sus cuatro issues están integrados en `main` y sus changes archivados.

| Issue | PR | Merge | Change archivado |
| --- | --- | --- | --- |
| #142 · hotfix 0.3.2 y enlace de descarga | [#169](https://github.com/IgnacioBarEsp/project-engineering-os/pull/169), [#170](https://github.com/IgnacioBarEsp/project-engineering-os/pull/170) | `c044d2d`, `eefa1bc` | `2026-09-19-companion-0-3-2-hotfix-actions-bar-clipboard/` |
| #143 · capturas con procedencia | [#171](https://github.com/IgnacioBarEsp/project-engineering-os/pull/171) | `a02c991` | `2026-09-19-restore-screenshot-provenance/` |
| #166 · re-medición y comparación de flujos | [#172](https://github.com/IgnacioBarEsp/project-engineering-os/pull/172) | `693f9b6` | `2026-09-20-remeasure-retrieval-and-record-flow-comparison/` |
| #165 · mazo del congreso | [#175](https://github.com/IgnacioBarEsp/project-engineering-os/pull/175) | `2384fab` | `2026-09-20-congress-presentation-with-measured-evidence/` |

**#143 cerrado el 20 de septiembre de 2026.** `scripts/screenshot-provenance.mjs` entró en `check:docs` con 14
pruebas: alcanza toda imagen bajo `docs/assets/companion*`, compara hash, tamaño y dimensiones, y exige que la
galería cite el commit, el motor y la forma de ejecutar. Siete capturas de la ventana real en Electron desde
`d744c47`. Revisión: una ronda desde contexto limpio, 0 Blockers, 3 Majors, 7 Minors y 3 Info, todos
corregidos. Deuda `clean`.

**Defecto del producto encontrado al revisar #143**, comentado en
[#145](https://github.com/IgnacioBarEsp/project-engineering-os/issues/145) por decisión del mantenedor: con el
perfil «Investigación», el paso 2 pide elegir «el subtipo para Investigación» y ofrece los de software, con el
primero ya marcado, que viaja a `PROJECT_VISION.md`. La galería lo nombra donde se ve.

**Decisiones del mantenedor para #143:** capturas de la ventana real en Electron; mocks rotulados donde están;
superficie `documentation` en lugar de `documentation, harness-tooling`, porque ese perfil cubre los arneses de
agentes y exigiría `sync-check`, `opsx-check` y `doctor`, que hoy fallan por #122 y #115; y apply completo
hasta el PR. Están en `evidence/maintainer-decisions.md` del change.

**#166 cerrado.** Las cuatro pruebas, hechas y publicadas.

| Prueba | Estado |
| --- | --- |
| 1. Re-medir la recuperación | **Hecha.** Con la 0.3.2 instalada desde el instalador publicado: el contexto preparado sigue en **0 de 20** y el barrido literal en 20 de 20. La causa tampoco cambió: 45 de 2654 fuentes indexadas en Kubernetes y 42 de 2753 en CPython, con `entry-limit`. Publicada junto a la corrida de 0.1.0 |
| 2. Los dos flujos sobre #162 | **Hecha.** Cada vía en contexto limpio y su propio árbol, desde el mismo párrafo. **Ninguna entregó el arreglo completo y fallan en cosas distintas**: el prompt suelto deja el segundo síntoma sin tocar (33 de 34 frases, 19 de 19 marcadores, 8 min 44 s, 2 archivos); el flujo completo deja un marcador real sin detectar (34 de 34, 18 de 19, 31 min 3 s, 28 archivos). Las dos entregas **no se integran**: #162 sigue abierto |
| 3. Contraste del arnés contra `a3b1efd` | **Hecha.** Misma aplicación, dos comprobaciones: el arnés de entonces, **0 hallazgos**; el de hoy, **66 problemas distintos** repetidos en 23 combinaciones —360 renglones—, incluidos siete controles que no se podían pulsar; en seis de los siete, lo que los tapaba era la barra de acciones |
| 4. Arranque documentado | **Hecha.** `scripts/verify-documented-start.mjs` lee los seis pasos del propio README y los ejecuta contra el paquete publicado: seis códigos 0 y el doctor del proyecto sembrado con 29 comprobaciones y 0 FAIL |

**Hallazgos de camino de #166, ya corregidos o registrados:** el verificador del benchmark no podía ejecutarse
sobre `main` —anclado a un commit que el squash dejó fuera— y ahora sí; desde `main` sigue sin poder probarse
que las preguntas se congelaran antes de medir, y el orden consta en el PR #113; y `npm run pack:verify` falla
en cualquier checkout de `main` porque el empaquetador trata un archivo sin saltos de línea como fin de línea
no canónico, **pendiente de su propio issue**.

**#165 cerrado el 20 de septiembre de 2026.** El guion del congreso está versionado en
`docs/presentations/2026-09-24-congreso.md` y enlazado desde el índice de documentación.

| Qué | Estado |
| --- | --- |
| Guion | 22 diapositivas: las veinte de la charla, la de límites y la de procedencia. Cada cifra atada a su registro |
| Comprobación del guion | `verify-deck-figures.mjs`: 26 afirmaciones recalculadas desde los registros de #166 y `EVIDENCE.md`, 0 fallos. Cada cifra se busca **dentro de su diapositiva** |
| Mazo | `.pptx` de 22 diapositivas, no versionado por ser binario derivado. Geometría 0 problemas, esquema válido, y las 22 revisadas a ojo tras convertirlas a PDF |
| Comprobación del mazo | `check-deck-figures.py`: toda cifra del `.pptx` y de sus notas tiene que estar en el guion. 90 cifras, 0 problemas; falla al mutar el generador |
| Canva | Conectado y con brand kit, pero **la generación de diseños no está habilitada en el equipo** y no hay plantillas de marca. Por eso el mazo se entrega como archivo importable |
| Revisión | Una ronda desde contexto limpio: **3 Blockers, 12 Majors, 14 Minors y 2 Info**. Blockers y Majors resueltos antes de archivar |
| Deuda | Assessment con un candidato `optional-improvement`; el plan `upstream-core` sigue en 4/5 unidades |
| Archivo | Gate de archive 17 PASS / 0 FAIL; `openspec/changes/archive/2026-09-20-congress-presentation-with-measured-evidence/` |
| `npm run check` | 350/350 sobre árbol limpio |

**Los tres Blockers de #165 merecen leerse**, porque son del mismo tipo que la charla denuncia: el guion
afirmaba haber pasado una revisión adversarial que no existía; la comprobación de las cifras buscaba cada una
en todo el documento, así que la cifra de una columna satisfacía la comprobación de otra —con el registro
mutado para decir que una vía no arregló nada, seguía dando PASS—; y el `.pptx` que se proyecta no lo genera
el guion, ya divergía en cuatro sitios y no declaraba la procedencia de ninguna cifra, que es el `SHALL` de la
spec delta de ese mismo change.

**En curso: #162**, rama `codex/162-fix-marker-detection`, 4 commits sin publicar. Es la trampa 1 de la
sección 3, arreglada en origen.

| Qué | Estado |
| --- | --- |
| Detector | `src/readiness.mjs`: las dos expresiones de marcadores pasan a alternativas cerradas con fronteras Unicode, y la excepción de términos reservados se acota al campo exacto `change` con kebab-case de varios segmentos |
| Medición | 34/34 frases legítimas aceptadas y 19/19 marcadores rechazados, contra el corpus congelado de #166. Cero regresiones sobre toda la metadata archivada |
| Suite | `npm run check` 351/351 en local |
| **Falta** | La matriz de CI protegida (3 sistemas × 2 versiones de Node), el archivo y el PR |
| **Bloqueo real** | La superficie declarada incluye `harness-tooling`, cuyo perfil **no admite N/A** y exige `sync-check` y `doctor-json-check`. Los dos fallan por #122 y #115, que están en la ola 2. La política de readiness marca `required-surface-evidence` como **no dispensable**, así que no hay excepción posible: o se corrige la superficie declarada, o #115 y #122 van antes |

**Pendiente de decisión del mantenedor, sin issue todavía:**

- Una carpeta de instalación de más de unos 130 caracteres rompe la app sin avisar: NSIS omite los archivos
  cuya ruta supera 260.
- `verify-native-clipboard.mjs` no restaura todos los formatos del portapapeles de otras aplicaciones y
  restaura aunque no haya escrito. A veces registra el viewport antes de que aparezca la barra de menú.
- **#162 y la superficie `harness-tooling`**, descrito arriba. Es lo que decide si #162 puede cerrarse ahora o
  después de la ola 2.

### 1. Qué es este repositorio, en un párrafo

Dos productos con ciclos de publicación separados. El **núcleo** `create-project-engineering-os`, publicado en npm en 0.5.0, prepara cualquier repositorio con gobernanza, flujo SDD, instrucciones para agentes y control de deuda; vive en `src/`, `blueprint/`, `schema/` y `bin/`. El **Companion**, en `apps/companion`, es una aplicación Electron para Windows publicada en 0.3.2 que hace lo mismo sin terminal. El núcleo no elige framework, base de datos ni proveedor: esa neutralidad es el producto y la comprueba `npm run check:neutrality`.

Documentos que mandan, en este orden: `AGENTS.md`, `CONTRIBUTING.md`, `docs/architecture/OWNERSHIP.md`, `PRODUCT.md` y `docs/SELF_APPLICATION.md`. El último explica por qué algunos `FAIL` del doctor sobre este repositorio son esperados y no deuda.

### 2. La regla que no se negocia

**Ninguna afirmación sin evidencia.** `PRODUCT.md` lo dice y el repositorio lo hace cumplir: `test/companion-language.test.mjs` rechaza garantías no medidas y `docs/companion/EVIDENCE.md` publica el método antes que los números, incluido un resultado **desfavorable** para el propio producto.

Corolario práctico para ti: si una prueba no se ejecutó, no pasó. `SKIP` no es `PASS`. Un harness en verde sobre una pantalla que nadie visitó es evidencia vacua, y el repositorio ya tiene una función que la rechaza, `vacuous()` en `apps/companion/scripts/interface-contract.mjs`.

### 3. Las siete trampas, por orden de cuánto tiempo cuestan

Todas descubiertas ejecutando el sistema el 18 de septiembre de 2026.

**1. El detector de marcadores rechaza español correcto.** `src/readiness.mjs` rechaza cualquier metadata que contenga `conserva el`, `conserva la`, `completa la`, `sustituye el` y variantes. Frases normales como «el rollback conserva el historial» fallan la Definition of Ready. Hay 22 coincidencias legítimas en los documentos del propio repositorio. Reescribe o aplica #162 primero.

**2. El nombre del change no puede contener ciertas palabras.** `placeholder`, `TODO`, `TBD`, `CHANGEME` y `FIXME` se rechazan en cualquier posición, **incluido el propio campo `change`**. Un change llamado `fix-placeholder-detection` es inválido.

**3. `manualInterventions` con `status: "pending"` hace fallar la DoR.** Solo pon ahí **gates humanos reales**: conceder autoridad a una automatización, aprobar un costo, aceptar una licencia. Una decisión de diseño que se toma *dentro* del change no es un gate; sácala de la metadata y descríbela en el cuerpo. Dos issues de este programa están en rojo a propósito por esta razón y lo dicen en su texto.

**4. El issue debe pertenecer al GitHub Project.** La DoR comprueba pertenencia al proyecto titulado `Project Engineering OS`, que es el número **3** de la cuenta. Después de crear un issue:
```bash
gh project item-add 3 --owner IgnacioBarEsp --url <url-del-issue>
```

**5. Las secciones del cuerpo son literales.** Tienen que existir `## Historia Original` y `## Enriquecida`, escritas así. Y el bloque de metadata se cierra con `project-os-readiness:pre-propose -->`, no con `-->` a secas.

**6. `surfaces` solo acepta perfiles declarados.** Los válidos están en `.project-os/profiles.json`: `ai`, `auth-security`, `backend-api`, `data-migration-sync`, `documentation`, `harness-tooling`, `infra-deploy`, `library-cli`, `ui`. Cualquier otro valor falla.

**7. Dos comandos de diagnóstico están rotos sobre este repositorio.** `sync --check` y `upgrade --check` salen con código 2 por la deriva de perfiles de #122, y `doctor` sale con código 1 y cuatro FAIL, tres de ellos por #115. **No intentes arreglarlos como efecto colateral de otro change.** Tienen sus propios issues y están colocados en la ola 2.

### 4. El flujo que tienes que seguir

Obligatorio para todo cambio no trivial. No lo abrevies.

```text
issue enriquecido -> DoR -> change OpenSpec -> implementar -> evidencia
                  -> revisión adversarial -> deuda -> archivar -> PR protegido
```

Comandos, con la versión local fijada:

```bash
node bin/project-os.mjs readiness-check --phase propose --issue <n>
npx openspec validate <change> --strict --no-interactive
node bin/project-os.mjs readiness-check --phase archive --change <change> --run-local
node bin/project-os.mjs debt capture --flow <flujo> --input <archivo.json>
npx openspec archive <change> --yes
npm run check
```

Un change necesita en su carpeta: `.openspec.yaml`, `proposal.md`, `design.md`, `tasks.md`, `TLDR.md`, `brownfield-baseline.md`, `readiness.json`, `specs/` y `evidence/`. Los commits van con `git commit -s`. El merge es por pull request protegido con CI en verde sobre tres sistemas operativos.

**Antes de empezar el primer change, comprueba que `readiness-check --phase archive --run-local` puede cerrar.** Si #115 lo bloquea, lo sabrás en el primer intento y no al final de la ola.

### 5. Lo que ya está comprobado: no lo repitas

Auditoría ejecutada el 18 de septiembre sobre `a3b1efd`. **Esto ya se midió; úsalo, no lo re-derives.**

| Hecho | Estado |
| --- | --- |
| Suite completa `node --test` | 326 / 326, 201 s |
| `npm audit --omit=dev` | 0 vulnerabilidades |
| Arranque documentado del README con el paquete publicado | Funciona de principio a fin, seis pasos con código 0 |
| `doctor` sobre un consumidor recién creado | 0 FAIL |
| Seguridad de rutas en `src/paths.mjs` | Sólida: bloquea bytes nulos, letras de unidad, rutas absolutas, `..` y enlaces que escapan |
| `CLAUDE.md` y `OPENCODE.md` | **No duplican** `AGENTS.md`: son espejos generados por token desde `.project-os/` |
| Causa del bug de la barra en el Companion | `position:fixed` dentro de `.enter`, animado con `transform` y `fill-mode: forwards` |
| Por qué el harness no lo vio | `verify-ui.mjs` abre el navegador con `reducedMotion: 'reduce'` |
| Portapapeles del Companion | Roto en Electron real: permiso denegado y `catch {}` que lo oculta |
| Capturas de `docs/assets/companion/` | Son los mocks de Stitch, byte a byte |
| Node 20 | Sin parches desde el 30 de abril de 2026 |
| OpenSpec | Fijado en 1.6.0; último publicado 1.13.1 |
| Acoplamiento a OpenSpec | 50 archivos, 13 módulos de `src/` |
| Esquema de capacidades | Fija exactamente cinco agentes, `minItems: 5, maxItems: 5` |

Una hipótesis que **se descartó midiendo**: el arranque documentado parecía roto y no lo estaba. El `DRIFT` que aparecía venía de mezclar el binario del checkout con el publicado, y eso es el issue #154, no un fallo del arranque.

La evidencia completa, con capturas, geometría cruda y los tres scripts de reproducción, está fuera del repositorio en `Documents/Projects/peos-congreso-evidencia/`, con su `DOSSIER.md`.

### 6. El orden de aplicación

**Ola 0 — Congreso. Hay fecha: 24 de septiembre. Cerrada el 20 de septiembre.** Mandaba sobre todo lo demás.

| # | Issue | Depende de |
| --- | --- | --- |
| 1 | ✅ #142 Hotfix del Companion: barra de acciones y portapapeles. Cerrado el 19 de septiembre, 0.3.2 publicado | — |
| 2 | ✅ #143 Capturas reales con procedencia. Integrado con la PR #171 (merge `a02c991`) y cerrado el 20 de septiembre | #142 ✅ |
| 3 | ✅ #166 Re-medir la recuperación y registrar la comparación. Las cuatro pruebas hechas; integrado con la PR #172 (merge `693f9b6`) | — |
| 4 | ✅ #165 Mazo de la presentación. Guion, mazo y comprobaciones; integrado con la PR #175 (merge `2384fab`) | #142, #143, #166 |

Los cuatro cabieron. Lo que queda antes del día 24 es abrir el `.pptx` una vez en el programa donde se vaya a
proyectar: LibreOffice sustituye fuentes, así que el ajuste exacto del texto puede variar.

**Ola 1 — Fricción y riesgo. Pequeños, sin dependencias, en paralelo.**

| # | Issue | Por qué aquí |
| --- | --- | --- |
| 5 | ⏳ #162 Detector de marcadores. **En curso**, rama `codex/162-fix-marker-detection`: detector corregido y medido, falta la CI protegida y resolver la superficie `harness-tooling` (sección 0) | Cada issue y cada change futuro pasa por ese gate |
| 6 | #168 Experiencia del instalador: acceso directo opcional, abrir al terminar, idioma | Ver la nota de versiones justo debajo |
| 7 | #155 Node sin soporte | Riesgo de seguridad que el producto propaga a cada consumidor |
| 8 | #152 Retirar el vendoring de impeccable | Es un borrado, no depende de nada |
| 9 | #156 Payload del paquete npm | Independiente y pequeño |

**Decidido el 19 de septiembre:** se publicó 0.3.2 al terminar #142, así que #168 sale como 0.3.3. Lo que sigue se conserva como razonamiento.

**Cómo encaja #168 con las versiones.** El change en vuelo ya es dueño de 0.3.2: prepara su identidad y la publica. Así que hay dos caminos y conviene decidirlo en la tarea 5.3 de ese change, no después.

| Camino | Qué pasa | Cuándo conviene |
| --- | --- | --- |
| **Publicar 0.3.2 al terminar #142** | #168 sale después como 0.3.3 | **Recomendado antes del congreso.** El enlace de descarga vuelve a apuntar a una app con la que se puede terminar el asistente, que es lo que hoy no ocurre |
| Diferir la publicación | #142 y #168 se integran y sale un solo instalador | Si el congreso ya pasó o si prefieres no gastar dos ciclos de release |

Las capturas de #143 **no dependen de publicar**: se generan del renderer y de Electron en local, y la documentación ya declara que no son capturas del instalador.

**Ola 2 — Desbloquear el diagnóstico del núcleo.**

| # | Issue | Por qué aquí |
| --- | --- | --- |
| 10 | #122 Deriva de perfiles activos | Bloquea `sync --check` y `upgrade --check` |
| 11 | #115 Doctor y archive con perfiles técnicos | Puede bloquear el archivado de todo change |
| 12 | #154 Deriva del repositorio frente a procedencia del CLI | Diagnosticabilidad |
| 13 | #160 Baseline del doctor y ciclo de vida de recibos | Depende conceptualmente de 9 y 10 |

**Ola 3 — Reconstrucción del Companion. La más larga.**

| # | Issue | Depende de |
| --- | --- | --- |
| 14 | #144 Fundación del renderer 0.4 | #142 |
| 15 | #150 Harness con alcanzabilidad y Electron | **Acompaña desde #144**, no después |
| 16 | #145 Taxonomía de seis perfiles | #144 |
| 17 | #146 Flujo único de cuatro pasos | #144, #145 |
| 18 | #147 El paso 4 hace trabajo real | #145, #146 |
| 19 | #148 Lista y pantalla de proyecto | #144 |
| 20 | #149 Movimiento, carga y microcopia | #144, y las pantallas ya existentes |

**Ola 4 — Superficie para agentes.**

| # | Issue | Nota |
| --- | --- | --- |
| 21 | #157 Manifiesto de comandos legible por máquina | — |
| 22 | #159 Catálogo de agentes en datos | Amplía también el vocabulario de capacidades |
| 23 | #158 Frescura de decisiones fijadas | **Requiere tu aprobación antes de empezar** |

**Ola 5 — Decisiones registradas. Investigación, no bloquean código.**

| # | Issue |
| --- | --- |
| 24 | #163 Motor SDD: OpenSpec frente a Spec Kit y el resto |
| 25 | #164 Ingeniería agéntica y sustrato de verificación |
| 26 | #161 Forma del proyecto frente a síntesis continua y golden paths |

**Ola 6 — Cierre.**

| # | Issue | Nota |
| --- | --- | --- |
| 27 | #151 Shell de ventana | Opcional: solo si lo activas |
| 28 | #118 Consolidar la landing | Se cierra con las capturas de la ola 0 |

**Issues de coordinación, fuera de las olas:** este mismo documento (#167), y los dos programas #141 y #153, que son issues de agrupación.

Los dos programas, #141 y #153, No llevan metadata ni pasan la DoR, y se cierran cuando sus olas terminan.

### 7. Qué puede ir en paralelo

Con varias sesiones a la vez, estos grupos no se pisan porque tocan archivos distintos:

- **Grupo A:** #142 y #143, sobre `apps/companion/ui` y `docs/`.
- **Grupo B:** #155, #152 y #156, sobre `package.json`, `.github/` y configuración.
- **Grupo E:** #168, sobre `electron-builder.yml`, `build/installer.nsh` y el arnés de release. No toca el renderer, así que no choca con la ola 3.
- **Grupo C:** #162, #154 y #160, sobre `src/`.
- **Grupo D:** #163, #164 y #161, solo documentación.

**Y lo que no puede solaparse con nada:** el change en vuelo, sea cual sea. Hoy no hay ninguno, porque #142 se archivó el 19 de septiembre. Mientras haya uno abierto, no abras otro change de OpenSpec.

**Lo que NO va en paralelo:** la ola 3 entera. #144 reescribe el renderer y todo lo demás del Companion se construye encima. Hacer #146 antes que #144 significa escribir dos veces.

Y una advertencia sobre velocidad: el flujo exige **un change grande activo a la vez**. Si abres varios changes de OpenSpec simultáneos, el archivado se enreda. Paraleliza sesiones, no changes.

### Criterios observables

- [ ] El orden de las siete olas está publicado y cada issue del repositorio aparece exactamente una vez.
- [ ] Cada dependencia declarada corresponde con las que los propios issues nombran en su cuerpo.
- [ ] Las siete trampas están descritas con el archivo y la causa, no como consejo general.
- [ ] Un agente nuevo puede crear un issue que pase la DoR siguiendo solo este documento, sin leer la sesión anterior.
- [ ] El dossier de evidencia existe fuera del repositorio y este documento dice dónde.
- [ ] Este documento se actualiza cuando una ola termina, o se cierra cuando todas terminan.

### Límites

- No sustituye a `AGENTS.md` ni a `CONTRIBUTING.md`: los resume y los enlaza.
- No autoriza saltarse ningún gate por velocidad.
- No fija fechas para las olas 1 a 6: solo la ola 0 tiene fecha, y es la del congreso.

<!-- project-os-readiness:pre-propose
{
  "schemaVersion": "1.0.0",
  "change": "publish-application-order-and-handoff",
  "execution": "versioned",
  "dependencies": [],
  "currentState": {
    "summary": "Hay 27 issues de trabajo abiertos repartidos en dos programas y un congreso con fecha el 24 de septiembre, sin orden de aplicación publicado ni documento que transfiera el contexto a otro agente. La auditoría del 18 de septiembre descubrió siete trampas del propio sistema que hacen perder tiempo a quien no las conoce, entre ellas que el detector de marcadores rechaza español correcto y que una intervención manual pendiente hace fallar la Definition of Ready.",
    "sources": [
      "AGENTS.md",
      "CONTRIBUTING.md",
      "docs/SELF_APPLICATION.md",
      "src/readiness.mjs",
      ".project-os/profiles.json",
      "docs/companion/EVIDENCE.md"
    ]
  },
  "scope": [
    "Orden de aplicación en siete olas con dependencias declaradas por issue",
    "Handoff de contexto para un agente nuevo: qué es el repositorio, qué regla manda y qué ya está comprobado",
    "Catálogo de las siete trampas del sistema con su archivo y su causa",
    "Grupos que pueden ejecutarse en paralelo y advertencia sobre changes simultáneos",
    "Puntero al dossier de evidencia guardado fuera del repositorio"
  ],
  "observableCriteria": [
    "Cada issue abierto aparece exactamente una vez en el orden",
    "Cada dependencia corresponde con la que el propio issue declara",
    "Las trampas se describen con archivo y causa, no como consejo general",
    "Un agente nuevo crea un issue que pasa la DoR siguiendo solo este documento",
    "El documento dice dónde vive el dossier de evidencia"
  ],
  "owner": "IgnacioBarEsp",
  "risks": [
    "Un orden publicado envejece cuando cambian las prioridades; el criterio final obliga a actualizarlo por ola o a cerrarlo",
    "Trabajar en paralelo puede tentar a abrir varios changes de OpenSpec a la vez; el documento lo desaconseja de forma explícita"
  ],
  "surfaces": ["documentation"],
  "manualInterventions": [],
  "costLicenseReview": {
    "status": "not-applicable",
    "owner": "IgnacioBarEsp",
    "evidence": null,
    "justification": "Documento de coordinación; sin dependencias, servicios ni licencias."
  },
  "evidence": {
    "automatic": [
      "openspec-strict",
      "relative-link-check",
      "npm run check"
    ],
    "manual": [
      "Prueba de lectura con un agente nuevo que crea un issue válido usando solo este documento"
    ]
  },
  "rollback": {
    "strategy": "git-revert",
    "trigger": "El orden contradice una dependencia declarada en un issue",
    "recovery": "Revertir el PR; los issues mantienen sus dependencias en su propio cuerpo"
  },
  "nonGoals": [
    "Sustituir AGENTS.md o CONTRIBUTING.md",
    "Autorizar saltarse gates por velocidad",
    "Fijar fechas para las olas posteriores al congreso"
  ],
  "exceptions": []
}
project-os-readiness:pre-propose -->

**Aprendido al cerrar #142.** Cada punto costó tiempo:

- **`debt capture` es inmutable:** no admite recapturar el mismo flujo con otro contenido. Captura después de la última pasada de revisión.
- **`openspec archive` baja el change un nivel.** Los enlaces de `evidence/` a la raíz del repositorio necesitan un `../` más. Los archivos anteriores tienen 0 enlaces rotos.
- **No edites archivos mientras corre `npm run check`:** la prueba de exportación falla con «Export divergente».
- **`npm run pack` y `verify-native-clipboard.mjs` necesitan el árbol limpio:** haz commit antes de medir.
- **`pack:verify` necesita PowerShell 7 (`pwsh`).** Si no está, lo ejecuta el workflow de release.
- **El script de release se niega a instalar en una estación personal:** la identidad de desinstalación NSIS es compartida. Si el mantenedor autoriza probar ahí, instala en una carpeta corta.
- **Viewport real de Electron 44 en Windows 11:** la ventana por defecto deja 1164 × 755 px CSS. Con zoom al 200 % quedan 582 × 377, y la mínima deja 464 × 475. Un navegador sin CSP no ve lo que la CSP de la app bloquea.
- **Una medición suelta no descarta un defecto intermitente:** hay que registrarlo en un harness con N ejecuciones.


</details>
