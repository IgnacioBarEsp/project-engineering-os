## Why

El clasificador de #30 ya elige `beginner`, `experienced-new` o `brownfield` y emite un estado canónico, pero
ninguna superficie lo consume. Prompt 00 y Prompt 01 siguen en orden fijo: no leen la ruta, no registran la
decisión y no describen relevo entre chats ni recuperación. La persona debe deducir por sí misma qué ruta le
corresponde y en qué orden pegar cada prompt, justo en el momento en que menos contexto tiene.

El Issue #31 cierra ese hueco con un prompt router que lee la ruta decidida y conduce Prompt 00 y Prompt 01
sin duplicar responsabilidades ni perder gates humanos.

## What Changes

- Añadir `PROMPT_ROUTER_INICIO` en la raíz y en el blueprint como única entrada del onboarding adaptativo.
- Ejecutar el clasificador read-only, mostrar ruta y evidencia, y registrar el estado solo tras aprobación
  humana explícita dentro del repositorio objetivo.
- Definir por ruta el orden de explicación: idea y organización para principiante, ecosistema para
  experimentado, inventario y preservación para brownfield. Las tres rutas terminan en discovery.
- Actualizar Prompt 00 para recibir ruta y estado sin pedir stack ni producto completo.
- Actualizar Prompt 01 para reutilizar ruta, respuestas confirmadas y decisiones abiertas.
- Documentar relevo entre chats, recuperación y el límite de reclasificar después del bootstrap.
- Registrar el router en el manifest, en los índices de documentación y en las comprobaciones de presencia,
  findability y fixture.
- Añadir un contrato verificable de prompts con pruebas de paridad raíz/blueprint y casos negativos.

## Capabilities

### New Capabilities

Ninguna capacidad nueva. El cambio no añade comandos, schemas ni API pública.

### Modified Capabilities

- `adaptive-onboarding`: añade el contrato de orquestación conversacional sobre el clasificador existente,
  el registro aprobado del estado, el relevo entre chats y la recuperación por ruta.

## Impact

- Documentación: `docs/prompts/`, `docs/README.md`, `docs/USER_GUIDE.md`, `docs/ONBOARDING_PLAN.md` y
  `docs/ADAPTIVE_ONBOARDING.md`.
- Blueprint y harness: nuevo archivo administrado, entrada de manifest, índice de ingeniería y README del
  entorno generado.
- Verificación: `scripts/check-docs.mjs`, `scripts/verify-fixture.mjs`, un contrato de prompts reutilizable y
  una suite de pruebas nueva.
- Runtime y API pública: sin cambios. El contrato del clasificador de #30 permanece intacto.
- Costo y licencia: cero. Solo documentación versionada y pruebas con módulos estándar de Node.

## Risks and Rollback

El riesgo principal es duplicar instrucciones y crear dos fuentes de verdad; el router delega y no repite el
contenido de cada etapa. Registrar el estado sin aprobación convertiría una decisión humana en un efecto
automático, por lo que el registro queda detrás de un gate visible. Después del bootstrap la evidencia cambia
y una reclasificación puede contradecir la ruta registrada: el límite se documenta y la ruta registrada no se
sobrescribe en silencio.

El rollback es revertir el commit. Retira el router, su entrada de manifest, las referencias y las pruebas, y
restaura Prompt 00 y Prompt 01 anteriores. Ningún estado ya registrado por una persona se borra ni se migra.
