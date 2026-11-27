## Why

El renderer de Companion concentra navegación, estado y pantallas en un único módulo de más de mil líneas. La cabecera, los estilos duplicados y las rutas del asistente ya producen señales visuales contradictorias; #144 establece una base verificable antes de reconstruir las pantallas de #145–#149, mientras #150 amplía el arnés desde esta primera entrega.

## What Changes

- Sustituir el módulo monolítico por módulos ES por pantalla, una biblioteca DOM y de estado pequeña, componentes reutilizables y una tabla única de rutas. Se conservan los nombres de acción, el glosario, el marcado de palabras de la persona y la construcción de DOM compatible con CSP.
- Introducir tokens y capas CSS para la paleta Obsidian, un layout de aplicación con un único scroller, una barra de acciones del asistente en flujo, iconos SVG locales y una cabecera sin indicadores decorativos.
- Reconstruir Inicio y Ayuda con la dirección visual aprobada. Durante este change, las pantallas actuales del asistente y de proyecto siguen accesibles mediante el nuevo shell; su flujo y taxonomía cambian en los issues posteriores.
- Hacer que la allowlist de `peos://` cubra exactamente los assets locales del renderer y que la verificación de interfaz alcance las rutas, los estados de navegación, el contraste y la geometría del nuevo shell sin aceptar pases vacuos.
- Sustituir `DESIGN.md` por el contrato de diseño de Companion 0.4 y registrar la licencia ISC de los iconos Lucide incluidos.

## Capabilities

### New Capabilities

- `companion-renderer`: arquitectura de módulos, rutas declaradas, assets locales y reglas de layout/CSP verificables para el renderer.

### Modified Capabilities

- `companion-experience`: el tema Obsidian, la navegación superior y el estado del asistente se derivan de rutas; Inicio y Ayuda dejan de mostrar señales decorativas o promesas no medidas.

## Impact

Se modifican `apps/companion/ui/`, la allowlist del protocolo en `desktop/main.mjs`, los verificadores de interfaz y `DESIGN.md`. El motor, los canales IPC y el empaquetado permanecen con sus contratos actuales. No se añaden framework, build, recursos de red, fuentes de terceros ni dependencias de runtime. Los iconos SVG locales llevan su aviso ISC.

## Non-goals

La taxonomía de seis perfiles (#145), el asistente único (#146), la orquestación del paso 4 (#147), las pantallas de proyectos (#148), el sistema completo de movimiento (#149) y el harness exhaustivo de Electron (#150) se completan en sus changes posteriores.

## Risk and rollback

La división del renderer puede dejar una acción sin control o una pantalla sin cobertura. La tabla de acciones y el arnés deben fallar ante esa pérdida; las pruebas de UI y del paquete se ejecutan antes del PR. Si el shell impide completar el recorrido vigente, se revierte el PR mediante un nuevo commit; los proyectos preparados no dependen del renderer.
