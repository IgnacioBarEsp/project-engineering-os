# Verificación de fuentes

Fecha: 18 de agosto de 2026. Solo se usaron documentación oficial, repositorios de los autores y código
versionado del proyecto.

## Flujo y estándares

- Spec Kit: flujo spec/plan/tasks/implement, adapters por agente y gates humanos.
- Agent Skills: `SKILL.md`, frontmatter, licencia/compatibilidad, scripts, referencias y disclosure
  progresivo; `allowed-tools` experimental.
- MCP: host/client/server, tools/resources/prompts, transportes, OAuth, scopes mínimos y prohibición de
  token passthrough.

## Herramientas

- Playwright Test: runner browser reproducible.
- Playwright MCP: accessibility snapshots; CLI + skill recomendado para muchos agentes de código; MCP no
  constituye una frontera de seguridad.
- Context7: CLI + skill y MCP, licencia MIT del repositorio, auth opcional/recomendada y remoción documentada.
- GitHub Projects, Azure Boards y Jira: capacidades de planificación verificadas en sus docs oficiales.

## Agentes

- Claude Code: CLAUDE.md, skills, MCP y permisos.
- Codex: AGENTS.md, skills y MCP.
- Cursor: rules/AGENTS.md, skills y MCP.
- GitHub Copilot: instructions, skills y MCP con diferencias por superficie.
- OpenCode: agentes, skills, MCP y permisos.
- Antigravity: candidato oficial con varias superficies, todavía no soportado por el constructor.

Los enlaces exactos se conservan junto a cada afirmación y en la sección Fuentes principales de
`docs/ADAPTIVE_ONBOARDING.md`.
