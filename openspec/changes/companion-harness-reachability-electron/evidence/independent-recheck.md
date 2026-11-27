# Revisión independiente de correcciones — ola 3

Informe final del pase independiente, 2026-09-27 UTC. Correcciones verificadas; aceptación humana/integración siguen fuera de este resultado.

## Identidad, alcance y versiones

Revisor: agente Codex separado `/root/bugbot`, alternativa explícita al lanzador especializado no disponible. **Esta ejecución no pertenece al servicio Bugbot.** No implementé las correcciones, no delegué el pase y no modifiqué el árbol versionado, GitHub, readiness ni PRs. No inicié ola 4. Se aplicó la revisión estructurada de correctness/regresiones del skill `engineering:code-review`; el mecanismo especializado de `review-bugbot` no estaba disponible y no se fingió su uso.

- Repositorio: `C:/Users/RitualDesktop/.codex/worktrees/wave3-harness/project-engineering-os`.
- Alcance acumulado: #144–#150, PRs #196–#202; base por defecto `origin/main`, merge-base `9751c301976fe27e9bbad33e69f39372b69f901e`. No se limitó el análisis al último PR apilado.
- Primera revisión independiente: `82c88d16a12da0dfef377952c29abdfdfa1b8145`, conservada en `C:/Users/RitualDesktop/AppData/Local/Temp/peos-wave3-independent-a8cc7725-ed23-49b8-a1e3-7761970516f6/independent-review.md`.
- Producto corregido ensayado en esta sesión: **`79a678b892ba3577dd403942823797799055f380`**, árbol limpio. Ensayos propios entre 2026-09-27 17:29:13Z y 17:35:41Z.
- Head posterior revisado estáticamente: **`8072df1d3e067a82ce0a470bdea20cf0766785b7`**, árbol limpio. El delta desde 79a678b consta únicamente de `scripts/verify-ui.mjs` y evidencia de #147. Se verificaron por Git los mismos árboles `ui`, `desktop`, `engine`, `context`, `runtime`, manifiestos y lockfiles. No se renombraron las capturas de 79a678b como si fueran tomadas en 8072df1.
- Windows NT 10.0.26100, x64; Node del runner 24.18.0; Electron real 44.1.1 / Chromium 152.0.7977.65 / Node embebido 24.19.0; browser renderer Microsoft Edge 154.0.4258.37. App 0.3.6 desde fuentes, no instalador publicado.

Se leyeron AGENTS.md, README.md, CONTRIBUTING.md, OWNERSHIP.md y EVALUATION.md. Se revisaron especialmente el guardado/suspensión/restauración del wizard, selección canónica aislada por proyecto, compatibilidad de recibos antiguos, recetas persistidas y la integración del harness tras conservar elecciones explícitas.

## Resultado propio y casos originales

**Los cuatro defectos originales no se reproducen en el producto corregido. No hay nuevos hallazgos P0–P3 confirmados en este pase.** Esto no significa ausencia demostrada de todo defecto. El estado de aceptación total del protocolo se detalla por ámbito abajo.

| Caso / prioridad anterior | Frente de origen y corrección | Ubicación actual | Reprueba independiente y resultado |
| --- | --- | --- | --- |
| R1 / P1: otro proyecto sustituía el borrador | #146 / PR #198; corrección 428c0e9 | `apps/companion/ui/screens/wizard.mjs:17` y `workspace.mjs:10` | Crear A en Visión con objetivo/texto; abrir B preparado desde la lista; volver a Preparar. A mantiene carpeta y respuestas; la llamada de cierre guarda A. Además, en Electron real: cerrar mientras se muestra B, reabrir y Continuar borrador restaura A exactamente, sin escribir en la carpeta A. PASS. |
| R2 / P2: selección heredada recibía foco ajeno y luego fallaba su etiqueta | #145 / PR #197; corrección 887e885 | `apps/companion/ui/screens/workspace.mjs:12`, `ui/lib/core.mjs:121`, `ui/screens/reviews.mjs:6` | Construir recibo/historial/journal válidos con perfil histórico `general` sin foco, desde renderer cuyo default es software; abrir y Revisar tus elecciones otra vez. Selección de trabajo `personal/open`, objetivo original, revisión de archivos visible, sin FOCUS_INVALID ni TypeError. PASS. |
| R3 / P2: RECIPES.md ignoraba foco | #145 / PR #197; corrección 887e885 | `apps/companion/context/engine.mjs:191`, `context/recipes.mjs:25` | Preparar base/contexto reales para `software/game`; leer el archivo escrito y comparar TODOS sus IDs con `service.workspace().recipes`. Incluye `software-game-0`, no `software-open-0`, listas idénticas. PASS. |
| R4 / P2: elegir carpeta reemplazaba perfil explícito | #146 / PR #198; corrección 428c0e9 | `apps/companion/ui/screens/wizard.mjs:99` | Seleccionar business y después carpeta que contiene `paper.tex`. El radio sigue business; la recomendación no sustituye la elección. PASS. |

