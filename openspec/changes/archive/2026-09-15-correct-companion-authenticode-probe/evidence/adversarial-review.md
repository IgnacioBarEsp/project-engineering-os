# Revisión adversarial — correct-companion-authenticode-probe

Origen: revisión por un agente independiente del diff no commiteado (dos rondas), no es revisión
humana. Ronda 1 sobre el diff de Codex; ronda 2 tras corregir los Minors 2 y 3. Ambas solo lectura.

## Dictamen

**PASS CON HUECOS** en las dos rondas. Cero Blockers y cero Majors. La corrección es fiel al spec
delta: toda falla de inspección Authenticode es hard-fail, no hay fallback silencioso, no se puede
reemplazar una release ni mover un tag, y las versiones están alineadas en todas las superficies.

## Hallazgos y destino

| # | Severidad | Hallazgo | Destino |
| --- | --- | --- | --- |
| 1 | Minor | Guardas de QA por texto sobre `verify-app-artifact.mjs` (`qa/packaging.mjs:291-297`): un verificador que conserve el literal pero sondee con otra variable pasaría. | Deuda: assessment `optional-improvement`. |
| 2 | Minor | El paso de draft re-derivaba la versión sin re-afirmar tag↔versión. | Corregido en `companion-release.yml:104` y re-verificado en ronda 2 (posición previa a toda mutación, interpolación correcta, QA y check:workflows verdes). |
| 3 | Minor | El requisito `pwsh` de `pack:verify` no estaba documentado. | Corregido en `docs/companion/INSTALLER.md:92-94`; check:docs PASS; redacción fiel al código (hard-fail en Windows; fuera de Windows el verificador declara PASS-PARCIAL `not-inspected`). |
| 4 | Minor | `tasks.md` sin marcar y sin `evidence/` al revisar. | Cerrado por este registro: tareas marcadas y evidencia presente. |
| 5 | Info | `scripts/verify-engineering-runtime.mjs:41` conserva el host heredado (fuera del flujo de release). | Deuda: assessment `optional-improvement`. |
| 6 | Info | Ninguna aserción ata el nombre del instalador a `manifest.version` más allá del regex de forma. | Aceptado: ambos derivan del mismo campo en `pack-app.mjs`; riesgo teórico declarado. |
| 7 | Info | `-ne`/`-notmatch` de tag en PowerShell son case-insensitive (preexistente, línea 54 anterior al change). | Aceptado: inalcanzable; `git cat-file` y `gh --verify-tag` comparan el tag real con sensibilidad a mayúsculas. |

## Comprobaciones de la ronda 2

- Guarda nueva: cae después de `gh release view` (solo lectura) y antes de `$notes`, assets y
  `gh release create`; probada en PowerShell real con tag alineado y tag en deriva.
- Párrafo nuevo de INSTALLER.md: fiel a `verify-app-artifact.mjs:82-87`; matiz registrado: la frase
  "falla en lugar de omitirse" es estricta en Windows, y el párrafo vive bajo "Empaquetar requiere
  Windows".
- `node --test apps/companion/qa/packaging.mjs` 11/11, `check:workflows` PASS, `check:docs` PASS,
  `openspec validate --strict` válido tras ambas ediciones.
