# Enmienda propuesta: cerrar la ola 3 sobre una fuente final identificada

**Pendiente de aprobación de esta revisión.** Owner: #150; coordinación: #167.
No autoriza todavía el nuevo protocolo ni cambia los gates de las siete fases.

## Decisión solicitada

Validar y cerrar las fases #144 → #145 → #146 → #147 → #148 → #149 → #150 sobre
una única fuente final identificada, archivarlas en ese orden y presentar un PR
protegido conjunto. Cada fase conserva sus criterios, aprobación, revisión, deuda
e historia. Los PR #196–#202 se conservan.

Las aceptaciones recibidas corresponden a vistas integradas. El registro de
taxonomía distingue expresamente esa vista del layout histórico de #197; readiness
de #144 tampoco atribuye a su antiguo head una aceptación visual posterior.
Esta enmienda permite comprobar cada criterio en el producto final, sin aprobar
retroactivamente esos layouts ni pedir de nuevo las lecturas ya recibidas.
Las aprobaciones de npm, Zod y la copia Windows no aprueban esta decisión.

## Fuente y límites exactos

La candidata de validación es `332a2614f7b8b3d2c15b4c8e40a564dc1bb84dc1`:
composición normal de la cima de la pila `658e505` con main
`7073033724a20ee60bb76bc1791a7c3ae7cfca34`, que integra #204, #214, #152 y la
fase 1 de #206. No está integrada ni es un instalador apto.

- UI, context, engine, desktop y los módulos codegraph/inference/stack-catalog
  conservan los bytes de la pila. Las rutas npm/catalog/distribution-identity/
  manager, pack/verifier, locks y núcleo conservan los bytes de main.
- El único conflicto se resolvió manteniendo la eliminación de
  `.impeccable/design.json` aprobada en #152. Se retiraron dos líneas vacías finales
  de un documento archivado; no se alteró código de producto.
- La UI completa coincide byte por byte con `3eaf55e`, fuente de la aceptación de
  FAQ/Privacidad. Esto demuestra continuidad de esas vistas, no aprobación global.
  Cada otro recibo requiere su propia comparación de la superficie cubierta.
- Esta revisión añade solo propuesta, requisitos condicionales, tareas y evidencia
  en el change de #150. No cambia los otros seis readiness ni sus flags pendientes.

No se autoriza un nuevo patch de renderer, backend, npm, dependencias, pins,
OpenSpec 1.6.0, CI, timeouts, aislamiento, política o protecciones. Un defecto que
necesite una modificación de producto se presenta concretamente en su owner/spec.
No se inicia ola 4 ni se publica tag, release o descarga nueva; sigue publicada 0.3.6.

## Protocolo propuesto, aplicable solo tras aprobación

1. Congelar el head final y una matriz por fase que enlace criterio, fuente,
   ejecución, recibo humano y límite. Cualquier cambio posterior invalida la
   comparación afectada. Nunca certificar un head intermedio que no se evaluó.
2. Completar las comprobaciones originales de cada fase sobre esa fuente:
   suites y fixtures del workflow vigente; auditorías con sus resultados raw;
   matriz de tres sistemas y runtimes requeridos; seis perfiles × dos vías × dos
   movimientos × tres tamaños, rutas, denominadores y mutaciones; Electron real;
   artefacto/instalación/recuperación proporcionales. El resultado de otro SHA no
   satisface el head final. No omitir casos, elevar timeouts o reducir protecciones
   para obtener verde. No repetir suites idénticas sin un cambio o diagnóstico útil.
3. Conservar literalmente las aceptaciones humanas con su alcance. Inicio, paso 1,
   preparación/gestión, Archivos condicionado a la reorganización, lectura del
   control renombrado y FAQ/Privacidad no se convierten en aprobación universal.
   No añadir lectores, unanimidad o comprensión que no consten en los originales.
4. Mantener los recorridos reales del mantenedor de #146 y Software A/B de #147,
   con su propia IA y resultados, sobre una candidata identificada y apta.
   Un mismo recorrido real puede observar los pasos comunes, sin omitir criterios.
   Agentes, VM, capturas, stubs y aprobar esta enmienda no sustituyen esos humanos.
