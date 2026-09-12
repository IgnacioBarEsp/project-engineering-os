# Glosario de Companion

Cada palabra técnica que aparece en la aplicación se puede abrir desde la pantalla donde aparece, y todas
están reunidas en **Ayuda**. Esta página publica las mismas definiciones para quien lee la documentación sin
tener la aplicación abierta.

**Úsalo si:** encontraste una palabra en la interfaz o en una receta y quieres saber qué significa aquí.

Las definiciones se generan desde `apps/companion/ui/glossary.mjs`, que es la única fuente. No edites esta
página a mano: ejecuta `node scripts/render-companion-glossary.mjs`.

## Términos

### Contexto

Un resumen de tu carpeta que tu IA puede leer: qué archivos hay, qué contienen y de dónde salió cada frase.

Se arma en este equipo leyendo tus archivos. No es una copia de tus documentos: guarda fragmentos y la ubicación de cada uno, para que una respuesta se pueda rastrear hasta el archivo del que salió.

### Fuente

Uno de tus archivos, cuando ya forma parte del contexto.

Un archivo que quedó fuera del contexto sigue en tu carpeta, pero no se puede citar. La pantalla de contexto dice cuáles entraron y cuáles no.

### Cita

El nombre del archivo y el lugar exacto de donde salió una frase: una línea, una página o un párrafo.

Sirve para comprobar por tu cuenta. Que una IA muestre una cita no significa que la conclusión sea correcta: significa que puedes ir a verla.

### Inventario

La lista de los archivos que se encontraron en tu carpeta, con su tamaño y su tipo.

Incluye los archivos que no se pudieron leer, con el motivo. No guarda el contenido completo.

### Perfil

El tipo de trabajo que vas a hacer: documentos, software, un juego en Unity, contenido creativo u otro.

Cambia qué se prepara y cómo se explica, no qué te deja hacer. Puedes corregir la recomendación antes de que se aplique nada.

### Receta

Un recorrido corto para pedirle a tu IA un resultado concreto y comprobar si está bien.

Dice cuándo usarla, qué necesitas a mano, los pasos, cómo revisar el resultado y cuándo detenerse. Está escrita para que tu IA la siga.

### Exclusión

Un archivo o una carpeta que decides dejar fuera del contexto.

El archivo no se toca ni se mueve: simplemente no entra en el resumen que tu IA puede leer, así que tampoco se puede citar.

### Mapa de código

Un índice de las funciones y clases de tu proyecto, para encontrar dónde está algo antes de cambiarlo.

Solo para proyectos de software o de Unity, y solo si lo pides. Si el código cambia, el mapa queda desactualizado y la aplicación lo dice en lugar de seguir respondiendo con él.

### OpenSpec

Una herramienta que guarda por escrito qué va a cambiar en un proyecto de software antes de cambiarlo.

Se descarga solo para proyectos de software o de Unity. Copiar sus archivos no demuestra que funcione: la aplicación comprueba aparte que sus comandos respondan.

### SDD

Trabajar escribiendo primero qué se espera y después el código, en lugar de al revés.

Del inglés «spec-driven development». Es el método que OpenSpec ordena; no es obligatorio para usar esta aplicación.

### Entorno de ingeniería

Las herramientas de desarrollo que un proyecto de software necesita: Node, Git y npm.

Se descargan revisadas y con su huella comprobada, en una carpeta propia de la aplicación. No se instala nada en el resto de tu sistema y no se descarga ningún modelo de IA.

### IA con acceso a archivos

Una IA instalada en tu equipo que puede abrir tu carpeta, a diferencia de un chat en el navegador.

Abrir la carpeta en esa aplicación es todo lo que esta aplicación puede hacer y comprobar. Que se abra no demuestra que la IA haya leído tu proyecto.

### Firma

El sello con el que quien publica un programa demuestra que ese archivo es suyo y nadie lo alteró.

Esta aplicación solo abre programas cuya firma pudo comprobar. Si no puede, lo dice y no lo abre, incluso si el programa está instalado.

### Recuperación

Continuar o deshacer una preparación que quedó a medias.

Antes de recuperar se comprueban los archivos. Si los editaste después, la operación se detiene para no perder tu edición.

### Presupuesto de contexto

El máximo de texto que una receta entrega a tu IA de una vez, medido en bytes.

Es un límite de tamaño de archivo, no una medición de lo que tu IA cobra o consume. No son tokens medidos.

### Token

La unidad en la que las IA miden el texto que leen y escriben, y con la que suelen cobrar.

Esta aplicación no mide tokens. Cuando una pantalla habla de bytes, está hablando del tamaño del texto, no de lo que cuesta.

### Deuda técnica

Un problema conocido que se deja anotado en lugar de arreglarse en el momento.

Aparece en las recetas de software porque forma parte del método: anotarla es lo que evita que se olvide.

### Revisión adversarial

Revisar un trabajo buscando activamente en qué falla, en vez de confirmar que está bien.

Aparece en las recetas de software. Quien revisa intenta romper el resultado; si no lo consigue, eso es la evidencia.

## Relacionado

- [Experiencia de Companion](EXPERIENCE.md): los cuatro destinos de la aplicación y el recorrido completo.
- [Evidencia](EVIDENCE.md): qué se midió y qué no.
- [Documentación](../README.md): índice general.
