# Revisión propia #149

Autor: implementador, usando engineering:code-review y depuración estructurada. No es revisión independiente.

- Correctitud: transición callback-first, generaciones obsoletas ignoradas, misma ruta síncrona; finished/skip antes de interactuar. Fallback y reduced sin API; errores de actualización siguen visibles. Foco posterior resuelto al terminar.
- Seguridad: módulos en allowlist exacta; texto con textContent, CSP intacta, ningún canal nuevo o dato de consumidor ejecutado.
- Recursos: dos avisos máximo, temporizadores cancelados al idle/cambio de etapa, sin suscripciones adicionales a progreso por render; sin transform persistente.
- Regresiones: prueba amplia reveló interactividad prematura y medición de nodo oculto; ambas corregidas y documentadas en validation.md. Contrato 46/46 sin excepciones como detección.
- Deuda: ninguna deficiencia técnica conocida pospuesta dentro de #149. La lectura humana y revisión independiente son gates pendientes explícitos, no evidencia de éxito ni deuda ocultada.

Veredicto propio: implementación técnicamente lista para revisión, no autorizada para archivo por falta de gates reales.

## 2026-09-27 · revisión propia del ajuste de lenguaje

Se comparó el texto nuevo con el comportamiento real: la carpeta se elige en el paso 1, el plan se revisa antes de escribir, y la IA externa la aporta la persona. No se promete chat integrado ni que la IA haya leído la carpeta. Se inspeccionaron el primer paso a 1180×820 y la alcanzabilidad a 582×377. La prueba adversarial de vocabulario detectó la pérdida inicial del enlace «fuentes»; se corrigió y se repitieron el recorrido completo y las 46 mutaciones sin fallas. No hay dependencia, permiso, formato, escritura ni deuda técnica nuevos. Esta revisión es del implementador; no sustituye revisión independiente ni aceptación humana.

El primer intento de CI reveló una diferencia de métricas de texto en Ubuntu que la captura Windows no había descubierto: scroll en 1180×820. Se acortó el párrafo y se mantuvo el gate de no-scroll; no se cambió el umbral de la prueba. La CI del head nuevo debe demostrar el resultado entre plataformas.

El segundo intento redujo la desviación de 54 a 13 px y localizó el resto en el estado con carpeta seleccionada. Los márgenes se ajustaron solo cuando aparece el formulario del paso 1; los demás pasos mantienen su espaciado. Sigue pendiente el pase entre plataformas del siguiente head.

La preferencia posterior del mantenedor revierte la explicación larga, no las garantías del flujo. El rótulo nuevo identifica el propósito sin prometer chat integrado, automatismo o acceso a los archivos por una IA. El texto original conserva el enlace «fuentes»; el resto del formulario no cambia. El riesgo concreto de regresión es la altura extra del rótulo en distintas tipografías, por lo que se mantiene el gate sin scroll en 1180×820 para formulario vacío y con carpeta elegida. La revisión visual y las pruebas automáticas no sustituyen la aceptación humana pendiente.

## 2026-09-29 · revisión propia de Inicio y Ayuda

La primera lectura en frío real refutó la comprensión de Inicio y la visibilidad de la carpeta. Se preservó el veredicto negativo y se cambió la jerarquía, sin modificar la lógica de preparación. Tras dos preferencias adicionales del mantenedor, Inicio muestra un titular específico y una sola descripción breve; la carpeta del paso 1 está marcada como elección con icono. Las explicaciones que antes competían con la acción principal se movieron a Ayuda en tres `details` nativos. Riesgo nuevo: que las limitaciones de descarga y privacidad queden escondidas o que un despliegue no funcione con teclado. El enlace Ayuda y el acceso de privacidad siguen en la barra superior; `test:ui` abre y cierra los tres desplegables, y su comprobación de accesibilidad, contraste y vocabulario no reportó hallazgos. El contrato adversarial 46/46 y la prueba de texto que rechaza beneficios no medidos siguen activos. No se eliminó la advertencia de que no se descarga un modelo de IA.

El shell nativo renderizó Inicio/Ayuda sin errores, pero el probe no verifica el cierre normal de la app: Playwright se quedó esperando al final y el proceso aislado de prueba se termina explícitamente para limpiarlo. No se presenta esto como prueba de un defecto del cierre del producto ni como pase de esa ruta; #150 deberá mantener explícito el alcance de sus pruebas nativas. Los gates de lectura nueva, aceptación visual final y revisión independiente siguen pendientes; ninguna captura propia los sustituye.

La primera matriz nativa completa de #150 sobre el merge encontró `dead-scroll:34` en Inicio a 480×540 pese al pase del shell y navegador. Se retiró solo el margen inferior de las acciones, que había perdido su propósito al quitar los paneles. No se redujo el umbral ni se omitió esa ventana; hace falta repetir Electron sobre el head corregido.