Las cuatro reproducciones derivan del script del revisor anterior, **no** de los nuevos tests escritos por el implementador. `targeted-results.json` conserva entradas/salidas y fixtures sintéticos; `native-isolation.json` registra el caso nativo adicional R1. Los criterios de producto se verificaron con valores, rutas y contenido persistido; no se deducen solo de exit code cero.

### Intentos fallidos del test propio, conservados

Los intentos 1 y 2 de `recheck-originals.mjs` terminaron con exit 1: comparaban el snapshot persistido tomado antes de la navegación (objetivo/visión todavía vacíos) con el guardado posterior, que contenía correctamente las respuestas recién escritas. El segundo intento añadió polling, pero retuvo la misma comparación inválida. No son un fallo de conservación del producto: el valor observado al final era el esperado por la persona. El intento 3 compara la selección real del renderer antes de navegar con la restaurada/persistida después, que es el invariante R1. La prueba adicional de cierre/reapertura nativos verifica de forma independiente que ese resultado llega al disco. Se conservan ambos scripts anteriores, logs, registros de comando y `targeted-results-attempt1/2.json`; no se borraron para presentar una ejecución perfecta.

## Comandos ejecutados por este revisor

`OUT` en esta tabla es `C:/Users/RitualDesktop/AppData/Local/Temp/peos-wave3-recheck-358f5a66-394a-4ba5-b3d2-8c9fc3bd6d73`. CWD de los ensayos: `.../project-engineering-os/apps/companion`. `run.mjs` solo registra stdout/stderr, comando exacto, UTC y exit code; no cambia el producto.

| Comando real hijo | Exit | Resultado / artefactos |
| --- | --- | --- |
| `node scripts/verify-electron.mjs OUT/electron` | 0 | 18 capturas, 12 lecturas exactas `clipboard.readText()` en main, 0 fallos. `electron-command.json`, `electron.log`, `electron/electron-evidence.json`. |
| `node OUT/recheck-originals.mjs` intento 1 | 1 | Snapshot esperado desactualizado del test; `original-cases.log` y `targeted-results-attempt1.json`. |
| mismo comando, intento 2 | 1 | Mismo límite del test; `original-cases-attempt2.log` y `targeted-results-attempt2.json`. |
| mismo comando, intento 3 | 0 | Cuatro casos corregidos, `original-cases-attempt3.log`, `targeted-results.json`. |
| `node scripts/verify-electron-draft.mjs` | 0 | Cierre nativo inmediato sin esperar debounce guarda las últimas respuestas; reapertura las restaura; borrador corrupto bloquea cierre sin sustituir bytes/respuesta. `native-close.log`. |
| `node OUT/mutations.mjs` | 0 | Dos mutaciones propias detectadas y restauradas, con sus seis capturas. `reviewer-mutations.json`, `mutations.log`, dos `.diff`. Exit 0 significa que se comprobó el fallo esperado de cada propiedad, no que la app mutada pase el contrato. |
| `node OUT/native-isolation.mjs` | 0 | A→B→cierre nativo desde B→reapertura→continuar A; originales intactos. `native-isolation.json`, `native-isolation.log`. |
| `node OUT/summarize.mjs` | 0 | Cotejo de SHA/árbol limpio, equivalencia de producto, celdas y denominadores aportados, hashes de capturas y reutilización histórica. `observed-recheck.json`. |

Los ficheros `*-command.json` contienen tiempos y argumentos absolutos. No quedan procesos propios en ejecución.

## Cobertura nativa propia y procedencia

El ensayo real Electron recorrió Inicio, Tu proyecto y resultado para 1180×820, 1024×700 y 480×540, tanto movimiento normal como reducido. Viewports medidos: 1164×755, 1008×635 y 464×475, DPR 1. Fuente SHA-256 registrada: `09d4216d5375db14ab484228d8fc95bf4a59081527af5522c5c824d8d8b3dfbd`.

