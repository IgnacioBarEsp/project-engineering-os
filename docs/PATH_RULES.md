# Reglas según los archivos del proyecto

Edita `.project-os/path-rules.json` y ejecuta primero `project-os sync --check` para revisar el plan.
Cada regla tiene un `id`, una lista `globs` y una lista `instructions`. La sincronización genera un archivo
por regla; los archivos generados se editan desde esa fuente, no directamente.

| Agente | Archivo por regla | Selector |
| --- | --- | --- |
| Claude Code | `.claude/rules/project-os-<id>.md` | `paths`, lista YAML |
| Cursor | `.cursor/rules/project-os-<id>.mdc` | `globs`, patrones separados por comas; `alwaysApply: false` |
| GitHub Copilot CLI | `.github/instructions/project-os-<id>.instructions.md` | `applyTo`, patrones separados por comas |

Las reglas se adjuntan según el contexto de archivos del agente. El constructor conserva los patrones;
la fixture prueba archivos, selectores y cuerpos. No certifica que un modelo haya leído u obedecido una
regla. La matriz usa `generated` y mantiene startup, tool listing y smoke como señales separadas.

Fuentes consultadas el **2026-09-05**: [Claude Code](https://code.claude.com/docs/en/memory),
[Cursor](https://cursor.com/docs/context/rules) y
[Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-custom-instructions).
No se inventa una versión mínima ni se extrapola la comprobación de Copilot CLI a todas sus superficies.

## Formato portable

Usa IDs de hasta 64 caracteres: minúsculas, números y guiones, empezando por letra o número. Usa rutas
relativas con `/`; se admiten letras, números, guion, punto, guion bajo y comodines `*`, `**`, `?`.
Las listas de patrones no pueden estar vacías. Declara extensiones o carpetas diferentes como patrones
separados, por ejemplo `["**/*.md", "docs/**/*"]`.

No se admiten rutas absolutas, `..`, comas, espacios, controles, llaves, clases entre corchetes ni negaciones.
Este subconjunto evita que una regla cambie de alcance al traducirse entre formatos. Un patrón que no se
puede representar falla antes de escribir; no se convierte en universal. Una regla sin instrucciones
también falla. Una lista de reglas vacía permite retirar todas las reglas administradas.

## Actualización y recuperación

Los archivos agregados existentes de Claude, Cursor y Copilot quedan como índices con enlaces. Sus cuerpos
ya no repiten instrucciones específicas de otra carpeta. Codex y OpenCode conservan el fallback textual
con patrones en sus instrucciones; sigue siendo `documented` y requiere interpretación del agente.

Al quitar una regla, sync elimina únicamente las copias administradas que conservan su hash. Una copia
modificada o una colisión con un archivo ajeno genera conflicto. El journal permite revertir los archivos
de la transacción; conserva la fuente canónica que editó la persona. Para volver a sincronizar tras un
rollback, restaura también la decisión en la fuente si ese es el resultado deseado.

Los consumidores existentes conservan su matriz seed-once. Aunque reciban los archivos nuevos, su matriz
puede continuar declarando `documented`; revisa y migra esas tres celdas de forma explícita al contrato
actual si quieres reflejar la capacidad nueva. El constructor no sobrescribe esa decisión del consumidor.

Consulta [compatibilidad](COMPATIBILITY.md), [ownership](architecture/OWNERSHIP.md) y
[recuperación](RECOVERY.md) para completar una actualización.
