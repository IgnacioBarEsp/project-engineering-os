# Revisión adversarial — companion-0-3-2-hotfix-actions-bar-clipboard

Dos rondas, las dos hechas por agentes. Según [CONTRIBUTING.md](../../../../../CONTRIBUTING.md), la revisión de
un agente sobre su propio trabajo no es revisión humana ni independiente, y ninguna de estas lo es. La
integración sigue la delegación explícita del mantenedor ([decisiones](maintainer-decisions.md)).

| Ronda | Quién | Contexto | Alcance |
| --- | --- | --- | --- |
| 1 | El agente que implementó (Claude Opus 5, Claude Code), con la skill `code-review` en esfuerzo alto | La misma sesión del apply: **no es contexto limpio** | Diff de `a3b1efd..f0534e8`, leído hunk a hunk contra el código que rodea cada cambio |
| 2 | Un agente revisor (Claude Opus 5) sin la conversación del apply, lanzado a petición del mantenedor | Contexto limpio: solo el repositorio y las instrucciones de revisión, en solo lectura | Diff de `a3b1efd..0518e1e` completo: renderer, IPC, harness, specs, afirmaciones públicas e identidad 0.3.2. No revisó `validation.md`, `readiness.json`, `tasks.md` ni la deuda, que aún se escribían |

Resultado: 0 Blockers y 0 Majors abiertos. Hubo tres pasadas: la ronda 1, la ronda 2 y una segunda pasada
del mismo revisor sobre la evidencia. La ronda 1 encontró un Major y las otras dos ninguno, y todos los Minors
se corrigieron. Los Info que quedan fuera de alcance son defectos previos, comentados en issues por decisión
del mantenedor.

## Ronda 1

Sin fallos funcionales en el código de producción. Los seis hallazgos son afirmaciones inexactas o puntos
frágiles de los harness. Correcciones en `cf71dab`.

| # | Severidad | Hallazgo | Resolución |
| --- | --- | --- | --- |
| 1 | Major | TLDR, propuesta, diseño y tareas seguían diciendo que el change se detuvo antes del apply y que no se implementó nada. Archivado así, el registro permanente sería falso. | Corregido: [TLDR](../TLDR.md), «Handoff boundary» y «Non-goals» de la [propuesta](../proposal.md), «Migration Plan» y «Open Questions» del [diseño](../design.md), y la línea final de [tasks](../tasks.md). |
| 2 | Minor | Las [notas de 0.3.2](../../../../../apps/companion/RELEASE_NOTES_0.3.2.md) decían que «se pulsó cada control». Cada control se comprobó con `elementFromPoint` en su centro y solo se pulsaron algunos. También atribuían a una sola causa que el harness anterior no viera el defecto, y fueron dos. | Corregido: dicen qué se comprobó en cada control, qué se pulsó y las dos causas (movimiento reducido y la ruta de revisión heredada después de los dos primeros pasos, comprobada en `verify-ui.mjs` de `a3b1efd`). |
| 3 | Minor | [PROJECT_STATUS](../../../../../docs/PROJECT_STATUS.md) atribuía al issue #142 los cinco defectos, y el de Visión y el del prompt aparecieron durante el apply. | Corregido: los tres del issue van primero y los dos últimos constan como encontrados durante la corrección. |
| 4 | Minor | La [spec](../specs/companion-experience/spec.md) exigía sticky sin excepción y el CSS deja la barra estática en ventanas de hasta 500 px de alto o 380 px de ancho. | Corregido en la spec, con requisito y escenario de ventana pequeña, y en la decisión 1 del [diseño](../design.md). La ronda 2 encontró que las cifras de esas ventanas estaban mal (hallazgo 4 de abajo). |
| 5 | Minor | `verify-native-clipboard.mjs` solo guardaba y restauraba texto: una imagen del portapapeles se perdía y el registro decía `previousClipboardTextRestored: true`. | Corregido: guarda todos los formatos en memoria del proceso principal, los restaura con `clipboard.write` y solo registra `restored: true` si vuelven los mismos formatos y el mismo texto. Probado en Electron 44.1.1 con una imagen puesta desde Windows: volvieron los cuatro formatos con los mismos bytes y Windows leyó la misma imagen. |
| 6 | Minor | En `verify-interface-contract.mjs` la etiqueta del botón se leía después de otras tres lecturas y compite con el temporizador de 2 s que la revierte. En un runner lento sería un fallo falso. | Corregido: una sola lectura en la página justo después de que termine la copia. |

## Ronda 2

El revisor verificó las seis correcciones de la ronda 1 y las dio por correctas. Además, sin hallazgo,
comprobó lo siguiente:

- **Renderer:** la barra es hermana de `.enter` en las 10 pantallas con pasos. El envío por `form` recibe
  Enter y `required`. Hay un único `ResizeObserver`. La confirmación de copia solo aparece después de
  `await`.
- **IPC:** el preload no expone lectura del portapapeles y `main.mjs` conserva los controles de emisor,
  marco, URL, tamaño y CSP. La validación de `copyable()` es exacta.
