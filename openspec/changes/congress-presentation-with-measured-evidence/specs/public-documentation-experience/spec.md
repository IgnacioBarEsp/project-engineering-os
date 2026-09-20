## ADDED Requirements

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
