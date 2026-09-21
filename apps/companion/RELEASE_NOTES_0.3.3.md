# Companion 0.3.3

Esta versión incorpora las opciones de instalación de [#168](https://github.com/IgnacioBarEsp/project-engineering-os/issues/168).

## Instalador

- El asistente permite decidir si crea el acceso directo de escritorio. La casilla comienza marcada; al
  desmarcarla no queda un enlace del producto.
- La última página ofrece abrir Project Engineering OS al terminar, también marcada inicialmente. La
  instalación silenciosa no abre la aplicación.
- Las páginas estándar y los mensajes propios del asistente se configuran en español.
- El instalador sigue siendo por usuario, no solicita elevación y el desinstalador conserva proyectos,
  historial y runtimes. Solo elimina su propio acceso directo.

## Verificación y límites

La publicación requiere un ciclo protegido de Windows que construye el artefacto, comprueba instalación,
actualización desde 0.1.0, desinstalación y preservación de datos. Las opciones asistidas se verifican en
una observación real separada; una instalación silenciosa no se presenta como interacción humana.

El instalador es Windows x64 y no tiene certificado de editor. Esta versión conserva el núcleo `create-project-engineering-os` 0.5.0 y no reemplaza los assets ni los tags anteriores.
