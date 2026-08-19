# Evidencia manual

## API pública y ownership

La API añade funciones/constantes desde `src/index.mjs`; no cambia firmas existentes. Runtime, schemas,
tests y docs pertenecen al upstream. Answers y state emitido pertenecen al consumidor. Persistencia se
reserva a #31 y trackers a #33.

## Claridad y findability

`README.md` enlaza `docs/ONBOARDING_PLAN.md`; el índice y guía del usuario también lo encuentran en dos
saltos o menos. La documentación separa `main` de npm `0.1.6` y evita anunciar prompts/trackers como listos.

## Licencia, costo e instalación

MIT permanece sin cambios, no hay dependencia de runtime, cuenta, proveedor ni costo. `pack:verify` instala
el tarball exacto y prueba su CLI. Rollback consiste en reinstalar/revertir la release anterior; el comando
no deja archivos o recursos que reconciliar.

## Degradaciones revisadas

- Git ausente o no verificable produce inspección incompleta y ruta de preservación, nunca PASS vacío.
- Jira/Azure sin config local no se infieren leyendo docs; la respuesta `tracker` conserva esa decisión.
- Límite, symlink, special entry o permiso insuficiente fuerzan brownfield y permanecen visibles.
- Un Git vacío con answers/state untracked no se confunde con trabajo de producto.

## Recuperación

La suite conserva el rehearsal transaccional existente de rollback y añade source state v0 sin mutar. Un
input inválido se corrige o retira; un estado futuro exige el runtime correspondiente. No se borra ni migra
silenciosamente ningún archivo del consumidor.
