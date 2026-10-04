## Context

El catálogo de Companion fija npm11.19.1 y el empaquetador sella todo su árbol. La integridad acredita qué bytes son, no que sus dependencias estén corregidas. Los overrides históricos no repararon las copias bundled. npm11.21.0 y12.2.0 ya se probaron el30sept y fallaron; no repetiremos esas instalaciones por preparar una propuesta.

La CI37171002125 de #207, SHA9feea6597d4fc43ab1f4dfb6a45f5bf4c797ac92, reporta24 vulnerabilidades Companion, además del fallo distinto #208 en root/blueprint. Son observaciones históricas fechadas, no un audit recién ejecutado del candidato.

Status: **Proposed**. Fecha local:2026-10-03; el scaffold oficial registra2026-10-04 UTC. Decisor: IgnacioBarEsp. La confirmación humana autoriza esta preparación, no la aprobación futura ni la distribución.

## Goals / Non-Goals

**Goals:** decidir con evidencia si una composición basada en fuentes oficiales puede corregir el árbol npm sin romper el contrato de Companion; conservar controles y reproducibilidad, incluida una salida no-viable.

**Non-Goals:** adopción automática, fixes de #208, cambio de gestor/baseline, parches propios, cambios de runtime/installer, actualización silenciosa de OpenSpec, modificaciones de políticas/protecciones o trabajo de ola4.

## Decisions

### Separar investigación de adopción

Elegimos proponer un spike aislado antes de tocar producción. Esperar exclusivamente upstream conserva menor carga propia, pero no controlamos su calendario; adoptar ya un derivado trasladaría a nosotros responsabilidad aún no medida. El spike compra información y puede fallar correctamente.

Esta fase autorizaría, solo después de aprobarla, preparar herramientas de experimentación y candidatas no distribuibles. Incluso un dictamen viable no aprueba un cambio de catálogo/locks ni un instalador. Ese cambio posterior requerirá criterios acordados, licencias y recuperación de una distribución real.

### Fuente fija y diferencias explícitas

Base del experimento: fuentes de npm11.21.0, commit `5fd1e17e468d58e7f14dc6cbb5390029ff49a41d`. El artefacto oficial de referencia es `https://registry.npmjs.org/npm/-/npm-11.21.0.tgz`, con integridad `sha512-Zov8KhamNneiLdELtj5YALtNmJW4L4fCLTzjfpzXG2w6MSHcf0UxgdlK5uloCuksWT+7mGUU7wi79cO6RqivPg==`. La obtención de fuentes también fijará y conservará digest propio. No aceptaremos latest flotante ni modificación upstream del mismo número de versión.

La receta partirá del manifest upstream conservado y producirá, en una copia propia, metadata de composición que declare cada dependencia fijada, su origen/integridad y el motivo del cambio. Se reconstruirá el grafo desde cero; no se conservará un bundled tree vulnerable mientras se audita otro grafo virtual. Las únicas diferencias permitidas en esta fase son metadata necesaria para reconstrucción, lock candidato y selección de dependencias compatibles de origen oficial; el código npm y el de las dependencias deben corresponder a los inputs fijados. No se permite editar source vulnerable para inventar un parche.

Las versiones exactas de los componentes se determinarán con fuentes oficiales y comprobación de compatibilidad, y se congelarán en la receta antes de construir. No estamos aprobando versiones hipotéticas. Cada variación de inputs tendrá su propia identidad/resultados, con máximo tres recetas completas dentro de este spike; dos builds por receta no cuentan como dos alternativas. Si falta una corrección comprobable o hace falta modificar código upstream, el informe termina no-viable/bloqueado por alcance y solicita una nueva decisión.

La identidad del experimento será `experimental-npm-composition` con source version, recipe hash y árbol final; no se presentará como una distribución npm oficial intacta.

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

Un componente sin parche comprobable → dictamen no-viable, sin fork implícito.
Auditoría excluye bytes → fallo cerrado, no exception.
#208 sigue rojo → no afirmar CI requerido verde.
Supuesto éxito del spike → no publicar ni cerrar #204.
Cambio upstream o source drift → refrescar evidencia y volver a revisar alcance.

## Migration Plan

No hay migración de usuario. Después de aprobación explícita implementaríamos harness/tests, registraríamos inputs fijados, ejecutaríamos las pruebas y produciríamos el dictamen. Luego revisión adversarial real, assessment de deuda, readiness archive y archivo oficial. Un PR de investigación usaría `Refs #204`, mantendría el bloqueo de integración si CI no pasa y no mezclaría fixes en #207.

Si la investigación es viable, presentaremos una spec de adopción que incluya actualización de catálogo, locks, avisos, manifiestos/hashes, instalación y reparación real, artefacto canónico, revisión y PR protegido. No damos por aprobada esa segunda fase con este documento.

Rollback del spike: preservar candidata rechazada y evidencia fuera de rutas de usuario, elegir copia nueva del baseline fijado y verificar hashes. No modificar ni borrar runtimes existentes. No ofrecer como rollback una versión vulnerable para publicar.

## Open Questions

La aprobación de este proposal/design/spec sigue pendiente. También son resultados a investigar —no permisos omitidos— la existencia de una composición realmente corregida/compatible, las versiones concretas de componentes, los recursos y el costo futuro de mantenerla. Si la respuesta requiere modificar código upstream, redistribuir con obligaciones no resueltas o alterar runtime soportado, detenerse y proponer un acuerdo distinto.
