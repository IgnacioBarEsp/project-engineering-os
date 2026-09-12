# Experimento pareado de inferencia — tarea 3.1 de #94

## Método, fijado antes de los resultados

Esta medición compara **dos contextos entregados al mismo modelo solicitado**, usando la capa de servicio
de Companion **instalado**, versión 0.1.0 y núcleo 0.5.0. No instala modelos, no abre una aplicación de IA
y no vuelve a ejecutar los recorridos nativos. Usa la cuenta existente mediante el ejecutable de Codex
descubierto en una ubicación conocida: archivo regular sin vínculos, firma válida y editor OpenAI OpCo,
LLC. Versión del CLI: 0.153.4. Sus hashes y los de los módulos instalados están en [protocol.json](protocol.json).

El protocolo v2 se guardó a las **2026-09-12 02:46:39.998 UTC**, antes de la primera inferencia. Conserva
el corpus completo, las diez preguntas, sus respuestas de referencia, esquema, prompts exactos y hashes.
`source.commit` identifica el HEAD base durante la corrida, con cambios locales del instrumento;
`runnerSha256` y `rubricSha256` identifican los bytes ejecutados que se incluyen en este commit de evidencia.
El corpus sintético tiene cinco archivos Markdown, 7.379 bytes y 105 líneas: temas de investigación,
software, Unity, creación y trabajo general. Cinco preguntas tienen un valor numérico explícito y cinco
carecen de respuesta en los documentos. Los identificadores enviados son opacos (`q01`–`q10`); el modelo
no recibe la rúbrica, la etiqueta respondible/no respondible ni las respuestas esperadas.

- **full:** todo el texto legible, sin filtro por extensión ni truncamiento, con un localizador por línea.
- **prepared:** unión de las líneas que devuelve el buscador instalado para las diez consultas fijadas.
  Las citas se resuelven contra el corpus original antes de usarlas. No se envía un mapa por pregunta
  ni una marca que anuncie cuáles no devolvieron coincidencias.
- Ambas condiciones usan la misma función para ordenar y renderizar líneas, el mismo encabezado de
  contexto, preguntas, instrucciones, esquema JSON y argumentos del CLI. Solo cambia el texto de fuentes.
- Se ejecutaron seis procesos nuevos, secuenciales, sin reintentos: `full, prepared, prepared, full,
  full, prepared`. Cada proceso respondió el mismo lote de diez preguntas. Son tres repeticiones por
  condición, **no treinta preguntas independientes**.
- Modelo solicitado: `gpt-5.5`, esfuerzo `low`, esquema idéntico y timeout de 180 segundos por lote.
  Temperatura y presupuesto máximo de salida: **no expuestos** por esta interfaz. El servicio no devuelve
  un identificador inmutable del modelo efectivo; el nombre registrado es el alias solicitado.
  Caché del proveedor: **no controlada**. No se declara una comparación de caché fría.

Las consultas lexicales se escribieron antes de inferir; su elección autónoma no se mide. Los cinco temas
usan el recuperador documental: no se evalúan aquí cambios de código, CodeGraph, producción multimedia
ni habilidades generales de esas cinco profesiones.

## Rúbrica y fallos

Se conserva la regla estricta para las dos condiciones: `answer` debe ser exactamente el valor numérico
solicitado, sin normalización. **«47 participantes» habría sido incorrecto**; no se necesitó cambiar la
regla después de ver las respuestas. Para una respuesta respaldada también se exige la cita exacta
`archivo:Llínea` y la frase literal del corpus. Una cita válida no justifica un número equivocado.

La abstención es una medición separada: en las preguntas sin respuesta, `abstain=true` y los campos
`answer`, `citation` y `quote` deben estar vacíos. También se cuentan las abstenciones indebidas ante
preguntas respondibles y las respuestas emitidas sin respaldo.

Las respuestas se asocian por ID; cambiar su orden no cambia la nota. IDs repetidos, ausentes o ajenos,
tipos incorrectos, uso de herramientas o transporte incompleto invalidan el ensayo. Se conservan sus
respuestas y uso disponible, y se cuentan como fallos fuera de los resúmenes de calidad y latencia.
El runner no vuelve a intentarlo ni sobrescribe un resultado anterior. Un resultado de calidad peor para
`prepared` es un resultado válido, no un error de ejecución.

