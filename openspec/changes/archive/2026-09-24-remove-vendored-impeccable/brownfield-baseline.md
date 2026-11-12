# Baseline de #152 antes del cambio

La worktree parte de `main` en `6763040d42158bd0b06839b10993fd9a13eb2d75`, después del merge de #165. El commit de comparación indicado por el issue es `a3b1efda6a53501a2a06e277cf0b7f18f11c6bed`. #152 estaba abierto y no existía un PR abierto que lo implementara.

## Estado observado en `a3b1efd`

| Fuente | Estado antes del cambio |
| --- | --- |
| `.github/skills/impeccable/` | 51 archivos rastreados; contiene la skill, referencias, launchers y scripts de terceros. |
| `.github/agents/impeccable-*.agent.md` | Cuatro agentes asociados. |
| `.github/hooks/impeccable.json` | Hook `postToolUse` que invoca el launcher vendorizado tras ediciones. |
| `.impeccable/design.json` | Único archivo rastreado bajo `.impeccable/`; describe el sistema visual anterior. |
| `config/export-allowlist.json` | Incluía `.impeccable` y conservaba `.github` para gobernanza y workflows. |
| Notas y gates de terceros | El núcleo no comprobaba que cada paquete de producción tuviera fila de licencia/versión; `check:package` tampoco comparaba el inventario de avisos de Companion con su lockfile. |

Los 57 archivos dentro del alcance contienen 19,744 terminaciones LF al medir sus blobs con `git show a3b1efd:<ruta>`. El total de 62,116 líneas citado originalmente para ese conjunto no se reproduce contra el árbol del commit de referencia. El diff del resto del árbol rastreado frente a `a3b1efd` registra 61,354 líneas añadidas y 20,330 eliminadas (neto +41,024). Para mantener la comparación independiente de la evidencia generada por este mismo cambio, se excluyen `openspec/changes/archive/2026-09-24-remove-vendored-impeccable/**` y `.project-os/debt/assessments/remove-vendored-impeccable.json`. Alcanzar una reducción neta de 60,000 desde ese estado requeriría eliminar otras 101,024 líneas netas fuera del alcance; eso no está aprobado ni se justifica para este saneamiento.

## Límites preservados

`.github` permanece en el árbol exportado porque contiene workflows y reglas propias del proyecto; el cambio retira solo los archivos de Impeccable y no instala un hook alternativo. El contenido histórico de OpenSpec, changelogs y recibos de release permanece intacto. No se altera Companion funcional, PRODUCT.md, dependencias productivas del núcleo ni releases publicadas.

La worktree y su resultado de pruebas están aislados en la rama `codex/152-remove-impeccable-vendor`; el checkout principal no fue modificado.
