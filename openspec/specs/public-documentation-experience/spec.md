# public-documentation-experience Specification

## Purpose
Definir cómo la entrada pública explica el producto antes del detalle técnico, mantiene un inicio rápido fiel
al CLI publicado y ofrece navegación progresiva con recursos accesibles, separando la verdad verificable de
hoy de la capacidad solo decidida y declarando costo, control y rollback de cada integración recomendada.
## Requirements
### Requirement: La entrada pública explica el producto antes del detalle técnico
La documentación pública SHALL presentar propósito, usuario, flujo principal y resultado antes de exponer
contratos internos o rutas operativas extensas. El README SHALL conservar acceso al detalle técnico en dos
saltos o menos.

#### Scenario: Una persona descubre el repositorio
- **WHEN** abre el README sin contexto previo
- **THEN** puede identificar qué es Project Engineering OS, para quién sirve y cómo organiza un cambio
- **AND** encuentra una ruta explícita hacia la documentación técnica

### Requirement: El inicio rápido es reproducible y fiel al CLI
El inicio rápido SHALL priorizar Companion para la persona que quiere preparar un proyecto desde la
interfaz. SHALL enlazar una release publicada identificada, plataforma y guía de instalación con sus
límites. La ruta CLI secundaria SHALL usar comandos comprobados contra la versión publicada vigente
y SHALL mencionar solo agentes soportados por la matriz versionada. La documentación SHALL distinguir
la preparación actual de las capacidades futuras de onboarding.

#### Scenario: Una persona prueba el proyecto en una carpeta nueva
- **WHEN** sigue el inicio rápido de Companion en la plataforma soportada
- **THEN** encuentra la descarga, revisión del plan y siguiente paso sin tener que instalar npm o Node globalmente
- **AND** puede identificar qué versión está descargando y qué aún no se publicó

#### Scenario: Una persona elige automatizar desde la terminal
- **WHEN** abre la ruta CLI con un runtime soportado
- **THEN** obtiene un entorno gobernado con comandos versionados completos
- **AND** el prompt siguiente corresponde al flujo existente y no sobrescribe decisiones del producto

#### Scenario: Una capacidad futura todavía no está implementada
- **WHEN** el README habla de tableros, skills, MCP o adaptación por experiencia
- **THEN** distingue instalación, configuración, ejecución verificada y capacidad pendiente con su referencia
- **AND** no afirma que copiar instrucciones active automáticamente herramientas o servicios

### Requirement: Los recursos visuales complementan información accesible
Los recursos visuales SHALL ser locales, tener texto alternativo útil, conservar contraste WCAG AA y
representarse sobre fondos claros y oscuros. Ningún comando, requisito o límite esencial SHALL existir
únicamente dentro de una imagen.

#### Scenario: Una imagen no carga o no puede percibirse
- **WHEN** el recurso visual falta o se consume mediante tecnología asistiva
- **THEN** el contenido Markdown conserva el propósito y el recorrido operativo
- **AND** el texto alternativo explica la función de la pieza sin repetir decoración

#### Scenario: GitHub cambia entre tema claro y oscuro
- **WHEN** el README se renderiza sobre cualquiera de los dos fondos
- **THEN** el recurso mantiene bordes, texto y jerarquía legibles

### Requirement: La dirección visual requiere aprobación humana
El sistema SHALL comparar dos propuestas con el mismo contenido antes de publicar una identidad final. La
selección SHALL quedar registrada y solo la alternativa aprobada SHALL incorporarse al README y al perfil.

#### Scenario: Las dos variantes están listas
- **WHEN** ambas se presentan a tamaño representativo con su intención y trade-offs
- **THEN** la implementación espera una elección explícita
- **AND** no publica una alternativa por inferencia

### Requirement: La documentación ofrece navegación progresiva
El índice documental SHALL agrupar las rutas por necesidad y cada documento SHALL explicar su objetivo,
audiencia o siguiente paso cuando sea necesario. La simplificación MUST preservar contratos, ownership,
comandos y recuperación vigentes.

#### Scenario: Un perfil junior busca el siguiente paso
- **WHEN** llega desde el README o termina un documento
- **THEN** encuentra una explicación directa y un enlace siguiente sin conocer la estructura interna

