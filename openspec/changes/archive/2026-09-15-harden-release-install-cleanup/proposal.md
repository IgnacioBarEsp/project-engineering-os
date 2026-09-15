## Why

El candidato 0.2.1 superó el probe Authenticode corregido, pero su medición de instalación/actualización/
desinstalación murió en el cleanup: `rm` recursivo sobre el root desechable chocó con un directorio
temporal de NSIS (`~nsuA.tmp`) aún bloqueado por el desinstalador que terminaba de salir. Dos defectos
quedaron visibles: el cleanup no tolera locks transitorios de un temporal que por definición es
desechable, y al vivir en un `finally` sin capturar el error del cuerpo, cualquier fallo de medición
queda reemplazado por el del cleanup: el run no dice qué midió. Reintentar el mismo tag con el mismo
script dejaría esa máscara intacta y apostaría a una carrera de archivos.

## What Changes

- Extraer el cleanup del root desechable a un módulo con reintentos acotados contra `EBUSY`/`EPERM`;
  un lock persistente se declara en la evidencia y en la consola del run, nunca como éxito de medición.
- El error del cuerpo de medición se conserva y se relanza después del cleanup: el cleanup nunca lo
  sustituye ni lo atenúa.
- Preparar Companion 0.2.2 como nueva identidad del candidato corregido, sin tocar el núcleo 0.5.0 ni
  los tags/releases existentes; `companion-v0.2.1` permanece como intento inmutable sin release.
- Proteger ambas propiedades con pruebas de comportamiento del módulo y aserciones de QA.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `companion-distribution`: el cleanup del runner desechable debe reintentar locks transitorios y
  declarar un lock persistente, y el error de medición debe sobrevivir al cleanup sin cambios.

## Impact

Issue: https://github.com/IgnacioBarEsp/project-engineering-os/issues/117.

No publica nada, no mueve tags ni assets, no publica el núcleo npm y no toca datos de usuario. El
siguiente dispatch con la identidad 0.2.2 dirá por primera vez, sin máscara, si la medición completa
pasa o qué assert falla.
