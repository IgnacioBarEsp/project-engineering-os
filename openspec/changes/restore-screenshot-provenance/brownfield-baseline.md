# Baseline de #143 antes de apply

- **Repositorio al empezar:** `main` en `eefa1bc`, con el árbol limpio.
- **Rama de preparación:** `codex/143-screenshot-provenance`.
- **Versiones:** Companion 0.3.2 publicado; núcleo 0.5.0; OpenSpec fijado en 1.6.0.
- **Changes activos:** ninguno antes de crear este con el CLI oficial.

## Lectura realizada en esta sesión

| Fuente | Observación relevante |
| --- | --- |
| `docs/assets/companion/*.png` y `docs/assets/companion-current-home.png` | Siete imágenes con el mismo SHA-256 que los `screen.png` de `docs/stitch uxui/`: [medición](evidence/before/mock-identity.json). |
| `docs/companion/SCREENSHOTS.md` | Titulada «Capturas de Companion 0.3.1». Atribuye las imágenes al commit `0d83903`, a «renderer real en navegador» y a `verify-ui.mjs`, y lista siete perfiles que no son los de `apps/companion/ui/app.mjs`. |
| `README.md:43-45` | Muestra `companion-current-home.png` como el asistente integrado, «tomada el 18 de septiembre de 2026». |
| `docs/README.md:64` | Promete «imágenes reales, procedencia y alcance de lo probado». |
| `docs/PROJECT_STATUS.md:44` | Ya dice que las capturas son del prototipo y que las sustituye #143. |
| `scripts/public-guidance.mjs:29-36` | Exige en SCREENSHOTS.md un `/tree/<commit>`, «renderer real en navegador», «No es una captura del instalador», «Ejecución UTC» y el hash de `companion-current-home.png`. Comprueba que el texto existe, no de dónde sale la imagen. |
| `test/public-guidance.test.mjs` | Mutaciones de esas reglas. Ninguna comprueba que la imagen no sea un mock. |
| `docs/stitch uxui/` | Cada pantalla trae `DESIGN.md`, `code.html` y `screen.png`. No hay ningún texto que la rotule como prototipo. |
| `apps/companion/scripts/verify-native-clipboard.mjs` | Ya lanza la ventana real con `_electron.launch`, datos aislados y el selector de carpetas sustituido. Es la base del generador. |
| `.project-os/profiles.json` | `harness-tooling` exige `sync-check`, `opsx-check` y `doctor-json-check`, con runners locales. |

## Medido en esta sesión

- **DoR de #143:** 13 PASS, 0 FAIL ([registro](evidence/readiness-propose.json)).
- **Runners de `harness-tooling` sobre `eefa1bc`:** `sync --target . --check --json` sale con código 2,
  `opsx-check --target . --json` con 2 y `doctor --target . --json` con 1. Es lo que el handoff atribuye a #122
  y #115.

## Heredado, no repetido

- **Issue:** el diagnóstico original está en el [issue #143](https://github.com/IgnacioBarEsp/project-engineering-os/issues/143).
- **Handoff:** el dossier del handoff registra la misma identidad de hashes.
- **Controles de los mocks:** no se volvieron a enumerar los controles que muestran y la aplicación no tiene. El
  issue los cita, y dejarán de aparecer al sustituir las imágenes.
