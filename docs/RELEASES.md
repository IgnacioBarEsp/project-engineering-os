# Releases

Una release es un único artefacto verificable. Se crea y prueba antes de llegar a GitHub; si la aprobación
de npm tarda, el tag vuelve a demostrar que esos mismos bytes siguen siendo publicables. Esta guía resume
el camino y la recuperación cuando algo falla.

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
7. espera la aprobación del environment `npm-publish`;
8. descarga los tres assets canónicos desde el GitHub Release;
9. reconstruye una copia de verificación desde el mismo tag;
10. exige igualdad byte por byte y publica el `.tgz` del Release con provenance OIDC.

La copia reconstruida nunca se publica. Solo demuestra que el tarball, `release-manifest.json` y
`SHA256SUMS` del Release corresponden al source protegido. El candidato temporal se conserva 35 días,
por encima de la ventana máxima de aprobación de 30 días, pero npm no depende de esa copia.

Durante la recuperación, `release/` contiene la copia reconstruida desde el tag porque es la salida
permitida por los controles del propio source. Los assets canónicos se descargan después en
`canonical-release/`. El comparador exige igualdad exacta entre ambos directorios y `npm publish` acepta
únicamente `./canonical-release/*.tgz`. Esta separación también permite relanzar un tag cuyo GitHub Release
ya existe sin mezclar la evidencia reconstruida con la única copia publicable.

Si falta un asset, aparece uno adicional o cualquier byte difiere, el job falla antes de `npm publish`.
Se investiga y se relanza el workflow con el mismo tag. No se mueve el tag, no se reutiliza la versión y no
se sustituye el Release por una reconstrucción distinta. Habilitar immutable releases es un endurecimiento
administrativo compatible, pero no un requisito ni una mutación automática de este flujo.

Antes de empacar, `pack-release.mjs` exige que todo archivo con `eol=lf` tenga LF real en el working tree.
Un checkout legacy con CRLF falla nombrando rutas. La recuperación es crear una worktree/clone fresca del
commit; no se normaliza ni reescribe automáticamente la copia del usuario.

No se reutiliza una versión ni se mueve un tag publicado. Una release defectuosa se depreca y se corrige
con patch. `unpublish` no es el rollback normal.

La política SemVer completa está en [versionado y migraciones](architecture/VERSIONING.md). La razón de
usar un solo paquete público está en el [ADR 0001](adr/0001-public-distribution.md).
