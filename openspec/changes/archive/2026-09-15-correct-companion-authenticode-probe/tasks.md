## 1. Corrección de identidad y verificación

- [x] 1.1 Usar PowerShell 7 con carga explícita del módulo de seguridad para inspeccionar el artefacto.
      `verify-app-artifact.mjs` invoca `pwsh` con `Import-Module Microsoft.PowerShell.Security
      -ErrorAction Stop` y `$ErrorActionPreference='Stop'`; host, módulo u observación ausentes fallan
      duro contra `NotSigned`, sin fallback.
- [x] 1.2 Preparar Companion 0.2.1 sin cambiar el núcleo y derivar los nombres del workflow desde el
      manifiesto. App en 0.2.1 con lockfile, notices y notas alineados; núcleo fijado en 0.5.0; el
      workflow deriva asset, título y notas de `apps/companion/package.json` y exige las notas en disco.
      `companion-v0.2.0` queda como tag inmutable sin release.
- [x] 1.3 Añadir aserciones que impidan regresar al host heredado o desalinear asset/notas/versiones.
      `qa/packaging.mjs` afirma el host `pwsh`, el import explícito, la ausencia de `WindowsPowerShell` en
      el verificador de publicación y la derivación `$version` del asset y las notas; el paso de draft
      re-afirma tag↔versión antes de cualquier mutación.

## 2. Evidencia y entrega

- [x] 2.1 Ejecutar QA de Companion, checks de raíz, validación OpenSpec y controles de formato.
      131/131 Companion (dos veces), `npm run check` EXIT 0 con 326/326, check:workflows y check:docs
      PASS tras las correcciones de revisión, OpenSpec 1.6.0 `validate --all --strict` 21/21
      (`evidence/validation.md`).
- [x] 2.2 Registrar revisión adversarial, deuda, recuperación y archive readiness. Revisión por agente
      independiente en dos rondas: PASS CON HUECOS, cero Blockers/Majors; Minors 2-3 corregidos y
      re-verificados, Minors 1 y 4 e Infos registrados (`evidence/adversarial-review.md`). Assessment
      capturado: dos `optional-improvement` y la deriva de perfiles preexistente como `technical-debt`
      (issue #122); el plan queda pausado 5/5 por diseño y el gate pre-archive PASS
      (`evidence/readiness.md`).
- [x] 2.3 Archivar el change y entregar la corrección a CI protegido antes de crear el tag 0.2.1.
      Archivado con el CLI oficial 1.6.0 en este commit y PR a `main` protegido; el tag anotado
      `companion-v0.2.1` sólo lo corta el mantenedor tras el merge, y el workflow rechaza release
      existente o tag desalineado antes de mutar.
