# Un gateway de inferencia hosteado: qué haría falta, y por qué no se hace

Este documento es un **registro de decisión**, no un plan. Evalúa qué haría falta para ofrecer inferencia a
quien no tiene modelo local ni clave propia, sin repartir una clave y sin exponer la máquina de nadie, y
termina en una recomendación.

**Úsalo si:** te preguntas por qué la aplicación no ofrece un nivel «gratis, sin configurar nada», o vas a
reabrir esa decisión.

---

## La recomendación, primero

**No se ofrece.** No ahora, y no por falta de medios: porque no aporta ninguna capacidad que los tres niveles
existentes no den, y sí trae obligaciones que cambian lo que este proyecto es.

Lo que sí aporta —quitar fricción— se consigue **sin hostear nada**, arreglando el nivel `provider` que ya
existe: tres de sus cuatro fricciones están medidas y son código del producto, no infraestructura. Eso es la
opción D de la tabla, gana en los seis criterios a las dos que hostean, y **no se hace en este issue** porque
aquí no se decide sobre el producto. Queda escrita para que se decida aparte.

La recomendación va antes que el diseño a propósito. Un documento que empieza describiendo arquitecturas,
límites y costes se lee como una decisión ya tomada a la que solo le falta la firma, y este proyecto ya ha
pagado dos veces por mediciones construidas para llegar a una conclusión. Lo que sigue es **qué haría falta si
se decidiera**, escrito para que la decisión se pueda reabrir con datos, no para justificar la de hoy.

**Se reabre si** alguien lo pide de verdad —no hipotéticamente— y su caso no lo cubre ninguno de los tres
niveles. **Y se reabre si Cerebras y Groq dejan de emitir claves gratuitas**, que es el único hecho del que
depende este veredicto y que este proyecto no controla: si `provider` deja de ser un camino de coste cero, un
gateway pasaría a ser el único nivel que no pide instalar ni pagar, y el criterio 1 cambiaría de signo. Hasta
entonces, construirlo sería resolver un problema que nadie ha tenido.

---

## Los criterios, escritos antes de mirar ninguna opción

Se fijaron en el cuerpo del issue antes de evaluar ningún proveedor ni ninguna arquitectura, por el mismo
motivo que en la medición de #105: una comparación cuyos criterios se escriben después de mirar los candidatos
no compara, justifica.

Congelados por digesto en `openspec/changes/decide-on-a-hosted-inference-gateway/criteria.json`
(`sha256:240d80285f68eefc4c28806b29f453db5b4bc8e2c29f1b0f7209be294ea4f07d`), para que el orden no dependa del
historial de ediciones de un servicio externo. Para **esta** decisión el orden se sostiene además en ese
historial, que una revisión independiente comprobó: el criterio que decide —«no ofrecerlo es una respuesta
perfectamente buena»— venía en el cuerpo original del issue y es del mantenedor, no de quien evaluó.

1. Qué aporta que los tres niveles existentes no den.
2. Qué promete la aplicación y qué tendría que dejar de prometer.
3. Qué datos de otras personas pasarían por dónde, y bajo qué jurisdicción y obligaciones.
4. Qué cuesta, con supuestos de volumen explícitos y el caso de abuso incluido.
5. Qué pasa cuando falla o se apaga, y a quién deja sin nivel.
6. Cuánto trabajo continuo exige.

---

## Criterio 1: qué aporta que los tres niveles no den

Los cuatro niveles que existen hoy, con sus etiquetas tal como las ve la persona:

| Nivel | Qué es | Qué necesita | Qué sale del equipo |
| --- | --- | --- | --- |
| `off` | Solo plantillas, en este equipo | nada | nada |
| `local` | Un modelo en tu equipo | un servidor local en el puerto 1234 | nada |
| `provider` | Un proveedor gratuito, con tu clave | una clave de Cerebras o de Groq | hechos declarados, nunca archivos |
| `own-key` | Tu proveedor, con tu clave | una clave propia | hechos declarados, nunca archivos |

`off` **no es una degradación**. Es un estado de primera clase que la aplicación entera respeta: la
recomendación de tecnología de #100 se decide sin modelo a propósito, y quien lo tenga apagado recibe el mismo
producto con la misma explicación. Lo que un modelo añade es redacción, no capacidad.

Así que lo que un gateway aportaría es: **que alguien que no quiere instalar nada ni registrarse en ningún
sitio reciba un texto mejor redactado**. Eso es real, y es todo.

Contra eso: `provider` ya existe y la aplicación lo etiqueta «Un proveedor gratuito, con tu clave», con dos
proveedores en `PROVIDERS`. Así que lo que el gateway quita es fricción, no una imposibilidad.

Pero esa fricción es mayor de lo que un primer borrador de este documento dijo, y conviene medirla en vez de
llamarla «pequeña». Leída de la interfaz, son cuatro cosas:

