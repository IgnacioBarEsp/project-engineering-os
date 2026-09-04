# Documentación de Project Engineering OS

No necesitas leer todo para empezar. Elige la ruta que coincide con lo que quieres hacer y profundiza solo
cuando lo necesites.

## Quiero crear mi primer proyecto

1. [Guía del usuario](USER_GUIDE.md): entiende las cuatro etapas y llega desde una carpeta vacía hasta el
   primer cambio de producto.
2. [Clasificador de onboarding](ONBOARDING_PLAN.md): inspecciona la carpeta y elige una ruta sin escribir.
3. [Prompt router](prompts/PROMPT_ROUTER_INICIO.md): registra la ruta y decide el orden de los dos prompts
   siguientes.
4. [Prompt 00](prompts/PROMPT_00_BOOTSTRAP_ENTORNO.md): deja que tu agente prepare y verifique el entorno.
5. [Guía manual](GUIA_MANUAL_USUARIO.md): identifica las decisiones que requieren tu autorización.
6. [Prompt 01](prompts/PROMPT_01_DISCOVERY_PROYECTO.md): descubre problema, usuarios y restricciones antes
   de elegir tecnología.

## Quiero entender cómo se gobierna el trabajo

- [Project OS remoto](PROJECT_OS.md): estados, labels, protección y gates de GitHub.
- [Decisión de onboarding adaptativo](ADAPTIVE_ONBOARDING.md): rutas por experiencia, tableros, skills, MCP,
  permisos, límites y desglose de implementación.
- [Contrato del clasificador](ONBOARDING_PLAN.md): comando, respuestas, estado, privacidad y migración.
- [Catálogo de herramientas](TOOL_CATALOG.md): estados, procedencia fijada y por qué investigar no instala.
- [Debt Control Loop](DEBT_CONTROL.md): cuándo un hallazgo se convierte en deuda y qué puede pausar.
- [Purpose de las capabilities](SPEC_PURPOSE.md): qué revisa el gate de specs publicadas y cómo se
  corrige.
- [Ownership](architecture/OWNERSHIP.md): qué pertenece al upstream, al consumidor o a OpenSpec.
- [Upstream y consumidores](UPSTREAM_CONSUMERS.md): cómo proponer cambios sin editar copias del runtime.
- [Autoaplicación del upstream](SELF_APPLICATION.md): qué partes de su propio sistema se aplica este
  repositorio a sí mismo, y por qué un FAIL del doctor sobre él no siempre es deuda.

## Algo falló o necesito volver atrás

- [Recuperación](RECOVERY.md): reanudar una transacción, ejecutar rollback o recuperar un PR incompleto.
- [Compatibilidad](COMPATIBILITY.md): sistemas, versiones de Node y degradaciones por agente.

## Mantengo o publico el paquete

- [Versionado y migraciones](architecture/VERSIONING.md): cuándo usar patch, minor o major.
- [Releases](RELEASES.md): tarball único, checksum, GitHub Release y npm provenance.
- [Costos, licencias y lock-in](COSTS_AND_LICENSES.md): decisiones que deben revisarse antes de extender.
- [Triage de cadena de suministro](security/SUPPLY_CHAIN_TRIAGE_2026-08-18.md): atribución y decisión por
  señal de Socket y npm audit.
- [ADR 0001](adr/0001-public-distribution.md): por qué runtime y motor de deuda viven en un paquete público.
- [ADR 0002](adr/0002-package-manager-supply-chain.md): por qué se conserva npm frente a pnpm y qué
  protege realmente cada gestor.

## Referencias rápidas

| Necesidad | Documento |
| --- | --- |
| Empezar sin conocer SDD | [Guía del usuario](USER_GUIDE.md) |
| Clasificar una carpeta sin escribir | [Onboarding plan](ONBOARDING_PLAN.md) |
| Copiar el primer prompt del recorrido | [Prompt router](prompts/PROMPT_ROUTER_INICIO.md) |
| Preparar y verificar el entorno | [Prompt 00](prompts/PROMPT_00_BOOTSTRAP_ENTORNO.md) |
| Elegir tecnología | [Prompt 01](prompts/PROMPT_01_DISCOVERY_PROYECTO.md) |
| Resolver drift o una ejecución interrumpida | [Recuperación](RECOVERY.md) |
| Saber qué puede hacer cada agente | [Compatibilidad](COMPATIBILITY.md) |
| Entender la visión de onboarding, trackers, skills y MCP | [Onboarding adaptativo](ADAPTIVE_ONBOARDING.md) |
| Evaluar una herramienta sin instalarla | [Catálogo de herramientas](TOOL_CATALOG.md) |
| Corregir un Purpose que dejó el archive | [Purpose de las capabilities](SPEC_PURPOSE.md) |
| Entender pausas por deuda | [Debt Control Loop](DEBT_CONTROL.md) |
| Saber qué protege cada gestor de paquetes | [ADR 0002](adr/0002-package-manager-supply-chain.md) |
| Saber si un FAIL sobre el upstream es deuda | [Autoaplicación](SELF_APPLICATION.md) |

Vuelve al [README principal](../README.md) para el recorrido corto y los comandos de inicio.
