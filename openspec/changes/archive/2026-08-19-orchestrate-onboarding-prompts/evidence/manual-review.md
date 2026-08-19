# Evidencia manual

## Claridad, ownership y drift declarado

El README, el índice de documentación y la guía del usuario colocan el router antes del Prompt 00 y explican
qué hace cada pieza. La documentación distingue lo que existe en `main` de lo que publica npm `0.1.6`: ni el
clasificador ni el router están en la versión publicada, y las tres superficies lo dicen con las mismas
palabras. `docs/ONBOARDING_PLAN.md` deja de anunciar la orquestación como pendiente y ahora explica quién
registra el estado.

El upstream posee router, prompts, manifest, contrato y pruebas. El repositorio consumidor posee sus
respuestas, el estado registrado y las decisiones posteriores. OpenSpec conserva OPSX. Trackers remotos
siguen en #33 y adapters por agente en #32; ninguna superficie de este change los toca.

## API pública, licencia y costo

No cambian comandos, banderas, exports ni schemas: el contrato del clasificador de #30 queda intacto. El
único artefacto nuevo del paquete es un documento administrado más en el blueprint, de 76 archivos en lugar
de 75. La licencia MIT no cambia, no hay dependencias nuevas, cuentas, proveedores ni costo incremental.
`scripts/prompt-contract.mjs` y `test/prompts.test.mjs` son herramientas de desarrollo y no viajan en el
tarball.

## Degradaciones revisadas

- El gate humano del registro es una instrucción del prompt, no un bloqueo ejecutable. Lo ejecutable es que
  el runtime sigue siendo read-only y nunca escribe la ruta por su cuenta.
- La paridad raíz/blueprint se verifica por estructura compartida, no por semántica: un texto reescrito que
  conserve rutas, preguntas, referencias y marcadores pasaría el contrato. La revisión humana sigue siendo
  el gate de cierre.
- Una reclasificación posterior al bootstrap devuelve `brownfield` porque la evidencia cambió. El router y
  los dos prompts declaran ese límite en lugar de esconderlo.
- Si la versión instalada todavía no incluye `onboarding-plan`, el router indica empezar por el Prompt 00 y
  registrar la ruta como pospuesta, sin fingir una clasificación.

## Recuperación ensayada

El rollback de este change es revertir el commit: retira el router, su entrada de manifest, los enlaces y
las pruebas, y restaura Prompt 00 y Prompt 01 anteriores. No hay estado remoto ni local del runtime que
reconciliar, porque ningún comando nuevo escribe.

Para el estado que registra una persona, el ensayo se hizo en carpetas reales: un estado registrado se
vuelve a derivar idéntico, y un estado que no sea canónico falla en el propio lector del clasificador con
recuperación explícita. El archivo fuente nunca se modifica ni se borra; conservarlo es lo que permite
volver atrás. La fixture de bootstrap conserva además el ensayo transaccional existente, con 76 creaciones,
cero colisiones y segundo run sin drift.

## Recorrido en papel de las tres rutas

Los tres recorridos llegan a discovery con la ruta registrada y las decisiones visibles: `beginner` con el
tracker pospuesto, `experienced-new` con decisión confirmada y `experienced-new` como ruta pese a empezar
con la ruta reversible por defecto, y `brownfield` con rebootstrap prohibido y una pregunta pendiente. Un
cuarto recorrido sin respuestas mantiene las cinco preguntas pendientes y sigue siendo utilizable. Ninguno
elige tracker, stack, arquitectura, CI/CD ni recurso remoto.