1. Crear una cuenta con Cerebras o con Groq.
2. **Teclear el identificador exacto del modelo en un campo de texto libre** (`ui/app.mjs:547-550`), cuya
   ayuda dice «El identificador exacto que usa tu proveedor». El nivel `local` no pide eso: le ofrece una lista
   desplegable con los modelos que encontró (`:551-552`).
3. Volver a pegar la clave **en cada arranque**: «No se guarda en ninguna parte. Si cierras la aplicación, se
   pide de nuevo» (`:558`).
4. Averiguar por su cuenta dónde se consigue una clave, porque la pantalla no lo dice.

Qué condiciones pone hoy cada proveedor para emitirla —si pide tarjeta, qué cuota da— **no se verificó aquí y
no se afirma**: son políticas de dos empresas que pueden cambiar sin avisar.

**Veredicto del criterio 1: aporta un ahorro de fricción, no una capacidad.** Este criterio, por sí solo, ya
casi resuelve el issue — y el issue lo dice en su criterio de decisión. Pero deja una pregunta que una revisión
independiente hizo bien en insistir: si el problema es la fricción, **¿por qué resolverlo hosteando algo?** Esa
pregunta abre una cuarta opción, y está en la tabla.

---

## Criterio 2: qué tendría que dejar de prometer la aplicación

La promesa vive en **tres** superficies, no en una, y conviene citarlas donde están de verdad:

| Dónde | Lo que dice hoy | Qué pasaría |
| --- | --- | --- |
| Inicio, panel «Qué se queda en este equipo» (`ui/app.mjs:129`) | «Tus documentos se leen aquí y no se envían a ninguna IA durante la preparación» | **Sigue siendo cierto.** `shareableFacts` reconstruye campo por campo lo que sale y `projectDataIn` rechaza un cuerpo con datos del proyecto |
| el mismo panel (`ui/app.mjs:129`) | «No hay cuenta, suscripción ni telemetría» | **Deja de ser cierto.** Un gateway necesita identificar instalaciones para limitar el uso: es una cuenta aunque no se llame así, y un registro aunque sea mínimo |
| el diálogo de privacidad (`ui/app.mjs:214`) | «No tiene cuenta, telemetría ni envío automático de documentos» | **Deja de ser cierto** en sus dos primeros términos |
| la barra lateral (`ui/index.html:17`) | «Tus archivos, en este equipo · Sin cuenta» | **Deja de ser cierto** para quien use ese nivel |
| `docs/companion/SECURITY.md:17` | «secreto de proveedor, telemetría ni envío de documentos» | **Deja de ser cierto** en sus dos primeros términos |

La frontera de datos aguanta: lo que viaja son siete campos de primer nivel —perfil, experiencia, rol, el
objetivo escrito por la persona, los agentes elegidos, las etapas pendientes y un bloque de archivos—. Ese
bloque lleva además, y conviene enumerarlo porque el primer borrador se lo saltó justo donde el criterio
pregunta qué datos pasarían: **cuántos archivos se excluyeron**, **si la lectura quedó completa** y **el motivo
de cada limitación**. Las rutas **no** viajan: `limitations` se remapea a `{reason, count}` y descarta `path`
(`inference.mjs:64-73`). El borrador y las notas pegadas **no viajan**. Pero «no son archivos» no es «no son datos personales»: el objetivo que alguien escribe
puede decir mucho de su trabajo, y pasaría por un tercero.

**Veredicto del criterio 2: la aplicación tendría que dejar de decir que no hay cuenta ni telemetría.** Esa
frase es una de las pocas que el producto puede afirmar sin matices, y cambiarla cuesta más que lo que el nivel
aporta.

---

## Criterio 3: qué datos, por dónde, bajo qué obligaciones

| Qué | Hoy | Con gateway |
| --- | --- | --- |
| Contenido de archivos | nunca sale | nunca sale |
| Objetivo, rol, perfil, experiencia | va a **la clave de la persona** | pasaría por infraestructura del mantenedor |
| Identificador de instalación | no existe | haría falta uno, y sería un dato personal |
| Registro de uso | no existe | tendría que existir para poder limitar |

El cambio real no es el volumen de datos: es **de quién es la responsabilidad**. Hoy, quien usa `provider` usa
su propia cuenta con su proveedor y esa relación no pasa por el mantenedor. Con gateway, el mantenedor procesa
datos de terceros, lo que trae obligaciones que no dependen de su buena voluntad: informar qué se guarda,
atender a quien pida su borrado, notificar si hay una brecha, y responder si el proveedor de abajo cambia sus
términos.

**Veredicto del criterio 3: convierte un proyecto personal en un responsable de tratamiento.** Es reversible en
el código y no en las obligaciones ya contraídas con quien lo usó.

