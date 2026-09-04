# Revisión adversarial - research-package-manager-supply-chain

Fecha operativa: 30 de agosto de 2026. Resultado: **PASS con cero Blockers y cero Majors abiertos.**

La investigación llegó con una premisa que el propio issue invitaba a refutar, así que el riesgo no era
aceptarla sino rechazarla con demasiada facilidad. La revisión atacó cinco cosas: que la conclusión no fuera
sesgo de confirmación, que cada dato de la matriz sea verificable, que las premisas heredadas del issue sean
ciertas, que el rechazo no equivalga a inercia, y que la comparación no falsee a los candidatos.

## Hallazgos

### 1 · Major (corregido) — una premisa del issue se estaba dando por cierta

**Cómo apareció.** El planteamiento afirma que `blueprint/core/package.json` acopla los repositorios
generados a npm mediante `npm exec --yes=false -- openspec ...` en cuatro scripts. Es el único dato del
issue que describe código en vez de citar una fuente externa, así que se comprobó contra `main` antes de
usarlo para cargar de costo la superficie 2.

**Por qué era un defecto.** Verificado contra `main`, es falso: los cuatro scripts `openspec:*` invocan
`node ./.project-constructor/openspec.mjs`, un wrapper propio. El único script que menciona npm es
`project-os:check`, que encadena `npm run`, forma que funciona igual bajo cualquier gestor.

El error no es cosmético. Si el acoplamiento fuera real, la superficie 2 tendría un costo de migración que
no tiene, y la deuda que sí existe allí —la ausencia de guía de endurecimiento para quien elija otro gestor—
habría quedado tapada por un problema imaginario.

**Corrección.** La premisa se corrigió en el issue enriquecido y en el ADR, y la superficie 2 se rechaza por
la razón correcta: imponer un gestor sería un default de producto. El hueco real se abrió como issue #60.

### 2 · Minor (corregido) — un dato de la matriz venía de un blog y no de la fuente

**Cómo apareció.** Una fuente secundaria afirmaba que Yarn Berry no genera provenance al publicar. Encajaba
demasiado bien con la conclusión.

**Por qué era un defecto.** Es falso hoy: el issue yarnpkg/berry#5430 está cerrado por yarnpkg/berry#6750, y
Yarn soporta `--provenance` y `publishConfig.provenance`. Una matriz que falsea a un candidato no sirve para
decidir, aunque la decisión final no cambie.

**Corrección.** La celda se corrigió contra el issue upstream y la fuente secundaria se descartó por
completo. La matriz cita solo fuentes oficiales o el propio repositorio del proyecto.

## Superficies atacadas sin hallazgo

### La conclusión no es sesgo de confirmación

Dos salvaguardas, ambas comprobadas:

- **Contraste contra datos reales.** El triage del 18 de agosto de 2026 registra nueve señales concretas.
  Cada una se pasó por la pregunta "¿la habría evitado otro gestor?". El resultado fue cero. Si hubieran
  sido tres o cuatro, la conclusión habría cambiado, y el método lo habría mostrado: no es una prueba
  diseñada para pasar.
- **Sección de vectores no mitigados.** Existe para impedir que *cualquier* decisión se apoye en una
  ganancia inexistente. Habría sido igual de necesaria si la conclusión fuera migrar.

### Cada dato es verificable

Las celdas marcadas *medido* se ejecutaron en esta máquina y su salida está en el ADR. El resto cita fuente
oficial con fecha de consulta. Se verificó específicamente el dato que más peso carga —que la cuarentena ya
existe en npm— contra tres fuentes independientes: la documentación de configuración, la release de npm
11.10.0 que la añade, y una sonda local que la distingue de una clave ignorada.

La fecha de publicación de cada npm 11.x se contrastó con `npm view npm time`, no con recuerdo.

### El rechazo no es inercia

Un rechazo que deja todo igual es indistinguible de no haber investigado. La matriz produjo tres refuerzos
concretos, cada uno con issue propio y con criterios observables propios: #58, #59 y #60. El más incómodo
—que el npm fijado para publicar es de julio de 2025, anterior a los dos controles que la decisión considera
materiales— es un hallazgo contra el propio repositorio, no contra los candidatos.

Además la decisión lleva fecha de revisión y tres disparadores anticipados.

### Las tres superficies se decidieron por separado

Se comprobó que los tres rechazos tienen razones distintas y no una razón global repetida. La tercera
superficie resultó no tener nada que migrar: `pnpm create` resuelve `create-*` con la misma convención que
`npm create`, verificado en la documentación de pnpm, así que el paquete ya es agnóstico en la frontera de
invocación.

## Degradación declarada

La matriz describe el estado de cuatro gestores en una fecha, y los cuatro cambiaron defaults durante 2026.
El documento envejece por construcción. Se mitiga con fecha de consulta por dato y con una condición de
revisión explícita, pero el modo de fallo permanece: un lector que encuentre este ADR en 2028 puede tomar por
vigente una comparación caduca. No es deuda —es la naturaleza de una decisión fechada— y por eso la fecha
aparece en el encabezado, en la matriz y en la condición de revisión.
