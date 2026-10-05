# Aprobación de migración de datos de caché

Revisión presentada:54c6b2c348074c330468317e2790af784ac169af, cache-migration-amendment.md y sus additions explícitas de proposal/design/spec.

Pregunta del asistente:

> ¿Apruebas esta migración experimental? Conserva la caché antigua, pero deja de reutilizarla y prueba un formato nuevo. Eso puede exigir descargar nuevamente y perder disponibilidad sin conexión. Solo afecta al experimento desechable, no a tus proyectos ni a tu instalación.

Respuesta humana literal:

> Apruebo

Esta respuesta acepta la revisión realmente enlazada, su incompatibilidadv1/offline y costo I/O/mantenimiento: serializaciónv2 con otros campos/defaults conservados, metadata/generaciones y journal experimental del caller en cachePath propio. No se infiere de la autorización anterior del cuarto intento ni se vuelve a pedir esa aprobación. La allowlist permanece dos componentes/cuatro source files; fuentes/licencias, protecciones/auditorías y todos los gates siguen vigentes.

Antes de freeze:3/4 variantes consumidas,1 restante,0 npm completos. El esquema/protocolo exacto aún debe fijarse en diseño dentro de ese acuerdo antes de congelar. No quinta/reset/rebase automático. No equivale a protocolo implementado/probado, adopción, publicación, cambios al host/Companion/proyectos/locks/catalog/notices o autorización de ola4. Si el protocolo no puede demostrarse dentro del límite se detiene sin falsear el resultado.

