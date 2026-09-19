# Companion 0.3.2

Corrige 0.3.1, con la que no se podía terminar el asistente en la aplicación instalada:
[issue #142](https://github.com/IgnacioBarEsp/project-engineering-os/issues/142).

## Qué se corrige

- **La barra de acciones del asistente ya no tapa contenido.** En 0.3.1 la barra quedaba anclada al fondo
  del contenido animado y no al de la ventana. Tapaba «¿Cuánta guía prefieres?», la última tarjeta de
  Delimitación, las sugerencias de Visión y los dos botones de Instalación, y desplazar la página no los
  descubría. Ahora la barra va después del contenido y se queda en el borde inferior de la ventana mientras
  queda contenido por debajo. En las ventanas pequeñas, de hasta 500 px de alto, como la mínima o la de por
  defecto con zoom al 200 %, va al final del contenido. Recorriendo con el tabulador el primer paso, que es el
  más largo, ningún campo queda oculto detrás de ella.
- **«Copiar ruta» y «Copiar Prompt Maestro» copian en la aplicación instalada.** En 0.3.1 le pedían el
  portapapeles a la ventana, que no tiene permiso para escribirlo, y el rechazo se ocultaba. Ahora copia el
  proceso principal de la aplicación, con un límite de tamaño, y la confirmación aparece solo cuando el texto
  ya está en el portapapeles. Si la copia falla, la pantalla dice por qué.
- **Una sugerencia o un salto de línea en Visión ya no detienen la instalación.** En 0.3.1 la hacían fallar
  con `GOAL_INVALID`. La visión conserva sus párrafos en `PROJECT_VISION.md` y el objetivo se guarda en una
  sola línea. Si la visión queda sin texto, se conserva el objetivo del primer paso.
- **El prompt de «Instalación rápida» ya no afirma dependencias instaladas.** En 0.3.1 le decía a tu IA
  que las dependencias base ya estaban preparadas en tu equipo. Ahora dice lo que ocurrió: la carpeta está
  preparada, `PROJECT_VISION.md` escrito y no se instaló nada.
- «Preparar proyecto» sigue marcado en Instalación y en la pantalla final.
- El editor de visión tiene nombre para los lectores de pantalla.

## Cómo se comprobó

- El asistente se recorrió hasta la pantalla final con la animación de entrada activa y con movimiento
  reducido, con las dos formas de instalar. Se usaron ventanas de 1180 × 820, 1160 × 810 y 1040 × 700 y las
  dos ventanas pequeñas reales de la aplicación: la mínima y la de por defecto con zoom al 200 %. En cada
  pantalla se comprobó que cada control, una vez a la vista, recibe el clic en su centro y no la barra. Se
  pulsaron los botones que avanzan el asistente y los de copiar. La comprobación anterior no vio el
  defecto por dos motivos: usaba solo movimiento reducido y, después de los dos primeros pasos, seguía por
  las pantallas de revisión heredadas en lugar de Delimitación, Visión e Instalación.
- En Electron, con el proceso principal y el preload de esta versión, el texto de cada botón de copiar se
  leyó del portapapeles del sistema y coincide con el que muestra la pantalla. Se comprobó ejecutando el
  código y ejecutando la aplicación empaquetada.

## Lo que 0.3.2 no cambia

- Las dos formas de instalar hacen lo mismo: guardan las elecciones y escriben `PROJECT_VISION.md`. La
  tarjeta de «Instalación rápida» sigue diciendo que instala dependencias base, y ni 0.3.1 ni 0.3.2 instalan
  ninguna. Que cada vía haga su propio trabajo es el
  [issue #147](https://github.com/IgnacioBarEsp/project-engineering-os/issues/147).
- Con 1040 px de ancho, la navegación de la cabecera parte palabras. Además, en la aplicación instalada no
  se aplican cuatro separaciones de Delimitación, Visión y la pantalla final, porque la política de seguridad
  de la ventana bloquea los estilos en línea que las definen. Las dos cosas son parte del renderer que rehace
  el [issue #144](https://github.com/IgnacioBarEsp/project-engineering-os/issues/144).
- Al activar con el teclado una acción, como copiar, el foco a veces se pierde y vuelve al principio de la
  página. Se ha visto en el navegador de pruebas y no en la aplicación, pero la causa está en el código. Es
  parte del [issue #149](https://github.com/IgnacioBarEsp/project-engineering-os/issues/149).
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
