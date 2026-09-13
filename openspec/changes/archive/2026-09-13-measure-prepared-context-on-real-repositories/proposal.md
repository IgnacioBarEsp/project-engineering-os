# Propuesta

Issue [#105](https://github.com/IgnacioBarEsp/project-engineering-os/issues/105), continuación del programa
[#66](https://github.com/IgnacioBarEsp/project-engineering-os/issues/66) y de su protocolo de evaluación en
`docs/companion/EVALUATION.md`.

## Por qué

Hay una afirmación que el mantenedor quiere poder hacer —«haz que tus agentes lean tus archivos más rápido»— y
que hoy **no tiene respaldo**. La única medición que existe corrió sobre un corpus sintético de 6812 bytes con
relleno repetitivo, y con modelo real terminó en empate: las mismas respuestas con cita en las dos condiciones,
con el contexto preparado **más lento**. Por eso la landing no afirma velocidad, y hace bien.

Un corpus de siete kilobytes no predice nada sobre un repositorio de veinte megabytes. Ese es el límite que la
página de evidencia ya declara, y este cambio existe para resolverlo: llevar el instrumento que ya existe a
repositorios reales y grandes, y publicar lo que salga.

**Lo que salga.** El issue lo dice y conviene repetirlo aquí porque es la parte fácil de traicionar: este
cambio puede terminar diciendo que preparar no mejora nada medible, y eso sería un resultado válido. Dos veces
en este proyecto una revisión encontró la medición construida para que el producto no pudiera perder —una de
ellas publicaba 5/10 para el barrido literal porque el script decidía por extensión qué archivos abrir y nunca
abría el PDF—. La tercera vez la defensa se pone en el procedimiento, no en la intención de quien mide.

## Qué se va a hacer

**Elegir por criterios escritos antes, no por resultado.** Los seis criterios están en el issue enriquecido y
se fijaron antes de mirar ningún candidato: público y citable por commit; al menos 2000 archivos de texto y
20 MB de fuentes legibles; ajeno a este proyecto y a sus autores; de dominios distintos entre sí, uno con peso
en prosa y otro en código; nombrado y fijado **antes** de correr una sola pregunta; y sin añadirle nada que el
producto sepa leer mejor. Un candidato descartado después de fijarlo se publica con su motivo.

**Congelar las preguntas por digesto.** Las preguntas, su fuente y su respuesta conocida se escriben, se les
calcula un digesto y el digesto se declara en el arnés. El arnés **se niega a correr** si el archivo no
coincide. Cambiar una pregunta después de ver un resultado deja de depender de la honestidad de nadie.

**Tratar las tres vías igual.** Las mismas preguntas, las mismas instrucciones y localizadores comparables para
abrir el corpus, para el barrido literal y para el contexto preparado — que es lo que el arnés actual ya hace y
lo que no se va a relajar al cambiar de corpus.

**Medir lo que se puede medir y decir el resto.** Bytes devueltos y bytes leídos por separado, archivos
abiertos, tiempo de preparación y bytes escritos. El uso de tokens se reporta como lo exponga el proveedor o
como **no medido**; nunca estimado desde bytes.

**Publicar el resultado y corregir lo publicado si lo contradice.** `docs/companion/EVIDENCE.md` se actualiza
con lo que salga, y si contradice lo que la landing dice hoy, se corrige la landing.

## Qué no se va a hacer

- **No se toca el producto para mejorar el número.** Si el resultado es malo, primero se publica. Es el criterio
  de decisión del issue y aquí se respeta sin excepción.
- No se afirma nada sobre uso de tokens que el proveedor no exponga.
- No se afirma nada sobre alucinaciones: este método no puede observarlas, y el arnés ya lo dice.
- No se añade al corpus ningún formato que el producto lea mejor. El corpus es el que el repositorio tiene.

## Capacidades

### Capacidades modificadas

- `companion-evaluation`: la medición reproducible deja de limitarse al corpus sintético y define cómo
  congelar, ejecutar y publicar una comparación sobre repositorios públicos grandes sin construir el
  instrumento para que Companion gane.

### Capacidades nuevas

Ninguna. Este cambio amplía el contrato de evaluación; no añade comportamiento a Companion.

## Impacto

El cambio afecta al arnés de aceptación de `apps/companion`, a la evidencia versionada del issue y a
`docs/companion/EVIDENCE.md`. La landing solo cambia si el resultado medido exige corregir o acotar una
afirmación pública. No cambia el runtime, el formato del contexto ni el paquete universal.

## Riesgos

- **Elegir repositorios que favorezcan al producto.** Mitigación: criterios escritos antes de mirar candidatos,
  repositorios fijados por commit antes de correr, y descartes publicados con su motivo.
- **Cambiar una pregunta después de ver un resultado.** Mitigación: digesto declarado y arnés que se niega a
  correr si no coincide.
- **Que una vía reciba una pista que otra no tenga.** Mitigación: el trato simétrico se comprueba, no se promete.
- **Que un resultado desfavorable tarde en publicarse.** Mitigación: la publicación es parte del mismo cambio,
  no un seguimiento posterior.
