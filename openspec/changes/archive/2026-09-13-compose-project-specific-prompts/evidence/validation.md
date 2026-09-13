# Validación — el prompt se compone, y nada de la carpeta sale de este equipo

Todo lo de aquí se ejecutó en esta rama, en este equipo. Cada número viene de la corrida cuyo archivo se
nombra.

## Puertas

| Comprobación | Resultado |
| --- | --- |
| `npm run check` (raíz) | **317 pruebas, 0 fallos** |
| `apps/companion` `npm test` | **105 pruebas, 0 fallos** |
| `apps/companion` `npm run evidence:contract` | **39 mutaciones, 39 detectadas**, 9 pantallas |
| `apps/companion` `npm run evidence:mutations` | **17 mutaciones, 17 detectadas** en tres archivos, todo restaurado |
| `apps/companion` `npm run evidence:prompts` | **0 hallazgos** |
| `openspec validate --all --strict` | **20 de 20** |

## El nivel 0, que es la aplicación completa

`evidence/prompts.json` y los cinco archivos `prompt-<perfil>.md`, conservados enteros.

| Perfil | Caracteres | Antes |
| --- | --- | --- |
| research | 2 252 | ~450, la misma plantilla para los cinco |
| software | 2 768 | ídem |
| unity | 2 282 | ídem |
| media | 2 245 | ídem |
| general | 1 994 | ídem |

Los cinco se generan **por el mismo camino que la aplicación entrega**, no por una copia de él: una revisión
independiente encontró que a los textos publicados les faltaba la sección que la aplicación sí añade.

**Los cinco textos son distintos** y lo son en lo que instruyen, no en su largo: el de Unity manda leer
`ProjectSettings/ProjectVersion.txt` y no tocar `Library`; el de software manda usar el gestor de paquetes que
el propio proyecto declara y no instalar nada global sin preguntar; el de investigación dice que un PDF sin
texto seleccionable necesita reconocimiento óptico y que no se invente su contenido; el de contenido creativo
prohíbe descargar modelos por cuenta propia y exige comprobar la licencia. Eso es lo que faltaba: *«no le pide
a la IA que instale las herramientas necesarias según tu tipo de proyecto»*.

La misma entrada produce siempre el mismo texto —la composición es pura— así que la diferencia entre dos
perfiles es atribuible a sus entradas y no al azar.

## Lo que sale de este equipo, leído de la petición

`prompts.json → request`, tomado interceptando la llamada y mirando lo que iba dentro:

- **1 228 caracteres**, siete campos: `profile`, `experience`, `role`, `goal`, `agents`, `pending` y `files`.
- `files` es `{total, excluded, complete, types:[{extension,kind,count}], limitations:[{reason,count}]}`.
- **`carriesAPath: false`** y el guardia devolvió `[]`.
- Cabeceras: `accept` y `content-type`. La de autorización solo existe cuando hay clave.

El fixture incluye a propósito un archivo llamado `contrato-despido-2024.pdf`, porque el nombre de un archivo
dice más que su extensión. No aparece ni en el agregado, ni en los datos que viajan, ni en ninguno de los
cinco textos.

Esto se comprueba de dos maneras distintas, y las dos importan:

1. **Por construcción**: `shareableFacts` reconstruye el cuerpo campo por campo. Una prueba le pasa un campo
   extra y un arreglo de archivos completo, y ninguno de los dos aparece en el resultado.
2. **Por un guardia que se niega**: si el cuerpo serializado contiene una ruta del proyecto o algo con forma
   de ruta, la petición **no se hace**. La prueba le pone al objetivo de la persona `Revisa src/presupuesto.js`
   y comprueba que no hubo ninguna llamada.

## El nivel 1, medido contra el modelo que de verdad está corriendo aquí

Este equipo tiene LM Studio con 14 modelos y su servidor respondiendo. No hizo falta declararlo sin verificar.

| Qué | Medido |
| --- | --- |
| Detectar que hay un modelo | **12 ms** |
| `qwen/qwen3-coder-30b` en caliente | **13 000 ms**, 732 caracteres |
| ¿Superó la plantilla? | **No** |
| Qué se usó | **La plantilla** |

Los motivos que dio el piso: *es más corto que la plantilla* (732 contra 2 611) y *no menciona el objetivo de
la persona*.

