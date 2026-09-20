## Why

El [issue #166](https://github.com/IgnacioBarEsp/project-engineering-os/issues/166), tercero de la ola 0 del
[handoff #167](https://github.com/IgnacioBarEsp/project-engineering-os/issues/167), bloquea la afirmación
central del mazo [#165](https://github.com/IgnacioBarEsp/project-engineering-os/issues/165).

`docs/companion/EVIDENCE.md` publica hoy un resultado desfavorable: sobre `kubernetes/website` y
`python/cpython`, el contexto preparado no devolvió **ninguna** de las veinte respuestas y el barrido literal
devolvió **las veinte**. Ese número se midió el 13 de septiembre de 2026 sobre la versión **0.1.0 instalada**.
Desde entonces se publicaron 0.2.x y 0.3.x, y **nadie ha vuelto a medir**: el proyecto no sabe si su propio
defecto sigue ahí. La causa observada está registrada —la preparación indexó 45 de 2654 fuentes y reportó
`entry-limit`—, así que la pregunta tiene respuesta medible.

La presentación del 24 de septiembre quiere comparar un prompt suelto contra el flujo aplicado. Sin estas
mediciones solo hay dos salidas honestas: presentar el 0 de 20 tal cual, o retirar toda afirmación sobre
recuperación. Con ellas hay una tercera: presentar el número actual, sea cual sea.

## What Changes

- **Re-medición del benchmark de repositorios reales** con la versión publicada 0.3.2 **instalada**, sin tocar
  el protocolo (`9c43e965…82e93`), las veinte preguntas ni los dos commits congelados. El resultado se publica
  junto al anterior, salga favorable o adverso, nombrando la versión medida y la identidad de la instalación.
- **Comparación de los dos flujos sobre una tarea idéntica**, declarada con sus criterios de aceptación
  **antes** de ejecutar nada: una ejecución con un prompt suelto y sin comprobación, otra por el flujo
  completo. Se conservan los artefactos de ambas y se registra lo observable: archivos tocados, pruebas que
  pasan y fallan, defectos encontrados por quién y cuándo, pasos trazables y si el resultado se puede revertir.
- **Contraste del arnés**: el arnés actual se ejecuta sobre `a3b1efd`, el commit que el arnés anterior
  certificó con «38 pantallas, 0 hallazgos», y sobre el commit corregido. El contraste queda registrado.
- **Comprobación reproducible del arranque documentado**: los seis pasos que publica el README se convierten
  en una comprobación que falla si alguno deja de salir con código 0.
- **`docs/companion/EVIDENCE.md`** publica todo lo anterior con su método y sus límites, antes de que ningún
  número llegue a una diapositiva.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `companion-evaluation`: la medición congelada pasa a exigir re-medición cuando cambia la versión medida,
  publicación de las corridas una junto a otra con la identidad de cada instalación, y añade el registro de la
  comparación de dos flujos sobre una tarea y el contraste de un arnés corregido contra el commit que el
  anterior certificó limpio.
- `published-release-verification`: el arranque documentado de principio a fin pasa a tener una comprobación
  reproducible.

## Impact

**Superficie: se propone `documentation`.** La metadata del issue declara `harness-tooling, documentation`.
Ese perfil no admite N/A y exige `sync-check` y `doctor-json-check`, que hoy fallan sobre este repositorio:
`sync --check` sale con código 2 por [#122](https://github.com/IgnacioBarEsp/project-engineering-os/issues/122)
y `doctor` con código 1 y cuatro FAIL, tres de ellos por
[#115](https://github.com/IgnacioBarEsp/project-engineering-os/issues/115). El handoff prohíbe arreglarlos de
pasada. Este change ejecuta arneses existentes y añade una comprobación de verificación; no toca el
constructor, la matriz de capacidades ni el espejo generado, que son lo que ese perfil cierra. Es la misma
desviación que el mantenedor aprobó en #143, y queda **propuesta para su decisión**
([decisiones](evidence/maintainer-decisions.md)).

**Lo que este change no hace:** no cambia el protocolo, las preguntas ni los commits del benchmark; no ajusta
el producto para favorecer el resultado; no estima tokens a partir de bytes; no juzga la calidad de una
respuesta con el mismo agente que la produjo; y no compara con productos de terceros.

**Riesgo declarado:** una sola tarea comparada puede leerse como prueba general. El registro tiene que decir lo
contrario en sus propias palabras, y la spec lo exige.
