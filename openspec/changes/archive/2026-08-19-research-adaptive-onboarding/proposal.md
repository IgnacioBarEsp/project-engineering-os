## Why

Issue de origen: [#23](https://github.com/IgnacioBarEsp/project-engineering-os/issues/23).

El flujo actual separa la preparación del entorno del descubrimiento del producto, pero obliga a todas las
personas a recorrer el mismo orden y no explica cuándo conviene un tablero, una skill, un MCP o una
integración remota. Antes de implementar un router hace falta una decisión verificable que conserve la
facilidad para principiantes sin degradar repositorios existentes ni prometer paridad falsa entre agentes.

## What Changes

- Publicar una decisión de arquitectura documental con tres rutas: principiante, proyecto nuevo con una
  persona experimentada y repositorio brownfield.
- Definir una política de tracker que explique su valor y elija entre GitHub Projects, Azure Boards, Jira o
  posponer según el contexto ya existente.
- Separar responsabilidades entre conversación, CLI, skill, MCP, documentación e integración remota.
- Comparar la capacidad vigente de Claude Code, Codex, Cursor, GitHub Copilot y OpenCode con los adaptadores
  que genera hoy Project Engineering OS.
- Clasificar herramientas universales, condicionales y no predeterminadas con costo, licencia,
  autenticación, datos enviados y rollback.
- Registrar amenazas de sobreautomatización, prompt injection, permisos amplios, lock-in y obsolescencia.
- Probar tres recorridos en papel y crear issues independientes para la implementación futura.
- Mantener fuera del cambio cualquier modificación al runtime, activación de MCP/skills, autenticación o
  creación de recursos remotos.

## Capabilities

### New Capabilities

Ninguna. Este spike no habilita onboarding adaptativo en el runtime.

### Modified Capabilities

- `public-documentation-experience`: La documentación de decisiones futuras deberá distinguir verdad
  actual, objetivo, evidencia, límites de autorización y backlog antes de presentar una capacidad como
  disponible.

## Impact

- Afecta un nuevo decision record bajo `docs/`, su entrada en `docs/README.md` y artefactos OpenSpec.
- No modifica CLI, prompts instalados, blueprint, esquemas, harnesses, dependencias ni servicios externos.
- Costo incremental: cero. Las fuentes y catálogos estudiados no se instalan ni activan.
- Riesgo principal: que una matriz envejezca o confunda soporte del agente con soporte del constructor. La
  mitigación es fechar fuentes, separar ambas columnas y exigir pruebas de runtime en la implementación.
- Rollback: revertir el commit documental y cerrar los issues derivados como no planificados; no existe
  estado local o remoto del producto que migrar.