---

## Criterio 4: qué cuesta, con supuestos declarados

Los supuestos van primero porque el número no significa nada sin ellos. Ninguno está medido: son estimaciones
declaradas como tales.

**Supuestos de volumen.** La entrada **está medida en este repositorio**, no estimada: la evidencia de #99
—`openspec/changes/archive/2026-09-13-compose-project-specific-prompts/evidence/prompts.json`— registra
`request.characters = 1228` para el cuerpo completo interceptado, del orden de **350 tokens**. La salida se
acota en el código: `MAX_OUTPUT_TOKENS` es 1200. Una persona compone entre 1 y 5 veces por proyecto, y eso sí
es un supuesto.

Un primer borrador de esta tabla asumió 1500 tokens de entrada, más de cuatro veces lo medido, y en la
dirección que hace parecer peor el abuso. Los números de abajo salen de los 350 medidos.

| Escenario | Personas | Composiciones/mes | Tokens/mes |
| --- | --- | --- | --- |
| Caso feliz corto | 20 | 200 | ~310 000 |
| Caso feliz sostenido | 200 | 2 000 | ~3,1 millones |
| **Caso de abuso** | 1 script | 1 por segundo durante un día | **~134 millones** |

El caso de abuso no es pesimismo: un endpoint sin autenticación fuerte que devuelve texto de un modelo **es**
una API gratuita, y se encuentra. Sigue siendo **cuatrocientas veces** el caso feliz sostenido después de
corregir el supuesto a la baja, que es lo que importa: el orden de magnitud no depende del número exacto.

**Coste de infraestructura**, aparte del de inferencia: un servicio mínimo con dominio y certificado son
decenas de dólares al mes en cualquier opción; el almacenamiento del registro es despreciable.

**Veredicto del criterio 4: el caso feliz es barato y el caso de abuso no tiene techo natural.** Lo que hay que
presupuestar no es el uso esperado, es el límite del daño.

---

## Criterio 5: qué pasa cuando falla

| | Quién se queda sin nivel | Qué ve |
| --- | --- | --- |
| Gateway caído | todo el que dependa de él | la aplicación entrega la plantilla y dice por qué, que ya está construido |
| Clave del mantenedor agotada o revocada | todos | lo mismo |
| Proveedor de abajo cambia términos | todos | lo mismo |

Esto es lo **menos** malo del diseño, porque la degradación ya existe: #99 dejó construido que un proveedor
caído, lento, excesivo o incoherente **no rompe nada**, y un gateway heredaría eso gratis.

Con una precisión que una revisión independiente pidió y que importa justo en un documento sobre un quinto
nivel: el código hace **un** intento al nivel configurado y, si falla, devuelve `used: 'off'` con su motivo
(`inference.mjs:180-213`) y el llamador entrega la plantilla (`service.mjs:399-406`). No hay cascada
gateway → own-key → local. Para quien usara un gateway, el nivel de abajo **es** la plantilla.

**Veredicto del criterio 5: resuelto de antemano**, y es el único criterio donde el gateway no añade problema.

---

## Criterio 6: cuánto trabajo continuo

Claves que rotar. Facturas que vigilar **a diario**, porque el caso de abuso se mide en horas. Abuso que
atender. Un canal por el que alguien pida el borrado de sus datos. Un plan si el proveedor de abajo corta el
servicio. Y la actualización del propio gateway, que es software desplegado con sus propias dependencias y sus
propios parches.

**Veredicto del criterio 6: es una obligación operativa permanente** a cambio de un ahorro de fricción.

---

## Las opciones, comparadas

Cuatro. Dos hostean algo, una no hace nada, y la cuarta ataca el mismo problema sin hostear nada — la abrió una
revisión independiente insistiendo en que si lo que sobra es fricción, hostear no es la única forma de quitarla.

**D. Arreglar el nivel `provider` que ya existe.** De las cuatro fricciones medidas arriba, tres se quitan sin
infraestructura: la lista desplegable de modelos ya está construida para `local` (`ui/app.mjs:551-552`) y
`PROVIDERS` **ya declara una ruta `models` por proveedor** (`inference.mjs:29-30`) que hoy no se llama desde
ningún sitio; guardar la clave con el resto de los ajustes de la aplicación quita el repegado en cada arranque;
y decir en pantalla dónde se consigue una clave es una frase.

