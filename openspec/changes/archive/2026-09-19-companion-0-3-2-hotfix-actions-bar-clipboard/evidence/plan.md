# Evidencia requerida después de aprobar la spec

Este documento es un plan. No acredita ejecución de pruebas del producto ni revisión humana.
Las comprobaciones de preparación realizadas están en [pre-apply.md](pre-apply.md).

| Criterio #142 | Evidencia que debe existir tras apply |
| --- | --- |
| Acciones alcanzables, pasos 1–4 | Recorrido de seis pantallas, tres viewports × dos preferencias de movimiento; botones esperados y observados, rectángulos, hit target y clicks normales. |
| Barra y scroll | Pantallas cortas y largas, último campo/sugerencia, ambas tarjetas de instalación, geometría y fondo sin reserva compensatoria. |
| Copia real | Prueba Windows `_electron` con main/preload reales, lectura clipboard desde main, comparación exacta y confirmación para ruta y Prompt Maestro. |
| Navegación | aria-pressed en setup/folder/delimitation/vision/install/finished y al salir; retención de rutas heredadas. |
| Regresión detectada | Mutación sobre copia restaurando fixed bajo .enter; fallo de propiedad identificable, visita y denominador no vacíos. |
| Candidato o release | Identidad 0.3.2, notas, recorrido de instalador aislado y decisión de publicación. Si se publica, workflow y comparación canónica; si se difiere, motivo/owner y nota 0.3.1. |

Pruebas negativas IPC: objeto inesperado, clave adicional, texto ausente/no string/vacío/espacios/NUL;
Unicode y saltos de línea exactos; borde de 32000 bytes, 32001 bytes, borde serializado y exceso de 64000;
adaptador que falla, envelope ok false, rechazo del transporte y emisor/frame/URL incorrectos. Ningún caso
rechazado escribe ni muestra éxito. Exports y guías mantienen verificación de frescura.

Comandos previstos desde la raíz, con salidas guardadas en este directorio:

```sh
npm --prefix apps/companion test
npm --prefix apps/companion run test:ui -- <directorio-evidencia-ui>
npm --prefix apps/companion run evidence:contract -- <directorio-evidencia-contrato>
npm --prefix apps/companion run evidence:native -- <directorio-evidencia-nativa>
npm run check
```

El script nativo debe ampliarse o complementarse según el diseño; no se presupone que el comando actual
ya cubra estos controles. Registrar sus argumentos reales tras implementarlo. No interpretar un SKIP,
una copia inyectada o un recorrido de una ruta histórica como aceptación del recorrido nuevo.

Evidencia manual proporcional de UI: comparación con producto real, teclado y tecnología asistiva,
zoom 200 %, contraste, mínimo soportado y estados de carga/error/conectividad limitada. Indicar quién
la ejecutó y si se observó fuente ejecutada o artefacto instalado. No llamar humana a la revisión del agente.

Evidencia documental: enlaces, coherencia de versiones, procedencia y límites de las afirmaciones;
revisión de claridad y ownership, decisiones de deriva y coordinación con #143. Capturas de aceptación
del hotfix se guardan aquí; no sustituyen la galería pública de ese issue.

Antes del archivo: revisión adversarial desde contexto limpio, rollback probado y assessment de deuda
capturado por CLI. Los hallazgos previos #115/#122 no se declaran resueltos ni se ocultan como N/A.
