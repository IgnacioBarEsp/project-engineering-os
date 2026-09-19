# Inspección visual de las siete capturas

Autoría: dos agentes, el 19 de septiembre de 2026. La primera pasada la hizo el agente que generó las capturas
(opencode); la segunda, el agente que cerró el change (Claude Opus 5 en Claude Code), que abrió seis de las
siete imágenes y corrigió dos observaciones de la primera. No es una revisión humana: ninguna persona abrió la
aplicación ni comparó las imágenes.

El método fue abrir cada PNG generado y compararlo con la pantalla que `apps/companion/ui/app.mjs` renderiza en
el commit `766d671`, verificando encabezado, ruta de pantalla, indicador de pasos y controles visibles, y que
ninguna imagen contenga elementos de los mocks de Stitch ni datos de la máquina.

| Imagen | Pantalla observada | Observación |
| --- | --- | --- |
| `docs/assets/companion/home-companion.png` | Inicio: «Dale a tu IA un buen punto de partida.», tarjetas Crear nuevo proyecto y Abrir carpeta existente | Ventana real con cabecera, píldora «Entorno listo» y barra de navegación. Sin controles inventados. |
| `docs/assets/companion-current-home.png` | La misma pantalla de Inicio, segunda captura de la misma ejecución | Difiere en bytes de la anterior por el instante de captura; mismo contenido. |
| `docs/assets/companion/paso-1-perfil.png` | Paso 1: «Empecemos por lo que quieres lograr.» con nombre y objetivo de ejemplo escritos | El indicador marca 01 Tu proyecto. El perfil es el que la aplicación trae por defecto, «Investigador/a»: el recorrido no lo cambió. La barra inferior muestra Inicio y «Elegir carpeta →». |
| `docs/assets/companion/paso-2-delimitacion.png` | Delimitación: «¿Cuál es el enfoque principal de tu proyecto?» con la primera tarjeta seleccionada | El indicador marca 02 Carpeta. La tarjeta de la carpeta muestra la ruta pública creada para la captura, sin nombre de cuenta. |
| `docs/assets/companion/paso-3-vision.png` | Visión: «Cuéntanos en tus palabras: ¿qué quieres lograr?» con el texto del objetivo y contador de 14 palabras | El indicador marca 03 Preparación. Se ven los modos del editor y la barra inferior con Volver y «Paso 4: Instalación →». Las sugerencias quedan debajo del editor, fuera del encuadre. |
| `docs/assets/companion/paso-4-instalacion.png` | Instalación: «Tu espacio está listo. ¿Cómo prefieres equiparlo?» con las dos tarjetas | El indicador marca 04 Archivos. Las dos opciones y sus botones coinciden con el código; sin telemetría ni métricas inventadas. La tarjeta rápida sigue diciendo que instala dependencias, que es #147. |
| `docs/assets/companion/proyecto-listo-activacion.png` | Pantalla final: «¡Tu proyecto está listo para cobrar vida!» con ruta, Copiar ruta y el Prompt Maestro | La ruta y el prompt muestran la carpeta pública neutra; el texto del prompt coincide con el modo IA del código. «Carpeta:» aparece pegado a la ruta: es el estilo en línea que la CSP bloquea, anotado en #144. |

Ninguna imagen muestra los controles que solo existían en los mocks («Telemetría & Logs», «V8 Runtime
Online», «bundle_size: 142MB», «Target: macOS/arm64», «100% determinista»).

De los defectos cosméticos conocidos de la ventana real, en estas capturas se ve el estilo bloqueado por la
CSP en la pantalla final, y la galería lo dice. La cabecera no parte palabras a 1164 px; eso ocurre a anchos
menores. Los dos están anotados en #144.

El registro de ejecución con versiones, ventana, consola y hallazgos está en
[capture-run.json](captures/capture-run.json): 7 imágenes, 0 hallazgos, 7 errores de consola, todos de la CSP
por esos estilos en línea.
