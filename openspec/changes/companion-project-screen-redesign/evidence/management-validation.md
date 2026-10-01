# Verificación de gestión primero — 2026-09-30

Spec/ADR documentados tras la aprobación literal, antes de modificar renderer o probes.
DoR read-only de #148: 13 PASS/0 FAIL, exit 0. OpenSpec local fijo 1.6.0: strict exit 0.

Pase observado en el árbol de #148:

- QA de gestión/navegación/lenguaje: 15/15, exit 0.
- Companion completo: 210/210, exit 0 (este padre aún no contiene las pruebas de #149/#150).
- Matriz real navegador/servicio: 32 pantallas, cuatro anchos y ambos movimientos,
  nombres/motivos de todos los pasos iguales a los del servicio, operaciones sin duplicar
  al expandir, guía IA plegada inicialmente, foco visible al volver a preparación, cinco
  originales intactos, cero errores, exit 0. Conserva las fronteras de skeleton/timeout.

El recorrido completo de UI y las mutaciones adversariales se repetirán tras integrar en
#150; no se atribuye el resultado anterior al árbol reorganizado. Capturas finales con el
fondo de #149 tampoco se presentan todavía. No es Electron ni instalación publicada.

Revisión propia: mismo catálogo y API cerrados, texto local sin HTML, sin dependencia o
capacidad nueva de archivos. La duplicación desde el detalle debe pasar perfil/enfoque
normalizados como lo hace la fila; se añadieron esos metadatos para no caer en el perfil
predeterminado. No añade copia de carpeta. Una navegación plegada no puede dejar foco en
un botón oculto; al cerrar estando en una herramienta vuelve a preparación, y un evento
de un nodo desprendido no puede cambiar el proyecto vigente. Mientras hay trabajo activo
no se permite ese cierre. La reentrada directa abre el selector. Recuperación y eliminación
del historial mantienen sus confirmaciones y protección de cambios posteriores.

Los pasos locales y los opcionales conservan la lista .guide y todos sus controles para que
GUIDE siga observándolos, incluidos los descendientes del desplegable. El harness abre los
summary con clics reales para comprobar controles plegados; no fuerza detalles.open ni
acredita un control invisible como alcanzable. Se conservan los negativos originales.

No se detecta defecto técnico nuevo diferido en este ajuste; no es una revisión independiente.
La dirección y aceptación visual son cosas distintas, así como el assessment técnico y el
cierre de ola 3. #204, revisión independiente, CI protegida y gates humanos continúan abiertos.
