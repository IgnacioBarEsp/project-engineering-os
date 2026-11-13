# Revisión independiente acotada de integración final — e713e9a

Fecha de cierre del informe: 2026-11-13, UTC.
Revisor: **agente Codex independiente `/root/wave3_final_integration_review`**. No soy el implementador, un servicio Bugbot ni una persona. No delegué. Es la única revisión final autorizada por la enmienda f9ed23c, reanudada en el mismo agente; no es una auditoría exhaustiva ni otro ciclo de revisión de npm.

**Dictamen: cambios requeridos. Dos hallazgos P2 del harness/evidencia; ningún P0, P1 o P3 adicional confirmado dentro de este alcance.** El ciclo canónico instalado falla realmente y otro comando público de evidencia contiene anclas obsoletas. No se demostró una regresión funcional de la UI por esos fallos. Esta revisión no autoriza archivo, merge, release ni cierre de las siete fases.

## Identidad y alcance inmutables

Repositorio: `C:/Users/RitualDesktop/.codex/worktrees/wave3-current-source-verification/project-engineering-os`.

- HEAD leído al inicio y al cierre: `e713e9a6089b8bdc505660c03227bbab5b2829d1`; árbol limpio.
- Base explícita y `origin/main`: `7073033724a20ee60bb76bc1791a7c3ae7cfca34`.
- La ref local `main` apunta a `264367aef79e0ab1beacf7b4e0fef5e7fa3f4aed`; no la usé como base. No actualicé refs.
- Diff propio: `git diff 7073033… e713e9a…`, 300 archivos, 33323 inserciones y 2453 eliminaciones. La revisión siguió contratos de integración; no afirma haber auditado cada línea de los grandes JSON, CSS o artefactos históricos.
- Fuente de producto `332a2614f7b8b3d2c15b4c8e40a564dc1bb84dc1`: cero diferencias en Companion/bin/src/schema/blueprint/packages frente al head. Sus cambios posteriores son nueve documentos de coordinación del change #150.
- Comparación propia sin diferencias frente a `658e505031b195ed2d088447eec5c5d841c7c319` para UI/context/engine/desktop y codegraph/inference/stack-catalog. Comparación sin diferencias frente a la base para bin/src/schema/blueprint, paquetes/locks raíz, catálogo/identidad/manager npm, pack/verifier y lock Companion.
- UI completa idéntica a `3eaf55e`. Wizard y catálogo de perfiles idénticos a `5706b026200c2f6833bf8561c3b201a3b44f404b`. Home/gestión/workspace/Files comparados también sin diferencias frente a `a39a95e`. Esto permite conservar recibos de esas superficies, sin extender su aprobación.
- Verifiqué con Git que el commit de prueba CI `09c34d24d2b4f89da33222ba27221bb101f5bbf2` y e713 tienen el mismo árbol `4927fa6389e4ab6a6a3f48ce4f1fd819be694878`.
- Windows, PowerShell, Node propio observado `v24.18.0`. No ejecuté Electron ni un instalador en esta revisión.

Leí AGENTS.md, README, CONTRIBUTING y OWNERSHIP; propuestas y contratos de las siete fases; enmienda y aprobación literal f9ed23c; matriz e índice versionados; readiness de #146/#147/#150; recibos humanos de taxonomía, gestión y #149; revisión histórica y sus límites; EVALUATION. Consulté las issues reales [#144](https://github.com/IgnacioBarEsp/project-engineering-os/issues/144), [#145](https://github.com/IgnacioBarEsp/project-engineering-os/issues/145), [#146](https://github.com/IgnacioBarEsp/project-engineering-os/issues/146), [#147](https://github.com/IgnacioBarEsp/project-engineering-os/issues/147), [#148](https://github.com/IgnacioBarEsp/project-engineering-os/issues/148), [#149](https://github.com/IgnacioBarEsp/project-engineering-os/issues/149) y [#150](https://github.com/IgnacioBarEsp/project-engineering-os/issues/150) mediante el conector GitHub, sin modificar ni publicar nada.

## Hallazgos

### F1 — P2: el verificador canónico instalado crea perfiles retirados y aborta antes del recorrido nativo

Ubicación principal: `apps/companion/scripts/verify-native-journeys.mjs:65` (también 70 y 76); caller en 448–450. Contrato que lo rechaza: `apps/companion/engine/preparation.mjs:24`. Camino canónico: `apps/companion/scripts/verify-release-installation.mjs:101`.

