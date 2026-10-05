> **Handoff vigente.** Lee primero «Estado actual» y «Siguiente acción». La auditoría original del 18–20 de septiembre queda conservada al final como historial, no como descripción del producto actual.

## Historia Original

> Ordéname los issues por orden de aplicación, junto con un handoff del contexto para que otro agente o en un nuevo chat pueda empezar a aplicarlos. Le meteré velocidad ya que tengo muchas suscripciones de IA para que los acabe todos antes de las fechas. (18 de septiembre de 2026)

## Enriquecida

### 0. Estado actual verificado

Actualizado el **4 de octubre de 2026, 20:40 (America/Mexico_City / UTC−6)**. Comprobación UTC: 2026-10-05 02:40. Los resultados históricos de tests/releases mantienen las fechas y el alcance originales; esta actualización comprueba estados/SHA y el nuevo experimento204. Base integrada: main `9751c301976fe27e9bbad33e69f39372b69f901e`.

- **Ola 0: 4/4 cerrados. Ola 1: 4/5 cerrados; #152 sigue abierto. Ola 2: 4/4 cerrados. Ola 3: 7 implementaciones en PR, 0/7 issues cerrados.**
- No marcar un issue «hecho» por tener código o pruebas en una rama: ✅ / checkbox marcado significa **integrado y CLOSED/COMPLETED**. «Implementado / draft» no es merge, archive ni release.
- El mantenedor pidió **terminar ola 3 y detenerse antes de ola 4**. Se permite cerrar el pendiente anterior #152; no iniciar trabajos de las olas 4–6.
- Releases actuales comprobadas: núcleo **1.0.0** ([v1.0.0](https://github.com/IgnacioBarEsp/project-engineering-os/releases/tag/v1.0.0)) y Companion **0.3.6** ([companion-v0.3.6](https://github.com/IgnacioBarEsp/project-engineering-os/releases/tag/companion-v0.3.6)). La reconstrucción 0.4 de ola 3 **no está publicada**.
- Última comprobación fresca de main en copia limpia: `npm run check` exit 0, **389/389 tests** y árbol limpio; doctor baseline acepta exactamente tres FAIL conocidos con issue, no cero FAIL universales. [Auditoría, inventario y límites](https://github.com/IgnacioBarEsp/project-engineering-os/issues/206#issuecomment-5943370418).
- **#204 bloquea la auditoría de producción y la CI protegida de Companion.** Observación2026-10-05T02:40:36Z: next-11=11.21.0, latest/next-12=12.2.0, cache4.3.0 y braces3.0.3 sin cambio. La alternativa experimental aprobada ya se probó: variante3 no apta,154/161 componente y67/69 caller real; presupuesto3/3 agotado. No repetir instalaciones ni alterar la candidata congelada. La cuarta receta propuesta requiere aprobación distinta.
- Se archivaron **tarjetas de 81 issues históricos** en Project #3, sin borrar issues, comentarios, PR ni evidencia. Ahora hay 25 issues abiertos tras añadir #208: #205 permanece Backlog; #206 y #208 están Blocked, visibles y sin cierre. «Archivado del tablero» no significa «sin deuda» ni equivale a archive OpenSpec.
<!-- peos-debt206-progress-20261003 -->
- **Avance de #206 sin duplicar trabajo (2026-10-04 UTC):** primera fase aprobada, capturada y archivada oficialmente; [PR #207](https://github.com/IgnacioBarEsp/project-engineering-os/pull/207) draft, head `9feea6597d4fc43ab1f4dfb6a45f5bf4c797ac92`. DoR 13/13, readiness archive 16/16, core 393/393, deuda 62/62 y strict 20/20 PASS; Bugbot independiente 0 hallazgos en a6127ce previo a captura, revisión posterior del implementador separada. Solo `debt-bee2fa0c0549` reconciliado: **50 items / 36 abiertos en la rama**, otros 49 objetos y 73 assessments históricos intactos, recaptura no-op, 12 detecciones negativas, presupuesto 4/5 y tres flujos. **Main mantiene 37 abiertos; sin merge ni cierre.** [CI 37171002125](https://github.com/IgnacioBarEsp/project-engineering-os/actions/runs/37171002125): seis jobs core PASS, auditoría raíz/blueprint FAIL por #208 (braces), tres auditorías Companion FAIL por #204, required FAIL. #206 OPEN / Blocked, no Done/archivado del tablero; no inicia ola 4.

### 1. Siguiente acción y condiciones de cierre

1. **#152 / PR #192 ya se retomó y está bloqueado por #204.** El verde del head histórico `6a64869` no se reutilizó para integrar: se actualizó por merge normal con main `9751c30`, nuevo head `1256381f7efa9a7c3381e565a3c18c4d3635baed`. En copia desechable limpia: **396/396 tests del núcleo** y **21/21 specs estrictas** con OpenSpec local 1.6.0. [CI nueva 36965605481](https://github.com/IgnacioBarEsp/project-engineering-os/actions/runs/36965605481) terminó failure: seis jobs core y auditoría raíz pasan, tres auditorías Companion fallan por npm bundled (2 high/1 moderate) y CI required rechaza la matriz. #152 y #204 están Blocked en el tablero; no hubo merge ni cierre. La siguiente acción implementable requiere una distribución npm apta, oficial o derivada bajo acuerdo realmente aprobado, y revalidación protegida, no otro rerun igual. La revisión adversarial independiente y el archive histórico siguen preservados con su alcance; no se fabrica una revisión humana ni se preaprueba una actualización futura.
2. **#204: alternativa experimental aprobada, variante3 no apta y presupuesto agotado.** Las aprobaciones reales fa279d9 (fase/reversibilidad),6b3997 (primer archivo) y d6e2b543d632dc35b099037746891dbe2f3983db (segunda ampliación, respuesta literal «si») están registradas. La segunda sí se aplicó solo en copias desechables de http-cache-semantics4.3.0/index.js y make-fetch-happen15.0.6 policy.js/entry.js/index.js; no repetir ese gate. Dos construcciones por componente idénticas,44/44 tests,14 límites de producción intactos. La matriz inicial152/152 no basta: ampliada154/161; caller con HTTP local/cacache/streams reales67/69. Persisten historia pre304/Vary, comillas, Expires y controles directos. Revisión independiente parcial/incompleta, sin aceptación. **3/3 variantes consumidas,0 npm completos**: no cuarta automáticamente. [Propuesta final pendiente](https://github.com/IgnacioBarEsp/project-engineering-os/blob/codex/204-npm-composition-feasibility/openspec/changes/investigate-reproducible-npm-composition/final-recipe-amendment.md) solicita una cuarta y última receta más refinamientos explícitos en esos mismos cuatro archivos, no aprobada ni aplicada; alternativa: esperar upstream. [Resumen y ledger](https://github.com/IgnacioBarEsp/project-engineering-os/blob/codex/204-npm-composition-feasibility/openspec/changes/investigate-reproducible-npm-composition/TLDR.md) conservan hashes, fallos y evidencia. Seguimiento existente activo, silencioso sin cambios; no repetir instalaciones de candidatas iguales. Prohibidos cambios al host/Companion instalado, catálogo/locks/notices, npm source/tercer componente, gestor/baseline/OpenSpec, auditoría/excepciones o protecciones. Solo con componente/caller aptos y las aprobaciones correspondientes siguen npm completo, auditoría física/advisories/runtime/install/repair/resources/reversibilidad, revisión/deuda/archive y PR protegido. Adopción es otra spec aprobada; no cierre204/ola3 ni ola4.
3. **#208 es un bloqueo adicional recién observado en la auditoría actual:** braces 3.0.3 en locks raíz/blueprint, [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), sin versión corregida registrada y latest oficial 3.0.3 en la consulta. El PR #207 no cambió esos locks. Es un seguimiento distinto de #204; no reduce el gate ni autoriza reconstrucción, excepción o actualización silenciosa del pin OpenSpec. Una alternativa concreta requiere su propio DoR/spec aprobada/evidencia/PR. Esto no es inicio de ola 4; mantener los resultados antiguos de CI con su SHA, sin atribuirles esta nueva corrida.
4. Con runtime apto y auditorías raíz/blueprint aptas, completar los gates reales pendientes y conservar orden de pila: **#196 → #197 → #198 → #199 → #200 → #201 → #202**. El orden de los issues del producto es #144→#145→#146→#147→#148→#149; #150 acompaña el recorrido desde el inicio y es el último PR de la pila.
5. Tras cerrar de verdad los siete issues y el programa #141, **detenerse antes de ola 4**, avisar al mantenedor y pausar el seguimiento. Este handoff no se cierra mientras las olas posteriores sigan pendientes.

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
- [ ] #152 — Retirar vendoring de Impeccable, hooks y declarar redistribuciones. [#192](https://github.com/IgnacioBarEsp/project-engineering-os/pull/192) abierto, base actualizada, **396 tests / 21 specs PASS; CI requerida FAIL por #204**, estado Blocked. Implementar/archivar en una rama no significa integrar.
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
| #204 | OPEN / Blocked: npm oficial corregido; bloquea ola 3 y la integración pendiente de #152 |
| #173 | OPEN: medición controlada de resultado con prompt/entorno/mapa; no afirmar mejoras universales |
| #174 | OPEN: firma de editor del instalador; hash no es firma |
| #205 | OPEN / Backlog: reproducir y mejorar cobertura a escala preservando límites |
| #206 | OPEN / Blocked: fase 1 capturada/archivada en PR #207, no integrada; 36 restantes abiertos en rama; bloqueos #204/#208 |
| #208 | OPEN / Blocked: auditoría root/blueprint por braces 3.0.3, distinta de npm bundled; seguimiento sin implementación ni nueva spec aprobada |

#205 recoge el resultado histórico **0/20 preparado frente a 20/20 literal** de #105/#166. Medirlo no lo corrigió; debe reproducirse en el código actual antes de cambiar selección/paginación. #206 distingue defectos vigentes, limitaciones deliberadas, evidencia posterior y comprobaciones humanas pendientes; no resuelve filas porque el issue origen esté cerrado. Deuda actual de main: 50 registros, 37 open, plan 4/5 unidades y tres flujos.

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
