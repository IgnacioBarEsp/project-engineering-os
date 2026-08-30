# Design - extender el gate de Purpose a los consumidores

## 1. Decisión de hogar

El issue #45 dejó tres candidatos y la decisión quedó aprobada en su comentario de diseño: el gate vive en
`opsx-check` y su lógica en `src/`.

| Opción | Veredicto | Razón verificada |
| --- | --- | --- |
| `opsx-check` | Elegida | Ya está dentro de `npm run project-os:check`, así que observa el texto sembrado en la primera comprobación posterior al archive. Su superficie es OpenSpec/OPSX, que es exactamente donde nace el problema. |
| `readiness-check --phase archive` | Descartada | Corre *antes* del archive, para autorizarlo, e inspecciona `specs/*/spec.md` dentro del change, no las capabilities publicadas. Atraparía siempre el residuo del change anterior: una iteración tarde, de forma sistemática. |
| Script del blueprint | Descartada | Sembrar una copia crea una segunda fuente de verdad que puede divergir de la del upstream. |

El argumento de "no ampliar un contrato ya verificado" no discrimina entre candidatos: buscando `opsx` y
`readiness` en `openspec/specs/*/spec.md` no hay ningún requisito que cubra a esos comandos. El único
comando read-only con requisito propio es `doctor`. El delta de spec hay que escribirlo igual, se elija lo
que se elija.

## 2. Una fuente de verdad, dos consumidores

`scripts/spec-purpose.mjs` pasa a `src/spec-purpose.mjs` sin cambiar su semántica. `files` del
`package.json` publica `src/` y no publica `scripts/`, así que el movimiento es lo que convierte al módulo en
distribuible.

Lo importan dos llamadores:

- `src/opsx-check.mjs`, que lo ejecuta contra el target y emite un check por capability.
- `scripts/check-docs.mjs`, que conserva su comportamiento actual sobre el propio upstream.

Un módulo y dos llamadores impiden la divergencia que descartó la opción del blueprint. `src/index.mjs`
exporta `inspectSpecPurposes` y `SPECS_ROOT`, porque el módulo pasa a ser API pública.

## 3. Modos de fallo conservados

Se conservan los cinco modos que el Issue #42 ya define y prueba, sin añadir ni fusionar ninguno:

| Modo | Condición |
| --- | --- |
| `purpose-placeholder` | El cuerpo conserva el texto que siembra el archive, o abre con un marcador de pendiente. |
| `purpose-empty` | La sección existe y su cuerpo está vacío. |
| `purpose-missing` | La spec no declara la sección. |
| `spec-unreadable` | El directorio de la capability existe y su `spec.md` no se puede leer. |
| `specs-root-unreadable` | El árbol `openspec/specs` no se puede leer. |

## 4. Ausente y no legible no son el mismo hecho

`inspectSpecPurposes` colapsa ambos casos en `specs-root-unreadable`, porque en el upstream el árbol de
specs siempre existe y su desaparición sí es una regresión. En un consumidor no: un repositorio que todavía
no ha archivado ningún change no tiene `openspec/specs`, y eso es el estado normal, no una anomalía.

Verificado sobre un target real y sobre el fixture de integración:

- Recién bootstrapeado, un repositorio tiene `openspec/` con solo `config.yaml`.
- Después de `openspec init`, `openspec/specs/` existe y está vacío.
- El fixture de integración de `opsx-check` clona un baseline bootstrapeado **sin** ejecutar `openspec init`,
  y hoy exige `PASS` sin ningún `FAIL`.

Por eso la política vive en el llamador y no en el módulo, que conserva sus cinco modos intactos:

| Estado del árbol | `opsx-check` | `check:docs` |
| --- | --- | --- |
| No existe | `SKIP`: no hay nada que afirmar | Fallo: el upstream siempre publica capabilities |
| Existe y no se puede leer | `FAIL` cerrado | Fallo |
| Existe y está vacío | `SKIP` | Sin capabilities que revisar |
| Existe con capabilities | Un check por capability | Un fallo por capability incumplidora |

`opsx-check` distingue los dos primeros casos con la comprobación de existencia que ya usa para el binario
local, antes de delegar en el módulo. Un `SKIP` no es un `PASS`: el vocabulario del diagnóstico read-only ya
lo separa, y el comando lo usa hoy para las superficies OPSX aún no generadas.

## 5. Forma de la salida

`opsx-check` emite un check por capability publicada, con el mismo estilo que ya usa para los bloques
gestionados:

- `opsx.spec-purpose`, un único check, cuando el árbol no existe o está vacío (`SKIP`) o cuando existe y no
  se puede leer (`FAIL`).
- `opsx.spec-purpose.<capability>`, un check por capability publicada, `PASS` o `FAIL`.

La recuperación es específica por modo y nombra la ruta concreta. Un mensaje genérico no cumple la condición
de aceptación: quien recibe el fallo debe saber qué archivo abrir y qué escribir en él.

## 6. Severidad y migración

`FAIL`, no `WARN`. El contrato del diagnóstico read-only es no inferir PASS de nada, y una spec publicada
que conserva el texto sembrado es deuda real, no un falso positivo.

La consecuencia es una migración: un consumidor cuyas specs ya arrastran ese texto verá un fallo nuevo tras
el upgrade. La entrada de CHANGELOG lo declara y la recuperación impresa por el propio comando es la ruta.

## 7. Versión

Minor. El módulo entra a `src/`, `src/index.mjs` amplía su superficie exportada y `opsx-check` falla donde
antes pasaba. Es aditivo en API y restrictivo en veredicto, así que no es patch y no es breaking.

## 8. No objetivos

Cambiar la versión de OpenSpec o su proceso de archive; reescribir specs de repositorios consumidores;
extender el gate a los deltas de `openspec/changes`; duplicar la lógica sin fuente única.

Queda fuera, y merece issue propio, el hueco que se hizo visible al verificar esto: `opsx-check` y
`readiness-check` son comandos publicados sin ningún requisito de spec que los cubra. Este cambio añade el
requisito del gate de Purpose, no el contrato completo de ambos comandos.
