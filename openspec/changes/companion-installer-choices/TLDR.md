# Companion installer choices — #168

El change hace que el instalador NSIS de Companion permita decidir si crea el acceso directo del escritorio,
recupere la casilla estándar para abrir la aplicación al terminar y declare español como idioma del asistente.
La decisión del escritorio queda marcada por defecto y también se aplica en `/S`; la casilla de apertura solo
aparece en el Finish asistido.

La fuente de implementación es el include NSIS local. `qa/packaging.mjs` protege la configuración y los macros;
`verify-release-installation.mjs` comprueba el enlace en el ciclo silencioso de instalar, actualizar y desinstalar
cuando se ejecuta en GitHub Actions o en una VM Windows desechable declarada.

La implementación y los gates locales están completos. La observación humana de las cuatro ramas asistidas y la
comparación de idioma quedan deliberadamente pendientes del runner Windows desechable del workflow de release;
ninguna ejecución silenciosa se presenta como una persona leyendo o pulsando el asistente.

- Propuesta: [proposal.md](proposal.md)
- Diseño: [design.md](design.md)
- Especificación: [companion-distribution](specs/companion-distribution/spec.md)
- Tareas: [tasks.md](tasks.md)
- Baseline: [brownfield-baseline.md](brownfield-baseline.md)
- Validación y límites: [evidence/validation.md](evidence/validation.md)
