# Rollback — companion-installer-choices

El change no migra datos ni cambia el formato de proyectos, historial o runtimes. La recuperación aprobada es
revertir el PR antes de publicar una release nueva; los artefactos ya publicados permanecen inmutables y una
corrección posterior recibe otra identidad de release.

La revisión estática confirmó que el include solo añade la página y la propiedad del enlace, y que el
desinstalador retira el enlace con nombre conocido además de conservar la limpieza existente. La prueba de
reversión sobre un instalador Windows desechable queda pendiente del mismo runner protegido que ejecuta la
instalación asistida y la actualización; no se etiqueta esta lectura como ensayo de rollback.
