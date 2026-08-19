# PROMPT_ROUTER_INICIO

Este es el primer prompt del recorrido. Clasifica la carpeta, registra la ruta y decide en qué orden usarás
el [Prompt 00](PROMPT_00_BOOTSTRAP_ENTORNO.md) y el [Prompt 01](PROMPT_01_DISCOVERY_PROYECTO.md). No prepara
el entorno, no ejecuta el bootstrap y no entrevista el producto.

**Antes de pegarlo:** abre tu agente en la raíz de la carpeta del proyecto y sustituye `<VERSION_APROBADA>`
por una versión exacta, por ejemplo `0.1.6`. El agente puede ejecutar el trabajo local de clasificación; debe
detenerse ante autenticación, costos, licencias o mutaciones remotas.

**Disponibilidad:** `onboarding-plan` está en `main` y se publicará en la siguiente versión minor. En un
checkout del repositorio fuente el comando es `node ./bin/project-os.mjs onboarding-plan`. Si tu versión
instalada todavía no lo incluye, empieza directamente por el Prompt 00 y anota que la ruta quedó pospuesta.

Copia únicamente el bloque siguiente en una tarea abierta en la raíz de la carpeta.

```text
Actúa como Principal Engineer y conduce solo la entrada del onboarding. No ejecutes el bootstrap, no
prepares el entorno y no entrevistes el producto: tu trabajo termina cuando la ruta esté registrada y yo
sepa qué prompt sigue.

Usa la versión exacta de Project Engineering OS que te indicaré como <VERSION_APROBADA>. Si falta esa
decisión, detente y pídela; no uses latest ni una copia improvisada.

1. Clasifica sin escribir.
La carpeta todavía no tiene el paquete instalado, así que ejecuta
npx --yes create-project-engineering-os@<VERSION_APROBADA> onboarding-plan --target . --json y reporta
ruta, evidencia, preguntas pendientes, decisiones pospuestas y si el rebootstrap está permitido. En un
repositorio ya bootstrapeado el mismo comando es project-os onboarding-plan --target . --json. Es
read-only: no escribe, no autentica y no contacta servicios remotos.
Preguntas de clasificación: project, guidance, tracker, agent, remoteSetup. No añadas una sexta.
Responder "no sé" o "posponer" es válido: queda registrado y no bloquea el recorrido.

2. Completa solo lo que cambia la ruta o el orden.
Pregunta únicamente las pendientes que importen ahora y guarda las respuestas en onboarding-answers.json.
Repite el paso 1 añadiendo --answers onboarding-answers.json: la bandera existe para que ese archivo no
cuente como evidencia del proyecto, así que no la uses antes de crearlo. No inventes una respuesta y no
deduzcas un tracker leyendo archivos.

3. Registra la decisión. Este paso exige aprobación humana explícita.
Muestra el objeto state completo con su ruta, respuestas, preguntas pendientes, decisiones pospuestas y
hash. Con mi aprobación, escribe ese objeto sin cambios en .project-os/onboarding-state.json y verifica
repitiendo el paso 1 con --state .project-os/onboarding-state.json. Un estado no canónico falla con
recuperación: consérvalo para rollback y regenéralo con el clasificador, nunca a mano.
Sin aprobación no escribas nada y declara el recorrido como provisional.

4. Conduce la ruta registrada y explica justo a tiempo: un concepto cuando aparece, no antes.
Ruta beginner: idea breve, organización práctica, entorno, discovery.
Ruta experienced-new: ecosistema, entorno, discovery.
Ruta brownfield: inventario, preservación, gaps confirmados, discovery.
En beginner pide la idea en dos frases sin stack, explica en dos párrafos por qué issue, tablero, rama,
spec y evidencia evitan que el plan viva solo en un chat, y ofrece posponer el tracker.
En experienced-new revisa restricciones, tracker vigente, agente actual y agente de relevo, y permisos;
resume las decisiones al final en lugar de explicar cada una.
En brownfield inventaría lo detectado sin leer contenido, revisa cada colisión con bootstrap --dry-run,
propone solo gaps confirmados mediante un diff reversible y nunca ejecutes un rebootstrap ciego.

5. Entrega el control sin repetir instrucciones.
Para la Etapa A entrega PROMPT_00_BOOTSTRAP_ENTORNO.md con la ruta registrada y las decisiones abiertas.
Para la Etapa B entrega PROMPT_01_DISCOVERY_PROYECTO.md solo después de que yo apruebe la Etapa A. No
copies el contenido de esos prompts dentro de este recorrido.

6. Relevo entre chats.
Antes de cambiar de etapa o cuando el contexto esté cargado, entrega un bloque de relevo con ruta, estado
de la decisión, preguntas pendientes, decisiones pospuestas, versión aprobada, comandos ya ejecutados,
gates humanos pendientes, rollback y prohibiciones. El bloque no incluye secretos ni valores de tokens.
Recomienda un chat nuevo antes del Prompt 01 si este ya contiene investigación o implementación extensa.

7. Recuperación.
Si no existe .project-os/onboarding-state.json, repite los pasos 1 a 3; no supongas una ruta.
Si el estado es inconsistente, corrupto o viene de un runtime futuro, no lo edites: consérvalo y regenera.
Si el clasificador vuelve a ejecutarse después del bootstrap encontrará los archivos administrados y
elegirá brownfield; eso describe el repositorio actual y no reemplaza la ruta registrada del recorrido.
Si una operación remota falla, explica causa y reintento seguro; la guía manual aparece solo si la pido.

Después del discovery: CI/CD, MVVM, arquitectura, offline, sync e IA se deciden con alternativas, costo,
licencia, evidencia y rollback. Antes del discovery no elijas framework, base de datos, cloud ni UI.

Prohibiciones: no crees, autentiques ni modifiques repositorios, tableros o trackers remotos; no instales
skills ni servidores MCP; no cambies permisos ni protección de rama; no marques nada como listo por tener
configuración presente. Un SKIP o un check ausente no es éxito.
```

Cuando la ruta quede registrada y aprobada, continúa con el [Prompt 00](PROMPT_00_BOOTSTRAP_ENTORNO.md).
Para entender qué detecta la clasificación y cómo responder sus cinco preguntas, revisa el
[contrato del clasificador](../ONBOARDING_PLAN.md). La visión completa está en la
[decisión de onboarding adaptativo](../ADAPTIVE_ONBOARDING.md) y el recorrido por etapas en la
[guía del usuario](../USER_GUIDE.md).
