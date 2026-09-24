# Compatibilidad

Aquí puedes comprobar dónde se prueba el paquete y qué representa realmente cada agente. “Documented” o
“unsupported” describe una degradación visible; nunca se cuenta como soporte nativo.

**Úsala si:** eliges agente, sistema operativo, versión de Node o investigas una diferencia entre entornos.

## Sistemas y runtime

Esta tabla corresponde al **núcleo CLI**, no al instalador. Companion se distribuye para Windows x64,
incluye su runtime de aplicación y administra herramientas adicionales cuando corresponde al proyecto.
No exige al usuario instalar el Node de esta tabla. [Estado de entregas en GitHub](https://github.com/IgnacioBarEsp/project-engineering-os/blob/main/docs/PROJECT_STATUS.md).

| Sistema | Node probado en CI | Contrato |
|---|---|---|
| Ubuntu | 22.22.0, 24.x | suite, fixture y tarball |
| Windows | 22.22.0, 24.x | misma CLI sin dependencia Bash |
| macOS | 22.22.0, 24.x | misma CLI y rutas portables |

Rango soportado: `^22.22.0 || ^24.18.0`. Node 24 LTS es la línea recomendada y `.nvmrc` fija 24.18.0.
El soporte sigue las líneas LTS mantenidas por el proyecto Node.js; el mínimo avanza cuando una línea
soportada llega a EOL. Actualmente Node 22 está en Maintenance LTS y Node 24 en Active LTS. Node 20 llegó a
EOL el 2026-04-30; Node 22 tiene EOL previsto para 2027-04-30 y Node 24 para 2028-04-30. Node 26 sigue
excluido mientras sea Current. La próxima revisión del contrato se
programa para el 2026-10-28, fecha de transición a LTS actualmente prevista para Node 26; confirma el
[calendario oficial](https://github.com/nodejs/Release#release-schedule) antes de cambiar el rango. También
se consultan [las líneas y versiones soportadas](https://nodejs.org/en/about/previous-releases) y
[la política EOL](https://nodejs.org/en/about/eol). La detección automática de frescura se lleva por #158.

npm es el único package manager garantizado en v1.

### Migrar desde Node 20

Antes de instalar el núcleo 1.0.0, cambia el runtime local y el de CI a Node 22.22.0 o posterior dentro de
Node 22, o Node 24.18.0 o posterior dentro de Node 24 (recomendado). Actualiza `.nvmrc` y la matriz de tu
repositorio si las mantienes. No hay migración de datos: el instalador de paquetes rechazará runtimes fuera
del nuevo `engines.node`. Las versiones publicadas anteriores siguen siendo inmutables, pero Node 20 no
recibe parches de seguridad desde su fecha EOL.

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

Vuelve a la [guía CLI](CLI_GUIDE.md) para continuar con el setup del núcleo.
