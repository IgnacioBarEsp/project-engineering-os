## ADDED Requirements

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
