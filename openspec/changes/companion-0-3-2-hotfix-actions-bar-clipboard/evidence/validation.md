# Validación — companion-0-3-2-hotfix-actions-bar-clipboard

Ejecutada el 19 de septiembre de 2026 por el agente del apply (Claude Opus 5 en Claude Code). Ninguna persona
ejecutó ni revisó estas comprobaciones. Las decisiones que las enmarcan son del mantenedor y están en
[decisiones](maintainer-decisions.md).

- **Commit medido:** `12c931b`, con el árbol limpio. Todas las ejecuciones de `after/` salen de él, salvo el
  experimento de teclado, que se indica aparte.
- **Equipo:** Windows 11 IoT Enterprise LTSC 2024, 10.0.26100, x64, con Node 24.18.0.
- **Motores:** Microsoft Edge sin ventana mediante Playwright 1.62.1 para el renderer, y Electron 44.1.1
  (Chromium 152) para la prueba nativa.
- **Rutas:** los scripts escriben `<app>` y `<espacio de prueba>` en lugar de las rutas locales. El recolector
  de evidencia de la sesión, que no está versionado, sustituyó además el directorio de trabajo por
  `<evidencia>`, y cada registro que tocó lo declara en su campo `pathsSanitized`.

## Resultado por validación

| Validación | Resultado | Evidencia |
| --- | --- | --- |
| `openspec-strict` | Change válido en modo estricto | [openspec-strict.json](openspec-strict.json) |
| `component-or-interaction-tests` | Companion 144/144. Recorrido del asistente: 140/140 pantallas y 1100/1100 controles, sin problemas. Contrato: 45/45 mutaciones detectadas y 0 hallazgos. Landing PASS. Copia nativa 2/2 en Electron, desde el código y empaquetada | [qa.json](after/qa.json), [test-ui.json](after/test-ui.json), [contract.json](after/contract.json), [landing.json](after/landing.json), [nativa](after/native/native-clipboard.json) |
| `accessibility-check` | 0 problemas de contraste AA, de orden de encabezados o de nombre accesible en las 140 pantallas del asistente. El editor de Visión tiene nombre sin su placeholder | [wizard-reach.json](after/ui/wizard-reach.json), [browser-evidence.json](after/ui/browser-evidence.json) |
| `responsive-check-when-configured` | Todo alcanzable y sin desplazamiento horizontal en 1180 × 820, 1160 × 810 y 1040 × 700 con barra sticky, y en las dos ventanas pequeñas reales (582 × 377 y 464 × 475) con barra estática, con los dos movimientos. Las ventanas pequeñas se midieron también en Electron | [wizard-reach.json](after/ui/wizard-reach.json), campo `smallWindows` de la [prueba nativa](after/native/native-clipboard.json) |
| `visual-check-when-configured` | Capturas del final de Paso 1 e Instalación antes y después, y capturas de Electron. Hashes abajo | [antes](before/README.md), [después](after/ui/), [Electron](after/native/) |
| `critical-document-presence` | `check-docs` PASS | [docs.json](docs.json) |
| `relative-link-check` | Todos los enlaces relativos del change, de PROJECT_STATUS y de las notas 0.3.2 existen | [artifact-links.json](artifact-links.json) |
| `findability-two-hop-check` | README → [PROJECT_STATUS](../../../../docs/PROJECT_STATUS.md) → [notas de 0.3.2](../../../../apps/companion/RELEASE_NOTES_0.3.2.md) | [artifact-links.json](artifact-links.json) |
| `neutrality-check` | PASS | [neutrality.json](neutrality.json) |

`npm run check` completo, sobre el commit final: [check.json](check.json).

## Antes y después

| Medida | `a3b1efd` (0.3.1), [antes](before/README.md) | `12c931b`, mismas 3 ventanas | `12c931b`, con las 2 pequeñas |
| --- | --- | --- | --- |
| Recorridos | 12 | 12 | 20 |
| Pantallas visitadas | 72 de 84 | 84 de 84 | 140 de 140 |
| Controles alcanzables al pulsar su centro | 570 de 612 | 660 de 660 | 1100 de 1100 |
| Problemas | 162 | 0 | 0 |
| Copias observadas con el texto exacto | 0 | 24 de 24 | 40 de 40 |

