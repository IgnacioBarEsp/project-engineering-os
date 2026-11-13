# Reconciliación histórica de identidad — #206, fase 1

La guarda ya se corrigió; esta fase concilia su ID original, no vuelve a implementarla. [Inventario de los 37 registros al inicio](HISTORICAL_DEBT_206.md), con criterios y seguimientos para los demás. El issue [#206](https://github.com/IgnacioBarEsp/project-engineering-os/issues/206) continúa abierto como paraguas.

## Identidad y motivo

En main `9751c301976fe27e9bbad33e69f39372b69f901e`, `debt-bee2fa0c0549` está abierto y `debt-53f4fcdb6a67` resuelto. El [assessment histórico](../../.project-os/debt/assessments/restructure-companion-navigation-remediation-2.json) utiliza el título del segundo. [findMatchingItem](../../src/debt/capture.mjs) genera fingerprints por título/artifact/categoría: el assessment está reflejado, pero no identifica el registro original. Reaplicarlo no corrige ese ID.

El input de la fase utiliza `resolves.id` exacto, con un assessment nuevo mediante el CLI oficial. No se editan manualmente registry, assessments antiguos, matching o presupuesto. El estado operativo siempre se consulta en el [registro](../../.project-os/debt/registry.json); un expediente en una rama o un PR no implica integración.

## Lo comprobado y sus límites

Inspección estática actual de [verify-native-journeys.mjs](../../apps/companion/scripts/verify-native-journeys.mjs): se conservan las comparaciones/rechazos del payload Electron, archivos cargables de la closure propia, entradas raíz, campos ejecutables del manifest, paquetes desconocidos y digest del archivo sellado npm. Los paquetes ajenos a la closure se comprueban por presencia, no byte por byte. La extracción del runtime verifica el árbol sellado en un camino separado.

Evidencia **histórica**, no una ejecución nueva: [validación del 12 de septiembre](../../openspec/changes/archive/2026-09-12-restructure-companion-navigation/evidence/validation.md) y [JSON instalado](../../openspec/changes/archive/2026-09-12-restructure-companion-navigation/evidence/native-journeys.json). Nombra el árbol limpio `cb257fac27421506b5a0336e6de0845f080b3e11`: 68 archivos de runtime y 137 cargables de cinco paquetes, sin diferencias; el documento declara 12 bypasses rechazados y control positivo. No se afirma identidad binaria de esa instalación con main actual.

Se mantienen exclusiones por empaquetado: ejecutable renombrado/icono/recurso de versión/licencia, placeholder Electron reemplazado, campos de package.json reescritos y archivos no cargables podados. Presencia de paquetes y digest del archivo sellado no equivalen a verificar cada byte de todos los paquetes instalados ni todos los bytes excluidos. No hay nuevas pruebas humanas, instalador, otro SO, proveedor o lector de pantalla en esta fase.

## Conservación, reintento y recuperación

El verificador específico exige 50 IDs en el mismo orden, solo status/resolution/updatedAt del objetivo cambiados, otros 49 objetos idénticos, 36 abiertos, assessments anteriores/configuración byte-idénticos, presupuesto 4/5 y tres flujos. Repetir el mismo input debe ser no-op; una captura parcial se reanuda con ese input sin borrar historia. La CLI genérica no sabe qué IDs autoriza esta fase: la allowlist de un ID se verifica antes de invocarla.

Antes de integrar, un candidato rechazado y todos sus assessments se conservan separado de un baseline verificado. Se recupera el trabajo desde una copia nueva de ese baseline, no restaurando solo el registro en presencia de un assessment contradictorio. No existe una operación oficial de reapertura posmerge; una resolución integrada equivocada requiere otra corrección aprobada, no borrar historia ni prometer un rollback inexistente.

El expediente de fase conserva aprobación, manifiestos, pruebas negativas y recuperación; los enlaces de la [rama de fase](https://github.com/IgnacioBarEsp/project-engineering-os/tree/codex/206-reconcile-historical-debt/openspec/changes) identifican trabajo no integrado. La revisión independiente y el archive son gates separados; ningún agente sustituye aceptación humana. #204 continúa bloqueando CI/integración: no merge rojo ni excepciones nuevas; no se inicia ola 4.
