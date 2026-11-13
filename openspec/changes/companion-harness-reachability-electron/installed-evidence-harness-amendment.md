# Enmienda propuesta: verificadores del contrato final instalado

**Aprobación recibida para la revisión inmutable2667452.**
[Palabras y alcance](evidence/installed-harness-approval.md). Owner #150, integración de
contratos #145/#147. La aprobación f9ed23c ya está resuelta y el protocolo conjunto
ya empezó: PR #217 está abierto/draft. No se vuelve a pedir esa decisión.

## Por qué hace falta esta ampliación

La fuente de producto e713e9a conserva los bytes revisados, y CI43364174800 pasó
12 jobs. La revisión independiente encontró dos fallos P2 en verificadores que
conservaron supuestos anteriores a la nueva taxonomía/servicio:

1. `verify-native-journeys.mjs:65/70/76` precarga proyectos NUEVOS con unity,
   media y general. La guarda canónica los rechaza legítimamente en previewBase.
   El ciclo canónico del instalador falló realmente en la VM, exit1/no timeout,
   PROFILE_INVALID en :448; no llegó a observar la ventana ni a su desinstalación
   posterior. Los pasos previos de instalación/runtime no hacen verde ese ciclo.
2. `verify-service-mutations.mjs:60/170` busca dos textos que ya no existen:
   el caso route-only y el caso vision-missing cambiaron el servicio. El runner
   abortaría al exigir su ancla antes de emitir el informe. Esto se confirmó
   por lectura, sin ejecutar el runner mutante; no es una mutación detectada.

[Informe independiente completo](evidence/independent-final-integration-review-e713e9a.md).
[Índice de cualificación y hashes](evidence/qualification-e713e9a.json).
Autor: agente independiente, no servicio Bugbot ni humano. Fuente e713e9a;
dictamen cambios requeridos. No se le atribuyen pruebas posteriores.

f9ed23c acordó cualificar el código existente, con gates y fuente identificados.
Esta ampliación propone tocar los verificadores para cumplir esos contratos, con
una allowlist nueva explícita. No autoriza corregir el producto por inferencia.
AGENTS.md exige implementar desde una spec aprobada; antes de Apply se necesita
la decisión sobre ESTA revisión y no una aprobación general de continuar.

## Allowlist de fuentes propuesta

Solo estos cinco archivos, más specs/tareas/evidencia de #150:

- `apps/companion/scripts/verify-native-journeys.mjs` (modificar): usar los seis
  perfiles canónicos del producto y sus enfoques, conservar formatos/testigos,
  recuperación, controles y atribución real; alinear únicamente los selectores
  del recorrido al contrato vigente, sin atajos que acepten cualquier pantalla.
- `apps/companion/scripts/native-project-fixtures.mjs` (nuevo): datos puros de
  fixtures nativos para software/research/studies/content/business/personal.
  Conservar el caso videojuego como Software/game y lectura legacy separada;
  no escribir proyectos nuevos con alias ni habilitarlos en el servicio.
- `apps/companion/scripts/verify-service-mutations.mjs` (modificar): aplicar las
  mutaciones al servicio final, conservando comportamiento que deben romper,
  baselines válidos, atribución a tests, límite/restauración y errores visibles.
- `apps/companion/scripts/service-mutation-cases.mjs` (nuevo): separar datos de
  casos y comprobación pura de puntos de inserción para poder verificarlos sin
  ejecutar mutaciones al importar. No nuevo motor de parsing o dependencia.
- `apps/companion/qa/verification-harness-contract.mjs` (nuevo): regresiones del
  contrato real de selección/fixtures y anclas contra fuentes actuales, con
  controles negativos de perfil omitido/retirado y ancla ausente/duplicada.

No renderer, servicio, engine, contratos IPC, runtime, npm, package/locks,
catálogo, avisos de producto, NSIS, Node/Git/CodeGraph/OpenSpec1.6.0, CI, política,
excepciones, timeouts, límites o protecciones. No nuevos servicios o costo de
terceros. Si la corrección exige otro archivo o cambiar comportamiento del
producto, detener y presentar el desacuerdo con evidencia.

