# Revisión independiente de la ola 3 — Handoff #167

Revisor: agente Codex separado del implementador, alternativa explícita al lanzador especializado Bugbot, que no estuvo disponible. No se atribuye esta ejecución al servicio Bugbot. Fecha: 2026-09-27 UTC.

SHA revisado: `82c88d16a12da0dfef377952c29abdfdfa1b8145`, rama `codex/150-harness-electron`. Base por defecto y merge-base: `origin/main`, `9751c301976fe27e9bbad33e69f39372b69f901e`. Diff acumulado de la ola 3, no solo el último PR: 227 archivos, 23 598 inserciones y 2 507 eliminaciones. Árbol limpio al comenzar. La base local se resolvió mediante `refs/remotes/origin/HEAD`; no se hizo fetch ni se atribuye frescura remota adicional.

Repositorio: `C:/Users/RitualDesktop/.codex/worktrees/wave3-harness/project-engineering-os`.

## Veredicto de producto

**FAIL: cuatro regresiones reproducidas, una P1 y tres P2.** Las comprobaciones existentes que pasan se registran por separado; no eliminan estos incumplimientos del producto. No se implementaron arreglos, no se publicaron comentarios ni aprobaciones, no se modificaron readiness ni archivos versionados, no se archivaron changes, no se hizo merge y no se inició la ola 4. No existe reprueba de un SHA corregido.

| ID | Prioridad | Localización actual | Frente de origen |
| --- | --- | --- | --- |
| R1 | P1 | `apps/companion/ui/screens/wizard.mjs:8` y `:26`; interacción con `apps/companion/ui/screens/workspace.mjs:10` | #146, commit `c43c5ab5`, persistencia del asistente; recorrido integrado con proyectos |
| R2 | P2 | `apps/companion/ui/lib/core.mjs:121–123`; `apps/companion/ui/screens/workspace.mjs:10`; segundo bloqueo en `apps/companion/ui/screens/reviews.mjs:6` | #145, commit `e641c63e`, taxonomía/migración de perfiles; lectura de proyectos existentes |
| R3 | P2 | `apps/companion/context/engine.mjs:191`, consumidor de `apps/companion/context/recipes.mjs:18–22` | #145, commit `e641c63e`, recetas por enfoque; se dejó el consumidor anterior pasando solo el perfil |
| R4 | P2 | `apps/companion/ui/screens/wizard.mjs:94–96` | #146, commit `c43c5ab5`, selección de carpeta del asistente unificado |

El origen se determinó con `git blame` y el diff acumulado. Los frentes #145/#146 corresponden a la cadena entregada para revisión (#196–#202); no se infiere que líneas trasladadas por modularización sean por sí solas la causa original.

### R1 — Aislar el borrador de la selección del proyecto abierto

El borrador se construye directamente de `state.selection` y `state.project`, pero `openProject()` reemplaza ambos con el proyecto consultado y deja `wizardActive=true`. `startSetup()` ve ese flag y vuelve al mismo paso con los datos del proyecto B. El hook de cierre persiste esa selección encima del único borrador de A. Se pierden las respuestas guardadas de A por una navegación normal, sin que la persona haya elegido descartarlas.

Reproducción ejecutada con renderer y servicio reales, picker/IPC inyectados, en carpetas sintéticas:

1. Preparar B como proyecto personal y dejarlo en el historial.
2. Comenzar el asistente para una carpeta distinta A, llegar a Visión, escribir `Draft A objective that must survive` y `Draft A original answers`; dejar terminar el guardado.
3. Abrir Tus proyectos, abrir B y pulsar Preparar proyecto.
4. Se vuelve a Visión con `Prepared B objective`, `Prepared B original vision` y la carpeta B; `wizardActive` sigue siendo true.
5. Ejecutar el hook de producción `companionBeforeClose()` y leer el borrador a través del servicio: ya apunta a B y contiene las respuestas de B. En este caso dirigido se invocó el hook desde el navegador; no se simuló como cierre nativo de Electron.

Esperado: conservar la identidad y las respuestas del borrador A al consultar B. Observado: sustitución duradera de A por B. Impacto: pérdida de respuestas y continuación de la preparación en una carpeta diferente a la del borrador.

Evidencia: `targeted-results.json`, caso `draft-cross-project`; `draft-cross-project.png` y su `.provenance.json`; fixture preservado bajo `fixtures/`. Reproducción autónoma: `node reproduce.mjs`.

