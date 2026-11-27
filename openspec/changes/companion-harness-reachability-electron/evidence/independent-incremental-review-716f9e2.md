# Reconciliación incremental independiente — correcciones F1/F2

Fecha: 2026-11-13 (UTC).
Revisor: **el mismo agente Codex independiente `/root/wave3_final_integration_review`** que emitió el informe e713. No soy el implementador, un servicio Bugbot ni una persona. No delegué.

**Veredicto concreto:** F1 está corregido en los fixtures y el contrato de regresión; su comprobación canónica instalada posterior sigue pendiente. F2 está corregido y respaldado por la ejecución única retenida de las 37 mutaciones sobre entradas que no cambiaron. **No confirmé nuevos hallazgos P0–P3 accionables en el delta autorizado.** Esto no cualifica la app instalada ni aprueba seguridad global, humanos, archivo, merge o release.

## Fuente y autorización

Reconciliación única de `e713e9a6089b8bdc505660c03227bbab5b2829d1` a **`716f9e2c714670bcaa45ee1b64ed352ad831c3a2`**, exclusivamente para estos cinco archivos:

1. `apps/companion/scripts/verify-native-journeys.mjs`
2. `apps/companion/scripts/native-project-fixtures.mjs`
3. `apps/companion/scripts/verify-service-mutations.mjs`
4. `apps/companion/scripts/service-mutation-cases.mjs`
5. `apps/companion/qa/verification-harness-contract.mjs`

Leí las enmiendas y recibos versionados: aprobación exacta `26674520d2a60fe6e56904b93b307e8ce5195d63` y corrección literal `c8cd8d5a8a753c0dd10e48cf41361073aec0d752`. El recibo de esta última conserva «CONTINUA DONDE TE QUEDASTE, apruebo». No inferí una autorización nueva o general.

Leí de nuevo el informe original mediante MCP y comprobé su SHA-256, **`6e7169f7eed27729436cf5681ce1b3e6e88885bc59023b9c6045e2f30980e737`**. Permanece íntegro en `artifacts/wave3-current/independent-final-integration-review.md`; este documento es un suplemento y no reescribe sus fallos o alcances históricos.

Usé los blobs de Git del head explícito y su diff; al inicio y al cierre HEAD seguía siendo 716f9e2, status vacío y sin diferencias en esos cinco archivos. La comparación Git confirmó que desktop/ui/engine/context/runtime, packages/locks y CI permanecen idénticos a e713. No atribuyo a este pase revisiones de documentos adicionales, producto o pins.

## F1: causa corregida; comprobación instalada aún abierta

El hallazgo original era una escritura nueva con IDs retirados unity/media/general, rechazada correctamente por el servicio con `PROFILE_INVALID`. El fallo real de la VM e713 se conserva y no se renombra como PASS.

La fuente corregida:

- `native-project-fixtures.mjs:5–40` define seis perfiles canónicos mediante siete escenarios. Conserva el corpus de investigación/PDF, contenido creativo/DOCX, software y acuerdos; añade los escenarios de estudios/negocio y retiene videojuego como **software/game**, con ProjectVersion.txt y una fuente que contiene ComputeScore.
- `nativeSelection` (`:48`) pasa perfil y enfoque explícitos; `validateNativeFixtures` (`:55–65`) usa el validador real del producto, rechaza perfiles no canónicos/corpus vacío y señala perfiles ausentes. No introduce un fallback de fixture ni habilita alias de escritura.
- `verify-native-journeys.mjs:54` valida el conjunto; `:424` usa la selección corregida en previewBase; `:564` decide las etapas de ingeniería por la capacidad del perfil. `:810–815` comprueba cobertura final y distingue perfiles canónicos de escenarios en el JSON.
- `qa/verification-harness-contract.mjs:12–42` exige seis perfiles/siete escenarios, enfoques válidos, corpus/formatos útiles, escenario de juego conservado y alias legacy legibles pero rechazados para nuevas escrituras. Incluye controles negativos de perfil omitido/retirado.

