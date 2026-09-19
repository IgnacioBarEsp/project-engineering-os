# Inspección visual de las siete capturas

Autoría: agente de esta sesión (opencode), el 19 de septiembre de 2026. No es una revisión humana: ninguna
persona abrió la aplicación ni comparó las imágenes. El método fue abrir cada PNG generado y compararlo con la
pantalla que `apps/companion/ui/app.mjs` renderiza en el commit `766d671`, verificando encabezado, ruta de
pantalla, indicador de pasos y controles visibles, y que ninguna imagen contenga elementos de los mocks de
Stitch ni datos de la máquina.

| Imagen | Pantalla observada | Observación |
| --- | --- | --- |
| `docs/assets/companion/home-companion.png` | Inicio: «Dale a tu IA un buen punto de partida.», tarjetas Crear nuevo proyecto y Abrir carpeta existente | Ventana real con cabecera, píldora «Entorno listo» y barra de navegación. Sin controles inventados. |
| `docs/assets/companion-current-home.png` | La misma pantalla de Inicio, segunda captura de la misma ejecución | Difiere en bytes de la anterior por el instante de captura; mismo contenido. |
| `docs/assets/companion/paso-1-perfil.png` | Paso 1: «Empecemos por lo que quieres lograr.» con nombre y objetivo de ejemplo escritos y perfil seleccionado | El indicador marca 01 Tu proyecto. La barra inferior muestra Inicio y «Elegir carpeta →». |
| `docs/assets/companion/paso-2-delimitacion.png` | Delimitación: «¿Cuál es el enfoque principal de tu proyecto?» con la primera tarjeta seleccionada | La tarjeta de carpeta muestra la ruta neutra `C:\Users\Public\Documents\peos-captura-d8b28cb0`: sin nombre de cuenta. |
| `docs/assets/companion/paso-3-vision.png` | Visión: «Cuéntanos en tus palabras: ¿qué quieres lograr?» con el texto del objetivo y contador de 14 palabras | Editor con modos y sugerencias visibles; barra inferior con Volver y «Paso 4: Instalación →». |
| `docs/assets/companion/paso-4-instalacion.png` | Instalación: «Tu espacio está listo. ¿Cómo prefieres equiparlo?» con las dos tarjetas | Las dos opciones y sus botones coinciden con el código; sin telemetría ni métricas inventadas. |
| `docs/assets/companion/proyecto-listo-activacion.png` | Pantalla final: «¡Tu proyecto está listo para cobrar vida!» con ruta, Copiar ruta y el Prompt Maestro | La ruta y el prompt muestran la carpeta pública neutra; el texto del prompt coincide con el modo IA del código. |

Ninguna imagen muestra los controles que solo existían en los mocks («Telemetría & Logs», «V8 Runtime
Online», «bundle_size: 142MB», «Target: macOS/arm64», «100% determinista»). Los defectos cosméticos conocidos
de la ventana real (estilos en línea bloqueados por la CSP y cabecera a anchos menores) están registrados en
#144; en estas capturas, a 1164 × 755 px CSS, no se observó rotura de composición.

El registro de ejecución con versiones, ventana, consola y hallazgos está en
[capture-run.json](captures/capture-run.json): 7 imágenes, 0 hallazgos, 0 errores de consola.
