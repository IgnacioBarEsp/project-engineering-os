# Apply: reversibilidad experimental y primer gate de componentes

Estado: **Apply iniciado y detenido en un gate de corrección; no hay un npm derivado apto.**
La aprobación humana de fa279d9 y la condición reversible están en [spec-approval.md](spec-approval.md).
La fase A no está archivada, revisada independientemente, integrada ni terminada. #204 sigue abierto y #208 sigue siendo un bloqueo distinto.

## Reversibilidad que sí se comprobó

El modelo aislado de `apps/companion/scripts/npm-composition-experiment.mjs` selecciona únicamente slots creados por el experimento. Su identidad incluye canal oficial/derivado, versión, origen HTTPS, hash del árbol y, en el derivado, hash de receta. No instala ni ejecuta npm, no escribe un selector persistente y no está conectado al runtime/IPC/UI del Companion.

El comando `node --test apps/companion/test/npm-composition-experiment.test.mjs` pasó **14/14**: identidades diferentes aun con la misma versión; ida/vuelta y versiones dentro de cada canal; rechazo de un destino que falla auditoría, regresión o runtime; cancelación; excepciones; árbol alterado antes/durante los gates; petición obsoleta, concurrencia y precondición mutable; slots fuera del límite/solapados; paquete físico anidado omitido de un supuesto grafo verde; controles de la sonda de caché. La ida/vuelta conserva los hashes de todos los slots, un sentinel fuera de los slots y otro fuera de la raíz del modelo, ambos dentro del temporal exclusivamente creado por la prueba.

Esto demuestra transiciones sintéticas de un modelo **en memoria**, no instalación/reparación real, recuperación durable de un proceso interrumpido ni un par oficial/derivado seguro. El destino siempre requiere los gates actuales; conservar una versión histórica no permite ejecutarla si ya no pasa. Una futura spec de adopción deberá implementar selector/recibo/staging atómicos, recuperación por interrupción y pruebas reales de cada transición sin borrar proyectos ni el estado previo verificable.

## Primer gate real: paquete oficial descargado y verificado

Se descargó únicamente el componente oficial `http-cache-semantics4.3.0` desde el [registro oficial](https://registry.npmjs.org/http-cache-semantics/4.3.0), publicado en gitHead `b1d4bd682fbab0252985de45219f4e7497c0067c`. Es BSD-2-Clause, sin dependencias de producción; no se redistribuye ni modifica aquí. El SHA-512 del archivo coincidió con el registro antes de extraer sus cuatro archivos regulares en un temporal propio. No se ejecutaron lifecycle/build scripts ni instalación de paquetes.

El SHA-256 del archivo es `d75e1e6a11587954da5e2f0e2b5c4b397a16d28cc2f7bdf64e9027fc2fe593ee`; el del código es `ede1cc404a492fa348eb9d97a3007a0d72aa717bd22cd86a56bd0824c19729ca`. Ambos se volvieron a comparar después de ejecutar la prueba y permanecen iguales. El [recibo](cache-component-preflight.json) fija integridad completa, procedencia, versión, timestamp, ejecución y resultados.

La sonda `apps/companion/scripts/http-cache-security-probe.mjs` se ejecutó sobre ese código bajo Node24.18.0, mediante el ejecutor interno sin shell, entorno sin configuración/credenciales heredadas, cwd/home temporal, límite15s y64KiB. Sus entradas son sintéticas y no hace peticiones de red. Esta es una prueba de API del componente, **no una demostración de explotación en npm/Companion**.

Con una solicitud `max-stale=999999`, el código devuelve respuesta sin revalidación en los tres casos que deben rechazarla: caché compartida con `Set-Cookie` sin `public`, `proxy-revalidate` vencido y respuesta `no-cache`. Los tres controles pasan: stale ordinario y cookie pública permitidos, `must-revalidate` rechazado. La sonda termina normalmente como diagnóstico (exit0), pero su veredicto semántico es **passed:false, tres fallos**; no se presenta ese exit0 como gate de seguridad verde.

El [aviso primario GHSA-ch52-4w7c-c8xp](https://github.com/advisories/GHSA-ch52-4w7c-c8xp), consultado el2026-10-04UTC, aún enumera afectados hasta4.2.0 y ninguna versión corregida. No atribuimos4.3.0 al rango publicado: el rechazo de4.3.0 se basa en la reproducción local de esos comportamientos. Que4.3.0 quede fuera de ese rango de auditoría **no demuestra la corrección**. La API actual de [PR upstream58](https://github.com/kornelski/http-cache-semantics/pull/58) indica cerrado y no integrado; ese estado no equivale a un fix oficial publicado. No se copió ni aplicó su parche.

## Disposición y límites

No viable **con la candidata oficial actual y la restricción de usar solo componentes publicados realmente corregidos**. Es un rechazo de este preflight, no una prueba de que todo derivado futuro sea imposible. No se construyó ninguna receta de npm, no se repitieron las instalaciones conocidas de npm11.21.0/12.2.0, no se ensayó un retorno real al oficial y no se produjo una auditoría completa nueva ni benchmarks. La ausencia de un componente apto activa la parada prevista antes de esas etapas.

Opciones siguientes: una release oficial que corrija esta regresión, u otra decisión concreta/spec que autorice mantener un parche propio de este componente, con procedencia, licencia, pruebas y revisión. La aprobación de reversibilidad no autoriza ese parche ni adopción/distribución. Todas las otras dependencias tendrían que pasar después sus propios gates; esto tampoco elimina #208.

Los [14 límites de producción](apply-boundaries.json) conservan sus hashes: manifiestos/locks, catálogo y módulos del runtime, sellado/paquete, política sin excepciones y CI. DoR tras la aprobación pasó13/13, strict1/1, docs, neutralidad, workflows6 y debt check. El recibo completo está en [apply-validation.json](apply-validation.json). No se ejecutó la suite completa ni CI nuevo; los fallos requeridos anteriores permanecen visibles y no se atribuyen a este preflight.

Las tareas no ejecutadas siguen sin marcar. No se creó PR, no se archivó el change ni se tocó ola4.
