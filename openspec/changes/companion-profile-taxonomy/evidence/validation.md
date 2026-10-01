# Validación de #145

Fecha de verificación: 2026-09-25 UTC. Worktree aislado `codex/145-profile-taxonomy`; no se ejecutó instalador ni se abrió una carpeta real del usuario.

| Gate | Resultado y alcance |
| --- | --- |
| OpenSpec local 1.6.0 strict | PASS antes de implementar y tras los cambios: `openspec validate companion-profile-taxonomy --strict --no-interactive`. |
| Matriz de perfiles | PASS: seis perfiles, todos sus enfoques, reglas/recetas/prompt distinguibles y rechazo de enfoque ajeno. |
| Recibo 0.3.x | PASS: fixture consistente de Unity con recibo, journal e historial antiguos; apertura y listado mapeados sin cambio de bytes. |
| Señales de carpeta | PASS: once casos medidos para Unity, Godot, código, LaTeX, notebook, presentación, manual, propuesta, medios y notas. |
| Companion | PASS: 154/154 pruebas tras el cambio. |
| Repositorio | PASS: `npm run check`, 391/391 pruebas, además de package, neutralidad, docs, workflows y deuda. |
| Prompts y mutaciones | PASS: seis perfiles distintos en `evidence:prompts`; 37/37 mutaciones de prompts y 45/45 mutaciones del contrato de interfaz. El contrato midió 312/312 controles alcanzables en 36 pantallas del asistente. |
| Navegador | PASS en la repetición final: 20 recorridos, 140 pantallas y 1080/1080 controles; seis categorías, Unity y medios. Se sustituyó una condición del harness por la decisión de la taxonomía. |
| `git diff --check` | PASS. |

El navegador usa renderer y motores reales, con transporte IPC, selector nativo de carpeta, portapapeles y apertura externa simulados. No acredita una instalación ni una prueba de Electron multiplataforma, que corresponde a #150. Los once ids antiguos solo quedan como fixtures y en el mapa de lectura; el producto nuevo escribe ids canónicos y muestra nombres humanos.

La aprobación de nombres/descripciones por el mantenedor y una revisión adversarial ajena a la implementación siguen pendientes. La revisión propia se documenta aparte y no se presenta como independiente. #144 también conserva sus propios gates visuales y de revisión. No se archiva OpenSpec ni se fusiona el PR mientras estos gates sigan abiertos.

Rollback: revertir el PR; no hay migración de recibos o journals al abrirlos. Las pruebas comparan los bytes de los archivos antiguos antes y después de leerlos.
