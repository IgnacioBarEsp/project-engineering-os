# Brownfield baseline

## 1. Superficie tocada

Documentación pública, índice documental y contrato OpenSpec de experiencia documental. No se toca runtime.

## 2. Fuentes vigentes

- `docs/README.md` y `docs/COMPATIBILITY.md`.
- Prompt 00 y Prompt 01 en raíz y blueprint.
- `blueprint/core/project-os/harness-capabilities.json`, `skills.json` y `mcp.json`.
- `openspec/specs/public-documentation-experience/spec.md`.

## 3. Comportamiento actual

La documentación distingue bootstrap y discovery, y ya advierte que el onboarding adaptativo pertenece al
Issue #23. No existe un decision record con rutas, tracker, permisos, catálogo y recorridos.

## 4. Comportamiento objetivo

Publicar una decisión fechada que compare verdad actual y objetivo, defina tres rutas y entregue backlog
implementable sin anunciar comportamiento nuevo del CLI.

## 5. Compatibilidad legacy

Prompt 00, Prompt 01, los cinco harnesses y los manifiestos no cambian. Los enlaces existentes se conservan.

## 6. Owner de spec y contexto

El upstream es owner de la documentación neutral y de `public-documentation-experience`. Cada consumidor
seguirá siendo owner de su producto, tracker, perfiles e integraciones.

## 7. Evidencia

Fuentes oficiales fechadas, recorridos en papel, revisión adversarial, links válidos, OpenSpec strict y suite
del paquete.

## 8. Exclusiones

Router, prompts instalados, schemas, activación de herramientas, autenticación, recursos remotos,
arquitectura de producto y soporte oficial de Antigravity.
