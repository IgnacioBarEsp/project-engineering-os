# Brownfield baseline — renovación documental pública

## 1. Superficie acotada

`README.md`, `docs/**/*.md`, recursos nuevos bajo `docs/assets/`, contexto raíz `PRODUCT.md`/`DESIGN.md` y,
después de aprobación, la tarjeta correspondiente del repositorio de perfil.

## 2. Fuentes vigentes

- `README.md`, `package.json`, `bin/project-os.mjs` y `src/` para comandos y comportamiento.
- `openspec/specs/` para requisitos activos.
- `blueprint/core/project-os/{agents,skills,mcp}.json` y prompts para capacidades de agentes.
- `docs/architecture/OWNERSHIP.md`, `LICENSE` y `THIRD_PARTY_NOTICES.md` para propiedad y licencias.

## 3. Comportamiento actual

El README describe bootstrap, ownership, readiness, deuda, comandos y límites con precisión, pero de forma
principalmente textual. `docs/README.md` es un índice corto por archivos. No existen recursos visuales,
`PRODUCT.md` ni `DESIGN.md` en la raíz.

## 4. Comportamiento objetivo

La entrada explica propósito y recorrido antes del detalle, incorpora un visual aprobado y terminal real,
ofrece inicio rápido verificado y enlaza documentación progresiva. Español es la ruta principal y el inglés
queda oculto en un desplegable.

## 5. Compatibilidad heredada

No cambian flags, exports, archivos administrados, prompts, esquemas ni runtime. Los enlaces públicos
existentes se preservan o reciben una ruta equivalente. Solo se declaran cinco agentes ya soportados.

## 6. Owner de spec y contexto

Project Engineering OS upstream es owner de las superficies. #22 es el issue; este change y
`public-documentation-experience` gobiernan el comportamiento nuevo. #23 conserva ownership del onboarding
adaptativo.

## 7. Evidencia prevista

Ayuda real del CLI, fixture limpio, `npm run check`, OpenSpec strict, enlaces, previews de GitHub,
contraste, texto alternativo, aprobación humana, revisión adversarial y assessment de deuda.

## 8. Exclusiones

Runtime, blueprint, schemas, release, automatización de tableros, nuevas integraciones, agentes no
soportados y el PR #21 quedan fuera.
