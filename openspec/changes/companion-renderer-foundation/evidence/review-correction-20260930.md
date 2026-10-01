# Corrección de los P2 independientes — #144

Fecha local: 2026-09-30. Referencia: [revisión independiente](../../../../docs/companion/reviews/WAVE3_CLOSEOUT_20260930.md), exacta sobre `49378d70a89302fa0be347d4e6e71fd9a9179c07` para esta capa y `799c2b6079bb4036289607f17c510ae2b16b9465` para el pase integrado. Esta corrección no convierte aquel pase en una revisión de otro SHA.

Issue enriquecido antes de corregir: https://github.com/IgnacioBarEsp/project-engineering-os/issues/144#issuecomment-5924825132. DoR propose: 13 PASS/0 FAIL. OpenSpec local fijo 1.6.0 strict PASS. La spec ya aprobada exige fallar por los nombres de las rutas no renderizadas; no cambia ese requisito.

## Reproducción y corrección

El contrato toma `routeIds()` del módulo servido, no de una lista del harness. Recorre el asistente y las revisiones mediante controles reales con clic normal; observa `state.page`, una vista con h1, `screenState.visited`, breadcrumb y destino activo coherentes, fuera de busy. Solo entonces cuenta la ruta. Las revisiones usan respuestas fijas explícitas: **no se descargan ni instalan herramientas, no se demuestra el motor ni Electron instalado**. La conexión sin API nativa se abre en otra ventana, sin sustituirla por el fallback de módulo roto.

La primera ejecución falla exit 1: 23 rutas declaradas / 21 mostradas; nombra `stack-choice, ready`. Una búsqueda en todo `ui/` confirma que esos dos nombres no tienen pantalla ni asignación de `state.page`; se retiran exclusivamente esas declaraciones huérfanas. No se quita una acción o pantalla funcional para ocultar un fallo.

La repetición pasa exit 0: 21/21 rutas, sin ausentes ni errores de recorrido. La nueva mutación añade `reviewer-unvisited-route` **a la copia servida del router**, vuelve a recorrer y la detecta por su nombre, no por excepción o timeout; las rutas originales siguen visitándose y ambos recorridos no tienen errores. Las 45 mutaciones anteriores se conservan: 46/46 detectadas, 1/1 probe de construcción, 11 pantallas estructurales, 6 recorridos de asistente / 36 pantallas / 318 controles alcanzables y cuatro respuestas de copia con dos controles cada una. El cierre global adicional mide una ventana 1180×820 con movimiento reducido; no se presenta como nueva matriz de layout ni prueba de instalación.

El segundo P2 se corrige poniendo `visual-check` en pending: los propios informes históricos dicen que faltaba la aceptación del mantenedor. La aprobación posterior de Inicio en #149 no se atribuye a Inicio/Ayuda de esta versión antigua.

## Evidencia y límites

[Extracto de observaciones, negativos, hashes y procedencia](route-review-correction-20260930.json) conserva ambos pases. Los informes completos originales siguen en los directorios temporales que indica el extracto, con sus hashes SHA-256. El primer pase no llevaba campos de procedencia; no se inventan. El segundo declara correctamente el HEAD anterior y `dirty: true`, más hashes del renderer, harness y guard. Un commit posterior identifica estos mismos bytes; no se reetiqueta la ejecución como checkout limpio.

Node usado: `C:/Program Files/nodejs/node.exe`, 24.18.0; cwd: worktree `wave3-companion/project-engineering-os`.

- `node --test apps/companion/qa/*.mjs`: 151/151 PASS, exit 0 (incluye fixtures desechables de motor; no certifica una release).
- `node --test apps/companion/qa/renderer-foundation.mjs apps/companion/qa/route-traversal.mjs`: 3/3 PASS, exit 0. Negativos: ruta añadida, visita ausente, ambos conjuntos vacíos, ruta no declarada y duplicación.
- `node --check apps/companion/scripts/verify-interface-contract.mjs`: PASS.
- `node apps/companion/scripts/verify-interface-contract.mjs <directorio antes de limpieza>`: exit 1 esperado, solo las dos rutas huérfanas.
- El mismo comando con `<directorio final>`: exit 0, métricas anteriores.
- `node scripts/check-docs.mjs`, `check-package.mjs`, `check-neutrality.mjs`, `check-workflows.mjs`: PASS. No se declara aquí una nueva ejecución completa de tests del core.
- `node bin/project-os.mjs debt check --target . --json`: PASS; deuda previa 4/5 unidades, no cero deuda global.

Los assessments anteriores permanecen inmutables; el assessment de esta corrección tiene alcance propio. Falta registrar la reprueba independiente del SHA corregido y propagarla por la pila; no se archiva ni integra con esos gates pendientes o con la auditoría #204 fallando. No se inicia ola4.

## Actualización: repruebas independientes recibidas

El revisor separado `/root/wave3_closeout_review` ejecutó por sí mismo el contrato en **fb98d62001e3ec57935b477724c34f2dc173742b limpio**: ambos P2 resueltos, 46/46 negativos, 21/21 rutas y tres tests focalizados. Su [addendum íntegro](../../../../docs/companion/reviews/FOUNDATION_RETEST_20260930.md) conserva identidad, comandos, procedencia y límites; no se atribuye a él el pase propio de 151 tests.

El mismo revisor realizó después la [revisión independiente de layout](../../../../docs/companion/reviews/FOUNDATION_LAYOUT_REVIEW_20260930.md) de Inicio/Ayuda en fb98: 1180×820, 1024×700, 768×700 y 480×540, normal/reducido, 16 celdas, 128/128 controles y 32 originales abiertos individualmente. Conserva su intento fallido de probe SVG y la repetición exitosa. No encontró defectos en ese alcance; no equivale a aceptación visual del mantenedor, Electron o instalador.

Esto permite registrar la revisión técnica de #144 como verified, **manteniendo visual-check pending**. Se conservan el informe original y los intentos fallidos. La corrección se llevó mediante merges locales DCO en orden #145→#150; esos merges de ramas no son integración por PR protegido. Cada cabeza conserva sus propios resultados; los informes de fb98 no se reetiquetan como revisión de una cabeza distinta. El [delta integrado b4](../../../../docs/companion/reviews/WAVE3_HARNESS_DELTA_REVIEW_20260930.md) tiene además inspección estática propia con límites explícitos.
