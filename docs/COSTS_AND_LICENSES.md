# Costos, licencias y lock-in

El núcleo parte de costo cero, pero una extensión puede introducir términos, mantenimiento o dependencia
operativa. Esta guía enumera qué revisar antes de aprobarla.

**Úsala si:** vas a añadir una herramienta, servicio, fuente, integración, skill, MCP o proveedor.

El paquete tiene licencia MIT. AJV se usa en desarrollo bajo MIT; OpenSpec se instala fijado en el
proyecto consumidor y conserva su licencia. El inventario está en `THIRD_PARTY_NOTICES.md`.
El [triage de cadena de suministro](security/SUPPLY_CHAIN_TRIAGE_2026-08-18.md) distingue las dependencias
del paquete público de las que pertenecen a la plantilla consumidora y registra las alertas descartadas.

Git, Node y npm pueden usarse sin costo. GitHub y npm ofrecen capacidades públicas sin que este proyecto
compre servicios, pero sus términos, límites y políticas pueden cambiar. Trusted Publishing reduce tokens
persistentes y crea dependencia operativa en GitHub Actions/npm OIDC; el tarball y `SHA256SUMS` permiten
verificación independiente.

Ningún perfil de cloud, base de datos, IA, Figma o testing visual se activa por defecto. Antes de añadir
una dependencia, registra costo actual, licencia, mantenimiento, lock-in, alternativa y rollback.

El owner y la evidencia de esa decisión deben quedar en el issue/change. Las acciones que requieren una
persona están resumidas en la [guía manual](GUIA_MANUAL_USUARIO.md).
