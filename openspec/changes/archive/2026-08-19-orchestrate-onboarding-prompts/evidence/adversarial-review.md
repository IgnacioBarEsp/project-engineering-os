# Revisión adversarial

**Alcance:** Issue #31 y change `orchestrate-onboarding-prompts`.

**Fuentes:** issue enriquecido, proposal, design, spec delta, tasks, diff contra `origin/main`, router raíz y
del blueprint, Prompt 00 y Prompt 01 en ambas versiones, manifest, contrato de prompts, 9 pruebas nuevas,
suite completa, fixture de bootstrap, recorrido ejecutado de las tres rutas y reclasificación posterior al
bootstrap.

## Alineación spec/tareas

- El router es una entrada única: clasifica, explica, registra y delega; no ejecuta bootstrap ni entrevista.
- Las cinco preguntas provienen del clasificador y el contrato falla si aparece una sexta.
- El registro del estado exige aprobación humana explícita y sin ella no se escribe nada.
- Las tres rutas terminan en discovery y la arquitectura del producto queda después.
- Prompt 00 conserva su prohibición de preguntar por stack o producto completo.
- Prompt 01 reutiliza hechos confirmados y solo confirma lo que cambió.
- Trackers remotos, adapters por agente y catálogo de skills/MCP permanecen fuera.

## Hallazgos corregidos

| Severidad | Área | Hallazgo adversarial | Corrección y evidencia |
| --- | --- | --- | --- |
| Major | Ejecutabilidad | El paso 1 del router pasaba `--answers onboarding-answers.json` antes de que el archivo existiera; el clasificador trata esa ruta como obligatoria y el primer comando del recorrido habría fallado. | El paso 1 clasifica sin `--answers`; el paso 2 crea el archivo y solo entonces repite con la bandera. Verificado en los cuatro escenarios del recorrido ejecutado. |
| Major | Ejecutabilidad | El router asumía el binario `project-os` en una carpeta vacía, donde todavía no hay paquete instalado. | El router usa `npx --yes create-project-engineering-os@<VERSION_APROBADA>` y declara la forma equivalente para un repositorio ya bootstrapeado. |
| Minor | Duplicación de verdad | Los pasos por ruta del router podían leerse como una segunda copia de `nextSteps` del clasificador. | Se separa el límite en el diseño: el clasificador emite recomendaciones del CLI y el router fija el orden conversacional del Issue #31. Los IDs de ruta se derivan del runtime, así que una ruta nueva rompe el contrato. |
| Minor | Falso verde | Una reescritura del router podía conservar los marcadores y perder el sentido. | El contrato declara que fija estructura y no semántica; la revisión humana sigue siendo el gate de cierre y el diseño lo dice sin adornos. |
| Minor | Documentación | `README.md` y `docs/ADAPTIVE_ONBOARDING.md` podían leerse como si el router ya estuviera publicado en npm. | Ambos separan `main` de npm `0.1.6`; el router repite ese límite en su nota de disponibilidad. |
| Minor | Fuente única | `docs/ONBOARDING_PLAN.md` seguía diciendo que la orquestación estaba pendiente. | La sección explica ahora quién registra el estado, que el comando sigue read-only y qué pasa después del bootstrap. |

## Casos negativos y de abuso

- Un router sin la ruta `brownfield`, con una sexta pregunta, sin gate humano, sin referencia a Prompt 01 o
  que termina antes de discovery falla el contrato con un identificador concreto.
- Un router que copia `npm ci` o `npm run project-os:check` falla por duplicar instrucciones de etapa.
- Una versión raíz o blueprint que cambia el orden de una ruta rompe la paridad.
- Un Prompt 01 que entrevista desde cero falla sus marcadores.
- Escribir el estado y las respuestas antes del bootstrap no convierte una carpeta nueva en `brownfield`.
- Un estado registrado no canónico falla en el propio lector del clasificador, se conserva para rollback y
  se regenera; no se repara a mano.
- Una carpeta con `AGENTS.md` y código fuerza `brownfield` y prohíbe rebootstrap aunque la persona pida una
  ruta breve.

## Preguntas y suposiciones resueltas

**¿Debía este change añadir un comando mutante que escribiera el estado?** No. El Issue #31 pide
orquestación. Un `onboarding-record` con transacción, journal, schema y migración amplía la superficie a
`library-cli` y merece su propio change con su propia evidencia. El registro queda donde ya estaba la
decisión humana: en la conversación, con el archivo que el clasificador ya sabe leer y validar.

**¿El gate humano es ejecutable?** No, y no se presenta como tal. Es una instrucción del prompt. Lo
ejecutable es que el CLI sigue siendo read-only: ninguna ruta se escribe por el runtime. Esa degradación
está declarada en la revisión manual.

**¿Se puede verificar la ruta después del bootstrap?** Solo parcialmente. El lector del clasificador valida
la canonicalidad del estado registrado contra su propia evidencia, pero una reclasificación posterior
describe el repositorio actual y devolverá `brownfield`. Bloquear eso exigiría cambiar el contrato de estado
de #30 con su migración; pertenece a un change propio.

## Deuda residual detectada

`openspec/specs/adaptive-onboarding/spec.md` conserva `Purpose: TBD`, generado por el archive de #30. Este
change no puede corregirlo por su cuenta: solo la CLI OpenSpec fijada escribe specs activas durante el
archive. Queda registrado como candidato verificado, categoría `technical-debt`, severidad `minor`, sin
riesgo transversal.

## Veredicto

**PASS.** Cero Blockers y cero Majors abiertos. Dos Majors y cuatro Minors se corrigieron antes del cierre.
Queda un candidato de deuda minor preexistente, registrado y no silenciado. Archivar es aconsejable después
de repetir la suite final y el gate de readiness.
