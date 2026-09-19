# Baseline de #142 antes de apply

Repositorio limpio al iniciar, en `main`, commit `a3b1efda6a53501a2a06e277cf0b7f18f11c6bed`.
Rama de preparación: `codex/142-companion-hotfix-spec`. Companion declara 0.3.1; core 0.5.0.
OpenSpec instalado y fijado: 1.6.0. No existía otro change activo antes de crear este con el CLI oficial.

## Lectura del código realizada en esta sesión

| Fuente | Observación relevante |
| --- | --- |
| `apps/companion/ui/app.css:116–124` | `.enter` se anima con transform/forwards; acciones fixed y un padding de 145 px que la especificidad de `main#content` anula; reduce desactiva animación. |
| `apps/companion/ui/app.css:2–25`, `ui/index.html` | Scroll del documento, main en flujo; no hay contenedor de scroll independiente que reutilizar. |
| `apps/companion/ui/app.mjs:107–112` | `run` muestra errores, `call` lee envelope; render envuelve en `.enter` y omite install/finished de navegación activa. |
| `apps/companion/ui/app.mjs:584–608` | Dos handlers finales llaman directamente a api.copyText o navigator.clipboard y usan catch vacío. |
| `apps/companion/desktop/preload.cjs` | Allowlist sin copyText; métodos reciben un objeto y retornan el envelope IPC. |
| `apps/companion/desktop/main.mjs` | Escritura de clipboard inyectada, permisos denegados, validación de emisor/frame/URL y límite de 64000 bytes serializados. Las líneas citadas en el issue corresponden a otra numeración; se verificaron las operaciones en el archivo actual. |
| `apps/companion/desktop/service.mjs` | copyExport y copyGuideStep validan contexto; el helper text rechaza controles y recorta. El nuevo método necesita validación específica para multilinea. |
| `apps/companion/scripts/verify-ui.mjs` | Renderer y motores reales con transporte nativo inyectado; movimiento reducido y perfiles históricos. |
| `apps/companion/scripts/verify-interface-contract.mjs` | Mutaciones sobre copia, rechaza evidencia vacua y excepciones como detección. Se extiende sin sustituir esa regla. |

## Evidencia heredada, no reejecutada

El [issue #142](https://github.com/IgnacioBarEsp/project-engineering-os/issues/142) y el dossier externo
`<home>/Documents/Projects/peos-congreso-evidencia/DOSSIER.md` documentan la reproducción
del 18 de septiembre. El dossier y sus scripts/capturas existen; se leyó su apartado de interfaz.
No se repitió la auditoría ni se ejecutó Electron durante esta preparación.

El informe histórico registra barra con bottom 1880 y viewport interior height 781, intercepción de ambos
botones de instalación por `div.actions`, y permiso de copia denegado en Electron. Son resultados del
autor de esa auditoría, no mediciones nuevas. Las salidas originales permanecen en
`capturas/geometria-con-animacion.json`, `capturas/geometria-sin-animacion.json` y
`scripts/{repro-ui,electron-probe,deadends}.mjs` de ese directorio externo. El snapshot del issue y su hash
quedan en [evidence](evidence/plan.md); el checkout no depende de que exista esa ruta personal para validar specs.

## Controles y límites

El issue pasó DoR antes de crear el change: 13 PASS, 0 FAIL, 0 EXCEPTION, incluida pertenencia al Project.
La autorización de esta sesión se limita a preparación. No se atribuye aprobación de diseño ni pruebas
de producto a esa DoR. La metadata de archive inicia con evidencia funcional, rollback y review pendientes.

El handoff advierte de #115 (doctor/archive) y #122 (perfiles/sync). `docs/UPSTREAM_OPERATIONS.md`
explica el alcance de los runners de consumidor. Se ejecuta un preflight read-only de archive sobre este
change con sus superficies reales UI/documentation; sus resultados se registran por ID en
[pre-apply](evidence/pre-apply.md). No se añaden excepciones ni se reparan perfiles para volverlo verde.
