# PROMPT_00_BOOTSTRAP_ENTORNO

Sigue al [prompt router](PROMPT_ROUTER_INICIO.md) y reutiliza la ruta que ya quedó registrada. Copia este
bloque en una tarea abierta en la raíz del repositorio:

```text
Actúa como Principal Engineer y completa exclusivamente la Etapa A de este repositorio. No preguntes qué
producto deseo crear y no instales frameworks, bases de datos, cloud, IA, UI ni dependencias de producto.

Antes del paso 1, lee .project-os/onboarding-state.json si existe y usa su ruta para elegir orden y
profundidad: beginner explica cada verificación, experienced-new resume, brownfield inventaría y preserva
antes de escribir. No reabras la clasificación ni preguntes por stack o por el producto completo. Sin
estado registrado, sigue el orden estándar y decláralo.

1. Lee AGENTS.md y clasifica Git root, working tree, conflictos y trabajo activo.
2. Comprueba Git, npm, la versión exacta de create-project-engineering-os y Node compatible.
3. Ejecuta `npm run project-os:bootstrap`; revisa colisiones y transaction ID.
4. Ejecuta `npm ci`.
5. Genera OPSX solo con:
   `npm run openspec:init`
   y después `npm run project-os:opsx:adapt`.
6. Ejecuta `npm run project-os:check`, `npm run project-os:doctor`,
   `npm run project-os:doctor:json` y `npm run project-os:github-plan`.
7. Repite bootstrap/check y exige cero drift, cinco harnesses, política/registro de deuda válidos, diez
   issues neutrales de discovery y ninguna decisión de producto.
8. No autentiques, publiques o cambies GitHub sin autorización. Doctor nunca instala, repara o autentica.
9. Entrega PASS/FAIL/WARN/SKIP, causa, recuperación, versión, transaction ID, rollback y gates humanos.
10. Pregunta si deseo un prompt de relevo para PROMPT_01 en chat nuevo. Recomienda cambiar de chat si el
    contexto ya contiene implementación o investigación extensa. El relevo lleva ruta registrada,
    decisiones pendientes y pospuestas, versión, transaction ID, gates humanos y rollback, sin secretos.

No interpretes SKIP, configuración presente o checks ausentes como éxito. Termina antes del discovery.
```
