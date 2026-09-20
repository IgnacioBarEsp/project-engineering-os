# Decisiones del mantenedor — remeasure-retrieval-and-record-flow-comparison

Registradas tal como se tomaron. Ninguna de estas decisiones la tomó el ejecutor.

## Tomadas el 20 de septiembre de 2026

| Decisión | Qué se preguntó | Respuesta |
| --- | --- | --- |
| **Alcance** | Con cuatro días para el congreso: solo la re-medición, #166 completo, o saltar al mazo | **«#166 completo, las cuatro pruebas»** |
| **Insumos de la medición** | El arnés exige la aplicación instalada y los dos corpus congelados | **«Instalo 0.3.2 y clono los corpus»**: instalar el instalador publicado en su equipo y traer los dos checkouts |
| **Tarea de la comparación** | Cuál de tres candidatas se congela para comparar el prompt suelto contra el flujo | **#162, el detector de marcadores**: real, acotado, con criterios observables propios, y su trampa de falsos positivos existe sola |
| **Superficie** | `documentation` sola, las dos como declara el issue, o partir la prueba 4 a otro change | **Solo `documentation`**, la misma desviación aprobada en #143 |

De la primera decisión se sigue que la prueba 3 no espera a #150: se ejecuta con el arnés que hay y se publica
lo que resulte, incluido que el contraste no aparezca.

## Abiertas, pendientes de su decisión

Ninguna decisión queda abierta.

## Tomada antes de ejecutar la prueba 2

**Cada vía se ejecuta en contexto limpio.** Se preguntó si las dos vías las ejecutaba el mismo agente de esta
sesión —más barato, con el sesgo de que la segunda llega sabiendo lo que aprendió la primera y de que el
ejecutor ya leyó el diagnóstico de #162—, si cada una iba en contexto limpio, o si la prueba 2 se posponía
hasta después del congreso. La respuesta fue **contexto limpio para cada vía**.

Consecuencias que se siguen de esa decisión, y que el ejecutor aplica sin volver a preguntar:

- Ninguno de los dos agentes recibe el issue #162, su diagnóstico, los criterios de la vara de medir ni el
  [protocolo](flow-comparison/protocol.md). Reciben el párrafo de partida y nada más.
- Cada vía trabaja en un árbol de git propio, para que no se vean entre sí ni toquen el árbol de trabajo.
- El orden que fijó el protocolo congelado se respeta igual —primero la vía A—, aunque el contexto limpio ya
  hace innecesaria esa mitigación. Cambiar el orden habría sido modificar un protocolo ya congelado.
- **Las dos vías esperan a que termine la prueba 1.** Esa medición publica tiempos por consulta; ejecutar
  agentes que compilan y prueban en paralelo los contaminaría.

## Lo que ya estaba decidido antes

- **No se toca el protocolo, las preguntas ni los commits** del benchmark: está en el issue como límite.
- **No se ajusta el producto para favorecer el resultado.**
- **#122 y #115 no se arreglan de pasada**, por el handoff #167.
