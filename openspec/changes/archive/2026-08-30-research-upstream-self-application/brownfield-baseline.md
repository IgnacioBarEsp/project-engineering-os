# Brownfield baseline - autoaplicación del upstream

## 1. Superficie acotada

La documentación pública de decisiones y el inventario de mecanismos que el repositorio distribuye. Ningún
archivo de runtime, blueprint, schema ni configuración cambia dentro de este spike.

## 2. Fuentes vigentes

- Salidas medidas de `doctor --json`, `opsx-check`, `debt check`, `readiness-check` y `sync --check` sobre
  este repositorio, recogidas en `evidence/current-truth.md`.
- `src/doctor.mjs` para los 29 checks, sus perfiles y las rutas que espera cada uno.
- `src/readiness.mjs` para el contrato runtime v1 y el conjunto de perfiles activo fijado.
- `src/debt/` y `schema/debt/` para el motor de deuda y su schema de assessment.
- `config/export-allowlist.json` y `scripts/neutrality-lib.mjs` para la frontera de neutralidad.
- `blueprint/core/**` y `blueprint/manifest.json` para lo que un bootstrap sembraría.
- `blueprint/core/project-os/tool-catalog.json` para el veredicto vigente sobre inteligencia de código.
- Issues [#25](https://github.com/IgnacioBarEsp/project-engineering-os/issues/25),
  [#42](https://github.com/IgnacioBarEsp/project-engineering-os/issues/42) y
  [#45](https://github.com/IgnacioBarEsp/project-engineering-os/issues/45) como manifestaciones repetidas del
  mismo patrón, y [#23](https://github.com/IgnacioBarEsp/project-engineering-os/issues/23) como precedente de
  spike que termina en decision record más desglose.

## 3. Comportamiento actual

`.project-os/` contiene un único archivo. Los cuatro comandos de diagnóstico del proyecto no producen señal
accionable sobre su propio repositorio: uno falla por configuración ausente, otro por artefactos ausentes,
otro reporta PASS por omisión y el cuarto mezcla forma de consumidor con deuda real sin distinguirlas. La
deuda del upstream solo aparece cuando una persona la lee.

## 4. Comportamiento objetivo

Existe una decisión publicada que da veredicto a cada mecanismo con razón verificable, separa forma de
consumidor de deuda real con un criterio explícito, resuelve la recursión de ownership con medición y nombra
el mecanismo que ya la impide, y termina en un desglose de issues implementables con criterios propios.

## 5. Compatibilidad heredada

Nada cambia de comportamiento. La documentación existente conserva su estructura y sus enlaces; el decision
record se añade al índice sin desplazar nada. Las decisiones ya publicadas —onboarding adaptativo, catálogo
de herramientas, ownership— se citan y no se reescriben.

## 6. Owner de spec y contexto

Project Engineering OS upstream posee la decisión y el inventario. OpenSpec conserva la propiedad de sus
artefactos generados. El issue #46 gobierna el cambio.

## 7. Evidencia prevista

Salidas medidas de los cuatro comandos sobre este repositorio y sobre un target desechable, sondas de
configuración in situ para readiness y deuda, captura de los diez assessments existentes contra el schema del
motor, comparación de las rutas en conflicto con sus semillas, y `npm run check` para confirmar que el spike
no altera nada ejecutable.

## 8. Exclusiones

Implementar cualquier adopción; bootstrapear el upstream; instalar skills, MCP o indexadores; elegir
proveedor de inteligencia de código; abrir la allowlist de neutralidad; autenticar cuentas, crear tableros o
mutar recursos remotos más allá de los issues del desglose; y resolver el Issue #45, que tiene camino propio.
