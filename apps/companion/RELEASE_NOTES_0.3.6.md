# Companion 0.3.6

Corrige el idioma del asistente de instalación de [#168](https://github.com/IgnacioBarEsp/project-engineering-os/issues/168). La versión 0.3.5 declaró español solo para los metadatos del ejecutable: en un Windows en inglés, las páginas estándar de NSIS seguían en inglés. Esta versión compila esas páginas en español y da a la página propia del acceso directo un encabezado español.

Conserva las dos opciones asistidas: acceso directo del escritorio y apertura de la aplicación al finalizar, ambas marcadas por defecto. La instalación silenciosa sigue creando el enlace sin abrir la aplicación. El instalador es para Windows x64, no tiene certificado de editor, es por usuario y conserva proyectos, historial y runtimes.

La publicación verifica en Windows la instalación, actualización desde 0.1.0 y desinstalación. El arnés aísla los datos de la app, mantiene el perfil real del runner para comprobar el acceso directo del Escritorio y fija el núcleo `create-project-engineering-os` 0.5.0. Esta entrega no reemplaza los assets ni los tags anteriores.
