# Entrada a implementación

Tareas 1.1 y 1.2. Registrado por el agente que ejecuta el apply (Claude Code), 19 de septiembre de 2026.

## 1.1 Autorización y límite releído

El mantenedor pidió en esta sesión: «Mira el handoff […] y el estado actual del proyecto […], cuando ya
tengas todo el contexto claro, empieza con el issue que se quedó pendiente antes del apply y continúa su
flujo». Se registra como autorización para continuar con apply sobre la spec preparada.

No se le atribuye una revisión línea a línea de proposal, design y specs: la instrucción no la menciona.
Integrar en `main` y publicar 0.3.2 siguen necesitando su decisión explícita, según
[CONTRIBUTING.md](../../../../CONTRIBUTING.md), y se le preguntan antes de ejecutarse.

Se releyeron el límite de la preparación y el [preflight de archivado](pre-apply.md): diez PASS y seis
FAIL esperados, todos trabajo posterior a apply. Con las superficies `documentation` y `ui` solo se
ejecuta el runner local `openspec-strict`, así que #115 y #122 no bloquean este change. Eso no demuestra
que estén corregidos.

## 1.2 Revalidación

| Qué | Resultado |
| --- | --- |
| `main` | Tras `git fetch` el 19 de septiembre, `main` = `origin/main` = `a3b1efda6a53501a2a06e277cf0b7f18f11c6bed`. Sin commits nuevos ni PRs abiertos. |
| Issue #142 | `updatedAt` 2026-09-19T04:05:14Z; la [instantánea](issue-142.json) era de las 02:24:29Z. SHA-256 del cuerpo actual: `1f3a6b386cb5c95a160085e0ca67405796e0445226ef293ae5ba2167561e218a`. El único cambio es la nota de contexto en la historia original: #168 queda fuera y la tarea 5.3 decide la publicación. El bloque de metadata es idéntico salvo un salto de línea final. |
| Definition of Ready | PASS 13, FAIL 0, EXCEPTION 0, sin mutación: [readiness-propose-apply.json](readiness-propose-apply.json). |
| Artefactos del change | Sin cambios desde la preparación. |
| Código base | Los archivos citados en el [baseline](../brownfield-baseline.md) siguen en `a3b1efd`. |

## Entorno de ejecución

- Windows 11 IoT Enterprise LTSC 2024, versión 10.0.26100, x64.
- Node 24.18.0 y npm 11.16.0 locales. La CI usa npm 11.19.1.
- Electron 44.1.1, Playwright 1.62.1 y Microsoft Edge sin ventana (`channel: msedge`) para el renderer
  en navegador. La CI de Ubuntu usa Chromium, así que las métricas de fuente pueden diferir.

## Aislamiento de las pruebas nativas

Electron se lanza con un `--user-data-dir` y un `LOCALAPPDATA` temporales, así que ni el historial ni
las herramientas de una instalación personal se leen ni se escriben. El portapapeles del sistema sí es
compartido: la prueba lo sobrescribe, conserva en memoria el texto previo y lo restaura al terminar. Ese
texto no se registra.

## Línea base reejecutada sobre `a3b1efd` sin cambios

| Comando | Resultado | Duración |
| --- | --- | --- |
| `npm --prefix apps/companion test` | 141 de 141 | 47 s |
| `npm --prefix apps/companion run test:ui` | PASS | 37 s |
| `npm --prefix apps/companion run evidence:contract` | 40 de 40 mutaciones detectadas, 0 hallazgos, 11 pantallas | 63 s |

Los tres pasan sobre el código que tiene el defecto. Ninguno recorre el asistente vigente con movimiento
activo: el recorrido de la interfaz usa `reducedMotion: 'reduce'` y la ruta de revisión anterior. Por eso
este change añade un recorrido nuevo; que la línea base esté en verde no demuestra que el asistente se
pueda terminar.
