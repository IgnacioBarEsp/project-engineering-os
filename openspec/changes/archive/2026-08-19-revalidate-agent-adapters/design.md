# Diseño — revalidación de adapters y evidencia por agente

## 1. Problema de diseño

El criterio del Issue #32 dice que cada `native` tiene fixture y **evidencia de consumo real**. El no
objetivo del mismo issue prohíbe instalar skills de terceros y activar MCP. La política del repositorio
prohíbe proveedores, secretos y servicios de pago.

Consumo real significa que un proceso del agente cargó el archivo y actuó sobre él. Demostrarlo exige
instalar el binario del proveedor, autenticar un modelo y tener red. Ninguno de los cinco harnesses puede
hacerlo offline, gratis y de forma determinista en CI.

Bajo lectura literal, **cero celdas podrían ser `native`**, incluidas `CLAUDE.md`, `AGENTS.md`,
`.cursor/rules` y `.github/copilot-instructions.md`. Eso destruiría el vocabulario y mentiría en la otra
dirección: diría que el constructor no escribe la superficie oficial cuando sí la escribe.

## 2. Decisión

Separar las dos afirmaciones en dos campos, y hacer ejecutable la política que el repositorio ya declaraba
en `parityPolicy` pero no comprobaba por celda.

- `support` describe **solo el rendering**: el constructor escribe una ubicación que la documentación
  oficial del harness lista para esa capacidad, en el formato documentado, y una fixture offline lo prueba.
- `verification` describe **lo demostrado**: versión mínima, fuente oficial con fecha de consulta,
  `configuration` como referencia a una fixture, y `startup`, `toolListing` y `smoke` como campos
  independientes que solo aceptan `not-verified` o un receipt opt-in.

La configuración y el smoke ocupan campos distintos del mismo objeto. No hay forma de escribir uno y que
cuente como el otro: el normalizador rechaza `fixture:` en una señal de runtime y rechaza cualquier valor
que no sea `not-verified` o `receipt:.project-constructor/evidence/<id>.json`.

### Alternativas evaluadas

| Alternativa | Ventaja | Por qué no |
| --- | --- | --- |
| Un solo campo y degradar todo lo que no tenga receipt | Honesto en apariencia | Borra la diferencia entre escribir el `CLAUDE.md` propio de Claude y solo mencionarlo en `AGENTS.md`, y contradice las definiciones de vocabulario que la propia matriz declara |
| Lectura literal: `native` exige receipt de runtime | Cumple la letra del criterio | Deja la matriz permanentemente en degradación y obliga al consumidor a instalar y autenticar agentes de terceros para ver verde; rompe la intención del criterio |
| Ejecutar los agentes en CI para producir el smoke | Evidencia real | Exige binarios de terceros, credenciales de modelo, red y costo; contradice el no objetivo del issue y la neutralidad del núcleo |
| Partir `github-copilot` en varios harness IDs | Más literal sobre superficies | Rompe `HARNESS_CAPABILITY_SCHEMA`, que es API pública exportada, el schema con `prefixItems` fijos, el manifest, el doctor y la documentación, y obliga a migrar consumidores |

## 3. La regla que impide la fila genérica

`verification.surfaces` nombra las superficies del proveedor que consumen ese destino;
`unsupportedSurfaces` nombra las que no. La regla ejecutable es: **una celda `native` no puede excluir
superficies oficiales de su propio harness**. Si `unsupportedSurfaces` no está vacío, la celda baja a
`generated` y nombra las excluidas, o el rendering falla con `HARNESS_CAPABILITY_SURFACE_DIVERGENCE`.

Eso es lo que resuelve el caso de GitHub Copilot. Copilot CLI sí lee `.mcp.json` del repositorio. El agente
en la nube y la revisión de código solo se configuran en la interfaz de settings, sin archivo versionado.
Una sola palabra no puede describir ambas cosas, así que la celda es `generated`, `surfaces` contiene
`copilot-cli` y `unsupportedSurfaces` contiene las otras cinco. La tabla generada publica esa divergencia en
su propia sección.

## 4. Una skill compartida, no cinco copias

La documentación oficial coincide en una ubicación común. Codex escanea `.agents/skills`. Cursor documenta
`.cursor/skills` y `.agents/skills`. Copilot documenta `.github/skills`, `.claude/skills` y `.agents/skills`.
OpenCode documenta `.opencode/skills`, `.claude/skills` y `.agents/skills`. Claude Code lee solo
`.claude/skills`.

Instalar una copia por proveedor pondría el mismo `SKILL.md` cinco veces y varios agentes verían el mismo
skill repetido, porque escanean más de un directorio. El constructor instala dos archivos:
`.claude/skills/project-os/SKILL.md` para Claude Code y `.agents/skills/project-os/SKILL.md` para los otros
cuatro. Cada harness recibe la skill exactamente una vez.

