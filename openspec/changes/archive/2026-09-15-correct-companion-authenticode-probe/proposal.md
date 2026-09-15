## Why

El segundo dispatch de `companion-v0.2.0` construyó un candidato Windows, pero se detuvo antes de crear
un draft porque `Get-AuthenticodeSignature` no pudo autoloadar `Microsoft.PowerShell.Security` desde el
host heredado. El tag anotado ya es inmutable y contiene ese script, por lo que reintentarlo no incorporaría
una corrección posterior ni sería una publicación trazable.

## What Changes

- Ejecutar la inspección Authenticode en `pwsh`, cargando su módulo explícitamente y rechazando cualquier
  resultado distinto de `NotSigned`.
- Preparar el siguiente candidato privado como Companion 0.2.1, sin cambiar el núcleo npm 0.5.0 ni el tag
  o los assets de 0.1.0; `companion-v0.2.0` permanece como intento sin release.
- Derivar el asset y las notas de release desde la versión declarada, y proteger ambas decisiones con QA.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `companion-distribution`: la verificación de firma del candidato Windows debe poder cargar el módulo que
  usa en el host real del runner y una corrección posterior a un tag inmutable debe crear una nueva identidad.

## Impact

Issue: https://github.com/IgnacioBarEsp/project-engineering-os/issues/117.

No publica este PR, no mueve tags, no reemplaza assets, no publica el núcleo npm y no toca datos de usuario.
