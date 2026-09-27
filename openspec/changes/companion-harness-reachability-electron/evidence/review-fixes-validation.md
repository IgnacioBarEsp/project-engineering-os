# Revalidación de correcciones — ola 3, 2026-09-27

Las cuatro regresiones independientes se corrigieron en sus PRs de origen y se propagaron con
merges normales hasta #202. No se reescribió historia ni se creó un PR duplicado.
La ola 4 no se inició. El cierre de aceptación humana y la integración siguen pendientes.

| Hallazgo | Corrección | Evidencia nueva |
| --- | --- | --- |
| R1: borrador A sustituido por proyecto B | #146 / 428c0e9: guardar y suspender A antes de abrir B, restaurar A y regenerar su plan | 10 variantes de aislamiento, incluyendo error de guardado, reinicio y carpeta conocida; cierre real adicional del revisor |
| R2: foco global y etiqueta inválida en históricos | #145 / 887e885: selección propia canónica y etiqueta por catálogo | 22 recorridos de recibos persistidos; bytes de proyecto, recibo, journal e historial conservados |
| R3: recetas durables sin enfoque | #145 / 887e885: pasar selección completa al escritor | Los 32 enfoques escriben los mismos IDs que ofrece el catálogo |
| R4: carpeta sustituye respuestas explícitas | #146 / 428c0e9: mantener perfil/foco/stack/nombre y mostrar sugerencia | Elección previa, cambio y cancelación del selector, ambos modos de movimiento |

## Ejecuciones observadas por el implementador

Windows x64, Node 24.18.0. Carpetas sintéticas bajo el temporal, sin instaladores ni proyectos reales.
Producto en 79a678b892ba3577dd403942823797799055f380. Head de harness corregido:
8072df1d3e067a82ce0a470bdea20cf0766785b7. Entre ambos solo cambian el caller de prueba y documentación;
el revisor cotejó equivalencia exacta de los árboles de producto.

| Comando | Resultado observado |
| --- | --- |
| Companion npm test | exit 0; 215/215, sin fallos ni omitidos |
| Raíz npm run check | exit 0; 391/391, paquete, neutralidad, documentos, workflows, deuda y baseline doctor |
| OpenSpec local 1.6.0 validate --all --strict --no-interactive | exit 0; 27/27 |
| verify-wizard-flow.mjs (primera parte de test:ui) | 72 celdas únicas, 8 casos extra, 534 pantallas, cero errores |
| verify-interface-contract.mjs | exit 0; 46/46 mutaciones, construcción 1/1, 408/408 controles, cero hallazgos |
| verify-ui.mjs después de ajustar el fixture | exit 0; 28 recorridos, 168/168 pantallas, 1904/1904 controles, 56/56 copias |
| Rutas incluidas al final de verify-ui | 20 rutas × 2 movimientos × 3 tamaños = 120 celdas; 14 negativos |
| Históricos incluidos al final de verify-ui | 22/22; ver profile-compatibility.json |
| Aislamiento incluido al final de verify-ui | 10/10; ver wizard-isolation.json |

Los comandos raíz/Companion se observaron por la salida de herramientas, sin inventar un log íntegro
posterior. Los JSON completos de navegador/contrato están en el temporal
project-os-closeout/wave3-review-fixes, subdirectorios final-browser-resumed,
final-contract-resumed y final-ui-native-pending. El nombre del último directorio no indica
resultado pendiente: completed=true en los JSON y el proceso terminó en 0.

### Fallo intermedio y corrección del test

La invocación test:ui completa no pasó inicialmente: su matriz sí, pero el recorrido general
dependía de que elegir carpeta reemplazara Software por Personal. Al corregir R4 dejó de hacerlo.
Su fixture declara environment:null; exigir instalación nativa era una expectativa incorrecta.
El fallo se reprodujo localmente y en CI (run 36337062234, job 108669817724).

2e5a6c6 en #147 corrige solo ese caller: admite exclusivamente environment no disponible con
su mensaje conocido, exige que se observe en quick y no en ai, y verifica que el resultado NO
marque environment ready y muestre Qué queda pendiente. Otros errores siguen rechazados.
Después pasó el recorrido general completo, incluidas las rutas y regresiones añadidas.
No se deshabilitó ningún gate ni se convirtió una herramienta ausente en éxito.

## Revisión y procedencia

Conservar [el informe original](independent-review-before.md) como FAIL histórico, no sustituirlo.
La [reprueba independiente](independent-recheck.md) distingue ejecución propia del revisor,
inspección de artefactos aportados y reutilización justificada del par histórico inmutable.
Veredicto: cuatro hallazgos corregidos, cero nuevos P0–P3 confirmados. SHA-256 del informe original:
0a254597fa845af8a09bb86cfb196c1d7efb7af30662e81fdff49067f209241d.
Las capturas nativas mantienen su SHA original aunque los bytes de producto sean equivalentes.
No son capturas del instalador publicado ni evidencia de Windows limpio.

La inspección visual adicional del implementador de Inicio, paso 1 y resultado mínimo observó
texto legible, riel y navegación presentes y controles en el contenedor desplazable.
No equivale a aceptación del mantenedor ni a lectores humanos.

## Deuda, CI y cierre pendiente

Los checkpoints R1/R4 y R2/R3 permanecen inmutables; se añade un assessment de revalidación,
sin cambiar el registro ni introducir dependencias. Los commits de evidencia posteriores
no alteran el producto ensayado. CI debe comprobar cada head/base publicado; su resultado
remoto y los enlaces de artefactos se registran en el comentario de cierre técnico de PR #202.
Los intentos anteriores fallidos/cancelados se conservan: no se atribuyen a una reprueba verde.

La autorización general no es una observación de uso. Faltan aceptación visual del mantenedor,
el recorrido humano con su IA requerido por #147 y las dos personas ajenas de #149.
Seguir [COLD_READING](../../../../docs/companion/COLD_READING.md): respuestas literales de Inicio
y paso 1, sin explicar la app antes, y conservar la comprobación de exportación del protocolo.
No cambiar readers:[] por lectores simulados.

Después de esas evidencias, integrar en orden #196–#202 contra main protegido, revalidar cada
base y archivar mediante OpenSpec oficial. Mientras tanto no archivar, fusionar ni cerrar issues.
Detenerse antes de ola 4. Rollback de código: revertir los commits de corrección mediante PR;
no se migraron recibos históricos ni se modificaron fuentes de proyectos reales.
