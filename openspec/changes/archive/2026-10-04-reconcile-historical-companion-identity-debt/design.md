## Context

Base exacta: `9751c301976fe27e9bbad33e69f39372b69f901e` de main. El registro contiene 50 items, 37 abiertos; upstream-core conserva 4/5 unidades y tres flujos con deuda abierta. El checkout de trabajo está aislado en una rama de fase, sin modificar el checkout del mantenedor ni la pila de ola 3.

`findMatchingItem` calcula fingerprints de categoría, artifact y título. El assessment `restructure-companion-navigation-remediation-2` es inmutable y está reflejado: su título encuentra `debt-53f4fcdb6a67`, no el título original de `debt-bee2fa0c0549`. Esa diferencia explica el registro abierto; no demuestra que falte implementar la corrección.

La evidencia de 2026-09-12 nombra un árbol limpio en `cb257fac27421506b5a0336e6de0845f080b3e11`, 68 archivos de runtime comparados y cinco paquetes/137 archivos cargables. El documento archivado informa 12 intentos de bypass rechazados y un control positivo. La inspección estática actual confirma que el código conserva las comparaciones y las aserciones. **No se ha ejecutado un instalador nuevo ni demostrado identidad binaria entre ese árbol antiguo y main actual.**

## Goals / Non-Goals

**Goals:** cerrar mediante evidencia el ID histórico correcto; conservar todas las otras entradas e historia; dejar el inventario y las siguientes decisiones encontrables; probar el resultado parcial sin un falso verde.

**Non-Goals:** ampliar la guarda, cambiar fingerprints o schemas, reescribir evidencia de 2026-09-12, resolver el resto, instalar npm o simular las intervenciones pendientes de ola 3. Tampoco se convierte #206 en una condición nueva para iniciar ola 4.

## Decisions

### 1. Remediación por ID explícito, no por un tercer título

Se usará `debt capture` existente, con flow `reconcile-historical-companion-identity-debt`, `kind: remediation`, `result: clean`, `candidates: []` y una sola entrada en `resolves`. El input se preparará después de aprobación y se revisará antes de cualquier captura. No se editará el registro a mano.

Alternativas descartadas: modificar el assessment viejo (inmutabilidad); repetir el candidato bajo otro título (nuevo fingerprint); matching difuso (cambio público no necesario); volver a implementar la guarda (duplicación). `clean` describe la nueva evaluación de esta fase, no significa registro completo sin deuda.

El preflight de la fase rechazará `resolves` distinto del ID objetivo, incluso si refiere otro ID existente. **El CLI genérico no conoce el alcance de #206**: esa comprobación pertenece a la verificación de esta fase, no se afirmará que el CLI rechaza todo ID semánticamente equivocado. Un ID inexistente sí debe fallar en el CLI sin escritura.

### 2. Evidencia actual acotada y fuentes históricas conservadas

Versionar un inventario de los 37 IDs con hashes y rutas originales/archivadas, reutilizando el diagnóstico publicado sin volver a cobrarlo como auditoría nueva. Cada fila conservará si es inspección estática, límite, pendiente humano, corrección posterior parcial o evidencia insuficiente. La prioridad estimada separará impacto/riesgo/esfuerzo de categoría, severidad y presupuesto del motor.

Para el objetivo, registrar: ID original abierto; ID equivalente resuelto; resultado real de matching; evaluación pura `assessmentReflected`; hashes de código y archivos fuente; inspección actual de las ramas de comparación/rechazo. El relato instalado conservará fecha, commit, límites y denominadores originales.

La guarda compara el payload de Electron salvo archivos reescritos por empaquetado; los archivos cargables de la closure propia; campos ejecutables del manifest; entradas raíz y presencia de paquetes restantes; digest del archivo sellado de npm. Los paquetes fuera de la closure se comparan por presencia, no por todos sus archivos; la extracción verifica el árbol sellado en otro camino. No prometer integridad de los bytes expresamente excluidos ni integridad absoluta de cualquier instalación.

### 3. Invariantes y prueba negativa del resultado

Antes de capturar, guardar manifiesto SHA-256 de registro/configuración/assessments y snapshot de los 50 objetos. Probar primero en una copia desechable. El verificador posterior deberá aceptar únicamente:

