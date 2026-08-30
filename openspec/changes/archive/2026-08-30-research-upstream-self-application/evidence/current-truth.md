# Verdad actual medida - 30 de agosto de 2026

Todas las cifras salen de ejecutar los comandos del propio proyecto contra su propio repositorio, en un
worktree limpio de `main` en `d662df0`. Ninguna es una estimación.

## 1. Los cuatro comandos sobre el upstream

```text
doctor          --target .   verdict FAIL   PASS 8 | FAIL 6 | WARN 2 | SKIP 13
opsx-check      --target .   exit 2         JSON_READ_FAILED .project-os/openspec-ownership.json
debt check      --root .     exit 0         SKIP debt-config: el motor de deuda no está configurado
readiness-check --target .   FAIL           PASS 0 | FAIL 1 | readiness.configuration ENOENT
```

`.project-os/` contiene un solo archivo: `repository-governance.json`.

## 2. Los seis FAIL del doctor, con su evidencia literal

| Check | Perfil | Evidencia |
| --- | --- | --- |
| `sdd.openspec-local` | universal | `{"manifest":"ausente","lockfile":"ausente","installed":"ausente"}` |
| `release.identity` | harness-tooling | `{"declared":"ausente","installed":"ausente","locked":"ausente","stateName":"ausente"}` |
| `harness.parity` | harness-tooling | `{"mismatches":["state.json"],"planSummary":{"conflicts":9,"creates":67}}` |
| `mcp.configuration` | harness-tooling | `{"source":".project-os/mcp.json","servers":[]}` |
| `github.project` | universal | `{"manifest":"ausente"}` |
| `ci.configuration` | harness-tooling | `{"workflow":"ausente"}` |

`ci.configuration` busca `.github/workflows/project-constructor.yml` o `.yaml` (`src/doctor.mjs`). El
upstream tiene `ci.yml` y `release.yml`, ambos vigentes y con check requerido.

## 3. OpenSpec local: el defecto es real, no de forma

```text
package.json devDependencies:              {"ajv":"8.20.0"}
package-lock.json:                         @fission-ai/openspec ausente; 6 paquetes en total
node_modules del worktree tras npm ci:     sin @fission-ai
node_modules del checkout principal:       @fission-ai/openspec 1.6.0
```

`AGENTS.md` ordena usar el CLI local fijo. Ese CLI existe en una sola copia de trabajo, instalada a mano y
fuera del lockfile, así que ningún worktree ni clon nuevo puede ejecutar el flujo documentado.

## 4. Recursión de ownership: 9 conflictos y 67 creaciones

`sync --check --target .` sobre el upstream. Los nueve conflictos:

| Target | Owner de la semilla | Razón |
| --- | --- | --- |
| `package.json` | project | la semilla colisiona con contenido preexistente |
| `package-lock.json` | project | la semilla colisiona con contenido preexistente |
| `README.md` | project | la semilla colisiona con contenido preexistente |
| `.gitignore` | project | la semilla colisiona con contenido preexistente |
| `openspec/config.yaml` | project | la semilla colisiona con contenido preexistente |
| `AGENTS.md` | constructor | la ruta preexistente no tiene ownership registrado |
| `.github/PULL_REQUEST_TEMPLATE.md` | constructor | la ruta preexistente no tiene ownership registrado |
| `.github/ISSUE_TEMPLATE/change.yml` | constructor | la ruta preexistente no tiene ownership registrado |
| `.github/ISSUE_TEMPLATE/config.yml` | constructor | la ruta preexistente no tiene ownership registrado |

Las cuatro rutas marcadas `owner constructor` no son copias de su semilla: divergen.

```text
.github/PULL_REQUEST_TEMPLATE.md   vs blueprint/core/github/…     46 líneas distintas
.github/ISSUE_TEMPLATE/change.yml  vs blueprint/core/github/…    121 líneas distintas
.github/ISSUE_TEMPLATE/config.yml  vs blueprint/core/github/…      9 líneas distintas
AGENTS.md                          vs blueprint/core/AGENTS.md    53 líneas distintas
```

Son documentos distintos para audiencias distintas que comparten ruta: el del upstream gobierna a quien
contribuye al runtime, el de la semilla gobierna a quien lo consume.

## 5. Las 67 creaciones frente a la neutralidad

| Raíz | Archivos | ¿La allowlist la admite? |
| --- | --- | --- |
| `.project-os` | 19 | sí |
| `docs` | 17 | sí |
| `.github` | 5 | sí |
| `.project-constructor` | 14 | no |
| `.claude` | 3 | no |
| `.cursor` | 2 | no |
| `.agents`, `.codex`, `.opencode` | 3 | no |
| `CLAUDE.md`, `OPENCODE.md`, `opencode.json`, `.mcp.json` | 4 | no |

Diez raíces con 26 archivos que `check:neutrality` rechaza como ruta no permitida. Los 19 archivos de
`.project-os/` son otra historia: `.project-os` está en la allowlist y los 19 se siembran como
`owner project`, es decir seed-once, salvo los tres schemas de deuda, que son `owner constructor`.

## 6. Qué se puede ejecutar in situ hoy mismo, medido

Copiando **tres** archivos del blueprint a `.project-os/` —`readiness-policy.json`, `profiles.json` y
`github/product-os.json` con `project.title` puesto al proyecto real— y sin nada más:

```text
readiness-check --phase propose --issue 46 --target .
Veredicto: PASS | PASS 13 | FAIL 0 | EXCEPTION 0
```

Sin target desechable, sin `git init`, sin bootstrap y sin remote añadido a mano.

Copiando `.project-os/debt/` —config, registry y los tres schemas—:

