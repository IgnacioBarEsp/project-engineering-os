# Correcciones R1/R4 — revisión independiente de ola 3

Fecha: 2026-09-27. Hallazgos de la revisión separada del implementador sobre
82c88d16a12da0dfef377952c29abdfdfa1b8145, confirmados por reproducción antes de corregir.
El mantenedor pidió corregirlos; no se atribuye aceptación visual ni lectura en frío.

- R1: se guarda y suspende una copia aislada del borrador antes de abrir otro proyecto.
  Si el guardado falla, no se abre el segundo proyecto y el borrador sigue activo. Volver al
  paso Preparar genera un plan nuevo para la carpeta restaurada. Cerrar/reabrir conserva
  la selección original; abrir desde la lista y desde una carpeta conocida usan la misma protección.
- R4: elegir/cambiar carpeta no sustituye perfil, enfoque, tecnología ni nombre explícitos.
  La inspección sigue visible como recomendación. La entrada inicial desde una carpeta nueva
  conserva su sugerencia cuando todavía no existen respuestas.
- Regresión antes del cambio: 10/10 casos fallaron en renderer/servicio reales.
- Regresión después: 10/10 PASS, cinco variantes en no-preference y reduce; incluye cierre,
  reinicio de servicio/renderer, fallo de guardado, cancelación del selector y preservación de fuentes.
- OpenSpec local fijado 1.6.0: strict PASS; git diff --check PASS.
- Companion npm test en esta rama: 194/194 PASS.

Reproducir desde apps/companion:

    node scripts/verify-wizard-isolation.mjs <salida>

También se ejecuta al final de verify-ui.mjs en CI. Usa carpetas sintéticas y la frontera nativa
inyectada; no presenta ese recorrido como cierre de una ventana Electron real.
Los JSON crudos locales están en el temporal project-os-closeout/wave3-review-fixes/
wizard-before-clean y wizard-after. La primera tentativa wizard-before coincidió con una
integración aún incompleta y no cuenta como evidencia; se repitió desde el árbol resuelto.

Pendientes: propagación, suites finales, revisión independiente del SHA corregido y aceptación
humana. No archivar, fusionar ni cerrar #146 con este documento. Rollback: revertir el commit;
no hay migración de formato de borrador ni escrituras nuevas en las fuentes.
