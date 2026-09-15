# Prepara tu primer proyecto

Empieza con la carpeta que ya tienes, aunque aún esté vacía. Companion te ayuda a preparar el contexto
y una forma de continuar con tu IA. No necesitas conocer los términos del sistema para dar el primer paso.

**Descarga disponible:** [Companion 0.1.0 para Windows x64](https://github.com/IgnacioBarEsp/project-engineering-os/releases/tag/companion-v0.1.0).
Las mejoras de navegación y guía descritas como «código actual» aún esperan un instalador nuevo.
[Estado y versiones](PROJECT_STATUS.md).

## 1. Instala y abre Companion

Sigue la [guía de instalación](companion/INSTALLER.md): descarga, comprobación del archivo y advertencia de
editor sin firma. La app se instala para tu usuario. No tienes que instalar Node, Git o npm globalmente.

## 2. Cuéntale qué quieres hacer

Indica el objetivo, tipo de trabajo y la IA que usarás. Puedes preparar investigación, software,
un videojuego, contenido o trabajo general. Tu experiencia ajusta la ayuda; no te impide elegir otro tipo
de proyecto. Si no sabes qué tecnología necesitas, empieza por el objetivo.

## 3. Elige la carpeta y revisa el plan

Selecciona la carpeta desde el diálogo de Windows. Companion muestra qué encontró, qué archivos añadirá
y qué necesita descargar. Si ya hay archivos, revisa cómo se conservarán. Nada se aplica por mirar el plan.

Para investigación, contenido y trabajo general, la preparación básica no requiere herramientas de
desarrollo. Para software o Unity, puedes revisar la preparación de ingeniería y sus descargas.
La [guía del entorno](companion/ENVIRONMENT.md) explica versiones, destinos y recuperación.

## 4. Prepara y comprueba

Acepta el plan que revisaste. Al terminar, comprueba por separado los archivos preparados, el contexto
leído y las herramientas aplicables. Si falta una etapa, sigue su explicación; una carpeta de configuración
por sí sola no demuestra que la herramienta esté funcionando.

Si cambias archivos después, vuelve a comprobar. En el código actual, la lista muestra cuándo se hizo la
última comprobación y qué dejó de coincidir; esa mejora es posterior a la descarga 0.1.0.

## 5. Continúa con tu IA

Revisa las instrucciones o el texto con fuentes antes de copiarlo. Un agente con acceso a archivos y un
chat web trabajan de forma distinta: abrir la página del chat no adjunta la carpeta.

El código actual detecta destinos de escritorio compatibles y ofrece la apertura según lo que realmente
admiten. Si no se puede adjuntar la carpeta, lo explica. La [guía técnica del Companion](companion/DESKTOP.md)
y el [estado de entrega](PROJECT_STATUS.md) distinguen ese código de la release publicada.

## Si algo no sale como esperabas

- **No encuentra un dato:** prueba palabras del documento; revisa los archivos leídos y sus exclusiones.
- **El PDF es una imagen:** necesita OCR, es decir, reconocimiento del texto de la imagen.
- **Cambió la carpeta:** vuelve a revisar y comprobar; no confíes en un resultado anterior.
- **La preparación quedó a medias:** revisa la continuación o recuperación ofrecida. Los cambios tuyos
  posteriores pueden impedir revertir automáticamente y se conservan.
- **Quitaste la app:** tus proyectos e historial se conservan. Las herramientas administradas tienen
  ubicación y ciclo propio; consulta [actualización y desinstalación](companion/INSTALLER.md).

## Para trabajar por cambios

En software, la preparación deja el método para acordar un cambio antes de implementarlo: issue,
spec, tareas, pruebas, revisión y cierre. El agente sigue las instrucciones del proyecto y tú conservas
las decisiones sobre tecnología, permisos y costo. Las [skills y conexiones MCP](TOOL_CATALOG.md)
se revisan según necesidad; no se activa un catálogo entero por preparar la carpeta.

**¿Prefieres automatizar?** La [guía CLI](CLI_GUIDE.md) conserva el recorrido por terminal.
Para el resto, vuelve a tu proyecto en Companion y consulta su siguiente paso.
