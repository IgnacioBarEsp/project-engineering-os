# Revisión adversarial independiente — tarea 3.1

Fecha: 2026-09-12 UTC. Revisor: agente separado de quien modificó y ejecutó el experimento, en una
**revisión adversarial local prestada**. Solo lectura; no ejecutó inferencias nuevas ni modificó archivos.
No hubo revisión humana. El alcance fue el instrumento, sus regresiones y los resultados de 3.1, no el
instalador, la landing ni el cierre completo del programa.

**Dictamen recibido: PASS CON HUECOS. Cero Blocker, cero Major y dos Minor.** Permite registrar la tarea
y sus límites en un commit; no aprueba archive ni cierre de #94/#66.

El revisor ejecutó las seis regresiones del harness, comprobó hashes de corpus/prompts/runner/rúbrica,
reconstruyó full byte por byte y confirmó que contiene todo el corpus legible con los mismos localizadores.
Comprobó que los prompts no incluyen la clave, etiquetas known/unknown ni correspondencias de resultados
por pregunta. Recalculó las seis puntuaciones y contrastó tokens, caché y medianas con los archivos crudos.
Inspeccionó evidencia pública en busca de rutas personales y patrones de credenciales sin encontrarlos.

Confirmó el empate: 15 valores con cita correcta y 15 abstenciones por condición; son cinco preguntas de
cada tipo repetidas tres veces, no treinta afirmaciones citadas. Confirmó también que prepared fue más
lento: mediana de 9.597 ms frente a 8.427 ms, pese a menor entrada de tokens. Identificó caché únicamente
en el último ensayo prepared.

## Minor conservados

1. `q02` pregunta quién financia, pero la instrucción global exige una respuesta numérica. Las tres
   abstenciones de esa pregunta por condición no separan ausencia de evidencia de restricción de formato.
   Se separan explícitamente de las doce abstenciones de preguntas numéricas en `model-experiment.md`.
2. Noventa de las 105 líneas son relleno repetitivo y las consultas lexicales están escogidas de antemano.
   La reducción de contexto caracteriza el fixture y no prueba superioridad sobre una búsqueda convencional
   ni capacidad autónoma de elegir consultas. Está declarado junto a los resultados.

El revisor recomendó documentar estos límites sin volver a ejecutar para obtener un resultado más favorable.
El alias del modelo, controles no expuestos y caché no controlada permanecen visibles. El piloto v1 queda
excluido y nunca se suma a la corrida v2.