Vale la pena decirlo sin adornos: **el modelo local no mejoró nada**. El issue nombra ese riesgo —«un modelo
pequeño puede redactar un prompt peor que la plantilla»— y la medición lo confirma en vez de desmentirlo. Lo
que este cambio demuestra no es que un modelo ayude, sino que **cuando no ayuda, no se usa**, y la pantalla
dice por qué.

Dos comportamientos más decidieron los límites en lugar de adivinarlos. Vienen de mediciones hechas a mano
con `curl` contra este mismo servidor **antes** de escribir el cliente, así que no tienen artefacto propio y se
marcan como tales:

- Un modelo **en frío** tardó **87 s** (carga de pesos incluida) y **33 s** en caliente. Un límite de 25 s
  habría hecho el nivel 1 inservible en el primer uso, y de hecho el primer borrador de este cliente **se
  venció** contra ese modelo. De ahí salieron los dos límites: **120 s en local** y **25 s con un proveedor**.
- Un modelo que razona antes de responder gastó su turno pensando y devolvió **46 caracteres de respuesta y
  3 584 de razonamiento**. La causa que se muestra en pantalla es esa y no una genérica.

## Degradación, contra servidores reales

| Situación | Tiempo | Qué pasó |
| --- | --- | --- |
| Proveedor caído | **2 ms** | degradó con «no se pudo hablar con el proveedor» |
| Proveedor lento | **25 012 ms** | degradó al vencerse el límite de 25 000 ms |
| Modelo local que no contesta | **120 003 ms** | degradó al vencerse el límite de 120 000 ms |
| Respuesta sin sentido (200 con otra cosa) | inmediato | «el proveedor no devolvió texto» |
| Respuesta más grande que el máximo | inmediato | «la respuesta era demasiado grande», leída por partes y cortada |
| 429 | inmediato | «el proveedor respondió 429» |
| Modelo que solo razona | inmediato | «el modelo gastó su turno razonando y no devolvió instrucciones» |

Ninguna de esas rutas bloquea la preparación: la llamada vive en el proceso principal, dentro de la misma
maquinaria de operaciones que ya muestra progreso y ofrece **Detener**.

## Nada del mantenedor viaja dentro de la aplicación

- El nivel que sale de este equipo **viene apagado**. Una prueba abre un servicio nuevo y comprueba que
  `level` es `off` sin que nadie lo toque.
- La clave **no se guarda**. La prueba pega `sk-secreta-123`, lee **todos** los archivos del directorio de
  datos y comprueba que la cadena no aparece en ninguno, mientras que el nivel elegido sí se recuerda.
- Apagarlo devuelve **exactamente** el mismo texto que antes de encenderlo, comprobado comparando cadenas.

## Lo que encontró la revisión independiente

Devolvió **FAIL: 2 blockers y 9 majors**. El primer blocker importa más que cualquier número de arriba: el
guardia comparaba cadenas tal cual, así que **una diferencia de mayúsculas metía el nombre de un archivo de la
persona en la petición** —y en Windows ese es el caso ordinario, no el exótico—. El segundo: lo que devolvía un
proveedor reemplazaba el documento entero, reglas incluidas, y se copiaba hacia una IA con acceso a la carpeta;
la revisión lo demostró con una respuesta que pedía subir el contenido de los archivos a una dirección.

Las dos cosas están resueltas y protegidas por mutaciones. El detalle completo, con los nueve majors y los
trece minors, está en `independent-review.md`. Lo que cambió en los números publicados aquí también viene de
ahí: el arnés de mutaciones pasó de 11 a 17 y cubre tres archivos, los cinco textos se regeneraron por el
camino real, y el límite local se midió.

## Lo que no se midió

- **Los niveles 2 y 3 no se probaron contra Cerebras ni Groq.** Se probaron contra servidores locales que se
  comportan como un proveedor caído, lento, ruidoso o que limita, porque lo que este repositorio puede medir
  es su propio cliente. Que un proveedor concreto responda como promete no se demuestra aquí.
- **Nadie leyó estas instrucciones en frío**, ni una persona ni un modelo evaluó si son mejores para trabajar.
  Lo que se midió es que son distintas por perfil, específicas y que no afirman nada sin respaldo.
- **El nivel 1 se midió con un modelo, no con catorce.** Con otro modelo el resultado podría ser distinto.
- **El texto que compone el servicio no pasa por la prueba de lenguaje**, que solo lee la interfaz. Queda
  declarado como deuda.
- **Un servidor compatible en un puerto distinto del 1234 no se detecta.** Queda declarado.
- Nadie usó la interfaz a mano; todo recorrido lo condujo un arnés.