Cada recorrido es una combinación de ventana, preferencia de movimiento (2) y forma de instalar (2).
[wizard-reach.json](after/ui/wizard-reach.json) incluye además tres recorridos con una visión sin texto:
`###`, vacía y vaciada al volver de la instalación. Los tres llegan al final con el objetivo del primer paso,
y `PROJECT_VISION.md` lo declara. Con el código de `4ab9168` fallaban los tres.

### Criterios observables del issue #142

| Criterio | Estado | Evidencia |
| --- | --- | --- |
| Con animaciones, en las tres ventanas, `elementFromPoint` sobre cada botón primario de los pasos 1 a 4 devuelve el propio botón | Cumplido para todos los controles, no solo los primarios: 660/660 en esas ventanas | [wizard-reach.json](after/ui/wizard-reach.json) |
| Si la página cabe, la barra no empieza antes del último contenido; si no cabe, todo se alcanza y no queda hueco bajo la barra | Cumplido: geometría `end` y `bar` de cada pantalla, sin problemas | [wizard-reach.json](after/ui/wizard-reach.json) |
| En Electron real, las dos copias dejan el texto en el portapapeles, leído con `clipboard.readText()` desde el proceso principal, y muestran confirmación | Cumplido, desde el código y con el ejecutable empaquetado | [nativa](after/native/native-clipboard.json), [empaquetada](after/native-packaged/native-clipboard.json) |
| «Preparar proyecto» tiene `aria-pressed="true"` en las seis pantallas del asistente | Cumplido en los 20 recorridos; es `false` en Inicio | campo `nav` de [wizard-reach.json](after/ui/wizard-reach.json) |
| La verificación falla si vuelve `position:fixed` dentro de `.enter` | La mutación `the-final-bar-fixed-again-inside-the-animated-content` se detecta con motivo geométrico. También se detecta `the-final-bar-no-longer-sticks`, que deja la barra estática | [interface-contract.json](after/contract/interface-contract.json) |
| Release 0.3.2 publicada, o decisión registrada de no publicarla | Decisión registrada: publicar después del merge con el workflow existente | [decisiones](maintainer-decisions.md) |

Las capturas del mantenedor del 18 de septiembre mostraban tapados «¿Cuánta guía prefieres?», «Buscar carpeta
en este equipo», la cuarta tarjeta de Delimitación, las sugerencias de Visión y los botones de Instalación.
Los cinco se pulsan ahora en su centro en los 20 recorridos. La sugerencia y la cuarta tarjeta, además, se
eligen con un clic normal de Playwright.

## Copia nativa en Electron

Dos ejecuciones de `npm run evidence:clipboard` sobre `12c931b`: el código con `electron .` y el ejecutable
`win-unpacked` del candidato construido abajo. Ninguna es una instalación.

| | Desde el código | Empaquetado |
| --- | --- | --- |
| Viewport de la ventana por defecto, medido con la ventana asentada | 1164 × 755, igual que el contenido de la ventana | igual |
| Copias con el texto exacto leído del sistema, activadas con Enter | 2 de 2 | 2 de 2 |
| Foco tras cada copia | en el mismo botón, 2 de 2 | en el mismo botón, 2 de 2 |
| Rechazos sin cambiar el portapapeles | 4 de 4: más de 64 000 bytes (`OPERATION_FAILED`), texto de más de 32 000 bytes (`INPUT_INVALID`), texto vacío (`INPUT_INVALID`) y el mismo puente en otra ventana (`OPERATION_FAILED`) | 4 de 4, los mismos códigos |
| Permiso de portapapeles del renderer | `denied` | `denied` |
| Barra de Instalación en la ventana por defecto | sticky, scroll-padding de 83 px igual a su altura | igual |
| Paso 1 en la ventana por defecto con zoom al 200 % (582 × 377) | barra estática, 28 de 28 controles alcanzables, sin desplazamiento horizontal | igual |
| Paso 1 en la ventana mínima (464 × 475) | barra estática, 28 de 28 controles alcanzables, sin desplazamiento horizontal | igual |
| Portapapeles anterior de la persona | 3 formatos, restaurados con los mismos formatos y el mismo texto; no se registró su contenido | igual |
| Errores de consola | 7, todos de CSP por cuatro estilos en línea previos (abajo) | 7, los mismos |

