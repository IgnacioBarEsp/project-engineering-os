# Nueva decisión de #150: observar únicamente la reparación que sigue fallando

**Estado posterior:**revisión0999922 aprobada literalmente ypresupuesto consumido.
[Recibo](evidence/remaining-repair-observation-approval-0999922.md) y
[resultado0PASS/1FAIL de preparación](evidence/remaining-repair-observation-result-0999922.md).
El texto siguiente conserva la propuesta presentada,no una aprobación pendiente.
La [corrección de transporte físico](physical-source-observation-amendment.md)
es una decisión adicional distinta,todavía sin aprobar ni aplicar.

**Propuesta, todavía sin aprobar ni ejecutar.** Owner: IgnacioBarEsp.
La petición de continuar permite preparar esta revisión; no se interpreta como
aprobación de un presupuesto nuevo que aún no se había presentado.

## Punto de partida y decisión

El [resultado fa15](evidence/recovery-qa-spawn-result-fa15.md) conserva
9 PASS/1 CANCELLED: la reparación interrumpida agotó 90000 ms, con
95016 ms de TAP incluyendo finalización. Las otras nueve pruebas pasaron.
La revisión independiente original terminó y resolvió el P2 de spawn/stdio;
ese P2 no demuestra la causa de este timeout. No falta aquella aprobación.

