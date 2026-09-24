# Revisión de recuperación

Fecha: 2026-09-24. Cambio: `fix-release-pack-eol-classification`, issue #155.

La recuperación previa a publicación es revertir el PR de seguimiento por el proceso GitHub protegido, sin mover ni recrear `v1.0.0`. Si el workflow falla antes de crear assets, corregir `main` y volver a ejecutar el flujo para el mismo tag. Si ya existe una publicación incorrecta, los tags/versiones son inmutables: preparar una nueva versión correctiva y verificar sus hashes y provenance; no sobrescribir la versión publicada.

La suite `npm run check` pasó 359/359 pruebas y ejercitó una transacción desechable: el test «rollback normal restaura el repositorio previo y conserva evidencia del journal» confirmó restauración y journal terminal; otros casos rechazan rollback sobre edición humana. El dry-run del tag exacto confirmó que la recuperación del packer no altera los 193 archivos públicos. Esta es evidencia de ensayo en fixtures; no se ejecutó rollback en la release real ni se tocó el tag.

Antes de integrar no hay assets parciales que reconciliar: el run 35949205399 falló durante preflight antes del artefacto. Cualquier incidente posterior a publicación se manejará por nueva versión, según `SECURITY.md` y [la política de releases](../../../../docs/RELEASES.md).