**Trigger alcanzable:** ejecutar el ciclo canónico de actualización/recorridos/desinstalación con el artefacto de e713. El driver precarga cinco carpetas usando `previewBase`; las definiciones conservan `profile:'unity'`, `'media'` y `'general'`. Son escrituras nuevas, no lectura de recibos antiguos. El servicio usa la validación canónica sin `legacyRead`; al llegar a unity rechaza `PROFILE_INVALID`, antes de lanzar la ventana del recorrido en la línea 456.

**Hecho ejecutado por el coordinador/VM, inspeccionado por mí:** `artifacts/wave3-current/vm-e713/commands.json` registra `canonical-0.1.0-update-native-uninstall`, exit 1, signal null, 77983 ms, `timedOut:false`. El stderr traza exactamente native-journeys:448 → service:566/228 → preparation:24. `vm-e713/final.json` conserva FAIL. Sus hashes comunicados y asociados son, respectivamente, `3527cc01206dcaa09de39e4fe7e440a44bd27a2ad4b5ac4bf8bbb626815f57bd` y `36178f6bb9cc3458e2dea92cd320eac10ee20093b3dd47ff3935ed75ee39a8bb`. No atribuyo esta ejecución al revisor.

**Comprobación propia breve:** invocar solo `normalizeSelection`, sin servicio ni escritura, acepta los seis IDs canónicos y rechaza esos tres alias con `PROFILE_INVALID`; con `legacyRead:true` los mapea correctamente a software/game, content/creative y personal/open. Raw propio en `independent-final-integration-probe.json`.

**Impacto e inferencia:** ese camino de cualificación no puede completar la observación de la app instalada ni llegar por su flujo normal a la desinstalación posterior (línea 105). No demuestra que la UI, la instalación previa o el desinstalador estén defectuosos. El rechazo del servicio es una guarda legítima de #145. Los dos primeros perfiles pueden preparar su base, pero la precarga aborta antes de todos los recorridos; no hay denominador nativo final válido.

**Owner/acción concreta:** integración de taxonomía #145 y harness/distribución #150. Actualizar los fixtures de escritura al contrato final, conservando el caso videojuego con su enfoque y las pruebas de lectura legacy por separado. Reconciliar además el denominador de perfiles con el alcance exigido. No habilitar alias de escritura, omitir perfiles o relajar validaciones para hacer pasar este ensayo. El resultado de los pasos posteriores sigue sin conocerse; arreglar el primer error no los aprueba.

### F2 — P2: evidence:mutations conserva anclas que ya no existen en el servicio final

Ubicaciones: `apps/companion/scripts/verify-service-mutations.mjs:60` y `:170`; aserción de inserción en `:234`. Cambios que desalinean el harness: `apps/companion/desktop/service.mjs:811` (route-only) y `:101` (vision-missing). Entrada pública: `apps/companion/package.json`, comando `evidence:mutations`.

**Trigger alcanzable:** solicitar el comando de evidencia de mutaciones del servicio sobre e713. La cuarta mutación, `a-launcher-that-was-never-asked-is-reported-as-not-installed`, busca la línea anterior a la introducción de `routeOnly?'route-only'`. La mutación `the-ready-mark-ignores-a-stale-inventory` busca la construcción anterior a `vision-missing`.

**Hecho propio, solo lectura:** comprobé ambos strings literales contra los bytes actuales de service.mjs; ambos dan `present:false`. Inspeccioné que el runner exige `original.includes(mutation.from)` antes de escribir la mutación y que la escritura del reporte final ocurre después del bucle. El archivo del runner no cambió respecto de la base mientras que el servicio sí cambió. El raw propio conserva comandos, salida y exit 0 de la comprobación.

**Impacto e inferencia explícita:** si pasan los baselines y los pasos previos, el runner abortará en la cuarta mutación por punto de inserción inexistente, sin emitir su informe final; tampoco puede probar la mutación de inventario con esa ancla. No ejecuté el runner, sus baselines ni sus escrituras. No cuento esa aserción de setup como una mutación detectada, ni como un defecto del handoff o del estado de inventario. La restauración en finally es un control correcto, pero no produce la evidencia faltante.

**Owner/acción concreta:** #150, con contratos de #145/#147. Adaptar las mutaciones a la fuente final conservando las propiedades que deben romper, la atribución a pruebas de comportamiento y la restauración. Los 47 negativos del contrato de interfaz son otro harness y no prueban este comando del servicio.