El scroll-padding llega por el CSSOM (`style.setProperty`), que la CSP `style-src 'self'` permite, y así lo
mide la ventana real. La restauración del portapapeles se probó además con una imagen puesta desde Windows:
volvieron sus cuatro formatos con los mismos bytes ([revisión, ronda 1, hallazgo 5](adversarial-review.md)).

## Candidato 0.3.2

`npm run pack` sobre `12c931b` con el árbol limpio:
[manifiesto](after/candidate/artifact-manifest.json) y [SHA256SUMS](after/candidate/SHA256SUMS). El
instalador `ProjectEngineeringOS-Setup-0.3.2-x64.exe` pesa 133 309 447 bytes, tiene SHA-256 `de1ad04c…8c346793`
y no está firmado, como declara. Incluye el núcleo 0.5.0 y Electron 44.1.1.

- **`npm run pack:verify` no se completó en este equipo.** Lee la firma Authenticode con PowerShell 7
  (`pwsh`), que no está instalado; el script falló en ese paso y no se modificó. Lo ejecuta el workflow de
  release en `windows-latest` sobre el tag.
- **El instalador no se instaló aquí.** Por la [decisión del mantenedor](maintainer-decisions.md), el
  instalador lo prueba el workflow existente sobre el tag, en un runner Windows aislado: construye el
  candidato exacto, instala 0.1.0 y actualiza al candidato, recorre los journeys nativos, desinstala y compara
  los assets del borrador antes de publicar.
- **Este build local no es el artefacto publicable.** El workflow construye desde el tag del commit de merge,
  así que su hash será otro. El de aquí sirve para ubicar la prueba nativa empaquetada.

## Teclado y tecnología asistiva

- **Tabulador en el paso 1:** 22 paradas en cada una de las 10 combinaciones de ventana y movimiento. Ningún
  control enfocado queda entero bajo la barra ni fuera de la ventana, y se llega a «Elegir carpeta →»
  (campo `keyboard` de [wizard-reach.json](after/ui/wizard-reach.json)).
- **El scroll-padding es necesario:** sin él, al tabular quedaba entero bajo la barra 1 control a 1180 × 820
  y 2 a 1040 × 700; con él, ninguno. Es un
  [experimento](after/keyboard-scroll-padding.json) sobre el renderer corregido antes del commit `14d0b1d`;
  el CSS y el `ResizeObserver` que mide no cambiaron después.
- **Envío del paso 1:** Enter lo envía; con el nombre vacío la validación nativa no deja avanzar, y al volver
  atrás se conservan las respuestas.
- **Nombres accesibles:** 0 controles sin nombre en las 140 pantallas. El editor de Visión se llama «Tu visión
  del proyecto» en el árbol de accesibilidad con el placeholder retirado. En cada uno de los 20 recorridos la
  misma lectura se repite sin `aria-label` y no encuentra nada, así que la comprobación sí distingue un editor
  sin nombre (campo `name` de la pantalla `vision`).
- **Avisos y errores:** la confirmación de copia se anuncia en `#notice` (`role="status"`,
  `aria-live="polite"`). Los errores aparecen en `#feedback` (`role="alert"`) con causa y acción.
- **Contraste, movimiento y zoom:** contraste AA (4,5:1, y 3:1 en texto grande) medido en cada pantalla, sin
  fallos. Todos los recorridos se hacen con movimiento normal y reducido. Con zoom al 200 % todo se alcanza,
  la barra queda estática y no hay desplazamiento horizontal: en el navegador en todas las pantallas del
  asistente, y en la ventana real de Electron en el paso 1.
