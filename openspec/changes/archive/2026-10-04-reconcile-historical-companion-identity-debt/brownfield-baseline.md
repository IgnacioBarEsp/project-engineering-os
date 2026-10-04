# Baseline de la superficie tocada

Issue: [#206](https://github.com/IgnacioBarEsp/project-engineering-os/issues/206). Base: `9751c301976fe27e9bbad33e69f39372b69f901e` de main; rama aislada `codex/206-reconcile-historical-debt`.

## Estado actual

- `.project-os/debt/registry.json`: 50 items, 37 abiertos; SHA-256 `2711f41198011fa04434a3ded8c6b805a2fe5de9102140ecbedb85c54914d6d3`.
- `debt-bee2fa0c0549`: original `optional-improvement`, minor, open; una ocurrencia del flujo `restructure-companion-navigation` en 2026-09-12.
- `debt-53f4fcdb6a67`: título equivalente distinto, technical-debt, minor, resolved; resolución por `restructure-companion-navigation-remediation-2`.
- El motor existente usa fingerprints de título/artifact/categoría y ofrece resolución por ID explícito; no ofrece reapertura. El assessment histórico está reflejado sin que el ID original se haya cerrado.
- Evidencia archivada de la guarda instalada de 2026-09-12 y código actual con las comparaciones retenidas. Ninguna nueva ejecución instalada en esta fase.
- `debt check`: PASS; upstream-core 4/5 unidades, tres flujos. #204 bloquea el CI de Companion; no se confunde con ausencia de un gate local de metadata.
- Diagnóstico de los 37 ya publicado: [comentario con triage y fuentes](https://github.com/IgnacioBarEsp/project-engineering-os/issues/206#issuecomment-5967265523). Sus etiquetas son provisionales, no resoluciones.

## Estado objetivo después de Apply aprobado

Exactamente 50 items, 36 abiertos y un assessment nuevo de reconciliación; solo cambian status/resolution/updatedAt del ID original. Todos los otros objetos, campos inmutables del objetivo, assessments previos, configuración y presupuesto se conservan. Inventario y evidencia quedan versionados y encontrables; #206 no se cierra.

## Ownership y límites

Upstream owns CLI/specs/documentación; deuda project-owned e histórica inmutable. OpenSpec oficial local owns archive/sync. Sin cambio público o consumidor, UI, runtime, licencias, costes o secretos. Esta fase no certifica los otros 36, el instalador actual, todo el árbol de paquetes ni las intervenciones humanas de la ola 3.

## Fuentes

- [Debt Control](https://github.com/IgnacioBarEsp/project-engineering-os/blob/9751c301976fe27e9bbad33e69f39372b69f901e/openspec/specs/debt-control/spec.md) y [guía de deuda](https://github.com/IgnacioBarEsp/project-engineering-os/blob/9751c301976fe27e9bbad33e69f39372b69f901e/docs/DEBT_CONTROL.md).
- [Motor de captura](https://github.com/IgnacioBarEsp/project-engineering-os/blob/9751c301976fe27e9bbad33e69f39372b69f901e/src/debt/capture.mjs).
- [Guarda actual](https://github.com/IgnacioBarEsp/project-engineering-os/blob/9751c301976fe27e9bbad33e69f39372b69f901e/apps/companion/scripts/verify-native-journeys.mjs).
- [Assessment histórico](https://github.com/IgnacioBarEsp/project-engineering-os/blob/9751c301976fe27e9bbad33e69f39372b69f901e/.project-os/debt/assessments/restructure-companion-navigation-remediation-2.json).
- [Validación histórica](https://github.com/IgnacioBarEsp/project-engineering-os/blob/9751c301976fe27e9bbad33e69f39372b69f901e/openspec/changes/archive/2026-09-12-restructure-companion-navigation/evidence/validation.md) y [run instalado histórico](https://github.com/IgnacioBarEsp/project-engineering-os/blob/9751c301976fe27e9bbad33e69f39372b69f901e/openspec/changes/archive/2026-09-12-restructure-companion-navigation/evidence/native-journeys.json).
- [Manifiesto de propuesta](evidence/proposal-baseline.json) y [DoR real](evidence/readiness-propose.json).
