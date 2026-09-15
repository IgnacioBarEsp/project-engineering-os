# Qué hace cada pieza y por qué sigue aquí

La aplicación visual simplifica cómo empiezas. Por dentro siguen haciendo falta el motor, sus
herramientas y las pruebas que comprueban lo que promete. Este inventario, revisado el **14 de septiembre
de 2026**, separa esas funciones de los archivos históricos y las salidas locales.

## ¿Sigo necesitando npm, CLI y bootstrap?

| Pieza | Para qué sirve | Qué necesita saber quien usa Companion |
| --- | --- | --- |
| Companion | Elegir carpeta, revisar plan, preparar contexto y continuar con tu IA | Es la entrada principal; se instala una vez |
| Núcleo | Reglas, preparación de ingeniería, comprobaciones, deuda y recuperación | La app lo usa cuando corresponde al proyecto |
| CLI | Pedir esas operaciones desde scripts o terminal | Es una ruta opcional, no otro paso de instalación de la app |
| Bootstrap | Primera preparación del método en una carpeta | La app presenta el plan; no necesitas memorizar el comando |
| npm | Distribuir paquetes e instalar herramientas fijadas | Companion administra su copia; el contribuidor usa un cliente revisado |
| Node y Git | Ejecutar herramientas de ingeniería y conservar cambios | La app revisa las descargas aplicables, sin cambiar el PATH global |
| OpenSpec | Mantener spec y tareas antes de implementar | Forma parte del método para desarrollo; no se impone a una carpeta de documentos |

**Evidencia del vínculo:** [package.json de la app](../apps/companion/package.json) fija el núcleo;
[constructor-adapter](../apps/companion/engine/constructor-adapter.mjs) llama
`runBootstrapOrSync`; [environment](../apps/companion/runtime/environment.mjs) prepara herramientas;
[toolchain](../apps/companion/runtime/toolchain.mjs) usa el lock revisado en la carpeta administrada.
Retirar el núcleo o bootstrap rompería funciones que la app ya usa.

npm limita qué paquetes puede resolver; el catálogo de la app también limita deliberadamente qué puede
instalar de forma verificada. Hoy hay un conjunto pequeño de tecnologías opcionales, no un instalador de
cualquier SDK. Esa frontera está en [el entorno del Companion](companion/ENVIRONMENT.md).
Cambiar de gestor no añade soporte para Unity, Python o Flutter ni resuelve por sí solo licencias,
integridad o recuperación. Evaluar otra distribución requiere una necesidad y una migración comprobables.

## Archivos versionados

| Superficie | Owner y uso actual | Disposición |
| --- | --- | --- |
| `src/`, `bin/`, `schema/`, `blueprint/` | Núcleo upstream; API/CLI y archivos que se preparan para consumidores | Conservar; forman parte del paquete y sus contratos |
| `apps/companion/` | App upstream, dependencias y versión propias | Conservar fuera del núcleo universal |
| `test/`, `scripts/`, `.github/` | Pruebas, empaquetado y controles de publicación | Conservar; retirar solo con referencias y reemplazo probados |
| `docs/`, README y políticas raíz | Guías públicas y contratos del mantenedor | Actualizar rutas vigentes; historia identificada como historia |
| `openspec/specs/` | Comportamiento acordado | Mantener y sincronizar mediante OpenSpec |
| `openspec/changes/archive/`, `.project-os/debt/` | Historia de decisiones, evidencia y deuda | Conservar trazabilidad; antigüedad no demuestra que sobren |
| `site/index.html`, `site/NOTAS.md` | Landing publicada por `landing.yml` | Conservar hasta reemplazo verificado; consolidación #118 |
| Nueva landing, en repositorio separado | Producto consumidor y su propio SDD | No copiar aquí su `site/`, dependencias ni preparación |
| `package.json`, lockfiles, avisos de licencia | Identidad reproducible, dependencias y distribución | Conservar; cada paquete tiene función distinta |

El [modelo de ownership](architecture/OWNERSHIP.md) explica quién puede actualizar cada archivo.
Los archivos generados por OpenSpec se actualizan con su CLI oficial; no se editan como duplicados manuales.

## Salidas locales e información privada

El checkout contiene salidas ignoradas: `node_modules/`, `release/`, `apps/companion/dist/`,
`apps/companion/build/npm-dist.zip` y `site/.project-os/`. No están publicadas como source.
Algunas conservan ensayos anteriores o preparación local: comprobar su uso y su recuperación antes de
liberar espacio. La presencia de un directorio no autoriza borrarlo.

También existen documentos personales ignorados bajo `docs/`; no son documentación pública. No se
leyeron ni se incorporaron a esta revisión. Carpetas de otros proyectos y worktrees vecinos quedan fuera
de la limpieza. Un archivo ignorado no debe asumirse regenerable.

## Lo que aún se debe consolidar

[#118](https://github.com/IgnacioBarEsp/project-engineering-os/issues/118) debe comprobar referencias de la
landing antigua, su exportación y workflow; decidir qué retirar cuando la nueva esté publicada; y revisar
qué documentación o imágenes necesitan realmente el tarball y el instalador. Este inventario **no declara
una limpieza ya ejecutada**.

Para retirar cualquier pieza se registra: owner, consumidores, motivo, reemplazo, prueba negativa y cómo
restaurarla. El borrado local, si hace falta, se limita a rutas exactas verificadas.

Vuelve al [estado de entregas](PROJECT_STATUS.md) o a la [guía visual](USER_GUIDE.md).