### R2 — Resolver los perfiles históricos desde su propia selección

Al abrir una selección histórica sin `focus`, el merge con `state.selection` conserva el foco inicial `website`. `canonicalProfile()` prioriza ese foco por encima del mapeo de `general` a `personal/open`. Al intentar actualizar un inventario obsoleto, el servicio recibe `personal/website` y rechaza con `FOCUS_INVALID`. No hay un editor de enfoque en este recorrido que permita subsanar el error.

Reproducción ejecutada:

1. Crear un fixture consistente de proyecto/receipt/journal con el perfil histórico `general`, sin `focus`, y hashes coincidentes; el historial conserva la misma selección. Es un fixture sintético con forma 0.3.x, no una instalación histórica real.
2. Añadir un archivo para desactualizar el inventario.
3. En una sesión nueva del renderer, abrir el proyecto y pulsar Revisar tus elecciones otra vez.
4. La pantalla muestra «Elige un enfoque que pertenezca a este tipo de proyecto», código `FOCUS_INVALID`; la selección en memoria es `general/website`.

Se aisló además el siguiente obstáculo, sin editar fuentes: tras eliminar solo el foco heredado en memoria, `resaveBase()` llega a `showBaseReview()` y falla con `Cannot read properties of undefined (reading '0')`, porque `profiles` contiene solo identificadores canónicos y la vista usa `profiles[s.profile][0]` con `general`.

Esperado: vista/revisión canónica de Personal y laboratorio / Otro proyecto personal, conservando los bytes históricos hasta aplicar un plan. Observado: no se puede entrar en la revisión para refrescar el proyecto. Impacto: bloqueo de actualización de proyectos históricos admitidos; corregir únicamente el foco todavía deja roto el lookup de etiqueta.

Evidencia: `targeted-results.json`, caso `legacy-resave`; `legacy-resave.png` y procedencia. El estado posterior a eliminar el foco se etiqueta como aislamiento diagnóstico en el JSON, no como navegación normal.

### R3 — Propagar el enfoque a RECIPES.md

`recipesFor()` ahora resuelve perfil y enfoque, pero el motor de contexto sigue llamando `renderRecipes(selection.profile)`. Esto fuerza el enfoque predeterminado al escribir el archivo durable que MAP.md indica leer al agente. El servicio de la pantalla Recetas sí pasa la selección completa, por lo que la UI y el resultado escrito divergen.

Reproducción ejecutada con el servicio real:

1. Preparar base y contexto con `profile=software`, `focus=game`.
2. Leer `.project-os/companion/context/RECIPES.md` y consultar `service.workspace()`.
3. El archivo tiene `software-open-0`; la pantalla/servicio tiene `software-game-0`. El archivo no contiene la receta de videojuego.

Esperado: el mismo enfoque y método en la pantalla y en el archivo entregado a la IA. Observado: el archivo prescribe exploración abierta en lugar de comprobar compilación, consola, escena y ejecución con un editor compatible. Afecta cualquier enfoque que no coincida con el predeterminado del perfil. Incumple los escenarios de recetas diferenciadas de la spec #145.

Evidencia: `targeted-results.json`, caso `focus-recipes`, y el archivo original conservado en la ruta del fixture declarada allí. La línea del consumidor preexistía; el defecto se introduce al ampliar la semántica de recetas a perfil/enfoque sin actualizar ese consumidor.

### R4 — No sustituir una elección explícita con la recomendación de carpeta

El callback de Elegir/Cambiar carpeta asigna siempre `s.profile`, `s.focus` y reinicia el stack a partir del inventario. No distingue un valor inicial de una selección explícita de la persona. La spec #145 dice expresamente que la recomendación no debe reemplazar esa elección; la implementación anterior mostraba la sugerencia y mantenía el perfil seleccionado.

Reproducción ejecutada con renderer y servicio reales:

1. Entrar a Preparar proyecto y marcar Trabajo y negocio (`business`).
2. Elegir una carpeta sintética que contiene `paper.tex`.
3. El radio seleccionado pasa automáticamente de `business` a `research`.

Esperado: mantener Trabajo y negocio y mostrar Investigación como orientación. Observado: se cambia y persiste otra respuesta; al cambiar una carpeta de un borrador avanzado también se reinician enfoque y tecnologías elegidas. Impacto: preparación y prompts para un tipo de trabajo distinto al elegido, y pérdida de decisiones al cambiar la carpeta.

