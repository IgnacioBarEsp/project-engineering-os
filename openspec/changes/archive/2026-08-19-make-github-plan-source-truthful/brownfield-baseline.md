# Brownfield baseline — procedencia de github-plan

## 1. Superficie acotada

`src/github-plan.mjs`, salida CLI, pruebas, `docs/PROJECT_OS.md`, manifest upstream y spec runtime.

## 2. Fuentes vigentes

- Issue #20 y comportamiento reproducible en `main`.
- `.project-os/repository-governance.json` y GitHub Project 3.
- Seed `blueprint/core/project-os/github/product-os.json`.
- `openspec/specs/runtime/spec.md`.

## 3. Comportamiento actual

Ante target ausente, el seed se atribuye a la ruta solicitada. En el upstream eso produce diez discovery
issues, `Inbox` y fields de consumidor aunque su fuente real declara `Backlog` y otra taxonomía.

## 4. Comportamiento objetivo

El plan resuelve primero una fuente real del target, reporta procedencia y normaliza sus recursos. Solo un
consumidor sin archivo target usa el seed, identificado como tal.

## 5. Compatibilidad heredada

Se conservan modo dry-run, `mutationPerformed: false`, remote not-verified, gates manuales y recursos
existentes. `source` corrige un valor falso y `provenance` hace explícita la transición.

## 6. Owner de spec y contexto

Runtime y blueprint pertenecen al upstream. Cada repositorio posee su manifest target y GitHub conserva la
realidad remota detrás de gates humanos.

## 7. Evidencia prevista

Pruebas target/seed/missing, salida real del upstream, comparación read-only con Project 3, suite, pack,
OpenSpec, adversarial review, Debt Control y readiness.

## 8. Exclusiones

Mutaciones remotas, rediseño de estados, migración de labels y preparación adaptativa del Issue #23.
