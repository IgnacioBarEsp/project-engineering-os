# Decisiones del mantenedor durante el apply

Tomadas por el mantenedor, IgnacioBarEsp, el 19 de septiembre de 2026 en esta sesión, al responder cuatro
preguntas del agente. Se citan tal como se respondieron.

| Pregunta | Respuesta | Consecuencia |
| --- | --- | --- |
| ¿Se lanza la prueba final en Electron, que abre una ventana y usa el portapapeles del sistema? | «Sí y ya puedes abrirla cuando quieras, ya no estaré usando la PC» | La prueba nativa corre sobre el commit final. Guarda el texto previo del portapapeles, lo restaura al terminar y no lo registra. |
| ¿Qué se hace cuando la CI del PR esté en verde? (tarea 5.3) | «Integrar y publicar 0.3.2» | Delegación explícita de integración y publicación para este alcance, según [CONTRIBUTING.md](../../../../CONTRIBUTING.md). Tras la CI requerida en verde: merge del PR, tag anotado `companion-v0.3.2`, workflow existente y comparación de assets canónicos. El enlace de descarga cambia solo después, con los assets comprobados. #168 saldrá como 0.3.3. |
| ¿Se corrige en este hotfix la frase del prompt de «Instalación rápida» que afirma dependencias aprovisionadas? | «Sí, solo esa frase» | Nueva decisión 7 del [diseño](../design.md) y escenario en la spec antes de implementarla. Las tarjetas de instalación no cambian y siguen siendo del issue #147. |
| ¿Cómo se registran los dos defectos previos vistos fuera de alcance? | «Comentarlos en #144 y #149» | La cabecera que parte palabras a 1040 px se comenta en #144 y el foco que cae al `body` tras copiar, en #149, con su evidencia. No entran al registro de deuda, que está en 4 de 5 unidades y se pausaría. |

La revisión adversarial de este change la hace un agente, no el mantenedor ni una persona independiente, y
así consta en su registro.
