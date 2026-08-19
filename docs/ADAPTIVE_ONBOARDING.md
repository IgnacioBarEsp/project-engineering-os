# Decisión: onboarding adaptativo

Estado: **spike aprobado para implementación por partes**  
Última verificación de fuentes: **18 de agosto de 2026**  
Issue de origen: [#23](https://github.com/IgnacioBarEsp/project-engineering-os/issues/23)

Esta decisión explica cómo debería empezar Project Engineering OS con personas y repositorios distintos.

## Estado actual por piezas

- El clasificador read-only y el estado canónico de [#30](https://github.com/IgnacioBarEsp/project-engineering-os/issues/30)
  ya están implementados en `main`, pendientes de la siguiente release minor. Consulta
  [`onboarding-plan`](ONBOARDING_PLAN.md).
- El [prompt router](prompts/PROMPT_ROUTER_INICIO.md) de #31 ya orquesta Prompt 00 y Prompt 01 por ruta y
  registra el estado bajo aprobación humana, también en `main`.
- Adaptadores, trackers remotos y catálogo seguro siguen separados en #32, #33 y #34.

Por tanto, detectar, clasificar y conducir el recorrido hasta discovery ya es comportamiento verificable en
el source actual; configurar el ecosistema remoto completo todavía es visión en desarrollo.

## Decisión en un minuto

1. El CLI inspeccionará primero el repositorio sin escribir nada.
2. Hará hasta cinco preguntas breves y elegirá una de tres rutas: principiante, proyecto nuevo con una
   persona experimentada o brownfield.
3. La conversación podrá cambiar el orden, pero el CLI mantendrá un plan local determinista.
4. Se conservará el tracker existente. GitHub Projects será el default solo para un repositorio GitHub sin
   tracker ni restricción organizacional.
5. Ninguna cuenta, skill, MCP, repositorio o tablero se configurará sin preview y autorización explícita.
6. CLI, skills y MCP no son alternativas equivalentes: cada uno tendrá una responsabilidad concreta.
7. CI/CD, MVVM y cualquier arquitectura del producto se decidirán después del discovery.

## Por qué hace falta adaptar el inicio

Un tablero no es “más proceso”. Es un registro común de qué se quiere lograr, qué está activo, qué bloquea y
qué evidencia falta. Evita que el plan viva solo en un chat que puede terminar, compactarse o cambiar de
agente.

Eso no obliga a todas las personas a recibir la misma explicación:

- quien viene de vibe coding necesita entender el valor antes de configurar herramientas;
- quien ya conoce su forma de trabajo necesita llegar rápido a las decisiones del entorno;
- un repositorio existente necesita preservación antes que instalación.

La entrada de [Spec Kit](https://github.com/github/spec-kit/blob/main/docs/index.md) confirma una idea útil:
un CLI puede instalar adaptadores por agente y mantener un proceso común. Project Engineering OS añadirá una
diferencia: el orden inicial también dependerá de la persona y de la evidencia del repositorio.

## Clasificador

El contrato ejecutable de esta sección está documentado en [Clasificar el inicio](ONBOARDING_PLAN.md).

### Inspección read-only

Antes de preguntar, el CLI deberá comprobar:

- si la carpeta pertenece a un repositorio Git y tiene historial;
- si hay código, manifiestos, documentación o trabajo sin commit;
- si existen `AGENTS.md`, `CLAUDE.md`, reglas, skills o configuración MCP;
- si el remoto apunta a GitHub, Azure Repos, GitLab u otro proveedor;
- si ya hay referencia a GitHub Projects, Azure Boards, Jira u otro tracker;
- si existen CI, despliegue, arquitectura o perfiles de validación vigentes.

Una señal brownfield tiene prioridad sobre la experiencia declarada. Ser principiante no autoriza a
reemplazar un ecosistema existente.

### Preguntas de clasificación

El primer diálogo tendrá un máximo inicial de cinco preguntas. La persona podrá responder “no sé” o
posponer sin bloquear el bootstrap.

1. ¿La carpeta contiene un proyecto que debemos conservar o empezamos desde cero?
2. ¿Prefieres que explique cada decisión o una ruta breve con revisión al final?
3. ¿Tu equipo ya usa GitHub Projects, Azure Boards, Jira u otro lugar para organizar trabajo?
4. ¿Qué agente usarás ahora y existe otro que deba poder continuar el trabajo?
5. ¿Puedo preparar solo un plan local o quieres revisar después opciones de configuración remota?

No pregunta todavía por framework, cloud, base de datos, MVVM ni pipeline de producto.

## Matriz de rutas

| Ruta | Señal de entrada | Orden | Qué explica | Gate de salida |
| --- | --- | --- | --- | --- |
| Principiante o vibe coding | Carpeta nueva, sin tracker y preferencia por guía | Idea breve → organización y tracker → entorno → discovery | Por qué issue, tablero, rama, spec y evidencia evitan perder contexto | Entiende el plan, aprueba setup local y decide tracker o posponer |
| Experimentado, proyecto nuevo | Carpeta nueva y preferencia por ruta breve | Entorno y restricciones → tracker → discovery | Trade-offs, defaults y diferencias entre agentes | Aprueba el ecosistema neutral y sus decisiones pendientes |
| Brownfield | Código, historial o herramientas existentes | Inventario → preservar → gaps → discovery | Qué se conserva, qué falta y qué podría entrar en conflicto | Aprueba un diff sin sobrescrituras ni rebootstrap ciego |

Las tres rutas terminan en el mismo discovery. Cambia el orden y la profundidad de la explicación, no el
contrato de evidencia.

## Política de tracker

### Regla principal

**Conservar el tracker que ya usa el equipo.** Migrar por preferencia del agente introduce trabajo, pérdida
de historia y lock-in sin resolver una necesidad del producto.

Cuando no existe tracker:

| Contexto | Recomendación | Razón |
| --- | --- | --- |
| Repositorio en GitHub, sin restricción organizacional | GitHub Projects | Issues, PRs, tabla, board y roadmap permanecen junto al código |
| Organización ya operada en Azure DevOps | Azure Boards | Conserva work items, backlogs, sprints, trazabilidad y políticas existentes |
| Equipo ya operado en Atlassian | Jira | Conserva Scrum/Kanban, JQL, permisos y flujos acordados |
| Proyecto local, experimento corto o sin autorización remota | Posponer | Un registro local es suficiente hasta conocer colaboración y distribución |

[GitHub Projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects) es flexible y no
impone una metodología. [Azure Boards](https://learn.microsoft.com/en-us/azure/devops/boards/get-started/what-is-azure-boards?view=azure-devops)
aporta work items, backlogs, sprints y planes entre equipos. [Jira](https://support.atlassian.com/jira-software-cloud/docs/create-and-plan-work-with-scrum-and-kanban/)
encaja cuando Scrum/Kanban y el ecosistema Atlassian ya son parte del trabajo.

“Posponer” deberá registrar la razón, el owner y cuándo revisar la decisión. No es un fallo.

## Autorización de acciones remotas

Configurar un archivo local y cambiar un servicio remoto son operaciones distintas. El flujo remoto deberá
usar estos estados:

1. **Plan local:** detectar proveedor y generar un preview sin pedir credenciales.
2. **Resumen:** mostrar recursos, campos, permisos, datos enviados, costo y rollback.
3. **Autorización:** pedir aprobación para una operación concreta; una aprobación no se reutiliza para
   ampliar scopes ni crear otros recursos.
4. **Aplicación:** el agente intenta ejecutar la operación mediante una interfaz oficial.
5. **Verificación:** relee el recurso y guarda un receipt sin secretos.
6. **Recuperación:** si falla, explica la causa y reintento seguro. La guía manual aparece solo si la persona
   la pide o la automatización no puede continuar.
7. **Rollback:** revierte solo lo creado por el receipt o propone una reconciliación cuando ya hubo cambios
   ajenos.

Los defaults serán preview, scopes mínimos y lectura antes de escritura. El servidor MCP oficial de GitHub,
por ejemplo, permite modo read-only y allowlist de tools/toolsets; eso es preferible a exponer todo el API.

## Qué corresponde a cada superficie

| Superficie | Responsabilidad | No debe hacer |
| --- | --- | --- |
| Conversación | Explicar, entrevistar, resumir decisiones y pedir gates humanos | Ser la única fuente del estado |
| CLI | Detectar, validar, generar plan/receipts, aplicar cambios locales y comprobar drift | Inventar respuestas del usuario o usar secretos literales |
| Skill | Enseñar el flujo de entrevista y recuperación cuando la tarea lo requiere | Activarse como dependencia universal o auto-instalar terceros |
| MCP | Consultar contexto vivo o realizar acciones mediante tools delimitadas | Probar éxito por estar configurado o iniciado |
| Documentación | Explicar conceptos, alternativas, seguridad y ruta manual | Duplicar estado efímero de una sesión |
| Integración remota | Crear/configurar el recurso autorizado y verificarlo | Mutar antes del preview o ampliar permisos en silencio |

### CLI + skill o MCP

- **CLI + skill** es el default para tareas deterministas, repetibles y fáciles de probar: bootstrap,
  validaciones, generación de archivos, Playwright en CI y consultas breves de documentación.
- **MCP** se usa para estado vivo, APIs remotas, exploración iterativa o sesiones donde conservar contexto
  de una herramienta compensa su schema y salida en el contexto del modelo.
- **Ambos** pueden convivir, pero la presencia de MCP no reemplaza tests ni receipts.

El propio proyecto de [Playwright MCP](https://github.com/microsoft/playwright-mcp) recomienda considerar
CLI + skills para agentes de código por eficiencia de contexto, y reservar MCP para introspección persistente
o loops exploratorios. Playwright MCP tampoco es una frontera de seguridad.

## Compatibilidad por agente

“Capacidad oficial” describe al producto del proveedor. “Soporte actual” describe únicamente lo que Project
Engineering OS genera y valida en
[`harness-capabilities.json`](../blueprint/core/project-os/harness-capabilities.json). Las skills y los MCP
que el constructor conoce hoy permanecen en
[`skills.json`](../blueprint/core/project-os/skills.json) y
[`mcp.json`](../blueprint/core/project-os/mcp.json).

| Agente | Capacidad oficial verificada | Soporte actual del constructor | Objetivo y degradación |
| --- | --- | --- | --- |
| Claude Code | `CLAUDE.md`, Agent Skills, MCP y permisos | Instrucciones, skills y MCP native; path rules y permisos documented | Conservar adapter; añadir receipt de runtime. Si una regla no es representable, mantenerla visible en `AGENTS.md`/`CLAUDE.md` |
| Codex | `AGENTS.md`, Agent Skills y MCP | Instrucciones, skills y MCP native; path rules y permisos documented | Conservar adapter y separar configuración, tool listing y smoke. Mantener reglas no representables en `AGENTS.md` |
| Cursor | Rules/`AGENTS.md`, Agent Skills y MCP | Instrucciones y MCP native; skills unsupported; permisos documented | Añadir adapter de skill y fixture específico. Hasta entonces, procedimiento visible en rules/`AGENTS.md` |
| GitHub Copilot | Custom instructions, Agent Skills y MCP; el detalle cambia entre cloud, CLI e IDE | Solo instrucciones native; skills, permisos y MCP unsupported | Crear adapters por superficie, nunca una fila genérica. Hasta entonces, docs y configuración manual explícita |
| OpenCode | Config de agentes, skills on-demand, MCP y permisos allow/ask/deny | Instrucciones y skills generated; MCP native; permisos documented | Verificar carga/permiso en runtime y conservar fallback en `AGENTS.md`/`.opencode/project-os.md` |

Fuentes: [Claude Code extensions](https://code.claude.com/docs/en/features-overview),
[Claude Code MCP](https://code.claude.com/docs/en/mcp),
[Codex skills](https://learn.chatgpt.com/docs/build-skills),
[Codex MCP](https://learn.chatgpt.com/docs/extend/mcp?surface=cli),
[Cursor Agent Skills](https://cursor.com/changelog/2-4),
[Cursor MCP](https://docs.cursor.com/context/model-context-protocol),
[Copilot Agent Skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills),
[Copilot MCP](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/configure-mcp-servers),
[OpenCode skills](https://opencode.ai/docs/skills) y
[OpenCode agents/permisos](https://opencode.ai/docs/agents).

### Antigravity

Google ya documenta Antigravity 2.0, IDE, CLI y SDK, y muestra AGENTS.md, SKILL.md y MCP en sus superficies.
Eso lo vuelve un candidato real, pero **no soportado por Project Engineering OS**. Entrará a la matriz solo
cuando exista renderer, fixture aislado, versión mínima, permisos, degradación y smoke documentados. Fuente:
[Google Cloud: superficies de Antigravity](https://cloud.google.com/blog/topics/developers-practitioners/choosing-your-surface-antigravity-20-antigravity-cli-antigravity-ide-or-antigravity-sdk)
y [codelab oficial](https://codelabs.developers.google.com/getting-started-agy-ide).

## Catálogo de herramientas

Los precios y términos de SaaS cambian. “Costo” indica la postura del core; el plan exacto se vuelve a
verificar al activar.

### Universales

| Herramienta/formato | Licencia/costo | Auth y datos | Rollback | Decisión |
| --- | --- | --- | --- | --- |
| Project Engineering OS | MIT; costo incremental cero | Sin auth para bootstrap local; lee/escribe el repo objetivo | Transaction receipt, rollback y revert | Universal |
| OpenSpec fijado por el consumidor | MIT; costo cero; telemetría desactivada en scripts del proyecto por default | Sin cuenta para flujo local; artefactos del repo | Revert de artifacts/change | Universal para cambios versionados no triviales |
| Agent Skills como formato | El estándar no licencia cada skill; cada paquete debe declarar la suya | Sin auth por sí mismo; scripts pueden leer archivos, red o env | Eliminar/revertir directorio y revocar accesos del script | Formato universal, contenido siempre curado |
| Git + instrucciones del repositorio | Git conserva su licencia; costo cero | Datos locales y remoto elegido por el usuario | Branch/revert y restauración de instrucciones | Universal |

La [especificación Agent Skills](https://agentskills.io/specification) permite `SKILL.md`, scripts,
referencias y assets, con campos de licencia y compatibilidad. `allowed-tools` sigue siendo experimental y no
se puede tratar como una frontera portable.

### Condicionales

| Herramienta | Licencia/costo | Auth | Datos enviados | Rollback | Cuándo entra |
| --- | --- | --- | --- | --- | --- |
| GitHub Projects / GitHub MCP oficial | Servicio bajo términos/plan GitHub; servidor MCP MIT | `gh`, OAuth o token fine-grained; mínimo `read:project` antes de write | Repo, issues, PRs, Project y operaciones habilitadas | Receipt, borrar/reconciliar items creados, revocar auth y quitar config | Repo GitHub sin tracker o equipo ya en GitHub |
| Azure Boards | SaaS bajo términos/plan Microsoft | Identidad Entra/Azure DevOps y scopes de work items | Work items, boards, identidad y trazabilidad | Receipt, revertir campos/items y revocar conexión | Organización ya operada en Azure DevOps |
| Jira | SaaS bajo términos/plan Atlassian | OAuth/API autorizado con scopes mínimos | Issues, board, campos, usuarios según scope | Receipt, restaurar esquema/items y revocar conexión | Equipo ya operado en Atlassian |
| Playwright Test / CLI + skill | Apache-2.0; costo local/CI | Sin auth salvo la app bajo prueba | URLs, DOM, capturas, traces y credenciales de test si se proporcionan | Quitar paquete/config/browser artifacts; revertir tests | UI web o flujo browser verificable |
| Playwright MCP | Apache-2.0; costo local/CI y más contexto | Según cliente/app; puede usar sesión de navegador | Accessibility tree, páginas, archivos y acciones permitidas | Quitar servidor/config y limpiar perfil/session | Exploración persistente o loop agentic; no default de CI |
| Context7 CLI + skill o MCP | Repositorio MIT; servicio/plan se verifica al activar | OAuth/API key opcional/recomendada por proveedor | Nombre/versión de librería y consulta reformulada | `ctx7 remove`, quitar MCP/skill y revocar key | APIs o librerías que cambian con rapidez |
| Inteligencia estructural de código | Licencia/costo depende del proveedor | Normalmente local; algunos servicios requieren cuenta | Índice o código según implementación | Borrar índice/config y volver a búsqueda local | Brownfield o impacto/call chains; nunca por presencia solamente |

Fuentes: [Playwright Test](https://playwright.dev/docs/intro),
[Context7](https://github.com/upstash/context7),
[GitHub MCP](https://github.com/github/github-mcp-server) y
[arquitectura MCP](https://modelcontextprotocol.io/docs/learn/architecture).

### No predeterminadas

- instalar skills encontradas en la web sin revisión y consentimiento;
- activar todo el catálogo MCP o usar `*` cuando existe una allowlist menor;
- usar Playwright MCP como sustituto automático de tests versionados;
- elegir tracker antes de detectar remoto, organización y trabajo vigente;
- generar CI/CD, MVVM, microservicios, cloud o base de datos antes del discovery;
- declarar Antigravity soportado por similitud de archivos;
- interpretar configuración, startup o `tools/list` como autenticación y funcionamiento comprobados.

## Investigación segura de skills

La IA puede investigar y proponer; no puede instalar por inferencia.

1. Buscar primero documentación oficial, repositorio del autor o catálogo organizacional aprobado.
2. Fijar URL, owner, commit/tag/versión y fecha. Evitar referencias flotantes como `latest` en un plan
   aprobado.
3. Leer `SKILL.md` completo y todos los scripts/recursos que pueda ejecutar o cargar.
4. Registrar licencia, compatibilidad, herramientas, comandos, red, filesystem, secretos, datos, costo y
   mantenimiento.
5. Revisar prompt injection, descargas en runtime, código ofuscado, escalamiento de permisos y escrituras
   fuera del repo.
6. Comparar contra una skill local mínima o documentación; no adoptar si la complejidad no aporta valor.
7. Presentar diff, riesgos, rollback y decisión `aprobar`, `rechazar` o `posponer`.
8. Solo después de aprobación, instalar en un branch/entorno aislado, validar y registrar receipt.

La seguridad MCP exige igualmente tokens dirigidos al servidor, no passthrough, y scopes progresivos de
menor privilegio. Véase [MCP Security Best Practices](https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices).

## Arquitectura, CI/CD y patrones

Project Engineering OS sí instala gobierno y checks del propio harness. Eso no decide la arquitectura ni el
delivery del producto consumidor.

Después del discovery, el agente puede proponer:

- CI cuando exista un build/test repetible y un repositorio remoto que lo justifique;
- CD cuando estén definidos ambiente, secretos, distribución, rollback y costo;
- MVVM, MVC, hexagonal u otro patrón cuando plataforma, tamaño, estado y equipo lo necesiten;
- offline, sync, multiusuario o IA solo cuando el producto lo exija.

Cada propuesta debe incluir al menos una alternativa, costo, licencia, mantenimiento, lock-in, evidencia y
rollback. Para un script pequeño, no elegir una arquitectura también puede ser la decisión profesional.

## Amenazas y controles

| Amenaza | Consecuencia | Control obligatorio |
| --- | --- | --- |
| Sobrescribir brownfield | Pérdida de trabajo o configuración | Inventario, diff, backups/receipts y aprobación por colisión |
| Prompt injection en skill/docs/MCP | Ejecución o exfiltración no intencional | Procedencia fijada, revisión completa, allowlist y entorno restringido |
| Token con scopes amplios | Mayor radio de impacto | Lectura primero, scopes incrementales, token dirigido y revocación |
| Tracker impuesto | Lock-in y doble fuente de verdad | Conservar tracker existente y modelo canónico local |
| Matriz obsoleta | Promesas falsas y adapters rotos | Fecha, fuente oficial, versión mínima y fixture de runtime |
| Costos silenciosos | Facturación o dependencia inesperada | Gate de costo/licencia antes de activar |
| Guía manual prematura | Fricción y errores evitables | Agente intenta la operación aprobada; guía solo a petición o fallo |
| Onboarding excesivo | Abandono antes del discovery | Cinco preguntas de clasificación, explicación justo a tiempo y posponer válido |

## Recorridos en papel

### 1. Principiante con una idea

1. Carpeta vacía; el CLI no encuentra Git ni tracker.
2. La persona dice que quiere crear una app y prefiere explicaciones.
3. El agente explica en dos párrafos issue, board y por qué el plan no debe vivir solo en el chat.
4. Recomienda GitHub Projects únicamente después de saber que usará GitHub; también ofrece posponer.
5. Genera preview local. No autentica ni crea nada.
6. Con aprobación, prepara entorno y verifica Prompt 00.
7. Si autoriza GitHub, crea repo/Project, relee el resultado y guarda receipt. Si falla, ofrece recuperación.
8. Empieza Prompt 01; stack y arquitectura se preguntan al final.

Resultado: entiende el sistema sin memorizar SDD y conserva decisiones reversibles.

### 2. Desarrollador experimentado, proyecto nuevo

1. Carpeta vacía; solicita una ruta breve y declara Azure Boards organizacional.
2. El agente conserva Azure Boards y no recomienda GitHub Projects aunque el remoto pudiera ser GitHub.
3. Presenta decisiones del ecosistema, permisos y compatibilidad del agente elegido.
4. Genera el plan local y deja la integración Azure pendiente de autorización.
5. Completa Prompt 00 y pasa a discovery.
6. Solo tras conocer plataforma y despliegue propone CI/CD y alternativas arquitectónicas.

Resultado: no recibe una clase innecesaria ni pierde las políticas de su organización.

### 3. Repositorio brownfield

1. El CLI encuentra código, CI, `AGENTS.md`, Cursor rules y Jira referenciado.
2. Fuerza ruta brownfield aunque la persona pida “instalar todo”.
3. Inventaría archivos, herramientas, tracker, conflictos y gaps sin escribir.
4. Conserva Jira y los workflows; muestra que el constructor actual no renderiza skills de Cursor.
5. Propone un adapter futuro o fallback documental, no declara paridad.
6. La persona aprueba solo cambios locales sin colisiones.
7. El discovery se centra en hechos y decisiones abiertas; no pregunta desde cero lo que ya está documentado.

Resultado: adopción incremental, sin bootstrap destructivo ni doble tracker.

## Desglose de implementación

El spike se implementará en cambios separados. Cada uno necesita su propio DoR, spec y evidencia:

1. [#30 — Clasificador y estado canónico](https://github.com/IgnacioBarEsp/project-engineering-os/issues/30):
   implementado en `main`, pendiente de release minor.
2. [#31 — Orquestación del prompt inicial, Prompt 00 y Prompt 01](https://github.com/IgnacioBarEsp/project-engineering-os/issues/31):
   implementado en `main` como [prompt router](prompts/PROMPT_ROUTER_INICIO.md), pendiente de release minor.
3. [#32 — Adaptadores y fixtures por agente](https://github.com/IgnacioBarEsp/project-engineering-os/issues/32).
4. [#33 — Planner/apply autorizado para trackers](https://github.com/IgnacioBarEsp/project-engineering-os/issues/33).
5. [#34 — Catálogo curado e investigación segura](https://github.com/IgnacioBarEsp/project-engineering-os/issues/34).

El cambio remoto de #33 depende del contrato ya corregido en
[#20](https://github.com/IgnacioBarEsp/project-engineering-os/issues/20) y no se mezcla con el clasificador
local.

## Fuentes principales

- [GitHub Spec Kit](https://github.com/github/spec-kit/blob/main/docs/index.md)
- [Agent Skills specification](https://agentskills.io/specification)
- [MCP architecture](https://modelcontextprotocol.io/docs/learn/architecture)
- [MCP security](https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices)
- [Playwright Test](https://playwright.dev/docs/intro) y [Playwright MCP](https://github.com/microsoft/playwright-mcp)
- [Context7](https://github.com/upstash/context7)
- [GitHub Projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects)
- [Azure Boards](https://learn.microsoft.com/en-us/azure/devops/boards/get-started/what-is-azure-boards?view=azure-devops)
- [Jira Scrum/Kanban](https://support.atlassian.com/jira-software-cloud/docs/create-and-plan-work-with-scrum-and-kanban/)
- Fuentes oficiales de agentes enlazadas en la matriz de compatibilidad.
