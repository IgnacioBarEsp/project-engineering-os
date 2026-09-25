# Entrada a implementación de #145

- #145 abierto, sin PR duplicado; `readiness-check --phase propose --issue 145 --target . --json` pasó 13/13 el 2026-09-24 local. Su decisión de taxonomía está delegada explícitamente por la entrevista del 2026-09-18.
- Worktree aislado `codex/145-profile-taxonomy`, basado en `f8d8b54` de #144. Ese commit conserva pendiente la revisión independiente y visual antes de su archivo/PR; la dependencia de código se deja explícita, no se finge integrado en `main`.
- Baseline heredado del mismo commit: Companion 150/150, raíz 389/389, UI 20 recorridos/140 pantallas/1100 controles, contrato 45/45 mutaciones y Electron real de Inicio/Ayuda sin errores. Se evita repetir esos recorridos sin cambio funcional antes de aplicar #145.
- OpenSpec local `@fission-ai/openspec@1.6.0`: `status` confirmó 4/4 artefactos de planificación y `validate companion-profile-taxonomy --strict --no-interactive` pasó antes de editar código.
- El diseño mantiene el núcleo neutral y los recibos 0.3.x sin mutación por lectura. No hay nuevas dependencias, servicios, cuentas ni descargas de modelos.
