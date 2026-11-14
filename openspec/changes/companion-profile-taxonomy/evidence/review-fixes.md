# Correcciones R2/R3 — revisión independiente de ola 3

Fecha: 2026-09-27. Revisión original: agente separado del implementador, alternativa declarada al
lanzador Bugbot no disponible, contra 82c88d16a12da0dfef377952c29abdfdfa1b8145. Hallazgos confirmados
R2 (compatibilidad al revisar) y R3 (recetas durables). El mantenedor pidió corregir todos los hallazgos.
No es aceptación visual del mantenedor ni lectura en frío.

## Antes y después

- R2: la nueva prueba de renderer/servicio falló antes del cambio con FOCUS_INVALID al revisar una
  selección histórica sin foco. Ahora pasa 22/22 casos: siete alias históricos, software/research sin
  foco, subtipo humano móvil y foco explícito, cada uno en no-preference y reduce. Se llega al plan
  real; project.json, receipt.json, transaction.json y projects.json conservan sus bytes hasta aprobar.
- R3: la prueba de archivos escritos para los 32 enfoques detectó 26 celdas equivocadas antes del
  cambio (seis defaults coincidían). Ahora todas las celdas tienen exactamente las recetas de la
  selección completa y conservan la fuente original. El consumidor durable ya no pasa solo el perfil.
- Companion npm test: 187/187 PASS en esta rama. Incluye 32 subcasos de recetas y su test padre.
- Repositorio npm run check: 391/391 PASS; también pasan contratos, neutralidad, documentación,
  workflows, deuda y doctor del OpenSpec fijado.
- OpenSpec local fijado 1.6.0: strict PASS antes de aplicar la corrección.

## Reproducción

Desde apps/companion:

    node --test --test-name-pattern="written recipes retain" qa/profiles.mjs
    node scripts/verify-profile-compatibility.mjs <salida>
    npm test

El recorrido histórico nuevo también se ejecuta al final de verify-ui.mjs, por lo que entra en CI.
Usa carpetas sintéticas aisladas, renderer/servicio reales y transporte nativo inyectado. No ejecuta
instaladores ni descarga herramientas. Los JSON crudos locales están en project-os-closeout/
wave3-review-fixes/profile-before, profile-after y profile-extended, dentro del directorio temporal.

La revisión independiente del nuevo SHA, CI sobre la cadena actualizada y aceptación visual siguen
pendientes. No se archiva, fusiona ni cierra #145 con este documento. Rollback: revertir este commit;
la lectura no migra recibos históricos y no se modifica el esquema de sus archivos.
