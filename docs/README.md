# Documentación de Project Engineering OS

No necesitas leer todo para empezar. Elige la ruta que coincide con lo que quieres hacer y profundiza solo
cuando lo necesites.

## Quiero crear mi primer proyecto

1. [Guía del usuario](USER_GUIDE.md): entiende las cuatro etapas y llega desde una carpeta vacía hasta el
   primer cambio de producto.
2. [Prompt 00](prompts/PROMPT_00_BOOTSTRAP_ENTORNO.md): deja que tu agente prepare y verifique el entorno.
3. [Guía manual](GUIA_MANUAL_USUARIO.md): identifica las decisiones que requieren tu autorización.
4. [Prompt 01](prompts/PROMPT_01_DISCOVERY_PROYECTO.md): descubre problema, usuarios y restricciones antes
   de elegir tecnología.

## Quiero entender cómo se gobierna el trabajo

- [Project OS remoto](PROJECT_OS.md): estados, labels, protección y gates de GitHub.
- [Debt Control Loop](DEBT_CONTROL.md): cuándo un hallazgo se convierte en deuda y qué puede pausar.
- [Ownership](architecture/OWNERSHIP.md): qué pertenece al upstream, al consumidor o a OpenSpec.
- [Upstream y consumidores](UPSTREAM_CONSUMERS.md): cómo proponer cambios sin editar copias del runtime.

## Algo falló o necesito volver atrás

- [Recuperación](RECOVERY.md): reanudar una transacción, ejecutar rollback o recuperar un PR incompleto.
- [Compatibilidad](COMPATIBILITY.md): sistemas, versiones de Node y degradaciones por agente.

## Mantengo o publico el paquete

- [Versionado y migraciones](architecture/VERSIONING.md): cuándo usar patch, minor o major.
- [Releases](RELEASES.md): tarball único, checksum, GitHub Release y npm provenance.
- [Costos, licencias y lock-in](COSTS_AND_LICENSES.md): decisiones que deben revisarse antes de extender.
- [ADR 0001](adr/0001-public-distribution.md): por qué runtime y motor de deuda viven en un paquete público.

## Referencias rápidas

| Necesidad | Documento |
| --- | --- |
| Empezar sin conocer SDD | [Guía del usuario](USER_GUIDE.md) |
| Copiar el primer prompt | [Prompt 00](prompts/PROMPT_00_BOOTSTRAP_ENTORNO.md) |
| Elegir tecnología | [Prompt 01](prompts/PROMPT_01_DISCOVERY_PROYECTO.md) |
| Resolver drift o una ejecución interrumpida | [Recuperación](RECOVERY.md) |
| Saber qué puede hacer cada agente | [Compatibilidad](COMPATIBILITY.md) |
| Entender pausas por deuda | [Debt Control Loop](DEBT_CONTROL.md) |

Vuelve al [README principal](../README.md) para el recorrido corto y los comandos de inicio.
