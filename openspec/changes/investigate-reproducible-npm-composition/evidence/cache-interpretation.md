# Interpretación posterior del preflight, sin borrar la evidencia original

La API de GitHub consultada tras6807d5c muestra PR58 cerrado/no integrado. El [comentario del mantenedor](https://github.com/kornelski/http-cache-semantics/pull/58#issuecomment-5975673900) cuestiona pruebas, implementación y fundamento del caso de cookies; otro [comentario](https://github.com/kornelski/http-cache-semantics/pull/58#issuecomment-5975776797) disputa la interpretación del aviso. Esas opiniones no equivalen a una retirada del advisory ni a una corrección ejecutada.

Según [RFC9111](https://www.rfc-editor.org/rfc/rfc9111.html#section-7.3), `Set-Cookie` por sí solo no prohíbe cachear; §§4/4.2.4/5.2.2 respaldan límites distintos para respuestas `no-cache` y stale con directivas de revalidación aplicables. Por eso no llamamos a las tres discrepancias del probe tres vulnerabilidades normativas demostradas.

| Caso ejecutado | Resultado conservado | Interpretación para la ampliación |
| --- | --- | --- |
| response-no-cache | reuse=true, esperaba=false | Discrepancia con prohibición normativa sin validación; criterio independiente del caso cookie |
| proxy-revalidate compartido vencido | reuse=true, esperaba=false | Discrepancia normativa en ese escenario; no implica igual prohibición en caché privada |
| shared-cookie sin opt-in | reuse=true, esperaba=false | Inconsistencia con política conservadora de maxAge del componente; no prueba por sí sola una violación HTTP, privacidad entre usuarios ni exposición en npm/Companion |

La fuente oficial verificada4.3.0 contiene en maxAge un guard conservador que pone TTL0 con cookies en modo compartido salvo `public`/`immutable`; evaluateRequest admite max-stale sin consultar ese motivo. Nuestro guard propuesto volvería consistente esa política, sin afirmar que la imponga HTTP. Los dos opt-ins y el modo privado necesitan controles positivos, no prohibición indiscriminada de cookies.

El JSON original cache-component-preflight.json y su clasificación anterior no se reescriben: esta nota corrige cómo se interpretan sus tres fallos. No se repite instalación, descarga ni probe de los mismos inputs. La nueva propuesta exigirá matriz más amplia y evidencia de original/parcheado tras aprobación; el resultado global anterior passed:false no demuestra viabilidad de una candidata.

El advisory publicado todavía muestra rango hasta4.2.0 y patched:none;4.3.0 está fuera de ese rango. Los resultados locales siguen siendo resultados de API sobre inputs sintéticos, no explotación de producto. No se ocultarán findings ni se añadirán excepciones por la disputa. Sigue pendiente auditar/probar todo el árbol de npm y el bloqueo separado #208.
