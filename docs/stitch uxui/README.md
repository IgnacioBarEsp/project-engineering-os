# Prototipo de diseño, no capturas del producto

Esta carpeta guarda el prototipo de Google Stitch que sirvió de guía visual para la interfaz de Companion.
Cada subcarpeta trae la pantalla del prototipo (`screen.png`), su HTML (`code.html`) y sus notas de diseño.

**Nada de lo que hay aquí es una captura de la aplicación.** El prototipo muestra controles que la aplicación
no tiene, como «Telemetría & Logs», «V8 Runtime Online» o un tamaño de paquete, y estados que nunca se
implementaron. Se conserva como evidencia de diseño y como referencia mientras se rehace el renderer
([issue #144](https://github.com/IgnacioBarEsp/project-engineering-os/issues/144)).

Las capturas del producto real, con su procedencia verificable, están en
[docs/companion/SCREENSHOTS.md](../companion/SCREENSHOTS.md). `npm run check` rechaza cualquier imagen
publicada como captura que sea idéntica a una de esta carpeta: fue lo que ocurrió hasta el
[issue #143](https://github.com/IgnacioBarEsp/project-engineering-os/issues/143).

El prototipo es una guía, no un contrato: el diseño puede apartarse de él cuando haya una razón.
