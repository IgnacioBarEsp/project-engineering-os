# Preflight y apply de #168

La revalidación se hizo antes de tocar la fuente con:

- `npx --no-install openspec instructions apply --change companion-installer-choices --json`: PASS.
- `node bin/project-os.mjs readiness-check --phase propose --issue 168 --target . --json`: 13 PASS, 0 FAIL,
  0 EXCEPTION; issue abierto y perteneciente al Project Engineering OS.
- `git status --short`: solo la carpeta nueva del change estaba sin seguimiento; no había modificación ajena.

Después se instalaron dependencias con `npm ci --ignore-scripts` en la raíz y en `apps/companion`; ambas
instalaciones terminaron sin vulnerabilidades auditables. El apply se implementó sobre `2384fab` en la rama
`codex/168-installer-choices` y se registró inicialmente en `46c7f54` con DCO.

La revalidación no alteró la identidad del issue, la versión 0.3.2, el pin de electron-builder ni el alcance
descrito en la propuesta.