#### Scenario: Un perfil senior necesita el contrato completo
- **WHEN** sigue la ruta técnica
- **THEN** conserva acceso a requisitos, compatibilidad, riesgos, costos, licencias y recuperación sin
  pérdida de precisión

### Requirement: La experiencia pública conserva una voz coherente
El README SHALL usar español como ruta principal y MAY incluir un resumen inglés dentro de un desplegable.
`PRODUCT.md` y `DESIGN.md` SHALL registrar personalidad, jerarquía, tokens y anti-patrones aplicables a los
recursos públicos.

#### Scenario: Se crea o actualiza una pieza pública
- **WHEN** un colaborador modifica README, documentación o recurso visual
- **THEN** puede verificar la decisión contra el contexto de producto y diseño versionado
- **AND** evita lenguaje dirigido a reclutadores, marketing genérico y terminología innecesariamente densa

### Requirement: Las decisiones futuras distinguen verdad actual y objetivo
La documentación pública SHALL separar el comportamiento que el CLI y sus harnesses verifican hoy de la
capacidad oficial de terceros y del comportamiento objetivo que todavía requiere implementación. Cada
matriz dependiente de herramientas externas SHALL indicar fecha y fuentes oficiales.

#### Scenario: Una herramienta incorpora una capacidad nueva
- **WHEN** una fuente oficial anuncia skills, MCP, permisos u otra superficie compatible
- **THEN** la documentación registra la capacidad del proveedor sin elevar el soporte del constructor
- **AND** conserva la degradación vigente hasta que exista adapter y evidencia de runtime

#### Scenario: Una persona lee una propuesta de onboarding
- **WHEN** el decision record describe automatización futura
- **THEN** identifica qué existe, qué solo está decidido y qué issue implementará cada parte

### Requirement: Las recomendaciones de integración declaran costo y control
Toda recomendación de tracker, skill, MCP o integración remota SHALL registrar necesidad, licencia, costo,
autenticación, datos enviados, permisos, evidencia de funcionamiento y rollback. La documentación MUST NOT
presentar configuración, startup o tool listing como un smoke autenticado exitoso.

#### Scenario: Una integración candidata se evalúa
- **WHEN** el catálogo recomienda activarla para un contexto concreto
- **THEN** muestra los permisos y datos mínimos, el gate humano y la forma de retirarla
- **AND** una incertidumbre vigente permanece visible en vez de convertirse en PASS

### Requirement: El onboarding documentado preserva decisiones existentes
La política de onboarding SHALL clasificar repositorios nuevos y brownfield por evidencia, conservar el
tracker y las herramientas existentes cuando son válidas y ofrecer una ruta proporcional que permita
posponer decisiones. Arquitectura y CI/CD del producto SHALL decidirse después del discovery.

#### Scenario: El repositorio ya tiene ecosistema
- **WHEN** la inspección read-only encuentra código, instrucciones, tracker o automatización vigente
- **THEN** la ruta documentada empieza por inventariar y preservar
- **AND** solo propone cubrir huecos confirmados mediante un diff reversible

#### Scenario: La persona no conoce tableros
- **WHEN** no existe tracker y la persona necesita una explicación
- **THEN** la documentación explica su valor en lenguaje práctico y compara opciones proporcionales
- **AND** permite posponer la decisión con una razón registrada

### Requirement: Una decisión de autoaplicación da veredicto medido a cada mecanismo

Una decisión sobre aplicar el sistema a su propio repositorio SHALL dar un veredicto a cada mecanismo del
inventario que declara, sin celdas vacías, y cada veredicto negativo SHALL registrar una razón verificable.
SHALL distinguir explícitamente un check que mide la forma que el constructor siembra de un check que mide
una promesa publicada incumplida, y SHALL clasificar con ese criterio los fallos vigentes del diagnóstico
read-only. Cada adopción propuesta SHALL declarar costo, licencia, autenticación, datos enviados, permisos,
evidencia de funcionamiento y rollback. La decisión MUST NOT presentar una adopción como ejecutada ni
recomendar una que el propio repositorio no pueda verificar.

#### Scenario: Un mecanismo distribuido no se aplica al upstream

- **WHEN** la decisión declara que el upstream no debe aplicarse un mecanismo que sí distribuye
- **THEN** registra si la causa es forma de consumidor o ausencia de valor, con la medición que lo sostiene
- **AND** un lector puede reproducir esa medición con los comandos del propio repositorio

