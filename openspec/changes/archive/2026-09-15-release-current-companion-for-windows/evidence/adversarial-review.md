# Revisión adversarial — preparación de release Companion 0.2.0

Fecha: 15 de septiembre de 2026. Alcance: #117 y `release-current-companion-for-windows`. Es una autorrevisión posterior a la implementación, no una revisión humana independiente.

| Riesgo | Resultado |
| --- | --- |
| Instalación silenciosa modifica el Companion local al compartir identidad NSIS. | Corregido: redirigir carpetas no aísla el registro. El script se rehúsa fuera de GitHub Actions o una VM declarada y resuelve rutas bajo un temporal nuevo. No se ejecutó localmente. |
| Un tag de rama, liviano o incompatible genera release. | Refutado: patrón, tag anotado, commit ancestro de `origin/main`, checkout limpio y versión coincidente son obligatorios. |
| GitHub almacena bytes distintos del build verificado. | Refutado en el diseño: sólo un draft recibe los tres assets; nombre, tamaño, manifest y SHA-256 se comparan antes de publicar. |
| Una comparación fallida deja un draft que bloquea el reintento. | Corregido: sólo se borra el draft creado por ese run cuando falla la comparación; nunca tras intentar publicar. |
| El manifest dirige el verificador fuera del candidato. | Corregido: los verificadores aceptan sólo `ProjectEngineeringOS-Setup-<semver>-x64.exe`; QA lo cubre. |
| Se afirma lectura del wizard o firma inexistente. | Refutado: el registro dice silencioso/no observado y exige/declarara `NotSigned`; no aconseja eludir SmartScreen. |
| Se publica npm/core o se reemplaza 0.1.0. | Refutado: app privada, core exacto 0.5.0, sin comando npm publish; 0.1.0 sólo es base de actualización y sigue inmutable. |

## Veredicto

**PASS: 0 Blockers y 0 Majors abiertos.** La ejecución nativa, asset y publicación no se cuentan como éxito de este PR: son la siguiente fase explícita y post-merge de #117.
