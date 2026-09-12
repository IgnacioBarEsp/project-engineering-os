# Relevo literal — tarea 3.1, issue #94

La tarea 3.1 queda completa en el commit que incorpora este archivo, sobre
`codex/companion-program-closeout`, partiendo de `075a18c`. Esta continuación ejecutó inferencia,
registró evidencia y preparó el commit DCO. No abrió PR, no archivó el change, no publicó core ni repitió
los cinco recorridos nativos de Claude. El programa #66 y el issue #94 siguen abiertos.

## Qué se ejecutó y qué dio

Se invocó `apps/companion/scripts/verify-model-benchmark.mjs` con la app instalada en
`<localappdata>/Programs/Project Engineering OS/resources/app`, salida en
`openspec/changes/complete-companion-program/evidence` y el ejecutable absoluto descubierto en
`<localappdata>/OpenAI/Codex/bin/7ac07f4ce733f89a/codex.exe`. Se verificaron archivo regular, ausencia de
vínculos, firma válida OpenAI OpCo, LLC y hash. CLI 0.153.4, modelo solicitado `gpt-5.5`, esfuerzo `low`.
No se instalaron modelos ni motores.

Protocolo v2 congelado a las 2026-09-12 02:46:39.998 UTC; corrida completa hasta las 02:47:35.689 UTC.
Orden: full, prepared, prepared, full, full, prepared. Seis procesos, cero fallos, cero reintentos.
Cada proceso respondió diez preguntas: cinco respondibles y cinco sin respuesta posible.

| Medida por condición | full | prepared |
| --- | ---: | ---: |
| Respuestas con valor y cita correctos | 15/15 | 15/15 |
| Abstenciones correctas | 15/15 | 15/15 |
| Mediana por lote | 8.427 ms | 9.597 ms |
| Tokens de entrada por lote | 14.467 | 12.309 |
| Tokens de salida totales | 837 | 969 |
| Bytes de contexto por lote | 9.349 | 312 |

Empate en calidad. Prepared fue más lento y produjo más salida. La preparación costó 671,9 ms y
83.755 bytes escritos; las diez búsquedas sumaron 642,9 ms. Solo el run 6 tuvo entrada en caché (9.728).
No hay ahorro de tiempo ni monetario demostrado. Los datos exactos están en `evidence/model-benchmark.json`;
los prompts/corpus en `evidence/protocol.json`, y las respuestas crudas en los seis `run-N-*.json`.

## Qué se encontró y arregló

Existían ocho JSON de un piloto temporal anterior del 11 de septiembre que no estaban en el change.
Se conservaron sin modificar en `evidence/excluded-pilot-v1/`; no se suman a la medición nueva. Ese protocolo
revelaba known/unknown en los IDs y daba texto plano a full pero JSON por pregunta a prepared.

Antes de congelar v2 se corrigieron esos sesgos: IDs opacos, el mismo envoltorio y localizadores de línea,
unión de las líneas recuperadas sin identificar preguntas vacías. Se mantuvo todo el texto legible en full.
También se arreglaron puntuación por posición, pérdida de respuestas/uso ante excepciones, puntuación de
ensayos inválidos, ausencia de métricas separadas de abstención, rutas no portables y sobrescritura de resultados.

La regla numérica exacta **no se relajó**. Una respuesta como «47 participantes» habría fallado en ambas
condiciones. La corrida nueva no rompió esa regla ni requirió arreglos después de inferir. Seis regresiones
negativas del harness comprueban IDs inválidos, citas falsas, respuestas erróneas, abstención y fallos.

## Dónde quedó el código

- `apps/companion/scripts/verify-model-benchmark.mjs:69`: protocolo congelado y hashes.
- `apps/companion/scripts/verify-model-benchmark.mjs:77`: bucle de los seis ensayos, sin reintentos.
- `apps/companion/scripts/model-benchmark.mjs:24`: rúbrica, asociación por ID y denominadores.
- `apps/companion/scripts/model-benchmark.mjs:59`: transporte conservado sin publicar IDs ni razonamiento.
- `apps/companion/scripts/model-benchmark.mjs:75`: resumen que separa ensayos inválidos.
- `evidence/model-experiment.md:60`: resultados publicados con límites por cada número.
- `tasks.md:18`: tarea 3.1 marcada. No queda inferencia en marcha ni una corrección de 3.1 pendiente.

## Validaciones terminadas

- `node --test qa/model-benchmark.mjs`: 6/6 PASS.
- `npm test` en `apps/companion`: 75/75 PASS, cero omitidos.
- `npm run check` en raíz: PASS; contrato, neutralidad, docs, workflows, deuda y 304/304 tests.
- OpenSpec oficial local 1.6.0, `validate --all --strict`: 19/19 PASS.
- `npm run check:docs` tras añadir la documentación: PASS.
- Hashes de protocolo/corpus/prompts/runner/rúbrica, seis archivos y rescoring: PASS.
- Assessment de deuda validado con `validateAssessment`: PASS.
- Inspección de patrones privados en 22 archivos JSON/Markdown de evidencia: PASS.
- Revisión adversarial independiente por otro agente: PASS CON HUECOS; cero Blocker/Major, dos Minor.
  No fue revisión humana. Dictamen y alcance en `evidence/model-review.md`.

## Decisiones y límites abiertos

1. `q02` pregunta por el financiador bajo una instrucción numérica: sus tres abstenciones por condición
   no separan falta de evidencia de restricción de formato. Las otras doce abstenciones sí corresponden
   a preguntas numéricas. Está publicado por separado; no repetir para buscar una cifra mejor.
2. Noventa de 105 líneas son relleno repetitivo y las consultas se eligieron previamente. No generalizar
   a búsqueda convencional, repositorios grandes ni selección autónoma de consultas.
3. Alias de modelo sin identidad efectiva inmutable, temperatura y presupuesto no expuestos, caché no
   controlable. No inventar parámetros, tokens, costos ni significancia estadística.
4. `evidence/model-debt-assessment.json` registra los dos Minor para incorporarlos al assessment final
   del change. No se ha capturado este assessment parcial en el registro global ni se ha pasado archive.
5. Restan 2.2 (páginas del EXE), 2.4 (lanzamientos), 3.2–3.4 (referencias/distribución) y el cierre global.
   La orden de esta continuación termina en el commit de 3.1: no iniciar PR ni archive con este dictamen.

Para un experimento futuro, usar otro directorio y otro protocolo. El runner rechaza sobrescribir estos
resultados. Los transportes completos se guardaron solo en el fixture sintético local; las rutas públicas
están ancladas con `scripts/portable-path.mjs`. Los JSON públicos preservan respuestas originales y uso
del proveedor, sin credenciales ni identificadores de sesión.
