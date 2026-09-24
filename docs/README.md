# Documentación del núcleo

El paquete npm instala el núcleo universal, su CLI y el blueprint para repositorios consumidores; no
instala Companion ni su documentación. Esta guía reúne lo necesario para usar y mantener ese núcleo.

## Instalar y usar el núcleo

- [Guía CLI](CLI_GUIDE.md): inicio, adopción de carpetas y flujo de trabajo por terminal.
- [Adopción de proyectos existentes](EXISTING_PROJECTS.md): conservar archivos y ownership.
- [Herramientas separadas del producto](ISOLATED_TOOLCHAIN.md): instalar la toolchain fuera del manifiesto
  del producto.
- [Guía manual](GUIA_MANUAL_USUARIO.md): decisiones que no se automatizan sin consentimiento.
- [Onboarding plan](ONBOARDING_PLAN.md): clasificar una carpeta sin escribir.
- [Prompts de preparación](prompts/PROMPT_ROUTER_INICIO.md): router, bootstrap y descubrimiento.
- [Recuperación](RECOVERY.md): retomar o revertir operaciones interrumpidas.

## Entender y mantener el núcleo

- [Mapa del repositorio y del tarball](REPOSITORY_MAP.md): ownership y límites de distribución.
- [Ownership](architecture/OWNERSHIP.md) y [versionado](architecture/VERSIONING.md).
- [Compatibilidad](COMPATIBILITY.md), [reglas por carpeta](PATH_RULES.md) y
  [catálogo de herramientas](TOOL_CATALOG.md).
- [Debt Control Loop](DEBT_CONTROL.md), [Project OS remoto](PROJECT_OS.md) y
  [autoaplicación upstream](SELF_APPLICATION.md).
- [Política de instalación](INSTALL_HARDENING.md), [costos y licencias](COSTS_AND_LICENSES.md) y
  [triage de cadena de suministro](security/SUPPLY_CHAIN_TRIAGE_2026-08-18.md).
- [ADRs](adr/0001-public-distribution.md): distribución y decisiones sobre package managers.

El índice completo del repositorio y las guías de Companion permanecen en
[GitHub](https://github.com/IgnacioBarEsp/project-engineering-os/tree/main/docs); no forman parte del
tarball npm.

Vuelve al [README principal](../README.md) para los comandos de inicio y la información del proyecto.