Evidencia: `targeted-results.json`, caso `explicit-profile-overridden`; `explicit-profile-overridden.png` y procedencia.

## Entorno y alcance real

- Windows `Microsoft Windows NT 10.0.26100.0`, arquitectura x64; Node `v24.18.0`, Electron fijado e instalado localmente `44.1.1`, Edge `154.0.4258.37`.
- Se reutilizaron las dependencias y el runtime Electron existentes. No se ejecutaron `npm ci`, `runtime:install`, instaladores de la aplicación ni descargas de toolchain/modelos; por tanto no es una preparación de dependencias desde cero ni Windows limpio.
- Hash de `apps/companion/package-lock.json`: `22a733b21c0f69954b38061b8e77282542016bcd2b6da2a48157cfc75efdf785`.
- Hash de `package-lock.json`: `a998d349598124aa401f744750be7edd14ab6eb15c554096608755059bd641dc`.
- Leídos AGENTS.md, README.md, CONTRIBUTING.md, OWNERSHIP.md, EVALUATION.md y specs pertinentes. Inspección adversarial focalizada en transporte/identidad, persistencia de borradores, rutas, selección y taxonomía, preparación transaccional, contexto/recetas y evidencias/CI del diff completo. No se afirma una lectura manual exhaustiva de las 23 598 líneas añadidas de artefactos y JSON.
- Los cuatro fallos tienen reproducción dinámica propia. Los hallazgos no se dedujeron de CI ajena ni de autorrevisiones previas. No se llamó a personas ni proveedores externos.

## Comprobaciones ejecutadas

Los cinco procesos del protocolo terminaron con exit 0 entre 14:34:25 y 14:44:52 UTC. `run-checks.mjs` conserva los comandos exactos, cwd, fechas, códigos y logs sin atribuirse ejecuciones de CI. La evidencia automática que pasa no cambia el veredicto de producto anterior.

| Comando desde `apps/companion` | Resultado propio | Evidencia y límites |
| --- | --- | --- |
| `node scripts/verify-wizard-flow.mjs <evidencia>` | PASS, exit 0 | 72 celdas perfil/vía/movimiento/tamaño; 8 casos adicionales; 534 pantallas; 0 errores. Renderer y servicios reales, transporte nativo inyectado. `wizard-flow.log`, `wizard-flow/profile-matrix.json`. |
| `node scripts/verify-ui.mjs <evidencia>` | PASS, exit 0 | 28 recorridos adicionales del asistente, 168 pantallas, 1708/1708 controles alcanzables, 56/56 payloads de copia exactos; recorridos de proyecto, búsqueda, recuperación y handoff en ambos modos. 20 rutas declaradas × 2 movimientos × 3 tamaños = 120 celdas y 14 controles negativos. `ui.log`, `ui/browser-evidence.json`, `ui/declared-routes/route-coverage.json`. |
| `node scripts/verify-interface-contract.mjs <evidencia>` | PASS, exit 0 | 46/46 mutaciones existentes detectadas; baseline sin hallazgos; 372/372 controles del asistente alcanzables. Respuestas de servicio fijas, no instalaciones. `interface-contract.log`, `interface-contract/interface-contract.json`. |
| `node scripts/verify-electron.mjs <evidencia>` | PASS, exit 0 | Aplicación fuente real en Electron, userData y LOCALAPPDATA aislados; picker nativo inyectado. 18 capturas, 12 textos exactos contrastados con `clipboard.readText()` del proceso principal, 0 fallos. `electron.log`, `electron/electron-evidence.json`. |
| `node scripts/verify-historical-pair.mjs <evidencia>` | PASS del detector, exit 0 | Bytes inmutables por `git show`: 6 recorridos de a3b1efd con 90 observaciones de problemas; 6 de c044d2d con 0. La versión defectuosa no se declara PASS de producto. `historical-pair.log`, `historical-pair/historical-pair.json`. |

La comprobación independiente `node summarize.mjs` enumeró cada celda esperada, no solo los totales: 12 por cada uno de los seis perfiles, **0 celdas ausentes**, y las 120 combinaciones de las 20 rutas exportadas por `router.mjs`, **0 rutas/celdas ausentes**. El resultado y los identificadores de los 14 controles negativos están en `observed-coverage.json`.

