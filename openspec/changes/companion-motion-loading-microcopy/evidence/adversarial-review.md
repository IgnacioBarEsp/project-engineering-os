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

## 2026-09-29 · revisión propia de beneficios y fondo de Inicio

Esta revisión sigue siendo del implementador, no independiente. Se comprobó el alcance de las tres
frases contra el flujo y las capacidades existentes: OpenSpec solo se menciona para software, buscar
archivos no se presenta como mejor calidad de una IA y las instrucciones no son una guía automática de
un chat externo. El párrafo principal y el formulario permanecen intactos. Cada término nuevo abre su
definición; los SVG son locales y sus tres fragmentos están declarados explícitamente. No se amplía CSP,
IPC, permisos, acceso a red o escrituras sobre proyectos.

Riesgos específicos: contraste sobre imágenes CSS y hover, colores literales incompatibles con #150,
decoración interceptando controles, movimiento persistente y scroll vacío al final. Se añadieron límites
de contraste compuestos, tokens de color, medición de pseudo-elementos/loop/reduced y extremo del scroll.
El probe detectó y corrigió iconos bloqueados por la allowlist y 69.39 px de hueco; la última ejecución
nativa conserva 0–0.5 px extra en las ocho celdas, sin cambiar el umbral. La matriz amplia de navegador
pasó antes de la última extracción de tokens y corrección del hueco; la ejecución nativa, el ensayo de
movimiento y los tests focales corresponden a esos ajustes finales. No se inventa un pase de CI o de
la matriz completa de #150 para estos cambios locales. No se difiere una deficiencia técnica conocida;
aceptación visual, lectura de la copia final y revisión independiente siguen como gates reales.

## 2026-09-29 · revisión propia del fondo compartido y copia revisada

No es revisión independiente. La nueva frase de OpenSpec se limita a cambios documentados en software;
no promete capturar toda modificación de una IA. Los otros beneficios corresponden al flujo gráfico y
a recuperación con guardas de edición, ya cubiertos por las pruebas de servicio. No cambia lógica,
IPC, permisos, formatos ni dependencias. Los iconos y estilos siguen locales y la CSP permanece intacta.

La excepción ambiental solo anima opacidad en un pseudo-elemento del body. No hay JS por frame, blur,
transform del contenedor ni recreación por render. No se afirma una medición de consumo o frame rate.
Riesgos concretos: bucle colado en controles, recortes, interceptación de clics, reduced ignorado,
contraste dependiente de la fase y harness bloqueado esperando un infinito. Se acota el origen exacto,
duración y propiedades, y se conservan los límites de los controles. Cuatro mutaciones nativas se
detectaron por sus propiedades (no por timeout); la regla reducida, ocho celdas de tamaños/movimiento,
misma instancia entre rutas y los siete controles en ambos extremos pasaron. El cálculo de contraste
abarca el máximo de todas las capas, no solo la instantánea elegida para la captura.

Los fallos iniciales fueron del comprobador: selector ambiguo, mutación inline bloqueada por CSP y
hit-testing antes de terminar la instantánea de View Transitions. Se corrigieron en el harness;
no se relajaron CSP, duraciones ni alcanzabilidad. Companion 214/214, raíz 391/391, la matriz UI completa
20/120/1360/40 y el ensayo de movimiento finalizaron en código 0 sobre el mismo renderer.
La integración y verificación nativa amplia de la rama apilada #150 no se atribuyen a esos pases.
Aceptación visual, lectura final, exportación y revisión independiente siguen abiertas.

## 2026-09-30 · revisión propia del refinamiento aprobado

El mantenedor aprobó la base de fondo global y beneficios, y pidió el refinamiento de texto e iluminación.
La revisión propia sigue la guía engineering:code-review y no es independiente. Se comprobó que los
brillos no añaden handlers, escrituras, red ni dependencia: título existente y pseudo-elemento sin
puntero del primary habilitado, una pasada de 900 ms. El texto del botón y su geometría no se animan.
Estado/navegación siguen con sus límites originales; no hay bucle nuevo ni énfasis en danger.

El máximo de iluminación del fondo primario conserva contraste AA. El probe nativo verifica hover,
foco visible de teclado, outline real, disabled/reduced y desaparición al terminar. Seis mutaciones
detectadas, incluido reusar el nombre del brillo en una tarjeta y repetir el brillo de un botón.
Quitar el subtítulo no elimina campos; simplificar la descripción de Investigación evita dejar
fuentes sin su definición ni anidar un botón de definición dentro del label de un radio.
No se difiere un defecto técnico conocido de este ajuste. La integración del harness de #150,
lectura final, exportación y revisión independiente siguen siendo pasos pendientes, no pases propios.
