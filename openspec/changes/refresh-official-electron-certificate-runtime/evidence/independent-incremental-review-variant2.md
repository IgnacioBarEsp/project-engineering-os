# Reconciliación incremental del mismo reviewer — #218, bootstrap v2

Esta es la única reconciliación incremental autorizada por la aprobación real de 1cbfe2a7a7f1e89990d0e3ad27d30dd257275f9a («Sí, apruebo la enmienda 1cbfe2a»). No constituye otra revisión fresh/global ni otro ciclo de investigación. Alcance: F1, arranque, deadline de setup/cleanup y regresiones concretas del único archivo cambiado y su caller inmediato.

Repositorio: C:/Users/RitualDesktop/.codex/worktrees/wave3-current-source-verification/project-engineering-os.
HEAD observado: 1cbfe2a7a7f1e89990d0e3ad27d30dd257275f9a.
Único diff local: apps/companion/scripts/electron-certificate-boundary.mjs, 84 adiciones/48 eliminaciones.
Postimage físico comprobado: 6695b1dcc2f4d6b2079b2c0d4b37614ed8a0e90884e2ff92a045131fc2486089.
Patch aprobado comprobado: 51b30f0679650791e57ee32a19fbf8a27b2b196c7ed4ec382427dbb08a11cf98.
Recipe de variante2: 0b979f38812f7c25afd683169e98b46bd1e8a41902648ffb335a78a13cf1fd95.

El reviewer no modificó fuentes, delegó, ejecutó tests/Electron, instaló, descargó runtimes, generó fixtures ni repitió ejecuciones. Sólo leyó el diff/propuesta/caller y los recibos retenidos, y calculó hashes de lectura. El informe original independent-candidate-review.md conserva su SHA256 9f4d45d980a48c8e479dfd5b259425a1cee6e95dd19321ba50c3ef1b68440545. Su hallazgo y el primer timeout permanecen históricos; no se sustituyen.

**Resultado: F1 resuelto para este postimage y la evidencia de arranque examinada. Cero hallazgos nuevos concretos en el alcance incremental.**

La llamada de apps/companion/scripts/electron-certificate-boundary.mjs:295 ahora inicia childProbe mediante una promesa explícitamente observada con catch, sin await desde la evaluación del entrypoint. El único await superior es la importación intrínseca de Electron en :290. Validación de invocación, userData y desactivación de aceleración se hacen antes de ceder la evaluación (:292–294). childProbe conserva app.whenReady() en :213, pero ese await ya no impide que finalice la importación del entrypoint. Así se elimina la dependencia circular identificada en F1.

Los fallos síncronos de invocación/configuración y las promesas rechazadas terminan con stderr estructurado y app.exit(1), :295–301. Los fallos internos dejan completed:false y salida1; el padre sigue rechazando salida no cero, reporte ausente/incompleto, nonce/modo/hash/casos diferentes. El recibo se inicia en fase bootstrap antes del hashing y registra waiting-for-ready antes del await (:204–213). El caso de importación normal por host Node no entra en la rama Electron/PROBE (:287); el caller conserva su importación y su espera obligatoria del resultado.

La evidencia real resuelve la parte antes bloqueada: ambos probes llegaron a phase:complete, con los nueve casos declarados realmente presentes, nonces coincidentes con stdout, exitCode:0, observedComplete:true y parentFailure:null. Es observación de las ejecuciones retenidas del owner; no una ejecución del reviewer ni una atribución retrospectiva de casos al timeout inicial.

**Deadline y cleanup.** En :113–120 se crea el mismo deadline20s antes de tls/https.createServer y listen. listen recibe AbortSignal (:130), se comprueba el aborto antes de iniciar cliente (:132), y la operación se compite contra deadline (:166). El finally inicia aborto, destruye los sockets registrados y compite el cierre del servidor, si sigue escuchando, contra el mismo deadline, antes de limpiar el timer (:171–178). Los listeners persistentes de error mantienen observadas las emisiones tardías. Las ramas de error de setup conservan server-setup; un deadline/error de cleanup produce phase:cleanup. Ninguna puede satisfacer el requisito de una negativa con fase client-certificate-verification y un único código X509 exacto (:219–225).

El techo de proceso120s sigue en el lanzamiento :256–257, y el límite de heap256MiB sigue comprobado en :207. No se sustituyeron certificados, expectativas, strict TLS, capacidades o límites. El deadline continúa activo durante finally; el aborto inicia el cierre mediante el signal de listen y la destrucción de sockets. No se encontró una regresión concreta del nuevo flujo. Los recibos muestran los caminos normales de finalización, no una inyección de bloqueo de setup/cleanup; esta reconciliación no inventa cobertura dinámica de esos caminos excepcionales.

**Contraste comprobado, sin crédito por denominador vacío.** Los seis hashes de fixtures del padre y del child coinciden con variante2. Ambos helpers reportan el postimage6695b1d…; las identidades externas y las internas del ejecutable coinciden.

| Identidad | Baseline offline | Candidata |
| --- | --- | --- |
| Electron | 44.1.1 | 44.9.1 |
| Node embebido | 24.19.0 | 24.22.0 |
| Chromium | 152.0.7977.65 | 152.0.7977.167 |
| Ejecutable SHA256 | 11246b242f4fb967283b6d50d5800fa30e7c3f43d47353a6d20fc8d6ac07b87f | 1432afee01d6a788f11cb6649efd271923e1e490beef688c24d31f47965013aa |
| Heap observado | 226492416bytes (216MiB) | 226492416bytes (216MiB) |
| Casos presentes/esperados | 9/9 | 9/9 |

