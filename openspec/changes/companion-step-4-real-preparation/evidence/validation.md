# Validación #147

2026-09-26. Worktree aislado, proyectos temporales, sin release ni cambios a proyectos del usuario.

| Prueba | Resultado |
| --- | --- |
| OpenSpec local 1.6.0 strict | PASS antes de implementar y tras ampliar la transacción de visión. |
| Companion | PASS 170/170. Rutas v1/v2, journal de visión, prompts, IPC, orquestador y casos negativos. |
| Wizard navegador | PASS 12 recorridos (6 perfiles × 2 vías), reapertura y carpeta existente. La falta de entorno nativo en ese harness se declara pendiente, no éxito. |
| Contrato de interfaz | PASS 46/46 mutaciones, construcción 1/1, 366/366 controles en 36 pantallas; copias ante éxito/rechazo/transporte/rechazo después de éxito. |
| Electron 44.1.1 Windows x64, vía local | PASS base, contexto, herramientas, ingeniería, activación y TypeScript comprobados; pendientes vacíos y fila verified. Motores reales y cache administrada verificada. |
| Electron, vía IA | PASS base/contexto comprobados; environment/engineering/activation pendientes y fila incomplete. |
| Clipboard nativo | PASS ruta e instrucción leídas del clipboard coinciden exactamente con lo mostrado en ambas vías. No se abrió una IA externa. |
| Cancelación nativa | PASS barra igual a completed/total real; Detener conserva base, no escribe contexto antes de aprobar, reintento termina y 48 originales coinciden. |
| Base en raíz | PASS 17/17; lenguaje 9/9. |
| UI general | Repetición final pendiente tras ajustar el ensayo de rollback y añadir las definiciones de los términos en el plan de preparación. |
| npm run check | PASS 391/391 en árbol inmóvil, antes de la corrección de definiciones. Lenguaje 9/9 y OpenSpec strict repetidos después. |
| Recuperación, flujo y lista (última revisión) | PASS 23/23, incluyendo v1, visión seed-once, cancelación y pureza de la lista. |

Reproducir:

```sh
npm --prefix apps/companion test
npm --prefix apps/companion run test:ui
npm --prefix apps/companion run evidence:contract
npm --prefix apps/companion run runtime:install
npm --prefix apps/companion run evidence:preparation
node apps/companion/scripts/verify-electron-preparation.mjs --cancel-only
npm run check
```

El ensayo Electron usa código fuente de esta rama y runtime real. Solo sustituye el diálogo de carpeta con fixtures; no acredita el instalador/distribución de #150. La comprobación de handoff con firma y sus rechazos usa la suite existente más el endpoint de activación; no se afirma que la IA haya leído nada.

Gates abiertos: revisión independiente, aceptación visual del mantenedor y recorrido donde pega la instrucción en su IA y contrasta comprobaciones. No se archiva ni se fusiona hasta esos gates y sus dependencias. Rollback de código: revertir el PR; recuperar operaciones con su versión antes de volver a un binario que no entienda v2. No prometer downgrade de lectores antiguos a recibos nuevos.