| | **A. No ofrecerlo** | **B. Función sin servidor** | **C. Servicio propio** | **D. Arreglar `provider`** |
| --- | --- | --- | --- | --- |
| Qué aporta (c1) | nada nuevo; la fricción medida se queda | quita las 4 fricciones | igual que B | **quita 3 de 4**, sin hostear |
| Qué deja de prometer (c2) | nada | «sin cuenta ni telemetría» | igual que B | **nada** |
| Datos de terceros (c3) | ninguno | sí, con obligaciones | sí, con obligaciones | **ninguno** |
| Coste feliz (c4) | **0** | bajo; factura por uso | fijo mensual + uso | **0** |
| Coste de abuso (c4) | **0** | acotable con presupuesto | acotable con código | **0** |
| Caída (c5) | no aplica | degrada y lo dice | degrada y lo dice | igual que hoy |
| Trabajo continuo (c6) | **ninguno** | vigilancia diaria de facturación | vigilancia + parches | **ninguno** |
| Reversible | **sí, no hay nada** | el servicio sí, las obligaciones no | igual | sí, es código del producto |

**D gana en los seis criterios a B y a C**, y gana a A en el primero sin perder en ninguno. Entre las dos que
hostean, **B** es mejor que **C**: sin servidor que parchear y con un tope de gasto que se configura en el
proveedor en vez de programarse. Pero las dos comparten lo que hace de esto una mala idea hoy, que está en los
criterios 1, 2, 3 y 6 y no en el 4 ni en el 5.

**D no se implementa aquí**, porque este issue decide sobre un gateway y no autoriza tocar el producto. Queda
escrito, con su medición, para que se decida por su cuenta: es el trabajo que de verdad quita la fricción que
motivó la oferta del mantenedor.

---

## Si se decidiera que sí: qué haría falta

Escrito para que la decisión se pueda reabrir con datos, no como plan aprobado.

**Autenticación por instalación.** Un identificador generado en la primera ejecución, guardado junto a los
datos de la aplicación, enviado en cada petición. No identifica a una persona, identifica una instalación — y
aun así es un dato personal en cuanto se registra con marcas de tiempo. Un identificador no es una barrera:
quien quiera abusar genera mil. Sirve para limitar, no para autenticar.

**Límites contra alguien que lo use como API gratuita**, que es el diseño que importa:

- Tope por instalación y día, del orden de las composiciones que una persona hace de verdad: 20 es diez veces
  el uso esperado. **No acota el abuso**: con identificadores generados a voluntad, llegar a los 134 millones
  de la tabla pide unos 2500 identificadores, dos veces y media los mil que este mismo documento da por
  triviales. Sirve para que un cliente roto no dispare, no contra alguien que quiera abusar.
- Tope global diario, que es el único límite del lado del código que sí acota. **Tiene que llevar un número, y
  el número sale del presupuesto, no al revés**: si se aceptan 50 dólares al mes de gasto máximo, el tope
  diario es lo que quepa en un treintavo de eso a los precios del proveedor del momento. Dimensionarlo sin
  fijar antes el presupuesto es elegir un número que no significa nada.
- **Presupuesto configurado en el proveedor**, que es lo único que detiene el gasto cuando el código falla — y
  el único límite que este documento puede dimensionar sin medir uso real.
- Forma fija de la petición: el gateway acepta el objeto de hechos declarados de `shareableFacts` y **nada
  más**, no un prompt libre. Un endpoint que acepta texto arbitrario es un proxy a un modelo; uno que acepta
  siete campos con tipos conocidos es mucho menos útil para quien quiera otra cosa.

**Qué se registraría, y qué no.** Se registraría: identificador de instalación, marca de tiempo, tokens
consumidos y si la petición se aceptó o se rechazó. **No** se registraría el cuerpo de la petición ni la
respuesta del modelo. Retención de 30 días, para poder investigar abuso y no más. El mantenedor vería
agregados; el detalle por instalación, solo al investigar un abuso concreto.

**Comprobación de que eso no permite reconstruir el proyecto de nadie:** no se guarda ningún campo del cuerpo,
así que no hay objetivo, ni rol, ni conteo de archivos, ni nombre de proyecto en el registro. Lo que queda —una
instalación pidió N veces y gastó M tokens— no reconstruye nada. Esa propiedad se sostiene **solo** si no se
registra el cuerpo, y ese es precisamente el campo que más tentaría registrar para depurar.

**Qué cambiaría en lo que la aplicación promete:** la pantalla de privacidad tendría que decir que ese nivel
usa un servicio del mantenedor, qué se registra y cuánto se conserva; la barra lateral no podría seguir diciendo
«Sin cuenta» para quien lo use; y `docs/companion/SECURITY.md` ganaría una sección con la misma forma que las
de «cuando se abre otra aplicación» y «cuando hay un modelo de por medio».

---

## Lo que este documento no decide

- **No decide que nunca se haga.** Decide que hoy no aporta lo suficiente.
- **No mide nada.** Los costes son estimaciones con sus supuestos declarados, no mediciones. Si esta decisión se
  reabre, hay que medir el uso real antes de dimensionar nada.
- **No evalúa proveedores concretos** de alojamiento por nombre, porque elegir uno antes de decidir si se hace
  es empezar por el final.
