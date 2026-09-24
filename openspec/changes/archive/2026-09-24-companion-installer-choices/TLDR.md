# Companion installer choices — #168

El change hace que el instalador NSIS de Companion permita decidir si crea el acceso directo del escritorio,
recupere la casilla estándar para abrir la aplicación al terminar y declare español como idioma del asistente.
La decisión del escritorio queda marcada por defecto y también se aplica en `/S`; la casilla de apertura solo
aparece en el Finish asistido.

La fuente de implementación es el include NSIS local. `qa/packaging.mjs` protege la configuración y los macros;
`verify-release-installation.mjs` comprueba el enlace en el ciclo silencioso de instalar, actualizar y desinstalar
cuando se ejecuta en GitHub Actions o en una VM Windows desechable declarada.

La implementación y los gates locales están completos. La release 0.3.6 pasó el ciclo silencioso protegido de
instalación, actualización y desinstalación; Windows Sandbox verificó las cuatro ramas asistidas y las páginas
en español. La publicación exige evidencia mantenedora para las elecciones asistidas, mientras la CI cubre los
defaults silenciosos; ninguno de esos resultados se presenta como sustituto del otro.

- Propuesta: [proposal.md](proposal.md)
- Diseño: [design.md](design.md)
- Especificación: [companion-distribution](specs/companion-distribution/spec.md)
- Tareas: [tasks.md](tasks.md)
- Baseline: [brownfield-baseline.md](brownfield-baseline.md)
- Validación y límites: [evidence/validation.md](evidence/validation.md)
- Recorrido asistido 0.3.6: [evidence/assisted-sandbox.md](evidence/assisted-sandbox.md)
- Release 0.3.6: [evidence/release-0.3.6.md](evidence/release-0.3.6.md)
