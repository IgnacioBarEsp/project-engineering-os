## Why

El npm 11.19.1 incluido en Companion bloquea CI y el cierre de ola 3. Tras esperar una publicación oficial,
npm11.21.2 supera el preflight independiente y el contrato probado sin reconstruir npm ni parchear sus
componentes. Adoptarlo exige una decisión distinta de la investigación experimental, además de la
reversibilidad entre identidades que el mantenedor pidió.

Refs [#204](https://github.com/IgnacioBarEsp/project-engineering-os/issues/204).
Owner IgnacioBarEsp. Esta revisión está propuesta, **no aprobada**. DoR13/13 sin excepciones precede al
scaffold generado por OpenSpec local1.6.0 el12nov2026.

## What Changes

- Adoptar exclusivamente npm oficial11.21.2 intacto, con fuente/SRI/inventario congelados en diseño.
- Preparar identidad candidata Companion0.3.7, lock/catálogo/notices/hashes coherentes, sin cambiar la
  versión del núcleo ni los demás pins.
- Añadir identidad de distribución y selección durable fail-closed para slots separados; el catálogo
  compilado habilita inicialmente solo el oficial verificado. No añade un selector libre de versiones.
- Mantener aislamiento, scripts/bin-links/workspaces off, registry/edad/exclusión actuales y límites.
- Completar producto empaquetado, reparación/interrupción, regresiones, review/deuda/archivo e integración.
- Usar fuente de integración que incorpore sin ampliación los commits de #214 ya aprobados, de modo que
  un único head se someta a todo CI requerido. La aprobación de #214 no se reutiliza para esta adopción.

## Capabilities

### New Capabilities

Ninguna capacidad universal nueva.

### Modified Capabilities

- `companion-environment`: distribución npm fijada e identidades/selección verificables y recuperables.
- `companion-distribution`: identidad nueva del artefacto y verificación completa del npm incluido.

## Impact

Solo app Companion, sus pruebas, evidencia y documentación de versión. Los archivos permitidos y las
condiciones de parada están en diseño. Las fuentes upstream de npm/componentes no se editan.
El registro de deuda, generados OPSX y los productos de consumidores no son outputs de actualización.

## Non-Goals

No quinto parche, actualización flotante, cambio de gestor/OpenSpec/Node/core/otros runtimes, nueva
excepción, reducción de auditoría/protecciones o fix dentro de #207. No instalar en el host ni cambiar el
layout de Inicio/paso1/Archivos. No afirmar un switching real con un derivado que nunca fue apto.
No publicar ni llamar descargable0.3.7 antes del pipeline canónico. No ola4.

## Risk and Recovery

Los moderate residuales, la recuperación de selección y el empaquetado requieren comprobación separada.
El origen oficial no exime de gates. Cada identidad tiene slot separado; primero verificar, luego
confirmar con generación esperada. Selecciones desconocidas, stale o alteradas fallan cerrado.
El baseline11.19.1 no es un rollback seguro. Preservar proyectos, historial, slots y evidencia.

La investigación previa queda rechazada y trazable; no se archiva incompleta por adoptar un oficial.
Cualquier necesidad fuera de la allowlist, cambio de identidad, nuevo high/critical o incompatibilidad
detiene el Apply y exige revisar el acuerdo real.
