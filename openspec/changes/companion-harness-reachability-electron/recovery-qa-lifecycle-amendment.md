# Propuesta — aislar escenarios y poseer hijos en las pruebas de recuperación

**Nueva decisión pendiente de aprobación de esta revisión real. No aplicada.**
Issue[#150](https://github.com/IgnacioBarEsp/project-engineering-os/issues/150).
Owner:IgnacioBarEsp. Es una corrección de QA; no de npm,Electron o la app.

## Evidencia y alcance necesario

El [diagnóstico e978 aprobado y consumido](evidence/recovery-diagnostic-result-e978.md)
dio1PASS/1CANCELLED. El caso con tres puntos agotó90s después de consumir64.535s
en los primeros dos; además el fixture borró su root con el último hijo activo.
La salida nozero no acredita por sí sola el punto de inyección. La primera
reparación pasó87.232s,con margen estrecho; no se promete que ahora siempre pase.

Se propone separar cada interrupción en un caso independiente con su mismo90s,
conservar todos los puntos/aserciones/controles reales y hacer dueño al fixture
de sus hijos hasta close antes de borrar su carpeta. No elevar timeouts para
forzar verde ni atribuir toda diferencia de rendimiento al host.

## Allowlist exacta de tres archivos

1. apps/companion/qa/distribution-identity.mjs:modificar solo los dos tests reales
   de interrupción y su uso del nuevo fixture. Conservar el fixture de los demás
   tests y todos los restantes cuerpos/aserciones.
2. apps/companion/qa/helpers/owned-crash-fixture.mjs:nuevo helper exclusivo de QA
   para root propio,ChildProcess handles,close/error,stderr acotado y testigo de fallo.
3. apps/companion/qa/owned-crash-fixture.mjs:nuevas cinco regresiones del helper.

La implementación parte del QA original SHA6382307b3a4acb0e57a931c0afe95ad35a0478ef1829c262c5a58039ba54d1cf,
NO de la copia instrumentada a6c84cac. No transportar observadores o monkeypatches
al producto. Fuera de esos tres archivos,solo expediente/evidencia/readiness/tasks
y assessment CLI elegible. Drift,otro archivo o costo requiere detenerse.

No tocar manager/distribution-identity/tree/files/catalog/process/archive de runtime,
renderer,engine,IPC,NSIS,npm/Electron/Node/Git/CodeGraph,pins/locks/avisos,CI,
política,auditorías/excepciones,aislamiento o protecciones. Ninguna dependencia nueva.

## Cuatro escenarios reales, sin perder cobertura

Conservar el primer caso:
- interrupted repair restores only the journal-owned unchanged quarantine, and retains project/history bytes

Sustituir el único bucle de tres puntos por estos tres tests independientes:
- real process interruption at npm-published rolls back journal-owned selection on restart
- real process interruption at npm-selection-written rolls back journal-owned selection on restart
- real process interruption at npm-confirmed preserves confirmed selection on restart

Cada uno conserva90000ms y usa manager/loopback filesystem reales. Mantener
las comprobaciones de journal,generación,selector exacto,árbol verificado,
restart/nueva instalación,history y los archivos del proyecto. Mantener los tres
puntos SIGKILL originales y el de npm-quarantined. No reemplazar por stubs,
salida simulada,recuperación inventada o ignorar excepciones.

El costo agregado sí cambia: cuatro casos reales de90s en lugar de dos casos
de90s que agrupaban escenarios. Esta ampliación explícita no aumenta el límite
por escenario ni oculta el presupuesto mayor. Los timeouts90s anteriores se conservan.

## Ciclo de vida y testigo, solo en QA

El fixture posee cada ChildProcess que creó mediante su handle;no descubre ni
toma procesos porPID/edad. Registra error/close antes de esperar y acota stderr
a64KiB. Un error de spawn/overflow debe fallar con causa,no quedar en espera.

Antes del SIGKILL solicitado,el hijo escribe con creación exclusiva un testigo
de como máximo4KiB en el scratch propio,fuera del payload,que incluye el nonce
de ese fixture,PID y punto. El padre exige el testigo exacto regular/no-link;
un exitnozero sin testigo válido falla. No usar IPC asíncrono sin confirmación
para inventar que se alcanzó el punto.

El único cleanup del fixture termina solo sus hijos todavía activos,espera close
con máximo5s y después borra exclusivamente su root demostrado. Si no demuestra
propiedad/cierre,retiene root y falla;no borra ni toma locks de otro owner.
No omitir cleanup por TestContext.signal:ese signal también aparece al completar
un caso PASS. Tras esperar al hijo,y antes de recuperación adicional,el cuerpo
comprueba cancelación para no continuar el restart después de un timeout.

No borrar roots históricos q218s u otros temp compartidos. Proyectos e historia
del test se comprueban antes de su cleanup legítimo;no se tocan proyectos del host.

## Cinco regresiones del helper

Cada una máximo3000ms,con hijos reales pequeños y paths propios:
1. Un hijo activo se termina/cierra antes de retirar su root.
2. Un hijo ya cerrado no vuelve a recibir kill;la limpieza válida termina.
3. Spawnerror rechaza con causa sin colgar o borrar fuera de su raíz.
4. Testigo ausente o de otro punto/nonce se rechaza aunque el hijo termine nozero.
5. Testigo válido acredita el punto y conserva el marcador de proyecto/historia
   hasta el cleanup explícito;cancelación impide continuar recuperación.

Son controles legítimos y negativos del helper,nunca prueba instalada del producto.
No añadir casos,fixtures,formatos de producto o mutaciones fuera de este contrato.

## Freeze,validación y presupuesto nuevo

- DoR fresca13/13 y aprobación literal de la revisión real antes de Apply.
- Una sola variante de QA congelada:preimages/postimages,recipe,lista de fuentes,
  cuatro casos reales/cinco unitarios y restauración/rollback documentados.
  Preparación/copia como máximo180s,sin installs o descargas.
- Una invocación enfocada secuencial de los cuatro escenarios y cinco regresiones,
  máximo420s incluyendo cleanup,con90s por caso real y3s por regresión.
  Exigir9/9PASS reales en Windowsx64,0SKIP/cancel/fail y hashes de entrada intactos.
  Si falla:STOP,no otra variante,focused/fullsuite,capraise o réplica por rutina.
- Una revisión adversarial independiente nueva,fresh readonly y acotada a los
  tres archivos/callers de QA y contrato de cancelación/propiedad/testigo.
  No otro investigador o reviewcycle de #218;los presupuestos anteriores no cambian.
  Confirmar hipótesis contra fuente/evidencia,sin atribuir revisión humana o
  aprobación de producto/instalador.
- Requerir también toda la CI vigente de tresSO y required del nuevo head,sin
  modificar workflows,expectativas,denominadores o SKIPs legítimos de plataforma.
  Los nuevos tests cambian el denominador;reportarlo real,nunca copiar261.
  No nueva fullsuite local autorizada;la suite completa corresponde a esa CI.

Se solicita explícitamente1variante QA,1invocación enfocada,1reviewfresh
acotado y el mayor presupuesto agregado anterior. No reset de150/218/d812/e978.
Sin nuevo ownerTLS/native,auditoría repetida de inputs idénticos,servicio o licencia.

## Reconciliación de cualificación y gates posteriores

Solo9/9enfocados + fullCI3SO/requiredverde + revisión sin hallazgos pendientes
y fuentes de producto/pins/locks intactas permiten reconciliar el gate local de
estos tests corregidos. Los dos PASS retenidos de copia oficial y packcleanup
de d812 se reutilizan por hashes idénticos de sus fuentes/inputs,no se reejecutan.
No reclasificar d812 o diagnósticos anteriores como PASS.

Esta es una modificación explícita del protocolo de cualificación,que requiere
aprobación nueva;no una excepción de auditoría o descarte de tests.
No habilita builds por aprobar el plan o ejecutar un subset. Solo tras cumplir
los gates se pueden retomar los dos builds y mismo cicloVM ya autorizados por
#218,con sus propias comprobaciones y límites. Humanos146/147,deuda/archivos en
orden,integración protegida y release siguen separados. No ola4 o hostinstall.

Rollback:gitrevert en copia propia de los tres archivos,conservar los anteriores
fuentes/fallos y no ejecutar el QA defectuoso como prueba verde. Si aparecen
exigencias de producto fuera del alcance,detener y presentar desacuerdo concreto.
Costo:máximo180s preparación+420s QA y una revisión readonly acotada;sin dependencia,
cuenta,servicio o fork. OwnerIgnacioBarEsp decide este costo y mantenimiento.
