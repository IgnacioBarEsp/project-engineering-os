# Propuesta — diagnóstico acotado de los dos timeouts de recuperación

**Pendiente de aprobación de esta revisión real. No ejecutada.**
Issue existente[#150](https://github.com/IgnacioBarEsp/project-engineering-os/issues/150).
Owner:IgnacioBarEsp. No se crea otro issue o fork. D812/7af/2d2/1cb/f9ed/266/c8 siguen aprobadas y sus presupuestos consumidos no se reinician.

## Decisión que se presenta

Autorizar una única invocación de diagnóstico, con una sola variante de observación
en una copia desechable del harness. No es otra ejecución de cualificación ni un intento
de obtener4/4 con las mismas entradas. Su propósito es identificar la fase que agota90s,
la salida del hijo y el estado conservado al terminar, antes de proponer cualquier arreglo.

## Base y desacuerdo observados

Fuente base03f6a2e1206e0f8694ef07fa8d346bcefe64396b; productoeaf2; aggregate original90e066f637bba6bb1b7b470c57b7568d5fa626c1d34c18146c1421c08724e9a7.
QA original distribution-identity.mjs SHA2566382307b3a4acb0e57a931c0afe95ad35a0478ef1829c262c5a58039ba54d1cf.
D812 dejó2PASS/2CANCELLED bajo los límites originales. No existe traza de la fase.
CI Windows del mismo producto pasó ambos casos en80.616s y58.549s; ese contraste
no demuestra la causa de la diferencia. [Datos y progreso](evidence/current-wave3-progress-20261114.md).

Hipótesis por discriminar: I/O/inventarios finitos; espera de hijo/spawn/exit;
interacción entre cancelación90s, trabajo asíncrono y cleanup; recuperación realmente detenida.
No se presupone ninguna como causa raíz. No se afirma explotación o pérdida de datos.

## Allowlist de observación, no de producto

Solo la copia propia de apps/companion/qa/distribution-identity.mjs puede añadir
marcas JSONL en los dos cuerpos siguientes y en el helper fixture exclusivamente
para identificar creación/cleanup. Un helper supervisor se guarda como artefacto managed,
fuera del repositorio. Se congela su recipe, diff, preimage/postimage y árbol antes de ejecutar.

Targets exactos, cada uno una vez:
1. interrupted repair restores only the journal-owned unchanged quarantine, and retains project/history bytes
2. real process interruption at publication and selector-write rolls back journal-owned selection on restart

Las marcas rodean createRuntimeManager/install/planRepair/repair/inspect,
lectura del selector, iteración del punto, spawn/error/exit/close y cleanup/abort.
En el hijo se registran los eventos onProgress existentes y luego se ejecuta
la condición SIGKILL original sin cambiar sus puntos. Se conservan el bucle de
npm-published/npm-selection-written/npm-confirmed, todas las aserciones, la
recuperación real y los archivos project/history. No añadir mocks o nuevos hooks de producto.

NO cambiar ningún archivo runtime/manager.mjs, runtime/distribution-identity.mjs,
tree/files/catalog/archive/process, UI/engine/IPC/NSIS, pin/lock, npm/Electron,
fixture TLS, CI, política o protección. No ampliar archivos al observar una dificultad.
No alterar esperas, timeouts, expectativas, decisiones de producto o semántica
de cleanup para producir PASS. Si la instrumentación exige eso, detener sin ejecutar.

## Protocolo congelado y presupuesto adicional explícito

- Reutilizar los deps oficiales ya verificados y Node fijo24.18.0/npm11.21.2.
  Nada de descarga/reinstall/npm audit fix, links/junctions o configuración del host.
- Preparación en copia propia con plazo máximo180s. El worktree original queda con
  el mismo código. Rechazar links, paths fuera de la raíz, drift o diferencias extra.
  La copia instrumentada tiene su propio hash, distinto del QA original; nunca
  atribuirle el aggregate original como si no hubiese instrumentación.
- Una única invocación Node --test --test-concurrency=1 con patrón escapado/anclado
  para exactamente los dos nombres y ese único archivo. Cada test conserva90000ms.
  Proceso completo máximo240s, incluyendo colección y terminación de hijos propios.
  No tercer test, full suite, ownerTLS/native, build o VM.
- Trazas JSONL de padre/hijos a archivo propio, máximo1MiB en conjunto; stderr/TAP
  acotados. Registrar monotonic time, PID/parentage y fase; no secretos o contenido
  de archivos de usuario. Fotografiar únicamente selector/journal propios, máximo64KiB
  por archivo, sin ejecutar recuperación adicional para inspeccionarlos.
- Registrar el abort90s sin convertirlo en éxito. Tras resultado/timeout, el supervisor
  puede terminar solo los procesos que creó y sigue poseyendo para no dejarlos vivos,
  dentro del240s; la terminación no convierte el caso en PASS. Si no puede demostrar
  propiedad, conservar evidencia y detener, sin buscar/matar PIDs ajenos.
- Conservar raíces, trazas, errores y resultados originales. Nada de cleanup
  recursivo compartido o borrado de q218s/npm-identity-53PS3B.
- Verificar postimages y árbol original al terminar. Resultado DIAGNOSTIC_ONLY:
  fase observada, hechos, hipótesis, incertidumbre y una recomendación concreta.
  Incluso si ambos casos pasan, no satisface el gate de cualificación o borra D812.

Adición exacta solicitada:1variante de instrumentación de QA en copia y1invocación
diagnóstica, máximo420s entre preparación y ejecución. No reset de variantes
Electron2/2, owner/reviews consumidos, fullsuites2FAIL o targetedD8121/1FAIL.
No se pide otro reviewer bajo este protocolo; no hay diff de producto que certificar.
No se autoriza repetir el diagnóstico, cambiar caps, aplicar una corrección o saltar
a builds por el resultado. Una reparación real necesita propuesta concreta
posterior con su propio alcance/validación/revisión/deuda.

## Criterios de aceptación del diagnóstico y rollback

Obtener dos identidades reales de caso, trazas enlazadas a fuente/hash/hijos,
fase final conocida o explícitamente UNKNOWN, límites y aborts reales, inventario
de procesos/archivos propios conservados y código original byte-idéntico.
Una traza ausente o fallo instrumental se registra como tal, sin repetir.
El rollback es dejar de usar la copia propia; no toca proyectos, historial,
selección o instalación del mantenedor. No es rollback a runtime vulnerable.

Costo: hasta420s, una copia temporal y hasta1MiB de traza; sin dependencia/servicio
o cuenta nueva. El mantenedor decide ese costo acotado. Licencias e identidades
oficiales intactas. No assessment de cierre/archivo/merge/release, humanos simulados
o inicio de ola4 por preparar o aprobar esta propuesta.
