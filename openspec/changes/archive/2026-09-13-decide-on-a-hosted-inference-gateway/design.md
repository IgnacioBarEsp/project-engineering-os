# Diseño

Este cambio produce **un documento y ningún código**. Lo que hay que diseñar, entonces, no es un gateway: es
cómo se escribe una decisión que puede reabrirse con datos en vez de releerse como una justificación.

## 1. Por qué la recomendación va primero

Un registro de decisión que empieza por arquitecturas, límites y costes, y termina en «por lo tanto, no», se
lee como un plan al que le falta la firma. Quien lo abra dentro de seis meses verá tres cuartas partes de
diseño concreto y una conclusión al final, y concluirá que la decisión fue cercana.

No lo fue. Se resuelve en el primer criterio: los tres niveles existentes ya cubren a todo el mundo, y lo que
un gateway aporta es ahorrarle a alguien crear una cuenta **gratuita**. El resto del documento existe para que
la decisión se pueda reabrir, no para sostenerla.

Así que el orden es: recomendación, criterios, evaluación criterio por criterio, opciones comparadas, y al
final «si se decidiera que sí, qué haría falta» — marcado como lo que es.

## 2. Los criterios se fijaron antes de mirar ninguna opción

Igual que en #105, y por el mismo motivo: una comparación cuyos criterios se escriben después de ver los
candidatos no compara, justifica. Los seis están en el issue enriquecido, con su fecha, antes de que este
documento evaluara nada.

Los seis no pesan igual, y el documento lo dice en vez de promediarlos: **el criterio 1 casi resuelve el
issue por sí solo**, porque es el que el propio criterio de decisión del issue señala.

## 3. No ofrecerlo se evalúa como opción, no como el hueco que queda

En la tabla comparativa, «no ofrecerlo» es la columna A y recibe las mismas siete filas que las otras dos. Sus
valores no son guiones: son ceros y «ninguno», que es lo que la hacen ganar. Presentarla como ausencia habría
sido presentar la conclusión como una renuncia.

## 4. El coste declara sus supuestos antes que sus números

Ningún número está medido: son estimaciones, y el documento lo dice con esas palabras. Los supuestos salen del
código donde se puede —`MAX_OUTPUT_TOKENS` es 1200— y se declaran como supuestos donde no.

Y el caso de abuso entra en la tabla con la misma forma que los dos casos felices, porque un endpoint sin
autenticación fuerte que devuelve texto de un modelo **es** una API gratuita. Presupuestar solo el uso esperado
es presupuestar el caso que no hace falta presupuestar.

## 5. Los límites se diseñan contra quien quiera abusar, no contra quien se porte bien

Un tope por instalación es trivial de sortear generando identificadores, y el documento lo dice en vez de
presentarlo como una barrera. Lo que de verdad acota el daño son dos cosas: un **presupuesto configurado en el
proveedor**, que detiene el gasto cuando el código falla, y una **forma fija de petición** — el gateway acepta
el objeto de siete campos de `shareableFacts` y nada más, nunca un prompt libre. Un endpoint que acepta texto
arbitrario es un proxy a un modelo; uno que acepta siete campos tipados es mucho menos útil para otra cosa.

## 6. La propiedad de privacidad se enuncia con su condición

«El registro no permite reconstruir el proyecto de nadie» es cierto **solo si no se registra el cuerpo de la
petición**, y ese es precisamente el campo que más tentaría registrar para depurar. El documento enuncia la
propiedad junto a la condición de la que depende, en vez de afirmarla sola.

## 7. Lo que el documento se prohíbe decidir

- No decide que nunca se haga; decide que hoy no aporta lo suficiente, y escribe cuándo se reabre.
- No mide nada, y lo dice: si la decisión se reabre, hay que medir uso real antes de dimensionar.
- No evalúa proveedores de alojamiento por nombre, porque elegir uno antes de decidir si se hace es empezar
  por el final.

## 8. Lo que este cambio no toca

`LEVELS` no gana una entrada. `inference.mjs` no cambia. La pantalla de privacidad no cambia, porque no hay
nada nuevo que prometer ni que dejar de prometer: el documento escribe qué **tendría** que cambiar si la
decisión fuera otra.
