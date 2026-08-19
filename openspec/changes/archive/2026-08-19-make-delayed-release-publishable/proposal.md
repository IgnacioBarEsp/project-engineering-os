## Why

Issue de origen: [#17](https://github.com/IgnacioBarEsp/project-engineering-os/issues/17).

El job protegido de npm puede esperar aprobación hasta 30 días, pero el tarball que intenta descargar
caduca a los 7. `v0.1.6` demostró que una release validada y creada en GitHub puede quedar imposible de
publicar después de una aprobación legítima.

## What Changes

- Conservar el artifact de workflow durante 35 días, por encima de la ventana máxima de aprobación.
- Hacer que el job npm descargue los assets del GitHub Release asociado al tag en vez de depender del
  artifact temporal.
- Reconstruir y probar una copia de verificación desde el tag protegido después de la aprobación.
- Comparar tarball, manifest y checksum byte por byte; publicar solo el asset del Release si coincide.
- Documentar el fallo, la recuperación y el hecho de que immutable releases sigue como gate manual.

## Capabilities

### New Capabilities

- Ninguna.

### Modified Capabilities

- `distribution`: la identidad única de release admite una reconstrucción de verificación que nunca se
  publica si difiere y desacopla la aprobación de npm de la retención temporal del workflow.

## Impact

- Afecta `.github/workflows/release.yml`, checks estáticos, pruebas, documentación y la spec distribution.
- No cambia el paquete, sus exports, dependencias, SemVer, OIDC ni la aprobación humana.
- Costo incremental despreciable: un artifact pequeño retenido 35 días y una segunda ejecución del build.
- Riesgo: una salida no determinista bloqueará la publicación de forma segura. Rollback por revert y
  relanzamiento desde el tag; nunca se mueve ni reutiliza una versión.
