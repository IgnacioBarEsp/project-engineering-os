# Cierre técnico parcial de ola3 — 2026-09-30

No es archive, integración protegida, instalador ni cierre de ola3. Mantiene el orden #144→#150 y no inicia ola4.

## Cambios y pruebas propias

Se corrigieron los dos P2 independientes de #144: cierre no vacuo de rutas declarado/renderizado y readiness visual coherente. El cierre lee las declaraciones del renderer servido y observa la ruta real con h1, estado visited, breadcrumb/nav coherentes y fuera de busy. La mutación de una ruta nueva sin recorrido falla por su nombre, nunca por excepción. Se retiraron solo dos declaraciones huérfanas de la primera capa, sin quitar pantallas/acciones.

La propagación exigió ajustes del **harness**, no cambios del producto:

- #147–#150: el nombre de fase `context` vive dentro de la ruta `install`. El walkthrough ya comprueba su heading; la cobertura cuenta `state.page` real. Mantenimiento conserva destinos esperados exactos.
- #148/#149: abrir con el summary real el plegable que contiene la revisión de tecnología antes del clic normal.
- #149: el negativo antiguo añadía prosa «OpenSpec» aunque su definición ya estaba disponible en Inicio. Se reutiliza el negativo real de #150: sustituir su control de definición por prosa. No se reduce el criterio ni se elimina un negativo.

Cada fila es una ejecución propia distinta, en checkout limpio del SHA indicado; los merges documentales posteriores no se reetiquetan como aquellas ejecuciones.

| Issue | SHA ejecutado | Rutas declaradas/renderizadas | Negativos detectados | Resultado |
| --- | --- | --- | --- | --- |
| #144 | 49378d7 con guard nuevo y árbol dirty, hashes registrados | 21/21 | 46/46 | PASS; la reprueba independiente usa fb98 limpio |
| #145 | 182aaa923acfc4e1bf9eb1d74698e98fd5f89d98 | 21/21 | 46/46 | PASS |
| #146 | 2d0690e5dbdedbddcfa5a8c1857df0224fb843d8 | 20/20 | 47/47 | PASS |
| #147 | 8c68926e7f8898dce82fc0068e09910ea43935aa | 20/20 | 47/47 | PASS |
| #148 | 94853b6dc717b572f0fb3f07e981faa61ebf2e88 | 20/20 | 47/47 | PASS |
| #149 | e3c4543527ecb7eb0809c54aa3f8ec214f4cc249 | 20/20 | 47/47 | PASS |
| #150 | b4e3e2c61e872b34ba35d394252921a1f8b0d74e | 20/20 | 47/47 | PASS |

Comando: `node apps/companion/scripts/verify-interface-contract.mjs <directorio de evidencia>`, desde cada worktree correspondiente, Node 24.18.0 en `C:/Program Files/nodejs/node.exe`. En cada PASS: exit0, cero hallazgos, 1/1 construcción separada y ruta añadida detectada sin errores de recorrido. [Extracto y hashes de los originales](route-propagation-20260930.json) conserva los primeros FAIL de fase errónea, tecnología plegada y negativo inválido, además de las repeticiones exitosas. Los originales completos siguen en Temp; no se sobrescribieron con las repeticiones.

En b4 limpio también se ejecutaron:

- `npm run check`: exit0; package, neutralidad, docs, workflows, debt y doctor baseline PASS; **391/391 tests del core**.
- `node --test apps/companion/qa/*.mjs`: exit0, **225/225**; no certifica una instalación/release.
- OpenSpec local fijo 1.6.0, `validate --changes --strict --no-interactive`: **7/7 PASS**.
- `debt check`: PASS, deuda previa 4/5 unidades; no se afirma cero deuda global.

UI, engine, context, runtime, desktop, manifiesto y lock de b4 son byte-idénticos a 799c2b6. Los merges documentales posteriores mantienen además todo `apps/companion` idéntico a b4; esto es comparación de fuentes, no otra ejecución. El cambio no altera pines, avisos/hashes de distribución, IPC, propiedad de archivos ni la reorganización aprobada de Tus proyectos.

## Revisión independiente recibida

Los informes completos del revisor separado conservan autor, comandos, SHA y límites:

- [Review integrado 799 y hallazgos de la primera capa](../../../../docs/companion/reviews/WAVE3_CLOSEOUT_20260930.md).
- [Reprueba fb98 limpia](../../../../docs/companion/reviews/FOUNDATION_RETEST_20260930.md): ambos P2 resueltos, ejecución propia 46/46 y 21/21, tres tests focalizados.
- [Layout Inicio/Ayuda fb98](../../../../docs/companion/reviews/FOUNDATION_LAYOUT_REVIEW_20260930.md): 4 tamaños × 2 movimientos × 2 pantallas, 128/128 controles, 32 originales inspeccionados. No es aprobación del mantenedor.
- [Delta estático b4 frente a 799](../../../../docs/companion/reviews/WAVE3_HARNESS_DELTA_REVIEW_20260930.md): sin hallazgos nuevos en ese alcance; **no ejecutó** el contrato de b4 ni preaprobó todos los heads.

