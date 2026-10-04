## Historia Original

Al revalidar la ola 3, CI bloquea los PR #201 y #202 por vulnerabilidades del npm empaquetado.

## Enriquecida

El job Windows de #201, run 36684024088/job 109785636413, pasa las pruebas pero falla
`npm audit --omit=dev --audit-level=high` con tres paquetes vulnerables dentro de npm:
brace-expansion (high), ip-address (moderate), undici (high). #202 repite el bloqueo.
No se desactiva el gate ni se propone una excepción automática.

Diagnóstico del 2026-09-30 en carpeta desechable y sin scripts: npm 11.20.0 y 12.1.0
siguen fallando el mismo audit. Overrides acotados sobre npm 11.19.1 tampoco corrigen
las dependencias bundled. `npm audit fix --dry-run` declara que no puede repararlas.
Existen versiones corregidas de los componentes, pero sustituir bytes dentro del npm
empaquetado requiere una distribución trazable, no editar node_modules del usuario.

Alcance propuesto: evaluar actualización oficial frente a composición reproducible de npm,
mantener runtime catalog/notices/lock/artifact hashes coherentes y comprobar instalación,
reparación, caché y ejecución real. No cambiar el gestor de dependencias sin decisión técnica.

Criterios: auditoría de producción sin high/critical; dependencias parcheadas realmente
incluidas en el artifact; CI protegida de ola 3 verde; pruebas de runtime/reparación y
regresión negativa; licencias, procedencia y rollback documentados.

Este es un issue de diagnóstico, todavía no DoR/spec aprobada ni implementación.
Bloquea cerrar ola 3; no es inicio de ola 4. No duplicado en issues abiertos al comprobar.