La primera variante `662fc2786444ad32dec6a26d30ce3f604ca69d65` tenía un error de fixture: business usaba role analyst. El raw original conserva **5 PASS/2 FAIL, exit 1**, con ROLE_INVALID; el control de perfil omitido fallaba antes de alcanzar su aserción esperada. No cuento esos fallos de setup como detección válida de aquel control.

La variante c8 cambia **solo** `native-project-fixtures.mjs:32`, analyst→freelancer, entre 662fc27 y 716f9e2. Los otros cuatro archivos, las siete pruebas y las guardas de producto no cambiaron. Freelancer ya pertenece al contrato intacto; no se modificó la aserción para ocultar el fallo.

Inspeccioné el raw `fixture-role-c8/regressions.json`: ejecución única posterior sobre 716f9e2, Node24.18.0/Windows, **7/7 PASS, 0 FAIL/cancelados/SKIP, exit 0**, sin timeout, sourceMatches de los cinco archivos true y copia limpia. Es ejecución del coordinador, no mía.

**Estado F1:** corregido a nivel de fuente y contrato probado. La regresión actual elimina el mecanismo concreto PROFILE_INVALID/ROLE_INVALID del fixture. **No existe una ejecución canónica instalada posterior con este harness**, por lo que no afirmo que las pantallas, etapas posteriores o desinstalación hayan pasado. El wrapper fuera de allowlist todavía imprime cinco recorridos; esa limitación ya está declarada en la enmienda. Un futuro resultado solo sería completo con los **seis perfiles y siete escenarios reales del JSON**, sin convertir ese cinco en denominador suficiente ni aprobarlo por exit 0 solamente.

## F2: corregido y evidencia de comportamiento reconciliada

Comparé la tabla original y la extraída a `service-mutation-cases.mjs`: **los mismos 37 IDs, en el mismo orden; ninguno retirado o añadido**. Solo cambiaron los dos casos necesarios:

- `service-mutation-cases.mjs:21–24`: el caso not-measured/not-installed incluye y conserva `routeOnly?'route-only'`; sigue rompiendo únicamente la distinción entre «no medido» y «no instalado».
- `:131–134`: el caso de inventario conserva la prioridad `vision-missing` y elimina en el mutante solo la exigencia de inventario vigente. No se sacrifica el control de visión para conseguir una detección.

El runner hace preflight de todos los puntos antes de mutar (`verify-service-mutations.mjs:35`), exige exactamente una ocurrencia (`service-mutation-cases.mjs:179–190`), registra baselines y raw por caso y restaura por caso/en finally, con hashes finales. La clasificación (`:195–216`) separa los fallos de setup/parse/cancelación/timeout y exige que los tests fallidos fueran pruebas aprobadas en el baseline. Las regresiones incluyen ancla ausente/duplicada e IDs repetidos, copia que sobrevive y fallos ajenos al comportamiento; esos negativos legítimos no se presentan como errores de producto.

Leí el raw completo de la **única** ejecución autorizada del runner en 662fc27 y reconcilié sus identidades con la fuente:

- Baselines raw: project-list **16/16**, prompts **13/13**, stack **13/13**; exit 0, sin setup/cancelación.
- IDs declarados = preflight = intentados = detectados: **37/37**, cada punto con una ocurrencia.
- Cotejé los nombres fallidos directamente en stdout con los nombres aprobados en stdout de su baseline. Los 37 casos tienen status 1 del fallo conductual, signal/error nulos, cero cancelados y ninguna marca de parse/load/timeout/setup. Los hashes de entrada y salida coinciden para todos los targets.
- El caso de handoff produce realmente not-installed frente a not-measured en qa/stack; el de inventario produce ready frente a inventory-stale en qa/project-list. Son aserciones conductuales, no fallos de carga o punto de inserción.
- Entre 662fc27 y 716f9e2 no cambiaron el runner, su tabla, los targets de producto ni sus tres suites. Cambió solo el rol del fixture nativo, que no es entrada de ese runner. La reutilización de esta ejecución es por identidad comprobada, no por asumir que una corrección distinta también pasa.

