## ADDED Requirements

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
