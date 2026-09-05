# Releases

El cliente de instalación y publicación está fijado a npm 11.19.1. Revisa la fijación antes de cada
release, trimestralmente y ante un advisory del cliente; ensaya el tarball completo antes de cambiarla.
Consulta [la política de instalación](INSTALL_HARDENING.md) para la cuarentena y sus límites.

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
Se investiga y se relanza el workflow con el mismo tag solo si npm aún no aceptó la publicación.
No se mueve el tag, no se reutiliza la versión y no
se sustituye el Release por una reconstrucción distinta. Habilitar immutable releases es un endurecimiento
administrativo compatible, pero no un requisito ni una mutación automática de este flujo.

## Publicación aceptada y verificación pendiente

npm puede aceptar y firmar el paquete antes de que su versión y procedencia estén disponibles. El probe
espera hasta diez minutos, con solicitudes de hasta quince segundos y espera progresiva de uno a quince
segundos. Reintenta metadata parcial, fallos de red, HTTP 404, 408, 429 y 5xx. Errores permanentes, JSON
inválido o identidad divergente fallan; agotar el plazo nunca significa PASS.

Si npm ya aceptó la versión, abre **Actions → Verify published release → Run workflow**, selecciona
`main` y escribe el tag existente. También puedes ejecutar:

```bash
gh workflow run verify-published.yml --ref main -f tag=v0.3.0
```

Este workflow verifica el commit del tag remoto, los tres assets esperados de GitHub, SHA-256, cantidad
de bytes e integridad SHA-512 de npm. Instala la versión exacta en una carpeta temporal con scripts
deshabilitados; la excepción de cuarentena cubre únicamente el paquete propio ya revisado. Usa npm
11.19.1 para comprobar firmas y attestations, y exige que la procedencia firmada vincule el artefacto
con este repositorio, el workflow de release y el commit canónico. No ejecuta el código instalado.
Los permisos son solo de lectura; no requiere OIDC, no publica y no modifica tags ni assets.

Para comprobarlo localmente con ese cliente npm ya disponible, usa
`node scripts/verify-published.mjs --tag v0.3.0`. Se necesita `gh` autenticado para leer los assets.
El resultado JSON contiene la identidad pública verificada. Los directorios temporales de comprobación
quedan disponibles para diagnóstico local; el runner de GitHub los descarta al terminar.

Una firma, commit o checksum divergente requiere investigación. Si solo falla disponibilidad o vence el
plazo, repite **Verify published release**. Conserva el resultado original y enlaza la ejecución de
recuperación: una comprobación posterior no convierte el run anterior en exitoso.

### Evidencia de 0.3.0

El [run original 33995560577](https://github.com/IgnacioBarEsp/project-engineering-os/actions/runs/33995560577)
publicó y firmó 0.3.0 el 5 de septiembre de 2026. Su probe anterior agotó veinte segundos mientras npm
procesaba el paquete; después el registry devolvió la versión con firmas válidas. El artefacto conserva
317404 bytes, commit `de47fb7b1373da7f02ea2bac5958635a338f76e0` y SHA-256
`e5d0e54a96ac0f93d4afa7b002f851a2771a54246d4da56954584b5c1dc07ada`.
El cierre con la ejecución de recuperación se registra en el
[issue #74](https://github.com/IgnacioBarEsp/project-engineering-os/issues/74).

## Checkout y recuperación de defectos

Antes de empacar, `pack-release.mjs` exige que todo archivo con `eol=lf` tenga LF real en el working tree.
Un checkout legacy con CRLF falla nombrando rutas. La recuperación es crear una worktree/clone fresca del
commit; no se normaliza ni reescribe automáticamente la copia del usuario.

No se reutiliza una versión ni se mueve un tag publicado. Una release defectuosa se depreca y se corrige
con patch. `unpublish` no es el rollback normal.

La política SemVer completa está en [versionado y migraciones](architecture/VERSIONING.md). La razón de
usar un solo paquete público está en el [ADR 0001](adr/0001-public-distribution.md).