**Estado F2:** corregido y respaldado por evidencia retenida de ejecución completa para sus entradas idénticas. No reejecuté mutaciones ni me atribuyo aquella ejecución. Los 37 casos del servicio siguen separados de los negativos del harness de interfaz.

## Identidad y hashes comprobados

Leí los siguientes artefactos mediante `read_codex_security_artifact`, standalone persistent con el targetPath de este worktree. Comprobé sus hashes de archivo mediante lectura:

| Artefacto bajo artifacts/wave3-current | SHA-256 |
| --- | --- |
| fixture-role-c8/regressions.json — 7/7 actual | `35875f6c550c585f5892a0f872584fd76945c349b25f834c5d1a3e3601126797` |
| regressions-harness266.json — 5/7 original | `89b9e35d3cbb0292a4b77eaf941e268ce05e554e799e9134be5914807e68478c` |
| service-mutations-266/service-mutations.json | `bd49c655e96d4eb6d6b8a02f0a11e0a07c407df3f2d0e31a4381a140a8d00303` |

El freeze leído declara recipe **`a59f4f7a2a68acfedcd89c1031910076edfb6d6d650ff7638fc324cdc5f9da6a`**. Los hashes de las cinco fuentes que calculé por lectura coinciden con ese freeze:

| Fuente | SHA-256 |
| --- | --- |
| verify-native-journeys.mjs | `91e0e9311fe731c40900582290ccdca280a6b04828185ad2360b04fb9050c01c` |
| native-project-fixtures.mjs | `ce9106b2fb2ff04c139a3ac4c1a0755505a3b364bbaf1a15c00fc8580be65b61` |
| verify-service-mutations.mjs | `feb9f6dab0ec5d948a9484930615e63008271b6bb15af4770450e1f4c2a5612d` |
| service-mutation-cases.mjs | `3e59d3f6ac234dbe8bceca3cbb1c15356c4f25037cfa78544eac03c1a0b94240` |
| qa/verification-harness-contract.mjs | `6b0eeb27edf955c073be3f3171604fa7b53b8122be40b40bc44a6db9f24384de` |

Raw de mi reconciliación de lectura, comparaciones y diagnóstico del conteo textual: `artifacts/wave3-current/fixture-role-c8/independent-readonly-reconciliation.json`, SHA-256 **`b2956c6753c377baff1afb00df981a5bbdcbd7fa00b606e7efbda6af81d1d629`**. Un primer matcher textual contaba también dos literales id:base dentro de payloads; el raw conserva ese diagnóstico y su corrección a declaraciones ancladas. No fue un fallo del producto ni una nueva ejecución de pruebas.

## Ejecución propia, presupuesto y gates

Mi actividad fue solo lectura: Git show/diff/status/rev-parse, lectura de los cinco archivos/recibos y artefactos, hashes y cotejo de datos en memoria. **No ejecuté tests, syntax checks, builds, installs, mutaciones, servicios, VM ni instaladores**, ni edité fuentes, dependencias, metadata o refs. Esta es la única reconciliación incremental aprobada y consume ese pase; no inicia una cadena posterior de revisiones.

Presupuesto conservado: **2/2 variantes consumidas, 0 restantes; dos ejecuciones de regresión acumuladas y una del runner completo**. El ciclo canónico corregido sigue **0/1**, sin resultado instalado posterior. El estado comunicado por el coordinador incluye un bloqueo separado de Electron44.1.1/GHSA-jr5w-w6x2-84p9 y una propuesta de pin independiente; **no evalué ese advisory, su triaje o su remediación** ni doy aprobación de seguridad por esta reconciliación.

Se conservan los timeouts/fallos locales e713 y el FAIL canónico original. Los humanos reales #146 y Software A/B #147, cualificación instalada, deuda de cierre, readiness, archivo oficial, CI requerida del head final y merge protegido siguen siendo gates separados. No se acredita ninguno por el 7/7 o el 37/37 de este suplemento.

El resultado se limita a los cinco blobs de **716f9e2**. No aprueba otro diff, pin o head futuro, aunque conserve parte de estas fuentes; la autoría y alcance de 5706/429c/e713 permanecen intactos.
