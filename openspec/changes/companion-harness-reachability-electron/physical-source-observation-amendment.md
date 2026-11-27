# Nueva decisión: corregir el transporte del origen en la copia diagnóstica

**Estado posterior:** revisión `4a8821642bd87e41c94da613e6f4adffb77611a3` aprobada
literalmente («apruebo, como vas con la ola 3 o el demas trabajo?»), DoR `13/13` y
presupuesto consumido (`1/1`): `1 PASS / 0 FAIL` en `64,865 ms` TAP (`64,999 ms` proceso,
`54` eventos), resultado estrictamente `DIAGNOSTIC_ONLY`. [Aprobación](evidence/physical-source-observation-approval-4a88216.md)
y [resultado completo](evidence/physical-source-observation-result-4a88216.md). El texto
siguiente conserva la propuesta presentada originalmente.

**Propuesta sin aprobar ni aplicar.** Issue #150;owner IgnacioBarEsp.
La aprobación0999922 está resuelta y su intento está consumido.
[Resultado original](evidence/remaining-repair-observation-result-0999922.md):
0PASS/1FAIL porLINK_REJECTED antes de la reparación. Error de preparación del
agente:el origen npm pasó por una junction. No causa del timeout demostrada.
No se pide de nuevo aquella aprobación ni se descuenta el intento fallido.

## Corrección exacta propuesta

Únicamente cambiar el transporte de dependencias del supervisor de diagnóstico:
crear una carpeta node_modules REAL en la nueva copia y copiar físicamente
solo npm oficial11.21.2 del mismo stage existente,con todos sus1944archivos,
12296462bytes. No instalar,descargar,actualizar,reparar o ejecutar npm.
No junction,symlink,hardlink,realpath como atajo del guard,origen configurable
en runtime o modificación de canonicalFolder/prepareNpmDevelopmentSource.
Los demás imports alcanzados por este target usan las fuentes/builtins existentes;
si aparece otra dependencia o archivo necesario,se detiene sin ampliar alcance.

El inventario readonly del origen está guardado en standaloneMCP,targetPath
actual,storagepersistent:
artifacts/wave3-current/remaining-repair-observation/physical-source-proposal-input.json,
SHA256473e9cdcc33f8f7401540650614e9436417af0a8f688411bf1c87e85b709b4c7.
Inventario de entradas ordenadas(path/bytes/SHA256):
6265d0c895db1a5185ab99bea58611055572066754901ade9639edea59953ead.
Ese digest es del inventario de preparación,no sustituye el fulltreeHash de catálogo.
Tras aprobar:revalidar ese inventario antes de copiar;rechazar drift,links,
hardlinks o ancestros vinculados. Copiar cada archivo a creación exclusiva
con bytes iguales y verificar el inventario completo de destino,regularidad,
nlink1 y ancestros reales antes de invocar. Conservar identidad/copyright/LICENSE.
Si cambia la identidad o precisa cualquier input adicional,STOP.

No otro cambio de instrumentación:usar el mismo QA observado congelado
ccaa13a46dc50bae657064e928f245b3563670fa33b334b0def69f59bcb9f546.
Los223archivos originales de app permanecen iguales a fuente QA2a4c824;
helper990166fc yunitc7942e9e exactos. Solo cambia la preparación del supervisor
managed ysu recipe/inventario de copia;registrar sus nuevos hashes,preimages,
postimages yfreeze antes de ejecutar. El checkout solo recibe expediente.
La copia anterior ytodo su fallo se conservan;usar un scratch nuevo.

## Ampliación de presupuesto explícita

Se solicita UNA preparación adicional de180s,UNA copia de observación adicional
yUNA invocación adicional del MISMO único target exacto:

> interrupted repair restores only the journal-owned unchanged quarantine, and retains project/history bytes

Mantener90000ms del caso,5000ms cleanup,120s proceso completo,concurrencia1,
256eventos/1MiB combinado ylos registros/cancelación/aserciones/SIGKILL originales.
Usar Node24.18.0 verificado yentorno aislado del protocolo0999922.
El costo agregado ahora sería hastaDOS preparaciones yDOS invocaciones entre
ambas decisiones;la primera sigue1/1consumida,esta solicita solo1 adicional.
Cualquier fallo de preparación/arranque consume el nuevo intento;STOP sin retry,
capraise,fullsuite,build,VM,reviewnuevo o reparación futura implícita.

## Gates y resultado

Presentar esta revisión inmutable yregistrar palabras reales antes de copiar.
La DoR conserva la intervención pendiente,que debe quedar aprobada realmente
yvolver a pasar sin excepciones antes de preparar el nuevo diagnóstico.
No quitar ese gate,relajar el guard o reclasificar el primerFAIL como éxito.

El resultado siempre seráDIAGNOSTIC_ONLY,incluso si pasa. Informar el TAP real,
qué fase se observó yqué causa sigueUNKNOWN,con todos los hashes ylímites.
El timeout histórico9/10 no queda resuelto por este diagnóstico. Una reparación
posterior requiere un hallazgo ypropuesta concreta distintos;esta aprobación
no la anticipa. Sin nuevos permisos sobre runtime,política,CI,locks o fuentes.

Conservar las reglas de propiedad/close/cancelación ycleanup del helper intacto;
ninguna limpieza del root histórico de fa15,temporales ajenos o proyectos.
Recuperación:conservar evidencia ydescartar solo esta instrumentación propia
cuando corresponda;no tocar el origen npm ni tomar locks porPID/edad.
Builds0/2,VM0/1,humanos146/147,deuda/archivos218y144→150,CIvigente ymergeprotegido
siguen separados ypendientes. Sin hostinstall,release u ola4.
Sin nuevas dependencias,servicios o licencias. IgnacioBarEsp decide este costo.
