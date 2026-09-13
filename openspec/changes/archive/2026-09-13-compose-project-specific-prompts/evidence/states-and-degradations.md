# Estados y degradaciones

Qué hace esta parte de la aplicación cuando algo no está disponible, y cómo se midió cada caso. Todo se
observó ejecutando lo que se nombra en cada fila.

## Los cuatro niveles

| Situación | Qué muestra | Cómo se midió |
| --- | --- | --- |
| Sin ningún modelo | La aplicación completa. El texto lo escribe la plantilla, aquí, y la pantalla dice «Solo plantillas, en este equipo». No se presenta como un modo degradado. | `qa/prompts.mjs`, servicio real con un cliente que se niega a llamar a nada. |
| Hay un modelo en este equipo | El nivel se ofrece y la pantalla dice cuántos modelos responden. | `scripts/verify-prompts.mjs`: 14 modelos detectados en 12 ms. |
| No hay ningún modelo en este equipo | El nivel aparece deshabilitado con esa causa, no oculto. | `qa/prompts.mjs`, con la detección devolviendo que no hay nada. |
| El proveedor gratuito | Viene apagado. Encenderlo pide la clave y muestra qué recibe y qué no antes de la primera llamada. | `qa/prompts.mjs`: `level` es `off` en un servicio recién creado. |
| Falta la clave | No se hace ninguna llamada y la causa es «falta la clave de tu proveedor». | `qa/prompts.mjs`, contando llamadas. |
| Proveedor caído | Degrada en **2 ms** con «no se pudo hablar con el proveedor». | `verify-prompts.mjs` contra un puerto cerrado. |
| Proveedor lento | Degrada al vencerse el límite: **25 005 ms** contra un límite de 25 000. | `verify-prompts.mjs` contra un servidor que nunca contesta. |
| Respuesta que no es una compleción | «el proveedor no devolvió texto». | `qa/prompts.mjs`, servidor real devolviendo otra cosa con 200. |
| Respuesta más grande que el máximo | «la respuesta era demasiado grande», cortada mientras se lee y no después. | `qa/prompts.mjs`, servidor real devolviendo más de 256 KiB. |
| Límite de uso del proveedor | «el proveedor respondió 429». | `qa/prompts.mjs`. |
| El modelo solo razona | «el modelo gastó su turno razonando y no devolvió instrucciones». | Medido antes contra un modelo real de este equipo: 46 caracteres de respuesta y 3 584 de razonamiento. |
| El modelo responde algo peor | Se usa la plantilla y la pantalla dice qué le faltó. | `verify-prompts.mjs`: 552 caracteres contra 2 238, sin nombrar el tipo de proyecto ni el objetivo. |
| La petición llevaría datos de la carpeta | **No se envía**, y el nivel degrada con esa causa. | `qa/prompts.mjs`, poniendo una ruta dentro del objetivo de la persona. |
| Un proveedor fuera de la lista | Se rechaza antes de construir la dirección. | `qa/prompts.mjs`. |

## Degradaciones declaradas

- **La plantilla es el piso, y el piso ganó.** En la única medición contra un modelo real, el modelo no lo
  superó. Este cambio no demuestra que un modelo mejore el texto; demuestra que cuando no lo mejora, no se
  usa.
- **Lo que la propia IA de la persona reporta no sale de este equipo**, ni siquiera hacia un modelo. Se usa
  para escribir el texto local y está fuera de los datos que viajan. La pantalla lo dice.
- **La clave no se guarda en ninguna parte.** Vive en memoria mientras la aplicación está abierta. Eso evita
  inventar un almacén de credenciales en una aplicación que se empaqueta en texto plano, y tiene el costo de
  pedirla otra vez en cada sesión. La pantalla lo dice antes de que la persona la pegue.
- **Un modelo en este equipo puede tardar minutos la primera vez** mientras carga sus pesos: 87 s medidos en
  frío. Por eso el límite local es de 120 s y no de 25, y por eso la llamada es cancelable con Detener.
- **Los niveles 2 y 3 no se probaron contra un proveedor real.** Lo que se midió es este cliente contra
  servidores que se comportan como un proveedor caído, lento, ruidoso o limitado.

## Decisiones registradas

- **El nivel 2 sale apagado.** El issue lo dejaba abierto y se inclinaba por eso. La razón para fijarlo: los
  tiers gratuitos suelen entrenar con lo que reciben, y aceptar eso en nombre de otra persona no es un valor
  por omisión que nadie pueda poner.
- **El agregado es una forma, no un filtro.** El inventario lleva la ruta de cada archivo; lo que viaja se
  reconstruye campo por campo. Quitar campos de un objeto general sería un filtro que alguien tiene que
  mantener correcto cuando el objeto crezca.
- **La clave no se persiste**, con el costo declarado arriba.
