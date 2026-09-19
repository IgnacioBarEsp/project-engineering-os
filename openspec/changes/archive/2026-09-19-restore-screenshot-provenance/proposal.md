## Why

El [issue #143](https://github.com/IgnacioBarEsp/project-engineering-os/issues/143), segundo de la ola 0 del
[handoff #167](https://github.com/IgnacioBarEsp/project-engineering-os/issues/167), documenta que la galería
presenta como producto imágenes que no lo son. Las siete imágenes que la documentación presenta como capturas
de Companion son, byte a byte, los mocks de Google Stitch de `docs/stitch uxui/`. `SCREENSHOTS.md` les atribuye
un commit, un entorno y un generador que no las produjeron, y `README.md` las muestra como la aplicación.
`PRODUCT.md` exige lo contrario: «Las capturas muestran el producto real y dicen qué versión o commit se
ejecutó». La presentación del 24 de septiembre necesita capturas verdaderas.

## What Changes

- **Capturas reales:** las siete imágenes se sustituyen por capturas de la ventana real de Companion en
  Electron, generadas por un script versionado. Cada una lleva junto a ella un archivo de procedencia con el
  commit, la versión de la aplicación, el motor, el viewport, la fecha, el generador y el SHA-256. Se
  conservan los nombres de archivo.
- **Comprobación automática:** entra en `check:docs`. Falla si una imagen de `docs/assets/companion*` no tiene
  procedencia válida, si su hash no coincide o si es idéntica a una imagen de `docs/stitch uxui/`. La
  comprobación de guía pública deja de exigir el texto «renderer real en navegador», que describía un entorno
  que ya no es el de las capturas.
- **Mocks rotulados:** se quedan donde están y se rotulan como prototipo de diseño con un `README.md` propio.
  Ninguna página pública los presenta como producto.
- **Documentación:** `SCREENSHOTS.md`, `README.md`, `docs/README.md` y `docs/PROJECT_STATUS.md` describen solo
  lo que existe en el commit capturado. Incluyen los defectos cosméticos conocidos que se ven en la ventana
  real (#144).

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `public-documentation-experience`: el requisito de procedencia de las capturas pasa a exigir procedencia por
  imagen, comprobada automáticamente, y prohíbe presentar un prototipo de diseño como captura del producto.

## Impact

Superficie: `documentation`. La metadata del issue declara también `harness-tooling`, pero ese perfil cubre los
arneses de agentes: la matriz de capacidades, el doctor y la ausencia de deriva en una segunda ejecución. Este
change no los toca. Declararlo exigiría en el archivo `sync --check`, `opsx-check` y `doctor`, que hoy fallan por
#122 y #115, y el handoff prohíbe arreglarlos de pasada. La desviación queda propuesta para que el mantenedor la
apruebe ([decisiones](evidence/maintainer-decisions.md)).

Rutas previstas:

- `apps/companion/scripts/`: el generador de capturas.
- `scripts/`: la comprobación de procedencia y la de guía pública.
- `test/`: sus pruebas.
- `docs/assets/companion*`: las imágenes y su procedencia.
- `docs/stitch uxui/README.md`: el rótulo de los mocks.
- `README.md` y `docs/README.md`.
- `docs/PROJECT_STATUS.md`.
- `docs/companion/SCREENSHOTS.md`.

Sin dependencias nuevas, costos, servicios ni cambios de licencia. No cambia la aplicación ni su instalador.

## Non-goals

- Rediseñar la landing (`site/`); ese carril es #118.
- Borrar o mover los mocks de Stitch: son evidencia de diseño.
- El harness general de #150 y la reconstrucción del renderer de #144.
- Arreglar #115 o #122.

## Risk and rollback

Riesgos:

- Las capturas reales son menos vistosas que los mocks y muestran defectos conocidos. Es el estado verdadero,
  y la política aprobada en el issue lo exige.
- Una captura podría contener datos de la máquina, como el nombre de la cuenta en una ruta. El generador usa una
  carpeta de proyecto neutra y la comprobación rechaza rutas de usuario.
- La comprobación podría bloquear imágenes legítimas futuras. Su regla es explícita y tiene pruebas.

Rollback: revertir el PR. No se mueven tags ni assets de releases, y no hay datos que migrar.

## Handoff boundary

El mantenedor pidió, el 19 de septiembre de 2026, preparar el change y detenerse antes del apply para revisarlo
([decisiones](evidence/maintainer-decisions.md)). Esta entrega crea los artefactos y las validaciones de
preparación. No genera capturas, no cambia código ni documentación pública y no archiva nada.