#### Scenario: Una recomendación implicaría escribir sobre la fuente del propio constructor

- **WHEN** una adopción exigiría que el constructor gestione un archivo que el upstream posee
- **THEN** la decisión la rechaza y nombra el mecanismo vigente que ya impide esa escritura
- **AND** no se presenta una advertencia en lugar de un mecanismo

#### Scenario: La decisión propone trabajo de implementación

- **WHEN** el decision record termina en un desglose de issues
- **THEN** cada issue declara sus propios criterios observables y su relación de orden con los demás
- **AND** el documento distingue lo ya aplicado, lo decidido y lo pendiente de implementación

### Requirement: Optional AI opportunity guidance distinguishes evidence
Public guidance SHALL distinguish installed process capability, hypotheses and validated friction. It SHALL
allow automatiza, reduce-friccion, no-ia and prohibido decisions, preserve human decisions, and use existing
discovery and operational evidence without requiring telemetry or a new mandatory gate.

#### Scenario: A new project has no observations
- **WHEN** a team starts with installed SDD steps but no observed friction
- **THEN** guidance SHALL describe those steps as capability, leave opportunities unvalidated, and allow product journeys to be not applicable with a reason
- **AND** absence of an optional map SHALL NOT itself become debt or a failed gate

#### Scenario: Repeated failure is observed
- **WHEN** a readiness result or debt recurrence supplies a signal
- **THEN** guidance SHALL require diagnosis and a cited observation before calling it validated friction
- **AND** automated intervention SHALL retain an owner, review trigger and fallback

#### Scenario: Consumer observations survive an upgrade
- **WHEN** a consumer adopts the optional guide
- **THEN** its observations SHALL remain consumer-owned, separate from managed process documentation
- **AND** this evaluation SHALL NOT silently add a schema, generated map or mandatory workflow

### Requirement: El estado público diferencia canales de entrega
Las guías SHALL separar la versión descargable del Companion, el núcleo publicado, cambios integrados
pendientes de distribución y estado de la landing. Cada estado SHALL incluir fecha y fuente verificable.

#### Scenario: Main tiene capacidades posteriores a la release
- **WHEN** se documenta una pantalla o acción añadida después del commit publicado
- **THEN** se identifica como código integrado pendiente de instalador
- **AND** la descarga conserva la identidad de la release realmente disponible

### Requirement: Las capturas declaran procedencia y alcance
Cada captura de producto SHALL proceder de una ejecución real, declarar fuente, fecha, commit o versión
y entorno. SHALL conservar alt text útil y texto Markdown para información esencial, sin datos privados.
Cada imagen publicada como captura del producto SHALL tener junto a ella un registro de procedencia legible
por máquina con commit, versión de la aplicación, motor, viewport, generador, fecha y SHA-256. Una
comprobación automática de la documentación SHALL rechazar la imagen si ese registro falta, si no coincide
con sus bytes o sus dimensiones, o si contiene una ruta de usuario. Esa comprobación SHALL alcanzar toda
imagen publicada en la carpeta de capturas del producto, sin lista de archivos, SHALL fallar si no encuentra
ninguna que comprobar, y SHALL contrastar el entorno que declara el texto publicado con el de los registros.

#### Scenario: El renderer actual se prueba en un navegador
- **WHEN** la captura usa el renderer real con transporte nativo sustituido para pruebas
- **THEN** su pie y registro dicen que es verificación en navegador y no prueba del instalador
- **AND** una captura de la landing final espera a que exista esa página terminada

#### Scenario: La captura se toma de la ventana real de la aplicación
- **WHEN** la captura se genera con la aplicación en Electron, desde el código o empaquetada
- **THEN** su pie y su registro dicen qué se ejecutó, en qué commit y versión, y que no es una captura del instalador
- **AND** la imagen muestra la ventana tal como la renderiza esa versión, con sus defectos conocidos y sin retoques

#### Scenario: Una imagen publicada no tiene procedencia válida
- **WHEN** una imagen publicada en la carpeta de capturas del producto carece de registro, su SHA-256 o sus dimensiones difieren de las registradas, o el registro contiene una ruta de usuario
- **THEN** la comprobación de documentación falla y nombra la imagen y la causa
- **AND** ocurre igual con una imagen nueva, en otra subcarpeta o en otro formato, sin tocar la comprobación

