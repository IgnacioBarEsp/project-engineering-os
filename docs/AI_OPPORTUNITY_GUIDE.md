# Decidir dónde ayuda la IA en el proceso

Esta guía opcional sirve para decidir qué conviene automatizar, qué necesita revisión y dónde la IA no
debe intervenir. Usa los recorridos y la evidencia que el equipo ya tiene. No exige otro mapa, entrevista,
servicio ni gate. La [decisión de alcance](adr/0003-ai-opportunity-guidance.md) explica por qué el CLI
todavía no genera este artefacto.

## Tres cosas distintas

| Tipo | Qué permite afirmar | Qué falta para decidir |
| --- | --- | --- |
| Capacidad instalada | Existe un comando, control o paso con un contrato verificable | Su utilidad en este equipo |
| Hipótesis | Una intervención podría ayudar en un paso concreto | Una observación y prueba que puedan refutarla |
| Fricción validada | Una observación citada confirma un obstáculo y su contexto | Evaluar alternativas; usar IA sigue siendo una decisión |

Un FAIL repetido es una señal candidata. Puede ser un defecto, una configuración incompleta, un control
que funciona correctamente o una limitación externa. No demuestra por sí solo dolor del usuario,
desperdicio ni que deba quitarse el control. Los resultados de tests tampoco sustituyen entrevistas.

## Empezar desde cero

En el día cero se puede describir el proceso instalado: propuesta desde un issue, validación de readiness,
spec, implementación, verificación, assessment de deuda, archivo y PR. Cada equipo confirma la versión y
qué pasos están configurados. No se deduce que un comando exista solo porque aparece en un documento.

La automatización puede comprobar estructura y contratos. El responsable conserva decisiones de alcance,
aceptación de riesgos y autorizaciones. La revisión visual, una entrevista o el consentimiento de una
persona requieren evidencia de esa actividad; no quedan cumplidos por un test automático.

Si el equipo decide registrar oportunidades, basta un documento propio. Por cada paso útil, anota:

| Campo | Contenido |
| --- | --- |
| Paso y capa | Actividad del proceso del equipo o recorrido del producto |
| Evidencia y estado | Fuente con fecha; `hipotesis` o `validado`, sin elevar una suposición a hecho |
| Intervención | `automatiza`, `reduce-friccion`, `no-ia` o `prohibido` |
| Decisión humana | Quién autoriza y qué comprueba antes de actuar |
| Propietario | Responsable de revisar la decisión |
| Revisión y fallback | Evento que obliga a revisarla y forma de continuar sin la intervención |

`no-ia` indica que ese paso se resuelve sin IA. `prohibido` registra un límite explícito del proyecto, con
su motivo y responsable. Ambas son decisiones válidas, no carencias.

No abras un documento vacío para cumplir una lista. Puedes no adoptar la guía. Si adoptas la capa de
producto, declara sus recorridos o `no aplica` con un motivo concreto: por ejemplo, el alcance evaluado es
un proceso interno sin recorrido de usuario final. No infieras que todas las librerías carecen de usuarios.
La ausencia del mapa después de cierto número de flujos tampoco genera deuda automáticamente.

## Reutilizar el discovery

El [Prompt 01](prompts/PROMPT_01_DISCOVERY_PROYECTO.md) ya reúne límites y revisión humana en el punto 9,
y recorridos y ground truth en el 10. Si el equipo adopta esta guía, cruza esas respuestas: para cada paso
del recorrido descrito, registra la intervención permitida, la confirmación humana y lo prohibido. Usa
`hipotesis` cuando falte evidencia. No inventes un recorrido ni hagas otra entrevista para llenar la tabla;
una duda nueva se consulta cuando afecte una decisión real.

Los recorridos del producto pertenecen al consumidor. No se copian al núcleo universal. Un investigador
puede aplicar el mismo razonamiento a su proceso de trabajo; esto no verifica la validez de sus hallazgos
científicos ni reemplaza su metodología.

## Aprender durante la operación

Revisa resultados de readiness, excepciones y el [registro de deuda](DEBT_CONTROL.md) cuando ya estés
cerrando un flujo. Identifica una señal, reproduce su causa, determina quién encuentra el obstáculo y
documenta solo lo que puedas demostrar. Compara también una corrección determinista o un cambio de
documentación antes de decidir añadir IA. Conserva fuente, propietario y condición de revisión.

Estos son hechos de este upstream, con alcance limitado:

| Evidencia | Qué demuestra | Decisión y límite |
| --- | --- | --- |
| [Inspección de Purpose, PR #44](https://github.com/IgnacioBarEsp/project-engineering-os/pull/44) y [análisis de autoaplicación](SELF_APPLICATION.md) | Un contrato de specs necesitaba una comprobación reproducible y aplicación upstream | Automatizar el contrato con un check; no demuestra una mejora cuantitativa del equipo |
| [CI y corrección del wrapper, PR #67](https://github.com/IgnacioBarEsp/project-engineering-os/pull/67) | La comparación de rutas impedía ejecutar el wrapper en macOS; la primera hipótesis sobre salida no bastó | Exigir reproducción y evidencia antes de dar por corregida una causa; un FAIL no justifica omitir el gate |
| [Reglas por ruta, PR #69](https://github.com/IgnacioBarEsp/project-engineering-os/pull/69) | Los selectores requerían archivos individuales y pruebas de su contrato | Verificar globs y ownership automáticamente; no afirma que todos los modelos sigan las instrucciones |

La interpretación del beneficio de estas decisiones sigue siendo una hipótesis hasta contar con
observaciones del equipo. No se calculan ahorros de tiempo, tokens o energía a partir de estos ejemplos.

## Ejemplos de diseño, sin observaciones inventadas

| Caso ilustrativo | Registro inicial | Qué permitiría revisarlo |
| --- | --- | --- |
| Proyecto nuevo | Capacidad: readiness comprueba campos. Hipótesis: ayudar a redactarlos reduce correcciones. Intervención: `reduce-friccion`, aprobación del responsable | Revisar una propuesta real y sus correcciones, conservando causas y contexto |
| Proceso con restricción de datos | Política del equipo: `prohibido` enviar información confidencial al asistente externo. Responsable: propietario de datos. Fallback: revisión local autorizada | Cambio explícito de política, nunca una sugerencia del modelo |
| Tarea con contrato determinista | Hipótesis: `no-ia` en el chequeo; usar un validador repetible. Responsable: mantenedor. Fallback: revisión del contrato | Un defecto reproducible del validador o cambio del contrato |

Estos casos son ilustrativos; no describen entrevistas, requisitos regulatorios ni resultados medidos.

## Propiedad y actualización

Guarda las observaciones en un documento del consumidor, por ejemplo `docs/engineering/ai-opportunities.md`,
solo si resulta útil. Su contenido no es gestionado ni regenerado por el constructor. El proceso instalado
se referencia por versión desde su documentación, separado de las observaciones locales. Un upgrade puede
cambiar capacidades; el propietario revisa las decisiones afectadas sin borrar su historial.

Un futuro formato en `.project-os/` necesita un contrato estable, uso real y migración explícita. Hoy no
hay schema, generador ni check de este mapa. Retirar la guía consiste en dejar de usarla conservando las
decisiones y fuentes que el equipo necesite.
