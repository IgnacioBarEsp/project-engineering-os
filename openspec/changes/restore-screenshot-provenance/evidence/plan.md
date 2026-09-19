# Evidencia requerida después de aprobar la spec

Este documento es un plan. No acredita ejecución de pruebas del producto ni revisión humana.
Las comprobaciones de preparación realizadas están en [pre-apply.md](pre-apply.md).

| Criterio #143 | Evidencia que debe existir tras apply |
| --- | --- |
| Ninguna imagen publicada comparte SHA-256 con los mocks | Medición antes/después: [before/mock-identity.json](before/mock-identity.json) y un registro `after/` del mismo método sobre las siete imágenes nuevas, más prueba del rechazo con fixture idéntico a un mock. |
| Cada imagen tiene `provenance.json` con commit, versión, viewport, generador y hash verificado | Los siete registros junto a las imágenes, y la salida de `check:docs` con `screenshot-provenance` en verde sobre el repositorio real. |
| `SCREENSHOTS.md` describe perfiles y controles que existen en el commit citado | Inspección de cada captura contra la ventana real, con autoría declarada, y diff de la documentación reconciliada. |
| `PROJECT_STATUS.md` refleja el estado verdadero de las versiones | Diff del documento contra el estado de releases publicado. |
| `npm run check` en verde con la comprobación nueva | Salida completa guardada en este directorio tras el último commit. |

Pruebas negativas de la comprobación de procedencia, cada una con fixture temporal: imagen idéntica a un
mock, registro ausente, registro ilegible, hash distinto, tamaño distinto, campo inválido o ausente, ruta de
usuario en el registro y generador inexistente. Ningún caso rechazado pasa `check:docs`.

Comandos previstos desde la raíz, con salidas guardadas en este directorio:

```sh
node scripts/check-docs.mjs
node --test test/screenshot-provenance.test.mjs
node --test test/public-guidance.test.mjs
node apps/companion/scripts/capture-screenshots.mjs
npm run check
```

Las capturas se generan con árbol limpio desde el commit que declara cada registro (decisión 1 del diseño,
«Desde el código» en [decisiones](maintainer-decisions.md)). La CI no las regenera: comprueba hash y
procedencia.

Evidencia manual proporcional: inspección visual de cada captura contra la pantalla real en el commit citado,
indicando quién la ejecutó (agente o persona) y que la fuente ejecutada es la ventana de Electron, no un
artefacto instalado. No llamar humana a la revisión del agente.

Evidencia documental: enlaces relativos, coherencia de versiones (0.3.2 publicado), procedencia y límites de
las afirmaciones; revisión de claridad y ownership de los cuatro documentos públicos tocados; decisiones de
deriva registradas.

Antes del archivo: revisión adversarial desde contexto limpio, rollback verificado (revertir restaura las
imágenes y textos anteriores) y assessment de deuda capturado por CLI después de la última pasada de revisión.
Los hallazgos previos #115/#122 no se declaran resueltos ni se ocultan como N/A.
