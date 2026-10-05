## Context

El catálogo de Companion fija npm11.19.1 y el empaquetador sella todo su árbol. La integridad acredita qué bytes son, no que sus dependencias estén corregidas. Los overrides históricos no repararon las copias bundled. npm11.21.0 y12.2.0 ya se probaron el30sept y fallaron; no repetiremos esas instalaciones por preparar una propuesta.

La CI37171002125 de #207, SHA9feea6597d4fc43ab1f4dfb6a45f5bf4c797ac92, reporta24 vulnerabilidades Companion, además del fallo distinto #208 en root/blueprint. Son observaciones históricas fechadas, no un audit recién ejecutado del candidato.

Status: **Accepted amendment over accepted feasibility baseline; Apply remains experimental**. El scaffold oficial registra2026-10-04 UTC. Decisor: IgnacioBarEsp. La aprobación de fa279d9 y la condición reversible conservan su alcance en evidence/spec-approval.md. El «si» posterior solo seleccionó preparar la ampliación; el «apruebo» después de presentar6b3997 aprobó este alcance (evidence/patch-amendment-approval.md), no adopción o distribución.

## Goals / Non-Goals

**Goals:** decidir con evidencia si una composición basada en fuentes oficiales puede corregir el árbol npm sin romper el contrato de Companion; conservar controles y reproducibilidad, incluida una salida no-viable.

**Non-Goals:** adopción automática, fixes de #208, cambio de gestor/baseline, parche de npm/otros componentes, cambios de runtime/installer, actualización silenciosa de OpenSpec, modificaciones de políticas/protecciones o trabajo de ola4. El único parche propio propuesto requiere aprobar la ampliación específica antes de Apply.

## Decisions

### Separar investigación de adopción

Elegimos proponer un spike aislado antes de tocar producción. Esperar exclusivamente upstream conserva menor carga propia, pero no controlamos su calendario; adoptar ya un derivado trasladaría a nosotros responsabilidad aún no medida. El spike compra información y puede fallar correctamente.

La aprobación de esta fase autoriza herramientas de experimentación y candidatas no distribuibles. Incluso un dictamen viable no aprueba un cambio de catálogo/locks ni un instalador. Ese cambio posterior requerirá criterios acordados, licencias y recuperación de una distribución real.

### Fuente fija y diferencias explícitas

Base del experimento: fuentes de npm11.21.0, commit `5fd1e17e468d58e7f14dc6cbb5390029ff49a41d`. El artefacto oficial de referencia es `https://registry.npmjs.org/npm/-/npm-11.21.0.tgz`, con integridad `sha512-Zov8KhamNneiLdELtj5YALtNmJW4L4fCLTzjfpzXG2w6MSHcf0UxgdlK5uloCuksWT+7mGUU7wi79cO6RqivPg==`. La obtención de fuentes también fijará y conservará digest propio. No aceptaremos latest flotante ni modificación upstream del mismo número de versión.

La receta partirá del manifest upstream conservado y producirá, en una copia propia, metadata de composición que declare cada dependencia fijada, su origen/integridad y el motivo del cambio. Se reconstruirá el grafo desde cero; no se conservará un bundled tree vulnerable mientras se audita otro grafo virtual. El código npm sigue intacto. La primera ampliación aprobada permitió index.js de http-cache-semantics4.3.0. La segunda, aprobada explícitamente en d6e2b54, añadió los tres archivos exactos de make-fetch-happen15.0.6 descritos en boundary-amendment.md. Ambos Apply conservan originales/patch/postimage y revisión separada; no autorizan automáticamente otra variante.

Las versiones exactas de los componentes se determinarán con fuentes oficiales y comprobación de compatibilidad, y se congelarán en la receta antes de construir. Cada variación de inputs (incluido patchHash) tendrá identidad/resultados propios dentro del máximo acumulado de tres recetas; el presupuesto no se reinicia. Si falta corrección comprobable, se necesita un archivo/componente propio distinto o la ampliación no está aprobada, detenerse con evidencia y solicitar otra decisión.

La identidad del experimento será `experimental-npm-composition` con source version, recipe hash y árbol final; no se presentará como una distribución npm oficial intacta.

### Decisión nueva propuesta: un parche mínimo, retirado cuando el oficial sea apto

El preflight del original produjo tres discrepancias. La interpretación posterior (evidence/cache-interpretation.md) distingue restricciones normativas de la política conservadora de cookies y de una explotación de producto no probada. No se adopta PR58 por existir ni se atribuye su código/pruebas a upstream integrado. La opción propuesta, alternativas, owner/costo, allowlist, matriz de comportamiento y plan de retirada están definidos en [patch-amendment.md](patch-amendment.md).

