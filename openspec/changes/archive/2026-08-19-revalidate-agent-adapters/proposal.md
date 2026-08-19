## Why

`harness-capabilities.json` declara una sola palabra por celda. Esa palabra tiene que sostener a la vez dos
afirmaciones distintas: qué escribe el constructor y qué se ha demostrado sobre el consumo. Como no las
separa, la matriz no puede fechar sus fuentes, no puede distinguir configuración de smoke y no puede decir
que una superficie del proveedor no tiene archivo versionado. El resultado es una matriz que envejece sin
avisar.

La revalidación contra fuentes oficiales lo confirmó con hallazgos concretos. Codex documenta
`.agents/skills` y el constructor escribía `.codex/skills`, una convención heredada: una celda `native`
apuntando a una ruta que el agente no escanea. En sentido contrario, Cursor y GitHub Copilot documentan
superficies de repositorio que la matriz declaraba `unsupported` pese a que el constructor ya escribía
algunas de ellas. Y la fila de Copilot era genérica aunque sus superficies divergen: Copilot CLI sí lee un
archivo MCP del repositorio, mientras el agente en la nube y la revisión de código solo se configuran en una
interfaz de settings.

El Issue #32 cierra ese hueco sin convertir la matriz en una promesa que la CI no puede sostener.

## What Changes

- Separar `support`, que describe únicamente el rendering, de un bloque `verification` por capacidad que
  registra versión mínima, fuente oficial fechada, configuración probada por fixture y las tres señales de
  runtime como campos independientes.
- Hacer ejecutable la política que el repositorio ya declaraba: una celda `native` o `generated` no se
  renderiza sin fuente fechada, versión mínima, fixture existente, superficie que la consuma, fallback y
  degradación escrita.
- Impedir la fila genérica: una celda `native` no puede excluir superficies oficiales de su propio harness;
  cuando divergen, baja a `generated` y nombra las excluidas.
- Reapuntar el adapter de skills de Codex a `.agents/skills` y unificar la skill compartida en dos archivos
  en lugar de una copia por proveedor.
- Promover skills de Cursor, Copilot y OpenCode a la ubicación compartida documentada, y corregir permisos
  de Copilot de `unsupported` a `documented` porque la política sí llega como texto a todas sus superficies.
- Resolver destinos retirados contra su reemplazo instalado para que un consumidor seed-once siga
  sincronizando, con la desactualización declarada en el espejo generado.
- Añadir un contrato de adapters reutilizable, la evaluación de Antigravity en una fixture de candidato
  separada y casos negativos que hagan fallar cada regla.

## Capabilities

### New Capabilities

Ninguna capacidad nueva. El contrato de compatibilidad por agente pertenece a `runtime`, que ya define qué
instala el bootstrap, qué ownership protege cada archivo y qué puede afirmar un reporte read-only.

### Modified Capabilities

- `runtime`: añade el contrato de evidencia de la matriz de compatibilidad, la separación entre rendering y
  consumo, la regla de superficies divergentes y la resolución de destinos retirados sin reescribir archivos
  del consumidor.

## Impact

- Harness y blueprint: `harness-capabilities.json`, su schema, el manifest y los destinos de skills.
- Runtime reutilizable: `src/harness.mjs` gana el normalizador de verificación, la regla de superficies y la
  resolución de destinos retirados. `HARNESS_RUNTIME_SIGNALS`, `RETIRED_CAPABILITY_TARGETS` y
  `resolveRetiredTargets` se exportan; ninguna exportación previa cambia de forma.
- Verificación: contrato de adapters nuevo, suite de pruebas nueva con casos negativos y una comprobación de
  contrato dentro de la fixture de bootstrap.
- Documentación: matriz pública, matriz del blueprint y matriz por agente con fuentes fechadas.
- Costo y licencia: cero. Sin dependencias, cuentas, proveedores ni servicios. Ningún servidor MCP se activa
  y ninguna skill de terceros se instala.

## Risks and Rollback

El riesgo mayor es promover una celda por parecerse a otra superficie; por eso cada promoción exige ruta
oficial documentada, fixture y fallback, y la regla se comprueba en el rendering, no en la revisión. El
segundo riesgo era romper a un consumidor ya bootstrapeado cuya copia seed-once nombra la ruta retirada: el
ensayo de actualización lo reprodujo, falló, y la resolución de destinos retirados lo corrige conservando la
propiedad del archivo. El tercero es que una fecha de fuente se vuelva decoración; la fecha describe la
consulta hecha en este cambio y su renovación pertenece a un flujo propio.

El rollback es revertir el commit: restaura la matriz anterior, sus rutas, el schema y las pruebas. Para un
consumidor ya sincronizado, el `sync` que retira los adapters heredados es una transacción con journal y
rollback por hash, y los archivos retirados vuelven con un revert del árbol.
