# Validación — restore-screenshot-provenance

Ejecutada el 19 de septiembre de 2026 por dos agentes: el que implementó la comprobación y generó las capturas
(opencode) y el que cerró el change (Claude Opus 5 en Claude Code). Ninguna persona ejecutó ni revisó estas
comprobaciones. Las decisiones que las enmarcan son del mantenedor y están en
[decisiones](maintainer-decisions.md).

- **Capturas:** generadas desde `766d671`, con el árbol limpio, en la ventana real de Electron.
- **Comprobaciones y documentación:** medidas en `1b37743`.
- **Equipo:** Windows 11 IoT Enterprise LTSC 2024, x64, con Node 24.18.0 y Electron 44.1.1 (Chromium 152).

## Resultado por validación

| Validación | Resultado | Evidencia |
| --- | --- | --- |
| `openspec-strict` | Change válido en modo estricto | [openspec-strict.json](openspec-strict.json) |
| `critical-document-presence` | `check-docs` PASS, con la comprobación de procedencia incluida | [docs.json](docs.json) |
| `relative-link-check` | Todos los enlaces relativos del change y de los documentos públicos que toca existen | [artifact-links.json](artifact-links.json) |
| `findability-two-hop-check` | README → [galería](../../../../docs/companion/SCREENSHOTS.md); README → [estado](../../../../docs/PROJECT_STATUS.md) | [artifact-links.json](artifact-links.json) |
| `neutrality-check` | PASS | [neutrality.json](neutrality.json) |

`npm run check` completo: 334/334 pruebas y todos los checks en PASS ([check.json](after/check.json)).

## Antes y después

| Medida | `eefa1bc`, [antes](before/mock-identity.json) | `1b37743`, después |
| --- | --- | --- |
| Imágenes publicadas como producto | 7 | 7 |
| Idénticas byte a byte a un mock de Stitch | 7 | 0 |
| Con registro de procedencia | 0 | 7 |
| Comprobación automática que lo impida | ninguna | `screenshot-provenance` dentro de `check:docs` |

## Las capturas