Los denominadores por captura están en `observed-recheck.json`: 4–11 controles alcanzados en estas pantallas, 252–327 nodos/pseudoelementos de movimiento medidos, 1–3 elementos posicionados. Se ejecutaron las pruebas de scroll final, controles inferiores y teclado incluidas en el harness; las copias de ruta e instrucción se compararon contra su contenido exacto desde el proceso principal, no contra la etiqueta «Copiado».

Se validaron 27 registros propios `.png.provenance.json`: 18 nativos + 3 casos originales + 6 mutaciones. Hash, longitud, dimensiones PNG y commit coinciden. Inspección visual del agente: `home-1180-no-preference.png`, `step-1-480-no-preference.png` y `finished-480-reduce.png`. Es inspección de artefactos por un agente, **no aceptación visual humana** ni prueba del instalador.

## Mutaciones propias nuevas

Las mutaciones se aplicaron únicamente a respuestas HTTP servidas en memoria en una instancia de prueba, sin editar fuentes ni proyectos personales. Cada fase usó un contexto de navegador nuevo y baseline/restauración sin la sustitución. Renderer real, respuestas de servicio fijas; spy de IPC en la mutación de copia, no portapapeles nativo (este se ensayó aparte).

1. `reviewer-rare-route-nav`: en la ruta poco visitada `context-final`, sustituir el destino activo por `open-help`. Baseline y restaurado sin issues; mutado produce `route-nav`. Diff y tres capturas originales guardados.
2. `reviewer-copy-without-ipc`: eliminar `await call('copyText',{text})` del componente. Baseline/restaurado reciben el payload exacto; mutado muestra «Copiado» pero el spy recibe cero llamadas. La aserción de transporte detecta la propiedad rota. Diff y tres capturas guardados.

IDs declarados = intentados = detectados, dos conjuntos idénticos. No se basa la aceptación en un contador fijo de mutaciones.

## Suites del implementador: inspección independiente, no ejecución propia

Directorio aportado: `C:/Users/RitualDesktop/AppData/Local/Temp/project-os-closeout/wave3-review-fixes`.

- `final-browser-resumed/profile-matrix.json`: las 72 combinaciones esperadas de software/research/studies/content/business/personal × quick/ai × no-preference/reduce × 1180×820/1024×700/480×540 están presentes, sin duplicadas ni ausentes; 534 pantallas, cero errores; 8 casos extra de reinicio/carpeta existente. Mínimos observados de matriz: 4 controles, 252 nodos de movimiento, 1 elemento posicionado. Esto es PASS **de la matriz**, no de aquella invocación global: su posterior recorrido general falló.
- `final-contract-resumed/interface-contract.json`: 46/46 mutaciones detectadas, 1/1 comprobación de construcción, 6 recorridos/36 pantallas de wizard, 408/408 controles alcanzables, 0 hallazgos. Denominadores de contraste por pantalla: Inicio 36, Ayuda 88, asistente 38, lista 33, proyecto 71, IA 55, tecnología 23. Los denominadores completos y casos de copia aceptada/rechazada/fallo de transporte están preservados.
- El padre/implementador comunicó `npm test` de Companion 215/215, exit 0; `npm run check` raíz 391/391, exit 0; OpenSpec strict 27/27. No ejecuté esas invocaciones en este pase ni recibí logs completos; no las atribuyo como propias.
- `node scripts/verify-ui.mjs .../final-ui-native-pending`, sobre 8072df1: el padre comunicó exit 0. Inspeccioné los JSON finales. `wizard-reach.json`: 28 recorridos, 168/168 pantallas, 1904/1904 controles y 56/56 copias exactas, cero problemas. `browser-evidence.json`: siete variantes heredadas en ambos movimientos, duplicación, recuperación, segunda lectura, búsqueda/citas/exclusiones/handoff; originales conservados; 72 comprobaciones modales; estado incompleto explícito para software/unity sin runtime. Contraste en el recorrido general: 18–102 elementos por pantalla; vocabulario 492–4006 caracteres; 6–36 controles. No es una instalación nativa.
- `declared-routes/route-coverage.json`: importé la tabla actual `ROUTES` y cotejé sus 20 IDs × 2 movimientos × 3 tamaños contra los registros, no solo contra el total publicado. 120/120 celdas presentes, ninguna ausente; 14 controles negativos con detección registrada. Mínimos: 6 controles globales, 165 nodos/pseudoelementos de movimiento, 1 elemento posicionado. `endControls=0` en estados sin acciones internas no se vende como cobertura del contenido: conexión fallida conserva controles globales; los diálogos se comprueban en su ámbito modal, no en el fondo bloqueado.
- `profile-compatibility/profile-compatibility.json`: completed=true, 22 casos (11 variantes × 2 movimientos), cada uno revisa 5 archivos y conserva los cuatro registros persistidos comprobados. Incluye siete alias antiguos, software/research sin foco, subtipo Aplicación móvil y research/paper. `wizard-isolation/wizard-isolation.json`: completed=true, 10 casos (cinco IDs × 2 movimientos), todos passed=true y failures=[]: cambios A/B desde pasos 2/3, error al guardar, entrada por carpeta conocida y preservación de elecciones de carpeta/foco/stack.

