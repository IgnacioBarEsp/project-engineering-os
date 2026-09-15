## Context

El log del run `34948905121` informa `Unable to resolve action` antes del primer step. La consulta directa
al repositorio oficial de Actions confirma que el tag `v7.0.1` resuelve a
`043fb46d1a93c77aae656e7c1c64a875d1fc6a0a`.

## Decision

Mantener pin SHA, corregir sólo el último nibble y exigir el valor completo desde `qa/packaging.mjs`. El
workflow continúa con permisos mínimos globales y `contents: write` limitado al job publicador. El tag
existente se reutiliza porque apunta al commit protegido correcto y no se movió.

## Recovery

Si el nuevo dispatch falla antes de publicar, 0.1.0 permanece intacta. Si una acción fijada deja de
resolver en el futuro, se verifica el tag oficial, se crea un change y se actualiza su aserción; nunca se
sustituye una acción por una referencia flotante.
