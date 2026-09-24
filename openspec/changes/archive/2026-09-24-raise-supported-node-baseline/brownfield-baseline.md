# Baseline de #155 antes de apply

La rama `codex/155-raise-supported-node-baseline` parte de `origin/main` (`de33d28`, cierre de #168). El árbol estaba limpio antes de crear este change. Issue #155 permanece abierto, pasó `readiness-check --phase propose` con 13 PASS y 0 FAIL, y no hay PR abierto que mencione #155 ni otro change activo con este alcance.

## Estado observado

| Fuente | Estado antes del apply |
| --- | --- |
| `package.json` / `package-lock.json` | `engines.node` es `^20.20.0 || >=22.22.0`; package version `0.5.0`. |
| `.nvmrc` | Fija Node `22.22.0`, no la línea recomendada actual. |
| `.github/workflows/ci.yml` | Matriz core Node `20.20.0`, `22.22.0` en Ubuntu, Windows y macOS; Companion usa Node `24.18.0` en un job separado. |
| `blueprint/core/package.json` y lock | Repite el rango que admite Node 20 y todo major posterior a 22. |
| `blueprint/core/github/workflows/project-constructor.yml` | Siembra matriz de consumidor con Node 20 y Node 22 en tres sistemas. |
| `src/cli.mjs` | Acepta Node 20.20+, Node 22.22+ y cualquier major posterior a 22; el error muestra el rango anterior. |
| `src/doctor.mjs` | Expone el rango antiguo y acepta Node 20 y todo major posterior a 22. |
| `docs/COMPATIBILITY.md`, `README.md`, `docs/CLI_GUIDE.md` | Publican el rango antiguo; no describen política EOL/revisión. |
| Blueprint runbook y matriz | Documentan los mismos Node 20/22 para consumidores generados. |
| `openspec/specs/runtime/spec.md` | No define contrato para las versiones Node admitidas ni el runtime heredado del consumidor. |
| `apps/companion/package.json` | Companion tiene su propio contrato `>=24.18.0`; el issue excluye modificarlo. |

## Alcance de ownership

El núcleo posee la CLI, el blueprint universal, su matriz CI y la guía pública de compatibilidad. Los consumidores reciben ese contrato al bootstrap; Companion conserva su ciclo y runtime de app. No se reescriben el ADR ni evidencia histórica que describen Node 20 antes de EOL, ni snapshots de artefactos fijados al paquete publicado 0.5.0.

## Decisiones de versión

`docs/architecture/VERSIONING.md` clasifica como major los cambios incompatibles de política. Retirar runtime Node 20 y excluir majors no LTS cambia la elegibilidad de instalación; se clasifica como major, no como minor con aviso. La propuesta de lanzamiento es 1.0.0, siguiendo `docs/RELEASES.md` y las protecciones de publicación existentes.
