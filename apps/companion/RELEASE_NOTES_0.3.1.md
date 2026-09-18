# Companion 0.3.1

Esta versión culmina la transformación visual y de experiencia de usuario al estándar **Obsidian Precision Studio / Stitch**, asegurando que la interfaz real de la aplicación de escritorio y su ejecutable reflejen fielmente el diseño moderno de alta fidelidad:

- **Paleta visual Obsidian Precision Studio / Stitch en modo oscuro nativo**: fondo profundo `#0B0F19`, superficies `#121826`, bordes translúcidos de precisión y acentos luminosos en índigo (`#6366F1`), cian (`#06B6D4`) y esmeralda (`#10B981`).
- **Barra de navegación superior tipo Topbar**: reemplazo del layout antiguo con una cabecera moderna y responsiva dotada de indicadores de ventana estilo macOS, isotipo vectorial de ingeniería, badge de Companion, selector de secciones con iluminación reactiva y badge de estado de entorno local.
- **Pantalla de Inicio con doble tarjeta de acción**:
  1. *Crear nuevo proyecto*: acceso directo asistido con línea superior en gradiente, checklist de valor y botón principal de preparación.
  2. *Abrir carpeta existente*: acceso rápido al selector de directorios o arrastre de carpetas locales.
- **Tres pilares de ingeniería local**: indicadores destacados para *Totalmente local* (sin telemetría), *Compatible con tu IA* (Claude, ChatGPT, Cursor, etc.) y *Estructura limpia* (sin dependencias redundantes).
- **Iconografía e icono nativo multipropósito de Windows (`icon.ico`)**: regenerado por completo en 16x16, 32x32, 48x48 y 256x256 con los tokens tonales oscuros de Obsidian Precision Studio.
- **Arranque fluido y sin parpadeo**: ventana de Electron configurada con fondo `#0B0F19` para una transición limpia y consistente desde el lanzamiento del instalador.
- **Accesibilidad y contratos rigurosos**: validación en 38 pantallas con 0 hallazgos de accesibilidad (contraste WCAG AAA >= 4.5:1 / 3.0:1, orden estricto de encabezados h1/h2/h3 y cero vocabulario prohibido), más la suite de 40 mutaciones adversarias detectadas al 100%.

El instalador es para Windows x64, se instala por usuario y no tiene certificado de editor. Windows puede
advertir al abrirlo; el manifiesto y `SHA256SUMS` permiten comprobar el archivo descargado, pero no
sustituyen una firma. No hay actualización automática, cuenta propia ni servicio de inferencia operado por
el proyecto.

Esta release conserva el núcleo `create-project-engineering-os` 0.5.0. No publica una nueva versión npm del
núcleo y no reemplaza los assets ni los tags anteriores (`0.1.0`, `0.2.0`, `0.2.1`, `0.2.2`, `0.2.3`, `0.3.0`).
