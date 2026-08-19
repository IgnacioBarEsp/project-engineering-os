# Releases

Una release es un único artefacto verificable que viaja de tests a GitHub y npm sin reconstruirse. Esta
guía resume el camino y la recuperación cuando algo falla.

**Úsala si:** mantienes el paquete, preparas un tag o necesitas comprobar qué se publicó.

La versión sigue SemVer. Patch corrige comportamiento compatible; minor añade capacidad compatible;
major permite cambios incompatibles con migración y rollback documentados.

Una release:

1. valida tag, versión y changelog;
2. ejecuta CI sin secretos sobre el source;
3. empaca una sola vez;
4. prueba ese tarball fuera del repositorio;
5. genera `SHA256SUMS` y manifest con commit;
6. adjunta exactamente esos artefactos a GitHub Release;
7. publica el mismo `.tgz` en npm con provenance OIDC.

Antes de empacar, `pack-release.mjs` exige que todo archivo con `eol=lf` tenga LF real en el working tree.
Un checkout legacy con CRLF falla nombrando rutas. La recuperación es crear una worktree/clone fresca del
commit; no se normaliza ni reescribe automáticamente la copia del usuario.

No se reutiliza una versión ni se mueve un tag publicado. Una release defectuosa se depreca y se corrige
con patch. `unpublish` no es el rollback normal.

La política SemVer completa está en [versionado y migraciones](architecture/VERSIONING.md). La razón de
usar un solo paquete público está en el [ADR 0001](adr/0001-public-distribution.md).
