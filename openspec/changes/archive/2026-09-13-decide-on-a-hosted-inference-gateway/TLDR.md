# TLDR

Issue [#107](https://github.com/IgnacioBarEsp/project-engineering-os/issues/107).

El mantenedor ofreció prestar su clave de pago para que quien no tenga modelo local ni clave propia pueda usar
el nivel de personalización. Este issue pedía **evaluar** qué haría falta para ofrecer eso sin repartir una
clave ni exponer su máquina, y **recomendar hacerlo o no**. Construirlo estaba fuera de alcance.

## La recomendación: no se ofrece

No por falta de medios. Porque no aporta **ninguna capacidad** que los tres niveles existentes no den, y sí
trae obligaciones que cambian lo que este proyecto es.

`off` no es una degradación: es un estado que la aplicación entera respeta —la recomendación de tecnología de
#100 se decide sin modelo a propósito, y `stack-catalog.mjs` no importa nada de inferencia—. Lo que un modelo
añade aquí es redacción, no capacidad.

## Lo que sí aporta, y por qué no hace falta hostear nada para conseguirlo

Lo que un gateway quita es **fricción**. Medida en la interfaz, son cuatro cosas: crear la cuenta, teclear el
identificador exacto del modelo en un campo de texto libre, repegar la clave en cada arranque, y averiguar por
tu cuenta dónde se consigue una.

Una revisión independiente insistió en la pregunta correcta: **si lo que sobra es fricción, ¿por qué
resolverlo hosteando algo?** Tres de las cuatro se quitan sin infraestructura — la lista desplegable de modelos
ya está construida para `local`, y `PROVIDERS` **ya declara una ruta `models` por proveedor que hoy no se llama
desde ningún sitio**.

Esa cuarta opción **gana en los seis criterios** a las dos que hostean. No se implementa aquí, porque este
issue decide sobre un gateway y no autoriza tocar el producto; queda escrita con su medición para decidirse
aparte.

## Lo que costaría hostearlo

Dejar de poder decir «No hay cuenta, suscripción ni telemetría» en tres superficies. Procesar datos de terceros,
con las obligaciones que eso trae y que no dependen de la buena voluntad de nadie. Vigilancia **diaria** de
facturación, porque el caso de abuso se mide en horas: 134 millones de tokens en un día, cuatrocientas veces el
caso feliz sostenido. Y trabajo continuo permanente a cambio de un ahorro de fricción.

## Cómo se evitó que la comparación decidiera el resultado

Los seis criterios se fijaron en el cuerpo del issue antes de evaluar ninguna opción, y están congelados por
digesto en `criteria.json`. «No ofrecerlo» se evalúa como opción de pleno derecho, con las mismas filas que
las demás. Los supuestos de coste **usan la medición que este repositorio ya publicó** —1228 caracteres de
cuerpo real en la evidencia de #99, unos 350 tokens— en vez de una estimación: un primer borrador asumió 1500,
más de cuatro veces lo medido y en la dirección que hace parecer peor el abuso.

## La revisión independiente: FAIL, y la recomendación confirmada

**0 blockers, 3 majors, 7 minors.** Construyó el mejor caso posible a favor del gateway y no sobrevivió — pero
encontró que el documento apoyaba mal una decisión correcta: faltaba la cuarta opción que domina al gateway, el
supuesto de coste era cuatro veces la medición del propio repositorio, y el delta de spec se contradecía a sí
mismo. También comprobó, contra el historial de ediciones del issue, que el criterio que decide es del
mantenedor y precede a todo lo demás. Todo resuelto.

## Qué NO decide este documento

No decide que nunca se haga: decide que hoy no aporta lo suficiente, y escribe cuándo se reabre — incluido el
único hecho externo del que depende, que Cerebras y Groq sigan emitiendo claves gratuitas. No mide nada sobre
uso real. Y no evalúa proveedores de alojamiento por nombre, porque elegir uno antes de decidir si se hace es
empezar por el final.
