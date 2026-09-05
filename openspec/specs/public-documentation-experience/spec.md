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
El inicio rápido SHALL usar comandos comprobados contra la versión publicada vigente y SHALL mencionar
solo agentes soportados por la matriz versionada. La documentación SHALL distinguir el bootstrap actual de
las capacidades futuras de onboarding.

#### Scenario: Una persona prueba el proyecto en una carpeta nueva
- **WHEN** sigue el inicio rápido con un runtime soportado
- **THEN** obtiene un entorno gobernado sin tener que inferir comandos omitidos
- **AND** el prompt siguiente corresponde al flujo que existe en el repositorio

#### Scenario: Una capacidad futura todavía no está implementada
- **WHEN** el README habla de tableros, skills, MCP o adaptación por experiencia
- **THEN** la presenta como decisión futura enlazada a su issue
- **AND** no afirma que el CLI ya la ejecuta

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

