## ADDED Requirements

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
