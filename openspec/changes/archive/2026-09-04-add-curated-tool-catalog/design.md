## Context

`docs/ADAPTIVE_ONBOARDING.md` ya decidió qué herramientas son universales, cuáles condicionales y cuáles no
predeterminadas, y describió ocho pasos de investigación segura. Esa decisión es correcta y no se reabre
aquí. Lo que falta es una representación que una prueba pueda comprobar y que un consumidor pueda retirar
sin editar prosa.

El precedente está en el propio repositorio. `onboarding-plan` (#30) resolvió un problema de la misma forma:
un schema versionado, un estado canónico y un comando que solo lee. `github-plan` (#20) demostró además que
declarar una fuente inexistente es un fallo verificable, no una cuestión de estilo. Este cambio aplica esa
misma doctrina al catálogo de herramientas.

La restricción que domina el diseño es la asimetría entre describir y activar. Un registro que enumera
GitHub, Context7 y Playwright se puede leer como una recomendación por defecto. El contrato debe hacer
imposible esa lectura: describir no activa, y activar exige una decisión aprobada que este cambio no toma.

## Goals / Non-Goals

**Goals:**

- Hacer verificable por máquina la procedencia, la licencia, el costo, la auth, los datos, los permisos, el
  mantenimiento y el rollback de cada herramienta del catálogo.
- Impedir que un dato desconocido termine en un estado aprobado.
- Permitir evaluar una candidata sin escribir configuración ni descargar contenido remoto.
- Permitir retirar una entrada obsoleta sin romper el resto del catálogo ni el bootstrap.
- Dejar declarados allowlist, pinning, diff y receipt como insumos de una instalación futura.

**Non-Goals:**

- Instalar, descargar o ejecutar skills, servidores MCP o binarios.
- Activar por defecto cualquier proveedor del catálogo.
- Implementar autenticación, manejo de tokens o sesiones.
- Crear un marketplace o un índice remoto de descubrimiento.
- Implementar el planner y apply autorizado de trackers remotos, que permanece en #33.

## Decisions

### El registro vive en el blueprint y su schema en `schema/`

`schema/tool-catalog.schema.json` describe el contrato y se publica con el paquete, igual que
`onboarding-answers.schema.json` y `onboarding-state.schema.json`. La semilla
`blueprint/core/project-os/tool-catalog.json` acompaña a `skills.json` y `mcp.json`, que ya viven ahí y ya
son propiedad del consumidor tras el bootstrap.

Se descarta añadir los campos dentro de `skills.json` y `mcp.json`. Esos archivos describen qué está
instalado y activo en un repositorio concreto; el catálogo describe qué se puede considerar y por qué.
Mezclarlos haría que retirar una recomendación implicara tocar configuración activa.

### `additionalProperties` cerrado en toda la entrada

Cada objeto del schema cierra propiedades adicionales. Un campo libre reintroduciría prosa no verificable
por la puerta de atrás, que es exactamente el problema que este cambio resuelve.

### Cuatro estados, y el desconocimiento no es aprobable

Los estados son `universal`, `condicional`, `rechazado` y `pospuesto`. Licencia, costo y auth aceptan un
valor explícito `unknown`. El schema condiciona el estado: una entrada con cualquiera de esos tres en
`unknown` no puede declarar `universal` ni `condicional`, y el comando la resuelve como `pospuesto`.

Se descarta tratar el campo ausente como desconocido. Ausencia y desconocimiento declarado no significan lo
mismo: el primero es un error de contrato y el segundo es información. El schema exige el campo y acepta
`unknown` como valor, siguiendo la misma distinción que la matriz de compatibilidad ya hace entre
`not-verified` y un receipt.

### La procedencia se fija con owner y referencia exacta

Cada entrada declara `owner` y una referencia exacta: `commit`, `tag` o `version`. Una referencia flotante
como `latest` falla la validación. La entrada declara además `verifiedOn` con formato `YYYY-MM-DD` y la URL
de la fuente oficial consultada.

Se descarta aceptar solo la URL. Una URL sin referencia exacta no permite comprobar después qué se revisó,
que es el requisito que la sección de investigación segura ya exige en prosa.

### El comando solo lee y su salida es su única superficie

`project-os tool-catalog` acepta `list` y `evaluate`. Ninguno de los dos escribe archivos. `evaluate` recibe
la descripción de una candidata desde un archivo local ya presente y emite veredicto por stdout, con `--json`
para consumo por máquina.

Se descarta que `evaluate` acepte una URL. Descargar contenido para evaluarlo convertiría el comando en un
vector: el material investigado es dato no confiable, y la decisión de traerlo al disco pertenece a la
persona, no al comando. El flujo documentado sigue siendo revisar y traer manualmente antes de evaluar.

### `allowed-tools` se registra como señal, no como frontera

La especificación de Agent Skills marca `allowed-tools` como experimental. La entrada puede registrarlo como
señal informativa, y el contrato prohíbe derivar de él una frontera de permisos portable. Una prueba fija esa
prohibición.

### Las tres señales MCP permanecen independientes

`mcp.json` ya declara que configuración no es startup, startup no es listing y listing no es smoke
autenticado. El catálogo reusa esa separación en lugar de inventar otra: una entrada MCP permanece
`disabled` y registra las tres señales por separado, sin que ninguna satisfaga a otra.

### Sin secretos literales

Ningún campo acepta un literal de secreto. Solo se aceptan referencias a variables de entorno, con la misma
forma que `mcp.json` ya usa en `secretEnvRefs`. Una prueba negativa rechaza un literal.

## Risks / Trade-offs

- **Un registro puede leerse como recomendación.** Se mitiga manteniendo `servers: []`, `enabled: false` y
  exigiendo decisión aprobada para activar. El estado `universal` describe el núcleo ya instalado, no una
  invitación a instalar.
- **Las licencias y costos envejecen.** Se mitiga con `verifiedOn` obligatorio por entrada. Una entrada
  vencida no puede presentarse como vigente; el comando la reporta como tal.
- **El comando podría deslizarse hacia instalación.** Se mitiga con una prueba negativa que falla si el
  comando escribe fuera de su salida.
- **Investigar implica leer contenido potencialmente hostil.** Se mitiga tratando `SKILL.md`, scripts y
  recursos como datos y nunca como instrucciones, y exigiendo revisión completa antes de proponer.
- **Trade-off aceptado:** exigir referencia exacta y fecha por entrada encarece añadir una herramienta. Es
  deliberado: el costo cae sobre quien propone, no sobre quien hereda el catálogo.

## Migration Plan

El cambio es aditivo. No hay estado previo que migrar: no existe registro de herramientas hoy. Un
repositorio ya bootstrapeado recibe la semilla por `sync`, y `sync --check` la reporta como archivo nuevo
antes de escribir. Retirar una entrada es editar el registro; el resto del catálogo permanece válido.

## Open Questions

- Ninguna que bloquee la implementación. La activación autorizada de una entrada, su allowlist ejecutable y
  su receipt de instalación pertenecen a un cambio posterior, que reusará el modelo de autorización fijado
  aquí junto con el de #33.
