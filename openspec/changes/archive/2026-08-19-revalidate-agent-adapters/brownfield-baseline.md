# Brownfield baseline — revalidación de adapters por agente

## 1. Superficie tocada

Matriz canónica de capacidades y su schema, manifest del blueprint, destinos de los adapters de skills,
normalizador y renderer de harness en el runtime reutilizable, contrato de adapters nuevo, fixture de
bootstrap, y las tres matrices de documentación.

## 2. Fuentes vigentes

- Issue #32 enriquecido y la decisión de política `docs/ADAPTIVE_ONBOARDING.md` derivada de #23.
- `blueprint/core/project-os/harness-capabilities.json` y `blueprint/schema/harness-capabilities.schema.json`.
- `blueprint/manifest.json` y `blueprint/core/harness/`.
- `src/harness.mjs`, `src/plan.mjs` y `src/doctor.mjs`.
- `docs/COMPATIBILITY.md`, `blueprint/core/docs/engineering/COMPATIBILITY_MATRIX.md`.
- `test/constructor.integration.test.mjs` y `scripts/verify-fixture.mjs`.
- Documentación oficial de Claude Code, Codex, Cursor, GitHub Copilot y OpenCode, consultada el 2026-08-19.

## 3. Comportamiento actual

Cada celda declara una sola palabra de soporte, sin versión mínima, sin fuente, sin fecha y sin distinguir
configuración de startup, tool listing o smoke. `parityPolicy` declara que la configuración no prueba
runtime, pero ninguna comprobación por celda lo hace cumplir.

Codex declara `native` sobre `.codex/skills/project-os/SKILL.md`, una ruta que su documentación oficial no
lista. Cursor y GitHub Copilot declaran `unsupported` en skills pese a documentar ubicaciones de repositorio.
GitHub Copilot usa una fila única para MCP aunque sus superficies divergen. OpenCode clasifica como
`generated` la misma forma de archivo que Claude Code y Codex clasifican como `native`.

## 4. Comportamiento objetivo

`support` describe solo el rendering y un bloque de verificación registra versión mínima, fuente fechada,
fixture y las tres señales de runtime por separado. Una celda renderizada sin fuente fechada, fixture,
superficie, fallback o degradación falla en lugar de publicarse. Una celda nativa no puede excluir
superficies oficiales de su harness. La skill se instala en dos rutas oficiales en vez de una copia por
proveedor, y un consumidor cuya copia seed-once nombre una ruta retirada sigue sincronizando con la
desactualización declarada.

## 5. Compatibilidad legacy

Los cinco harness IDs y las seis capacidades no cambian, así que `HARNESS_CAPABILITY_SCHEMA` y
`HARNESS_CAPABILITY_STATES` conservan su forma y ninguna exportación previa cambia de firma. El bloque de
verificación es opcional en schema y normalizador, de modo que una copia seed-once anterior sigue siendo
legible y la matriz generada muestra `sin declarar` en vez de romperse.

La retirada de los dos adapters heredados aparece como operación `delete` explícita en el plan read-only, y
un archivo editado por una persona produce `conflict` en vez de borrarse. OPSX conserva sus propias skills
bajo `.codex/skills/openspec-*` y `.agents/skills/openspec-*`, que este cambio no toca.

## 6. Owner de spec y contexto

El upstream posee matriz, schema, manifest, adapters, contrato y pruebas. El consumidor posee su copia
seed-once de la matriz y cualquier receipt opt-in que decida producir. OpenSpec conserva OPSX. Trackers
remotos pertenecen a #33 y el catálogo curado de skills y MCP a #34.

## 7. Evidencia

Contrato de adapters con una fixture por formato oficial y casos negativos, suite completa, comprobación del
contrato dentro de la fixture de bootstrap sobre el repositorio realmente instalado, ensayo de actualización
de un consumidor bootstrapeado con el runtime anterior, verificación de que las dieciséis URLs registradas
responden sin redirección, OpenSpec strict, `npm run check`, `pack:verify`, `git diff --check`, revisión
adversarial, assessment de deuda y readiness de archive.

## 8. Exclusiones

Promoción de instrucciones por ruta, que exige un renderer por regla; ejecución de agentes de terceros en
CI; activación de servidores MCP; instalación de skills de terceros; partición de los harness IDs; trackers
remotos; catálogo curado de skills y MCP; y cualquier decisión de stack, arquitectura, CI/CD, cloud o base
de datos del producto consumidor.
