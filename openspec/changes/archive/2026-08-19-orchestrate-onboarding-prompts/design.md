# Diseño — orquestación del prompt inicial, Prompt 00 y Prompt 01

## 1. Problema de diseño

El onboarding adaptativo tiene tres piezas que no se tocan entre sí: un clasificador read-only que decide la
ruta, un Prompt 00 que prepara la Etapa A y un Prompt 01 que conduce discovery. Falta la pieza que las une
sin convertirse en una cuarta fuente de verdad.

## 2. Decisión

Un prompt router documental, no un comando nuevo.

El router vive en `docs/prompts/PROMPT_ROUTER_INICIO.md` y en el espejo administrado
`blueprint/core/docs/engineering/PROMPT_ROUTER_INICIO.md`. Ejecuta el clasificador, muestra la ruta, pide
aprobación humana, registra el estado y entrega el control a Prompt 00 y después a Prompt 01.

### Alternativas evaluadas

| Alternativa | Ventaja | Por qué no |
| --- | --- | --- |
| Comando mutante `onboarding-record` | El CLI escribiría el estado con transacción y rollback | Amplía la superficie a `library-cli`, exige schema, journal, doctor y migración; el Issue #31 pide orquestación, no un comando |
| Fusionar Prompt 00 y Prompt 01 en un prompt único | Una sola copia para la persona | Elimina el corte de contexto entre etapas y el gate humano de cierre de Etapa A |
| Dejar la orquestación solo en la conversación | Cero archivos nuevos | La conversación no puede ser la única fuente del estado; se pierde en un chat que termina o se compacta |
| Numerar el router como Prompt 02 | Encaja con el esquema actual | El router precede a Prompt 00; un número mayor sugiere el orden inverso |

## 3. Responsabilidades sin duplicación

| Superficie | En el router | Fuera del router |
| --- | --- | --- |
| Clasificador (`onboarding-plan`) | Detecta evidencia, elige ruta y emite estado canónico | No explica, no entrevista, no escribe |
| Router | Explica justo a tiempo, pide gates, registra estado, entrega el control | No ejecuta bootstrap, no entrevista producto |
| Prompt 00 | Prepara y verifica la Etapa A según la ruta | No reabre la clasificación, no pregunta stack ni producto |
| Prompt 01 | Entrevista discovery reutilizando hechos confirmados | No repite lo ya respondido, no instala el stack recomendado |

El router referencia cada prompt por su archivo. No copia sus instrucciones. Esa regla se verifica: el
contrato de prompts exige referencias a Prompt 00 y Prompt 01 y prohíbe una sexta pregunta de clasificación.

## 4. Registro del estado y gate humano

El estado se registra en `.project-os/onboarding-state.json`, la ruta que el clasificador ya lee como
entrada. Secuencia:

1. `onboarding-plan --target . --answers onboarding-answers.json --json` produce el objeto `state`.
2. El router muestra ese objeto y pide aprobación explícita.
3. Con aprobación, se escribe el objeto tal cual, sin campos añadidos.
4. La verificación vuelve a ejecutar el clasificador con `--state`; un estado no canónico falla con
   recuperación y no se corrige a mano.

Sin aprobación no se escribe nada y el recorrido continúa declarado como provisional. El archivo de
respuestas y el archivo de estado se pasan siempre por bandera para que la inspección los ignore y no se
confundan con trabajo existente.

## 5. Límite conocido: reclasificar después del bootstrap

El bootstrap añade archivos administrados al repositorio. Una ejecución posterior de `onboarding-plan`
encontrará esa evidencia y clasificará `brownfield` aunque el recorrido haya empezado como `beginner`. Ese
resultado describe el repositorio actual, no la decisión de entrada.

El router lo declara de forma explícita: la ruta registrada es la ruta de referencia del recorrido y no se
sobrescribe en silencio. La validación disponible después del bootstrap es la canonicalidad del estado
registrado contra su propia evidencia, que el lector del clasificador ya comprueba antes de reutilizarlo.

No se añade un bloqueo ejecutable porque exigiría cambiar el contrato de estado de #30, y eso pertenece a un
cambio propio con su migración.

## 6. Paridad raíz y blueprint

La versión raíz es explicativa y la versión del blueprint es condensada, igual que Prompt 00 y Prompt 01. La
paridad no puede ser byte a byte. Se fija como contrato compartido:

- las tres rutas `beginner`, `experienced-new` y `brownfield`;
- las cinco preguntas del clasificador, sin una sexta;
- la referencia a `onboarding-plan` y a `.project-os/onboarding-state.json`;
- las referencias a Prompt 00 y Prompt 01;
- los marcadores de aprobación humana, relevo y recuperación;
- la salida hacia discovery y la prohibición de elegir stack o arquitectura antes.

`scripts/prompt-contract.mjs` extrae ese contrato de cualquier texto y `test/prompts.test.mjs` lo aplica a
los archivos reales y a textos sintéticos que deben fallar.

## 7. Ownership

El upstream posee router, prompts, manifest, contrato y pruebas. El repositorio consumidor posee sus
respuestas, el estado registrado y las decisiones posteriores. OpenSpec conserva OPSX. Los trackers remotos
pertenecen a #33 y los adapters por agente a #32.

## 8. Compatibilidad, costo y recuperación

No cambian comandos, banderas, exports ni schemas. Un repositorio ya bootstrapeado recibe el archivo nuevo
en el siguiente `sync` o `upgrade` como archivo administrado; no hay colisión humana esperada porque el
nombre es nuevo.

Costo incremental cero, licencia MIT sin cambios, sin dependencias, cuentas ni servicios.

La recuperación documentada cubre estado ausente, estado inconsistente o futuro, aprobación denegada,
clasificador no disponible en la versión publicada y evidencia cambiada después del bootstrap. Ninguna de
esas situaciones autoriza a editar el estado a mano ni a suponer una ruta.
