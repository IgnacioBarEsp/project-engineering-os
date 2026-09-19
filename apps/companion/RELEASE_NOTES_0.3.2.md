# Companion 0.3.2

Corrige 0.3.1, con la que no se podía terminar el asistente en la aplicación instalada:
[issue #142](https://github.com/IgnacioBarEsp/project-engineering-os/issues/142).

## Qué se corrige

- **La barra de acciones del asistente ya no tapa contenido.** En 0.3.1 la barra quedaba anclada al fondo
  del contenido animado y no al de la ventana. Tapaba «¿Cuánta guía prefieres?», la última tarjeta de
  Delimitación, las sugerencias de Visión y los dos botones de Instalación, y desplazar la página no los
  descubría. Ahora la barra va después del contenido y se queda en el borde inferior de la ventana mientras
  queda contenido por debajo. Recorriendo con el tabulador el primer paso, que es el más largo, ningún
  campo queda oculto detrás de ella.
- **«Copiar ruta» y «Copiar Prompt Maestro» copian en la aplicación instalada.** En 0.3.1 le pedían el
  portapapeles a la ventana, que no tiene permiso para escribirlo, y el rechazo se ocultaba. Ahora copia el
  proceso principal de la aplicación, con un límite de tamaño, y la confirmación aparece solo cuando el texto
  ya está en el portapapeles. Si la copia falla, la pantalla dice por qué.
- **Una visión de varias líneas ya no detiene la instalación.** En 0.3.1, usar una sugerencia o escribir un
  salto de línea en Visión hacía fallar la instalación con `GOAL_INVALID`. La visión conserva sus párrafos
  en `PROJECT_VISION.md` y el objetivo se guarda en una sola línea.
- «Preparar proyecto» sigue marcado en Instalación y en la pantalla final.
- El editor de visión tiene nombre para los lectores de pantalla.

## Cómo se comprobó

- El asistente se recorrió con la animación de entrada activa y con movimiento reducido, en ventanas de
  1180 × 820, 1160 × 810 y 1040 × 700, con las dos formas de instalar. En cada pantalla se pulsó cada
  control en su centro y se llegó a la pantalla final. La comprobación anterior solo usaba movimiento
  reducido, que es por lo que no vio el defecto.
- En Electron, con el proceso principal y el preload de esta versión, el texto de cada botón de copiar se
  leyó del portapapeles del sistema y coincide con el que muestra la pantalla.

## Lo que 0.3.2 no cambia

- Las dos formas de instalar hacen lo mismo: guardan las elecciones y escriben `PROJECT_VISION.md`.
  «Instalación rápida» dice que instala dependencias base y su prompt afirma que quedaron preparadas, pero ni
  0.3.1 ni 0.3.2 instalan ninguna. Que cada vía haga su propio trabajo es el
  [issue #147](https://github.com/IgnacioBarEsp/project-engineering-os/issues/147).
- Con 1040 px de ancho, la navegación de la cabecera parte palabras. Es parte del layout que rehace el
  [issue #144](https://github.com/IgnacioBarEsp/project-engineering-os/issues/144).
- Las capturas de la documentación son del prototipo de diseño, no de la aplicación. Las sustituye el
  [issue #143](https://github.com/IgnacioBarEsp/project-engineering-os/issues/143).

## Instalador

El instalador es para Windows x64, se instala por usuario y no tiene certificado de editor. Windows puede
advertir al abrirlo; el manifiesto y `SHA256SUMS` permiten comprobar el archivo descargado, pero no
sustituyen una firma. No hay actualización automática, cuenta propia ni servicio de inferencia operado por
el proyecto.

Esta release conserva el núcleo `create-project-engineering-os` 0.5.0. No publica una nueva versión npm del
núcleo y no reemplaza los assets ni los tags anteriores (`0.1.0`, `0.2.0`, `0.2.1`, `0.2.2`, `0.2.3`, `0.3.0`,
`0.3.1`).
