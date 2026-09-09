# Referencias observadas mediante navegador — 2026-09-08

Trabajo de referencia para #79/#81, todavía no una comparación contra la implementación final.

## AI in Design Report 2026

- Selección observada en https://www.awwwards.com/sites/ai-in-design-report-2026; sitio abierto desde su enlace: https://stateofaidesign.com/.
- Portada observada en 1280 × 714: tipografía negra de gran escala, composición asimétrica en dos columnas, fondo claro, banda de imágenes abstractas y navegación persistente. El contenido editorial tiene protagonismo y el recorrido se divide en Tools/Craft/Teams.
- Se abrió el menú Read the Report: panel naranja lateral con enlaces grandes numerados, cierre visible y contenido principal aún visible. Escape no cambió el estado observado; no se afirma una auditoría completa de accesibilidad del sitio.
- Criterio propio: navegación por etapas visible, titulares concretos, jerarquía editorial y datos con fuente. Nuestros paneles tendrán botón semántico, Escape, foco y retorno de foco verificados. No reutilizar imágenes, fuentes, código, marcas ni métricas del informe.

## CIPHER

- Referencia: https://www.awwwards.com/sites/cipher; sitio original: https://cipher.tv/.
- Portada observada: fondo negro, espacio amplio, composición circular de piezas audiovisuales, marca discreta y navegación superior. Se accionó Works para observar transición a proyectos.
- El árbol de accesibilidad mostró letras separadas/temporales en enlaces animados. En nuestra implementación el nombre accesible debe permanecer estable mientras se anima la presentación visual.
- Criterio propio: una escena visual puede explicar las piezas del proyecto y acompañar la identidad de la landing. La ruta de descarga y la explicación del producto deben seguir siendo claras y funcionales con movimiento reducido y sin efectos gráficos.

## Verificación pendiente

Completar navegación, móvil, lectura y estados de carga de las referencias seleccionadas; evaluar la implementación propia con capturas y recorridos equivalentes. No se han medido aún rendimiento, contraste ni accesibilidad completos de estos sitios. No se han extraído ni descargado assets ajenos. La comparación final se documentará con decisiones y límites en el SDD de UI/landing.