## Contratos y evidencia reconciliados por owner

| Owner | Inspección y resultado acotado | Límite que permanece |
| --- | --- | --- |
| #144 | Módulos/rutas/assets y main/preload: allowlist local exacta, CSP sin red del renderer, frame principal y documento exacto con fragmento, aislamiento, handles opacos. Navegación/breadcrumb/rail contrastados con fuentes y evidencia. | No inspección visual propia ni nueva medición de accesibilidad humana. |
| #145 | Catálogo puro de seis perfiles, selección por proyecto, recetas por enfoque, legacyRead y rechazo de foco ajeno. Evidencia CI de 22 casos históricos conserva sus bytes. | F1: el consumidor de pruebas instalado no migró sus escrituras. |
| #146 | Guardado acotado en datos de app; flush previo a cierre y suspensión A antes de abrir B; fallo de save conserva estado; cambiar carpeta no sobrescribe elecciones explícitas. Evidencia CI de aislamiento: 10/10, ambos movimientos, sin fallos. | Recorrido REAL del mantenedor pendiente; no lo sustituye esta lectura ni los fixtures. |
| #147 | Preview/apply por etapa, handles y planes frescos, cancelación/retry, resultados derivados de status/stageReport, snapshot revisado del handoff y rechazo de drift. El prompt separa listo/pendiente y no atribuye lectura a abrir IA. | Matriz browser Software quick termina expresamente en environment-unavailable; no acredita entorno real. Software A/B con propia IA sigue pendiente. |
| #148 | Vista de gestión aceptada conservada; duplicar reutiliza respuestas mediante nuevo selector/plan, quitar cambia historial y veredictos sin borrar proyecto. Lista con presupuesto por fila y timeout honesto. | Aceptación de vista no es sesión humana de todos los flujos ni prueba instalada. |
| #149 | Continuidad de superficies aceptadas y sus condiciones; feedback de copia después de IPC, reduced-motion y movimiento finito respaldados por harness vigente. | No repetir ni inventar lectores. FAQ/Privacidad no aprueba el producto entero. |
| #150 | Required incluye companion-electron y rechaza resultados no success; artefactos retenidos; rutas/celdas y negativos actuales comparados por identidad. | F1/F2 abiertos; revisiones 5706/429c y sus mutaciones conservan autoría propia. Esta revisión no ejecuta otro protocolo completo. |

No encontré un camino nuevo confirmado que permita al renderer elegir ejecutables, roots, URLs arbitrarias o sustituir la elección desktop por web. La copia pasa por main y se confirma tras su resultado. Es una conclusión del trazado acotado, no una certificación de todos los inputs o carreras posibles.

## Resultados retenidos: ejecución ajena inspeccionada

Leí por `read_codex_security_artifact` standalone persistent, con el targetPath anterior, los raws originales core-result, companion-result, companion-serial-result, stage-result-v2, approved-documentation-checks y spec-approval-f9ed23c. El índice versionado conserva sus hashes.