## Criterios observables y presupuesto de comprobación

1. Los fixtures representan exactamente los seis perfiles canónicos, sin fallback
   por omisión; sus selecciones normalizan con el código actual. Cada perfil
   conserva documentos/formatos y evidencia útil. Los alias antiguos se prueban
   como lectura legacy y siguen rechazados para nuevas escrituras.
2. Cada mutación declarada encuentra exactamente un punto de inserción. Ausencia
   o duplicado falla antes de cambiar fuente. Se mantienen todos los casos y sus
   controles legítimos; no se reduce el conjunto para lograr verde.
3. El runner de servicio termina y atribuye cada detección a tests de comportamiento;
   parse error, timeout, suite que no arranca o salida1 de setup no cuentan como
   detección. Originales y hash final se restauran incluso ante fallo.
4. Ejecutar una vez las regresiones nuevas y el runner completo sobre copia propia
   congelada después del Apply aprobado. Guardar baselines, cada resultado,
   denominadores y todos los fallos. Sin repetir suites iguales por rutina.
5. Una nueva comprobación canónica instalada con el harness corregido en VM propia,
   mismos límites/red desactivada/aislamiento: actualización0.1.0, recorridos y
   desinstalación reales. El resultado debe completar su denominador; el primer
   error no acredita los pasos siguientes. No instalación en host del mantenedor.
6. Reutilizar el instalador e713e9a si los cinco directorios de código empaquetados
   permanecen byte-idénticos y el flujo lo permite. Registrar por separado SHA del
   instalador/commit de producto y SHA de harness/prueba; no editar su manifiesto
   para atribuirlo a otro commit. Si el flujo requiere otro build, construirlo
   una vez identificado y verificarlo, conservando el anterior.
7. Reconciliación incremental acotada de este diff y sus regresiones por el MISMO
   revisor independiente de e713, sin otro barrido completo o nuevo auditor.
   Conservar el informe y hallazgos originales. No atribuir aprobación post-fix
   hasta recibir realmente su respuesta. Si no está disponible, gate pendiente.
8. Conservar deuda (main77 assessments, rama94 históricos; registro50/36 sin
   cambio). Evaluación oficial de cierre solo cuando proceda, append-only.
   Gates de archivo, PR protegido y CI requerida del head final siguen intactos.

Presupuesto: una variante de corrección de estos verificadores, una ejecución
del runner completo y un ciclo canónico instalado tras congelar la corrección;
una reconciliación incremental. Un fallo requiere diagnóstico concreto y una
decisión de alcance si cambia la propuesta, no una cadena de variantes.

## Evidencia retenida y recuperación

Installer e713e9a:133307422bytes,
SHA256 `63754b6a9311ef45ecabe2968265cbb7bbb4a6ca58a3beb8a599934b89bec499`.
Contenido/identidad/firma real verificados: PASS2590 empaquetados/2662 instalados,
151 dependencias, firma NotSigned. No aceptación humana ni release pública.

VM `fa81091a-6302-45bb-b0b1-228af81951c5` final FAIL; evidencia íntegra
`artifacts/wave3-current/vm-e713-evidence.zip`,
SHA256 `f685a2176f3e31dd1f14a07a7bf6867b9c09ca3de460750eea4a29fb58935eb7`.
Se detuvo solo esa VM y la lista quedó vacía. El PASS parcial de runtime conserva
su alcance, no sustituye el FAIL canónico. No repetir ese input sin cambio.

Antes del Apply conservar preimages y diff de los cinco archivos. Recuperación
de código por revert revisado, sin borrar assessments, reportes o fallos; los
mutantes siempre se prueban en copia propia. No rollback a npm vulnerable.

Los recorridos humanos #146 y Software A/B#147 siguen pendientes sobre candidata
apta. No pedirlos mientras el ciclo instalado no esté cualificado, ni reemplazarlos
por la VM o esta aprobación. Ola3 permanece abierta y ola4 no se inicia.
