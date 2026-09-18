## Why

Inspirado en el estándar de artesanía de software y diseño de [pbakaus/impeccable](https://github.com/pbakaus/impeccable), la interfaz de Companion y la Landing Page pública deben elevar su calidad visual mediante micro-interacciones intencionales, transiciones con curvas cubic-bezier suaves, loaders elegantes (shimmer y pulso esmeralda) y microcopia humana sin fricción técnica. Esta propuesta incorpora directrices de diseño en el repositorio, refina los estilos visuales y la redacción de todas las pantallas, y armoniza la landing page preservando estrictamente sus contratos de cero peticiones externas, cero scripts y accesibilidad AA/AAA.

## What Changes

- **Directrices de diseño Impeccable**: Incorporación de directrices de diseño y reglas anti-slop de IA (paletas equilibradas, curvas de desaceleración sin rebotes elásticos, contraste AA/AAA) en la suite de estilos y validaciones.
- **Micro-interacciones y transiciones en Companion**: Aplicación de animaciones de entrada fluidas (`cubic-bezier(0.16, 1, 0.3, 1)`), elevación física en hover (`translateY(-2px)`), foco accesible con halo sutil y respeto riguroso a `prefers-reduced-motion: reduce`.
- **Loaders y estados de actividad**: Barras de progreso fluidas en el asistente, placeholders con efecto shimmer durante la indexación/preparación, y pulso esmeralda armónico en la pantalla de éxito.
- **Copywriting y microcopia humana**: Depuración de textos en los 4 pasos y pantalla final, eliminando jerga técnica intimidante, optimizando la densidad de espacio vertical/horizontal y puliendo la redacción del Prompt Maestro.
- **Armonización de la Landing Page (`site/index.html`)**: Estilizado con acentos técnicos de precisión de Obsidian Precision Studio, superando las pruebas deterministas de `verify-landing.mjs` con contraste óptimo en modos claro y oscuro.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `companion-experience`: define los estándares de excelencia visual, micro-interacciones, animaciones intencionales, loaders y microcopia humana para Companion y la Landing Page.

## Impact

Issues: https://github.com/IgnacioBarEsp/project-engineering-os/issues/132, https://github.com/IgnacioBarEsp/project-engineering-os/issues/133.

Mantiene el core universal `create-project-engineering-os` 0.5.0 neutral y sin mutaciones. Sin telemetría, sin librerías pesadas externas ni dependencias bloqueantes. 100% local, offline y accesible.
