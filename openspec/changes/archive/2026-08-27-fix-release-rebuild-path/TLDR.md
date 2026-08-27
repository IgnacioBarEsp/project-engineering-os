# v0.2.0 debe poder completar npm sin cambiar de identidad

El paquete y el GitHub Release de `v0.2.0` pasaron sus verificaciones, pero el workspace local del job npm
usó una carpeta que el propio control de neutralidad prohíbe. El fallo ocurrió antes de publicar y conservó
intactos el tag, el checksum, el manifest y el tarball canónico.

## Dos copias, una sola publicable

La reconstrucción desde el tag usará la ruta permitida `release/`. Después se descargarán los assets
canónicos en `canonical-release/`. Deben contener exactamente los mismos tres archivos y bytes. Aunque
coincidan, solo el tarball de `canonical-release/` podrá llegar a npm.

## Recuperación sin atajos

No se mueve el tag, no se regenera el Release, no se amplía la allowlist y no se introduce un token. El PR
refuerza las pruebas, se fusiona por el flujo protegido y luego se reejecuta el mismo tag con aprobación
humana, OIDC y provenance.

## Resultado esperado

`create-project-engineering-os@0.2.0` queda publicado con los bytes ya validados. Si cualquier comparación
falla, npm permanece sin esa versión y la recuperación vuelve a detenerse de forma segura.