- **Foco tras copiar:** los dos harness copian con Enter y registran dónde queda el foco. En Electron 44
  (Chromium 152) se quedó en el botón las 4 veces, desde el código y empaquetada (`focusAfter`). En Edge 153
  sin ventana cayó al `body` en 2 de 20 activaciones (`focusAfterCopy`). `setBusy` deshabilita el botón
  enfocado mientras dura la acción. Es un defecto previo e intermitente, comentado en #149 (abajo). Una
  medición puntual anterior no lo reprodujo y se anotó por error que no existía.
- **No se hizo:** no se usó un lector de pantalla (NVDA ni Narrador) y ninguna persona recorrió la aplicación
  con teclado. Los nombres se leen del árbol de accesibilidad de Chromium y del DOM, que es lo que una máquina
  puede comprobar.

## Estados de carga, vacío, error y conectividad

- **Carga:** mientras se copia o se prepara, `#content` declara `aria-busy="true"` y los controles se
  deshabilitan; los harness esperan a que termine.
- **Vacío:** la pantalla de carpeta sin carpeta elegida (`folder-empty`) se mide en los 20 recorridos. Una
  visión vacía llega al final con el objetivo del primer paso.
- **Error:** el contrato responde a los dos botones de copiar de cuatro maneras
  ([interface-contract.json](after/contract/interface-contract.json)).
  - Éxito: anuncio y etiqueta de confirmación.
  - Rechazo (`CLIPBOARD_FAILED`): error con causa en `#feedback`, sin anuncio ni cambio de etiqueta.
  - Fallo de transporte: «La ventana no pudo comunicarse con la aplicación».
  - Éxito seguido de un rechazo: el error aparece sin la confirmación del intento anterior.

  El portapapeles de la página no se toca en ningún caso. `qa/desktop.mjs` prueba los límites en bytes, NUL,
  texto vacío o que no es texto, y el fallo del adaptador sin filtrar el texto. En Electron, los cuatro
  rechazos de arriba.
- **Conectividad restringida:** no aplica a este change. El asistente y la copia no usan la red (la CSP
  declara `connect-src 'none'`) y no se tocó ninguna ruta que la use.

## Rollback

[rollback.json](after/rollback.json), sobre `12c931b`: 10 de 10 pasos, `node_modules` intacto.

- **De 0.3.2 a 0.3.1:** 0.3.2 prepara una carpeta con una visión de varias líneas. 0.3.1 la lista, la abre y
  conserva sus elecciones.
- **De 0.3.1 a 0.3.2:** 0.3.2 abre lo que preparó 0.3.1 y lista los dos proyectos del mismo historial.
- **Archivos de la persona:** no cambian en ningún paso.
- **Defecto recuperado:** con el rollback vuelve el defecto de copia, porque 0.3.1 no ofrece `copyText`.

Revertir el PR es la estrategia registrada. No hay migración de datos.

## Documentación

A quién corresponde cada documento y cuándo cambia:

- **Notas de 0.3.2:** son de la aplicación y viajan con el tag y el instalador.
- **PROJECT_STATUS:** lo concilia quien publica en cada release, según su sección «En cada publicación».
- **README y guía de instalación:** cambian a 0.3.2 en la PR posterior a la publicación.
- **Artefactos de este change:** quedan archivados como registro histórico, y la spec vigente pasa a
  `openspec/specs/`.

El agente revisó que cada documento diga lo mismo que los demás y que no afirme más de lo medido. Las
revisiones adversariales encontraron y corrigieron varias afirmaciones de este tipo.

- [PROJECT_STATUS](../../../../docs/PROJECT_STATUS.md) separa 0.3.1 publicado, con sus cinco defectos
  conocidos, de las correcciones 0.3.2 pendientes de instalador. Los defectos del issue se distinguen de los
  hallados durante la corrección, y enumera los mismos límites que las notas.
