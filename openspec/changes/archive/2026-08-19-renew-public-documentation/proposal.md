## Why

Issue de origen: [#22](https://github.com/IgnacioBarEsp/project-engineering-os/issues/22).

Project Engineering OS gobierna trabajo complejo, pero su entrada pública exige hoy leer una explicación
principalmente técnica antes de entender el resultado. El README y la documentación necesitan una ruta
visual, breve y verificable que sea amable para perfiles junior y senior sin ocultar contratos ni anunciar
como existentes las ideas futuras del onboarding adaptativo.

## What Changes

- Crear una entrada pública en español que explique propósito, flujo SDD, motor de deuda, capacidades y
  primer uso con una jerarquía comprensible.
- Mantener la versión inglesa dentro de un desplegable y mover el detalle técnico a rutas documentales
  enlazadas por objetivo.
- Incorporar recursos visuales locales, accesibles y compatibles con GitHub claro y oscuro. La dirección
  final se elige entre dos propuestas mediante aprobación humana.
- Crear `PRODUCT.md` y `DESIGN.md` para registrar producto, voz, tokens, componentes y límites visuales.
- Reorganizar `docs/README.md` y añadir contexto o navegación simple a los documentos públicos sin cambiar
  sus contratos técnicos.
- Verificar el inicio rápido contra la versión publicada y limitar la compatibilidad declarada a Claude
  Code, Codex, Cursor, GitHub Copilot y OpenCode.
- Publicar, después de aprobación, una variante coherente del recurso visual en el perfil de GitHub.
- Mantener fuera de este cambio el router adaptativo, la creación automática de tableros y cualquier nueva
  integración de skills o MCP, que pertenecen al spike #23.

## Capabilities

### New Capabilities

- `public-documentation-experience`: Contrato para que la entrada pública explique el producto, permita
  comenzar con comandos reales, ofrezca navegación progresiva y use recursos visuales accesibles sin
  sustituir el contenido textual.

### Modified Capabilities

- Ninguna. Este cambio no altera los requisitos de runtime, distribución, upgrade ni Debt Control.

## Impact

- Afecta `README.md`, `docs/**/*.md`, recursos nuevos bajo `docs/assets/`, `PRODUCT.md`, `DESIGN.md` y el
  README del repositorio de perfil después de aprobación.
- No modifica API, runtime, blueprint, esquemas, datos, workflows de release ni dependencias de runtime.
- Costo previsto: cero. Solo se admitirán recursos propios o redistribuibles con licencia y procedencia
  registradas.
- Riesgo principal: simplificar hasta desalinear la documentación del CLI. Cada comando, agente y capacidad
  se contrastará con código, ayuda, pruebas y versión publicada.
- Rollback: revertir los commits documentales y restaurar los recursos previos; después se repiten checks,
  inicio rápido y revisión de enlaces.
