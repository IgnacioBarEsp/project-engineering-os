## Why

Issue de origen: [#19](https://github.com/IgnacioBarEsp/project-engineering-os/issues/19).

La premisa a evaluar era que npm sufre ataques con frecuencia y que migrar a pnpm reduciría esa exposición.
La premisa mezcla dos cosas: el ecosistema npm sí ha sido blanco de campañas reales, pero esos ataques van
al registro, no al cliente, y pnpm, Yarn y Bun resuelven contra el mismo registro.

Lo que sí difiere entre gestores son los defaults y los controles disponibles. Sin medir esa diferencia, una
migración se decide por percepción, con costo permanente de mantenimiento y sin ganancia demostrada.

## What Changes

- Publicar el ADR 0002 con una matriz de siete ejes sobre npm, pnpm y Yarn, con fuente oficial y fecha de
  consulta por dato, más sondas locales reproducibles.
- Emitir una recomendación separada por cada una de las tres superficies: desarrollo y release upstream,
  repositorios generados e invocación del CLI por el consumidor.
- Enumerar los vectores que ningún cambio de gestor mitiga.
- Contrastar la matriz contra el triage de cadena de suministro ya registrado, señal por señal.
- Registrar el estado final y su condición de revisión fechada.
- Enlazar el ADR desde el índice de documentación y registrar la entrada de CHANGELOG.

## Capabilities

### Modified Capabilities

- `supply-chain-governance`: un cambio de herramienta justificado por riesgo de cadena de suministro debe
  medirse antes de adoptarse, con comparación por eje, vectores no mitigados, recomendación y rollback por
  superficie, y estado final con condición de revisión fechada.

## Impact

Solo documentación. No migra ninguna superficie, no toca `package-lock.json`, los workflows ni el manifiesto
del blueprint, y no añade dependencias, servicios ni licencias. Revertir el commit lo deshace por completo.