5. Ejecutar UN revisor independiente nuevo, acotado a la integración final y sus
   contratos; reconciliar sus hallazgos con la evidencia ejecutada. Las revisiones
   históricas 5706/429c y las de npm conservan su autoría, SHA y alcance. No se
   atribuye a ningún revisor una ejecución o aprobación posterior inexistente.
6. Evaluar deuda por owner. Conservar el registro y los 77 assessments de main;
   cualquier assessment nuevo de cierre es separado, append-only y trazable.
   No recapturar flows inmutables ni resolver los 36 abiertos de #206 por conteo.
7. Solo con TODOS los criterios y gates aplicables satisfechos: completar readiness
   de cada fase con evidencia del head final y archivar por OpenSpec local 1.6.0
   en orden #144 → #145 → #146 → #147 → #148 → #149 → #150, sin bypass.
   Preparar tareas de archivo no significa ejecutarlo. Un conflicto de specs o
   un criterio incumplido detiene la operación.
8. Presentar UN PR protegido conjunto contra el main real. Esperar
   `CI / required` verde en el head de cierre y comprobar protección estricta,
   sin bypass. Tras el merge, verificar el árbol integrado antes de cerrar issues.
   Leer los estados reales de los PR originales: registrar integración ancestral
   si GitHub la reconoce; cerrarlos como sustituidos solo si siguen abiertos y
   su fuente entró realmente. No inventar siete merges o CI verdes individuales.

## Recuperación y condiciones de parada

Antes de integrar, base y candidata permanecen separadas; se retienen datos,
recibos y fallos. No se instala en el host del mantenedor ni se sobrescriben sus
proyectos. Si falla la cualificación, no se promueve esa candidata.
Después de integrar, cualquier recuperación va por PR revisado y conserva
assessments e historia; no promete borrar evidencia ni reabrir deuda mediante un
comando inexistente. Nunca se usa npm oficial vulnerable como fallback.

Un cambio fuera del alcance, un gate humano sin evidencia, un hallazgo sin resolver,
una suite fallida o CI requerida ausente impide archivo/integración. Esta aprobación
sería del protocolo, no de resultados futuros ni de una candidata que siga fallando.

## Evidencia actual: todavía no apta

[Índice de resultados](evidence/coordinated-final-head-preflight.json).
DoR de esta propuesta: 13 PASS, 0 FAIL, 0 excepciones, sin mutación.
Package/neutrality y OpenSpec local 1.6.0 strict 28/28 pasaron sobre la composición.
La propuesta documental también pasa strict 28/28, docs, neutrality y deuda de
solo lectura. La inspección de readiness archive mantiene 13 PASS y 3 FAIL reales
(tareas y revisión), sin `--run-local`, sin mutación y sin ejecutar archive.

La copia independiente contiene 2089 archivos, fingerprint
`e5f2bc59d888c868c5a7d86794322b35adefdc274652f537ec8930c7467c2c9d`.
Se reutilizaron dependencias con versiones/resolved/integrity iguales; la única
diferencia de metadata es la anotación Apache-2.0 de qrcode-terminal ya aprobada
en #152. No hubo otra instalación o descarga.

La ejecución local simultánea NO pasó: el orquestador de núcleo agotó 360 s sin
resultado final; Companion dio 254 tests, 247 PASS, 2 FAIL, 4 cancelados y 1 SKIP
POSIX en Windows. Los seis casos afectados agotaron límites de copia/recuperación.

Un único ensayo posterior con archivos Companion en serie, mismos fuentes,
dependencias, carreras internas y timeouts por caso, también falló: límite global
600 s y crash/restart 91.432 s. Algunas copias pasaron (reparación interrumpida
79.738 s; copia canónica 60.266 s; copias concurrentes 25.040 s), pero no existe
denominador final de esa ejecución. No se ha demostrado que la causa sea solo
contención de recursos. Se conservan logs, errores y el origen congelado.

No hay CI actual de esta candidata, instalador de la nueva UI calificado, revisión
independiente final, archivo de estas fases o merge de UI. Los anteriores PASS de
main y el instalador npm con la UI antigua no satisfacen esos gates.
