# Nueva decisión — observar errores de arranque sin perder close o causa

**Propuesta concreta pendiente de aprobación de esta revisión. No aplicada.**
Issue[#150](https://github.com/IgnacioBarEsp/project-engineering-os/issues/150),
ownerIgnacioBarEsp.5013 ya está aprobada/aplicada y dio9/9PASS;no se pide de nuevo.
[Resultado y P2 confirmado estáticamente](evidence/recovery-qa-lifecycle-result-5013.md).
[Readiness fresca:13/13,sin excepciones;strict29/29/docs/neutralidad/deuda read-only PASS](evidence/recovery-qa-spawn-error-readiness.json).

## Problema y límite de lo observado

El único reviewer fresh de5013 envió un P2 parcial y luego quedó interrumpido
por un límite del servicio. Su revisión está incompleta. El padre confirmó en
fuente Node24.18.0 que EMFILE/ENFILE retorna antes de asignar stderr. El helper
congelado lo desreferencia antes de observar close:completion rechaza TypeError,
no la causa original;cleanup conserva el root por error. ENOENT real pasó,pero
no cubre esa rama. No se forzó agotamiento de recursos ni se demostró fallo de
producción,pérdida de datos o la causa de los timeouts históricos.

## Allowlist exacta y preimages

Solo dos fuentes pueden cambiar después de aprobar esta revisión real:

| Fuente | Preimage SHA256 |
| --- | --- |
| apps/companion/qa/helpers/owned-crash-fixture.mjs | ab6ca641b23c349e2a2b6824ba599416bf2c0711e7cc5ec8f85649ac5ef691a7 |
| apps/companion/qa/owned-crash-fixture.mjs | e3dc0e679add8ed442ff781df08de4213d333650a0ffe0a9615cd9a8b885976f |

qa/distribution-identity.mjs permanece exactamente
a97ac1e84cddda5fb4e9b05a0170a905ee8a126cc1cf8fd993decc1ecaa9565c.
Fuera de los dos archivos,solo expediente/evidencia/readiness/tasks y assessment
CLI elegible. Source drift,otra dependencia,fuente o costo exige nueva decisión.
No app/runtime/renderer/engine/IPC/NSIS/npm/Electron/Node/Git/CodeGraph,
pins/locks/notices/CI/auditoría/política/guardas/aislamiento/protecciones.

## Corrección propuesta y observación sin autoridad

Registrar listeners child.error y child.close antes de acceder al stream stderr.
Si stderr no existe,seguir esperando close y conservar la causa emitida por el
ChildProcess. Si falta stream sin una causa de spawn,fallar explícitamente;no
fabricar una ejecución válida. Registrar también stderr.error y conservar la
primera causa. No resolver espera o borrar root por recibir solo error;close y
propiedad siguen siendo obligatorios. Mantener64KiB,5s de cierre y retención
ante cierre/propiedad ambiguos. Overflow termina solo el hijo realmente poseído.

Para probar estas rutas sin agotar descriptores del host,extraer en el MISMO
helper una función de observación de eventos utilizada por el fixture real.
Esa función no crea procesos,adquiere ownership,borra roots o mata handles;
devuelve estado/completion y,si necesita señalar overflow,lo notifica al fixture
que ya posee el handle. No aceptar proveedor spawn arbitrario ni insertar hijos
sintéticos/externos en el Set de hijos propios. La autoridad de cleanup sigue
en ownedCrashFixture tras su spawn nativo fijo. Mantener writer/testigo/cancelación,
directorio propio y todas las aserciones de los nueve controles actuales.

## Un control nuevo, explícitamente sintético

Conservar los cuatro escenarios manager reales y las cinco regresiones actuales
sin rebajar expectativas. Añadir UN test superior al archivo unitario con DOS
controles internos sobre la misma función observadora:

1. EventEmitter sin stderr emite una causa EMFILE y después close:completion
   espera close,closed queda true y se conserva exactamente el objeto causa,
   sin TypeError o rejection no observada.
2. Stderr sintético emite error antes de close:la causa queda conservada y el
   cierre se observa sin error no manejado,éxito inventado o limpieza temprana.

Esto comprueba la lógica del observer,NO una reproducción nativa EMFILE/ENFILE,
test de filesystem hostil,integración instalada o seguridad universal. El caso
ENOENT real y propiedad/cancelación/testigos siguen en los nueve originales.
Denominador propuesto:10tests superiores,con2subcontroles internos del décimo.

## Nuevo presupuesto explícito, no reset

- Una variante QA adicional con preimages/postimages/recipe congelados antes
  de ejecutar. Preparación propia180s como máximo,sin installs/descargas.
- Una invocación enfocada adicional de diez targets,solo con esos inputs nuevos,
  máximo420s:cuatro90s y seis3s,cleanup5s dentro del presupuesto. Exigir10/10,
  ceroFAIL/cancel/SKIP y fuentes externas idénticas. Si falla,STOP;no variantes,
  capraise,fullsuite local o reintento por rutina. El margen87.4s previo no se
  transforma en garantía o permiso para elevar90s.
- Una continuación/reconciliación readonly acotada del MISMO reviewer
  /root/qa5013_candidate_review cuando el servicio vuelva a estar disponible:
  terminar su ciclo incompleto sobre los tres QA y revisar solo este delta.
  No segundo agente fresh,investigador o ciclo de218. Si no puede completarlo,
  conservar estado incompleto y esperar;no declarar aprobación independiente.
- TodaCI actual3SO y required del nuevo head debe pasar,sin cambiar workflows,
  expectativas,denominadores reales o SKIPs legítimos. No reejecución manual
  de inputs iguales. No TLS/native,builds/VM o auditorías repetidas por este plan.

5013 permanece1/1variante y1/1focused consumidos,9/9históricos inmutables;
d812/e978 y los presupuestos de218 tampoco se reinician. El mayor costo de
una variante,un focused10targets y una continuación del review se presenta aquí.
No se acepta defecto como deuda/excepción para poder cerrar. Assessment final,
archivo oficial e integración siguen gates separados.

## Gates y recuperación

Solo10/10+revisióncompleta/P2resuelto+fullCIvigente+producto/pins/locks intactos
permiten reconciliar este gate local. D812 mantiene2PASS/2CANCELLED;las fullsuite
FAIL anteriores no se convierten en PASS. Copia oficial/pack2PASS pueden
reutilizarse solo por inputs idénticos. Luego,solo con gates originales cumplidos,
se retoman builds0/2 y el mismo cicloVM corregido0/1 ya autorizados por218.
Humanos146/147,deuda,archivos218y144→150,PRprotegido y release siguen separados.
No hostinstall,nueva publicación pública u ola4.

Rollback:revertir únicamente estos dos QA en copia propia y comprobar que
restaura ab6ca641/e3dc0e67;conservar freeze/raws/fallos de ambas variantes. No
ejecutar baseline defectuosa para acreditar un verde. OwnerIgnacioBarEsp decide
mantenimiento de este helper sin dependencia,servicio o licencia nueva.