En la siguiente tabla U = UNABLE_TO_VERIFY_LEAF_SIGNATURE, S = CERT_SIGNATURE_FAILURE y R = CERT_REVOKED. Cada negativa tiene ok:false, passed:true y exactamente el código indicado; cada control trusted tiene ok:true, passed:true, error:null y actualCodes:[]. Los18casos tienen fase client-certificate-verification. Fetch conserva la causa X509 anidada bajo TypeError, sin aceptar el error genérico como prueba.

| Caso | Baseline: resultado / ms | Candidata: resultado / ms |
| --- | --- | --- |
| tls/trusted | éxito /12 | éxito /17 |
| tls/untrusted | U /3 | U /3 |
| tls/blocked-chain | S /4 | R /4 |
| https/trusted | éxito /10 | éxito /10 |
| https/untrusted | U /3 | U /3 |
| https/blocked-chain | S /3 | R /4 |
| fetch/trusted | éxito /21 | éxito /26 |
| fetch/untrusted | U /4 | U /4 |
| fetch/blocked-chain | S /4 | R /3 |

Todos los elapsedMs están por debajo de20000. Ambos procesos terminan correctamente bajo el guard120s, sin timeout ni skip. La ventana completa del owner, incluido el caller nativo, es34.229s según sus timestamps; eso no es una medida individual inventada de cada child.

**Caller y procedencia.** verify-electron.mjs sigue byte-idéntico, SHA256 12e6e8c24f344252013186176ce0d133aca5ce67880ee4453bc997b5db0bc5ec. Sus líneas31–33 siguen exigiendo el boundary antes del arranque de app, y :95–103 conservan denominadores, failures y propagación del fallo. electron-evidence.json registra completed:true, failures:[],18capturas únicas (home/step-1/finished ×1180/1024/480 ×dos modos de movimiento), quality.issues vacíos y12copias con matched:true (dos acciones ×tres ventanas ×dos modos). La referencia al recibo de certificados tiene el hash real fc4fc036… y coincide con el JSON leído. El nativeReport anidado en owner-contrast es idéntico al recibo nativo separado.

La ejecución nativa declara commit1ba2933dbeb4d2d2fcbe93f7514953ffe073e8c5 y dirty:true. No prueba una ejecución limpia de1cbfe2a ni un artifact publicable. Su appSourceSha256 90e066f637bba6bb1b7b470c57b7568d5fa626c1d34c18146c1421c08724e9a7 coincide con el agregado registrado al congelar variante2; los diez inputs congelados fueron además contrastados por este reviewer contra los bytes actuales,10/10coincidentes. El checkout revisado también declara su único helper modificado. Esta conclusión se liga al postimage/huella congelados, conservando los valores reales de Git.

**Stderr conservado y límites.** No se declara stderr limpio: owner-contrast.candidateNative.stderr conserva18685caracteres/128líneas de MAX_PATH,121entradas de Filename too long y7warning: could not open directory. Incluye rutas docs/stitch y openspec/changes/archive. Su existencia impide usar la consulta Git como prueba de un árbol global sin degradaciones; no se cambió configuración de Git ni se repitió el ensayo para esconderlas. El child candidato conserva además el diagnóstico de caché GPU de persistent_cache_sandboxed_file_factory.cc:153, ruta GPUPersistentCache/DawnGraphiteCache y error0x3. El baseline child tiene stderr vacío. Los textos completos permanecen en los recibos originales con los hashes siguientes; no se eliminaron ni reemplazaron por un PASS silencioso.

Los resultados acreditan el arranque reparado, el contraste sintético estricto y el caller fuente de esta variante. No acreditan explotación, cobertura de la red Chromium, instalador, CI futura, aceptación humana, deuda, archivo o integración. El timeout original sigue siendo FAIL y la primera ejecución baseline no obtiene casos retrospectivos. Según los recibos: baseline acumulado2, candidata1, variantes2; esta entrega consume la única reconciliación incremental del mismo reviewer y no autoriza otra ejecución, variante o revisión.

Recibos leídos mediante MCP, mismo targetPath, storage:persistent, prefijo artifacts/wave3-current/electron218/; hashes físicos comprobados:

| Artefacto | SHA256 |
| --- | --- |
| frozen-variant2.json | 45d10333f018915ab9b07a384173c1f92fb95fc07be735d442d9ccc621fd898e |
| bootstrap-v2/owner-contrast.json | 38189b0d5a86df42da45c95475a74ab15893f9c824951618ea048f8cc80c3a4c |
| bootstrap-v2/baseline-contrast/baseline-certificate-boundary.json | ce46c7fbf779f047d4e37d1ccbfe1d5b5f88e0292723f500ccccc6671c36c0b1 |
| bootstrap-v2/candidate-native/certificate-boundary/candidate-certificate-boundary.json | fc4fc036d96b2565f1db846559a81b72750b737fe3684e24a56f5102429ef0e7 |
| bootstrap-v2/candidate-native/electron-evidence.json | f59a5f5577cc0405765c3fcd3e4a6a5ed6ac22a9993bd41c1f039ae2417cec17 |
