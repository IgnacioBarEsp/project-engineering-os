# #204 — ampliación propuesta: un parche propio, acotado y retirable

**Estado: aprobada sobre la revisión6b3997.** El «apruebo» recibido después de presentar esa revisión autoriza Apply acotado; no adoptar un npm derivado. El «si» anterior solo autorizó preparar la propuesta. Véase [aprobación real](evidence/patch-amendment-approval.md). La fase original y sus resultados en6807d5c se conservan. Esta ampliación utiliza el mismo issue/change, no crea un duplicado ni reinicia la pila de ola3.

## Qué permitiría aprobar esta ampliación

Modificar únicamente `index.js` de una **copia desechable** de `http-cache-semantics4.3.0` para impedir reutilización sin validación cuando las directivas aplicables la prohíben y hacer consistente la política conservadora de cookies que el componente ya tiene. No parchear código de npm, ningún otro componente o archivo upstream, ni dependencias instaladas del host. La versión base de npm sigue11.21.0; el presupuesto acumulado sigue siendo tres recetas distintas como máximo, hoy con cero construidas.

Este cambio no tiene costo de servicio, pero sí trabajo propio de mantenimiento. IgnacioBarEsp es responsable de decidir continuidad/retirada; la implementación y un revisor independiente deben dejar evidencia atribuida. Se documentará esa carga en la evaluación de deuda, sin prometer soporte gratuito o indefinido. No se redistribuye ni cambia una licencia publicada en esta fase.

## Por qué no copiamos simplemente un parche de internet

El [preflight conservado](evidence/cache-component-preflight.json) reprodujo tres discrepancias de API sobre código oficial. El nuevo [análisis de interpretación](evidence/cache-interpretation.md) separa dos casos normativos del caso de cookies, cuya clasificación como vulnerabilidad disputa upstream. PR58 está cerrado/no integrado, y sus comentarios o pruebas reportadas por terceros no son evidencia ejecutada por nosotros. No se adopta su diff automáticamente.

Diseñaremos un guard mínimo y revisable para las decisiones de reutilización, conservando API y formato de serialización. Los controles positivos se compararán contra el componente original. No se cambiarán reglas de expiración, permisos de cookies, semántica de `immutable`, parsing o comportamiento fresco ajeno al fix para obtener un resultado conveniente. Toda incertidumbre de semántica debe figurar como tal y bloquear la conclusión afectada.

## Fuente, licencia e identidad

