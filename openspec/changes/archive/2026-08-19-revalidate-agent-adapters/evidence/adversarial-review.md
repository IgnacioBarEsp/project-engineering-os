# Revisión adversarial

**Alcance:** Issue #32 y change `revalidate-agent-adapters`.

**Fuentes:** issue enriquecido, proposal, design, spec delta, tasks, diff contra `origin/main`, matriz
canónica y su schema, manifest, `src/harness.mjs`, contrato de adapters, 37 pruebas nuevas, suite completa,
fixture de bootstrap, ensayo de actualización de un consumidor bootstrapeado con el runtime anterior, y la
documentación oficial de los cinco harnesses consultada el 2026-08-19.

## Alineación spec/tareas

- `support` describe rendering y ninguna celda afirma consumo en runtime.
- Configuración y smoke ocupan campos distintos y el normalizador rechaza que uno ocupe el lugar del otro.
- Una celda renderizada sin fuente fechada, versión mínima, fixture, superficie, fallback o degradación
  falla en lugar de publicarse.
- Una celda `native` no puede excluir superficies oficiales de su propio harness.
- Antigravity permanece fuera de la matriz y su fixture demuestra que no cumple el contrato.
- Trackers remotos, catálogo curado y promoción de instrucciones por ruta permanecen fuera.

## Hallazgos corregidos

| Severidad | Área | Hallazgo adversarial | Corrección y evidencia |
| --- | --- | --- | --- |
| Blocker | Compatibilidad | Un consumidor bootstrapeado antes del cambio conserva una matriz seed-once que nombra `.codex/skills`. Con el manifest nuevo, `validateCapabilityMatrix` lanzaba `HARNESS_CAPABILITY_UNPROVEN` y el `sync` del consumidor moría con un error opaco que no decía qué editar. El ensayo de actualización lo reprodujo y falló. | `RETIRED_CAPABILITY_TARGETS` mapea cada ruta retirada a su reemplazo. Si el reemplazo está instalado, la capacidad se entrega igual, el rendering continúa y la celda queda anotada; el archivo del consumidor no se toca. Si no hay reemplazo, el fallo se mantiene con la remediación exacta. Ensayo repetido en PASS. |
| Blocker | Falso verde | La matriz declaraba versiones mínimas `2.0.0`, `0.50.0` y `0.5.0` para Claude Code, Codex y OpenCode. Ninguna fuente oficial consultada publica esas versiones: eran invenciones presentadas junto a una fuente fechada, exactamente el defecto que este issue combate. | Las 24 celdas afectadas pasan al sentinel `undetermined` y su degradación explica que la documentación de la capacidad no publica versión mínima. El normalizador ahora solo acepta semver o un sentinel declarado, con caso negativo. Las cinco celdas de Copilot explican `unversioned-service`. |
| Major | Falso verde | Las fixtures de instrucciones solo comprobaban que el archivo no estuviera vacío. Una celda `native` quedaba probada por un encabezado generado sin contenido canónico: un sello de goma con forma de evidencia. | `mirroredInstructions` exige que cada línea sustantiva del texto canónico aparezca en el espejo. Un `CLAUDE.md` con encabezado y sin contenido falla con `canonical-instructions-not-mirrored`, y sin el texto canónico disponible el contrato se declara incapaz en vez de aprobar. |
| Major | Duplicación de verdad | `docs/COMPATIBILITY.md` y `COMPATIBILITY_MATRIX.md` escriben la tabla de soporte a mano. La matriz canónica podía cambiar y las dos superficies públicas seguirían publicando el soporte anterior sin que nada fallara. | Una prueba compara fila por fila ambas tablas contra la matriz materializada, con las cinco filas y sus cinco o seis capacidades. |
| Minor | Cobertura | `.claude/rules/project-os.md` y `.opencode/project-os.md` se instalan y los lee su harness, pero ningún contrato los cubría porque sus celdas declaran `not-applicable` a propósito. | Ambos entran en `ADAPTER_CONTRACTS`, de modo que un adapter administrado no puede romperse en silencio por estar en una celda degradada. |
| Minor | Fuente fechada | Dos de las dieciséis fuentes registradas respondían 308 hacia otra ruta. Una fuente que redirige envejece peor que una que no existe, porque parece viva. | Se registraron las URLs canónicas y se verificó que las dieciséis responden 200 sin redirección. |
| Minor | Taxonomía | Crear una capacidad `harness-compatibility` habría añadido un tercer `Purpose: TBD` al archivo de specs activas, repitiendo el defecto que #31 ya registró como deuda. | Los requisitos entran en `runtime`, que ya define qué instala el bootstrap, qué ownership protege cada archivo y qué puede afirmar un reporte read-only. La decisión queda escrita en el diseño. |

