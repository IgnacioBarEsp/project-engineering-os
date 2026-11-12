# #204 — adoptar npm oficial, con identidad y recuperación

**Revisión8d335a2 aprobada; Apply en curso.** [Registro de aprobación](evidence/spec-approval.md).
La candidata aún no tiene verificación global, archivo, integración o release. Los resultados de
preflight descritos abajo conservan su alcance; no sustituyen esos gates.

npm **11.21.2** ya supera el bloqueo high/critical sin nuestro parche. Su tarball e inventario concuerdan,
los cuatro locks reales pasan en los tres Node soportados y las regresiones de Undici pasan.
[Índice de evidencia](evidence/manifest.json). Quedan **32 moderate** de glob/minimatch visibles bajo la
política actual; no se solicita una excepción.

## Qué se propone

- Incluir **el npm oficial intacto 11.21.2** en una candidata Companion **0.3.7**: lock de la app, catálogo,
  avisos y hashes de distribución. No cambiar el core, OpenSpec 1.6.0, Node, otros paquetes o protecciones.
- Separar identidad, slot y selección: canal oficial/derivado, versión, fuente, árbol completo y receta
  cuando corresponda. Solo estará habilitado inicialmente el oficial verificado. Ningún recibo, ruta del
  renderer o versión vulnerable podrá autorizar un cambio.
- Preparar el destino, verificarlo y confirmar la selección con generación esperada y readback durable.
  Fallo, cancelación o selección obsoleta conservan la anterior; conservar un slot no permite ejecutarlo
  si está alterado o es vulnerable. Los proyectos y el historial se conservan.
- Verificar el instalador y la recuperación reales, licencias, recursos, nueva revisión independiente,
  deuda y archivo. Los ensayos actuales de copia aislada no son ese instalador ni un cambio real entre
  dos canales aptos.
- Integrar por **un PR protegido que incluya también los bytes de #214 ya aprobados**, sin ampliarlos.
  Así raíz/blueprint y Companion se verifican en el mismo head. #215 se conserva hasta que exista una
  sustitución realmente integrada; no se mezcla este trabajo en #207.

El mantenimiento propio será del selector/recibos, **no de un fork de npm**. No se habilita automáticamente
una futura versión o derivado: cada nueva identidad pasa los mismos gates y su acuerdo de adopción.

## Evidencia obtenida y límites

- Auditor independiente: **0 high/critical, 32 moderate**, sin excepciones.
- Fuente oficial: **1944 archivos, 12296462 bytes**, sin diff; **144 paquetes** auditados y 40 markers
  de módulo/build atribuidos a esos paquetes.
- **12/12** instalaciones reales: ingeniería y tres stacks en Node 22.22.0/24.18.0/24.20.0.
- **58/58** regresiones de Undici en cada runtime, con seis fuentes iguales al commit upstream fijado.
- Scripts/bin-links/workspaces/config, edad mínima y fallos de red/integridad comprobados.
- Dos ZIP idénticos; instalación/reparación en copia del runtime real y crash fail-closed comprobados.
  La recuperación automática del crash y el selector durable de producción **no están implementados**.
- Recursos medidos en un workload pareado; no es un benchmark estadístico ni un presupuesto aprobado.

DoR nuevo **13/13, cero excepciones**, antes del scaffold OpenSpec local fijo **1.6.0**.
La receta derivada rechazada conserva **4/4 consumidas, cero restantes**; no habrá quinto parche.
Esta propuesta no archiva una investigación incompleta ni cierra #204/ola 3.

[Propuesta](proposal.md) · [Diseño exacto y fronteras](design.md) ·
[Requisitos](specs/companion-environment/spec.md) · [Tareas](tasks.md) ·
[Baseline](brownfield-baseline.md)