```text
debt check --root .
PASS  debt-config: Politica y registro validos (0 item(s)).
PASS  plan-product-roadmap: Plan activo: 0/5 unidades, 0 flujo(s) con deuda abierta.
```

Las tres rutas caen dentro de `.project-os/`, que la allowlist ya admite. Ninguna toca las diez raíces que
la neutralidad rechaza.

## 7. El motor de deuda sobre los assessments que ya existen

`debt capture` se ejecutó sobre los diez assessments escritos a mano en `openspec/changes/**/evidence/`:

```text
7 capturados sin cambios
1 capturado creando un item de registro: harden-supply-chain-policy
2 rechazados: orchestrate-onboarding-prompts y revalidate-agent-adapters
  assessment.candidates[0].planOwner: debe referir un plan declarado en config.plans
```

El item creado es este:

```text
debt-cdeb7323f2a1 | open | minor | Cuatro specs históricas carecen de Purpose
  artifact:    openspec/specs/{debt-control,distribution,runtime,upgrade}/spec.md
  planOwner:   product-roadmap
  remediation: Resolver el Issue #25 mediante un change documental que añada Purpose
```

Es exactamente la deuda que el Issue #25 cerró, el Issue #42 volvió a encontrar y el Issue #45 extendió a
los consumidores. Estaba escrita, fechada y clasificada desde el 18 de agosto de 2026, y ningún registro la
sostuvo, así que se redescubrió por lectura humana dos veces más.

## 8. Perfiles: la política promete una ruta que el runtime prohíbe

`blueprint/core/project-os/profiles.json` declara
`activationPolicy.decisionArtifactRequiredForConditionalProfiles: true`, es decir, que una decisión aprobada
activa un perfil condicional. `src/readiness.mjs` exige que el conjunto activo sea exactamente
`documentation` y `harness-tooling`.

Medido activando `library-cli` por decisión del consumidor:

```text
readiness-check --phase propose --issue 46 --target .
Veredicto: FAIL | PASS 0 | FAIL 1 | EXCEPTION 0
[FAIL] readiness.configuration
  Causa: Policy/profiles/Product OS no cumplen el contrato runtime v1: profiles.
  Recuperación: Restaura .project-os/readiness-policy.json, product-os y profiles desde la fuente canónica.
```

El gate entero deja de funcionar y la recuperación pide deshacer la decisión aprobada. La causa nombra
`profiles` sin decir qué parte, así que un consumidor no puede diagnosticarlo desde la salida.

## 9. Inteligencia de código: la bandera no tiene salida

`src/doctor.mjs` resuelve `code-intelligence.gitnexus` y `code-intelligence.codegraph` así:

```text
codeIndexable === true  -> FAIL siempre
codeIndexable !== true  -> SKIP siempre
```

No existe rama que produzca PASS. Activar la bandera sobre este árbol crearía dos FAIL permanentes sin ruta
de salida. `code-intelligence.graphify` es `SKIP` fijo, retirado del runtime activo.

La premisa del SKIP —"el repositorio todavía contiene solo gobernanza/tooling"— es falsa hoy:

```text
src      13 460 líneas en 38 archivos
test      5 990 líneas en 23 archivos
scripts   2 781 líneas en 21 archivos
```

Y el catálogo de herramientas ya tiene veredicto para el proveedor: `structural-code-intelligence` está
`postponed`, con licencia, costo y autenticación en `unknown` porque no hay candidato elegido.

## 10. Cobertura de spec

```text
grep "opsx-check"      openspec/specs/*/spec.md  -> sin resultados
grep "readiness-check" openspec/specs/*/spec.md  -> sin resultados
```

Dos comandos publicados de los que dependen los consumidores no tienen requisito que los cubra. El PR #47
añade un requisito sobre el gate de Purpose dentro de `opsx-check`, no el contrato del comando.

## 11. El detector de marcadores rechaza una palabra española corriente

`PLACEHOLDER_PATTERNS` en `src/readiness.mjs` aplica cuatro patrones a **cualquier** string de la metadata
pre-propose. Uno de los tokens prohibidos es homógrafo de una palabra española de uso diario.

Medido sobre una frase real escrita para el desglose de este mismo spike:

```text
entrada:  "src/readiness.mjs con los cuatro patrones y su aplicacion a todo valor de texto"
resultado: patron 2 coincide con: "todo"
```

La palabra que en español significa la totalidad coincide letra por letra con un marcador inglés de la
lista. Este repositorio escribe sus issues y su documentación en español, así que no es un caso límite:
es una colisión sistemática con el idioma de la metadata.

El mensaje de fallo agrava el problema:

```text
[FAIL] metadata.placeholders
  La metadata conserva placeholders en: <rutas de campo>
```

Nombra los campos, no el token. Con varios campos afectados a la vez, la causa no es diagnosticable desde
la salida: hay que leer el código para descubrir qué palabra concreta está prohibida.

## 12. Lo que sí se aplica, confirmado

| Mecanismo | Evidencia |
| --- | --- |
| SDD vía OpenSpec | 9 changes archivados con los seis artefactos requeridos; 7 specs válidas en estricto |
| Revisión adversarial | `evidence/adversarial-review.md` en 9 de 9 changes |
| Assessment por change | `evidence/debt-assessment.json` en 10 de 10 flujos |
| QA | `npm run check`, 235 pruebas, matriz de 3 SO por 2 versiones de Node, auditoría, Socket, check requerido |
| Gobernanza | Issue enriquecido, Definition of Ready, PR protegido, prohibición de autoaprobación, DCO |
| Release | tarball único, checksum, GitHub Release y npm provenance |

De estos, tres se aplican **por costumbre y no por gate**: nada verifica que un change traiga revisión
adversarial, nada verifica el assessment, y el Definition of Ready se ejecuta a mano sobre un andamio.