El fallo intermedio del harness era su expectativa de instalación nativa en un fixture con `environment:null`: tras R4, software ya no se convertía silenciosamente a personal al elegir carpeta. El cambio 2e5a6c6, propagado hasta 8072df1, usa la vía de entorno no disponible limitada por el helper y exige que ocurra solo en quick, que environment no esté ready y que aparezca «Qué queda pendiente». Se revisó el delta; no permite presentar una etapa no ejecutada como lista.

## Evidencia histórica reutilizada justificadamente

No se repitió `verify-historical-pair.mjs`. Se conserva la ejecución **propia anterior**, exit 0, 2026-09-27 14:44:23Z–14:44:52Z, en el directorio de la primera revisión. Usa bytes inmutables `git show` de `a3b1efda6a53501a2a06e277cf0b7f18f11c6bed` y `c044d2d241db152e9d14efaee15595aab494d448`.

La comparación Git de blobs confirma sin cambios desde la primera revisión: script histórico, fixtures de servicio, catálogo de perfiles que importan, probes de interfaz/calidad y lockfile. `observed-recheck.json` guarda cada blob y el SHA-256 del artefacto histórico. Reutilización limitada a esta comparación histórica; **no** se presentan las matrices viejas del producto anterior como pruebas de los bugs corregidos.

Son seis celdas por versión: la defectuosa arroja 90 incidencias, con dos recorridos detenidos conservados; el hotfix arroja cero y 12 copias exactas por spy. No certifica transporte nativo histórico, instalador ni requisitos de taxonomía/tokens nacidos después del hotfix.

## Límites y estado del protocolo

- PASS propio: revalidación R1–R4; regresión de cierre inmediato, borrador inválido y aislamiento A/B nativo; Electron de fuentes con copia exacta; dos mutaciones propias; integridad de capturas.
- PASS reutilizado con justificación: comparación histórica inmutable. Matriz y contrato actuales: inspeccionados de ejecución del implementador, claramente separados.
- No ejecutado por este revisor en este pase: reinstalar con `npm ci --ignore-scripts` y `runtime:install` (se reutilizaron las dependencias y runtime existentes, sin reinstalarlos); suites completas de matriz/UI/contrato y npm test (reparto de trabajo explícito con el padre). Por tanto, no afirmar que este agente ejecutó desde cero cada paso del protocolo.
- No disponible en este pase: instalador/reinstalación/desinstalación, Windows limpio, proveedores/motores/modelos externos reales, prueba de distribución. Las carpetas de prueba son sintéticas y acotadas; no se usaron datos privados.
- No medido: ahorro de tokens/costo, rendimiento humano, inferencia de modelos o benchmark de respuestas, calidad de uso con personas. No se simularon las dos lecturas humanas de #149, aprobación del mantenedor ni aceptación visual.
- CI ajena y autorrevisiones anteriores no son ejecución propia. Este archivo local no se adjuntó a GitHub, issue ni change por falta de autorización para publicarlo. No constituye archivo OpenSpec, merge, certificación de release ni aprobación humana.

Veredicto: **R1–R4 corregidos y revalidados; cero nuevos hallazgos P0–P3 confirmados.** La revisión de código es favorable para el head 8072df1 dentro del alcance descrito. La evidencia propia nativa sigue atribuida exactamente a 79a678b y su reutilización para el producto idéntico de 8072df1 está demostrada por blobs. El cierre total de aceptación debe conservar los ámbitos humanos/integración pendientes en lugar de transformar este resultado acotado en «protocolo completo PASS».
