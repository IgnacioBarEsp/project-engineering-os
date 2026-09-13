# Propuesta

Issue [#107](https://github.com/IgnacioBarEsp/project-engineering-os/issues/107).

## Por qué

El mantenedor ofreció prestar su clave de pago para que quien no tenga modelo local ni clave propia pueda usar
el nivel de personalización. La oferta es generosa y la pregunta que abre es seria: **¿qué haría falta para
ofrecer eso sin repartir una clave, sin exponer su máquina y sin cargar con datos de otras personas?**

Las dos formas obvias ya están descartadas por lo que el producto es. Meter la clave en la aplicación no se
puede: el companion se empaqueta con `asar: false` —decisión de #80 para que el Node administrado lea los
módulos copiados— así que su código viaja en texto plano y la clave se extraería en segundos. Y llamar a un
modelo en la computadora del mantenedor convierte su equipo apagado en la caída de todos, exige túnel y
autenticación, y hace pasar por su máquina lo que otras personas escriben.

Así que queda la tercera forma: un gateway hosteado. Este issue **no lo construye**. Evalúa qué haría falta y
recomienda hacerlo o no hacerlo.

## Qué se va a hacer

Un registro de decisión que responda seis cosas, contra criterios escritos **antes** de mirar ninguna opción
—los mismos seis del issue enriquecido—:

1. **Qué aporta que los tres niveles existentes no den.** `off` con plantillas, `local` con un modelo propio y
   `provider`/`own-key` con la clave de la persona ya cubren a todo el mundo. Si la respuesta es «nada», el
   criterio de decisión del issue ya la resolvió.
2. **Al menos dos opciones de alojamiento comparadas, más la de no ofrecerlo**, que es una opción de pleno
   derecho y se evalúa como tal.
3. **Coste estimado con supuestos de volumen explícitos**, incluido el caso de abuso y no solo el feliz.
4. **Límites diseñados contra alguien que intente usarlo como API gratuita**, no contra un usuario educado.
5. **Qué se registra, cuánto se conserva y qué ve el mantenedor**, comprobando que eso no permita reconstruir
   el proyecto de nadie.
6. **Qué tendría que dejar de prometer la aplicación** si este nivel existe.

Y una **recomendación explícita con su razón**.

## Qué no se va a hacer

- **No se construye.** Ni servidor, ni dominio, ni cuenta a nombre del proyecto, ni código de gateway.
- **No se añade un quinto nivel** a `LEVELS`. El código de inferencia no se toca.
- **No se recomienda hacerlo por ser posible.** La pregunta es qué aporta, no si se puede.
- No se estima ningún coste sin declarar el volumen del que sale.

## Riesgos

- **Recomendar por inercia.** Un documento que describe un diseño concreto y detallado se lee como una decisión
  ya tomada. Mitigación: la recomendación va primero y el diseño después, como lo que haría falta *si* se
  decidiera, no como un plan.
- **Estimar solo el caso feliz.** Mitigación: el caso de abuso entra en la estimación, con su propio supuesto.
- **Subestimar la obligación continua.** Operar un servicio con datos de terceros no termina cuando se
  despliega. Mitigación: el trabajo continuo es uno de los seis criterios, no una nota al pie.