La revisión técnica acotada de la corrección está recibida. La aceptación integral del protocolo sigue parcial; no se convierte en aprobación global mediante reutilización de resultados.

## Gates que no se simulan

Actualización del 2026-10-01: se publicará también la [corrección del recorrido de tecnología plegada](../../companion-project-screen-redesign/evidence/disclosure-ci-correction-20260930.md) en #148/#149, donde CI encontró un clic directo sobre un control oculto. Se reutiliza el helper que #150 ya tenía: sus fuentes completas siguen idénticas a 5706. Ambas repruebas propias completas terminaron exit0, incluidas compatibilidad y aislamiento; no cambia la pantalla aprobada.

Se recuperaron los [recibos de ejecución del revisor separado](independent-command-receipts-20261001.json) en su copia limpia de 5706: ci raíz/app con scripts desactivados, runtime Electron explícito, QA, matrices, UI y contrato registran exit0. Son recibos del revisor, no ejecuciones propias de root. El informe de ese ejecutor no apareció; una nueva [inspección independiente de cierre](../../../../docs/companion/reviews/WAVE3_COMPLETION_INSPECTION_20261001.md) inspecciona el HEAD limpio 429c644, comprueba bytes Companion idénticos a 5706, coteja celdas/denominadores y originales y aporta dos mutaciones propias con detección y restauración. Su veredicto no confirma nuevos P0–P3. La evidencia es compuesta y distingue ambos revisores: no se atribuyen las ejecuciones anteriores al nuevo inspector ni se certifican los heads intermedios, instalación, aceptación humana o auditoría. Esta incorporación documental no modifica automáticamente los gates de readiness ni vuelve apto el archive.

El CI protegido de 5706, run [36820222842](https://github.com/IgnacioBarEsp/project-engineering-os/actions/runs/36820222842), terminó failure: matriz raíz, auditoría raíz, Electron y las comprobaciones de interfaz pasaron; solo fallaron las tres auditorías Companion (2 high/1 moderate) y CI required rechazó la matriz. Electron conserva 18 originales y 12 copias exactas; árbol sintético 156c5b3 idéntico a 5706 y digest de fuentes 64f0494cf87577492a88ff2d16fe25cc4e9b5a91cdc82b6db505aa877613a974. Esto no se reetiqueta como CI de una cabeza documental posterior. npm oficial sigue 11.21.0/12.2.0 sin candidata nueva; #204 permanece abierto.

La [reprueba de los siete gates de archive](archive-gate-recheck-20260930.json) mantiene FAIL de forma deliberada: #144 solo por aceptación visual pendiente; #145/#146 por tarea, visual y revisión integral pendientes; #147 por visual y revisión integral; #148 por integración/tarea y revisión integral; #149 por revisión integral; #150 por integración/tarea y revisión integral. Contratos de readiness, deuda y demás validaciones pasan. El [primer gate](archive-gates-20260930.json) conserva además el estado inválido `verified` de `adversarialReview` de #144; la corrección usa `passed` como exige el esquema, mientras su evidencia usa `verified`. No se elimina el FAIL histórico ni se marca archive apto.

Las dos lecturas confirmadas de Inicio/paso1, la observación del control renombrado, la aceptación de Inicio y la aceptación condicionada de Archivos mantienen el alcance literal de #149. No hacen falta otros dos lectores ni otra prueba del botón para reemplazar esas respuestas. La preparación principal de #148 ya está aprobada.

Siguen separados: #144 aprobación visual del mantenedor de su capa; #145 lectura de nombres/descripciones; #146 recorrido real del mantenedor y capturas del commit; #147 Software A/B con prompt en su propia IA y resultados reales de las comprobaciones. No se infieren de capturas de otra versión ni se reemplazan por agentes. La sesión A/B debe usar una build identificada y apta, no el instalador publicado antiguo ni un runtime que evade #204.

El [CI completo anterior de 799](ci-799-completed-20260930.md) terminó **failure**: comportamiento/browser/Electron pasó, pero los tres audits Companion y CI required fallaron. Todos los PRs #196–#202 comparten la dependencia npm 11.19.1 bloqueada por #204; el verde histórico de #196 no justifica integrarlo hoy. El registry oficial continúa next-11=11.21.0 y latest/next-12=12.2.0, ya ensayados sin auditoría apta. No se repitieron instalaciones de candidatas iguales, no se reconstruyó npm, cambió gestor, aceptó excepción ni redujo protección.

Faltan candidata oficial apta, aceptación humana restante, revisión final con sus límites resueltos, CI del SHA/base final y archive oficial antes de integración. Los PRs siguen draft mientras corresponda. El seguimiento existente de #204 permanece activo; se detendrá antes de ola4 una vez ola3 termine realmente.
