# Evidencia de readiness y cierre local

Fecha: 1 de septiembre de 2026. Change: `pin-upstream-openspec-1-6-0`. Issue:
[#48](https://github.com/IgnacioBarEsp/project-engineering-os/issues/48).

## Definition of Ready

El issue público conserva historia original, estado verificado, criterios observables, alcance/no objetivos,
riesgo, dependencias, licencia/costo, evidencia y rollback. El spike #46 registró el gate real en un target
desechable como `PASS 13 | FAIL 0 | EXCEPTION 0`.

La sonda in situ actual reporta `FAIL readiness.configuration` por ausencia de
`.project-os/readiness-policy.json`, deuda independiente #49. El resultado completo está en
`pre-propose-readiness.md`; no se reetiqueta como PASS.

## Definition of Done local

- OpenSpec 1.6.0 local instalado desde `npm ci` y 9/9 artefactos válidos en estricto.
- 235/235 pruebas y todos los gates de paquete, neutralidad, docs y workflows en PASS.
- Auditoría PASS con cero high/critical y cero excepciones.
- Fixture acotado y completo en PASS.
- Tarball verificado sin OpenSpec de runtime, source duplicado ni árbol de dependencias embebido.
- Segunda instalación sin drift de lockfile.
- Revisión adversarial PASS, cero Blockers/Majors; assessment `clean`.

## Rollback

Revertir el commit y ejecutar `npm ci`. No hay datos, secretos, servicios, autenticación, configuración
global ni estado remoto que recuperar.

## Cierre remoto pendiente

El archive local se ejecutó con OpenSpec 1.6.0 y aplicó un requisito nuevo a
`supply-chain-governance` antes de mover el change a
`2026-09-01-pin-upstream-openspec-1-6-0`. Push, PR, CI remoto, merge y cierre del issue quedan pendientes
hasta autenticar GitHub CLI con autoridad explícita.
