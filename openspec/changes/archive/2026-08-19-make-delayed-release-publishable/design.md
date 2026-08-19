## Context

El workflow crea y prueba un candidato, lo adjunta al GitHub Release y después espera aprobación del
environment `npm-publish`. GitHub puede conservar esa espera hasta 30 días, mientras el artifact temporal
tenía siete días de retención. La ejecución de `v0.1.6` llegó a la aprobación sin una copia descargable.

La seguridad vigente exige tag SemVer protegido, una única identidad publicable, GitHub Release, checksum,
manifest, OIDC y revisión humana. GitHub Releases no es inmutable en la configuración actual; el diseño no
puede confiar solo en que exista un asset con el nombre esperado.

## Goals / Non-Goals

**Goals:**

- Mantener publicable una release durante toda la ventana de aprobación.
- Publicar exactamente los bytes validados antes del GitHub Release.
- Detectar assets ausentes, adicionales o modificados antes de `npm publish`.
- Conservar el environment, OIDC, provenance, tag y versión como identidades obligatorias.
- Dar una recuperación segura, legible y repetible.

**Non-Goals:**

- Habilitar immutable releases mediante una mutación remota.
- Eliminar o automatizar la aprobación humana.
- Reutilizar versiones, mover tags o publicar la reconstrucción de verificación.
- Cambiar SemVer, el contenido del paquete o el proveedor de distribución.

## Decisions

### El GitHub Release conserva la copia canónica

El job npm descargará todos los assets del Release asociado al tag. Estos son los mismos bytes que recibió
el job de GitHub desde el candidato probado. Se descarta seguir descargando el artifact del workflow porque
su disponibilidad depende de una retención menor o igual a la espera humana.

### La reconstrucción posterior es una prueba, no una segunda release

Tras la aprobación, el workflow instalará dependencias desde lockfile, validará el tag y reconstruirá en
`rebuilt/`. Un comparador dedicado validará ambos directorios y exigirá exactamente tres archivos, mismos
nombres y mismos bytes. Solo se publicará el tarball descargado en `release/`. Se descarta publicar la
reconstrucción porque convertiría dos ejecuciones en dos posibles identidades.

### La retención temporal sube a 35 días

El candidato del workflow se retendrá 35 días, cinco más que el límite de aprobación, como defensa y ayuda
de diagnóstico. No es la ruta primaria de npm. Se descarta depender solo de aumentar la retención: el valor
es configurable y seguiría acoplando la publicación a almacenamiento temporal.

### Immutable releases permanece como endurecimiento manual

La comparación desde el tag detecta un Release mutable reemplazado y bloquea la publicación. Habilitar la
opción remota puede endurecer el repositorio, pero requiere decisión administrativa separada y no forma
parte del patch versionado.

## Risks / Trade-offs

- [El empaquetado no es determinista] → la comparación falla antes de publicar y señala los assets.
- [El Release fue alterado o está incompleto] → se rechazan archivos ausentes, adicionales o distintos.
- [El approval supera 30 días] → GitHub falla el deployment; se relanza desde el mismo tag sin moverlo.
- [Más tiempo y cómputo] → se acepta una segunda instalación y empaquetado a cambio de evidencia fresca.
- [Cambio de APIs externas] → workflow y documentación fijan el contrato observable y CI lo comprueba.

## Migration Plan

1. Añadir comparador y pruebas negativas.
2. Cambiar el workflow y su política estática.
3. Actualizar documentación y spec.
4. Validar check, audit, pack y OpenSpec.
5. Fusionar sin publicar una versión.

Rollback: revertir el commit del workflow. Una ejecución ya iniciada puede relanzarse desde el mismo tag;
nunca se crea otra identidad con la misma versión.

## Open Questions

Ninguna para esta entrega. La activación de immutable releases se reserva a una decisión administrativa.
