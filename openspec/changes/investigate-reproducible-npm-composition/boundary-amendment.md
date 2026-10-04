# #204 — segunda ampliación propuesta: cerrar la frontera de caché completa

**Pendiente de aprobación; no aplicada.** La aprobación de `6b3997` sigue vigente para el parche de un archivo. Su variante revisada pasó 121/123 casos, pero los dos fallos conservados y el caller impiden aprobar un npm completo. Esta propuesta presenta el acuerdo nuevo; ninguna autorización anterior lo aprueba automáticamente.

## Qué cambia y por qué

Permitir, solo en copias desechables, completar los casos necesarios de http-cache-semantics 4.3.0 y añadir un parche de datos al caller compatible make-fetch-happen 15.0.6. No parchear código de npm ni una tercera dependencia.

Allowlist exacta de código upstream:

- http-cache-semantics 4.3.0: `index.js`. Canonicalizar los nombres de directivas que determinan permiso/vencimiento, sin alterar las reglas válidas de duración/redondeo; preservar compatibilidad de serialización v1, incluidos datos anteriores con casing distinto. Propagar Vary nuevo de 304 y comprobar sus restricciones en todas las rutas de reutilización.
- make-fetch-happen 15.0.6: `lib/cache/policy.js`, `lib/cache/entry.js` y `lib/cache/index.js`. Un único predicado de elegibilidad de reutilización debe gobernar fallback de red y modos force-cache/only-if-cached, además de la decisión del componente. Una preferencia de caché no elimina no-cache/no-store/must-revalidate ni una restricción aplicable de matching/Vary. Conservar stale permitido y errores previstos cuando la caché no puede servir.

Cambios de parsing se limitan a nombres de directivas/representaciones necesarios para esa frontera, conservando formatos válidos y distinguiendo duplicados/argumentos inválidos de controles legítimos. No implementar un parser HTTP nuevo ni cambiar heurísticas, status/métodos/opts por conveniencia. No cambiar los defaults shared:false o ignoreCargoCult:true del caller a escondidas: conservar y probar ese override explícito; si impide demostrar la corrección declarada, parar y presentar el desacuerdo, no marcar PASS.

## Inputs, límites y pruebas

Mantener fuente npm11.21.0, gitHead5fd1e17e468d58e7f14dc6cbb5390029ff49a41d e integridad oficial fijados en design.md. El caller15.0.6 proviene de ese tarball verificado, no del node_modules del usuario. Preimages confirmadas: policy.js2014cf549fceb8808cba81e8760315b9060f502b6c62b7cb79e1b024abde54c3; entry.jsc448d1d1601ad2ec99c2963fc4dd093a57d884ff4ea089bb08a05496d01015c7; index.jsb9a47e604b9d6ec9211e5129636ba7366c408c074ea1d4b8c859cf221c347071. Source drift o distinto componente/version exige otra decisión.

Conservar BSD-2-Clause e ISC, copyrights, LICENSE y nombres/versiones upstream; atribuir cambios a nuestro experimento. No ocultar avisos renombrando ni usar ausencia del advisory como corrección. Antes de construir, congelar nuevos patchHash/postimage/recipeHash, inventario de cada copia física y toda diferencia permitida. Nunca aplicar automáticamente el parche anterior a otra fuente.

El presupuesto NO se reinicia: dos variantes de parche ya congeladas consumen 2/3; queda una receta candidata distinta. Construcciones completas de npm realizadas: 0. Un cambio posterior de inputs requiere respetar ese límite o presentar explícitamente otro presupuesto; no encadenar variantes ilimitadas.

Repetir los 123 casos incluyendo casing/s-maxage, 304/Vary y cambio del reloj; ampliar matching URL/host/método/Vary y solicitudes no-cache, red 500/desconexión, force-cache/only-if-cached/no-cache/default, serialización antigua/nueva, private/shared, cargo-cult y opt-ins/controles positivos. Ejecutar una integración real en un directorio propio, no sustituirla por VM/stubs. La evidencia sintética ya guardada conserva ese alcance.

Solo con componente y caller aptos continuar los gates originales completos: dos builds idénticos, fuentes/licencias, grafo físico completo y auditor independiente, todos los avisos/regresiones, Node22.22.0/24.18.0/24.20.0, ci/scripts/bin-links/workspaces/release-age/registry, reparación/fallos/interrupción y recursos. Otro defecto fuera de estos cuatro archivos detiene la candidata. No alterar una fixture para aparentar éxito.

## Costo, alternativas y retirada

IgnacioBarEsp decide mantenimiento/retirada. Dos componentes y cuatro archivos aumentan costo propio; no prometemos un fork permanente ni soporte indefinido. Evaluación de deuda y revisión adversarial independiente nuevas se requieren para este diff; la revisión anterior no lo aprueba.

Alternativas: seguir esperando upstream; esta prueba ampliada acotada; migración de gestor/fork amplio (fuera de alcance). make-fetch-happen 16.0.1 declara Node mínimo 22.22.2 en rama 22, por lo que no es un atajo compatible con 22.22.0; no subir el baseline.

Un oficial futuro se prueba sin parches, con mismos gates y una identidad/slot nuevos. Cambio horizontal oficial↔derivado/versiones, fallo/cancelación/obsolescencia y recuperación preservan selección/historia; no activar un oficial vulnerable por ser oficial. No retirar un parche sin demostrar su reemplazo.

## Fuera de alcance / gate humano

No host/Companion runtime, catálogo/locks/notices de release, publicación/instalador, npm source, tercera dependencia, baseline/gestor/OpenSpec, excepciones/auditoría/protecciones, #208 o ola4. Adopción sigue necesitando otra spec aprobada y PR protegido/CI verde.

Approve significa aprobar esta ampliación junto con sus modificaciones explícitas de proposal/design/spec y el costo/mantenimiento, solo para Apply experimental. Hasta recibir esa respuesta, mantener el resultado blocked; no aplicar los fixes adicionales. [Resumen](TLDR.md) · [Diseño](design.md) · [Requisitos](specs/companion-npm-composition/spec.md) · [Registro de avance](evidence/component-apply-ledger.json).
