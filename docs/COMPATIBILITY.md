# Compatibilidad

Aquí puedes comprobar dónde se prueba el paquete y qué representa realmente cada agente. “Documented” o
“unsupported” describe una degradación visible; nunca se cuenta como soporte nativo.

**Úsala si:** eliges agente, sistema operativo, versión de Node o investigas una diferencia entre entornos.

## Sistemas y runtime

| Sistema | Node probado en CI | Contrato |
|---|---|---|
| Ubuntu | 20.20.0, 22.22.0 | suite, fixture y tarball |
| Windows | 20.20.0, 22.22.0 | misma CLI sin dependencia Bash |
| macOS | 20.20.0, 22.22.0 | misma CLI y rutas portables |

Rango soportado: `^20.20.0 || >=22.22.0`. npm es el único package manager garantizado en v1.

## Harnesses

Las [reglas por carpeta](PATH_RULES.md) conservan sus patrones en tres colecciones generadas. Codex y
OpenCode mantienen el fallback documental; las señales de ejecución siguen siendo independientes.

| Harness | Instrucciones | Path rules | Skills | Permisos | MCP |
|---|---|---|---|---|---|
| Claude Code | native | generated | native | documented | native |
| Codex | native | documented | native | documented | native |
| Cursor | native | generated | native | documented | native |
| GitHub Copilot | native | generated | native | documented | generated |
| OpenCode | generated | documented | native | documented | native |

`native` describe **lo que el constructor escribe**: la ruta y el formato que la documentación oficial del
agente declara para esa capacidad, probado por una fixture offline. No afirma que un agente haya cargado el
archivo. Config presente, proceso iniciado, tool listing y smoke autenticado son cuatro señales distintas y
la matriz las registra por separado; `documented` y `unsupported` nunca se cuentan como paridad nativa.

Ninguna señal de runtime está verificada en esta versión. Verificarlas exigiría instalar el agente del
proveedor y autenticar un modelo, y eso no cabe en una CI offline ni en el alcance neutral del núcleo. Cada
una tiene su propio receipt opt-in bajo `.project-constructor/evidence/`.

## Qué elegir

- Claude Code recibe instrucciones, skills y MCP en sus rutas oficiales propias.
- Codex recibe `AGENTS.md`, la skill compartida y `.codex/config.toml`. Codex solo lee el `config.toml` de
  proyecto en proyectos confiados: sin esa confianza el archivo existe y no se aplica.
- Cursor recibe regla, skill compartida y MCP nativos.
- GitHub Copilot recibe instrucciones y skill nativas. Su MCP es `generated` porque las superficies
  divergen: Copilot CLI sí lee `.mcp.json` del repositorio, pero el agente en la nube y la revisión de
  código solo se configuran en la interfaz de settings, sin archivo versionado.
- OpenCode recibe la skill compartida y MCP nativos; sus instrucciones siguen siendo `generated` porque
  `opencode.json` declara punteros en lugar de contener el texto canónico.

La skill se instala **dos veces, no cinco**: `.claude/skills/project-os/SKILL.md` para Claude Code y
`.agents/skills/project-os/SKILL.md` para Codex, Cursor, Copilot y OpenCode, que documentan esa ubicación
compartida. Instalar una copia por proveedor duplicaría el mismo contenido en agentes que leen varias rutas.

Los permisos permanecen `documented` en los cinco. El vocabulario canónico de `.project-os/permissions.json`
son tokens abstractos de capacidad como `git:push-force`, no nombres de herramienta ni patrones de shell.
Traducirlos a la sintaxis de cada agente inventaría semántica y afirmaría un enforcement que el repositorio
no ha decidido.

## Antigravity

No soportado. Google documenta IDE, CLI y SDK, y sus superficies muestran `AGENTS.md`, `SKILL.md` y MCP, lo
que lo vuelve un candidato real. Entrará a la matriz solo cuando cumpla el mismo contrato que el resto:
renderer con destino declarado, fuente oficial fechada, versión mínima, fixture, fallback y degradación por
cada una de las seis capacidades. Parecerse a otra superficie no promueve una celda.

Vuelve a la [guía del usuario](USER_GUIDE.md) para continuar con el setup.