- Las [notas de 0.3.2](../../../../apps/companion/RELEASE_NOTES_0.3.2.md) dicen qué se corrige, cómo se
  comprobó y qué no cambia (#147, #144, #143).
- README y la guía de instalación siguen enlazando 0.3.1: la spec exige cambiarlos solo con los assets
  canónicos de 0.3.2 verificados, después del merge.
- Las capturas de `docs/companion/` no se regeneran. Son del prototipo y las sustituye #143, como fija la
  tarea 5.2. PROJECT_STATUS y las notas lo dicen.

Hashes SHA-256 de las capturas de este change:

| Captura | SHA-256 |
| --- | --- |
| [after/ui/wizard-1180x820-setup-final.png](after/ui/wizard-1180x820-setup-final.png) | `758615a35be584eb6e817529d6977006bb76aca7e25643cda1866c61ee61ecfb` |
| [after/ui/wizard-1180x820-install-final.png](after/ui/wizard-1180x820-install-final.png) | `24b5683ed12c4805142a9bbf2f2ff75f6089dee0725d7284a9678a2b7df99a76` |
| [after/ui/wizard-1160x810-setup-final.png](after/ui/wizard-1160x810-setup-final.png) | `67c97d532d31121f6deb454cda5341394c9b3adf71cee7fa265931696f73d598` |
| [after/ui/wizard-1160x810-install-final.png](after/ui/wizard-1160x810-install-final.png) | `1b776557f58f1564ba7e677b96b8e3aa95b23bcdc2af4d511e92c0bad0a5a317` |
| [after/ui/wizard-1040x700-setup-final.png](after/ui/wizard-1040x700-setup-final.png) | `979132c6a20ef076614d4d32b2e257fa38c5e0a3f5e5776e97801f9bb3d78008` |
| [after/ui/wizard-1040x700-install-final.png](after/ui/wizard-1040x700-install-final.png) | `4e092c38da7a886d4db15d5a46bb41f59be94b3e088cd93ca7e71949ea51016c` |
| [after/ui/wizard-582x377-setup-final.png](after/ui/wizard-582x377-setup-final.png) | `a9374e328e429441f10f08b91c524dd2d036b13b10e9459472d6bf61e34e01ce` |
| [after/ui/wizard-582x377-install-final.png](after/ui/wizard-582x377-install-final.png) | `dcc6fbaefaf48ac1304f169c1ce3dd9a77f9be94c446a11f77206d21a77465d8` |
| [after/ui/wizard-464x475-setup-final.png](after/ui/wizard-464x475-setup-final.png) | `22d46933b9d69110ceed9ce1b64c407dcc38b7da88e8faf1017118ff90d43a81` |
| [after/ui/wizard-464x475-install-final.png](after/ui/wizard-464x475-install-final.png) | `36637ab631eb5d94b524c25a38532223fad6da4658ae05b4e3d54e8ed60e3c83` |
| [after/native/electron-install-final.png](after/native/electron-install-final.png) | `6f4cfe6baa1e610113c61e56a58f903fc161a433ba5787e70eb65b84aa5a6637` |
| [after/native/electron-finished.png](after/native/electron-finished.png) | `47a8fb6abe4b0185fe73de0dca224fe20f9e10e80bd29c3975a832d84ef72f63` |
| [after/native-packaged/electron-install-final.png](after/native-packaged/electron-install-final.png) | `7e935dd5cf143e1b259597fdc5eebf09ed8e48b650dd56e23652d8eb3c5fd59f` |
| [after/native-packaged/electron-finished.png](after/native-packaged/electron-finished.png) | `ae3e7ef919f38f8747b2f72784168bb461ee205125462f8e67d8039c91b2ec12` |

Las capturas de pantalla completa de Electron repiten la cabecera sticky a media página. Es un artefacto de
la captura, no de la aplicación.

## Decisiones de deriva registradas

- **Decisión 1 del [diseño](../design.md):** se añadieron el scroll-padding alimentado por el
  `ResizeObserver`, la clase `.wizard-footer` y la barra estática en ventanas pequeñas. La
  [spec](../specs/companion-experience/spec.md) recoge esto último con su escenario. Las cifras de esas
  ventanas se midieron en Electron: 582 × 377 y 464 × 475 px CSS.
- **Decisión 6:** el objetivo va en una línea derivada de la visión. Es un defecto hallado en el apply, con
  requisito propio en la spec. Una visión sin texto conserva el objetivo del primer paso, escenario añadido
  tras la segunda revisión.
- **Decisión 7:** la frase falsa del prompt de «Instalación rápida», corregida por decisión del mantenedor.
- **Escenario de copia en la spec de desktop:** un fallo justo después de una copia confirmada no deja la
  confirmación anterior. Se añadió tras la segunda revisión.
- **Las diez decisiones del mantenedor** están en [decisiones](maintainer-decisions.md):
  - la prueba nativa, la publicación y el prompt;
  - los defectos previos y los estilos bloqueados por la CSP;
  - la revisión limpia;
  - los detalles comentados en #146;
  - la prueba de la app instalada tras publicar;
  - el foco, comentado en #149. Esta decisión corrige una anterior que se basaba en una medición errónea.
- **Tarea 5.3 reformulada:** la instalación en Windows aislado la hace el workflow de release sobre el tag, por
  la decisión de publicar. Antes de archivar se construyó el candidato y se probó su ejecutable empaquetado.

## Visto fuera de alcance

Cinco defectos previos a este change, presentes ya en 0.3.1. Por decisión del mantenedor se comentaron con su
evidencia en los issues que rehacen esas piezas y no entran al registro de deuda:

- **En [#144](https://github.com/IgnacioBarEsp/project-engineering-os/issues/144#issuecomment-5743031218):**
  - **Cabecera a 1040 px:** a 1040 × 700 la cabecera parte «Inicio» y «Ayuda» en dos renglones en las 7
    pantallas de los 4 recorridos de ese ancho, y la marca «Companion» queda pegada a la navegación.
  - **Estilos en línea:** la CSP de Electron bloquea cuatro estilos en línea de `app.mjs` (`432`, `515`,
    `629` y `642`). El harness del navegador no lo ve porque sirve la página sin CSP.
- **En [#146](https://github.com/IgnacioBarEsp/project-engineering-os/issues/146#issuecomment-5744066763):**
  - **Ruta de revisión heredada:** la pastilla «Preparar proyecto» se apaga en la ruta a la que lleva
    «Revisar preparación →».
  - **Caracteres de control:** una visión con U+000B o U+000C se rechaza con `VISION_INVALID` y un mensaje
    que habla de longitud.
- **En [#149](https://github.com/IgnacioBarEsp/project-engineering-os/issues/149#issuecomment-5744136052):**
  - **Foco:** el foco puede caer al `body` tras una acción de `run()`, con las cifras de arriba.

La comprobación nueva de desplazamiento horizontal encontró otro defecto previo, dentro del asistente: en la
ventana mínima la ruta de la pantalla final sobresalía 2 px. Se corrigió en `4ab9168`.

## Lo que esta evidencia no demuestra

- La instalación, la actualización desde 0.1.0 y la desinstalación del instalador 0.3.2, ni el artefacto
  que se publicará. Los dos dependen del workflow de release sobre el tag.
- macOS y Linux. La aplicación se distribuye solo para Windows x64; la CI ejecuta las pruebas de Companion en
  los tres sistemas y el harness del navegador en Ubuntu.
- Un lector de pantalla, un recorrido humano con teclado o una lectura en frío.
- La restauración del portapapeles con formatos distintos de texto, HTML e imagen, como archivos copiados o
  formatos propios de otras aplicaciones.
- Que el foco se conserve tras una acción: la spec de este change no lo exige, y los harness lo registran sin
  juzgarlo.
- Las ventanas pequeñas en Electron fuera del paso 1: el resto de pantallas se recorrió en esos viewports en
  el navegador, que sirve la página sin CSP.
- Nada de lo que la CSP cambia en la ventana real, a partir de las ejecuciones en navegador. Por eso la
  prueba nativa registra los errores de CSP.
