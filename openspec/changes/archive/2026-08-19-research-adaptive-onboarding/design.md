## Context

Project Engineering OS ya instala dos puntos de entrada: Prompt 00 prepara un entorno neutral y Prompt 01
descubre producto, usuarios y restricciones. Sus manifiestos declaran cinco harnesses, tres skills
desactivadas hasta decisión explícita y un catálogo MCP vacío por defecto. Falta decidir cómo ordenar esas
piezas según experiencia y estado del repositorio.

El spike sirve a quien comienza sin vocabulario de ingeniería, a quien ya conoce su ecosistema y a quien
adopta el sistema en brownfield. También debe ser útil con Claude Code, Codex, Cursor, GitHub Copilot y
OpenCode sin confundir lo que el producto agente soporta hoy con lo que el constructor genera y valida.

Restricciones: núcleo neutral, costo cero, fuentes oficiales, ninguna instalación, secreto, autenticación o
mutación remota. La documentación pública es propiedad del upstream; los trackers y decisiones de producto
pertenecen al consumidor.

## Goals / Non-Goals

**Goals:**

- Elegir un clasificador breve y reversible para tres rutas de onboarding.
- Definir cuándo explicar organización y tableros sin imponer un proveedor.
- Fijar permisos, evidencia y rollback antes de cualquier automatización remota.
- Repartir responsabilidades entre CLI, skill, MCP, documentación e integración.
- Producir un backlog implementable con degradaciones y pruebas observables.

**Non-Goals:**

- Implementar el clasificador, modificar Prompt 00/01 o cambiar el runtime.
- Instalar herramientas o comprobar credenciales reales.
- Adoptar CI/CD, MVVM u otra arquitectura antes del discovery.
- Añadir Antigravity a la lista soportada.

## Decisions

### 1. Clasificación por evidencia antes que por autopercepción

El CLI deberá inspeccionar primero si existe Git, historial, código, instrucciones de agentes, tracker y
configuración. Después hará como máximo cinco preguntas breves sobre experiencia, proyecto y preferencias.
Un repositorio con evidencia siempre toma la ruta brownfield aunque la persona se considere principiante.

Alternativa descartada: preguntar solo “¿eres principiante?”. Es ambiguo y puede conducir a sobrescribir un
ecosistema existente.

### 2. Tres rutas, un mismo estado canónico

- Principiante: idea breve, explicación práctica del tablero, entorno y luego discovery.
- Experimentado con proyecto nuevo: entorno y decisiones operativas, luego discovery.
- Brownfield: inventario read-only, conservar lo válido, proponer únicamente huecos y luego discovery.

La conversación puede cambiar el orden, pero el CLI será el único escritor del plan local determinista y
registrará ruta, evidencia y decisiones pospuestas.

### 3. Tracker por continuidad, no por preferencia del agente

Se conserva el tracker existente. Sin tracker, GitHub Projects solo es default si el repo vive en GitHub y
el contexto no exige otra plataforma. Azure Boards y Jira se recomiendan cuando la organización ya opera
allí. “Posponer” es una decisión válida con razón y siguiente revisión.

### 4. Separación de superficies

- CLI: detección, plan, estado local, render y verificaciones repetibles.
- Skill: entrevista y procedimiento que solo se carga cuando aplica.
- MCP: contexto vivo o acciones contra servicios; nunca requisito universal.
- Documentación: conceptos, decisiones, recuperación y ruta manual.
- Integración remota: creación/configuración posterior a autorización granular.

La recomendación por defecto para browser QA y documentación es CLI + skill cuando exista una interfaz
determinista; MCP se reserva para sesiones exploratorias, estado persistente o APIs remotas.

### 5. Seguridad y reversibilidad antes de descubrimiento web

Investigar una skill no equivale a instalarla. Se registrarán origen, commit/versión, licencia, archivos,
scripts, herramientas permitidas, red, secretos, datos, costo, mantenimiento, compatibilidad y rollback. La
instalación requiere una decisión posterior y un diff inspeccionable. MCP empieza desactivado, con scopes
de lectura mínimos y smoke autenticado separado de configuración y tool listing.

### 6. Arquitectura y delivery después del discovery

CI/CD de producto, MVVM y otros patrones no son universales. Solo se proponen cuando plataforma,
distribución, equipo, riesgo, regulación y costo ya están documentados. El harness de ingeniería sí puede
incluir sus propios checks sin elegir la arquitectura del producto.

### 7. Compatibilidad objetivo por adaptadores comprobados

La matriz conservará dos verdades: capacidad oficial del agente y soporte actual del constructor. Una
capacidad oficial nueva no cambia automáticamente `native/generated/documented/unsupported`; hace falta un
adapter versionado y una prueba de fixture. Antigravity queda como candidato porque ya publica superficies
de AGENTS.md, skills y MCP, pero no entra hasta tener renderer, fixture y política de degradación.

## Risks / Trade-offs

- [La matriz envejece] → fecha y fuente por fila; revalidación al tocar el catálogo.
- [El onboarding se vuelve una entrevista larga] → máximo cinco preguntas de clasificación y explicación
  justo a tiempo; el discovery completo sigue separado.
- [Sobreautomatización remota] → preview/dry-run, resumen de cambios, autorización por operación, mínimo
  privilegio, receipt y rollback.
- [Prompt injection o supply chain en skills/MCP] → revisión estática, procedencia fijada, sin auto-install,
  allowlist de herramientas y smoke en entorno restringido.
- [Lock-in de tracker] → modelo canónico local y adaptadores; conservar el proveedor existente.
- [Falsa paridad entre agentes] → distinguir capacidad del proveedor, renderer y evidencia de runtime.
- [Más artefactos para proyectos pequeños] → ruta proporcional y posibilidad explícita de posponer.

## Migration Plan

Este cambio solo añade documentación. Se publica el decision record y se abren issues derivados. La futura
implementación deberá introducir primero el esquema local y el clasificador en modo plan/dry-run; después
adaptar prompts y harnesses; por último añadir integraciones remotas detrás de autorización.

Brownfield nunca se rebootstrappea a ciegas: genera inventario, diff y plan de preservación. El rollback de
este spike es revertir la documentación y cerrar el backlog derivado; el rollback futuro será remover los
adaptadores generados y restaurar el receipt anterior.

## Open Questions

- La cantidad exacta de preguntas se fijará con pruebas de usabilidad; el techo inicial es cinco.
- El formato del estado canónico y sus migraciones pertenece al issue de implementación del clasificador.
- La compatibilidad de Antigravity se reevalúa cuando exista fixture aislado y contrato oficial estable.
