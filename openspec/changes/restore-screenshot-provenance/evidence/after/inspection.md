# Inspección visual de las siete capturas

Autoría: dos agentes, el 19 de septiembre de 2026. La primera pasada la hizo el agente que generó las capturas
(opencode); la segunda y la tercera, el agente que cerró el change (Claude Opus 5 en Claude Code). No es una
revisión humana: ninguna persona abrió la aplicación ni comparó las imágenes.

La tercera pasada abrió las siete imágenes republicadas. Tras la revisión adversarial se endureció el
generador, así que las capturas se rehicieron desde `d744c47` para que su registro siguiera describiendo el
código que las produjo. El contenido es el mismo que en la ejecución anterior —`apps/companion/` no cambió
entre `766d671` y `d744c47`—; cambian los bytes, el instante y el sufijo aleatorio de la carpeta de ejemplo.

El método fue abrir cada PNG publicado y compararlo con la pantalla que `apps/companion/ui/app.mjs` renderiza
en ese commit, verificando encabezado, ruta de pantalla, indicador de pasos y controles visibles, y que
ninguna imagen contenga elementos de los mocks de Stitch ni datos de la máquina.

| Imagen | Pantalla observada | Observación |
| --- | --- | --- |
| `docs/assets/companion/home-companion.png` | Inicio: «Dale a tu IA un buen punto de partida.», tarjetas Crear nuevo proyecto y Abrir carpeta existente | Ventana real con cabecera, píldora «Entorno listo» y barra de navegación, con «Inicio» marcado. Sin controles inventados. |
| `docs/assets/companion-current-home.png` | La misma pantalla de Inicio, segunda captura de la misma ejecución | Difiere en bytes de la anterior por el instante de captura; mismo contenido. |
| `docs/assets/companion/paso-1-perfil.png` | Paso 1: «Empecemos por lo que quieres lograr.» con nombre y objetivo de ejemplo escritos | El indicador marca 01 Tu proyecto. El rol es el que la aplicación trae por defecto, «Investigador/a»: el recorrido no lo cambió. «¿Qué vas a hacer?» empieza justo en el borde inferior y sus tarjetas quedan cortadas; la tecnología, la IA y «¿Cuánta guía prefieres?» quedan fuera del encuadre, y la galería lo dice. |
| `docs/assets/companion/paso-2-delimitacion.png` | Delimitación: «¿Cuál es el enfoque principal de tu proyecto?» con la primera tarjeta seleccionada | El indicador marca 02 Carpeta. La tarjeta de la carpeta muestra la ruta pública creada para la captura, sin nombre de cuenta. El subtítulo pide elegir «el subtipo para Investigación» y las tarjetas que ofrece son las de software, con la primera ya marcada: es el defecto de #145, visible en el producto, y la galería lo nombra. |
| `docs/assets/companion/paso-3-vision.png` | Visión: «Cuéntanos en tus palabras: ¿qué quieres lograr?» con el texto del objetivo y contador de 14 palabras | El indicador marca 03 Preparación. Se ven los modos del editor, «Asistencia activa» y la barra inferior con Volver y «Paso 4: Instalación →». Las sugerencias quedan debajo del editor, fuera del encuadre. |
| `docs/assets/companion/paso-4-instalacion.png` | Instalación: «Tu espacio está listo. ¿Cómo prefieres equiparlo?» con las dos tarjetas | El indicador marca 04 Archivos. Las dos opciones y sus botones coinciden con el código; sin telemetría ni métricas inventadas. La tarjeta rápida sigue diciendo que instala dependencias base, que es #147. |
| `docs/assets/companion/proyecto-listo-activacion.png` | Pantalla final: «¡Tu proyecto está listo para cobrar vida!» con ruta, Copiar ruta y el Prompt Maestro | La ruta y el prompt muestran la carpeta pública neutra; el texto del prompt coincide con el modo IA del código. «Carpeta:» aparece pegado a la ruta: es el estilo en línea que la CSP bloquea, anotado en #144. |

Ninguna imagen muestra los controles que solo existían en los mocks («Telemetría & Logs», «V8 Runtime
Online», «bundle_size: 142MB», «Target: macOS/arm64», «100% determinista»).

De los defectos conocidos de la ventana real, en estas capturas se ven el estilo bloqueado por la CSP en la
pantalla final (#144) y los subtipos que no corresponden al perfil en el paso 2 (#145). La cabecera no parte
palabras a 1164 px; eso ocurre a anchos menores, y también está en #144.

El registro de ejecución con versiones, ventana, consola y hallazgos está en
[capture-run.json](captures/capture-run.json): 7 imágenes capturadas, 7 publicadas, 0 hallazgos y 7 errores de
consola, todos de la CSP por esos estilos en línea.