#### Scenario: El texto publicado y los registros no dicen lo mismo
- **WHEN** los registros declaran un motor o una forma de ejecutar que la galería publicada no menciona, o las imágenes publicadas proceden de commits distintos
- **THEN** la comprobación de documentación falla y nombra lo que no coincide

#### Scenario: No queda ninguna captura publicada que comprobar
- **WHEN** las imágenes se mueven o se borran y la comprobación no encuentra ninguna
- **THEN** falla en lugar de pasar por vacío

### Requirement: La explicación de piezas preserva ownership
La documentación SHALL explicar la función de Companion, núcleo, CLI, bootstrap, npm, OpenSpec y
herramientas administradas. El inventario SHALL distinguir fuentes activas, historia, salidas regenerables
y retiradas condicionadas, con owner y evidencia. SHALL conservar compatibilidad y recuperación.

#### Scenario: Una persona pregunta si la interfaz vuelve innecesario npm
- **WHEN** consulta la guía de piezas del sistema
- **THEN** distingue un requisito del contribuidor o herramienta interna de un paso que deba hacer el usuario
- **AND** no se retira el motor que usa la app por haber cambiado la entrada pública

### Requirement: La comunicación explica el siguiente paso a medida del proyecto
La documentación SHALL empezar por objetivo, resultado y siguiente acción, explicar términos cuando
aparecen y conservar límites observables. SHALL describir la adaptación del método sin imponer tecnologías
o integrations ajenas y sin presentar una revisión del agente como prueba de comprensión con personas.

#### Scenario: Un proyecto ya tiene herramientas e instrucciones
- **WHEN** el lector consulta qué aporta el sistema
- **THEN** entiende que se inventaría y preserva lo existente y se revisan incorporaciones según necesidad
- **AND** el método de otro proyecto se explica sin copiar sus secretos, dominio ni stack como requisitos

### Requirement: Un prototipo de diseño nunca se presenta como el producto
Los prototipos de diseño SHALL estar rotulados como prototipo en el lugar donde se guardan. Ninguna imagen
publicada como captura del producto SHALL ser idéntica, byte a byte, a una imagen de un prototipo.

#### Scenario: Se publica un mock como captura
- **WHEN** una imagen publicada como captura del producto tiene el mismo SHA-256 que una imagen de `docs/stitch uxui/`
- **THEN** la comprobación de documentación falla y nombra las dos imágenes

#### Scenario: Una persona abre la carpeta de prototipos
- **WHEN** abre `docs/stitch uxui/`
- **THEN** encuentra un README que dice que son prototipos de diseño y no capturas del producto
- **AND** ese README enlaza la galería de capturas reales

### Requirement: Una presentación del proyecto declara de dónde sale cada cifra
Un material que presente el proyecto en público SHALL declarar, para cada cifra que enseñe, el registro del
que sale, y SHALL NOT enseñar ninguna que no esté en esa lista. SHALL declarar en el propio material qué no se
midió. Cuando exista una medición desfavorable sobre lo mismo que una favorable, SHALL presentar las dos o
ninguna. Una demostración SHALL proceder de una ejecución real con sus artefactos conservados, y SHALL NOT
reconstruirse ni actuarse.

#### Scenario: Una cifra no tiene registro
- **WHEN** el material va a enseñar un número
- **THEN** ese número SHALL figurar en la tabla de procedencia del propio material, con el registro que lo
  respalda
- **AND** si no figura, no se enseña

#### Scenario: Hay una medición favorable y otra desfavorable del mismo asunto
- **WHEN** el material presenta la favorable
- **THEN** presenta también la desfavorable, con la misma claridad y en el mismo material

#### Scenario: Una demostración se prepara para enseñarla
- **WHEN** el material muestra una comparación entre dos formas de trabajar
- **THEN** procede de ejecuciones reales de la misma tarea, con sus artefactos conservados
- **AND** el material dice qué no demuestra esa comparación

#### Scenario: El material afirma una ventaja que la evidencia contradice
- **WHEN** una afirmación sobre recuperación, eficiencia, tokens, alucinaciones o ahorro no está medida, o lo
  está en contra
- **THEN** esa afirmación no aparece, y el material declara que no se midió

