# Revisión adversarial

**Alcance:** Issue #23 y change `research-adaptive-onboarding`.

**Fuentes:** proposal, design, delta spec, tasks, diff contra `origin/main`, Prompt 00/01, manifests de
harnesses/skills/MCP, fuentes oficiales y recorridos en papel.

## Alineación spec/tareas

- Las tres rutas tienen señal, orden, explicación, gate y recorrido completo.
- La política conserva tracker existente y limita GitHub Projects al contexto declarado.
- Plan local, autorización, apply, verificación, fallo, guía manual y rollback son estados distintos.
- La matriz separa capacidad oficial, soporte actual y objetivo; los gaps externos quedaron en #32.
- El catálogo cubre licencia/costo, auth, datos, rollback y decisión.
- CI/CD, MVVM y arquitectura permanecen después del discovery.
- #30-#34 separan clasificador, prompts, adapters, tracker e investigación segura.

## Hallazgos

| Severidad | Área | Hallazgo | Evidencia | Resolución |
| --- | --- | --- | --- | --- |
| Minor | Trazabilidad | La primera versión nombraba los manifests actuales sin enlace navegable. | Revisión desde docs/README | Se añadieron enlaces relativos a harness, skills y MCP. |
| Minor | Costos | Un precio SaaS fijado en el documento quedaría obsoleto. | GitHub, Microsoft, Atlassian y Context7 cambian planes | El catálogo declara postura del core y exige revalidar plan/términos al activar. |
| Pregunta | Adapters | Azure Boards y Jira no tienen todavía contrato de apply elegido. | El spike no implementa integraciones | #33 exige adapter, scopes, receipt e idempotencia antes de soporte. |

## Casos negativos revisados

- **Principiante sobre brownfield:** la evidencia del repo fuerza preservación y evita rebootstrap ciego.
- **Sin tracker ni GitHub:** posponer es válido; GitHub Projects no se recomienda por inercia.
- **Aprobación antigua:** no puede reutilizarse para ampliar scopes u otra operación.
- **Apply parcial:** el receipt limita rollback; cambios ajenos requieren reconciliación.
- **Skill maliciosa:** investigar no instala; se revisan scripts, red, secretos y procedencia fijada.
- **MCP configurado pero roto:** startup/listing/smoke permanecen señales distintas.
- **Proveedor cambia capacidades:** la fecha y fuente no elevan la matriz sin adapter y fixture.
- **Antigravity parece compatible:** continúa unsupported hasta cumplir el mismo contrato que los cinco
  agentes actuales.
- **Proyecto pequeño:** puede posponer tracker/arquitectura; no se obliga MVVM o CI/CD de producto.

## Veredicto

**PASS.** Cero Blockers y cero Majors. Dos Minors quedaron corregidos; la pregunta de adapters está trazada
en #33 y no bloquea un spike documental. Es aconsejable continuar con readiness y archive.
