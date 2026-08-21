# Guía del usuario

Esta es la ruta completa para quien quiere usar Project Engineering OS sin aprender todo el sistema de una
vez. Avanza por etapas: prepara el entorno, descubre el producto, decide la arquitectura y recién entonces
empieza a construir.

**Úsala si:** acabas de crear la carpeta del proyecto o necesitas saber qué viene después del bootstrap.

## Antes de la Etapa A: clasifica la carpeta

Desde `0.2.0`, `onboarding-plan` distingue una carpeta nueva de un repositorio que debe preservarse. No
instala nada ni modifica archivos:

```sh
node ./bin/project-os.mjs onboarding-plan --target .
```

Consulta la [guía del clasificador](ONBOARDING_PLAN.md) para responder sus cinco preguntas o usar JSON. En
`0.1.6` este comando no existe y el recorrido empieza directamente en la Etapa A.

El [prompt router](prompts/PROMPT_ROUTER_INICIO.md) es el primer prompt del recorrido: ejecuta esa
clasificación, registra la ruta con tu aprobación en `.project-os/onboarding-state.json` y decide el orden
de las etapas siguientes. La ruta `beginner` empieza por idea y organización, `experienced-new` por
ecosistema y `brownfield` por inventario y preservación. Las tres terminan en discovery.

## Etapa A: núcleo universal

Ejecuta el quickstart del README en un repositorio Git vacío o revisa `bootstrap --dry-run` en uno
existente. Esta etapa instala gobernanza y tooling; no pregunta qué producto deseas crear.

Comprueba:

1. `npm run project-os:check`;
2. `npm run project-os:doctor`;
3. segundo `project-os sync --check` sin drift;
4. OPSX local generado por OpenSpec y estabilizado por `project-os opsx-adapt`;
5. política de deuda y paquete de discovery presentes;
6. gates humanos todavía pendientes, claramente declarados.

Usa el [Prompt 00](prompts/PROMPT_00_BOOTSTRAP_ENTORNO.md) para guiar a un agente.

## Etapa B: discovery

Solo después de aprobar Etapa A, usa el [Prompt 01](prompts/PROMPT_01_DISCOVERY_PROYECTO.md). La
entrevista comienza por problema, usuarios, resultados y restricciones; el stack se compara después.

## Etapa C: perfil técnico

Una decisión versionada activa únicamente los perfiles necesarios. Frameworks, bases de datos, cloud,
IA, UI, offline/sync o testing visual se instalan mediante un change SDD posterior.

## Etapa D: producto

Crea visión, glosario/DDD estratégico cuando aporte valor, plan maestro, epic y solo issues de la ola
activa y siguiente. La primera entrega vertical recorre el ciclo SDD completo.

## Operación diaria

- `project-os sync --check` detecta drift sin escribir.
- `project-os doctor --json` entrega evidencia machine-readable.
- `project-os onboarding-plan --json` propone una ruta sin escribir ni contactar servicios remotos.
- `project-os debt check` evalúa presupuesto y pausas sin mutar.
- `project-os upgrade --check` compara una release destino explícita.
- [Recuperación](RECOVERY.md) explica transacciones y rollback.

## Siguiente paso

Si todavía no clasificaste la carpeta, copia el [Prompt router](prompts/PROMPT_ROUTER_INICIO.md). Si la ruta
ya está registrada y el entorno no, copia el [Prompt 00](prompts/PROMPT_00_BOOTSTRAP_ENTORNO.md). Si la
Etapa A ya fue aprobada, continúa con el [Prompt 01](prompts/PROMPT_01_DISCOVERY_PROYECTO.md).