## Preguntas del checklist

**¿Crea falsos verdes?** Fue el eje de la revisión y produjo dos Blockers y un Major propios. Después de
corregirlos, ninguna celda afirma consumo, ninguna versión mínima carece de fuente, y ninguna fixture aprueba
un archivo sin contenido canónico. La comprobación es de rendering, y el nombre del campo lo dice.

**¿Confunde configuración con funcionamiento?** No puede. `configuration` y las tres señales de runtime son
campos distintos del mismo objeto, con gramáticas distintas: `fixture:<id>` en uno,
`not-verified` o `receipt:<ruta>` en los otros. Escribir un `fixture:` en `smoke` falla con
`HARNESS_CAPABILITY_RUNTIME_SIGNAL`, y hay un caso negativo por cada dirección del error.

**¿Oculta degradación?** Cada celda degradada exige fallback y escribe su razón. Las degradaciones que antes
eran un `unsupported` mudo ahora dicen por qué: vocabulario de permisos abstracto, archivo agregado sin
selección por glob, superficie configurada fuera del repositorio, proyecto no confiado en Codex.

**¿Duplica la verdad entre matriz y fixture?** Lo hacía en la documentación y ahora hay una prueba que lo
impide. La matriz sigue siendo la única fuente: las fixtures no repiten sus valores, los consumen.

**¿Pierde recuperación?** El ensayo la ejerció completa: drift detectado sin mutar, borrado explícito de lo
retirado, conflicto preservando la edición humana, segundo check sin drift y rollback que restaura los dos
adapters heredados.

**¿Automatiza consentimiento humano?** No. Ningún servidor MCP se activa, ninguna skill de terceros se
instala, ningún proveedor se autentica. El catálogo canónico sigue con cero servidores y los adapters MCP se
renderizan vacíos.

**¿Permite cerrar sin evidencia?** Las señales que no se pueden evidenciar están declaradas como no
verificadas, no omitidas. La fixture de bootstrap falla si alguna aparece verificada tras un bootstrap.

## Casos negativos y de abuso

- Fuente sin fecha, fecha sin formato ISO, fuente que no es https, versión mínima inventada, fixture ausente,
  fixture desconocida, fallback perdido en celda renderizada y en celda degradada: cada uno falla con su
  propio código.
- `smoke: "verified"` y `smoke: "fixture:json-mcp-servers"` fallan por separado.
- Una celda `native` con superficies excluidas falla; la misma superficie declarada soportada y no soportada
  falla; un campo de verificación desconocido falla.
- Un `SKILL.md` cuyo nombre no coincide con su carpeta, sin descripción, sin frontmatter o con cuerpo vacío
  falla; una instrucción por ruta sin `applyTo` falla; una regla de Cursor sin alcance falla.
- Un destino ausente que no está retirado sigue fallando: la resolución no inventa reemplazos.
- Una matriz sin bloque de verificación se reporta en las treinta celdas en lugar de aprobarse.

## Preguntas y suposiciones resueltas

**¿Debía este change ejecutar los agentes para producir evidencia de consumo real?** No, y no puede. Exigiría
binarios de terceros, credenciales de modelo, red y costo, contra el no objetivo del propio issue y la
neutralidad del núcleo. La frontera se acordó con el humano antes de escribir código: `support` describe
rendering, y consumo es un receipt opt-in que la CI no produce.

**¿La skill compartida debilita el soporte por agente?** No. Cada harness recibe la skill en una ubicación
que su propia documentación lista. Instalar una copia por proveedor habría puesto el mismo archivo cinco
veces y varios agentes lo habrían visto repetido, porque escanean más de un directorio.

**¿Es honesto que Copilot tenga permisos `documented` y no `unsupported`?** Sí. Copilot no expone archivo de
permisos, pero la política sí llega a todas sus superficies como texto dentro de las instrucciones de
repositorio. `documented` describe eso exactamente: visible y sin enforcement. `unsupported` habría dicho que
no llega, y llega.

## Deuda residual detectada

Las instrucciones por ruta siguen `documented` en Claude Code, Cursor y GitHub Copilot pese a que las tres
documentan selección por ruta y el constructor ya escribe archivos en dos de esas superficies. El obstáculo
es real: el renderer produce un archivo agregado con alcance universal. Queda registrado como candidato
verificado, categoría `technical-debt`, severidad `minor`, no transversal.

## Veredicto

**PASS.** Cero Blockers y cero Majors abiertos. Dos Blockers, dos Majors y tres Minors se corrigieron antes
del cierre, todos detectados durante esta revisión sobre el propio trabajo. Queda un candidato de deuda minor
registrado y no silenciado.
