# Qué se aplica Project Engineering OS a sí mismo

Este repositorio distribuye gobernanza, SDD, diagnóstico read-only, control de deuda, adaptadores de agente,
MCP e inteligencia de código. Casi nada de eso se ejecuta sobre él mismo. Esta decisión dice qué debe
aplicarse, en qué forma, qué no debe aplicarse nunca y por qué, con una razón verificable en cada celda.

**Úsala si:** vas a proponer que el upstream adopte una pieza de su propio sistema, o quieres saber por qué
un `FAIL` del doctor sobre este repositorio no siempre es deuda.

Fecha de la decisión: 30 de agosto de 2026. Origen:

Estado operativo actualizado: [operación upstream](UPSTREAM_OPERATIONS.md). La matriz siguiente conserva
la medición histórica; readiness, deuda y clasificación del doctor se implementaron después de la decisión.

[#46](https://github.com/IgnacioBarEsp/project-engineering-os/issues/46). Todas las mediciones citadas están
en `openspec/changes/archive/2026-08-30-research-upstream-self-application/evidence/current-truth.md`.

## 1. El problema en una frase

El upstream no puede observarse con sus propios instrumentos, así que su deuda solo aparece cuando una
persona la lee.

No es una hipótesis. La misma deuda documental —specs publicadas sin Purpose redactado— se descubrió por
lectura humana en el Issue #25, se volvió a descubrir en el #42 y se extendió a los consumidores en el #45.
Cuando se ejecutó el motor de deuda del propio proyecto sobre los assessments que el propio proyecto ya
había escrito a mano, el registro produjo **un** item abierto:

```text
debt-cdeb7323f2a1 | open | minor | Cuatro specs históricas carecen de Purpose
```

Estaba escrito, fechado y clasificado desde el 18 de agosto de 2026. Ningún registro lo sostuvo, así que se
redescubrió dos veces más. El motor insignia del producto habría bastado.

## 2. El criterio: forma de consumidor frente a deuda real

Antes de cualquier veredicto hace falta separar dos cosas que se parecen en la salida y no se parecen en
nada más.

> Un check mide **forma de consumidor** cuando pregunta si este repositorio *tiene la forma que el
> constructor siembra*. Mide **deuda real** cuando pregunta si este repositorio *cumple una promesa que él
> mismo hace*.

La prueba es una sola pregunta: **¿qué prometió el upstream?** Si la promesa está en su documentación, en su
CLI o en su contrato publicado, incumplirla es deuda. Si el check solo comprueba que el repositorio se
parezca a lo que el bootstrap escribe, es un error de categoría: el upstream es el origen de esa forma, no
su destinatario.

Aplicado a los seis `FAIL` del doctor sobre este repositorio:

| Check | Veredicto | Razón |
| --- | --- | --- |
| `sdd.openspec-local` | **Deuda real** | `AGENTS.md` ordena usar el CLI local fijo. OpenSpec 1.6.0 no está en `package-lock.json`: vive en el `node_modules` de una sola copia de trabajo. Cualquier clon o worktree nuevo no puede ejecutar el flujo documentado. La promesa existe y se incumple. |
| `github.project` | **Deuda real** | El Definition of Ready exige pertenencia al proyecto de GitHub y lee `.project-os/github/product-os.json`. Sin ese archivo el gate que el repositorio se exige a sí mismo no es ejecutable in situ. |
| `ci.configuration` | **Forma de consumidor** | Busca `.github/workflows/project-constructor.yml`. El upstream tiene `ci.yml` y `release.yml`, vigentes, con check requerido y matriz de 3 SO por 2 versiones de Node. La promesa —CI que verifica cada PR— se cumple; solo el nombre del archivo difiere. |
| `release.identity` | **Forma de consumidor** | Exige que `create-project-engineering-os` esté declarado e instalado como dependencia. El upstream **es** ese paquete. Declararse como dependencia de sí mismo no es una promesa incumplida: es un sinsentido. |
| `harness.parity` | **Forma de consumidor** | Ejecuta `sync --check`, que sin estado de bootstrap reporta 67 creaciones y 9 conflictos. Mide la distancia a un repositorio bootstrapeado, no una promesa rota. |
| `mcp.configuration` | **Forma de consumidor** | Exige `.project-os/mcp.json`. El upstream nunca prometió consumir MCP; su propio catálogo mantiene `servers: []` como postura por defecto. |

Dos de seis son deuda. Cuatro son la pregunta equivocada. **El doctor no distingue hoy entre ambas**, y esa
indistinción es lo que hace que su salida sobre el upstream sea ruido en lugar de señal.

## 3. La recursión de ownership, resuelta con medición

La pregunta abierta era: ¿qué ocurre cuando un archivo gestionado por el constructor sobrescribe la fuente
de ese mismo archivo gestionado?

**Respuesta medida: no ocurre. El modelo de ownership ya lo impide, y nunca nadie lo ejecutó para verlo.**
`sync --check` sobre el upstream reporta 9 conflictos y 0 escrituras. Se detiene antes de escribir, que es
exactamente su contrato.

Lo que sí revela la medición es *por qué* la colisión es irreconciliable en cuatro rutas:

```text
AGENTS.md                          vs blueprint/core/AGENTS.md    53 líneas distintas
.github/ISSUE_TEMPLATE/change.yml  vs blueprint/core/github/…    121 líneas distintas
.github/PULL_REQUEST_TEMPLATE.md   vs blueprint/core/github/…     46 líneas distintas
.github/ISSUE_TEMPLATE/config.yml  vs blueprint/core/github/…      9 líneas distintas
```

No son la misma cosa desincronizada. Son **dos documentos distintos para dos audiencias distintas que
comparten ruta**: el del upstream gobierna a quien contribuye al runtime; el de la semilla gobierna a quien
lo consume. Fusionarlos degradaría los dos.

De ahí sale el mecanismo, que no es una advertencia:

> **El upstream nunca se bootstrapea a sí mismo.** Adopta piezas de forma selectiva, copiando archivos
> concretos a rutas que la allowlist de neutralidad ya admite, y nunca ejecuta `bootstrap`, `sync --apply`
> ni `upgrade --apply` sobre su propio árbol.

La allowlist convierte esa regla en algo verificable en vez de disciplinado. De las 67 creaciones que un
bootstrap intentaría, 26 caen en diez raíces que `check:neutrality` rechaza —`.claude`, `.codex`,
`.cursor`, `.opencode`, `.agents`, `.project-constructor`, `CLAUDE.md`, `OPENCODE.md`, `opencode.json`,
`.mcp.json`—. **Un bootstrap accidental rompe `npm run check` antes de poder mergearse.** El gate ya existe;
solo había que reconocerlo como el mecanismo.

Los 19 archivos bajo `.project-os/` son la excepción y el camino: la raíz está en la allowlist, y se siembran
como `owner project`, es decir seed-once. Ahí es donde cabe la adopción.

## 4. La matriz completa

Escala de veredictos:

- **Adoptar** — el upstream debe aplicárselo; hay issue de implementación.
- **Adoptar adaptado** — aplicárselo cambiando la forma, porque la del consumidor no encaja.
- **No aplicar (forma de consumidor)** — medirlo aquí es un error de categoría.
- **No aplicar (sin valor)** — aplicable en teoría, sin señal que justifique el costo.
- **Corregir el runtime** — lo que falla no es la adopción sino el mecanismo distribuido.

### A. Bootstrap, ownership y transacciones

| Mecanismo | Veredicto | Razón |
| --- | --- | --- |
| `bootstrap` | **No aplicar (forma de consumidor)** | 9 conflictos irreconciliables y 26 archivos que rompen la neutralidad. El upstream es el origen de la semilla. |
| `sync --check` | **Adoptar adaptado** | Inútil como gate global mientras el upstream no esté bootstrapeado. Sí sirve como sonda documentada de la recursión, que es como se produjo esta decisión. |
| `sync --apply` | **No aplicar (forma de consumidor)** | Escribiría sobre `package.json`, `README.md` y `AGENTS.md`. Prohibido por la regla de la sección 3. |
| `upgrade --check` / `--apply` | **No aplicar (forma de consumidor)** | Adoptar una versión de sí mismo no tiene significado. |
| `rollback`, journal, resume | **No aplicar (forma de consumidor)** | Sin mutaciones del constructor sobre este árbol no hay transacción que revertir. `constructor.transactions` ya pasa. |
| `ownership.json`, `path-rules.json` | **Adoptar adaptado** | No como estado de bootstrap, sino como la allowlist de neutralidad que ya cumple ese papel. Documentar la equivalencia. |
| `MANAGED_FILES_NOTICE.md` | **Ya aplicado** | Existe en la raíz. |

### B. Diagnóstico y gates

| Mecanismo | Veredicto | Razón |
| --- | --- | --- |
| `doctor` | **Corregir el runtime** | Cuatro de sus seis FAIL aquí son forma de consumidor. El doctor necesita distinguir ambas categorías, o el upstream necesita un perfil propio. Sin eso, su salida sobre este repositorio no es accionable. |
| `readiness-check --phase propose` | **Adoptar** | Medido: PASS 13 con tres archivos dentro de `.project-os/`. El target desechable deja de ser necesario. |
| `readiness-check --phase archive` | **Adoptar** | Misma configuración. Con `--run-local` requiere además el árbol bootstrapeado, así que esa variante sigue necesitando el target desechable, y eso debe quedar documentado en vez de descubrirse por conversación. |
| `opsx-check` | **No aplicar (forma de consumidor)** | Exige los 25 artefactos OPSX bajo `.claude/`, `.codex/`, `.cursor/`, `.github/prompts/` y `.opencode/`. Cuatro de esas cinco raíces las rechaza la neutralidad. Adoptarlo exigiría abrir la allowlist a los adaptadores, que es una decisión distinta y mayor. |
| `npm run opsx-check` (script) | **Corregir el runtime** | Declarado en `package.json` apuntando a `--target .`, sale con código 2 y no está en `npm run check`, así que nadie descubre que no puede pasar. Un script que no puede pasar es peor que no tenerlo. |
| `opsx-adapt` | **No aplicar (forma de consumidor)** | Depende de artefactos OPSX que aquí no existen ni deben existir. |
| `harness-capabilities.json` y recibos opt-in | **No aplicar (forma de consumidor)** | El upstream no instala agentes de terceros ni autentica nada. Los recibos describen consumo que aquí no ocurre. |

### C. Motor de deuda

| Mecanismo | Veredicto | Razón |
| --- | --- | --- |
| `debt-policy.json`, `debt-registry.json` | **Adoptar** | Medido: `debt check` pasa con `.project-os/debt/` sembrado, dentro de la allowlist. |
| `debt capture` | **Adoptar** | 8 de 10 assessments existentes capturan sin cambios. Los 2 rechazos son un `planOwner` que nombra un plan no declarado: se corrige en la migración, no es un impedimento. |
| `debt check` | **Adoptar** | Convierte los assessments manuales en estado verificable. Hoy `debt check` reporta PASS por omisión, que es la clase de falso verde que el propio proyecto prohíbe. |
| Gate `pre-archive` | **Adoptar** | Hoy nada verifica que un change traiga assessment. El gate lo exige. |
| `debt handoff`, `debt sync` | **No aplicar (sin valor)** | `sync` crea issues de saneamiento en GitHub. El upstream ya gestiona su deuda como issues a mano; automatizarlo añade mutación remota sin señal nueva. Revisable si el registro crece. |
| Presupuesto y pausa por deuda crítica | **Adoptar** | Es la parte que da consecuencia al registro. Sin ella el registro es una lista. |
| Excepciones con expiración | **Adoptar** | Viene con la política; sin costo adicional. |

### D. Ecosistema de agentes

| Mecanismo | Veredicto | Razón |
| --- | --- | --- |
| `AGENTS.md` | **Ya aplicado** | Existe y diverge de su semilla a propósito. |
| `CLAUDE.md`, `OPENCODE.md`, `opencode.json` | **No aplicar (forma de consumidor)** | Rutas no permitidas por la allowlist. Adoptarlas exigiría abrir la neutralidad a archivos de agente en la raíz pública. |
| Los cinco adaptadores | **No aplicar (forma de consumidor)** | Mismo motivo, cinco raíces. Además el upstream ya demostró que el tooling de agentes crea directorios que la neutralidad rechaza: `.claude/worktrees/` hizo fallar `npm run check` durante este mismo trabajo. |
| `skills.json` | **No aplicar (sin valor)** | Las tres skills están `enabled: false` por decisión. Sembrar la configuración sin activarlas no añade señal. |
| `mcp.json` | **No aplicar (sin valor)** | `servers: []` por decisión. Sembrar un catálogo vacío no cambia nada verificable. |
| `permissions.json` | **No aplicar (forma de consumidor)** | Describe fronteras de un harness que aquí no se ejecuta. El catálogo de herramientas ya registró que `allowed-tools` no es una frontera portable. |

### E. Inteligencia de código

| Mecanismo | Veredicto | Razón |
| --- | --- | --- |
| Bandera `codeIndexable` | **Corregir el runtime** | `true` produce FAIL siempre y `false` produce SKIP siempre. No hay rama que produzca PASS, así que activarla crearía dos FAIL permanentes sin ruta de salida. La bandera no es adoptable en su forma actual. |
| `gitnexus` | **No aplicar (sin valor)** | El catálogo de herramientas resolvió `structural-code-intelligence` como `postponed`, con licencia, costo y autenticación en `unknown` porque no hay candidato elegido. Elegir uno es una decisión aparte con su propia revisión. |
| `codegraph` | **No aplicar (sin valor)** | Mismo motivo. |
| `graphify` | **No aplicar (sin valor)** | Retirado del runtime activo; el propio doctor lo marca `SKIP` fijo. |

La premisa del SKIP —"el repositorio todavía contiene solo gobernanza/tooling"— sí es falsa: hay 13 460
líneas en `src/`. Pero que la premisa sea falsa no convierte la herramienta en necesaria. Corregir la
premisa sin proveedor elegido solo cambiaría dos SKIP honestos por dos FAIL sin remedio.

### F. Product OS remoto

| Mecanismo | Veredicto | Razón |
| --- | --- | --- |
| `product-os.json` | **Adoptar** | Es el archivo que hace ejecutable el Definition of Ready in situ. Su ausencia es deuda real, no forma. |
| `github-plan` | **Adoptar adaptado** | Read-only y ya sabe leer `repository-governance.json` del upstream. Con `product-os.json` presente su plan pasa a ser completo. Sin mutación remota. |
| Labels, ruleset, estados del tablero | **Ya aplicado** | Vive en `repository-governance.json` y en la configuración real del repositorio. No duplicar. |
| `discovery-issues.json` | **No aplicar (forma de consumidor)** | Describe el descubrimiento de un producto que el upstream no tiene. |

### G. Onboarding adaptativo

| Mecanismo | Veredicto | Razón |
| --- | --- | --- |
| `onboarding-plan` | **No aplicar (forma de consumidor)** | Clasifica una carpeta para elegir ruta de arranque. El upstream lleva nueve changes archivados; no tiene arranque que clasificar. |
| Estado canónico versionado | **No aplicar (forma de consumidor)** | Depende del clasificador. |
| Router, Prompt 00, Prompt 01 | **No aplicar (forma de consumidor)** | Preparan un entorno de consumidor y descubren un producto. El upstream ya tiene ambos. |

Estos cuatro veredictos negativos son los más fáciles de confundir con pereza, así que conviene el criterio
explícito: el onboarding promete llevar a alguien *de una carpeta vacía a su primer cambio de producto*. El
upstream no está en ese estado y no puede volver a estarlo. La promesa no le aplica.

### H. Perfiles

| Mecanismo | Veredicto | Razón |
| --- | --- | --- |
| `profiles.json` como configuración | **Adoptar** | Necesario para `readiness-check` in situ; ya medido en PASS. |
| Conjunto activo configurable | **Corregir el runtime** | `src/readiness.mjs` exige que el conjunto activo sea exactamente `documentation` y `harness-tooling`. `activationPolicy.decisionArtifactRequiredForConditionalProfiles: true` promete que una decisión aprobada activa un perfil condicional. Medido: activar `library-cli` deja el gate en `PASS 0 | FAIL 1` y la recuperación pide deshacer la decisión. La política promete una ruta que el runtime prohíbe. |

Esto afecta a los consumidores antes que al upstream: cualquier repositorio que active un perfil por la vía
que su propia política describe pierde el gate entero.

### I. Lo ya aplicado

| Mecanismo | Veredicto | Observación |
| --- | --- | --- |
| SDD vía OpenSpec | **Ya aplicado** | 9 changes archivados con los seis artefactos; specs válidas en estricto. |
| Revisión adversarial | **Ya aplicado, por costumbre** | Presente en 9 de 9 changes y **ningún gate la exige**. Depende de que quien trabaja se acuerde. |
| Assessment por change | **Ya aplicado, por costumbre** | Presente en 10 de 10 y nada lo verifica. El gate `pre-archive` del grupo C es justamente esto. |
| CI y matriz | **Ya aplicado, por gate** | Check requerido sobre 3 SO por 2 versiones de Node. |
| Release con provenance | **Ya aplicado, por gate** | Tarball único, checksum, GitHub Release y npm provenance. |
| Gobernanza de cambio | **Ya aplicado, por gate** | PR protegido, prohibición de autoaprobación, DCO. |
| Definition of Ready | **Ya aplicado, con andamio** | Se ejecuta sobre un target desechable. El grupo B lo convierte en in situ. |

## 5. Resumen de veredictos

| Veredicto | Mecanismos |
| --- | --- |
| Adoptar | 10 |
| Adoptar adaptado | 3 |
| Corregir el runtime | 4 |
| No aplicar (forma de consumidor) | 14 |
| No aplicar (sin valor) | 6 |
| Ya aplicado | 10 |
| **Total** | **47** |

Ningún grupo del inventario queda sin veredicto y ningún veredicto negativo queda sin razón.

## 6. Costo, licencia y control de lo que se adopta

Cada adopción propuesta usa **solo archivos y comandos que este repositorio ya distribuye**. No hay
proveedor, cuenta, servicio ni dependencia nueva.

| Adopción | Costo | Licencia | Autenticación | Datos enviados | Permisos | Evidencia | Rollback |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `readiness-policy.json`, `profiles.json`, `product-os.json` | cero | MIT, propia | ninguna | ninguno | lectura local | `readiness-check` en PASS 13 in situ | borrar los tres archivos |
| `.project-os/debt/` y el gate `pre-archive` | cero | MIT, propia | ninguna | ninguno | lectura y escritura del registro local | `debt check` en PASS; 8 de 10 assessments capturados | borrar `.project-os/debt/` |
| `github-plan` con manifiesto completo | cero | MIT, propia | ninguna (read-only, sin mutación remota) | ninguno | lectura local | plan completo en vez de parcial | quitar `product-os.json` |
| Fijar OpenSpec en el lockfile | cero | MIT, `@fission-ai/openspec` | ninguna | ninguno | instalación local | `sdd.openspec-local` en PASS desde cualquier clon | revertir el commit |

Las cuatro correcciones de runtime del grupo B, E y H no añaden nada: cambian comportamiento del código
propio.

## 7. Lo que este documento no decide

- No ejecuta ninguna adopción. Cada una necesita su issue, su spec y su PR.
- No elige proveedor de inteligencia de código. Esa decisión vive en el catálogo de herramientas y hoy está
  `postponed`.
- No abre la allowlist de neutralidad a los adaptadores de agente. Adoptar `opsx-check` in situ lo exigiría,
  y esa es una decisión mayor con su propio análisis.
- No convierte ningún check nuevo en bloqueante de CI sin baseline previo.

## 8. Desglose de implementación

Nueve issues independientes, cada uno con sus propios criterios observables y su bloque pre-propose. Los
nueve pasaron el Definition of Ready con el gate real —`PASS 13 | FAIL 0 | EXCEPTION 0`— el 30 de agosto
de 2026.

| Issue | Título | Grupo | Por qué y en qué orden |
| --- | --- | --- | --- |
| [#48](https://github.com/IgnacioBarEsp/project-engineering-os/issues/48) | Fijar OpenSpec 1.6.0 en el manifiesto y el lockfile | B | Deuda real. Desbloquea el flujo documentado desde cualquier clon. Nada más depende de él, pero el trabajo diario sí. |
| [#49](https://github.com/IgnacioBarEsp/project-engineering-os/issues/49) | Sembrar la configuración de readiness para ejecutarlo in situ | B, F, H | Deuda real. Sustituye el andamio del target desechable por tres archivos. Habilita el resto del trabajo de gates. |
| [#50](https://github.com/IgnacioBarEsp/project-engineering-os/issues/50) | Adoptar el motor de deuda sobre el propio repositorio | C | Adopción con la evidencia más fuerte del spike. Depende de #49 por orden de riesgo, no técnicamente. |
| [#51](https://github.com/IgnacioBarEsp/project-engineering-os/issues/51) | Separar forma de consumidor de deuda real en el doctor | B | Corrección de runtime. Sin ella la salida del doctor sobre el upstream seguirá siendo ruido. Es el cambio más grande. |
| [#52](https://github.com/IgnacioBarEsp/project-engineering-os/issues/52) | Arreglar o retirar el script `npm run opsx-check` | B | Corrección de runtime, pequeña y aislada. Un script que no puede pasar es peor que ausente. |
| [#53](https://github.com/IgnacioBarEsp/project-engineering-os/issues/53) | Dar requisito de spec a `opsx-check` y `readiness-check` | B | Cierra el hueco de cobertura que el Issue #45 hizo visible. |
| [#54](https://github.com/IgnacioBarEsp/project-engineering-os/issues/54) | Permitir un conjunto de perfiles activo distinto del fijado | H | Corrección de runtime. Afecta a los consumidores antes que al upstream. Independiente del resto. |
| [#55](https://github.com/IgnacioBarEsp/project-engineering-os/issues/55) | Resolver la bandera `codeIndexable`, que no tiene rama de PASS | E | Corrección de runtime. Independiente. Puede resolverse retirando los checks o dándoles ruta de evidencia. |
| [#56](https://github.com/IgnacioBarEsp/project-engineering-os/issues/56) | Corregir el detector de marcadores de la metadata pre-propose | B | Corrección de runtime. Uno de los tokens prohibidos es homógrafo de una palabra española corriente. |

Dos de los nueve nacen de una promesa publicada e incumplida —#48 y #49—. Cuatro corrigen el runtime en vez
de adoptar nada —#51, #52, #54 y #55—. Uno adopta el mecanismo insignia del producto sobre su propio
repositorio —#50—. Y dos cierran huecos que este trabajo hizo visibles —#53 y #56—.

Vuelve a [documentación](README.md) para el índice completo, o revisa
[ownership](architecture/OWNERSHIP.md) para el mapa de quién posee cada superficie.
