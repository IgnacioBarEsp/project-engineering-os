# 2026-09-30 · distinción entre búsqueda y texto para IA

`final-reading-round.json` conserva las seis respuestas nuevas literalmente, una sola vez.
La confirmación de lectores nuevos, orden sin explicación y señalamiento del control está pendiente.
El contenido del paso 1 es favorable; exportación no está demostrada. No se atribuye un fallo
exclusivo al nombre del botón porque una persona no supo cuál evaluar. Las rondas previas y sus
alcances permanecen intactos; no hay PASS nuevo ni cierre de #149.

Refinamiento delegado de #149: dos regiones tituladas en Archivos, una para buscar y otra para
preparar texto. Comparten fila en escritorio y se apilan por debajo de 900 px. El botón conserva
su nombre y requiere una consulta no vacía; no exige pulsar Buscar antes. `data-disabled-idle`
conserva esa restricción cuando el controlador de actividad termina o vuelve a renderizar.
Inicio, paso 1, servicio, IPC, revisión, copia explícita y ausencia de envío automático no cambian.

Verificación focal local:

- Dos regresiones estáticas de tareas/consulta/responsive y nueve de lenguaje: 11/11, exit 0.
- Companion completo: 219/219, exit 0; incluye rechazos de export con recibo/fuentes modificados,
  límites de bytes, copia nativa rechazada y conservación de originales.
- OpenSpec local fijo 1.6.0 estricto y `git diff --check`: exit 0.

La matriz de interacción/browser del nuevo diseño y sus capturas se añadirán en #150 tras la
integración hacia adelante. No se presenta la prueba estática como un clic real ni el navegador
con superficies nativas inyectadas como Electron o instalación publicada. Aceptación visual,
lectura humana del control revisado, revisión independiente y CI protegida permanecen pendientes.

Revisión propia estructurada: la consulta mantiene su límite, los textos se construyen como nodos
locales, no se añaden rutas externas ni dependencias y los handles revisados siguen siendo
autoridad del servicio. El atributo de disponibilidad es una condición de UI, no autorización.
El controlador aún bloquea toda acción durante busy. No se detecta un hallazgo nuevo que deba
posponerse; esto no acredita revisión independiente o humana. Rollback: revertir renderer y
regresiones, sin migrar datos ni tocar archivos de proyectos del usuario.

## Verificación posterior

- Raíz `npm run check` sobre #149 `3c09508`, sin editar ese árbol durante la ejecución:
  391/391 y todas las fases, exit 0. La actualización de este registro ocurre después del pase;
  no modifica el renderer comprobado ni se atribuye el resultado a otra base.
- Integración hacia #150: 32 pantallas en navegador/servicio real, ocho celdas de Archivos con
  consulta, busy, reentrada/error, revisión/cancelación/copia exacta; ocho copias y cero aperturas
  externas. Cinco originales intactos. Exit 0. Rutas 20/120 con los 16 negativos, exit 0.
- La primera espera del harness pidió visibilidad de un diálogo cerrado y falló; se corrigió
  únicamente la observación a `dialog.open === false`. No se cambió el cierre del producto.

Captura de escritorio inspeccionada: dos tareas y acciones distintas; pantallas compactas
apilan las tareas y permiten llegar al texto mediante scroll. Es inspección propia de navegador,
no aceptación visual humana ni nueva prueba nativa. Evidencia y assessment acotado del refinamiento
se conservan en el change de #150, sin reemplazar el assessment inmutable anterior de #149.
La matriz UI general de #150 aún termina sus fases posteriores; no se acredita su exit final aquí.
