# Revisión adversarial

Fecha: 2026-09-24. Revisión del propio agente desde el worktree aislado; no se presenta como revisión humana
independiente ni como aprobación para merge.

## Alcance

`src/commands.mjs`, `src/cli.mjs`, la prueba de integración de selección de perfiles, la spec y la guía de
operación upstream.

## Ataques y verificaciones

1. **Falsificar la identidad con una sola señal.** Un consumidor con solo `repositoryKind: upstream` y otro
   con solo el nombre del paquete conservan el error de deriva tanto en `sync --check` como en
   `upgrade --check`. Solo la coincidencia de ambas señales entra al skip.
2. **Disfrazar archivos externos mediante enlaces.** Antes de leer identidad se verifica que
   `package.json` y `.project-os/repository-governance.json` no escapen por enlaces simbólicos.
3. **Convertir una comprobación en mutación.** La respuesta skip contiene exit 0, `mutationPerformed: false`
   y no incluye plan. La prueba compara snapshot exacto antes y después. `sync --dry-run`, `sync` apply y
   `upgrade --apply` no se saltan; el mismatch aborta antes de escritura y el snapshot permanece igual.
4. **Romper consumidores válidos o diagnósticos.** El fixture base mantiene su check normal. El fixture
   divergente conserva `PROJECT_OS_PROFILE_SELECTION_DRIFT` y ambos conjuntos de perfiles en `details`.
5. **Ocultar límites al operador.** JSON y salida humana comunican `SKIP` y remiten al fixture consumidor.
   La documentación conserva los 9 conflictos de `a3b1efd` como medición histórica, no como estado vigente.
6. **Hacer pasar trabajo ajeno.** La excepción no alcanza `bootstrap`, los modos mutantes, el doctor ni los
   conflictos de ownership de consumidores; los perfiles aprobados y defaults no cambian.

## Hallazgos

La revisión detectó la necesidad de validar rutas de identidad contra escapes de symlink antes de leerlas;
se añadió `assertNoSymlinkEscape` y el conjunto focal quedó verde. No quedan Blockers ni Majors conocidos.

## Revisión de seguridad del diff

Codex Security diff scan `0bd907db-0645-4241-8e4d-ffb64a9663b8`: completado, 7/7 archivos inventariados,
4 superficies revisadas y 0 findings reportables. El alcance cubrió la identidad de dos señales, las rutas
y symlinks, la separación de checks read-only frente a modos mutantes, y la evidencia/documentación.
El informe está en el estado local de Codex Security; el ID permite localizarlo en esta sesión.

Esta revisión técnica no es una aprobación humana independiente del PR. La aprobación de merge sigue
sujeta a CI protegida y a la política de revisión del repositorio.
