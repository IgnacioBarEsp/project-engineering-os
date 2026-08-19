# PROMPT_ROUTER_INICIO

Es el primer prompt del recorrido: clasifica la carpeta, registra la ruta y decide en qué orden usar
[Prompt 00](PROMPT_00_BOOTSTRAP_ENTORNO.md) y [Prompt 01](PROMPT_01_DISCOVERY_PROYECTO.md). No prepara el
entorno ni entrevista el producto. Copia este bloque en una tarea abierta en la raíz de la carpeta:

```text
Actúa como Principal Engineer y conduce solo la entrada del onboarding. No ejecutes el bootstrap, no
prepares el entorno y no entrevistes el producto. Usa la versión exacta que te indique como
<VERSION_APROBADA>; si falta esa decisión, detente y pídela.

1. Clasifica sin escribir con project-os onboarding-plan --target . --json, o con
npx --yes create-project-engineering-os@<VERSION_APROBADA> onboarding-plan --target . --json si la carpeta
todavía no tiene el paquete instalado. Reporta ruta, evidencia, preguntas pendientes, decisiones
pospuestas y rebootstrap permitido.
Preguntas de clasificación: project, guidance, tracker, agent, remoteSetup. No añadas una sexta.
Responder "no sé" o "posponer" es válido y queda registrado.

2. Pregunta solo las pendientes que cambian la ruta o el orden y guarda las respuestas en
onboarding-answers.json. Repite el paso 1 añadiendo --answers onboarding-answers.json, nunca antes de
crearlo, para que ese archivo no cuente como evidencia. No inventes respuestas ni deduzcas un tracker
leyendo archivos.

3. Registra la decisión. Este paso exige aprobación humana explícita. Muestra el objeto state completo;
con aprobación escríbelo sin cambios en .project-os/onboarding-state.json y verifica repitiendo el paso 1
con --state .project-os/onboarding-state.json. Un estado no canónico se conserva para rollback y se
regenera con el clasificador, nunca a mano. Sin aprobación no escribas nada y declara el recorrido
provisional.

4. Conduce la ruta registrada y explica justo a tiempo, un concepto cuando aparece.
Ruta beginner: idea breve, organización práctica, entorno, discovery.
Ruta experienced-new: ecosistema, entorno, discovery.
Ruta brownfield: inventario, preservación, gaps confirmados, discovery.
En beginner pide la idea en dos frases sin stack y explica por qué issue, tablero, rama, spec y evidencia
evitan que el plan viva solo en un chat. En experienced-new revisa restricciones, tracker vigente, agentes
y permisos, y resume al final. En brownfield inventaría sin leer contenido, revisa colisiones con
bootstrap --dry-run, propone solo gaps confirmados y nunca un rebootstrap ciego.

5. Entrega el control sin repetir instrucciones: PROMPT_00_BOOTSTRAP_ENTORNO.md para la Etapa A y
PROMPT_01_DISCOVERY_PROYECTO.md solo después de que se apruebe la Etapa A.

6. Relevo entre chats: entrega ruta, estado de la decisión, pendientes, pospuestas, versión aprobada,
comandos ejecutados, gates humanos, rollback y prohibiciones, sin secretos. Recomienda chat nuevo antes
del Prompt 01 si el contexto ya está cargado.

7. Recuperación: sin estado registrado repite los pasos 1 a 3 y no supongas una ruta; un estado corrupto o
futuro se conserva y se regenera; una reclasificación posterior al bootstrap describe el repositorio
actual y no reemplaza la ruta registrada.

Después del discovery: CI/CD, MVVM, arquitectura, offline, sync e IA se deciden con alternativas, costo,
licencia, evidencia y rollback. Antes no elijas framework, base de datos, cloud ni UI.

No crees, autentiques ni modifiques repositorios, tableros o trackers remotos; no instales skills ni MCP;
no cambies permisos ni protección de rama. Un SKIP o un check ausente no es éxito.
```
