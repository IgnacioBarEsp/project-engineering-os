# Clasificar el inicio sin tocar el proyecto

`onboarding-plan` revisa una carpeta y propone una ruta antes del bootstrap. Sirve para no tratar igual una
idea nueva y un repositorio que ya tiene código, automatización o reglas propias.

**Estado:** disponible desde `0.2.0`. La versión npm `0.1.6` no incluye este comando.

## Uso corto

En un checkout del repositorio:

```sh
node ./bin/project-os.mjs onboarding-plan --target .
node ./bin/project-os.mjs onboarding-plan --target . --json
```

Después de su publicación también estará disponible como:

```sh
project-os onboarding-plan --target .
```

El comando no escribe archivos, no autentica cuentas y no consulta servicios remotos. La salida explica la
ruta, la evidencia encontrada, las preguntas pendientes y los próximos pasos.

## Las cinco respuestas

Puedes guardar respuestas parciales o completas en un JSON dentro del proyecto:

```json
{
  "schemaVersion": "1.0.0",
  "project": "new",
  "guidance": "guided",
  "tracker": "defer",
  "agent": "codex",
  "remoteSetup": "local-only"
}
```

```sh
project-os onboarding-plan --target . --answers onboarding-answers.json --json
```

| Campo | Valores principales | También acepta |
| --- | --- | --- |
| `project` | `new`, `preserve` | `unknown`, `defer` |
| `guidance` | `guided`, `brief` | `unknown`, `defer` |
| `tracker` | `existing`, `github-projects`, `azure-boards`, `jira`, `other`, `none` | `unknown`, `defer` |
| `agent` | `claude`, `codex`, `cursor`, `copilot`, `opencode`, `other` | `unknown`, `defer` |
| `remoteSetup` | `local-only`, `review-later` | `unknown`, `defer` |

Un campo ausente se convierte en `unknown`; la pregunta queda pendiente. `defer` registra que la decisión se
pospuso. Un sexto campo o un valor libre falla con una recuperación clara.

## Cómo elige la ruta

| Ruta | Cuándo aparece | Primera prioridad |
| --- | --- | --- |
| `beginner` | Carpeta nueva y explicación guiada, desconocida o pospuesta | Entender el sistema y preparar solo el entorno local |
| `experienced-new` | Carpeta nueva con `guidance=brief` | Revisar restricciones y avanzar sin una explicación extensa |
| `brownfield` | Hay trabajo existente o `project=preserve` | Inventariar, conservar y cubrir únicamente gaps confirmados |

La evidencia gana sobre la autopercepción. Si hay historial, cambios, código, documentación, harnesses,
tracker, automatización o una inspección incompleta, la ruta es `brownfield` y el plan prohíbe rebootstrap
ciego.

## Estado anterior y migración

Si existe `.project-os/onboarding-state.json`, el comando lo lee como input. También puedes indicar otro:

```sh
project-os onboarding-plan --target . --state decisiones/onboarding.json --json
```

El estado v1 conserva ruta, evidencia, respuestas, decisiones pendientes/pospuestas, próximos pasos y un
fingerprint estable. Un draft v0 soportado se migra solo en memoria y produce un receipt. El archivo fuente
no cambia: para rollback basta con descartar la salida nueva y conservarlo. Estados futuros o corruptos se
rechazan antes de clasificar.

## Privacidad y límites

- Recorre como máximo cuatro niveles y 2,000 entradas.
- Omite dependencias, caches, outputs, vendors y metadata interna de Git.
- No sigue symlinks; los deja visibles como inspección incompleta.
- Solo emite IDs y rutas relativas. No devuelve contenido de archivos.
- Reduce el remoto Git a `github`, `azure-repos`, `gitlab`, `bitbucket` u `other`; nunca imprime su URL.
- Usa Git local sin shell para comprobar historial, dirty state y proveedor; no ejecuta red ni hooks.

Si el límite o un permiso impide demostrar que la carpeta está vacía, el plan elige preservación. Es más
seguro revisar de más que autorizar un bootstrap destructivo.

## Quién registra el estado

El comando sigue siendo read-only: no escribe el estado por su cuenta, no configura tableros y no instala
skills o MCP. Quien lo registra es el [prompt router](prompts/PROMPT_ROUTER_INICIO.md), y solo después de una
aprobación humana explícita. El comando vuelve a leer ese archivo y valida su canonicalidad antes de
reutilizar sus respuestas.

Una ejecución posterior al bootstrap encontrará los archivos administrados y elegirá `brownfield`. Ese
resultado describe el repositorio actual y no reemplaza la ruta registrada del recorrido.

Las operaciones remotas siguen en el
[Issue #33](https://github.com/IgnacioBarEsp/project-engineering-os/issues/33) y los adapters por agente en
el [Issue #32](https://github.com/IgnacioBarEsp/project-engineering-os/issues/32).

La visión completa, alternativas y amenazas están en la
[decisión de onboarding adaptativo](ADAPTIVE_ONBOARDING.md).
