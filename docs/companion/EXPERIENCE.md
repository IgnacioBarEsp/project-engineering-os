# Companion: preparar un proyecto y seguir trabajando

Programa [#66](https://github.com/IgnacioBarEsp/project-engineering-os/issues/66), activado el 7 de septiembre
de 2026. Este documento define el producto; no declara que el instalador o sus integraciones ya existan.
El [prototipo navegable](https://github.com/IgnacioBarEsp/project-engineering-os/blob/main/scripts/prototypes/companion.html)
es una simulación identificada y no escribe en carpetas.

La [implementación de escritorio](DESKTOP.md) conecta la interfaz con los motores reales y documenta
su estado, pruebas y límites. El empaquetado del instalador se verifica por separado.

## La promesa

Elige una carpeta y explica qué quieres hacer. Project Engineering OS prepara el contexto y método
adecuados, comprueba el resultado y te ayuda a continuar en tu IA habitual. Puedes volver para consultar
fuentes, reparar una preparación interrumpida o trabajar en otro proyecto.

La aplicación se instala una vez. Cada proyecto conserva su propia preparación, evidencias y ajustes.
Desinstalar la aplicación no borra esos proyectos. La preparación básica funciona localmente, sin cuenta
propia, suscripción, telemetría ni servicios de pago obligatorios.

## Entrevista y decisiones

| Tema | Decisión y origen |
| --- | --- |
| Público | Investigadores, estudiantes, desarrollo/TI, freelancers, creadores y uso general; instrucciones del mantenedor. |
| IA | Usar la IA habitual; exportar contexto para chat web. Respuesta explícita del mantenedor el 7 de septiembre. |
| Recorridos | Investigación, software, Unity, contenido y uso general son pruebas obligatorias, no ejemplos opcionales. |
| Diseño | Calidad profesional, accesibilidad, comodidad y landing distintiva. No implica afiliación con Google ni premio Awwwards. |
| Instalaciones externas | Detectar y configurar lo que ya existe; descargar solo la cadena de herramientas revisada y fijada por hash. **No** instalar modelos ni motores de inferencia. Decisión conjunta con el mantenedor el 11 de septiembre de 2026. |
| Fecha de conferencia | **24 de septiembre de 2026**, con la aplicación lista antes del **20 de septiembre** para ensayar una entrevista. Respuesta del mantenedor el 11 de septiembre de 2026. |
| IA imprescindibles | **OpenCode, Claude, ChatGPT, Cursor y Antigravity**, «de momento». Respuesta del mantenedor el 11 de septiembre de 2026. |
| Prueba real | Instalar en el computador del mantenedor y preparar la landing desde la interfaz; autorización explícita. |
| Evidencia | Medir antes/después; los objetivos de calidad no se convierten en porcentajes comerciales sin ensayo. |

La preparación no empieza preguntando por Git, MCP, RAG, SDK o frameworks. El rol ajusta explicación y
ayuda, no crea límites artificiales. Una investigadora también puede desarrollar software y un programador
puede organizar una carpeta de PDFs. Objetivo y contenido observado determinan el perfil; la persona puede
corregir la recomendación antes de aplicar cambios.

## Cuatro destinos

La aplicación tiene cuatro destinos y cada uno hace un trabajo que ningún otro hace. La estructura anterior
tenía dos entradas con nombres distintos para la misma acción, y la entrada llamada «Tus proyectos» era en
realidad una página de bienvenida con los proyectos al final. Decisión del mantenedor el 12 de septiembre de
2026, tras recorrer la aplicación instalada ([#97](https://github.com/IgnacioBarEsp/project-engineering-os/issues/97)).

| Destino | Su trabajo | Lo que no contiene |
| --- | --- | --- |
| **Inicio** | Bienvenida, qué hace la aplicación en una frase, cómo trabaja, qué se descarga y por qué, qué se queda en este equipo, y la acción para empezar. | La lista de proyectos. |
| **Tus proyectos** | Solo la lista, con el estado de cada proyecto, su perfil y un menú secundario por fila. | Saludo, explicaciones, pasos numerados. |
| **Preparar proyecto** | El asistente de ocho pasos descrito abajo. | — |
| **Ayuda** | El método en palabras llanas y el [glosario](GLOSSARY.md). | Controles que cambien un proyecto. |

Una acción se ofrece siempre con el mismo nombre, esté en la navegación o en el cuerpo de otra pantalla. No
es una convención ni una comprobación posterior: el nombre vive junto a la acción, en una tabla cerrada, y el
constructor de botones no acepta una etiqueta. Dos nombres para una acción son **irrepresentables**, no solo
detectables. La primera versión sí pasaba la etiqueta, y una revisión independiente encontró seis nombres
distintos que llevaban a la pantalla del proyecto y tres a la lectura de archivos; ahora son «Ver mi
proyecto», «Leer mis archivos», «Comprobar de nuevo» y «Revisar desarrollo».

La regla no cubre la navegación relativa: «Volver» significa un paso atrás desde aquí, su sentido es
posicional, y darle el nombre de un destino sería exactamente el defecto que la regla quita.

### El estado de cada proyecto en la lista

Verificar de verdad cuesta releer la carpeta, rehashear las fuentes y, en software, comprobar la cadena de
herramientas: minutos de trabajo que pertenecen a abrir **un** proyecto. La lista no puede hacerlo por fila y
tampoco puede presentar la existencia de un archivo como una comprobación. Lo que muestra es el **veredicto de
la última comprobación real**, guardado junto a los resúmenes de los archivos de los que dependió, y lo
compara con esos archivos ahora ([#98](https://github.com/IgnacioBarEsp/project-engineering-os/issues/98)).

| Estado | Qué afirma | Cuándo aparece |
| --- | --- | --- |
| **Listo** ✓ | Cada etapa que ese perfil necesita se comprobó contra la carpeta y nada de lo comprobado cambió desde entonces. | Es el único estado con palomita. |
| **Le falta algo** | Se comprobó y alguna etapa quedó pendiente; la fila enumera cuáles en palabras. | Tras una comprobación incompleta. |
| **Hay que comprobarlo de nuevo** | Cambió un archivo del que dependía el veredicto; la fila nombra la etapa. | Cuando el resumen guardado ya no coincide. |
| **Sin comprobar** | Nunca se comprobó en esta carpeta, o la carpeta cambió de lugar, o el veredicto no pudo registrar todo. | Ante cualquier duda. |
| **Quedó algo a medias** · **Sin preparar** · **No se pudo leer su registro** | Lo que dicen, con la causa que dio el servicio. | Sin cambios respecto a #97. |

La comparación **solo puede desmentir**, nunca confirmar: que los resúmenes coincidan no prueba que el
proyecto siga listo, únicamente que nada de lo que se puede comprobar desde aquí lo contradice. Por eso cada
fila dice cuándo se comprobó, y la fila lista dice además lo que **no** cubre: no vuelve a leer los archivos de
la persona, no comprueba el mapa de código, no comprueba las herramientas de desarrollo —viven fuera de la
carpeta, así que nada de lo que la lista puede leer notaría que se quitaron— y no comprueba su IA. Esa
aclaración se dibuja al mismo tamaño que el estado.

Cuando falta algo, la fila nombra **lo que de verdad está pendiente**, no la etapa que lo contiene. Añadir un
archivo a la carpeta no deja sin guardar las elecciones de nadie: lo que quedó viejo es el inventario, y eso es
lo que dice. La distinción no es cosmética — decir «te faltan tus elecciones guardadas» cuando están guardadas
manda a la persona a rehacer algo que ya hizo.

Qué exige la palomita, por perfil: investigación, contenido y trabajo general necesitan la carpeta preparada
con su inventario vigente y los archivos leídos; software y videojuego necesitan además las herramientas
administradas preparadas, los archivos de desarrollo sin diferencias y OpenSpec respondiendo. Un mapa de
código que nunca se creó no impide el estado listo — es una adición que la interfaz ofrece, y un proyecto sin
código no tiene nada que mapear — pero uno desactualizado, corrupto o que necesita reparación sí, porque es una
afirmación que dejó de sostenerse. El veredicto se guarda en el directorio de datos de la aplicación, nunca en
la carpeta de la persona, y no contiene ninguna ruta absoluta.

### Abrir, duplicar y quitar

La tarjeta **es** el control que abre el proyecto: no hay un segundo control para abrir, así que tampoco hay un
segundo nombre. Lo secundario y lo destructivo viven en un menú por fila — duplicar la preparación y quitar de
la lista — y ninguna acción principal vive solo ahí, comprobado leyendo la página renderizada.

**Duplicar** reusa las respuestas del original contra una carpeta que la persona elige, y nada se escribe hasta
que aprueba el plan como en cualquier preparación. No copia ningún artefacto del original, porque **no existe
ninguna operación que copie una carpeta preparada**: el criterio se cumple por ausencia de capacidad, no por
una regla que alguien recuerde respetar. El nombre llega igual al del original, porque es la respuesta que la
persona dio y la aplicación no va a inventarle otra; el campo está a la vista y editable, y las dos filas se
distinguen por su carpeta.

**Quitar de la lista** pide confirmación, dice que los archivos se quedan donde están, y solo quita la entrada.
El issue pedía además una entrada llamada «eliminar», y su propio criterio de aceptación define *eliminar* como
quitar del historial sin tocar la carpeta: es la misma acción, y desde #97 dos nombres para una acción son
irrepresentables. Sobrevive el nombre que describe el efecto.

### Quién escribe las instrucciones para tu IA

El texto que la persona le pega a su propia IA ya no es una plantilla igual para los cinco perfiles. Se compone
del tipo de proyecto, la experiencia declarada, el objetivo, la IA elegida, las etapas que no están listas y un
**agregado** de la carpeta: cuántos archivos hay de cada extensión y de qué clase. Nunca una ruta, nunca un
nombre de archivo, nunca el contenido de nada
([#99](https://github.com/IgnacioBarEsp/project-engineering-os/issues/99)).

Un modelo puede redactarlo mejor, y para eso hay cuatro niveles:

| Nivel | Qué necesita | De fábrica |
| --- | --- | --- |
| **Solo plantillas** | nada; la aplicación está completa | encendido |
| **Un modelo en tu equipo** | que algo responda el protocolo en tu propia máquina | encendido cuando responde |
| **Un proveedor gratuito** | tu clave, y saber qué recibe | **apagado** |
| **Tu proveedor** | tu clave | apagado |

Tres cosas que no cambian con el nivel. **La plantilla es el piso**: lo que devuelve un modelo se usa solo si
cubre qué preparar, cómo trabajar y qué reglas seguir, habla de este tipo de proyecto, menciona el objetivo de
la persona y no afirma nada que este producto no afirme. **Las reglas no son del modelo**: se añaden después de
su texto, con una nota que dice qué mitad escribió quién, porque ese texto va a una IA que sí puede abrir la
carpeta. Y **la clave no se guarda**: vive en memoria mientras la aplicación está abierta.

Cuando hace falta más profundidad, esta aplicación no abre los archivos: produce un texto para que la IA que la
persona **ya usa** investigue su propia carpeta y le devuelva un resumen que ella pega de vuelta. Ese resumen
tampoco sale de aquí, ni siquiera hacia un modelo.

### Cómo trabajar en este proyecto

Dentro de cada proyecto hay una sección que dice qué hacer ahora: primero lo que falta, en el orden en que se
puede hacer, y después las formas de trabajar que tiene ese tipo de proyecto. El paso que resuelve una carpeta
cambiada revisa **las respuestas ya guardadas contra esa misma carpeta**; no abre el asistente, porque abrirlo
saldría del proyecto y dejaría los campos en blanco. Un paso que esta aplicación
ejecuta — leer tus archivos, preparar las herramientas — lleva el control que lo hace y **ningún texto para dar
a una IA**, porque entregar un prompt para pedirle eso describiría una capacidad que la IA no tiene. Un paso
que sí es trabajo de la IA lleva el texto completo, compuesto por la aplicación, y se copia por un control que
lo rechaza si el proyecto cambió después de componerlo. El contenido de esos textos es el
[issue #99](https://github.com/IgnacioBarEsp/project-engineering-os/issues/99); esta composición viene de las
recetas y de las etapas pendientes que ya existen.

Cada término técnico que sobrevive en la interfaz es un control que abre su propia definición **desde la
pantalla donde aparece**, y todas se reúnen en el glosario. Esa es la propiedad que se comprueba, pantalla
por pantalla y palabra por palabra: si la palabra está en el texto de una pantalla y su definición no se
puede abrir desde ahí, la comprobación falla. Dos palabras de la jerga de este repositorio, `harness` y
`RAG`, no tienen definición y no pueden aparecer en ninguna parte. La regla al reescribir el lenguaje fue que **se elimina el
vocabulario técnico y el tono defensivo, no la verdad**: ninguna frase que declare un límite del resultado se
quitó, y ningún beneficio sin medir se suavizó hasta parecer cierto.

Que el lenguaje funcione con alguien que no conoce la aplicación no lo puede comprobar una máquina ni un
agente. La [lectura en frío](COLD_READING.md) es el procedimiento para medirlo con una persona; hasta que
alguien lo ejecute, esos dos criterios quedan sin verificar con su causa.

## Recorrido principal

1. **Instalar la aplicación.** Ubicación de la app, licencia y aviso comprensible, instalar y abrir. Instalación
   por usuario; evitar privilegios de administrador cuando no son necesarios. La ubicación del proyecto se elige después.
2. **Preparar un proyecto.** Una acción principal y acceso a proyectos anteriores. Puede explorar una demostración local.
3. **Qué quieres hacer.** Objetivo breve, tipo de trabajo y experiencia. Ofrecer ejemplos claros y permitir cambiar de perfil.
4. **Con qué IA.** Selección múltiple, diferenciando agente con acceso a archivos y chat web. Nunca pedir aquí la contraseña de otra aplicación.
5. **Dónde está tu trabajo.** Elegir o crear carpeta mediante diálogo nativo. Resumen de tipos/cantidad de archivos, límites de lectura y exclusiones.
6. **Revisar la preparación.** Qué se añadirá, qué ya existe, tamaño de descargas, requisitos y acciones pendientes. Detalles técnicos desplegables.
7. **Preparar y comprobar.** Pasos con nombres útiles, progreso real, cancelación segura y reintento. No inventar un porcentaje si la duración es desconocida.
8. **Continuar.** Resultado verificado, próximo paso y abrir IA/carpeta o exportar contexto. Un paso pendiente tiene explicación y acción concreta.

El uso posterior ofrece un listado sencillo de proyectos con ruta, perfil y el veredicto de su última
comprobación. Dentro de un proyecto: estado, cómo trabajar en él, búsqueda con fuentes, recetas útiles y
recuperación. Las acciones frecuentes se completan con pocos pasos; configuración avanzada queda a un nivel
adicional, accesible por teclado.

## Qué significa listo

Se registran tres niveles independientes: **carpeta preparada**, **contexto comprobado** y **herramientas
externas verificadas**. El resumen distingue Listo, Requiere una acción, No aplica y Error recuperable.
Copiar un archivo de configuración solo demuestra que ese archivo existe.

| Perfil | Preparación y contexto | Comprobación obligatoria | Lo que no se puede afirmar sin más evidencia |
| --- | --- | --- | --- |
| Investigación/documentos | Inventario, fuentes con página/línea, contexto local, recetas de lectura crítica, extracción y síntesis; originales preservados. | Consultas de respuesta conocida, citas localizables, frescura, archivo ilegible y PDF escaneado identificados. | Que un PDF escaneado tiene texto sin OCR probado; que una cita o conclusión es verdadera porque la produjo la IA. |
| Software web/app | Núcleo de ingeniería, SDD aplicable, contexto del código, decisiones y recetas de implementación/revisión. | Bootstrap/segunda ejecución, comprobaciones del núcleo y una tarea real; landing propia como proyecto piloto. | Que instalar instrucciones construyó, publicó o auditó el producto del usuario. |
| Unity/videojuego | Detección de proyecto y versión, scripts/configuración relevantes, exclusión de Library/Temp/builds, recetas de cambios y validación de escenas. | Contexto C# y configuración; Unity abre/valida el fixture si el editor requerido está disponible. | Que el juego compila o funciona sin ejecutarlo en el editor correcto; que existe licencia o soporte de cualquier versión. |
| Contenido multimedia | Catálogo de recetas, entradas, modelos y salidas; procedencia, hardware, recursos y comandos precisos. | Hub local disponible, receta validada y un resultado inspeccionado cuando se ejecuta; distinguir modelo ausente o VRAM insuficiente. | Que una receta genera por copiar su JSON; que todas las GPUs o formatos están soportados. |
| General/trabajo | Objetivo, inventario útil, fuentes y recetas de resumen, comparación, planificación y entregables. | Búsqueda verificable, exportación revisable y receta con salida/criterios claros, sin imponer herramientas de desarrollo. | Que una carpeta arbitraria es totalmente comprendida o que cualquier formato es legible. |

En proyectos mixtos, un perfil principal y capacidades adicionales explícitas evitan preparar varias bases
incompatibles. Los archivos no compatibles permanecen inventariados, con su limitación visible.

## Contexto, recetas e IA

Un punto de entrada breve lleva al mapa del proyecto, estado del contexto y recetas. Leer más se hace
según la tarea; no se cargan todos los documentos o skills al empezar cada conversación. Una receta declara
cuándo usarla, entradas, pasos deterministas, salidas, verificaciones, límites y recuperación. La concisión
no elimina razonamiento necesario de arquitectura, seguridad o investigación.

La base es recuperación local con fuentes y contexto acotado. Un grafo de código puede añadir símbolos y
relaciones cuando el proyecto lo justifica. GitNexus, CodeGraph y Graphify son candidatos de adaptador,
no equivalentes intercambiables. La identidad exacta, versión, licencia, proceso de indexado, gastos y
prueba de consulta pertenecen al catálogo. Un índice obsoleto deja de presentarse como actual.

Para un agente local, la preparación aporta instrucciones y una ruta utilizable a las herramientas
comprobadas. Para chat web, la persona revisa y exporta un paquete de contexto; abrir una web no entrega
automáticamente los documentos ni permite modificar la carpeta. Nunca se guardan credenciales en instrucciones.

## Sugerencias para adopción sostenida

Priorizar una primera tarea útil sobre un catálogo enorme: demo sin cuenta, proyectos de ejemplo con
resultados verificables, ayuda junto al problema, recuperación sencilla y lenguaje consistente. Después:
plantillas revisadas de la comunidad, importación/exportación de recetas, actualizaciones con vista previa,
diagnóstico compartible sin datos privados, documentación breve en español/inglés y un recorrido para
equipos/semilleros que comparta método sin compartir secretos.

La experiencia para miles de usuarios necesita además editor verificado del instalador, builds
reproducibles, política de soporte y compatibilidad, accesibilidad evaluada con personas, respuesta a
incidentes y mantenimiento del catálogo. No se promete adopción por tener una interfaz atractiva.
Evitar en la primera entrega: marketplace arbitrario, chat propio, cuentas obligatorias, gamificación,
sincronización en nube y descargas indiscriminadas de modelos.

## Entregas y evidencia

| Issue | Entrega |
| --- | --- |
| [#76](https://github.com/IgnacioBarEsp/project-engineering-os/issues/76) | Experiencia, prototipo, arquitectura y método de evaluación. |
| [#77](https://github.com/IgnacioBarEsp/project-engineering-os/issues/77) | Motor por perfil, preservación y recuperación. |
| [#78](https://github.com/IgnacioBarEsp/project-engineering-os/issues/78) | Contexto con fuentes, recetas y adaptadores. |
| [#79](https://github.com/IgnacioBarEsp/project-engineering-os/issues/79) | Aplicación visual e integración del motor. |
| [#80](https://github.com/IgnacioBarEsp/project-engineering-os/issues/80) | Instalador, empaquetado, actualización y límites de distribución. |
| [#81](https://github.com/IgnacioBarEsp/project-engineering-os/issues/81) | QA real, landing y benchmarks; correcciones repetidas hasta cumplir aceptación. |
| [#94](https://github.com/IgnacioBarEsp/project-engineering-os/issues/94) | Aceptación nativa, medición con modelo y entrega pública verificable. |
| [#97](https://github.com/IgnacioBarEsp/project-engineering-os/issues/97) | Cuatro destinos, lenguaje entendible y glosario alcanzable desde donde aparece cada término. |

Cada entrega conserva su flujo SDD. El programa sigue abierto mientras falte un criterio; una prueba local
no demuestra compatibilidad universal. Consulta [arquitectura](ARCHITECTURE.md), [diseño](DESIGN.md),
[glosario](GLOSSARY.md) y [evaluación](EVALUATION.md). El [motor de preparación](PREPARATION.md) documenta la primera etapa de implementación.
El [contexto local](CONTEXT.md) detalla fuentes, recetas, rutas y límites de extracción.
