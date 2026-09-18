## Context

Los prototipos de Google Stitch (`Obsidian Precision Studio`) y las directrices de artesanía de software de [pbakaus/impeccable](https://github.com/pbakaus/impeccable) establecen un estándar de excelencia visual: interfaces tranquilas, tipografía intencional, ausencia de falsos gradientes saturados o rebotes artificiales, y microcopia humana sin tecnicismos intimidantes.

## Decision

1. **Directrices de Diseño Impeccable**:
   - Integración de directrices de diseño y reglas anti-slop en el repositorio (`.github/skills/impeccable/`).
   - Gobernanza de colores sin negros puros (#000000) ni blancos clínicos, utilizando la escala tonal de Obsidian Precision Studio y acentos técnicos de esmeralda.
2. **Micro-interacciones y Animaciones Fluidas**:
   - Transiciones de pantalla `.enter` con desaceleración natural: `cubic-bezier(0.16, 1, 0.3, 1)` y desplazamiento vertical de 6px.
   - Hover reactivo en cards (`.profile-card`, `.delimitation-card`, `.bifurcation-card`, `.prompt-chip`) con elevación física sutil (`translateY(-2px)`) y feedback táctil en `:active`.
   - Soporte estricto de `prefers-reduced-motion: reduce` suprimiendo toda animación y transición.
3. **Loaders y Estados de Actividad**:
   - Implementación de loaders tipo shimmer (`.skeleton-shimmer`) para contenedores de carga y preparación.
   - Barra de progreso interactiva del wizard con transición suave de ancho y halo verde (`box-shadow`).
   - Pulso esmeralda suave (`@keyframes pulse-emerald`) en el indicador de éxito de la pantalla final.
4. **Copywriting y Microcopia Humana**:
   - Depuración de textos en todas las pantallas de Companion: eliminación de términos intimidantes como "PID de daemon", "indexador vectorial" o "bootstrap runtime".
   - Explicación concisa y tangible de la bifurcación del Paso 4 (Vía Rápida vs. Que mi IA se encargue).
   - Optimización de espaciado vertical y horizontal en tarjetas para evitar scrolling o espacios vacíos.
5. **Armonización de Landing Page (`site/index.html`)**:
   - Acentos de diseño de precisión y elevación hover en botones y claims protegidos bajo `prefers-reduced-motion: no-preference`.
   - Preservación innegociable de: 0 dependencias externas, 0 scripts JS, exactamente 1 `<h1>` y 15 encabezados continuos, contraste AA/AAA.

## Recovery

Reversión atómica mediante `git revert` del commit en la rama de trabajo. Los archivos del usuario en disco y proyectos previamente creados se preservan intactos sin riesgo de regresión.
