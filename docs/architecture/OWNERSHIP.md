# Ownership model

Este mapa evita una pregunta peligrosa: “¿puede el constructor sobrescribir este archivo?”. Cada superficie
tiene un owner y una ruta de actualización distinta.

**Úsalo si:** un bootstrap/upgrade reporta colisión o necesitas decidir dónde proponer un cambio.

| Surface | Owner | Update path |
| --- | --- | --- |
| CLI, schemas, blueprint, tests and public docs | Upstream | Issue, SDD change, protected PR and release |
| Companion app and its preparation engine (`apps/companion`) | Upstream app | Separate app package and release; never seeded or bundled as a core CLI dependency |
| Generated OPSX workflows | OpenSpec CLI | Exact local OpenSpec version and official update command |
| Constructor-managed files | Upstream release | `upgrade --check`, reviewed transaction, optional PR |
| Seed-once debt policy | Consumer | Consumer decision and local SDD flow |
| Human overlays and product code | Consumer | Consumer workflow |
| Public landing page (`site/`) | Upstream | Repository-only; it is in the export allowlist but not in the published package, so it never reaches a consumer project or the npm tarball. `site/NOTAS.md` is the brief behind the page and is exported with it; the preparation artifacts under `site/.project-os/` are not tracked |
| Debt assessments and registry | Consumer evidence | `project-os debt capture/sync`; never overwritten by rollback |

The upstream never chooses a consumer's product license, stack, cloud, database, UI framework or domain.
Consumer acceptance specs may pin expected behavior, but runtime evolution starts upstream.

Una semilla preexistente cuyo owner sea `project` puede [adoptarse mediante ruta y hash revisados](../EXISTING_PROJECTS.md).
La adopción registra ownership sin escribir sus bytes ni activar dependencias; los archivos del constructor,
overlays y OpenSpec conservan sus límites. La [decisión de biblioteca y CLI](LIBRARY_CLI_DECISION.md) documenta
compatibilidad, distribución y recuperación para este contrato.

Para adoptar una nueva versión sin saltar estos límites, consulta
[upstream y consumidores](../UPSTREAM_CONSUMERS.md). Para volver al índice, abre
[documentación](../README.md).
