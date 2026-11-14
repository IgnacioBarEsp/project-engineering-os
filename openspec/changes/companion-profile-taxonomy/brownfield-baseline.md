# Baseline brownfield antes de #145

La rama aislada `codex/145-profile-taxonomy` partió de `f8d8b54`, el primer commit de #144, mientras #144 seguía como PR borrador y sin archivo OpenSpec. #145 ya tenía issue enriquecido y DoR 13/13; no existía otro PR de taxonomía que duplicar. Se leyó y validó estrictamente la propuesta local de OpenSpec 1.6.0 antes de cambiar código.

El renderer ofrecía once ids visibles con solapes. El motor todavía decidía etapas, tecnología y recetas con cinco ids anteriores; los nuevos caían en reglas generales. `PROJECT_VISION.md` podía escribir un id interno y la delimitación del renderer daba opciones de software a perfiles que no eran software. La carpeta y los recibos 0.3.x son datos de la persona y no se migran al leerlos.

La línea de partida heredada de #144 pasó Companion 150/150, raíz 389/389, 20 recorridos de UI y contrato 45/45. Esas cifras son baseline, no evidencia de #145. El criterio de rollback es revertir este PR antes de release; la lectura de proyectos antiguos debe seguir sin alterar bytes ni hashes.
