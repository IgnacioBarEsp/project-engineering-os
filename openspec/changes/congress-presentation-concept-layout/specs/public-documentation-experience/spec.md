## ADDED Requirements

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
- **AND** se inspeccionan visualmente todas las páginas antes de adjuntar el PDF al issue