- Core local: límite del orquestador 360 s, sin denominador final. Companion paralelo: 254 total, 247 PASS, 2 FAIL, 4 cancelados, 1 SKIP POSIX en Windows. Companion en serie: límite global 600 s y crash/restart 91432.1905 ms fallido; reparación interrumpida 79737.7549 ms, copia canónica 60266.4678 ms y concurrentes 25040.0169 ms pasaron parcialmente. No hay denominador global serial. Ningún resultado remoto borra estos fallos ni demuestra su causa.
- Strict 28/28 y docs/neutrality/deuda read-only constan PASS en los raws aprobados; no los reejecuté.
- CI [43364174800](https://github.com/IgnacioBarEsp/project-engineering-os/actions/runs/43364174800): leí run/jobs, cinco logs relevantes, reconciliación, JSON browser/Electron e índice de ZIP. Son 12 jobs success, incluido required. El log Windows22 conserva core 409/409; Companion Windows 254 total/253 PASS/1 POSIX SKIP, cero FAIL/cancelados, crash/restart 58089.7313 ms. Es otro entorno, no diagnóstico de los timeouts locales.
- Matriz actual: cotejé las 72 identidades exactas de 6 perfiles × 2 vías × 2 movimientos × 3 tamaños; ninguna ausente, extra o duplicada. El JSON declara 534 pantallas principales; las ocho observaciones adicionales llevan el total de entradas de pantalla a 564. No confundo esos denominadores. Entre todas esas entradas: controles mínimos 7, nodos de movimiento mínimos 177, elementos posicionados mínimos 1; issues vacíos.
- Rutas actuales: 20 identidades × 2 movimientos × 3 tamaños = 120 celdas únicas, 181 observaciones; 16 negativos con detección de su propiedad. Dos negativos comparten la etiqueta motion-duration y ejercitan casos diferentes; no los presento como 16 IDs únicos.
- Contrato de interfaz: 47/47 IDs de mutación detectados, 1/1 construcción, cero findings; wizard 402/402 controles; las detecciones no se atribuyen a timeouts. Wizard general: 28 recorridos, 168/168 pantallas, 1876/1876 controles y 56/56 copias exactas. Son evidencia ejecutada por CI inspeccionada por este revisor.
- Electron de CI: 18 capturas y 12 lecturas exactas de clipboard, cero errores, fuente limpia del commit de prueba con árbol igual. No es instalador ni prueba de herramientas administradas. No abrí esas imágenes para juicio visual propio.
- Artefacto 0.3.7: leí source/summary/verification; copia limpia identificada de e713, verificación de contenido PASS 2590 archivos empaquetados/2662 instalados/151 dependencias, firma observada NotSigned; SHA del EXE `63754b6a9311ef45ecabe2968265cbb7bbb4a6ca58a3beb8a599934b89bec499`. npm oficial 11.21.2 y árbol `5f3ed5146082cfcb794ebb8fe6c1d8cc58b336aec26e3df0f871823c1758ec82` permanecen según la verificación; no reabrí la revisión de npm.
- VM: `vm-e713/packaged-runtime.json` registra PASS parcial de runtime/actualización 0.3.6/reparación/cancelación/crash/restart y npm con tres Nodes. El ciclo canónico posterior es FAIL por F1. Ni aquel PASS parcial ni build/verifier PASS equivalen a cualificación completa del instalador.

## Qué ejecuté y qué no

Propio: lecturas de archivos, diff/listado/show/rev-parse/status de Git, consulta de issues, lectura de evidencia persistente, comparación de identidades/denominadores en memoria y **un único probe puro breve** con Node para F1 y F2. Exit 0 del probe; no crea instancia de servicio ni motor, no escribe en el repo, no lanza servicios, red, descargas o instalador. Comando exacto/salida/raw en `artifacts/wave3-current/independent-final-integration-probe.json`, SHA-256 `b6c501e6942e63ecb63ab871d24080e9b86ab0882e20161b7149eb6776c3ad01`.

`git diff --check BASE HEAD` propio terminó exit 1 por una línea vacía al EOF de `openspec/changes/companion-project-screen-redesign/evidence/disclosure-ci-correction-20260930.md:19`. Lo retengo como diagnóstico de formato; no demostró impacto funcional y no lo elevo a hallazgo de producto. Status final sigue vacío y HEAD sigue e713.

No ejecuté install, build, npm/check/test, suites, scripts mutantes, doble ensayo histórico, Electron, VM, instalador, auditoría de npm ni pruebas repetidas de copia/recovery. No edité código/tests/locks/deps/readiness/git, no hice reset/stash/cleanup de junctions, no cambié timeouts/política/protecciones. No introduje dos mutaciones propias ni atribuyo a esta revisión las de 5706/429c; el mandato aprobado de este pase es la integración final acotada, no la repetición completa de EVALUATION. No hice recorridos humanos o aceptación visual.

## Gates restantes y deuda

Comparación propia de Git: 77 assessments de la base conservados; 17 assessments históricos de la pila añadidos, 94 totales; registry sin cambios respecto de base. No recapturé deuda, no cerré ninguno de los 36 abiertos de #206 ni realicé el assessment oficial de cierre. F1/F2 se entregan para decisión y trazabilidad por owner.

Quedan F1/F2, reconciliación de la cualificación y fallos locales, observaciones reales #146 y Software A/B #147, assessment de cierre, readiness aplicable, archivo oficial en orden y PR protegido de cierre. CI verde de e713 no es verde de un eventual head corregido/archivado. Una corrección posterior requiere revisar su diff y evidencia afectada; **ningún SHA posterior queda aprobado automáticamente por este informe**.
