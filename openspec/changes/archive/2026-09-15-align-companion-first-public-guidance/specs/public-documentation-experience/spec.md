## MODIFIED Requirements

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

## ADDED Requirements

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

#### Scenario: El renderer actual se prueba en un navegador
- **WHEN** la captura usa el renderer real con transporte nativo sustituido para pruebas
- **THEN** su pie y registro dicen que es verificación en navegador y no prueba del instalador
- **AND** una captura de la landing final espera a que exista esa página terminada

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
