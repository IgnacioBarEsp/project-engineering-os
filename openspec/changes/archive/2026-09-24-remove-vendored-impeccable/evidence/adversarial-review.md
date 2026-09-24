# Revisión adversarial y de código independiente — #152

Fecha: 2026-09-24. Revisión estática y de solo lectura, realizada por agentes independientes sobre el cambio completo y repetida después de cada corrección. No sustituye la revisión humana exigida por la protección de la rama.

## Resumen

La revisión final no encontró hallazgos accionables abiertos. Se inspeccionaron el cierre de dependencias de producción, la resolución de paquetes anidados, los filtros Windows/x64, la concordancia de los avisos con manifests/lockfiles, la política cerrada de hooks y la allowlist de exportación.

## Hallazgos y resolución

| Caso detectado en revisiones previas | Corrección verificada |
| --- | --- |
| Dependencias de producción sin versión podían omitirse del inventario de avisos. | El inventario conserva la identidad con versión ausente y el gate falla cerrado. |
| Un paquete directo o transitivo marcado `dev` podía ocultar redistribuciones de producción. | La cobertura recorre dependencias desde las declaraciones de producción y contrasta manifiesto, raíz del lock y registros directos; los flags `dev` inválidos también fallan. |
| Restricciones de plataforma solo negativas (`os: ["!darwin"]`, `cpu: ["!arm64"]`) excluían paquetes válidos de Windows/x64. | El filtro interpreta listas negativas como restricciones de exclusión y tiene regresión para un paquete transitivo anidado. |
| Mapas explícitamente `null` podían comportarse como ausentes. | Los mapas ausentes siguen permitidos; `null` en `dependencies`, `optionalDependencies` y `peerDependencies` de manifests o lockfiles se rechaza, tanto en la raíz como en cierres transitivos cubiertos. |
| Un `peerDependency` opcional ausente del lock se trataba como requerido. | `peerDependenciesMeta.optional` se respeta en peers directos y anidados; peers requeridos ausentes siguen fallando y metadatos inválidos se rechazan. |

Los hallazgos quedaron corregidos y se volvieron a revisar sobre el estado final. El reviewer final no encontró otros problemas en avisos de Companion/core, hooks o exportación.

## Verificaciones

- `node --test test/supply-chain.test.mjs test/neutrality.test.mjs`: PASS, 19/19.
- `npm run check:package`: PASS.
- `npm run check:neutrality`: PASS.
- `npm run check`: PASS, 371/371; cero fallos y cero tests omitidos.
- `node_modules/.bin/openspec.cmd validate remove-vendored-impeccable --strict`: PASS.
- `git diff --check` y `git diff --cached --check`: PASS.

## Veredicto

PASS para el cambio: cero Blockers, cero Majors y cero hallazgos accionables abiertos en la revisión final independiente. CI y aprobación humana independiente del PR protegido siguen siendo gates separados.
