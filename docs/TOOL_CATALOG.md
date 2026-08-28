# Catálogo curado de herramientas

Este documento describe el contrato ejecutable que decide **qué herramienta puede recomendarse y por qué**.
No instala nada, no activa proveedores y no autentica.

La decisión de fondo —qué es universal, qué es condicional y qué no entra por defecto— está en
[onboarding adaptativo](ADAPTIVE_ONBOARDING.md). Aquí vive la parte que una prueba puede comprobar.

## Qué resuelve

Antes, el catálogo era prosa. Una recomendación no se podía auditar, fechar ni retirar sin editar texto, y
nada impedía que una herramienta con licencia desconocida terminara presentada como aprobada.

Ahora cada herramienta es una entrada versionada en `.project-os/tool-catalog.json`, validada contra
`schema/tool-catalog.schema.json`.

## Los cuatro estados

| Estado | Significado |
| --- | --- |
| `universal` | Ya forma parte del núcleo instalado. No es una invitación a instalar algo nuevo. |
| `conditional` | Entra solo cuando se cumple la condición declarada en el campo `condition`. |
| `rejected` | Evaluada y descartada. `stateReason` explica por qué. |
| `postponed` | No se puede decidir todavía. `stateReason` explica qué falta. |

**Un dato desconocido nunca resuelve en un estado aprobado.** Si `license`, `cost` o `auth` declaran
`status: "unknown"`, la entrada no puede ser `universal` ni `conditional`; el schema lo rechaza y el comando
la resuelve como `postponed`.

La entrada sembrada `structural-code-intelligence` demuestra la regla: es una necesidad real sin proveedor
elegido, así que su licencia y su costo son desconocidos y permanece pospuesta.

## Ausencia no es lo mismo que desconocimiento

Omitir el campo `license` es un **error de contrato**. Declarar `license.status: "unknown"` es
**información**. El schema exige que el campo exista y acepta `unknown` como valor.

Es la misma distinción que la [matriz de compatibilidad](COMPATIBILITY.md) hace entre `not-verified` y un
receipt: no saber es un hecho que se declara, no un hueco que se deja.

## Procedencia fijada y fechada

Cada entrada aprobada declara `owner`, una referencia exacta, la URL oficial consultada y `verifiedOn`.

La referencia exacta admite tres formas y el schema comprueba su estructura:

| Tipo | Forma exigida | Ejemplo |
| --- | --- | --- |
| `commit` | 40 caracteres hexadecimales | `a1b2c3...` |
| `tag` | SemVer con `v` opcional | `v1.11.0` |
| `version` | SemVer exacto | `4.0.4` |

Una referencia flotante (`latest`, `main`, `HEAD`, `stable`) no encaja en ninguna de las tres y falla la
validación. Sin referencia exacta no se puede comprobar después qué se revisó.

`verifiedOn` se compara contra `freshnessWindowDays`. Una entrada vencida se reporta como tal en lugar de
presentarse como vigente.

## Investigar no es instalar

```sh
project-os tool-catalog list --target .
project-os tool-catalog evaluate --candidate candidates/mi-skill.json --target .
```

Ambas acciones son read-only. Su salida es su única superficie: no crean ni modifican configuración, no
descargan contenido y no ejecutan lo investigado.

**`evaluate` no acepta una URL.** Descargar material para evaluarlo convertiría un comando de lectura en un
vector de entrada de contenido no confiable. El material se revisa en su origen, se trae al repositorio bajo
criterio humano y se evalúa la copia local. El contenido investigado —`SKILL.md`, scripts, recursos— se
trata siempre como datos, nunca como instrucciones.

El procedimiento completo de revisión previa está en la sección de investigación segura de
[onboarding adaptativo](ADAPTIVE_ONBOARDING.md).

## Describir no es activar

Registrar una entrada no enciende nada:

- `servers` permanece vacío en `.project-os/mcp.json`;
- las skills permanecen en `enabled: false` en `.project-os/skills.json`;
- una entrada MCP conserva `enabled: false` en el catálogo.

La instalación autorizada, con allowlist ejecutable, pinning, diff y receipt, es un cambio separado que
todavía no existe. El catálogo deja declarados esos insumos; no los ejecuta.

## Las tres señales MCP siguen siendo independientes

El catálogo reusa la separación que `.project-os/mcp.json` ya establece: configuración no es startup,
startup no es listado de herramientas y listado no es smoke autenticado. Cada señal se registra por separado
como `not-verified` o como un receipt fechado. Ninguna satisface a otra.

## Señales experimentales

`allowed-tools` puede registrarse como señal informativa, porque la
[especificación Agent Skills](https://agentskills.io/specification) lo marca como experimental. El contrato
prohíbe derivar de él una frontera de permisos portable, y una prueba fija esa prohibición.

## Secretos

Ningún campo acepta un literal de credencial. Donde hace falta una, se declara el **nombre** de la variable
de entorno en `auth.secretEnvRefs`, con la misma forma que `.project-os/mcp.json` ya usa. Un literal es
rechazado, y el mensaje de rechazo no repite el valor.

## Retirar una entrada

Editar el registro y quitar la entrada es suficiente. El resto del catálogo permanece válido y `bootstrap`,
`sync --check`, `doctor` y la segunda ejecución sin drift no se ven afectados. Una recomendación obsoleta no
obliga a tocar configuración activa, porque el catálogo describe y no activa.

## Ownership

`.project-os/tool-catalog.json` pertenece al proyecto consumidor tras el bootstrap: puede añadir, retirar y
reevaluar entradas. El schema pertenece al upstream. Cada herramienta de terceros conserva su propia
licencia y sus términos, que el catálogo cita con fecha sin apropiárselos. Consulta el
[modelo de ownership](architecture/OWNERSHIP.md).

Vuelve al [índice de documentación](README.md).
