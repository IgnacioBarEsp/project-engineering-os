# Capturas del Companion actual

La imagen muestra una ejecución del código integrado, no una maqueta. **No es una captura del instalador
0.1.0**, que contiene una versión anterior de la interfaz. El instalador siguiente se verifica en
[#117](https://github.com/IgnacioBarEsp/project-engineering-os/issues/117).

![Inicio del Companion con acceso a proyectos, preparación y ayuda, y explicación del recorrido local](../assets/companion-current-home.png)

## Procedencia

| Dato | Valor |
| --- | --- |
| Fuente | [Commit 0c632a3](https://github.com/IgnacioBarEsp/project-engineering-os/tree/0c632a38e45d41f741b54e68777102a03d0bf3d0) |
| Fecha local | 14 de septiembre de 2026 |
| Ejecución UTC | 2026-09-15T01:16:14.228Z |
| Entorno | Windows, Edge, renderer real en navegador |
| Archivo | `docs/assets/companion-current-home.png` |
| SHA-256 | `95cba1f9ef5800dd1233ae4bd4dec55e422c4a8af908a82cbadd2ffb5710d57b` |
| Tamaño | 119802 bytes; 1180 × 1452 píxeles |
| Generador | `apps/companion/scripts/verify-ui.mjs`, sin cambios de UI para la captura |

La captura completa del inicio no contiene proyectos ni rutas personales. Se seleccionó después de
inspeccionarla; no se retocó. La otra captura de búsqueda del ensayo contiene el nombre deliberadamente
malformado de una prueba de seguridad y no se usa como presentación del producto.

## Qué se comprobó

El recorrido automatizado pasó investigación, software, Unity, contenido y trabajo general, con planes
revisados, escritura de fixtures, búsqueda/citas, recuperación y preservación de originales. La interfaz
no produjo excepciones. Se comprobaron vocabulario, nombres de acciones, contraste, teclado y anchos de
1180, 768, 480 y 240 píxeles CSS.

La prueba usa motores reales y datos sintéticos identificados, con diálogo nativo, portapapeles, apertura
externa y transporte sustituidos. No acredita instalación, firma de editor, diálogo de Windows, lectura
en frío con personas ni activación de herramientas reales en este run. Esos límites se conservan aunque
la imagen parezca igual a la ventana de escritorio.

## Cómo actualizarla

Desde un source identificado, ejecuta `npm run test:ui --prefix apps/companion -- /ruta/a/evidencia`.
Inspecciona las imágenes, elige solo las necesarias, comprueba que no incluyen datos privados y actualiza
este registro y el pie del README. Verifica después que el archivo copiado conserva el hash.

La próxima captura del instalador debe proceder del mismo build que se publique. La captura final de la
landing se añade cuando estén terminadas su página y publicación; el preview técnico no se presenta como
la página final. [Estado de entregas](../PROJECT_STATUS.md).
