# Brownfield baseline — clasificador de onboarding

## 1. Superficie tocada

CLI y API pública, un módulo nuevo, schemas de salida/entrada, documentación, pruebas y spec de onboarding.

## 2. Fuentes vigentes

- Issue #30 y decisión `docs/ADAPTIVE_ONBOARDING.md` derivada de #23.
- `src/cli.mjs`, `src/state.mjs`, `src/github-plan.mjs` y `src/index.mjs`.
- `test/constructor.integration.test.mjs` y contrato de empaquetado.
- `openspec/specs/runtime/spec.md` y configuración OpenSpec local.

## 3. Comportamiento actual

El CLI puede inspeccionar salud y generar planes GitHub, pero no clasifica la adopción. Prompt 00 precede a
Prompt 01 sin estado que explique si la carpeta es nueva, experimentada o brownfield.

## 4. Comportamiento objetivo

Un comando read-only detecta evidencia acotada, normaliza cinco respuestas y emite una ruta explicable con
estado canónico v1, migración in-memory y representación humana/JSON determinista.

## 5. Compatibilidad legacy

Todos los comandos, flags, exports y schemas existentes permanecen. El nuevo comando es aditivo, no escribe
targets y admite un draft v0 solo como entrada de compatibilidad explícita.

## 6. Owner de spec y contexto

El upstream posee runtime, schemas, docs y la nueva spec `adaptive-onboarding`. El consumidor posee sus
respuestas, el estado emitido y las decisiones posteriores; #31/#33 poseen orquestación y trackers.

## 7. Evidencia

Unitarios y negativos, CLI instalado, pack, matriz multiplataforma, determinismo, inspección no destructiva,
OpenSpec strict, revisión adversarial, deuda y readiness.

## 8. Exclusiones

Persistencia del estado, Prompt 00/01, autenticación, recursos remotos, instalación de skills/MCP, soporte de
agentes, stack, arquitectura, MVVM y CI/CD del producto.