**Límite de una pregunta de abstención:** `q02` pregunta quién financia el ensayo, mientras la instrucción
global solicita respuestas numéricas. Sus tres abstenciones por condición no permiten separar ausencia
de evidencia de la restricción de formato. Las otras cuatro preguntas sin respuesta son numéricas:
latencia, gravedad, semilla e impuestos. Se publican ambas partes por separado abajo.

## Resultado real: empate en calidad; prepared fue más lento

Los seis procesos completaron inferencia real entre las 02:46 y 02:47 UTC. Ninguno falló el protocolo;
ninguno usó herramientas. No hubo reintentos, respuestas descartadas ni cambios posteriores de rúbrica.
La salida completa está en [model-benchmark.json](model-benchmark.json).

| Resultado | full | prepared | Qué no demuestra |
| --- | ---: | ---: | --- |
| Lotes válidos / intentados | 3/3 | 3/3 | Disponibilidad futura del proveedor. |
| Valores correctos con cita y frase exactas | 15/15 | 15/15 | Superioridad de calidad: hay empate en cinco preguntas sencillas repetidas. |
| Abstenciones correctas, todas las preguntas sin respuesta | 15/15 | 15/15 | Capacidad general de abstención; una pregunta tiene la limitación de formato descrita. |
| Abstenciones en las cuatro preguntas numéricas sin respuesta | 12/12 | 12/12 | Resultado sobre preguntas nuevas o corpus ambiguos. |
| Abstenciones en `q02`, identidad del financiador | 3/3 | 3/3 | Que la ausencia de evidencia sea la única causa de abstenerse. |
| Abstenciones indebidas en preguntas respondibles | 0/15 | 0/15 | Ausencia universal de rechazos incorrectos. |
| Respuestas emitidas sin respaldo, según esta rúbrica | 0 | 0 | «Cero alucinaciones» fuera de este fixture de valores y citas. |
| Mediana de latencia por lote | 8.427 ms | 9.597 ms | Significancia estadística o rapidez general; n=3 y caché no controlada. |
| Rango de latencia por lote | 8.311–9.294 ms | 9.149–10.897 ms | Latencia por pregunta: se respondió un lote. |
| Tokens de entrada del proveedor por lote | 14.467 | 12.309 | Ahorro monetario o tokens exclusivos del documento; incluye instrucciones internas del CLI. |
| Tokens de salida, suma de tres lotes | 837 | 969 | Menor esfuerzo o costo para prepared: generó más salida. |
| Bytes de fuentes enviados por lote, con localizadores | 9.349 | 312 | Tokens; estos son bytes medidos. Tampoco mide bytes leídos por búsqueda. |

La preparación inicial tardó **671,9 ms** y escribió **83.755 bytes** bajo `.project-os`. Las diez
búsquedas previas sumaron **642,9 ms**. Ese costo se registra aparte de las latencias de los procesos de
inferencia; no incluye acción humana ni descarga. Con estas tres repeticiones y esta latencia observada
**no hay amortización temporal demostrada** para prepared. No se modelaron precios ni ahorro de factura.

El contexto completo contiene 90 líneas de registro auxiliar repetitivo entre 105. La reducción de bytes
se explica en buena parte por eliminarlas. No demuestra ventaja contra una búsqueda lexical competente,
ni predice repositorios grandes; `full` es lectura completa con citas, no un competidor comercial.

## Datos por ejecución y caché

Los contadores siguientes son los que expuso el proveedor. No se dedujeron de caracteres. El campo de
razonamiento se reproduce separado; no se suma de nuevo a salida para inventar un total.

