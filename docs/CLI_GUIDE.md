# Usar el núcleo desde la terminal

Esta ruta es para quien quiere automatizar la preparación o trabajar sin la app de Windows.
Para usar Companion, empieza por su [guía visual en el repositorio](https://github.com/IgnacioBarEsp/project-engineering-os/blob/main/docs/USER_GUIDE.md).

## Carpeta nueva

Requisitos del núcleo 1.0.0: Git, npm y Node `^22.22.0 || ^24.18.0`; se recomienda Node 24 LTS. Para
migrar desde Node 20, consulta la [guía de compatibilidad](COMPATIBILITY.md#migrar-desde-node-20).

```sh
mkdir mi-proyecto
cd mi-proyecto
git init
npx --yes create-project-engineering-os@1.0.0 bootstrap --target .
npm ci
npm run openspec:init
npm run project-os:opsx:adapt
npm run project-os:check
npm run project-os:doctor
```

El bootstrap prepara el método de ingeniería; la elección de producto y tecnología viene después.
Los wrappers `openspec:*` usan telemetría apagada por defecto, salvo una elección explícita mediante
`OPENSPEC_TELEMETRY`. No cambian tu configuración global. Una invocación directa de OpenSpec tiene el
contrato upstream. Consulta [política de instalación](INSTALL_HARDENING.md).

## Carpeta existente

Trabaja desde una rama y un árbol limpio. Inspecciona antes de escribir:

```sh
npx --yes create-project-engineering-os@1.0.0 onboarding-plan --target .
npx --yes create-project-engineering-os@1.0.0 bootstrap --target . --dry-run
```

Revisa colisiones y ownership. Solo después de aceptar el plan ejecuta el bootstrap sin `--dry-run`.
Si ya tienes manifiesto o dependencias de producto, consulta [adopción de archivos](EXISTING_PROJECTS.md)
y [toolchain aislada](ISOLATED_TOOLCHAIN.md) antes de instalar paquetes.
No sustituyas un lockfile del producto por el del constructor.

## Del entorno al primer cambio

1. Usa el [prompt router](prompts/PROMPT_ROUTER_INICIO.md): clasifica la carpeta y registra la ruta aprobada.
2. Sigue [Prompt 00](prompts/PROMPT_00_BOOTSTRAP_ENTORNO.md) para preparar y comprobar el entorno.
3. Comprueba segunda ejecución sin diferencias, workflows oficiales de OpenSpec y controles del núcleo.
4. Resuelve las [decisiones manuales](GUIA_MANUAL_USUARIO.md) y aprueba el cierre del entorno.
5. Continúa con [Prompt 01](prompts/PROMPT_01_DISCOVERY_PROYECTO.md): problema, usuarios y restricciones.
6. Decide tecnología y activa solo los perfiles necesarios mediante su spec. Después implementa el
   primer cambio con evidencia y recuperación.

La clasificación distingue principiante, proyecto nuevo con experiencia y repositorio existente.
No asume que se pueda reemplazar el tracker ni las herramientas ya elegidas.

## Operación habitual

Estos comandos están disponibles como `project-os` cuando el paquete está en el PATH del entorno elegido:

```sh
project-os sync --target . --check
project-os doctor --target . --json
project-os onboarding-plan --target . --json
project-os readiness-check --phase propose --issue 123 --target .
project-os readiness-check --phase archive --change mi-change --target .
project-os debt check --root .
project-os upgrade --target . --check
project-os rollback --target . --transaction <id>
```

Sustituye issue, change e identificador de transacción por los de tu proyecto. Los checks no reparan,
instalan ni autentican. Rollback sí modifica archivos propios tras comparar hashes.
[Recuperación](RECOVERY.md) conserva el detalle de reanudación, reversión y conflictos.

## Resultados y códigos de salida

`sync --check` distingue tres resultados:

- `IN_SYNC` (`0`): el estado administrado coincide.
- `PROVENANCE_MISMATCH` (`0`): solo difiere `packageHash`; la versión, blueprint, configuración,
  perfiles activos y formato del estado coinciden. El CLI explica el origen distinto, informa el hash
  guardado y el observado, no propone operaciones y no escribe en el destino. No requiere reparación.
- `DRIFT` (`1`): existe deriva real en archivos, configuración u otro campo del estado. Revisa las
  operaciones y diferencias antes de decidir si aplicas `sync`.

La salida `--json` incluye `plan.stateChanges`, una lista con `field`, `saved` y `observed` para cada
campo de estado cambiado. La salida humana nombra los mismos campos y valores; no deja un `state=update`
sin explicar qué cambió.

Los códigos de salida del CLI son:

| Código | Significado |
| --- | --- |
| `0` | Éxito. Incluye `IN_SYNC` y el aviso no bloqueante `PROVENANCE_MISMATCH`. |
| `1` | Deriva real detectada por un check. |
| `2` | Argumentos, entrada o estado inválidos/incompatibles. |
| `3` | Fallo transaccional; inspecciona el journal y sigue [recuperación](RECOVERY.md). |

Por ello, `npm run project-os:check` continúa con sus otros checks ante un desajuste de procedencia y
sigue fallando cuando hay deriva real.

El upstream no debe bootstraperse sobre sí mismo: quien mantiene este repositorio sigue
[operación upstream](UPSTREAM_OPERATIONS.md) y [CONTRIBUTING en GitHub](https://github.com/IgnacioBarEsp/project-engineering-os/blob/main/CONTRIBUTING.md).

## Siguiente paso

Con el entorno comprobado, continúa con el prompt que corresponda a tu etapa.
La [matriz de compatibilidad](COMPATIBILITY.md) explica qué prepara cada agente y qué aún necesita
verificación en su entorno.