El parche será datos revisables sobre preimage exacta; sin fuzz, scripts propios del input ni edición manual del bundled tree. Originales/licencias intactos; receta incorpora patchHash y árbol derivado con nombre/versión upstream conservados para la auditoría. Todas las copias físicas del componente deben tener trazabilidad; ninguna copia vulnerable o fuera de grafo se oculta por validar solo una instancia. Cambiar la identidad nominal para evadir avisos no es corrección.

La implementación deberá verificar igualdad de dos resultados independientes, rechazos de drift/paths/diff extra y controles positivos además de negativos. Conserva las pruebas reales de npm completas y la misma compatibilidad/edad mínima. Retirar el parche significa comprobar un oficial sin parche con los mismos gates y usar un slot/receta propios; no significa aplicar el diff viejo a latest o borrar historial.

### Auditoría de los bytes reales, no de una apariencia verde

Inventariar físicamente cada package.json y archivo ejecutable del árbol, identificar copias nested/bundled y contrastar el inventario con el lock/grafo auditado. Un paquete presente fuera de ese grafo falla cerrado. Los archivos de fuente deben tener hashes rastreables al input; no basta con el nombre de paquete declarado por una candidata.

El ensamblador y auditor deben tener identidad fija documentada y no confiar en la candidata como único auditor de sí misma. Una herramienta oficial ya disponible puede ser referencia, sin proclamarse libre de vulnerabilidades; se registrarán identidad/riesgos y se limitará a inputs oficiales conocidos y temporales. No se desactivan advertencias ni se cambia la política existente. Se conservarán JSON completo, exit code, fecha, inventario, dependencias y advisories consultados. La aceptación exige ausencia high/critical en el árbol efectivo y regresiones de los avisos conocidos.

