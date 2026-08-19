# Verificación de verdad documental

Fecha: 2026-08-18. Issue: #22. Versión comprobada: `0.1.6`.

## Fuentes consultadas

- Runtime y argumentos: `bin/project-os.mjs`, `src/cli.mjs`, `package.json`.
- Requisitos activos: `openspec/specs/{runtime,distribution,upgrade,debt-control}/spec.md`.
- Agentes: `blueprint/core/project-os/harness-capabilities.json`.
- Skills y MCP: `blueprint/core/project-os/skills.json` y `mcp.json`.
- Flujo inicial: `docs/prompts/PROMPT_00_BOOTSTRAP_ENTORNO.md` y `PROMPT_01_DISCOVERY_PROYECTO.md`.
- Distribución: `package.json`, `docs/RELEASES.md`, `docs/adr/0001-public-distribution.md`.

## Hechos comprobados

- El paquete público y la CLI usan dos bins sobre el mismo runtime.
- El bootstrap no selecciona producto, framework, base de datos, cloud ni arquitectura.
- Los cinco harnesses declarados son Claude Code, Codex, Cursor, GitHub Copilot y OpenCode.
- Native, generated, documented y unsupported son estados distintos; documented/unsupported no equivalen
  a paridad nativa.
- Las tres skills incluidas están desactivadas hasta una decisión explícita.
- No hay servidores MCP universales activos; existe un catálogo abstracto opcional.
- Prompt 00 termina en preparación del entorno y Prompt 01 empieza discovery después de aprobación.
- MVVM, CI/CD del producto, Playwright, IA, UI, offline/sync y cloud son decisiones condicionales posteriores.
- `doctor`, `sync --check`, `upgrade --check`, `github-plan` y readiness son read-only por contrato.
- El onboarding adaptativo y la automatización nueva de tableros pertenecen a #23; #20 limita la confianza
  del plan remoto actual.

## Fixture externo

Ejecutado fuera del repositorio upstream en Windows:

```text
> npx --yes create-project-engineering-os@0.1.6 bootstrap --target .
[APPLIED] bootstrap
Modo: apply
Mutación: sí
Plan: create=74, update=0, delete=0, conflict=0, state=update
EXIT_CODE=0
```

La salida completa se redujo para la pieza visual sin alterar comando, resultado, conteos ni exit code.

## Quickstart completo del README

La secuencia se repitió en otra carpeta Git vacía después de redactar el README:

```text
bootstrap=0
npm-ci=0
openspec-init=0
opsx-adapt=0
project-os-check=0
doctor=0
```

OpenSpec generó correctamente adaptadores para Codex, Claude Code, Cursor, GitHub Copilot y OpenCode. No
se usó el repositorio upstream como padre npm del fixture.