| Registro | Entrada | Entrada en caché | Salida | Salida de razonamiento |
| --- | ---: | ---: | ---: | ---: |
| [1 · full](run-1-full.json) | 14.467 | 0 | 279 | 0 |
| [2 · prepared](run-2-prepared.json) | 12.309 | 0 | 321 | 40 |
| [3 · prepared](run-3-prepared.json) | 12.309 | 0 | 318 | 37 |
| [4 · full](run-4-full.json) | 14.467 | 0 | 279 | 0 |
| [5 · full](run-5-full.json) | 14.467 | 0 | 279 | 0 |
| [6 · prepared](run-6-prepared.json) | 12.309 | 9.728 | 330 | 49 |

Cada registro conserva `rawResponse` sin reformatear, respuesta parseada, mensajes de respuesta del
transporte, evento de uso, latencia, hash del prompt, tipos de eventos y fallos. Se excluyen IDs de sesión,
credenciales, razonamiento interno y argumentos de herramientas del material público. El transporte
completo permanece solo en el fixture local para diagnóstico, con hash y ruta anclada mediante
`scripts/portable-path.mjs`. No hubo datos privados que redactar de las respuestas de esta corrida.

## Arreglos del instrumento y antecedente excluido

Al inspeccionar la máquina había una corrida temporal anterior del 11 de septiembre a las 21:51–21:52 UTC.
No figuraba en el change. Se conserva íntegra en [excluded-pilot-v1](excluded-pilot-v1/README.md), con su
protocolo y seis archivos de resultados. **Queda excluida**, sin combinar sus observaciones con v2.

Antes de congelar v2 se corrigió lo siguiente:

1. Los IDs `known`/`unknown` filtraban la clasificación; ahora son opacos.
2. `full` recibía texto plano y `prepared` un JSON por pregunta; ahora comparten envoltorio y localizadores,
   y prepared contiene una unión de líneas sin revelar qué pregunta encontró una coincidencia.
3. Se exigía orden de respuesta y se puntuaba por posición; ahora se exige correspondencia única por ID.
4. Una excepción podía perder la respuesta cruda o el uso de transporte y aun puntuar una respuesta
   inválida. Ahora se retienen antes de evaluar y ningún ensayo inválido infla el resultado.
5. Las abstenciones estaban mezcladas en un total de «aciertos»; ahora tienen denominadores y errores propios.
6. Se añadieron identidad del CLI y módulos instalados, formato portable de rutas, hashes, protocolo guardado
   antes de ejecutar y rechazo de sobrescritura. El núcleo y sus protecciones no cambian.

Las seis regresiones del instrumento prueban estas reglas, incluso valores erróneos con citas verdaderas,
IDs repetidos, uso de herramientas y un método preparado que pierde. **La corrida nueva no rompió la
comparación exacta**, así que no se aplicó normalización alguna para mejorar sus resultados.

## Sobre qué versión se midió

Este experimento corrió contra la aplicación instalada **antes** de que los cambios de código de esta rama
entraran en el artefacto entregado. `protocol.json` guarda el hash de cada módulo que usó, así que puede
comprobarse cuál fue; `desktop/service.mjs` quedó en `412d90a9…` y el entregado es `0d7dfb3e…`.

Lo detectó una revisión adversarial independiente. Los recorridos nativos sí se reejecutaron contra el
artefacto entregado y reprodujeron su resultado; **esta medición no se repitió**, porque repetirla consume
inferencia de pago y el resultado publicado —un empate— no se vuelve más favorable al producto por medirlo
de nuevo. Se declara en vez de corregirse en silencio: las cifras de abajo describen la versión que
`protocol.json` identifica, no necesariamente la que se entrega.

## Reproducir y continuar

Desde `apps/companion`, usar el CLI instalado descubierto y revisado y un directorio de evidencia nuevo:

```text
node scripts/verify-model-benchmark.mjs <installed-app> <fresh-evidence-directory> <reviewed-absolute-codex-exe>
```

El runner no instala software ni compra créditos. Cambiar corpus, preguntas, modelo o regla exige otro
protocolo y otro directorio; nunca reemplazar estos datos. Ver [model-review.md](model-review.md) para la
revisión independiente y [HANDOFF.md](../HANDOFF.md) para checks, deuda y trabajo que permanece fuera de 3.1.
