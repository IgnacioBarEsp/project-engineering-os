# Validación — companion-0-3-2-hotfix-actions-bar-clipboard

Ejecutada el 19 de septiembre de 2026 por el agente del apply (Claude Opus 5 en Claude Code). Ninguna persona
ejecutó ni revisó estas comprobaciones. Las decisiones que las enmarcan son del mantenedor y están en
[decisiones](maintainer-decisions.md).

- **Commit medido:** `4ab9168`, con el árbol limpio. Todas las ejecuciones de `after/` salen de él, salvo el
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

| Medida | `a3b1efd` (0.3.1), [antes](before/README.md) | `4ab9168`, mismas 3 ventanas | `4ab9168`, con las 2 pequeñas |
| --- | --- | --- | --- |
| Recorridos | 12 | 12 | 20 |
| Pantallas visitadas | 72 de 84 | 84 de 84 | 140 de 140 |
| Controles alcanzables al pulsar su centro | 570 de 612 | 660 de 660 | 1100 de 1100 |
| Problemas | 162 | 0 | 0 |
| Copias observadas con el texto exacto | 0 | 24 de 24 | 40 de 40 |

Cada recorrido es una combinación de ventana, preferencia de movimiento (2) y forma de instalar (2).
[wizard-reach.json](after/ui/wizard-reach.json) incluye además dos recorridos con una visión sin texto
(`###` y vacía): los dos llegan al final con el objetivo del primer paso.

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

Dos ejecuciones de `npm run evidence:clipboard` sobre `4ab9168`: el código con `electron .` y el ejecutable
`win-unpacked` del candidato construido abajo. Ninguna es una instalación.

| | Desde el código | Empaquetado |
| --- | --- | --- |
| Copias con el texto exacto leído del sistema | 2 de 2 | 2 de 2 |
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

`npm run pack` sobre `4ab9168` con el árbol limpio:
[manifiesto](after/candidate/artifact-manifest.json) y [SHA256SUMS](after/candidate/SHA256SUMS). El
instalador `ProjectEngineeringOS-Setup-0.3.2-x64.exe` pesa 133 309 414 bytes, tiene SHA-256 `c9935198…e8f52bee`
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
  del proyecto» en el árbol de accesibilidad con el placeholder retirado. Se comprobó que la misma lectura
  falla si se quita el `aria-label`: el nombre cae entonces al placeholder.
- **Avisos y errores:** la confirmación de copia se anuncia en `#notice` (`role="status"`,
  `aria-live="polite"`). Los errores aparecen en `#feedback` (`role="alert"`) con causa y acción.
- **Contraste, movimiento y zoom:** contraste AA (4,5:1, y 3:1 en texto grande) medido en cada pantalla, sin
  fallos. Todos los recorridos se hacen con movimiento normal y reducido. Con zoom al 200 % todo se alcanza,
  la barra queda estática y no hay desplazamiento horizontal: en el navegador en todas las pantallas del
  asistente, y en la ventana real de Electron en el paso 1.
- **Foco tras copiar:** con Enter sobre «Copiar ruta» y sobre «Copiar Prompt Maestro» en la ventana real de
  Electron 44 (Chromium 152), el botón queda deshabilitado mientras dura la copia y conserva el foco. Al
  terminar, el foco sigue en él, con su etiqueta de confirmación, y Tab pasa al siguiente control. En Edge
  sin ventana ocurre lo mismo. Es una medición puntual de este apply y no la repite ningún harness.
  Corrige lo que se había anotado antes, que el foco caía al `body`.
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

[rollback.json](after/rollback.json), sobre `4ab9168`: 10 de 10 pasos, `node_modules` intacto.

- **De 0.3.2 a 0.3.1:** 0.3.2 prepara una carpeta con una visión de varias líneas. 0.3.1 la lista, la abre y
  conserva sus elecciones.
- **De 0.3.1 a 0.3.2:** 0.3.2 abre lo que preparó 0.3.1 y lista los dos proyectos del mismo historial.
- **Archivos de la persona:** no cambian en ningún paso.
- **Defecto recuperado:** con el rollback vuelve el defecto de copia, porque 0.3.1 no ofrece `copyText`.

Revertir el PR es la estrategia registrada. No hay migración de datos.

