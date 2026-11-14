## Context

Companion 0.3.6 sirve módulos ES sin build bajo una CSP con `script-src 'self'`, `style-src 'self'` y `connect-src 'none'`. Su `app.mjs` mezcla estado, navegación, Inicio, Ayuda, asistente y proyecto; el CSS conserva reglas y colores de dos generaciones. La revisión de #142 observó palabras partidas a 1040 px y estilos en línea bloqueados por la CSP. El harness actual sirve cuatro archivos conocidos y muchas mutaciones buscan texto literal en `app.mjs`, de modo que una división de módulos también requiere migrar la medición.

## Goals / Non-Goals

**Goals:** crear una base sin framework ni build, mantener funcional el recorrido actual durante la transición, dar a todas las rutas una única fuente de breadcrumb/nav/paso, servir únicamente assets locales declarados, y medir el shell real con movimiento normal y reducido.

**Non-Goals:** cambiar el motor, IPC, preparación o los recibos; introducir ya los seis perfiles, el flujo final de cuatro pasos, las dos vías reales o la pantalla de proyecto 0.4. Esos cambios tienen sus issues #145–#149. #150 completa las matrices y Electron después de esta fundación.

## Decisions

### Módulos ES directos y biblioteca pequeña

Se conservan los módulos nativos y el DOM construido con `createElement`/`textContent`. `lib/dom.mjs` contiene `el`, `own` y el acceso al glosario; `lib/state.mjs` guarda estado por pantalla y suscripciones; `lib/router.mjs` declara rutas. `app.mjs` solo ensambla servicios y pantallas. Las pantallas viejas se trasladan a módulos acotados mediante contexto inyectado para evitar ciclos de importación y se sustituyen en los issues siguientes. Cada archivo de `ui/` debe quedar bajo 400 líneas.

Se evaluó Preact + htm (MIT), que permitiría componentes pequeños, pero añade otra dependencia y otra semántica de render a una app distribuida sin build. Se reconsiderará si la biblioteca propia supera 300 líneas de lógica de interfaz, sin contar datos de rutas o tokens.

### Rutas y estado de navegación

Una tabla cerrada `page → {breadcrumb, nav, step}` contiene Inicio, proyectos, Ayuda, las pantallas vigentes del asistente y las pantallas de revisión que siguen accesibles durante la transición. `render` toma la clave de ruta, actualiza el breadcrumb, las cuatro pastillas y el riel desde esa entrada. Los pasos provisionales agrupan las pantallas actuales en cuatro decisiones; #146 sustituye sus contenidos sin crear una segunda fuente. El estado del formulario se conserva al cambiar de ruta; los cambios locales notifican solo a los suscriptores interesados.

### Layout y estilos

`body` tiene filas header de 56 px y main con scroll propio; el asistente usa un riel y contenido, y `footer.actions` es hermano del contenido con `position:sticky; bottom:0`. No se usa `position:fixed` dentro de un ancestro transformado. Bajo un contenedor de 900 px el riel se vuelve horizontal. Las capas `tokens`, `layout`, `components`, `pages` evitan excepciones por especificidad; todos los colores hexadecimales viven en `tokens.css`. El cuerpo usa la pila del sistema y el código una pila monoespaciada local. Se descartan Geist/JetBrains empaquetadas en este change para no ampliar el instalador ni crear avisos de licencia innecesarios.

### Iconos y recursos

Un sprite SVG local de iconos Lucide usa trazos con `currentColor` y referencias `./icons.svg#...`; el icono de marca existente permanece alineado con el ejecutable. Se añade su aviso ISC. `desktop/main.mjs` mantiene una allowlist de rutas y tipos MIME exactos. Una prueba compara recursivamente los archivos de `ui/` con esa lista; los harnesses de navegador sirven esos mismos assets, con la CSP del producto y sin salir a red. Una ruta omitida falla la prueba y una ruta no permitida falla el protocolo.

### Inicio, Ayuda y señales verdaderas

Inicio presenta en una frase el trabajo de la app y una única acción principal. Los cuatro destinos mantienen los nombres de `ACTIONS`; el control Privacidad queda en la cabecera. El indicador de entorno se renderiza solo cuando un estado comprobado del servicio proporciona capacidades y runtimes verificados. Ayuda conserva el glosario alcanzable y sus definiciones. Los botones decorativos, emoji y estilos en línea desaparecen.

## Verification strategy

| Área | Tipo | Casos y límite |
| --- | --- | --- |
| Rutas y assets | Unidad/contrato | Tabla cerrada, concordancia de breadcrumb/nav/riel y correspondencia exacta de archivos/allowlist. |
| Comportamiento | Integración en navegador | Inicio, Ayuda, todos los destinos existentes, acciones, glosario, 1180/1024/768/480 px y ambos modos de movimiento. No se acepta un denominador cero. |
| Accesibilidad y CSS | Probes de DOM/CSS | Contraste AA, ausencia de scroll horizontal y de `fixed` bajo transform, foco/alcanzabilidad y cero estilos inline bajo CSP. |
| App real | Electron/manual | Capturas y consola de Inicio/Ayuda con procedencia; la matriz completa de Electron y todas las rutas corresponde a #150. |

La estrategia sigue la prioridad de interacciones y límites de seguridad sobre getters o detalles de framework. Los probes de #150 extenderán esta base a los seis perfiles, las dos vías, restauración y mutaciones adicionales.

## Risks / Trade-offs

- **Una acción se pierde al dividir módulos** → comparar la tabla cerrada de acciones con controles visitados; conservar los tests de mutación con rutas de archivo actualizadas, sin contar excepciones como detección.
- **Una ruta declarada carece de vista** → fallar cuando una ruta no se visita o no tiene título/breadcrumb/nav, y probar las rutas heredadas durante la transición.
- **Un asset nuevo no carga en Electron** → prueba de igualdad entre directorio y allowlist y smoke con CSP nativa.
- **La CSS nueva desborda un viewport pequeño** → medir geometría y contraste en cuatro anchos y mantener una barra en flujo sin espacio muerto.

## Migration Plan

1. Registrar spec y prueba base del shell; dividir el módulo preservando nombres y payloads.
2. Introducir rutas, tokens, layout e iconos; reconstruir Inicio y Ayuda.
3. Migrar harnesses y mutaciones al nuevo árbol, ejecutar browser/Electron, guardar capturas y evidencia.
4. Archivar con OpenSpec y fusionar por PR protegido. Un revert del PR restaura el renderer anterior; no hay migración de datos.

## Open Questions

Ninguna decisión de producto pendiente: la dirección visual, la arquitectura sin framework y el uso local de iconos están aprobados en #144. Los detalles del flujo y del movimiento se deciden en sus issues.
