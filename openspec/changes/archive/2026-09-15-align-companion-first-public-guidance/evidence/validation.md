# Validación — entrada pública Companion-first

Fecha: 15 de septiembre de 2026. Change: `align-companion-first-public-guidance`; issue #116.

## Alcance comprobado

La revisión cambia documentación, una comprobación documental y un recurso PNG. No cambia el runtime,
las APIs, el instalador ni la landing publicada. Por ello la superficie declarada es `documentation`: la
captura es evidencia de una interfaz existente, no un cambio de interfaz. La prueba nativa del instalador
y cualquier publicación pertenecen a #117.

## Gates ejecutados

| Comprobación | Resultado y propiedad cubierta |
| --- | --- |
| `npm run check:docs` | PASS: 25 enlaces de README, contrato de prompts, 20 purpose specs y la inspección de guía pública. |
| `node --test test/public-guidance.test.mjs` | PASS: 9 pruebas; detecta CLI adelantada a Companion, release distinta, ruta ausente, captura sin límite/procedencia, byte alterado, enlace roto, URI malformado y traversal fuera del repositorio. |
| `npm run test:ui --prefix apps/companion -- <directorio temporal>` | PASS: renderer real con cinco perfiles, recorridos, teclado, contraste y anchos 1180/768/480/240; produjo e inspeccionó la captura publicada. El diálogo, portapapeles, apertura externa y transporte se sustituyeron para prueba. |
| `openspec validate align-companion-first-public-guidance --strict` | PASS. |
| `git diff --check` | PASS. |
| `npm run check` | PASS: 326 pruebas, 0 fallos. |
| `npm run pack:verify` | PASS como ensayo de inclusión y contratos del paquete. Se ejecuta en el árbol de trabajo y no se usa para afirmar que exista un artefacto limpio/publicable de esta documentación. |
| `npm run check:audit` | PASS: 0 vulnerabilidades high/critical. |

La captura en `docs/assets/companion-current-home.png` tiene hash
`95cba1f9ef5800dd1233ae4bd4dec55e422c4a8af908a82cbadd2ffb5710d57b`; su fuente, fecha, entorno,
datos sintéticos y límites están en `docs/companion/SCREENSHOTS.md`. Se comprobó visualmente antes de
incluirla y no contiene rutas o proyectos personales.

## Documentos y navegación

`README.md` presenta descarga y recorrido visual antes del primer bloque de terminal. En dos saltos se
alcanzan la guía visual, instalación, estado por canal, captura, mapa de piezas y guía CLI.
`PROJECT_STATUS.md` separa el instalador publicado 0.1.0, el código posterior integrado, el núcleo 0.5.0
y las dos landings. `REPOSITORY_MAP.md` confirma que esta revisión no retira CLI, bootstrap, npm, Node,
Git ni OpenSpec: explica su consumidor, owner y condición de retiro.

## Recuperación

El rollback es revertir el PR de documentación. Restaura la navegación previa y quita la imagen incluida;
no cambia un proyecto preparado, historial de usuario, release existente, tag o asset ya publicado. Tras
revertir se ejecutan `npm run check:docs` y `npm run check`.
