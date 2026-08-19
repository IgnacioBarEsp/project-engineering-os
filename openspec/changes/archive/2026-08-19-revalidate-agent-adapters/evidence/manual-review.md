# Evidencia manual

## Revalidación contra fuentes oficiales

Las cinco superficies se releyeron el 2026-08-19 contra su documentación oficial, y la revalidación produjo
correcciones en ambas direcciones, no solo promociones.

Codex documenta `.agents/skills` como ubicación de skills de repositorio y no lista `.codex/skills`, que era
convención heredada: la celda `native` apuntaba a una ruta que el agente no escanea. Codex también documenta
el `config.toml` de proyecto solo para proyectos confiados, un gate que la matriz no declaraba.

Cursor documenta `.cursor/skills` y `.agents/skills` con frontmatter `name` y `description`, y exige que el
nombre coincida con la carpeta contenedora. GitHub Copilot documenta `.github/skills`, `.claude/skills` y
`.agents/skills` como ubicaciones de proyecto, e instrucciones por ruta soportadas en todas sus superficies
salvo Visual Studio. Su MCP diverge: Copilot CLI lee `.mcp.json` y `.github/mcp.json` desde el repositorio,
VS Code usa `.vscode/mcp.json`, y el agente en la nube y la revisión de código solo se configuran en la
interfaz de settings, sin archivo versionado. OpenCode documenta `.opencode/skills`, `.claude/skills` y
`.agents/skills`, y permisos allow/ask/deny por herramienta y por patrón de bash en `opencode.json`.

Claude Code documenta `CLAUDE.md`, `.claude/skills` y `.mcp.json`, y declara explícitamente que no lee
`AGENTS.md`. También documenta `.claude/rules` con frontmatter `paths` para selección por ruta.

## Ninguna celda native afirma consumo en runtime

Se revisó celda por celda que `support` describa solo el rendering. Las treinta declaran startup, tool
listing y smoke como `not-verified`, y ninguna los deja implícitos. La fixture de bootstrap falla si un
bootstrap produjera una señal verificada, de modo que la afirmación no depende de la disciplina del revisor.

Verificar cualquiera de las tres exigiría instalar el agente del proveedor y autenticar un modelo. Eso queda
fuera del alcance neutral del núcleo y fuera de una CI offline, y está declarado como tal en la matriz
pública, en la del blueprint y en la matriz por agente.

## Versiones mínimas: lo que se puede citar y lo que no

La primera versión de este trabajo declaraba versiones mínimas concretas para Claude Code, Codex y OpenCode.
Ninguna fuente oficial consultada las publica: eran invenciones colocadas junto a una fuente fechada, que es
peor que no declarar nada porque parecen verificadas.

Las veinticuatro celdas afectadas declaran ahora `undetermined` y explican en su degradación que la
documentación de esa capacidad no publica versión mínima. Las cinco de GitHub Copilot declaran
`unversioned-service` porque es un servicio sin versión instalable por el repositorio. El changelog de Cursor
atribuye Agent Skills a la versión 2.4, pero la documentación de la capacidad no publica una versión mínima,
así que la celda registra ese matiz en lugar de convertir un changelog en un contrato.

El normalizador ahora solo acepta semver publicado o un sentinel explicado, con caso negativo.

## Degradaciones revisadas

- Los permisos siguen `documented` en los cinco. OpenCode y Claude Code sí aceptan reglas de permiso, pero
  el vocabulario canónico son tokens abstractos de capacidad como `git:push-force`. Derivar patrones de shell
  a partir de ellos inventaría semántica y afirmaría un enforcement que el repositorio nunca decidió.
- Las instrucciones por ruta siguen `documented` aunque tres harnesses las soporten, porque el constructor
  escribe un archivo agregado con alcance universal y no conserva la selección por glob, que es la semántica
  de la capacidad. El criterio de promoción queda escrito.
- Los permisos de Copilot pasan de `unsupported` a `documented`. No hay archivo de permisos, pero la política
  sí llega a todas sus superficies como texto dentro de las instrucciones de repositorio: `unsupported`
  habría dicho que no llega.
- El MCP de Copilot es `generated` y no `native` porque excluye cinco de sus seis superficies. La regla que
  lo impone es ejecutable, no una convención de revisión.
- El gate de proyecto confiado de Codex queda declarado: el `config.toml` se escribe igual, y sin confianza
  otorgada existe y no se aplica.

## API pública, licencia y costo

Los cinco harness IDs y las seis capacidades no cambian, así que `HARNESS_CAPABILITY_SCHEMA` y
`HARNESS_CAPABILITY_STATES` conservan su forma y ninguna exportación previa cambia de firma. Se añaden cinco
exportaciones aditivas: `HARNESS_RUNTIME_SIGNALS`, `MINIMUM_VERSION_SENTINELS`, `RETIRED_CAPABILITY_TARGETS`,
`resolveRetiredTargets` y el bloque de verificación del schema. La allowlist de neutralidad sigue en PASS.

El paquete pasa de 76 a 75 archivos administrados: se retiran dos copias del skill y se añade una compartida.
La licencia MIT no cambia, no hay dependencias, cuentas, proveedores ni costo incremental. Ningún servidor
MCP se activa y ninguna skill de terceros se instala; el catálogo canónico sigue declarando cero servidores y
los adapters MCP se renderizan vacíos. `scripts/harness-contract.mjs` y `test/harness-capabilities.test.mjs`
son herramientas de desarrollo y no viajan en el tarball.

## Compatibilidad hacia atrás de la copia seed-once

`.project-os/harness-capabilities.json` pertenece al consumidor. Se revisaron los dos modos de
incompatibilidad y ambos están cubiertos.

Una copia sin el bloque de verificación sigue siendo legible: el normalizador devuelve `null` y la matriz
generada muestra `sin declarar` en lugar de romperse. Una copia que nombra una ruta retirada sincroniza por
el reemplazo instalado, y el destino declarado junto a su reemplazo aparece como sección propia en el espejo
generado. El constructor no reescribe el archivo en ninguno de los dos casos.

## Recuperación ensayada

El rollback de este change es revertir el commit: restaura la matriz anterior, sus rutas, el schema y las
pruebas. Para un consumidor ya sincronizado, el ensayo con el runtime anterior ejerció el ciclo completo:
drift detectado sin mutar, borrado explícito de lo retirado, conflicto que preserva una edición humana,
segundo check sin drift y rollback del árbol que restaura los dos adapters heredados.

Ese ensayo falló en su primera ejecución y esa falla es la que produjo la resolución de destinos retirados.
Queda registrada en la evidencia de validación en lugar de silenciarse.

## Antigravity

Se evaluó en una fixture de candidato separada, fuera de la matriz de cinco harnesses y fuera del paquete
publicado. El contrato de promoción lo rechaza con `no-renderer-target` y `no-fixture` en las seis
capacidades. Que lea `AGENTS.md` igual que Codex no lo promueve: eso sería promover por similitud. Una prueba
adicional comprueba que un candidato completo sí sería promovible, para que el contrato no sea inalcanzable
por construcción.
