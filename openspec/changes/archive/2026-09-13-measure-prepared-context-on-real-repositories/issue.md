## User Story

Como autor que quiere afirmar que preparar un proyecto sirve, quiero una medición sobre un repositorio grande y real, para poder decirlo con evidencia o dejar de decirlo.

## Context / Problem

La única medición que existe corrió sobre un corpus **sintético de 6812 bytes con relleno repetitivo**, y con modelo real terminó en **empate**: 15/15 respuestas con cita y 15/15 abstenciones en ambas condiciones, con el contexto preparado *más lento* (9597 ms frente a 8427 ms).

Por eso la landing hoy **no puede afirmar velocidad**. El mantenedor quiere poder decir *«haz que tus agentes lean tus archivos más rápido»* y mostrar una comparación en un repositorio grande. Esa afirmación **hoy no tiene respaldo, y la evidencia disponible apunta en contra** sobre el corpus medido.

Un corpus pequeño no predice el comportamiento en repositorios grandes: ese es justamente el límite declarado, y es lo que este issue viene a resolver.

## Desired Outcome

Una medición sobre al menos dos repositorios reales y grandes, con preguntas de respuesta conocida, comparando abrir el corpus, un barrido literal competente y el contexto preparado. Y la publicación del resultado **sea cual sea**.

## Scope

- **En alcance:** elección de repositorios; construcción del conjunto de preguntas con clave; ejecución pareada; y publicación del resultado y sus límites.
- **Fuera de alcance:** cambiar el producto para mejorar el número. Si el resultado es malo, primero se publica.

## Acceptance Criteria

- [ ] Al menos dos repositorios reales, públicos y de tamaño sustancial, nombrados y fijados por commit.
- [ ] Las preguntas se congelan **antes** de ejecutar, con su fuente y respuesta conocidas.
- [ ] Las tres vías reciben trato simétrico: mismas preguntas, mismas instrucciones, mismos localizadores, sin que ninguna reciba una pista que otra no tenga.
- [ ] Se miden bytes devueltos **y bytes leídos**; los tokens se reportan como los expone el proveedor, jamás estimados a partir de bytes.
- [ ] El resultado se publica aunque sea desfavorable, y la landing se actualiza en consecuencia.
- [ ] Una revisión adversarial independiente comprueba que el instrumento no decide el resultado.

## Decision Criteria

**Este issue puede terminar diciendo que preparar no mejora nada medible, y eso sería un resultado válido.** Dos veces en este proyecto una revisión encontró la medición construida para que el producto no pudiera perder. La tercera vez hay que evitarlo desde el diseño: la simetría entre condiciones se decide y se prueba antes de ejecutar.

## SDD / Documentation Impact

`docs/companion/EVIDENCE.md` se actualiza con el resultado. Si contradice lo publicado, se corrige lo publicado.

## Validation / Evidence

Protocolo congelado con hashes; respuestas crudas conservadas; dictamen de la revisión independiente.

## Risks / Open Questions

- Riesgo de elegir repositorios que favorezcan al producto. Mitigación: criterios de elección escritos antes de mirar ninguno.
- Abierto: qué modelo y con qué nivel de esfuerzo, y si se repite con más de uno.



---

## Historia Original

Todo lo anterior a esta línea es la historia original tal como la escribió el mantenedor el 12 de septiembre
de 2026. No se reinterpreta ni se resume: los criterios de aceptación y de decisión de arriba son los que
rigen. En particular el criterio de decisión: **este issue puede terminar diciendo que preparar no mejora nada
medible, y eso sería un resultado válido.**

## Enriquecida

La base es `main` con #97, #98, #99, #106 y #100 integrados. Lo que existe hoy, leído del código y de la
documentación publicada:

**La medición existe y es honesta; lo que le falta es escala.** `apps/companion/scripts/verify-benchmark.mjs`
ya compara tres vías sobre el mismo corpus y las mismas preguntas, usando la aplicación **instalada** para la
vía preparada: abrir todo el corpus, un barrido literal equivalente a `grep -a -n -r`, y el contexto preparado.
Ya mide bytes devueltos y bytes leídos por separado, ya cuenta archivos abiertos, ya distingue «encontró la
fuente» de «devolvió la respuesta», y ya marca «abrir todo» como no discriminante en vez de dejar que un 10/10
trivial se lea como un acierto. Ya dice que el uso de tokens no se mide aquí en vez de estimarlo desde bytes.

`docs/companion/EVIDENCE.md` publica el resultado con sus límites, incluido que una versión anterior publicaba
5/10 para el barrido literal y que ese número **era un artefacto del instrumento** —el script decidía por
extensión qué abrir y nunca abría el PDF—, detectado por una revisión adversarial y corregido.

Así que el trabajo de este issue no es construir un instrumento desde cero: es **llevarlo a repositorios
reales y grandes**, congelar las preguntas antes de correr, y publicar lo que salga.

**Lo que hoy no tiene respaldo.** El corpus medido son 6812 bytes sintéticos con relleno repetitivo. Sobre ese
corpus, con modelo real, el resultado fue empate en aciertos y el contexto preparado salió **más lento**
(9597 ms frente a 8427 ms). La landing no afirma velocidad, y no puede.

### Criterios de elección de los repositorios, escritos antes de mirar ninguno

El issue avisa del riesgo de elegir repositorios que favorezcan al producto, y pide criterios escritos antes.
Estos son, y se fijan aquí antes de haber mirado ningún candidato:

1. **Público, con licencia que permita clonarlo y citarlo**, y fijado por commit en la evidencia.
2. **Sustancial**: al menos 2000 archivos de texto y al menos 20 MB de fuentes legibles, para que el corpus no
   quepa en una sola lectura y la diferencia entre métodos pueda existir.