- los mismos 50 IDs y metadatos superiores;
- target `open` → `resolved`, con `resolution.flow` de esta fase, evidencia verificable y `updatedAt` de captura;
- todos los otros campos del objetivo intactos, incluidos título, categoría, severidad, excepción, issue y ocurrencias;
- los otros 49 objetos idénticos, assessments previos byte-idénticos y exactamente un assessment nuevo;
- otros 36 abiertos; configuración, presupuesto 4/5 y tres flujos sin variación;
- segunda captura del mismo input no-op byte por byte.

Las mutaciones negativas se harán solo sobre copias: ID inexistente; otro ID válido; resolución adicional; item eliminado/reclasificado; ocurrencia alterada; cambio de assessment histórico; input distinto para flow ya capturado. Se exigirá detección por la propiedad nombrada, no por excepción ajena o timeout. Una operación interrumpida con assessment presente y registro aún anterior se debe reanudar con el mismo input; no borrar evidencia.

### 4. Ownership, compatibilidad y perfiles

Los datos de deuda son project-owned; upstream es dueño del CLI y la spec, y OpenSpec local fijado 1.6.0 es el único escritor de specs activas durante archive. Esta fase no expone API, cambia seguridad ni toca UI, runtime o distribución. Se aplican documentación y harness-tooling; no se activa implícitamente data-migration-sync ni otro perfil condicional. No se debilitan las validaciones ya vigentes en CI.

Sin dependencia nueva, licencia/coste nuevos, secreto, proveedor, servicio pagado o instalación de paquetes. La fase no depende de un runtime Companion apto para revisar metadata histórica; #204 continúa siendo un bloqueo externo de integración y del cierre real de ola 3.

## Risks / Trade-offs

- [ID válido pero incorrecto] → allowlist de un ID antes de captura, prueba negativa y diff de los 50 objetos después.
- [Evidencia antigua tratada como ensayo actual] → provenance separada y prohibición explícita de la afirmación binaria/instalada actual.
- [Un único cierre oculta el resto] → inventario antes/después, 36 abiertos y #206 abierto; PR con referencia sin autocierre.
- [Drift mientras se prepara] → comprobar base, hashes y estado remoto antes de Apply; detenerse y revalidar si cambian.
- [Recuperación contradictoria] → preservar baseline/candidato separados; no revert aislado del registro con un assessment de resolución todavía aplicable.
- [CI rojo por npm] → continuar trabajo local autorizado, pero no integrar hasta CI requerido verde sin excepción.

## Migration Plan and Recovery

1. Registrar aprobación humana de esta spec y comprobar de nuevo identidad/base/ausencia de duplicados.
2. Preparar input, manifiestos, prueba positiva/negativa y ensayo en directorio desechable, sin modificar main.
3. Ejecutar los perfiles aplicables, revisión adversarial independiente o de contexto limpio de la candidata y evaluación residual; resolver Blockers/Majors y finalizar el input antes de su captura inmutable.
4. Ejecutar captura oficial en la rama solo si todos los checks previos pasan; recapturar, comparar hashes y revisar el diff final, preservando la misma evaluación y publicando evidencia honesta.
5. Pasar DoD/archive con OpenSpec oficial, abrir PR protegido `Refs #206`, mantener el orden de la pila y esperar CI real verde. Actualizar #167/#206 sin presentar trabajo no integrado como terminado.

**Recuperación anterior a integración:** conservar una copia verificada del baseline y otra de la captura candidata con todos sus assessments. Si falla un invariante, detener Apply/publicación y trabajar desde una copia nueva del baseline confirmado; preservar el candidato rechazado y sus hashes como evidencia externa, no borrarlo ni pretender que su resolución quedó integrada. Ensayar la selección del baseline como estado de trabajo recuperado y comprobar su hash y `debt check`; después reanudar la candidata válida con el input aprobado. No sobrescribir archivos ajenos ni reset destructivo.

**Captura interrumpida:** reintentar el mismo input/flow para converger, comprobando assessments y registro. Esto no es un rollback.

**Después de merge:** no hay comando oficial de reapertura. Si se demuestra una resolución errónea, detener esa afirmación, documentar el incidente y proponer una corrección con issue/spec/PR propios. No prometer un `git revert` solo del registro, borrar el assessment ni inventar una reapertura soportada. Esta fase ensaya recuperación preintegración, no una operación posmerge inexistente.

## Open Questions

La aprobación humana de esta spec se recibió («apruebo») y se conserva en evidence/spec-approval.md. La resolución de npm y las pruebas humanas pendientes de la pila de ola 3 se mantienen en sus propios issues; no se sustituyen aquí. No hay decisión de scope nueva pendiente para esta fase.