- **Harness:** una medición vacía o una pantalla no visitada cuentan como fallo. La mutación de la barra
  fija solo cuenta con intercepción real.
- **Identidad 0.3.2 y privacidad:** coherentes en todo el cambio.

Con `node --test apps/companion/qa/desktop.mjs` pasaron 13 de 13 pruebas. Correcciones en `de86813`.

| # | Severidad | Hallazgo | Resolución |
| --- | --- | --- | --- |
| 1 | Minor | `app.mjs`: el temporizador que devuelve la etiqueta de copia no se cancelaba. Si una copia confirmada iba seguida de otra que fallaba, «¡Ruta copiada!» seguía junto al error hasta 1,5 s, contra el escenario de fallo de la spec de desktop. | Corregido: cada intento cancela el temporizador y vuelve a la etiqueta normal antes de copiar. Nuevo escenario en la [spec de desktop](../specs/companion-desktop/spec.md). El contrato añade una respuesta que acepta y luego rechaza, y la mutación `a-new-copy-keeps-the-previous-confirmation`, que quita el reinicio, se detecta. |
| 2 | Minor | `verify-interface-contract.mjs`: la mutación de copia contaba como detectada con cualquier problema de la respuesta `refused`, incluso «no se observaron los dos controles». Un runner lento podía dar una detección sin medir nada. | Corregido: solo cuentan las consecuencias observadas (anuncio sin copia, causa ausente, etiqueta cambiada). Las copias no observadas siguen siendo un fallo del harness. |
| 3 | Minor | Ninguna comprobación exigía la barra sticky: con `position:static` todo seguía alcanzable tras desplazar y los tres harness pasaban. El escenario de ventana pequeña solo lo respaldaba un script sin versionar. | Corregido: `reachProblems` exige sticky en toda ventana de más de 500 px de alto y 380 de ancho, y la mutación `the-final-bar-no-longer-sticks` se detecta. `verify-ui` recorre ahora las dos ventanas pequeñas reales y la prueba nativa las mide en la ventana real. Se retiró `narrow-windows.json`. |
| 4 | Minor | Diseño, notas y `narrow-windows.json` confundían tamaño de ventana y viewport CSS. `main.mjs` fija el tamaño exterior, y la ventana mínima deja 464 × 475 px CSS, con la barra estática, no sticky como decía el diseño. | Corregido tras medir en Electron 44: la ventana por defecto deja 1164 × 755, así que con zoom al 200 % queda en 582 × 377, y la mínima deja 464 × 475. El [diseño](../design.md) y las notas dan esas cifras y dicen que en esas ventanas la barra va al final del contenido. |
| 5 | Info | Visión: vacía o con solo `###`, el objetivo derivado quedaba vacío y la instalación fallaba con `GOAL_INVALID`. Con U+000B o U+000C, fallaba con `VISION_INVALID`. Las notas prometían más de lo corregido. | En parte corregido. `###` era una regresión de este change, porque 0.3.1 lo enviaba como objetivo. Ahora una visión sin texto conserva el objetivo del primer paso, con escenario en la [spec](../specs/companion-experience/spec.md) y dos recorridos en `verify-ui`, y las notas se acotaron. U+000B y U+000C quedan como estaban: no se escriben con el teclado, solo pegados, y la regla es del motor. Se comentó en #146 por decisión del mantenedor (fila 8). |
| 6 | Info | Pastilla y rutas heredadas: «Revisar preparación →» lleva a la ruta de revisión heredada, donde la pastilla está apagada. Además, `stack-choice` y `ready` no los asigna ningún código y la propuesta hablaba de «estados heredados que todavía existen». | La [propuesta](../proposal.md) se corrigió. La pastilla en la ruta heredada no cambia: es anterior a este change y la spec cubre las seis pantallas del asistente. Se comentó en #146 por decisión del mantenedor (fila 8). |
| 7 | Info | PROJECT_STATUS decía «Dos límites siguen en 0.3.2» y las notas enumeraban tres. | Corregido: los dos documentos enumeran los mismos límites, incluidos los estilos en línea bloqueados por la CSP (#144). |
| 8 | Info | El diseño decía que 0.3.1 «añade 145 px de padding», que la evidencia de antes demuestra que nunca se aplicó. | Corregido en el [diseño](../design.md) y el [baseline](../brownfield-baseline.md). |
| 9 | Info | `native-packaged/native-clipboard.json` contenía `<evidencia>/candidate/…`, que el script versionado no puede producir. | Explicado: lo escribió el recolector de evidencia de la sesión, que sustituye la ruta del directorio de trabajo por `<evidencia>`. Cada registro copiado lleva ahora un campo `pathsSanitized` que lo dice, y la [validación](validation.md) también. |

Al corregir el hallazgo 3 apareció otro defecto previo, dentro del asistente. La comprobación nueva de
desplazamiento horizontal encontró que en la ventana mínima la ruta de la pantalla final sobresalía 2 px. Se
corrigió en `4ab9168`: la ruta parte como las demás de la aplicación.

## Segunda pasada: la evidencia

El mismo agente de la ronda 2, con su contexto limpio, revisó `ea3c229`: validación, registro de revisiones,
decisiones, readiness, tareas, TLDR y el assessment de deuda. Contrastó cada cifra con `evidence/after/` y con
el código. Resultado: 0 Blockers, 0 Majors, 6 Minors y 4 Info.

Comprobó sin hallazgo lo siguiente:

- **Cifras:** todas las de la validación coinciden con sus registros y con el código.
- **Capturas:** los 14 hashes coinciden.
- **Procedencia:** la del commit medido, con el árbol limpio.
- **Rutas saneadas:** están declaradas en `pathsSanitized`.
- **Ronda 2:** las correcciones del temporizador de copia, de la detección de la mutación de copia, de la
  exigencia de sticky, del desplazamiento horizontal y del caso `###`.

Correcciones en `12c931b`.

| # | Severidad | Hallazgo | Resolución |
| --- | --- | --- | --- |
| 1 | Minor | Una visión vaciada al volver a Visión registraba el texto de la visita anterior, no el objetivo del primer paso. Además, una visión vacía dejaba sin texto la «Declaración de Intención» de `PROJECT_VISION.md`. | Corregido: el objetivo se calcula al enviar la preparación. Una visión sin texto no se envía, y se registra el objetivo del primer paso, que ya no se sobrescribe al editar la visión. `PROJECT_VISION.md` declara ese objetivo. `verify-ui` prueba tres casos (`###`, vacía y vaciada al volver de la instalación) y lee `PROJECT_VISION.md`; con el código anterior fallan los tres. Escenario ampliado en la [spec](../specs/companion-experience/spec.md) y decisión 6 del [diseño](../design.md). |
| 2 | Minor | `openspec-strict.json` era anterior a los cambios de spec de las rondas 1 y 2. | Corregido: se regenera justo antes de archivar, con los demás registros documentales. |
| 3 | Minor | `readiness.json` daba por verificadas la revisión de teclado y tecnología asistiva (sin lector de pantalla ni persona) y la de claridad y propiedad de documentos, que la validación no trataba. | Corregido: las dos entradas llevan una `justification` que declara el límite. La validación explica a quién corresponde cada documento, y la línea final de [tasks](../tasks.md) aclara cómo se hizo la 4.4. |
| 4 | Minor | La prueba nativa medía el viewport antes de que la ventana tuviera su barra de menú: 1164 × 781 frente a 755. | Corregido: mide cuando `innerHeight` iguala la altura del contenido de la ventana, y registra también ese tamaño. |
| 5 | Minor | La afirmación sobre el foco tras copiar, que revisaba una decisión del mantenedor, no tenía registro. Tampoco la comprobación de que el nombre del editor cae al placeholder sin `aria-label`. | Corregido: la prueba nativa copia desde el teclado y registra `focusAfter`, y `verify-ui` registra `focusAfterCopy` en la rama que copia con Enter. La lectura del nombre lleva en cada recorrido una comprobación negativa sin `aria-label`. Los registros nuevos corrigieron la medición puntual: el foco sí se pierde, de forma intermitente (2 de 20 activaciones en Edge 153 y 0 de 6 en Electron 44). El mantenedor decidió entonces comentarlo en [#149](https://github.com/IgnacioBarEsp/project-engineering-os/issues/149#issuecomment-5744136052) ([decisiones](maintainer-decisions.md), fila 10, que sustituye a la 7). |
| 6 | Minor | El assessment decía `clean` con dos detalles previos sin dueño, y se capturó antes de esta pasada. | Por decisión del mantenedor (fila 8), los dos detalles se comentaron con evidencia en [#146](https://github.com/IgnacioBarEsp/project-engineering-os/issues/146#issuecomment-5744066763). El motor de deuda trata el assessment capturado como evidencia inmutable. Su texto describe el estado cuando se capturó: en ese momento no tenían issue, y los Minors de las rondas 1 y 2 ya estaban corregidos. Los de esta pasada también se corrigieron antes de archivar. Queda superada su frase sobre el foco («no se reprodujo»): lo corrigen la [validación](validation.md) y la fila 10 de decisiones. |
| 7 | Info | Las tareas 6.2 y 6.3 estaban marcadas sin archive ni PR en ese commit. | La línea final de [tasks](../tasks.md) explica que se cumplen con el commit que archiva el change y con el PR #169. |
| 8 | Info | TLDR, la decisión 6 y «Open Questions» del diseño no recogían la ronda 2. | Corregido en los tres. |
| 9 | Info | El workflow de release no prueba la copia en la aplicación instalada. | El mantenedor autorizó probarla tras publicar (fila 9): descargar el instalador de la release, comprobar su SHA-256, instalarlo por usuario, pasar la prueba de copia y desinstalarlo. El resultado queda en el PR. |
| 10 | Info | `artifact-links.json` no incluía PROJECT_STATUS, las notas ni la cadena de dos saltos. | Corregido: el registro regenerado antes de archivar los incluye. |
