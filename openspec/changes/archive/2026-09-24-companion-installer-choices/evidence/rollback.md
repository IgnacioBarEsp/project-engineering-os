# Rollback — companion-installer-choices

El change no migra datos ni cambia el formato de proyectos, historial o runtimes. Antes de publicar, la
recuperación era revertir el PR. Como 0.3.6 ya está publicada, su tag y sus assets permanecen inmutables:
una regresión posterior se corrige con un PR protegido y una versión nueva; nunca se borra ni retargetea
esta release.

La revisión estática confirmó que el include solo añade la página y la propiedad del enlace, y que el
desinstalador retira el enlace con nombre conocido además de conservar la limpieza existente.

## Ensayo de reversión del PR

El 23 de septiembre de 2026 se creó un worktree detached desechable en `4bffacefd1b78a1a3915c136714c3d8a2577004c`.
Se revirtieron en orden inverso los tres commits del PR posteriores a `ad9ebf01745856fa0b9329e188a4e310dd1f0070`
(`4bfface`, `89a7614` y `5c07dfe`) con `git revert --no-commit`. `git diff --cached --exit-code` contra
`ad9ebf0` terminó en 0: el índice resultante coincidió exactamente con el estado base, sin conflictos.
Se eliminó únicamente ese worktree de ensayo. El checkout del PR no se modificó.

Esto verifica el procedimiento de reversión del cambio integrado antes de una nueva release; no simula el
desinstalador ni revierte un artefacto ya publicado. El flujo de release sigue reconstruyendo y publicando
identidades inmutables, de modo que una corrección posterior requiere otra versión.

## Ensayo conjunto después de publicar 0.3.6

El 24 de septiembre de 2026 se creó otro worktree detached temporal desde `main` (`c250fa8`). Allí se
revirtieron sin commit, en orden inverso, los squash merges de los PRs #183 (`c250fa8`), #182 (`dc10e33`) y
#181 (`cb0995e`). No hubo conflictos; `git diff --cached --check` pasó y `git write-tree` produjo exactamente
el árbol de la base previa `ad9ebf0` (`eea3df886a9cad85f0168ebfdf5429829a113a03`). Se retiró únicamente el
worktree desechable. El checkout de trabajo no cambió y la release/tag `companion-v0.3.6` quedaron intactos.

El ensayo comprueba que los cambios fuente/documentación pueden revertirse juntos; no hace que una release
publicada desaparezca ni simula la desinstalación del producto. Para esta versión, la ejecución de instalación,
actualización y desinstalación está en [release-0.3.6.md](release-0.3.6.md).
