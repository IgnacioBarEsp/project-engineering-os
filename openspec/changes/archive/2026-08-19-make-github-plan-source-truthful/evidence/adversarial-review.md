# Revisión adversarial

**Alcance:** Issue #20 y change `make-github-plan-source-truthful`.

**Fuentes:** issue, proposal, design, delta spec, diff, runtime, salida humana/JSON, tests target/seed/inline/
missing, manifest upstream, seed consumidor y comparación read-only con GitHub Project 3.

## Alineación

- La precedencia usa una fuente existente del target antes de seeds equivalentes.
- `source` contiene la ruta resuelta y `provenance` conserva kind, solicitud y resolución.
- El upstream declara cero discovery issues y sus recursos coinciden con su manifest.
- El consumidor bootstrapeado usa target; sin bootstrap usa el seed explícitamente identificado.
- Ninguna ruta autentica, consulta automáticamente ni muta GitHub.

## Hallazgos corregidos

| Severidad | Área | Hallazgo | Corrección |
| --- | --- | --- | --- |
| Major | Normalización | La primera implementación seguía leyendo statuses solo en raíz; el upstream los declara dentro de project y habría emitido cero. | Se normaliza raíz o project.statuses y la prueba usa el manifest upstream real. |
| Minor | Salida humana | `cli.mjs` y `github-plan.mjs` tenían serializadores duplicados que podían divergir en provenance. | CLI usa `githubPlanText` como único formatter y sus casos target/seed lo ejercitan. |

## Casos negativos

- Manifest target inválido no cae silenciosamente al seed.
- Source custom sin target ni seed produce `GITHUB_PLAN_SOURCE_MISSING` con recuperación.
- Symlinks siguen bajo `assertNoSymlinkEscape` y rutas bajo `resolveInside`.
- Remote continúa `not-verified`; ausencia de autenticación no se interpreta como PASS.
- El seed consumidor no gobierna el upstream y el manifest upstream no se exporta al consumidor.
- Estados, labels y discovery mantienen orden/intención del manifest, sin taxonomía inventada.

## Veredicto

**PASS.** Cero Blockers y cero Majors abiertos. Un Major y un Minor se corrigieron antes del cierre. No hay
deuda residual ni mutaciones remotas.
