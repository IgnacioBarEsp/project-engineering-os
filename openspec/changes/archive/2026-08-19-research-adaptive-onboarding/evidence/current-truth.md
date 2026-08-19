# Verdad actual

Fecha: 18 de agosto de 2026.

## Código y manifiestos

- Prompt 00 prepara Git, runtime, bootstrap, OpenSpec, doctor y plan remoto; no pregunta por el producto.
- Prompt 01 inicia discovery solo después de salud, aprobación y ausencia de otro change grande.
- `harness-capabilities.json` declara cinco agentes y separa `native`, `generated`, `documented` y
  `unsupported`.
- `skills.json` contiene tres skills desactivadas y exige decisión explícita.
- `mcp.json` no activa servidores por defecto y distingue startup, tool listing y smoke autenticado.
- El Issue #20 cerró mediante PR #29; `github-plan` ya deriva la gobernanza del target upstream o del seed
  consumidor que realmente existe.

## Diferencias externas relevantes

- Cursor documenta Agent Skills en editor/CLI, pero el constructor todavía declara skills `unsupported`.
- GitHub Copilot documenta Agent Skills y MCP en superficies concretas, pero el constructor todavía los
  declara `unsupported`.
- OpenCode documenta skills on-demand y permisos por tool; el constructor genera el adapter, pero aún no
  atribuye esa superficie como `native`.
- Antigravity documenta AGENTS.md, SKILL.md y MCP, pero no tiene renderer ni fixture en este repositorio.

Estas diferencias se conservaron como backlog #32. El spike no editó la matriz actual porque capacidad del
proveedor no es evidencia de que el constructor la renderice o consuma correctamente.
