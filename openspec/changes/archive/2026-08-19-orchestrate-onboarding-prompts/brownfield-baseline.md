# Brownfield baseline — orquestación del onboarding

## 1. Superficie tocada

Documentación de prompts en la raíz y en el blueprint, manifest del blueprint, índices de documentación,
comprobaciones de docs y fixture, un contrato de prompts reutilizable y una suite de pruebas nueva.

## 2. Fuentes vigentes

- Issue #31 enriquecido y decisión `docs/ADAPTIVE_ONBOARDING.md` derivada de #23.
- Contrato del clasificador `docs/ONBOARDING_PLAN.md` y `src/onboarding.mjs`, archivados en #30.
- `docs/prompts/PROMPT_00_BOOTSTRAP_ENTORNO.md` y `docs/prompts/PROMPT_01_DISCOVERY_PROYECTO.md`.
- Espejos en `blueprint/core/docs/engineering/` y su registro en `blueprint/manifest.json`.
- `scripts/check-docs.mjs`, `scripts/verify-fixture.mjs` y `openspec/specs/adaptive-onboarding/spec.md`.

## 3. Comportamiento actual

`onboarding-plan` clasifica y emite un estado canónico, pero ningún prompt lo consume. Prompt 00 abre el
recorrido en orden fijo y Prompt 01 empieza la entrevista sin reutilizar la clasificación. El estado no se
registra, el relevo entre chats no está definido y la recuperación por ruta no existe.

## 4. Comportamiento objetivo

Un router único clasifica, explica justo a tiempo, registra el estado bajo gate humano y entrega el control a
Prompt 00 y Prompt 01 por ruta. Las tres rutas llegan a discovery con estado y decisiones trazables, y la
arquitectura del producto permanece después del discovery.

## 5. Compatibilidad legacy

Comandos, banderas, exports, schemas y el contrato del clasificador permanecen sin cambios. Prompt 00 y
Prompt 01 conservan su propósito y su gate de cierre; solo añaden la lectura del estado registrado. El
archivo del router es nuevo, por lo que un repositorio existente no encuentra colisión humana al sincronizar.

## 6. Owner de spec y contexto

El upstream posee router, prompts, manifest, contrato y pruebas. El consumidor posee sus respuestas, el
estado registrado y las decisiones posteriores. OpenSpec conserva OPSX. Trackers remotos pertenecen a #33 y
los adapters por agente a #32.

## 7. Evidencia

Pruebas de paridad e invariantes con casos negativos, comprobación de documentos críticos y enlaces, fixture
de bootstrap con findability en dos saltos, OpenSpec strict, `npm run check`, `pack:verify`, revisión
adversarial, assessment de deuda y readiness de archive.

## 8. Exclusiones

Comandos mutantes, schemas nuevos, cambios al contrato del clasificador, trackers remotos, adapters por
agente, catálogo de skills y MCP, y cualquier decisión de stack, arquitectura, MVVM, CI/CD, cloud o base de
datos del producto consumidor.
