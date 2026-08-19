## ADDED Requirements

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
