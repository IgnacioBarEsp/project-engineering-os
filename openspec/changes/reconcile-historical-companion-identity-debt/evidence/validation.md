# Evidencia de implementación — #206 fase 1

## Estado en la candidata previa a captura

Spec aprobada por respuesta humana real, vinculada al commit de propuesta en spec-approval.md. Inventario 37/37 versionado, con hashes y prioridades del diagnóstico anterior, no reproducciones nuevas: inventory-37.json y docs/debt/HISTORICAL_DEBT_206.md.

Inspección estática actual: diez observaciones de comparaciones/aserciones de la guarda, source hash y referencia del run antiguo en static-identity-review.json. No prueba instalada nueva. Baseline del registro en baseline-registry.json; manifest de los 73 assessments anteriores en proposal-baseline.json y exercise.json.

## Pruebas ejecutadas

- `node scripts/verify-historical-debt-reconciliation.mjs --exercise <evidence>`: CLI real sobre copias desechables. 50 IDs, abiertos 37 → 36, otros 49 objetos idénticos, campos inmutables del objetivo conservados, un assessment nuevo, bytes históricos/configuración idénticos. Segunda captura no-op; una captura con solo assessment presente converge al mismo resultado.
- **12 pruebas negativas detectadas por su propiedad**, incluyendo ID válido fuera de scope, ID ausente sin escrituras, resolución adicional, item eliminado, categoría/ocurrencia/resolución alterada, configuración/assessment histórico alterados e input distinto del flow ya capturado. Recovery usa baseline/candidato real rechazado separados y conservados, con hash y debt check; no una reapertura posmerge. Resultados y comandos: exercise.json.
- `npm run check`: **393 tests, 393 PASS, 0 FAIL**, package/neutrality/docs/workflows/debt y baseline doctor pasan. La log retenida core-check.log contiene el resultado real, no suma de pruebas anteriores.
- Fixture del tarball `--skip-install --keep`: PASS, cinco harnesses/capability matrix, checks de idempotencia/sync/findability/neutralidad y acciones negativas del fixture. Se reutilizaron dependencias locales fijadas para OpenSpec init/OPSX adapt/check y doctor consumer; no npm install ni nueva candidata. Logs fixture-*.log y qa.json.
- Doctor consumidor: 12 PASS/0 FAIL/4 WARN/13 SKIP; WARN declarados en qualitative-review.md. Doctor upstream: conserva los tres FAIL exactos de la baseline de #115, no se convierten en PASS. `npm run check` comprueba ese conjunto.
- Documentos: 66 enlaces locales/espejo GitHub del repo, documentos críticos presentes, dos saltos desde README a expediente, neutralidad y OpenSpec estricto PASS: documentation-checks.json.

Los checks se ejecutaron localmente en Windows/Node 24.18.0. No se afirma ejecución en tres SO, CI verde, installer actual ni sesiones humanas nuevas.

## Fallos de preparación corregidos, no resultados ocultos

QA detectó dos enlaces relativos de documentación empaquetada a documentos repo-only. Se corrigieron a enlaces GitHub sin modificar la allowlist de distribución ni el checker. Un needle de inspección usaba deepEqual cuando el código hace equal de length; se corrigió la observación. Una mutación negativa asignaba la categoría que el fixture ya tenía, y el arnés rechazó la ausencia de detección; ahora garantiza un valor diferente.

El orquestador externo de QA completó sus comandos comprobados y falló al escribir el resumen por confundir `checks` con `results` del doctor. qa.json se reconstruyó validando sus logs exactos retenidos (con hashes) sin repetir los checks para arreglar la presentación. No se atribuye ese error de reporting al producto ni se reemplazan logs fallidos por aprobaciones.

## Gates siguientes

Revisión independiente de la candidata, resolución de sus Blockers/Majors, captura definitiva oficial, verificación de conservación/recaptura en la rama, readiness/archive y PR protegido. No se ha hecho la captura definitiva al escribir esta sección. Su recibo posterior será actual-capture-verification.json; archive no implica merge ni cierre de #206. #204 sigue bloqueando la integración.
