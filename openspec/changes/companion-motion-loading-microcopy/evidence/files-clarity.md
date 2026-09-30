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
