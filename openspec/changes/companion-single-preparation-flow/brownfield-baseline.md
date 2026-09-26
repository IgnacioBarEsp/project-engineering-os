# Baseline de #146

Rama aislada `codex/146-single-flow`, basada en `b4494bd` de #145, que ya incorpora `49378d7` de #144. El checkout original del usuario se conservó en su rama. #146 estaba abierto, enriquecido, con DoR 13/13, sin PR duplicado. OpenSpec local 1.6.0 generó el change y validó las tres specs antes de implementar.

La base heredada pasó Companion 154/154, raíz 391/391, UI 20 recorridos/140 pantallas y contrato 45/45. Son resultados de #145, no del nuevo flujo. El renderer todavía tenía `setup.mjs`, `flow.mjs`, la pantalla Carpeta y la bifurcación hacia las revisiones antiguas. No existía borrador durable ni una espera de guardado antes de cerrar.

Rollback: revertir el PR antes de publicar; los proyectos, recibos e historial no se migran por lectura. La versión previa ignora el borrador nuevo en app data. No se borran originales ni evidencia para volver atrás.