3. **Ajeno a este proyecto y a sus autores.** Nada de este repositorio, ni de sus dependencias directas, ni
   nada donde el mantenedor haya contribuido.
4. **De dominios distintos entre sí**, para que el resultado no dependa de una forma de escribir. Uno con peso
   en prosa y documentación; otro con peso en código.
5. **No elegido por su resultado.** Los candidatos se nombran y se fijan **antes** de correr una sola pregunta,
   y si uno se descarta después de fijarlo, el descarte se publica con su motivo.
6. **Sin PDF ni ofimática preparados a propósito.** El corpus es el que el repositorio tiene; no se le añade
   nada que el producto sepa leer mejor.

Los dos primeros criterios son lo que separa este issue de la medición que ya existe. El tercero, el cuarto y
el quinto son lo que separa una medición de una demostración.

### Las preguntas, y por qué se congelan antes

Ya pasó dos veces en este proyecto que una revisión encontró la medición construida para que el producto no
pudiera perder. La defensa aquí es de procedimiento, no de intención: las preguntas, su fuente y su respuesta
conocida se escriben y se les calcula un digesto **antes** de correr nada, el digesto se publica, y el arnés se
niega a correr si el archivo de preguntas no coincide con el digesto que declaró. Cambiar una pregunta después
de ver un resultado deja de ser algo que dependa de la honestidad de quien mide.

### Lo que este issue no va a hacer

No va a cambiar el producto para mejorar el número. Si el resultado es malo, primero se publica; el issue lo
dice y aquí se respeta. Y no va a afirmar nada sobre tokens que el proveedor no exponga: el arnés actual ya
reporta «no medido» en vez de estimarlo desde bytes, y eso no se relaja.

<!-- project-os-readiness:pre-propose
{
  "schemaVersion": "1.0.0",
  "change": "measure-prepared-context-on-real-repositories",
  "execution": "versioned",
  "dependencies": [100],
  "currentState": {
    "summary": "verify-benchmark.mjs ya compara tres vias sobre el mismo corpus y las mismas preguntas con la aplicacion instalada, mide bytes devueltos y bytes leidos por separado, distingue encontrar la fuente de devolver la respuesta, marca abrir todo como no discriminante y reporta el uso de tokens como no medido en vez de estimarlo. EVIDENCE.md publica el resultado con sus limites, incluido que una version anterior publicaba un numero que era un artefacto del instrumento. Lo que falta es escala: el corpus medido son 6812 bytes sinteticos con relleno repetitivo, y con modelo real el resultado fue empate con el contexto preparado mas lento.",
    "sources": ["https://github.com/IgnacioBarEsp/project-engineering-os/issues/105", "https://github.com/IgnacioBarEsp/project-engineering-os/pull/112"]
  },
  "scope": ["Criterios de eleccion escritos antes de mirar candidatos, y dos repositorios reales fijados por commit", "Conjunto de preguntas congelado por digesto antes de correr, con fuente y respuesta conocidas", "Ejecucion pareada de las tres vias con trato simetrico", "Publicacion del resultado sea cual sea, y correccion de lo publicado si lo contradice"],
  "observableCriteria": ["Al menos dos repositorios publicos y sustanciales, nombrados y fijados por commit", "El arnes se niega a correr si el archivo de preguntas no coincide con el digesto declarado antes", "Las tres vias reciben las mismas preguntas, las mismas instrucciones y los mismos localizadores", "Se miden bytes devueltos y bytes leidos por separado, y los tokens solo como los expone el proveedor", "El resultado publicado coincide con los datos crudos conservados, sea favorable o no", "Una revision adversarial independiente comprueba que el instrumento no decide el resultado"],
  "owner": "Ignacio Bar Esp",
  "risks": ["Que los repositorios se elijan por su resultado en vez de por los criterios", "Que una pregunta se cambie despues de ver un resultado", "Que una via reciba una pista que otra no tenga", "Que se estime uso de tokens a partir de bytes", "Que el resultado sea desfavorable y se retrase o se suavice su publicacion"],
  "surfaces": ["documentation", "harness-tooling"],
  "manualInterventions": [],
  "costLicenseReview": {"status":"approved","owner":"Ignacio Bar Esp","evidence":"Autorizacion expresa del mantenedor para llevar los once issues abiertos de inicio a fin con el flujo SDD del repositorio, 12 de septiembre de 2026.","justification":"Los repositorios que se midan son publicos y se clonan solo para leerlos; se citan por nombre y commit. No se anaden dependencias al producto ni servicios de pago. Licencia MIT del repositorio sin cambios."},
  "evidence": {"automatic":["component-or-interaction-tests","openspec-strict","secret-scan","constructor-tests"],"manual":["Medicion pareada sobre dos repositorios reales con preguntas congeladas por digesto, datos crudos conservados, y revision adversarial independiente del instrumento"]},
  "rollback": {"strategy":"Revertir el PR: la pagina de evidencia vuelve a publicar solo la medicion del corpus sintetico y el arnes nuevo desaparece. No se toca el producto, asi que no hay nada que recuperar en la aplicacion ni en ninguna carpeta preparada.","trigger":"Una medicion cuyo instrumento favorezca a una de las vias, o un resultado publicado que no coincida con los datos crudos.","recovery":"Restaurar la pagina anterior y volver a correr la medicion con el protocolo congelado."},
  "nonGoals": ["Cambiar el producto para mejorar el numero", "Afirmar nada sobre uso de tokens que el proveedor no exponga", "Medir alucinaciones, que este metodo no puede observar"],
  "exceptions": []
}
project-os-readiness:pre-propose -->
