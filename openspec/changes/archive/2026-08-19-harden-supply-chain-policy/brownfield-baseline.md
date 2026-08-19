# Brownfield baseline — política de cadena de suministro

## 1. Superficie acotada

`package.json`, `.github/workflows/ci.yml`, scripts y pruebas de auditoría, comandos OpenSpec del blueprint,
`THIRD_PARTY_NOTICES.md`, `docs/COSTS_AND_LICENSES.md` y un registro nuevo bajo `docs/security/`.

## 2. Fuentes vigentes

- `package.json`, ambos lockfiles y `scripts/check-package.mjs` para dependencias y empaquetado.
- `.github/workflows/ci.yml` y `test/workflows.test.mjs` para el gate requerido.
- `blueprint/core/package.json`, `project-constructor.yml` y `test/supply-chain.test.mjs` para OpenSpec.
- Documentación y código oficiales de OpenSpec 1.6.0 para el alcance real de telemetría.

## 3. Comportamiento actual

La raíz y el blueprint están limpios y CI instala con scripts desactivados, pero no ejecuta una auditoría.
La telemetría está desactivada en CI y documentada, pero los scripts locales usan OpenSpec directamente.
El triage de Socket solo vive en el issue.

## 4. Comportamiento objetivo

CI audita raíz y blueprint con umbral alto, aplica únicamente excepciones exactas vigentes y falla si el
registro no responde. Los scripts del proyecto apagan telemetría por defecto sin sobrescribir decisiones
explícitas. El triage y la atribución quedan versionados y enlazados.

## 5. Compatibilidad heredada

Se preservan los nombres de scripts OpenSpec, la versión fijada, `allowScripts`, Node soportado y la ausencia
de dependencias de runtime. La invocación directa de OpenSpec sigue disponible con su contrato upstream.

## 6. Owner de spec y contexto

Project Engineering OS upstream posee CI, runtime, blueprint y documentación. El Issue #18 y la capacidad
`supply-chain-governance` gobiernan el cambio. OpenSpec upstream conserva ownership de su telemetría.

## 7. Evidencia prevista

Pruebas unitarias de política, simulación high, auditorías online, `npm run check`, fixture, inspección de un
repo bootstrapeado, OpenSpec strict, revisión adversarial y assessment de deuda.

## 8. Exclusiones

Gestor de paquetes, upgrade de OpenSpec, adopción de Socket, invocaciones directas fuera de los scripts,
dependencias de aplicación y cambios al flujo de publicación quedan fuera.

