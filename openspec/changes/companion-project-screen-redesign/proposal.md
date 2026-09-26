## Why

Issue #148: https://github.com/IgnacioBarEsp/project-engineering-os/issues/148. La lista espera sin explicar la carga y la pantalla de proyecto mezcla guía, etapas y herramientas. Debe usar el sistema de #144 conservando los contratos medidos.

## What Changes

- Lista modular con filas, orden por comprobación, carga diferida 300 ms y estados vacíos/error explícitos.
- Cabecera de proyecto y cuatro segmentos Estado, Archivos, Recetas y Tu IA, con URL interna y teclado.
- Guía primero, acciones una vez y contenido exclusivo por pestaña.
- Pruebas de demoras, teclado, rutas y contratos existentes sin reducir sus denominadores.

## Capabilities

### New Capabilities
- `companion-project-navigation`: lista, carga y proyecto segmentado con contratos conservados.

### Modified Capabilities

Ninguna; complementa companion-experience sin cambiar sus obligaciones.

## Impact

Solo renderer, allowlist de assets y ensayos. Sin nuevo IPC, dependencias, telemetría, sincronización ni cambios a proyectos. Riesgo: pruebas vacuas tras extraer módulos; conservar mutaciones. Rollback: revertir PR, sin migración de datos. Autorización: alcance del issue aprobado y delegación del mantenedor para ola 3; aceptación visual y revisión independiente se registran aparte.
