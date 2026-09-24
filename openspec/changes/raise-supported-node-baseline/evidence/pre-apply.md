# Preflight y apply de #155

Revalidación previa a cambios de runtime, ejecutada el 2026-09-23 en la rama `codex/155-raise-supported-node-baseline`, basada en `origin/main` de cierre #168.

- `node bin/project-os.mjs readiness-check --phase propose --issue 155 --json`: PASS, 13 PASS, 0 FAIL, 0 EXCEPTION. Issue abierto, en el proyecto esperado, sin dependencias abiertas y metadata DoR válida.
- `gh pr list --state open --search "155"`: sin resultados. No había otro change activo para el runtime; solo estaba la carpeta OpenSpec nueva de #155.
- Decisión de runtime/major registrada en [el comentario del issue #155](https://github.com/IgnacioBarEsp/project-engineering-os/issues/155#issuecomment-5805918794), con el alcance de Companion explícitamente excluido.
- El Node.js Release WG schedule y la página oficial de EOL identifican Node 20 EOL el 2026-04-30, Node 22 como Maintenance LTS y Node 24 como Active LTS. Node 26 sigue en Current al momento de esta revisión; su transición planificada a LTS requiere confirmación al llegar el checkpoint.
- Fuentes primarias: [calendario de releases Node.js](https://github.com/nodejs/Release#release-schedule), [releases anteriores y estado de soporte](https://nodejs.org/en/about/previous-releases), [política EOL](https://nodejs.org/en/about/eol).
- La matriz actual del core es Node 20.20.0 + 22.22.0 por Ubuntu/Windows/macOS; el blueprint propaga el rango anterior a consumidores. Companion corre su job separado sobre 24.18.0 y queda fuera del cambio.
- `node_modules/.bin/openspec.cmd validate raise-supported-node-baseline --strict --no-interactive`: PASS después de completar proposal, design, tasks y delta spec.
- `readiness-check --phase archive --change ... --run-local` sobre el upstream no es evidencia válida: el checkout no tiene forma de consumidor y conserva fallos ya documentados por #115/#122. La verificación de cierre se ejecutará sobre un consumidor desechable bootstrappeado, sincronizado explícitamente, siguiendo el precedente de #162.
- El ruleset remoto `protected-release-tags` ya está activo e incluye `refs/tags/v*` y `refs/tags/companion-v*`, con bloqueos de creación, borrado y fast-forward intactos. No se alteró ni se sorteará al preparar la release.

No se ejecutó ni publicó ningún artefacto con el runtime nuevo durante este preflight. No se modificaron archivos ajenos al change.