## Documentación

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
| [after/ui/wizard-1180x820-setup-final.png](after/ui/wizard-1180x820-setup-final.png) | `b89d412a3fbdb7195fc206f7d6cc3f2202d6dc5df4b3532984978a8827b688be` |
| [after/ui/wizard-1180x820-install-final.png](after/ui/wizard-1180x820-install-final.png) | `0f3ca40fdcdd0b2c60eabb7f326634042613952d73927e66ae66518623c6a631` |
| [after/ui/wizard-1160x810-setup-final.png](after/ui/wizard-1160x810-setup-final.png) | `f77525a443a1bb5edaea8c7a59f45acbfd1819465895ac9e47547477d4b7f343` |
| [after/ui/wizard-1160x810-install-final.png](after/ui/wizard-1160x810-install-final.png) | `b1ffa8153dbfbd930a1451973d9a29ded8e87f8568bd899b6a5ea5c594ac07ac` |
| [after/ui/wizard-1040x700-setup-final.png](after/ui/wizard-1040x700-setup-final.png) | `76d6a9966acfe8e5d56d459b7ccfcd19aa8de5fe7814d2fd52f48592bdc766f6` |
| [after/ui/wizard-1040x700-install-final.png](after/ui/wizard-1040x700-install-final.png) | `ceb21c4142dee494707a3e635de3bf477695abda65eaab511a2f62043706cc0a` |
| [after/ui/wizard-582x377-setup-final.png](after/ui/wizard-582x377-setup-final.png) | `a9374e328e429441f10f08b91c524dd2d036b13b10e9459472d6bf61e34e01ce` |
| [after/ui/wizard-582x377-install-final.png](after/ui/wizard-582x377-install-final.png) | `dcc6fbaefaf48ac1304f169c1ce3dd9a77f9be94c446a11f77206d21a77465d8` |
| [after/ui/wizard-464x475-setup-final.png](after/ui/wizard-464x475-setup-final.png) | `22d46933b9d69110ceed9ce1b64c407dcc38b7da88e8faf1017118ff90d43a81` |
| [after/ui/wizard-464x475-install-final.png](after/ui/wizard-464x475-install-final.png) | `36637ab631eb5d94b524c25a38532223fad6da4658ae05b4e3d54e8ed60e3c83` |
| [after/native/electron-install-final.png](after/native/electron-install-final.png) | `b681cf2ea274e0a300097f9c8d50a69b06ce8969128f2c15f93133891f3e5fc8` |
| [after/native/electron-finished.png](after/native/electron-finished.png) | `7d57c6f4e288de49be7516c1b0b6b2abe1c4e129f3416998f5b68b26a72f3f8a` |
| [after/native-packaged/electron-install-final.png](after/native-packaged/electron-install-final.png) | `3acaed35dfc5799b3b3cb3a999884b0322a611d17589f54f6ab8b087cb56c3a3` |
| [after/native-packaged/electron-finished.png](after/native-packaged/electron-finished.png) | `3706f55ae2f9a9693c3ad8779a125248d0f68c872d0fec2fc59c023cb3eebe7c` |

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
- **Las seis decisiones del mantenedor:** prueba nativa, publicación, prompt, dos defectos previos, revisión
  limpia y estilos bloqueados por la CSP. Están en [decisiones](maintainer-decisions.md), junto con la
  corrección sobre el foco, que no se reprodujo.
- **Tarea 5.3 reformulada:** la instalación en Windows aislado la hace el workflow de release sobre el tag, por
  la decisión de publicar. Antes de archivar se construyó el candidato y se probó su ejecutable empaquetado.

## Visto fuera de alcance

Dos defectos previos a este change. Por decisión del mantenedor se comentaron con su evidencia en #144, que
rehace esas piezas ([comentario](https://github.com/IgnacioBarEsp/project-engineering-os/issues/144#issuecomment-5743031218)),
y no entran al registro de deuda:

- **Cabecera a 1040 px:** a 1040 × 700 la cabecera parte «Inicio» y «Ayuda» en dos renglones en las 7
  pantallas de los 4 recorridos de ese ancho, y la marca «Companion» queda pegada a la navegación.
- **Estilos en línea:** la CSP de Electron bloquea cuatro estilos en línea de `app.mjs` (`432`, `515`, `629` y
  `642`), existentes desde 0.3.0. El harness del navegador no lo ve porque sirve la página sin CSP.

Un tercer defecto anotado antes, el foco que caería al `body` tras copiar y que iba a #149, no se reprodujo
al medirlo de nuevo (arriba, en teclado) y no se comenta.

La segunda revisión anotó dos puntos previos más, sin issue:

- En la ruta de revisión heredada, a la que lleva «Revisar preparación →», la pastilla «Preparar proyecto»
  está apagada.
- Una visión con U+000B o U+000C se rechaza con `VISION_INVALID`. Esos caracteres no se escriben con el
  teclado, solo pegados.

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
- Las ventanas pequeñas en Electron fuera del paso 1: el resto de pantallas se recorrió en esos viewports en
  el navegador, que sirve la página sin CSP.
- Nada de lo que la CSP cambia en la ventana real, a partir de las ejecuciones en navegador. Por eso la
  prueba nativa registra los errores de CSP.