La CI [43616684145](https://github.com/IgnacioBarEsp/project-engineering-os/actions/runs/43616684145)
está SUCCESS, 12/12 jobs, en 077a5f832c75ebe0a263807f5365288873b29f28.
El protocolo local mantiene su FAIL. La causa interna pendiente no está
demostrada: no se declara latencia del host, deadlock o defecto del producto.

Se propone **un solo diagnóstico observado del único caso fallido**. Su fin
es identificar qué llamadas terminaron, cuánto consumieron y cuál quedó sin
respuesta al vencer el mismo plazo. No propone todavía una reparación, una
relajación del criterio ni una nueva ejecución de cualificación.

## Fuentes e inventario que deben permanecer exactos

Fuente QA: 2a4c824dcec0eae4f6afef3e059c2fa0acc32570;
head documental inicial: 077a5f832c75ebe0a263807f5365288873b29f28;
main: 7073033724a20ee60bb76bc1791a7c3ae7cfca34.

| Archivo | SHA256 obligatorio antes de preparar |
| --- | --- |
| apps/companion/qa/distribution-identity.mjs | a97ac1e84cddda5fb4e9b05a0170a905ee8a126cc1cf8fd993decc1ecaa9565c |
| apps/companion/qa/helpers/owned-crash-fixture.mjs | 990166fcc3ad1b6237edc8a2710007be8125f0ac9aaa5a06074317318afb2306 |
| apps/companion/qa/owned-crash-fixture.mjs | c7942e9e8efbaa03ef28a1296e880abec818b9b4b3319182fd3f5266de38f125 |

Después de aprobación, solo la COPIA de qa/distribution-identity.mjs puede
recibir observaciones dentro del caso nombrado abajo. El helper y su unit
permanecen exactos. Se permite un observador y supervisor de diagnóstico
en artifacts/wave3-current/remaining-repair-observation/ de la colección
MCP propia, nunca dentro del runtime o del paquete publicado.
Antes de invocar: congelar preimage, postimage, patch, recipe, ejecutable,
argumentos, entorno y el inventario completo de los 223 archivos de app.
Solo ese QA copiado puede diferir; el checkout no recibe instrumentación.
Source drift, otra fuente o una dependencia nueva obligan a detenerse.

## Un caso y observaciones delimitadas

Nombre exacto:

> interrupted repair restores only the journal-owned unchanged quarantine, and retains project/history bytes

Ejecutar únicamente ese nombre con selección exacta y concurrencia 1.
Los casos no seleccionados no reciben crédito: informar por separado las
omisiones debidas al filtro, el único target observado y su TAP real.
No repetir los otros nueve controles ni los PASS de copia/pack de d812.

Conservar cada operación, aserción, corrupción deliberada y SIGKILL en
npm-quarantined en su orden actual. Registrar entrada, salida y excepción
en los límites existentes del cuerpo, sin sustituir resultados:

1. Crear fixture y manager; instalación inicial y progreso ya ofrecido.
2. Escribir proyecto/corrupción, leer selector y arrancar el hijo poseído.
3. En el script del hijo: crear manager, planRepair, repair y eventos de
   progreso existentes; conservar el testigo exclusivo y su SIGKILL exacto.
4. Esperar close/testigo; comprobar cancelación antes del restart.
5. Crear manager de restart, inspect, lecturas/aserciones de journal,
   selector, payload corrupto y proyecto; planRepair final, repair final
   y último inspect.
6. Observar el resultado TAP y la finalización existente del fixture.
   TestContext.signal también aparece tras PASS; por sí solo no es timeout.

Cada registro incluye proceso, secuencia, fase, reloj monotónico propio,
UTC y, si existe, código de error acotado. No comparar relojes monotónicos
entre procesos como si fueran una sola escala. Los callbacks solo observan
los eventos existentes; no cambian métodos del manager, invocan APIs nuevas,
reintentan operaciones ni inyectan señal en una llamada que antes no la recibía.
No instrumentar manager/tree/files/locks o internals de Node.

## Cancelación, registros y conservación

El helper aprobado conserva toda autoridad sobre hijos y root: handle
realmente creado, nonce/testigo exacto, stderr 64 KiB, close y cleanup de 5 s.
El observador no adquiere ownership ni mata hijos, toma locks o borra paths.
El supervisor posee solo su árbol de ejecución nuevo y puede detenerlo al
agotar el límite; tal intervención siempre registra FAIL, nunca PASS.
No identificar o tomar procesos por antigüedad ni limpiar temporales ajenos.

Traza de máximo 256 eventos y 1 MiB combinado con stdout/stderr del
diagnóstico. Alcanzar el límite detiene la observación y marca el resultado
incompleto; no truncar silenciosamente y declarar evidencia completa.
No copiar contenido arbitrario del host: solo códigos, fases y registros
JSON/proyecto del fixture propio, cada uno hasta 64 KiB, usando lectura
regular/no-link y acotada. No ejecutar recuperación extra para inspeccionar.
Las excepciones del observador se registran como fallo de instrumentación;
no se absorben para fabricar PASS del target ni se atribuyen al producto.

Mantener el cleanup legítimo del helper. Si no puede demostrar cierre o
propiedad, conserva el root y falla. Si un caso termina y limpia su root,
conservar antes únicamente los snapshots permitidos y declarar ese límite;
no afirmar retención física completa de payloads no inventariados.
Los roots y evidencias históricos de fa15, e978, q218s y demás permanecen
intactos. No reparar ni reutilizar el root fallido de fa15.

## Presupuesto nuevo solicitado, sin reset

| Acción | Máximo adicional |
| --- | --- |
| Preparación/copia propia y freeze | Una preparación, 180 s |
| Variante de observación | Una copia instrumentada, cero cambios de producto |
| Invocación | Una, un único target, 90000 ms del caso sin cambios |
| Proceso supervisor completo | 120 s, incluye cierre/colección; no amplía el caso |
| Revisión, builds, VM, instalaciones o descargas | Cero |

Usar Node 24.18.0 ya verificado, Windows x64, stage/dependencias existentes
comprobados contra la fuente; HOME/PATH/configs aislados como en fa15.
No instalar npm nuevo ni ejecutar la copia de trabajo del mantenedor.
Una preparación o arranque fallido consume su intento y se conserva;
no otra variante, retry, full suite, capraise o diagnóstico encadenado.
La aprobación debe registrar revisión inmutable y palabras reales antes
de preparar instrumentación o ejecutar. Después de registrar esa decisión,
la DoR fresca debe pasar sin excepciones antes de preparar el diagnóstico.
La preparación documental actual conserva DoR12PASS/1FAIL por esta intervención
humana pendiente;no es una propuesta aprobada o lista para Apply.
Las aprobaciones antiguas quedan
resueltas con sus presupuestos consumidos: no se vuelven a solicitar.

## Resultado y siguiente decisión

El informe será siempre DIAGNOSTIC_ONLY, incluso si el target pasa.
Debe distinguir duración observada, última llamada sin salida, cancelación,
intervención del supervisor y causa todavía desconocida. Una llamada lenta
no demuestra por sí sola la causa interna ni un defecto explotable.
Conservar patch/freeze/raws, hashes antes/después e inventario sin drift.

Después se presenta el hallazgo con una solución concreta y su costo, o
se declara que el diagnóstico no resolvió la incertidumbre. Esta decisión
no aprueba de antemano una reparación futura, otro protocolo o más intentos.
Los anteriores 9/10 siguen fallidos; una observación no habilita builds.
Los 2 builds, ciclo VM corregido, humanos #146/#147, deuda, archivos
#218 y #144–#150 en orden y merge protegido siguen gates separados.
No archivo de fase incompleta, cierre de ola 3, release u ola 4.

Recuperación: descartar solo la instrumentación nueva en su copia propia
tras guardar evidencia; no revertir runtime ni tocar roots históricos.
Sin servicios, dependencias o licencias nuevas. El costo aceptable y la
continuación los decide IgnacioBarEsp sobre esta revisión presentada.