Esto también corrige el hallazgo de Codex: `.codex/skills` no aparece en la lista oficial de escaneo y era
convención heredada.

## 5. Destinos retirados y propiedad seed-once

`.project-os/harness-capabilities.json` tiene owner `project`: es seed-once y pertenece al consumidor. Un
repositorio bootstrapeado antes de este cambio conserva su copia, que todavía nombra `.codex/skills`.

El ensayo de actualización reprodujo el problema y falló: `validateCapabilityMatrix` lanzaba
`HARNESS_CAPABILITY_UNPROVEN` y el `sync` del consumidor moría con un error opaco, sin decir qué editar.

Las opciones eran seguir instalando las rutas heredadas, reescribir el archivo del consumidor, o resolver el
destino retirado. Seguir instalándolas conserva la duplicación que el cambio elimina. Reescribir el archivo
viola la propiedad seed-once. Se resuelve:

`RETIRED_CAPABILITY_TARGETS` mapea cada ruta retirada a su reemplazo oficial y a la razón. Si la copia del
consumidor nombra una ruta retirada y el reemplazo sí está instalado, la capacidad **se entrega igual**, así
que el rendering continúa y la celda queda anotada como superada. La anotación viaja solo en memoria: el
archivo del consumidor no se toca, y el espejo generado publica una sección con el destino declarado y el
reemplazo instalado. Si no existe reemplazo instalado, el fallo se mantiene, ahora con la remediación exacta.

## 6. Por qué los permisos siguen `documented` en los cinco

OpenCode sí acepta `allow`, `ask` y `deny` por herramienta y por patrón de bash. Claude Code sí acepta reglas
de permiso en `settings.json`. Pero el vocabulario canónico de `.project-os/permissions.json` son tokens
abstractos de capacidad: `git:push-force`, `doctor:repair`, `secret:print-value`. No son nombres de
herramienta ni patrones de shell.

Derivar `git push --force*` a partir de `git:push-force` sería inventar semántica y afirmar un enforcement
que el repositorio nunca decidió. La política se queda visible sin enforcement, y la razón queda escrita en
la degradación de cada celda en lugar de un no soportado mudo.

## 7. Por qué las instrucciones por ruta no se promueven

Claude Code soporta selección por ruta con frontmatter `paths` en `.claude/rules`. Cursor soporta `globs`
por regla. Copilot soporta `applyTo` en `.github/instructions`. Las tres superficies existen y el constructor
ya escribe un archivo en dos de ellas.

Pero el constructor escribe **un archivo agregado con alcance universal**, así que no conserva la selección
por glob, que es la semántica de la capacidad. Promover la celda exige un renderer por regla y fixtures que
prueben selección equivalente. Eso pertenece a un cambio propio; aquí queda registrado como degradación con
su criterio de promoción escrito.

## 8. Compatibilidad hacia atrás

`verification` es opcional en el schema y el normalizador devuelve `null` cuando falta, de modo que la copia
seed-once de un consumidor anterior sigue siendo legible y la matriz generada muestra `sin declarar` en vez
de romperse. La exigencia completa vive en una prueba upstream sobre la semilla publicada, que sí declara las
treinta celdas.

`HARNESS_CAPABILITY_SCHEMA` y `HARNESS_CAPABILITY_STATES` conservan su forma: los mismos cinco harnesses y
las mismas seis capacidades. Las exportaciones nuevas son aditivas.

## 9. Ownership y alcance

El upstream posee matriz, schema, manifest, adapters, contrato y pruebas. El consumidor posee su copia
seed-once de la matriz y cualquier receipt opt-in que decida producir. OpenSpec conserva OPSX, incluidas sus
propias skills bajo `.codex/skills/openspec-*` y `.agents/skills/openspec-*`, que este cambio no toca.

Trackers remotos pertenecen a #33 y el catálogo curado de skills y MCP a #34.

## 10. Antigravity

Se evalúa en `test/fixtures/harness-candidates/antigravity.json`, fuera de la matriz de cinco harnesses y
fuera del paquete publicado. El contrato de promoción exige, por cada una de las seis capacidades, renderer
con destino declarado, fuente oficial fechada, versión mínima, fixture existente, fallback y degradación.
Antigravity no cumple ninguno de los seis.

Que Antigravity lea `AGENTS.md` igual que Codex no lo promueve: eso sería promover por similitud, que es
exactamente lo que el issue prohíbe. Una prueba comprueba además que un candidato completo sí sería
promovible, para que el contrato no sea inalcanzable por construcción.
