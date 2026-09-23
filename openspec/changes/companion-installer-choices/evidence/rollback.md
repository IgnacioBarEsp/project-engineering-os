# Rollback — companion-installer-choices

El change no migra datos ni cambia el formato de proyectos, historial o runtimes. La recuperación aprobada es
revertir el PR antes de publicar una release nueva; los artefactos ya publicados permanecen inmutables y una
corrección posterior recibe otra identidad de release.

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
