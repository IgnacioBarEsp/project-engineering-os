## Why

Issue de origen: [#40](https://github.com/IgnacioBarEsp/project-engineering-os/issues/40).

La primera ejecución de `v0.2.0` creó y verificó el GitHub Release, pero el job protegido de npm falló
antes de publicar porque su carpeta local `rebuilt/` se crea antes del control de neutralidad y ese control
la rechaza como ruta incidental. La recuperación debe conservar el tag y los assets canónicos existentes,
sin relajar la neutralidad ni publicar por un canal alterno.

## What Changes

- Usar una ruta ya permitida para la reconstrucción verificadora dentro del checkout del tag.
- Descargar los assets canónicos del GitHub Release en un directorio separado después de reconstruir.
- Comparar ambos directorios byte por byte y publicar únicamente el tarball descargado del Release.
- Reforzar la prueba estática para impedir que regresen una ruta incompatible o la publicación de la copia
  reconstruida.
- Documentar el incidente real y la reejecución segura del mismo tag.

## Capabilities

### New Capabilities

- Ninguna.

### Modified Capabilities

- `distribution`: la recuperación de una release parcialmente completada debe reconstruir desde el tag en
  una ruta compatible con los controles del propio repositorio y conservar inequívocamente qué copia puede
  publicarse.

## Impact

- Afecta `.github/workflows/release.yml`, la prueba de política de cadena de suministro, la guía de releases
  y la spec `distribution`.
- No cambia el contenido de `v0.2.0`, sus tres assets, el tag protegido, dependencias, licencias, OIDC,
  provenance ni el gate humano de `npm-publish`.
- Riesgo bajo: una asignación errónea de directorios podría comparar o publicar la copia equivocada. Se
  mitiga con nombres explícitos y aserciones negativas. Rollback por revert del workflow; una nueva
  reejecución conserva el mismo tag y falla antes de npm si no puede probar identidad.
