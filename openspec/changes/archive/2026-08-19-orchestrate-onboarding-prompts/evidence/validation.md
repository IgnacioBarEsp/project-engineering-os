# Evidencia de validación

## Suite del paquete

- `npm run check`: PASS, encadenando `check:package`, `check:neutrality`, `check:docs`, `check:workflows` y
  `npm test`.
- `check:package`: PASS, contrato `create-project-engineering-os@0.1.6` y par sembrado sincronizado.
- `check:neutrality`: PASS, árbol público neutral y allowlist de export sin hallazgos.
- `check:docs`: PASS, 22 enlaces relativos del README y contrato de prompts verificado.
- `check:workflows`: PASS, 3 workflows.
- `npm test`: PASS, 173/173 pruebas, de las cuales 9 son nuevas en `test/prompts.test.mjs`.

## Contrato de prompts

`scripts/prompt-contract.mjs` deriva rutas y preguntas del runtime (`ONBOARDING_ROUTES` y
`ONBOARDING_QUESTIONS`), por lo que una ruta o pregunta nueva en el clasificador rompe el contrato del
router antes de que la documentación pueda quedar desactualizada.

Casos positivos:

- router raíz y router del blueprint cumplen el contrato completo;
- paridad de preguntas, rutas, orden por ruta, referencias y marcadores sin igualdad byte a byte;
- Prompt 00 y Prompt 01, en raíz y blueprint, declaran el consumo del estado registrado;
- el manifest publica el router como archivo administrado y su fuente existe.

Casos negativos que deben fallar y fallan:

- ruta eliminada (`missing-route brownfield`);
- sexta pregunta de clasificación añadida;
- gate humano perdido (`missing-marker aprobación humana`);
- referencia perdida a Prompt 01;
- ruta que termina antes de discovery;
- instrucciones de etapa duplicadas dentro del router (`npm ci`, `npm run project-os:check`);
- paridad rota cuando solo una versión cambia el orden de una ruta;
- Prompt 01 que entrevista desde cero;
- tipo de prompt desconocido.

## Empaquetado y bootstrap

- `npm run pack:verify`: PASS. Tarball `create-project-engineering-os-0.1.6.tgz`, 247 437 bytes,
  sha256 `d4ec5234fcfed9cf085f3e2f2aecef06a09f35967a568849516819bd593ed048`, instalado y probado.
- `npm run fixture`: PASS. Bootstrap desde el tarball verificado crea 76 archivos con 0 colisiones, el
  segundo run no produce drift y `sync --check`, `opsx-check` y `doctor --json` terminan en 0.
- Findability de la fixture: 9 documentos esperados alcanzables en dos saltos o menos desde `README.md` o
  `AGENTS.md`, 0 faltantes. El noveno es `docs/engineering/PROMPT_ROUTER_INICIO.md`.

## OpenSpec

Ejecutado con la CLI local fijada 1.6.0 dentro de un consumidor bootstrapeado:

- `openspec validate orchestrate-onboarding-prompts --strict --no-interactive`: PASS.
- `openspec validate --all --strict --no-interactive`: PASS, 8/8 items.

## Recorrido ejecutado de las tres rutas

Cada escenario reproduce los pasos 1 a 3 del router en una carpeta Git real: clasificar sin `--answers`,
guardar respuestas, repetir con `--answers` y registrar el estado aprobado.

| Escenario | Paso 1 | Paso 2 | Paso 3 | Estado reproducido | Rebootstrap |
| --- | --- | --- | --- | --- | --- |
| Carpeta nueva con explicación guiada | `beginner` | `beginner` provisional | `beginner` | sí | permitido |
| Carpeta nueva con ruta breve | `beginner` | `experienced-new` confirmado | `experienced-new` | sí | permitido |
| Carpeta con AGENTS.md y código | `brownfield` | `brownfield` provisional | `brownfield` | sí | prohibido |
| Sin respuestas | `beginner` | `beginner` provisional | `beginner` | sí | permitido |

En los cuatro escenarios la carpeta permanece byte por byte igual durante el paso 1, el plan declara
`mutationPerformed=false` y `remote.status=not-contacted`, y el estado registrado se vuelve a derivar
idéntico. Escribir `.project-os/onboarding-state.json` y `onboarding-answers.json` no convierte una carpeta
nueva en `brownfield`: ambos entran por bandera o por ruta ignorada.

## Límite declarado y verificado

En un repositorio ya bootstrapeado, `onboarding-plan` reporta `brownfield` con 9 evidencias y
`rebootstrapAllowed=false`. Ese resultado describe el repositorio actual y no reemplaza la ruta registrada:
el router y los dos prompts lo declaran de forma explícita.