Input: versión4.3.0, gitHead `b1d4bd682fbab0252985de45219f4e7497c0067c`, [tarball oficial](https://registry.npmjs.org/http-cache-semantics/-/http-cache-semantics-4.3.0.tgz), integridad `sha512-M5t5LlJpS1UHMjvwRQVdFHvPISGeLAxNcrWuJkeGh0KxsqCHZ1O3NXZU/8x7cD0BDcGW8kapxMKTvwlqrNkHkA==`; `index.js` SHA256 `ede1cc404a492fa348eb9d97a3007a0d72aa717bd22cd86a56bd0824c19729ca`. Cualquier diferencia exige revisar inputs antes de aplicar. Los originales quedan intactos y separados.

El componente usa BSD-2-Clause. Se conservaron su copyright, LICENSE y avisos sin atribuir la corrección al mantenedor upstream. El Apply aprobado produjo el diff de datos y manifiesto propio bajo `apps/companion/patches/http-cache-semantics/4.3.0/`, con motivo, autoría, fuente/licencia, archivo permitido y preimage/patch/postimage medidos y congelados antes de cada aplicación. Dos variantes quedaron registradas; la segunda resuelve un gap temporal confirmado por revisión. La matriz121/123 y el caller todavía impiden aceptación. El [registro de avance](evidence/component-apply-ledger.json) distingue identidad, integridad y aptitud; no es una release.

El ensamblador controlado aplica datos, no ejecuta un script suministrado con el parche; valida rutas, integridades y la lista exacta de diferencias. Drift, fuzz, paths absolutos/traversal, symlinks/hardlinks, bytes o archivos adicionales se rechazan. No se permite re-vendorización manual, `postinstall`, código `eval` ni herramientas flotantes.

El paquete conservará su nombre/versión upstream para el grafo de auditoría, pero el recibo y artefacto experimental se identificarán explícitamente como **derivados**, incorporando fuente + patchHash + recipeHash + treeHash. Nunca se presentará un árbol modificado como tarball oficial intacto, ni se renombrará/bumpeará un paquete para que desaparezca un aviso. Los resultados originales de auditoría y avisos conocidos quedan visibles.

## Pruebas y límites de aceptación

Primero probar el componente original y parcheado con los mismos inputs/tiempo fijo y registrar cada resultado, clasificación y criterio. Exigir los casos normativos y la política conservadora declarada, además de controles permitidos. La matriz debe cubrir modo compartido/privado; `max-stale` finito/sin valor; APIs `satisfiesWithoutRevalidation` y `evaluateRequest`; ventanas y rutas stale alternativas; redondeo/expiración; round-trip `toObject/fromObject`; y revalidación304/200 que introduce o quita restricciones. Casos de `s-maxage`, `must-revalidate`, `no-store`, `private`, Vary y Authorization son cobertura de límites, no resultados que afirmemos ya haber ejecutado.

No basta pasar la sonda actual de seis casos. Se conservan casos legítimos de stale ordinario, cookies con opt-in existente (`public`/`immutable`) y caché privada, revalidación válida y respuestas frescas no restringidas. El comportamiento deliberadamente más conservador ya existente se distingue de obligaciones normativas; no se proclamará conformidad HTTP completa ni explotación real de Companion.

Después, dos aplicaciones/construcciones independientes deben producir bytes idénticos desde iguales inputs, con raíces/cachés propias, hashes y sentinels exteriores. Pruebas negativas deben demostrar rechazo de hash, parche o archivo no permitidos y original/selección preservados ante cancelación/fallo. Solo entonces reanudar composición, grafo físico completo, auditor independiente, regresiones de **todos** los avisos, Node22.22.0/24.18.0/24.20.0, instalación/reparación y recursos conforme a la spec original. Un parche exitoso aquí no corrige el resto de npm ni #208 por asociación.

Se preservan scripts/bin-links/workspaces desactivados, registry/edad mínima, aislamiento de configuración, límites y todas las políticas/protecciones. No habrá excepciones de auditoría, omisión de bundled/dev exigidos ni cambio de gestor, OpenSpec1.6.0 o baseline. Auditoría verde es necesaria y nunca la única prueba. Un resultado pendiente/disputado se registra, no se convierte en PASS.

## Retirada y cambio horizontal al oficial

Cuando aparezca una versión oficial candidata, se comprobará **sin nuestro parche**, en slot nuevo: procedencia/hash, todos los controles de corrección/auditoría, compatibilidad y contrato de instalación/reparación. Si pasa, probar oficial ↔ derivado y versiones preservando identidad/estado. Si no pasa, no se activa ni se ofrece como rollback por ser oficial. No se elimina la historia ni se sobrescribe un slot verificado.

Una receta oficial nueva no hereda el parche de otra versión. Se conservará un registro de por qué se retiró cada parche y qué reemplazo lo superó, sin borrar evidencia. Si la fuente deriva o necesita otro fix propio, detenerse y proponer otro acuerdo: esta ampliación no autoriza un fork permanente. El modelo reversible14/14 ya disponible sigue siendo sintético; no reemplaza una transición real entre dos distribuciones aptas.

## Fuera de alcance y cierre

No instalar el derivado en Companion/host, modificar catálogo/locks/notices de release, publicar npm/instaladores, mezclar #207, cerrar #204/#208 ni iniciar ola4. La futura adopción mantiene su spec separada: slot/staging/selector/recibo durable y reparación/recuperación real, procedencia/licencias, revisión, deuda, archivo oficial y PR protegido con CI requerido verde.

Opciones evaluadas: esperar un oficial corregido (menos carga propia, plazo externo); este parche experimental mínimo (más control, carga propia y riesgo medibles); fork amplio/cambio de gestor (rechazados por alcance). Elegir esta segunda prueba no garantiza viabilidad. Si no supera los gates, emitir no-viable/inconcluso sin publicar.

El mantenedor aprobó **proposal/design/spec y este alcance** en6b3997, incluida la política conservadora del componente y responsabilidad de mantenimiento. Siguen pendientes pruebas reales, revisión adversarial independiente del diff/evidencia y evaluación formal de deuda antes del archivo. No se fabrica revisión humana ni independiente. [Tareas](tasks.md) · [Selección recibida](evidence/patch-amendment-selection.md) · [Aprobación](evidence/patch-amendment-approval.md).
