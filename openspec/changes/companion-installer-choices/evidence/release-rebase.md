# Rebase de release — #168

El 21 de septiembre de 2026 se comprobó que `companion-v0.3.2` ya está publicado y no es draft. El workflow
de release rechaza deliberadamente reemplazar assets de un tag existente, por lo que no puede producir evidencia
legítima del instalador cambiado con esa identidad.

El issue #168 ya había fijado la decisión: después de publicar 0.3.2, este trabajo sale como 0.3.3. Se actualizó
el manifiesto, lockfile, avisos, arnés de release, notas y estado público a 0.3.3. La ruta de actualización sigue
partiendo del artefacto inmutable 0.1.0; no se altera ningún tag o asset publicado.

Validación local de este ajuste:

- `node --test apps/companion/qa/packaging.mjs`: 21 PASS, 0 FAIL.
- `npx --no-install openspec validate companion-installer-choices --strict --no-interactive`: PASS.
- `git diff --check`: PASS.

El intento protegido de 0.3.3 falló antes de instalar por una consulta de Escritorio ligada al perfil temporal;
queda registrado en [release-attempt-0.3.3.md](release-attempt-0.3.3.md). La instalación real, las ramas
asistidas y el ciclo silencioso continúan pendientes del candidato 0.3.4 y del runner Windows protegido; esta
evidencia no los presenta como ejecutados.
