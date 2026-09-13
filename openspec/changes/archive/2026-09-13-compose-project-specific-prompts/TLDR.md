# TLDR

Issue [#99](https://github.com/IgnacioBarEsp/project-engineering-os/issues/99).

El mantenedor lo dijo directo: *«el prompt que te da al final para dárselo a la IA es muy simple, vago y sin
profundidad, no le pide a la IA que instale las herramientas necesarias según tu tipo de proyecto»*. Era una
plantilla de unos 450 caracteres, idéntica para los cinco perfiles, con el nombre y el objetivo dentro.

Pero la mitad interesante del issue no es redactar mejor. Es que la forma fácil de dar profundidad es mandar el
material de la persona a alguna parte, y la promesa entera de este producto es que sus documentos se quedan
aquí.

## Qué hace

- **El texto se compone** del tipo de proyecto, la experiencia declarada, el objetivo, el rol, la IA elegida,
  las etapas que no están listas y un **agregado** de la carpeta: cuántos archivos de cada extensión y de qué
  clase. Los cinco perfiles quedan entre **1 994 y 2 768 caracteres** y dicen cosas distintas: Unity manda leer
  `ProjectSettings/ProjectVersion.txt` y no tocar `Library`; software, usar el gestor que el propio proyecto
  declara y no instalar nada global sin preguntar; investigación, que un PDF sin texto seleccionable necesita
  reconocimiento óptico y que no se invente su contenido.
- **Cuatro niveles detrás de una sola interfaz**, siempre en el proceso principal, porque la interfaz no puede
  hablar con la red y no se le va a permitir empezar: solo plantillas, un modelo en tu equipo, un proveedor
  gratuito con tu clave, o tu propio proveedor. **El que sale del equipo viene apagado.**
- **Nunca sale el contenido ni el nombre de un archivo.** Lo que viaja se construye campo por campo, y un
  guardia se niega a enviar un cuerpo donde aparezca una ruta del proyecto, comparando sin distinguir
  mayúsculas ni normalización.
- **La plantilla es el piso y las reglas no son del modelo.** Lo que devuelve un modelo se usa solo si cubre
  qué preparar, cómo trabajar y qué reglas seguir, habla de este tipo de proyecto y menciona el objetivo. Y
  gane o pierda, las reglas de esta aplicación se añaden después de su texto, con una línea que dice qué mitad
  escribió quién.
- **Más profundidad sin leer nada**: un texto para que la IA que la persona ya usa investigue su carpeta y le
  devuelva un resumen que ella pega de vuelta. Ese resumen tampoco sale de aquí.

## Qué se midió

Este equipo tiene LM Studio con 14 modelos respondiendo, así que el nivel 1 se midió de verdad:

- Detectar que hay un modelo: **12 ms**. Componer con `qwen/qwen3-coder-30b`: **13 000 ms, 732 caracteres**.
- **No superó la plantilla** —más corto y sin mencionar el objetivo— **así que se usó la plantilla.** El issue
  nombra ese riesgo y la medición lo confirma: esto no demuestra que un modelo ayude, demuestra que cuando no
  ayuda, no se usa.
- Proveedor caído: **2 ms**. Proveedor lento: **25 012 ms** contra un límite de 25 000. Modelo local que no
  contesta: **120 003 ms** contra 120 000. Los dos límites salieron de medir un modelo en frío (87 s) y en
  caliente (33 s), no de adivinar.
- La petición interceptada: **1 228 caracteres, siete campos**, ninguna ruta, el guardia vacío.
- **39 mutaciones de interfaz y 17 de servicio, todas detectadas**, en tres archivos.

## Una revisión independiente, FAIL, resuelta

**2 blockers y 9 majors.** El primero: el guardia comparaba cadenas tal cual, así que **una diferencia de
mayúsculas metía el nombre de un archivo en la petición** — y en Windows ese es el caso normal. El segundo: lo
que devolvía un proveedor reemplazaba el documento entero, reglas incluidas, y se copiaba hacia una IA con
acceso a la carpeta; la revisión lo demostró con una respuesta que pedía subir los archivos a una dirección.

Los majors incluían que Detener no cancelaba, que el texto mostrado no era el entregado, que los niveles 2 y 3
no podían funcionar por un campo desconectado, y que el piso lo ponía el instrumento (para Unity exigía la
palabra «un»). Todo resuelto y protegido por mutaciones.

## Qué NO demuestra

Los niveles con proveedor **nunca se probaron contra Cerebras ni Groq**: hace falta una cuenta, una clave y
aceptar sus términos, y eso es del mantenedor. Se probaron contra servidores que imitan sus formas de fallar.
Nadie leyó estas instrucciones en frío ni evaluó si dan mejores resultados. El nivel 1 se midió con un modelo
de los catorce. Un servidor compatible en otro puerto no se detecta. Nadie usó la interfaz a mano.
