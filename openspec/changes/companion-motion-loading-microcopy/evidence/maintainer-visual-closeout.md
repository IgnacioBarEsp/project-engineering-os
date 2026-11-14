# Decisión visual del mantenedor — 2026-09-30

## Capturas realmente mostradas

- Inicio: `peos-management-electron-v1/home-1180-no-preference.png`, Electron real
  desde fuente a39a95e, no instalador. Conserva su provenance y SHA originales.
- Archivos: `peos-project-management-final-v5/files-tasks-browser-1180.png`, renderer
  y servicio reales en navegador, carpeta sintética y transporte nativo inyectado.
  No se presenta como instalación ni como proyecto del mantenedor.

Pregunta literal:

> ¿Apruebas visualmente el Inicio y la herramienta opcional Archivos de las capturas
> que acabo de mostrar? La pantalla principal de preparación ya está aprobada y no
> necesita otra aprobación.

Respuesta literal:

> Solamente si cambiaste lo que me dijiste acerca de la de archivos, la de inicio
> esta bien, pero espero que haya cambiado el concepto de mis proyectos a lo que
> acordamos

## Alcance y condición, sin convertirla en un sí incondicional

Inicio tiene aceptación visual explícita. Archivos tiene aceptación condicionada a
la reorganización de gestión acordada, no una aceptación aislada de la antigua
pantalla técnica. Esa condición ya está implementada y probada: el detalle abre
con las elecciones guardadas y su gestión; los destinos Archivos/Recetas/Tu IA son
herramientas opcionales, y las guías y detalles técnicos están plegados. La
[aceptación principal de #148](../../companion-project-screen-redesign/evidence/management-visual-acceptance.md)
y su [validación real](../../companion-project-screen-redesign/evidence/management-validation.md)
registran la reorganización. El agente respondió describiendo estas capacidades y
sus límites: duplicar reutiliza respuestas en otra carpeta; quitar de la lista no
desconfigura ni borra sus archivos.

Se acredita la decisión visual dentro de ese alcance y con la condición comprobada,
no aprobación global del asistente, de todos los perfiles, del instalador o de ola 3.
La aprobación no sustituye la observación humana del control renombrado
«Revisar texto de mis archivos para mi IA», que se recibió después y se conserva
separadamente en [renamed-export-reading.json](renamed-export-reading.json), ni la
revisión independiente del delta o CI protegida verde.

## Lectura final, separada de la aprobación visual

El mismo día se confirmó el procedimiento de dos personas nuevas para Inicio y
paso 1 en [final-reading-round.json](final-reading-round.json). Las seis respuestas
originales permanecen byte por byte; la confirmación no acredita señalar el botón
antiguo de exportación. `git diff --exit-code 7717195 HEAD --` para
`ui/screens/home.mjs`, `ui/screens/wizard.mjs` y `engine/profiles.mjs` de Companion
terminó con exit 0: la reorganización posterior no cambió esa copia o catálogo.

No pedir otra ronda de dos personas por un cambio exclusivo del detalle del
proyecto. El nuevo control de Archivos tiene una respuesta propia, facilitada al
solicitar el procedimiento con una persona ajena, sin abrirlo ni explicarlo. Reconoce
recopilar información de archivos para la IA; no se atribuye a ella comprensión de
todos los detalles de revisión/copia ni ejecución real de esos pasos. Una persona
basta para el mínimo original de #97; no inventar unanimidad o un segundo lector.
