## Context

`github-plan` recibe el blueprint del paquete y un target. Hoy busca dos rutas consumidoras; si no existen,
usa contenido del blueprint pero conserva la ruta solicitada como `source`. El upstream posee una tercera
fuente, `.project-os/repository-governance.json`, que coincide con Project 3 pero el comando la ignora.

El runtime debe seguir siendo universal y read-only. La gobernanza del upstream y el entorno inicial de un
consumidor tienen propósitos distintos y no deben compartir taxonomía por accidente.

## Goals / Non-Goals

**Goals:**

- Reportar la ruta y procedencia reales de cada manifest principal.
- Resolver primero una fuente existente del target y solo después un seed equivalente.
- Representar los recursos de la gobernanza upstream sin discovery ficticio.
- Preservar el comportamiento bootstrapeado de consumidores.
- Mantener una rama verificable de fuente ausente para declaraciones personalizadas.

**Non-Goals:**

- Mutar GitHub, autenticar o inferir estado remoto.
- Unificar los estados del upstream y del blueprint consumidor.
- Migrar repositorios ya creados o labels remotos.
- Implementar la adaptación de tableros del Issue #23.

## Decisions

### La precedencia por defecto incluye la gobernanza upstream

Sin `githubPlan.source` explícito, el runtime probará `repository-governance.json`, `product-os.json` y el
alias legacy `project.json`. Un consumidor no posee la primera ruta, así que conserva su flujo. Se descarta
detectar el upstream por package name o remote porque ambos son más frágiles que una fuente versionada.

### La lectura devuelve payload y procedencia

La función de lectura devolverá `kind`, ruta solicitada y ruta resuelta. `source` usará la ruta resuelta y
el JSON conservará un objeto `provenance`. El texto imprimirá `Procedencia`. Se descarta conservar el valor
falso por compatibilidad: documentar una ruta no leída viola el contrato de evidencia.

### Los shapes se normalizan sin duplicar taxonomías

Statuses se aceptan en raíz o dentro de `project`; objetos singleton como project, ruleset, tags y release
environment se convierten en listas de recursos. El manifest upstream declara `discoveryIssues: []`; el
consumidor sin esa clave conserva el archivo de discovery del seed.

### La fuente ausente conserva semántica estricta

Si un manifest declara una ruta personalizada que no existe ni tiene seed equivalente, el comando falla
con `GITHUB_PLAN_SOURCE_MISSING`. El caso deja de ser una rama teórica mediante una prueba negativa.

## Risks / Trade-offs

- [Un parser esperaba el `source` incorrecto] → `provenance.requestedSource` conserva la intención y docs
  explican la corrección.
- [Un payload declara shapes incompatibles] → normalizadores fallan con `GITHUB_PLAN_SCHEMA`.
- [El upstream vuelve a omitir discoveryIssues] → el test exige cero y detecta el fallback consumidor.
- [Divergencia remota posterior] → el estado sigue `not-verified`; comparación remota permanece manual.

## Migration Plan

1. Añadir contrato y pruebas target/seed/missing.
2. Actualizar manifest upstream y documentación.
3. Validar salida real y comparar Project 3 read-only.
4. Ejecutar suite, pack, revisión, deuda y archive.

Rollback por revert completo. No hay datos, dependencias ni recursos remotos que restaurar.

## Open Questions

Ninguna. La adaptación futura de proveedores y tableros pertenece al Issue #23.