Por ejemplo, http-cache-semantics4.3.0 existe, pero el [diff oficial](https://github.com/kornelski/http-cache-semantics/commit/9fb520be70eff3ff502fe965d9c3265ca2c64e26) corrige Vary/CVE-2026-93750. El [aviso max-stale](https://github.com/advisories/GHSA-ch52-4w7c-c8xp) aún no registra patched version. No aceptaremos salir del rango textual del advisory como sustituto de una comprobación de corrección de max-stale. Una regresión sin criterio fiable se declara inconclusa y no apta.

### Preservar el contrato de instalación y límites

El harness ejecutará con Node fijo y entry npm absoluto, sin shell, HOME/caché/config/PATH propios, scripts desactivados, bin-links desactivados, workspaces desactivadas y registry oficial fijado. Conservaremos `--min-release-age=7` y las exclusiones existentes de toolchain, sin añadir otras para aceptar componentes nuevos. El registry es una fuente de inputs, no permiso para ejecutar lifecycle hooks.

Matiz importante: el entorno es aislado por rutas/configuración, **no una sandbox del sistema operativo**. Validaremos rutas absolutas, symlinks/hardlinks y hashes antes de escrituras o ejecución. Las pruebas solo afectan raíces propias; se mantendrán límites de tiempo/output actuales. Timeout, cancelación, red fallida, caché corrupta y digest incorrecto deben detener/stagear sin publicar el payload ni modificar rutas exteriores.

Se probará `npm --version` y `ci` con los mismos locks representativos de toolchain/stack bajo Node22.22.0,24.18.0 y el Node administrado24.20.0. npm12.2.0 requiere22.22.2 en rama22 y no se elige como base para evitar subir el mínimo silenciosamente. Preservaremos los inputs de prueba: si un lock bloquea por su propia cadena, se documenta como bloqueo distinto en vez de cambiarlo para atribuir éxito a npm.

### Reproducibilidad y recursos

Dos construcciones con inputs idénticos, directorios y cachés separados producirán inventario y hash de árbol idénticos usando orden de rutas/bytes, sin metadata temporal. Los artefactos originales/resultados quedan separados; una divergencia no se normaliza borrando archivos de código.

Mediremos tiempos de build, instalación fría/caliente y reparación, RSS pico y tamaño comparando baseline y candidato con las mismas operaciones. No hay benchmark ejecutado ni presupuesto numérico aprobado; los resultados son información del spike, no aceptación de una regresión para distribución. La spec de adopción fijará un presupuesto concreto antes de publicar.

### Identidades intercambiables y recuperación reversible

Condición nueva dictada por el mantenedor: poder pasar de oficial a derivado y volver, y cambiar versiones sin quedar acoplados al derivado. La identidad de cada alternativa incluye canal (`official` o `derived`), versión upstream, digest de árbol, origen y digest de receta si es derivada. Dos distribuciones con la misma versión nominal no comparten identidad ni slot.

Ensayaremos el modelo en raíces desechables, conservando slots inmutables separados. El selector apunta a una identidad completamente verificada, no a latest, PATH global ni una carpeta sobrescrita. Primero revisar/validar el destino, luego comprobar que la selección de partida no cambió y finalmente confirmar la transición; un fallo, cancelación o selección obsoleta deja intacta la elección anterior. Reparar un slot requiere identidad y verificación de sus mismos inputs; no sustituye el canal implícitamente.

La vuelta al oficial exige su propia auditoría/regresiones, compatibilidad y hash, exactamente como un derivado. No haremos rollback a un oficial vulnerable porque sea oficial. Si el destino o la anterior instalación dejan de ser aptos, fallar cerrado: no ejecutarlas ni prometer una recuperación segura hacia bytes alterados. Conservar archivos de slots anteriores no es permiso para activarlos sin reverificación.

El prototipo prueba estado/ownership/cancelación/recuperación con fixtures sintéticos claramente etiquetados cuando no haya dos npms aptos. Eso NO cuenta como transición real de npm ni como instalación/reparación del Companion. Si hay candidatas reales aptas, ensayaremos ambos canales y versiones bajo los mismos gates. La adopción posterior deberá incluir staging, selector/recibo con cambios transaccionales y recuperación de interrupción verificados, sin borrar proyectos, caché compartida, historial ni el resto del toolchain. No se instalará este selector en producción en la faseA.

### Ownership, costo y licencia

El harness pertenecerá a `apps/companion`, no al core universal. IgnacioBarEsp decide viabilidad/adopción y quién mantiene receta/provenance/avisos. Herramientas locales fijadas, sin servicios pagos, cuentas nuevas ni telemetría.

La base npm usa Artistic-2.0, con licencias de sus dependencias. Conservaremos textos y avisos de inputs, y elaboraremos una matriz de procedencia/obligaciones/diferencias para revisión. Esta fase no redistribuye el derivado ni aprueba cumplimiento futuro; las conclusiones dudosas bloquean la adopción. No cambiaremos los avisos publicados por un resultado experimental.

## Risks / Trade-offs

| Dimensión | Consecuencia propuesta | Comprobación |
| --- | --- | --- |
| Seguridad | Más control de composición, pero otro productor confiable y posible falso verde | Inventario físico, auditor independiente, hashes y regresiones |
| Rendimiento | Sin servicio nuevo; deps/build pueden cambiar latencia | Workloads iguales, caché fría/caliente, tiempos |
| Memoria | Sin proceso residente nuevo; buffers npm podrían variar | RSS pico de operaciones equivalentes |
| Fiabilidad | Incompatibilidad transitive o build no determinista | Dos builds, matriz Node, cancelación/error/cache |
| Operación | Nos tocaría mantener receta y vigilancia si se adopta | Owner y costo explícitos; no adoptar en este spike |
| Migración | Ninguna sobre usuarios en faseA; una adopción exigirá nueva identidad | Hash/diff de límites y spec posterior |

Un componente sin corrección comprobable o fuera del allowlist aprobado → dictamen no-viable/inconcluso, sin fork implícito.
Auditoría excluye bytes → fallo cerrado, no exception.
#208 sigue rojo → no afirmar CI requerido verde.
Supuesto éxito del spike → no publicar ni cerrar #204.
Cambio upstream o source drift → refrescar evidencia y volver a revisar alcance.

## Migration Plan

No hay migración de usuario. Después de aprobación explícita implementaríamos harness/tests, registraríamos inputs fijados, ejecutaríamos las pruebas y produciríamos el dictamen. Luego revisión adversarial real, assessment de deuda, readiness archive y archivo oficial. Un PR de investigación usaría `Refs #204`, mantendría el bloqueo de integración si CI no pasa y no mezclaría fixes en #207.

Si la investigación es viable, presentaremos una spec de adopción que incluya actualización de catálogo, locks, avisos, manifiestos/hashes, instalación y reparación real, transición oficial/derivado/versiones con rollback e interrupción verificados, artefacto canónico, revisión y PR protegido. No damos por aprobada esa segunda fase con este documento.

Rollback del spike: preservar candidata rechazada y evidencia fuera de rutas de usuario, elegir copia nueva del baseline fijado y verificar hashes. No modificar ni borrar runtimes existentes. No ofrecer como rollback una versión vulnerable para publicar.

## Open Questions

Segunda ampliación **aprobada en d6e2b543d632dc35b099037746891dbe2f3983db**, con [respuesta literal](evidence/boundary-amendment-approval.md): [boundary-amendment.md](boundary-amendment.md) cubre únicamente la canonicalización necesaria de directivas/vencimiento y nueva metadata304/Vary, y la frontera del caller compatible make-fetch-happen15.0.6 en policy.js/entry.js/index.js. El guard del componente no controla una devolución que el caller realiza sin consultarlo. Un predicado único debe mantener matching y restricciones incluso en error/red y preferencias de caché. No alterar defaults ni otras reglas para producir PASS. La aprobación anterior de6b3997 no autorizó automáticamente estos cambios adicionales; el registro conserva el presupuesto acumulado y los resultados previos, no una aceptación del diff nuevo.

La fase original, la condición reversible y la ampliación concreta para un solo parche están aprobadas. El Apply encontró límites de parsing/expiración y metadata304, además de rutas de un caller distinto que el parche autorizado no corrige. La candidata no es apta; no se probaron composición completa/compatibilidad de npm ni reparación/recursos. Otra modificación de código upstream, obligaciones de redistribución o cambio de runtime exige otro acuerdo, nunca autorización inferida.

## Final recipe accepted; compatibility stop before freeze

[final-recipe-amendment.md](final-recipe-amendment.md) recibió «si» sobre be7a2ed48c0f977f49da9857245f9f2096f83788; [registro literal](evidence/final-recipe-approval.md). Máximo4,3 consumidas/1 restante. No cuarta construcción ni quinto intento. La variante3 conserva154/161 componente y67/69 caller real, revisión parcial/incompleta; su152/152 inicial no es aceptación.

El investigador fresco y la reproducción independiente del padre confirmaron tres parejas completas byte-idénticas de estados originalesv1, con header/map efectivos ya reformateados por ignoreCargoCult. No se pueden recuperar comillas perdidas. El caller guarda headers de la Response, por lo que esta igualdad no se atribuye automáticamente a toda entrada de su índice. Cacache compact/verify/tombstones tampoco acreditan por sí solos coordinación durable. El acuerdo aprobado manda detenerse si no se pueden mantener compatibilidad/defaults/effective maps: se cumplió sin gastar el último intento.

## Proposed cache-format migration — not approved or implemented

[cache-migration-amendment.md](cache-migration-amendment.md) es la decisión concreta. Solo si se aprueba esta revisión y costo, permitirá serialización del componentev2 (mismos otros campos; v1 rechazada con error de serialización), metadata peosCacheBoundaryv1/generación del caller y journal .peos-cache-boundary-v1 dentro de cachePath propio separado de tmp/content/index. No se convierten estados antiguos a v2 ni se bendice una caché vieja al reconstruir el journal. Se conservan fuentes/estados anteriores.

El protocolo exacto y su esquema deben fijarse aquí antes de congelar una receta: identidad de clave/variante/cuerpo, estados cuarentena/confirmación, escritura y readback, exclusión de escritores cooperantes, leases/interrupción, comprobación de generación antes de reutilización/stream commit y recuperación fail-closed. Journal ausente/corrupto o mantenimiento que pierda un cuerpo provoca miss/error, nunca un permiso antiguo. No robar leases por timeout/PID únicamente ni aceptar solo un await insert resuelto.

La garantía propuesta cubre las decisiones del caller parcheado frente a compact/verify/escritores viejos, no controlar lecturas propias de binarios no parcheados ni un atacante del filesystem. Cachés por canal/versión separadas y procedencia válida antes de servir; ninguna caché compartida o proyecto se borra. Entradas anteriores pierden reutilización offline incluso si antes eran legítimas; con red se descarga de nuevo sin validadores heredados y only-if-cached devuelve ENOTCACHED sin red. I/O/memoria/tiempo deben medirse. Owner IgnacioBarEsp, sin compromiso indefinido.

Esta es una excepción propuesta únicamente de representación/migración/persistencia, no de controles de seguridad/auditoría o versión de paquete. Conserva cuatro source files, APIs existentes de cacache/builtins Node, defaults, comillas/formatter, Expires/Pragma/matching/Vary, todas las fuentes/licencias, presupuesto y gates completos. Los cambios esperados de casosv1 se enumeran con justificación; las expectativas/resultados históricos no se editan ni se borran.

Mientras falta la aprobación de esta migración, no modificar upstream patches/postimages ni congelar receta4. Si el protocolo no cabe o no demuestra la frontera, detener; cuarta congelada fallida no autoriza quinta. Full npm/audit/runtime/install/repair/resources/reversibilidad/revisión/deuda/adopción siguen pendientes; no archivo de fase incompleta, CI ficticia, cierre204/ola3 u ola4.
