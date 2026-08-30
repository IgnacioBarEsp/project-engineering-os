## Why

Issue de origen: [#46](https://github.com/IgnacioBarEsp/project-engineering-os/issues/46).

El upstream distribuye gobernanza, diagnóstico read-only, control de deuda, readiness, adaptadores de agente,
MCP e inteligencia de código, y casi nada de eso se ejecuta sobre sí mismo. Sus propios comandos, contra su
propio repositorio, lo demuestran: `doctor` sale FAIL con 6 checks en rojo, `opsx-check` sale con código 2,
el motor de deuda reporta PASS por omisión y `readiness-check` no es ejecutable in situ.

La consecuencia es concreta y ya se repitió tres veces: la misma deuda documental se descubrió por lectura
humana en el Issue #25, se redescubrió en el #42 y se extendió a los consumidores en el #45. El motor de
deuda del propio proyecto, ejecutado sobre los assessments que el propio proyecto ya escribió a mano, la
tenía clasificada desde el 18 de agosto de 2026.

## What Changes

- Publicar un decision record con veredicto para cada uno de los 47 mecanismos de los nueve grupos del
  inventario, sin celdas vacías y con razón verificable en cada veredicto negativo.
- Definir el criterio que separa forma de consumidor de deuda real, y aplicarlo a los seis `FAIL` actuales
  del doctor.
- Resolver la recursión de ownership con medición en vez de advertencia, y nombrar el mecanismo que ya la
  impide.
- Registrar la evidencia medida de los cuatro comandos, los nueve conflictos, las 67 creaciones, los diez
  assessments capturados y las tres sondas de configuración.
- Crear los issues de implementación enlazados a #46.

## Capabilities

### Modified Capabilities

- `public-documentation-experience`: una decisión sobre aplicar el sistema a su propio repositorio debe dar
  veredicto a cada mecanismo con razón verificable, apoyarse en medición y no presentar una adopción como
  hecha.

## Impact

Solo documentación. No se ejecuta ninguna adopción, no cambia el runtime, no se añaden dependencias,
proveedores, secretos ni servicios. Revertir el commit lo deshace por completo.