Denominadores observados: matriz de perfiles, 4–18 controles de alcanzabilidad por pantalla, 252–519 nodos/pseudoelementos de movimiento y 1–3 elementos posicionados; rutas declaradas, 6–30 controles visibles, 165–465 nodos/pseudoelementos y 1–3 posicionados. En recorridos generales: 48 nombres de pantalla, 18–102 elementos medidos para contraste por pantalla, 492–4006 caracteres de vocabulario y 6–36 controles inspeccionados. La pantalla de conexión fallida solo tiene controles globales; no se presenta como si tuviera acciones internas. Los diálogos conservan su propio alcance modal.

Electron reportó árbol limpio y hash de fuentes `061390ae52a36b2c6d78b833ccd034739176ac20ccc3c76c7f9e1010b4ca1eea`. Las ventanas exteriores 1180×820, 1024×700 y 480×540 dieron viewports reales 1164×755, 1008×635 y 464×475, DPR 1. Las 18 capturas nativas y 9 capturas propias de fallos/mutaciones tienen registros v1 validados y hashes comparados: 27/27 válidos. Se inspeccionaron visualmente por el agente la pantalla nativa Inicio a tamaño default, Resultado al mínimo y la captura del error de perfil histórico; esto no se atribuye a una persona.

Limitación relevante del harness general: sus siete variantes incluyen etiquetas `unity/media/general`, pero `verify-ui.mjs:403` las convierte a perfiles canónicos antes de preparar los fixtures. Ese PASS no prueba el recorrido de **recibos persistidos históricos** sin `focus` de R2. El ensayo de R2 ejercita esa frontera adicional.

`npm test` se ejecutó personalmente desde `apps/companion`: exit 0, 182/182 PASS, 0 FAIL, 0 omitidos, 55 155,9378 ms. La salida se observó en la sesión de herramientas; no se inventó un log íntegro posterior. Las otras ejecuciones tienen sus logs íntegros y códigos en esta carpeta.

`node reproduce.mjs`: exit 0 con cuatro aserciones de regresión reproducidas. El primer intento falló porque la prueba esperaba que el error de etiqueta fuese el primer bloqueo; el comportamiento real mostró antes `FOCUS_INVALID`. Se corrigió la expectativa de la reproducción, sin tocar producto, y se aisló después el segundo bloqueo. Las capturas se regeneraron para medir dimensiones del navegador con su API Window.

## Mutaciones propias del revisor

`node mutations.mjs`: exit 0. Se cotejan identificadores declarados, intentados y detectados en `reviewer-mutations.json`; los tres conjuntos coinciden. Son dos mutaciones propias adicionales a las 46 del harness existente. Se aplicaron solo a bytes servidos por un servidor local desde una copia en memoria; nunca a archivos versionados.

| Identificador | Alteración | Fallo observado | Restauración |
| --- | --- | --- | --- |
| `reviewer-rare-route-nav` | En `context-final`, declarar Ayuda como navegación activa | `QUALITY` devuelve `route-nav`; baseline sin issues | Nueva carga con bytes originales: sin issues |
| `reviewer-copy-without-ipc` | Retirar `await call('copyText',{text})` del botón de copia | Etiqueta Copiado visible pero 0 payloads IPC, frente a 1 payload exacto esperado | Nueva carga original: 1 payload exacto y confirmación |

Se conservan los `.diff`, JSON y capturas baseline/mutated/restored con procedencia. Este ensayo usa movimiento reducido y el probe compartido o un spy exacto de IPC; no se atribuye a estas dos mutaciones un recorrido completo ni lectura del clipboard nativo. La prueba Electron de producción se registra por separado. No se considera un timeout o una excepción como detección.

## Límites y siguiente condición de aceptación

No es lectura en frío con personas (#149), estudio de usabilidad, ensayo del instalador, aceptación humana ni certificación de release. Las herramientas de desarrollo de la vía rápida no se instalaron durante la revisión; el harness general verifica su indisponibilidad y los correspondientes pendientes. No se ensayaron todos los fallos posibles de permisos, interrupciones y sistemas de archivos fuera de los casos ya existentes y las reproducciones concretas.

Al terminar, `git rev-parse HEAD` seguía devolviendo `82c88d16a12da0dfef377952c29abdfdfa1b8145`, `git status --short` no devolvió cambios y `git diff --check` terminó en 0. Todos los procesos lanzados por este revisor terminaron; las carpetas sintéticas propias permanecen dentro de este directorio de evidencia.

Se requiere corregir R1–R4 mediante el flujo autorizado, ejecutar sus regresiones y revisar el nuevo SHA antes de declarar aceptación. Este informe no autoriza ni representa esos arreglos ni el archivo de los changes.