### Requirement: CLI and recovery guides explain sync results and exit codes

The public CLI and recovery guides SHALL explain `IN_SYNC`, `DRIFT` and `PROVENANCE_MISMATCH`, document exit codes 0 (success), 1 (drift), 2 (invalid) and 3 (transaction), and give a safe next step for each sync-check result.

#### Scenario: A contributor reads the public CLI guide

- **WHEN** a contributor needs to interpret a command's result or exit status
- **THEN** the guide names all four codes and their meanings
- **AND** it explains that provenance mismatch succeeds without proposing a repair while real drift fails

#### Scenario: A contributor follows recovery guidance

- **WHEN** a sync check reports repository drift or a provenance mismatch
- **THEN** the recovery guide directs the contributor to review real operations before applying changes
- **AND** it states that a provenance-only mismatch is informational and leaves target state unchanged

### Requirement: Las diapositivas de conceptos conservan texto legible y sin obstrucciones
Una presentación pública SHALL mantener visibles sus explicaciones y ejemplos. En las diapositivas de
conceptos, el texto explicativo y las tarjetas adyacentes SHALL tener separación positiva y no SHALL ocultarse
entre sí. La comprobación geométrica SHALL detectar una colisión entre ese texto y la tarjeta aun cuando la
tarjeta no tenga texto propio.

#### Scenario: El texto explicativo alterna a la columna derecha
- **WHEN** una diapositiva de conceptos coloca una tarjeta a la izquierda y su explicación a la derecha
- **THEN** la explicación comienza después del borde derecho de la tarjeta
- **AND** la comprobación geométrica falla si el texto entra en el área de la tarjeta

#### Scenario: El PDF final se prepara para presentarse sin conexión
- **WHEN** la presentación se exporta como PDF para el congreso
- **THEN** las 22 páginas se pueden abrir y renderizar sin depender de Canva
- **AND** se inspeccionan visualmente todas las páginas antes de publicar un enlace descargable desde el issue

### Requirement: La guía explica la evidencia técnica y sus límites

La guía operativa SHALL documentar la ubicación y estructura fija del registro de evidencia, sus hashes de
configuración/perfil, vigencia, referencias a artefactos, migración desde consumidores 0.5.0 y recuperación.
SHALL aclarar que `doctor` verifica integridad, completitud y vigencia del registro, pero no ejecuta ni
autentica las pruebas o aprobaciones del consumidor. SHALL indicar que el workaround de landing se retira
solo después de publicar el core corregido, migrar los recibos contra su catálogo empaquetado y verificar la
misma suite del consumidor en un cambio propio revisado del repositorio landing.

#### Scenario: Un consumidor prepara evidencia para un perfil técnico activo

- **WHEN** una persona sigue la guía de operación upstream
- **THEN** conoce la forma del registro, evidencias requeridas, referencias, expiración, límites de verificación
  y recuperación
- **AND** la guía no presenta un PASS consumer-owned como una prueba ejecutada por el core

#### Scenario: El consumidor retira el workaround temporal

- **WHEN** se publica una versión corregida del core y el consumidor migra su evidencia de perfil
- **THEN** la guía indica retirar el workaround mediante su propio cambio revisado
- **AND** no recomienda retirarlo antes de que esa versión esté disponible
- **AND** indica conservar cualquier FAIL ajeno al workaround y no debilitar el runner fijo

### Requirement: Upstream operations document the expected doctor baseline and receipt renewal

The upstream runbook SHALL state which doctor failures are accepted and issue-tracked, how the exact-set
baseline gate detects new or unresolved failures, and how to renew the GitHub Project receipt with its
read-only command. It SHALL explain that freshness is advisory, the command is not executed by doctor or
CI, and the receipt does not certify future access.

#### Scenario: A maintainer encounters a new upstream doctor failure

- **WHEN** the baseline gate reports an unlisted `FAIL`
- **THEN** the runbook directs the maintainer to investigate and track it before any baseline change
- **AND** it forbids widening the baseline to make the check green

#### Scenario: A GitHub Project receipt is stale

- **WHEN** the freshness report marks the receipt stale or due soon
- **THEN** the runbook gives the exact read-only command and the values to compare before renewing it
- **AND** it tells the maintainer to redact the saved receipt and never put credentials in it