Siete imágenes de 1164 × 755 px CSS, tomadas en la ventana por defecto de la aplicación (1180 × 820) con
`devicePixelRatio` 1, ejecutando `electron .` sobre `766d671` con Companion 0.3.2. El registro de la ejecución
es [capture-run.json](after/captures/capture-run.json): 7 imágenes, 0 hallazgos y 7 errores de consola, todos
de la CSP por los estilos en línea previos (#144).

| Imagen | Pantalla | SHA-256 |
| --- | --- | --- |
| `docs/assets/companion/home-companion.png` | Inicio | `6561a148…ffb2e6d2` |
| `docs/assets/companion-current-home.png` | Inicio, para el README | `d32afe98…06ae16f2` |
| `docs/assets/companion/paso-1-perfil.png` | Paso 1, «01 Tu proyecto» | `890c2ffd…76ac8af2` |
| `docs/assets/companion/paso-2-delimitacion.png` | Delimitación, «02 Carpeta» | `55ca30ad…03eaec28` |
| `docs/assets/companion/paso-3-vision.png` | Visión, «03 Preparación» | `6b545d29…296e4b9f` |
| `docs/assets/companion/paso-4-instalacion.png` | Instalación, «04 Archivos» | `178a1d22…716c696e` |
| `docs/assets/companion/proyecto-listo-activacion.png` | Proyecto listo | `c4f3df32…7a1847c4` |

**Privacidad:** el recorrido usa un proyecto de ejemplo en una carpeta pública creada para la captura y borrada
al terminar, así que ninguna imagen muestra el nombre de la cuenta. El generador aborta si el registro contiene
el nombre de usuario o una ruta absoluta, y los datos de la aplicación van a un directorio temporal aislado.

**Inspección visual:** [inspection.md](after/inspection.md). La hicieron dos agentes; la segunda pasada abrió
seis de las siete imágenes y corrigió dos observaciones de la primera, sobre el editor de Visión y el perfil
del paso 1.

## La comprobación

`scripts/screenshot-provenance.mjs` se ejecuta desde `scripts/check-docs.mjs`, es decir, dentro de
`npm run check`. Rechaza una imagen publicada cuando:

- no tiene registro, el registro no es JSON o le falta un campo del contrato v1;
- el SHA-256 o el tamaño del registro no coinciden con los bytes;
- el generador que declara no existe en el repositorio o apunta fuera de él;
- el registro contiene una ruta de usuario;
- la imagen es idéntica a una de `docs/stitch uxui/`.

Siete pruebas cubren esos rechazos con repositorios fixture, más una prueba de que la guía pública rechaza
declarar «renderer real en navegador» cuando las capturas son de la ventana real. `test/screenshot-provenance.test.mjs`
pasa 7 de 7 y `test/public-guidance.test.mjs`, 10 de 10.

## Documentación

- **[Galería](../../../../docs/companion/SCREENSHOTS.md):** describe cada pantalla por su encabezado,
  indicador de paso y controles visibles; dice qué queda fuera del encuadre; enumera procedencia y hashes; y
  nombra los defectos abiertos que se ven (#144) o que la pantalla afirma (#147).
- **README:** muestra la ventana real de 0.3.2 con su commit y mantiene «No es una captura del instalador».
- **[Índice de documentación](../../../../docs/README.md):** su promesa de imágenes reales pasa a ser cierta.
- **[Estado](../../../../docs/PROJECT_STATUS.md):** deja de decir que las capturas son del prototipo y enlaza
  la galería y el prototipo rotulado.
- **[Prototipos](../../../../docs/stitch%20uxui/README.md):** dicen qué son, qué controles muestran que la
  aplicación no tiene y dónde están las capturas reales.

A quién corresponde cada documento: la galería y el generador viven con la aplicación y se regeneran cuando
cambia la interfaz; el estado lo concilia quien publica en cada release; los prototipos son evidencia de
diseño y los rehace #144. Ningún documento afirma hoy algo que las imágenes o el código no respalden.

## Rollback

[rollback.json](after/rollback.json): en un árbol de trabajo aparte, revertir los commits del change aplica sin
conflictos, devuelve las siete imágenes byte a byte a las de `eefa1bc`, retira registros, script y rótulo, y
deja el árbol sin diferencias frente a `eefa1bc`, con `check-docs` y `check-neutrality` en verde.

Revertir recupera la publicación anterior, con sus mocks: eso es el defecto que este change corrige, no un
estado bueno al que volver salvo por emergencia.

## Decisiones de deriva registradas

- **Superficie:** `documentation` en lugar de `documentation, harness-tooling`, aprobado por el mantenedor. Ese
  perfil cubre los arneses de agentes y sus runners (`sync-check`, `opsx-check`, `doctor`) fallan hoy por #122
  y #115, que el handoff prohíbe arreglar de pasada.
- **Entorno de las capturas:** ventana real en Electron, no el renderer en navegador.
- **Prototipos:** se quedan donde están, rotulados.
- **Alcance de la ejecución:** solo desde el código con `electron .`; no se capturó con la aplicación
  empaquetada ni instalada.
- **La galería cambia de versión:** pasa de «Companion 0.3.1» a 0.3.2, la versión que se capturó.

## Lo que esta evidencia no demuestra

- **Ninguna revisión humana:** las capturas, su inspección y la revisión adversarial las hicieron agentes.
- **Reproducibilidad en la CI:** las capturas dependen de Windows, de Electron y del renderizado de fuentes de
  esta máquina. La CI comprueba hashes y procedencia; no regenera nada.
- **La aplicación instalada:** las capturas salen del código, no del instalador publicado.
- **El paso de carpeta:** la galería no incluye la pantalla «Tu trabajo empieza en una carpeta»; se ve su
  resultado en la tarjeta del paso siguiente.
- **Lo que queda bajo el pliegue:** cada imagen muestra la pantalla con el scroll arriba, no su contenido
  completo.
- **Accesibilidad:** este change no mide contraste, teclado ni lectores de pantalla; eso vive en los harness
  de #142 y #150.
