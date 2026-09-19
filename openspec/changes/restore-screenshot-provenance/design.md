## Context

Base: `main` en `eefa1bc`, con Companion 0.3.2 publicado y núcleo 0.5.0. [Baseline](brownfield-baseline.md).

Las siete imágenes de producto de la documentación tienen el mismo SHA-256 que los `screen.png` de
`docs/stitch uxui/` ([medición](evidence/before/mock-identity.json)):

- las seis de `docs/assets/companion/`;
- `docs/assets/companion-current-home.png`, que es la del README.

`docs/companion/SCREENSHOTS.md` les atribuye el commit `0d83903`, «renderer real en navegador» y el generador
`verify-ui.mjs`, y lista siete perfiles que no son los del código.

La comprobación de guía pública (`scripts/public-guidance.mjs`) exige hoy cuatro cosas de SCREENSHOTS.md:

- un enlace `/tree/<commit>`;
- el texto «renderer real en navegador»;
- «Ejecución UTC»;
- el hash de `companion-current-home.png`.

Por eso aceptó la procedencia falsa: comprueba que el texto existe, no que la imagen salga de donde dice.

## Goals / Non-Goals

Objetivo: que cada imagen presentada como Companion sea una captura de la aplicación real, que diga de dónde
sale y que una comprobación automática lo impida en otro caso. Los límites están en la [propuesta](proposal.md).

## Decisions

### 1. Capturas de la ventana real en Electron

Decisión del mantenedor ([registro](evidence/maintainer-decisions.md)). Un script versionado,
`apps/companion/scripts/capture-screenshots.mjs`, lanza la aplicación con `_electron.launch`, como
`verify-native-clipboard.mjs`:

- **Aislamiento:** `--user-data-dir` y `LOCALAPPDATA` propios. El selector de carpetas del sistema se sustituye
  por una carpeta de prueba, porque un script no puede manejarlo.
- **Ventana:** la de la aplicación por defecto, 1180 × 820, que deja un viewport de 1164 × 755 px CSS con
  `devicePixelRatio` 1.
- **Pantallas:** Inicio, los cuatro pasos del asistente y la pantalla final.
- **Encuadre:** cada imagen es la ventana tal como se ve al llegar a esa pantalla, con el scroll arriba y la
  animación de entrada terminada. No se usa página completa: en Electron repite la cabecera sticky a media
  página.
- **Árbol limpio:** el script se niega a generar con cambios sin commit, para que el commit que registra
  describa lo que se ejecutó, como hace `pack-app.mjs`.

Se conservan los nombres de archivo, para no romper enlaces externos. `companion-current-home.png` es la
captura de Inicio, con su propio registro.

Alternativa descartada: el renderer en navegador. Es reproducible en la CI, pero no ve lo que bloquea la CSP de
la aplicación. Las capturas mostrarían estilos que la aplicación instalada no aplica.

### 2. Carpeta de proyecto neutra

La pantalla final muestra la ruta de la carpeta y el Prompt Maestro la incluye. El generador usa una carpeta
creada para la captura bajo la carpeta pública de documentos de Windows (la que `KNOWNFOLDERID`/`PUBLIC`
resuelve, compartida por todas las cuentas), y la borra al terminar. Así no aparece el nombre de la cuenta en
ninguna imagen, y el script comprueba antes de capturar que la ruta no lo contiene. No se enmascara nada: la
imagen es la ventana tal cual.

### 3. Registro de procedencia por imagen

Junto a cada imagen va `<nombre>.png.provenance.json`, escrito por el generador:

| Campo | Contenido |
| --- | --- |
| `schemaVersion` | `1` |
| `sha256`, `bytes` | Hash y tamaño del PNG |
| `width`, `height` | Tamaño de la imagen |
| `commit` | 40 caracteres hexadecimales |
| `appVersion` | Versión de la aplicación |
| `ran` | `electron .` o empaquetada |
| `engine` | Electron y Chromium |
| `window` | Ventana exterior, viewport y `devicePixelRatio` |
| `screen` | Identificador y título visible de la pantalla |
| `generator` | Ruta del script en el repositorio |
| `capturedAt` | Fecha en UTC |
| `platform` | Sistema y versión |

Ningún campo lleva rutas absolutas de la máquina.

### 4. Comprobación en `check:docs`

Un módulo nuevo, `scripts/screenshot-provenance.mjs`, se ejecuta desde `scripts/check-docs.mjs`. Recorre las
imágenes de `docs/assets/companion/` y `docs/assets/companion-current-home.png`, y falla si ocurre cualquiera de
estas cosas:

- **Registro:** falta, no es JSON o le falta un campo o el formato de alguno.
- **Bytes:** el SHA-256 o el tamaño no coinciden con la imagen.
- **Generador:** no existe en el repositorio.
- **Privacidad:** el registro contiene una ruta de usuario.
- **Prototipos:** la imagen es idéntica a una de `docs/stitch uxui/`.

Cada fallo nombra la imagen y la causa. Las pruebas cubren cada rechazo con un fixture temporal y el
repositorio real en verde.

`public-guidance.mjs` deja de exigir «renderer real en navegador». Pasa a exigir «ventana real de la
aplicación», el texto que describe el entorno nuevo, y mantiene el resto de sus reglas. Así, si las capturas
volvieran a ser de navegador, la prueba obligaría a declararlo.

### 5. Mocks rotulados, no movidos

Decisión del mantenedor. `docs/stitch uxui/README.md` dice que son el prototipo de diseño de Google Stitch, que
no son capturas del producto y dónde está la galería real. No se mueve nada, así que no se rompe ningún enlace.

### 6. Documentación que describe lo capturado

- **`SCREENSHOTS.md`:**
  - Describe cada pantalla con sus títulos y controles reales en el commit capturado.
  - Nombra los defectos visibles que siguen abiertos: los estilos en línea bloqueados por la CSP y la
    cabecera a anchos menores, ambos en #144.
  - Tiene una tabla de procedencia con el hash de cada imagen.
- **README:** pie de la captura con versión, commit y «No es una captura del instalador».
- **`docs/PROJECT_STATUS.md`:** deja de decir que las capturas son del prototipo.
- **`docs/README.md`:** su promesa, «imágenes reales, procedencia y alcance de lo probado», pasa a ser cierta.

## Risks / Trade-offs

- **Capturas no reproducibles en la CI:** dependen de Windows y de su renderizado de fuentes. La CI no las
  regenera; comprueba hash y procedencia. Regenerarlas es un paso local con árbol limpio.
- **Defectos a la vista:** las capturas muestran defectos, porque es la regla aprobada. Los textos los nombran
  para que no parezcan descuidos de la captura.
- **Falsos rechazos:** la comprobación podría rechazar una imagen legítima si cambian las rutas. Sus reglas son
  explícitas y probadas, y fallar cerrado es lo que se pide.

## Migration Plan

No hay datos que migrar. El orden es:

1. Generador y comprobación con sus pruebas.
2. Commit del código.
3. Capturas desde ese commit con el árbol limpio.
4. Registros y documentación.
5. `npm run check`.

Rollback: revertir el PR.

## Open Questions

- **Superficie:** la [propuesta](proposal.md) declara solo `documentation`, frente a
  `documentation, harness-tooling` en la metadata del issue. Lo decide el mantenedor en la revisión de este
  change.
- **Instalador:** si las capturas deben repetirse con la aplicación empaquetada además de desde el código. El
  diseño admite las dos y registra cuál se ejecutó; por defecto, desde el código.
