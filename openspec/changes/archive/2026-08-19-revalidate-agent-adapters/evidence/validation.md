# Evidencia de validación

## Suite del paquete

- `npm run check`: PASS, encadenando `check:package`, `check:neutrality`, `check:docs`, `check:workflows` y
  `npm test`.
- `check:package`: PASS, contrato `create-project-engineering-os@0.1.6` y par sembrado sincronizado.
- `check:neutrality`: PASS, árbol público neutral y allowlist de export sin hallazgos pese a las cinco
  exportaciones nuevas.
- `check:docs`: PASS, 22 enlaces relativos del README y contrato de prompts verificado.
- `check:workflows`: PASS, 3 workflows.
- `npm test`: PASS, 210/210 pruebas, de las cuales 37 son nuevas en `test/harness-capabilities.test.mjs`.
- `git diff --check`: limpio.

## Contrato de adapters

`scripts/harness-contract.mjs` resuelve cada `verification.configuration` a una fixture concreta y comprueba
lo único comprobable sin instalar el agente del proveedor: que el constructor escriba la ruta oficial
documentada, en el formato documentado.

Casos positivos:

- las treinta celdas declaran verificación y ninguna deja una señal de runtime en verificada;
- cada celda renderizada cita fuente https fechada, versión mínima, fixture existente, superficie, fallback
  y degradación;
- cada celda degradada conserva fallback y declara `not-applicable` como configuración;
- los trece adapters administrados cumplen su contrato, incluidos `.claude/rules/project-os.md` y
  `.opencode/project-os.md`, cuyas celdas están degradadas a propósito;
- el skill se instala exactamente en dos rutas y ninguna es la heredada;
- la tabla renderizada publica columnas separadas de configuración, startup, tool listing y smoke, más las
  secciones de superficies divergentes y fuentes consultadas;
- las tablas escritas a mano en `docs/COMPATIBILITY.md` y en el blueprint coinciden fila por fila con la
  matriz materializada.

Casos negativos que deben fallar y fallan:

- celda native sin fuente fechada, sin fixture o sin fallback (`HARNESS_CAPABILITY_UNPROVEN`);
- celda degradada sin fallback (`HARNESS_CAPABILITY_FALLBACK`);
- fecha fuera de formato ISO (`HARNESS_CAPABILITY_SOURCE_DATE`) y fuente que no es https
  (`HARNESS_CAPABILITY_SOURCE`);
- versión mínima inventada como `0.50` (`HARNESS_CAPABILITY_MINIMUM_VERSION`);
- `smoke` declarado como `verified` y `smoke` declarado como `fixture:json-mcp-servers`, ambos
  `HARNESS_CAPABILITY_RUNTIME_SIGNAL`;
- celda native que excluye superficies oficiales (`HARNESS_CAPABILITY_SURFACE_DIVERGENCE`);
- misma superficie soportada y no soportada (`HARNESS_CAPABILITY_SURFACES`);
- campo de verificación desconocido (`HARNESS_CAPABILITY_VERIFICATION`);
- destino ausente que no está retirado (`HARNESS_CAPABILITY_UNPROVEN`);
- `SKILL.md` con nombre distinto de su carpeta, sin descripción, sin frontmatter o con cuerpo vacío;
- instrucción por ruta de Copilot sin `applyTo`; regla de Cursor sin alcance declarado;
- adapter MCP sin objeto de servidores, JSON inválido y tipo de servidor no soportado en OpenCode;
- espejo de instrucciones que conserva el encabezado y pierde el texto canónico;
- adapter ausente, que produce un fallo por cada contrato en vez de pasar en silencio;
- matriz sin bloque de verificación, que se reporta en las treinta celdas.

## Fuentes oficiales

Las dieciséis URLs registradas en la matriz se consultaron el 2026-08-19 y respondieron **200 sin
redirección**. Dos candidatas iniciales, `cursor.com/docs/context/rules` y `cursor.com/docs/context/mcp`,
respondían 308 y se sustituyeron por sus rutas canónicas antes de fecharlas.

La comprobación de liveness es evidencia manual y no entra en la suite: haría la CI dependiente de red y de
la disponibilidad de terceros. Lo que sí es automático es la forma: una fuente que no sea https o una fecha
fuera de formato ISO hacen fallar el rendering.

## Empaquetado y bootstrap

- `npm run pack:verify`: PASS. Tarball `create-project-engineering-os-0.1.6.tgz`, 258 206 bytes,
  sha256 `ffd5bb47195d495d521018cab4ce8f86c41aca10c8a431ffa94fa8cb45836070`, instalado y probado.
- `npm run fixture`: PASS. Los once comandos terminan en 0, el segundo run produce 0 archivos cambiados,
  `sync --check` queda `IN_SYNC` sin drift, `opsx-check` en 0 y el doctor sin ningún `FAIL`.
- Contrato dentro de la fixture: los trece adapters se comprueban sobre el repositorio realmente
  bootstrapeado, no sobre el blueprint en memoria, y las treinta celdas quedan con cero señales de runtime
  verificadas. Un bootstrap que declarase una señal verificada haría fallar la fixture.
- Findability: 9 documentos esperados alcanzables en dos saltos o menos, 0 faltantes.

## Clasificación de los WARN del doctor

El doctor termina con 12 PASS, 0 FAIL, 4 WARN y 13 SKIP. Los cuatro WARN son estructurales y preexistentes;
este change no añade ni modifica ninguna comprobación del doctor.

| WARN | Clasificación |
| --- | --- |
| `git.working-tree` | Esperado: la fixture bootstrapea en un repositorio recién creado y los archivos escritos aún no están commiteados. |
| `debt.github` | Contrato: el doctor no ejecuta sincronización GitHub y la configuración no demuestra autenticación. |
| `github.project` | Contrato: sin receipt opt-in vigente, la configuración por sí sola no prueba operación. |
| `ci.execution` | Contrato: misma regla, la CI local no se ejecuta desde el doctor. |

## Ensayo de actualización de un consumidor existente

Un repositorio se bootstrapeó con el runtime de `origin/main` (`48b89f8` en el clon del ensayo) y después
recibió el runtime nuevo.

| Paso | Resultado |
| --- | --- |
| Bootstrap con el runtime anterior | Instala los dos adapters heredados; el destino compartido no existe |
| `sync --check` con el runtime nuevo | `DRIFT`, `mutationPerformed=false`, un `create` del destino compartido y dos `delete` explícitos; los archivos siguen en disco |
| Adapter retirado con edición humana | `conflict`, archivo preservado y contenido intacto; no hay borrado silencioso |
| `sync` explícito | Retira los dos heredados y escribe el destino compartido |
| Segundo `sync --check` | `IN_SYNC`, sin drift |
| Rollback del árbol | Restaura los dos adapters heredados y retira el destino nuevo |

La primera ejecución de este ensayo **falló**: el runtime nuevo lanzaba `HARNESS_CAPABILITY_UNPROVEN` porque
la copia seed-once del consumidor todavía nombraba `.codex/skills`. Esa detección es lo que produjo la
resolución de destinos retirados; queda registrada en lugar de silenciarse.
