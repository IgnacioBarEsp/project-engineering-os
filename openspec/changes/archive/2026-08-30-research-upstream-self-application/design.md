# Design - qué se aplica el upstream a sí mismo

## 1. Por qué la pregunta necesitaba medición y no opinión

El issue llegaba con una intuición fuerte —"el zapatero va descalzo"— y con cuatro salidas de comando como
prueba. Una intuición fuerte es exactamente el punto donde un spike puede confundir coherencia estética con
valor. La decisión se construyó al revés: primero ejecutar, después clasificar.

Todo lo que sostiene la matriz está medido y es reproducible con los comandos del propio repositorio. La
evidencia completa vive en `evidence/current-truth.md`.

## 2. El criterio, y por qué era lo primero

Sin criterio, la matriz habría sido una lista de deseos. El criterio es una sola pregunta:

> ¿Qué prometió el upstream? Si la promesa está en su documentación, su CLI o su contrato publicado,
> incumplirla es deuda. Si el check solo comprueba que el repositorio se parezca a lo que el bootstrap
> escribe, es un error de categoría.

Se validó contra el caso de prueba que el propio issue propuso: los seis `FAIL` del doctor. Clasifica dos
como deuda real y cuatro como forma de consumidor, y en los cuatro la razón es específica, no genérica.

El caso más instructivo es `ci.configuration`. Busca `.github/workflows/project-constructor.yml`. El upstream
tiene `ci.yml` y `release.yml`, con check requerido y matriz de 3 SO por 2 versiones de Node. La promesa —CI
que verifica cada PR— se cumple de sobra; lo que no coincide es el nombre del archivo. Un criterio que
tratara eso como deuda produciría trabajo para satisfacer a un comparador de rutas.

El caso opuesto es `sdd.openspec-local`. `AGENTS.md` ordena usar el CLI local fijo, y ese CLI no está en el
lockfile: vive en el `node_modules` de una sola copia de trabajo. Cualquier clon nuevo no puede ejecutar el
flujo documentado. Ahí sí hay una promesa publicada y rota.

## 3. La recursión: lo que se esperaba y lo que se midió

Se esperaba tener que inventar un mecanismo. No hizo falta.

`sync --check` sobre el upstream reporta 9 conflictos y 0 escrituras. El modelo de ownership ya se detiene
antes de escribir, que es su contrato desde el principio. El riesgo era real y la protección también; lo que
faltaba era que alguien ejecutara el comando para verlo.

Lo que la medición añadió fue el *por qué* de la irreconciliabilidad. Cuatro rutas marcadas `owner
constructor` no son copias desincronizadas de su semilla: divergen entre 9 y 121 líneas, porque son
documentos distintos para audiencias distintas que comparten ruta. `AGENTS.md` del upstream gobierna a quien
contribuye al runtime; `blueprint/core/AGENTS.md` gobierna a quien lo consume. No hay fusión que mejore
ninguno de los dos.

De ahí sale la regla, y la regla tiene un gate que ya existe: de las 67 creaciones que un bootstrap
intentaría, 26 caen en diez raíces que la allowlist de neutralidad rechaza. Un bootstrap accidental rompe
`npm run check` antes de poder mergearse. La regla no depende de disciplina.

## 4. Por qué la adopción cabe en `.project-os/`

La medición separó limpiamente dos zonas:

- Fuera de `.project-os/`: conflictos irreconciliables y raíces que la neutralidad rechaza.
- Dentro de `.project-os/`: 19 archivos, raíz allowlistada, sembrados como `owner project`, es decir
  seed-once.

Esa asimetría es lo que hace posible una adopción quirúrgica en vez de un bootstrap. Se comprobó con sondas
reales, no por deducción:

```text
tres archivos en .project-os/  ->  readiness-check in situ: PASS 13 | FAIL 0 | EXCEPTION 0
.project-os/debt/ sembrado    ->  debt check: PASS, política y registro válidos
```

El target desechable que hoy hace falta para el Definition of Ready deja de ser necesario.

## 5. El hallazgo que decidió el grupo del motor de deuda

No se adoptó el motor de deuda por coherencia. Se adoptó porque se ejecutó sobre los assessments que el
repositorio ya tenía escritos a mano, y produjo un item abierto:

```text
debt-cdeb7323f2a1 | open | minor | Cuatro specs históricas carecen de Purpose
```

Fechado el 18 de agosto de 2026. Esa deuda se redescubrió por lectura humana en el Issue #42 y se extendió a
los consumidores en el #45. El registro la habría sostenido desde el primer día.

De los diez assessments, ocho capturan sin cambios y dos fallan por un `planOwner` que nombra un plan no
declarado en la configuración sembrada. Es trabajo de migración de dos archivos, no un impedimento.

## 6. Los cuatro veredictos de "corregir el runtime"

Tres huecos que el issue ya había detectado y uno que apareció al medir. Ninguno se resuelve adoptando algo:
lo que falla es el mecanismo distribuido.

| Hallazgo | Por qué es del runtime y no de la adopción |
| --- | --- |
| El doctor no separa forma de consumidor de deuda real | Mientras no lo haga, su salida sobre el upstream es ruido, y sobre un consumidor a medio configurar también. |
| `npm run opsx-check` no puede pasar | Declarado con `--target .`, sale con código 2 y no está en `npm run check`. Un script que no puede pasar es peor que ausente. |
| `codeIndexable` no tiene rama de PASS | `true` produce FAIL siempre; `false`, SKIP siempre. Activar la bandera crearía dos FAIL permanentes sin salida. |
| El conjunto de perfiles activo está fijado en el código | `activationPolicy` promete que una decisión aprobada activa un perfil condicional; `src/readiness.mjs` exige exactamente `documentation` y `harness-tooling`. Medido: activar `library-cli` deja el gate en `PASS 0 | FAIL 1`. |

El último afecta a los consumidores antes que al upstream, y por eso entra al desglose aunque no nazca de la
autoaplicación.

## 7. Dónde se dijo que no, y por qué eso importa

Veinte de los 47 veredictos son negativos. El issue advertía del riesgo de adoptar por coherencia estética,
así que conviene ser explícito sobre los dos grupos donde la tentación era mayor:

- **Adaptadores de agente y MCP.** Sembrarlos exigiría abrir la allowlist de neutralidad a `.claude`,
  `.codex`, `.cursor`, `.opencode` y `.agents`. Esa es una decisión mayor con su propio análisis, y el
  beneficio sería configuración que no activa nada: las skills están `enabled: false` y `servers` está vacío
  por decisión. Durante este mismo trabajo, `.claude/worktrees/` creado por tooling de agentes hizo fallar
  `npm run check`, que es la demostración práctica del costo.
- **Onboarding adaptativo.** Promete llevar a alguien de una carpeta vacía a su primer cambio de producto.
  El upstream lleva nueve changes archivados y no puede volver a ese estado. La promesa no le aplica, y
  decirlo es más honesto que sembrar un clasificador que clasificaría siempre lo mismo.

## 8. Alcance del entregable

Decision record más desglose, igual que el Issue #23. Ninguna adopción se ejecuta aquí. El riesgo de alcance
que el issue anticipaba se controla así: la matriz decide, los issues implementan, y cada issue trae sus
propios criterios observables.
