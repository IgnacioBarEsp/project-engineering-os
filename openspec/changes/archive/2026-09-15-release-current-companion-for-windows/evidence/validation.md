# Validación — preparación de release Companion 0.2.0

Fecha: 15 de septiembre de 2026. Change: `release-current-companion-for-windows`; issue #117.

## Límite

Este PR prepara fuente y flujo manual; no crea tag, release ni artefacto publicable desde un árbol sucio. El verificador del instalador se rehúsa a ejecutarse en una estación de trabajo. La ejecución futura corre después de merge, con tag anotado de `main`, en `windows-latest` desechable.

## Gates

| Comprobación | Resultado |
| --- | --- |
| `npm test --prefix apps/companion` | PASS: 131 pruebas, 0 fallos. Cubre versión privada, core 0.5.0, lockfile, guard de VM, tag 0.1.0, draft/canon y recuperación. |
| `npm run check` | PASS: 326 pruebas, 0 fallos. Cubre paquete, neutralidad, documentos, workflows, deuda y contratos de constructor/harness. |
| `npm run check:workflows` | PASS: seis workflows; acciones fijadas por SHA y permisos declarados. |
| `openspec validate release-current-companion-for-windows --strict` | PASS. |
| `node --check` de los dos verificadores nuevos | PASS. |
| `git diff --check` | PASS. |
| `project-os debt check --root .` | PASS: plan `upstream-core` 4/5; no se introduce deuda nueva. |

El workflow exige tag acotado, anotado y ancestro de `origin/main`; genera un solo candidato fuera del checkout, lo verifica, actualiza 0.1.0 en una VM, compara los tres assets de un draft con esos bytes y sólo entonces publica. Si la comparación falla, borra exclusivamente el borrador que creó ese run. La evidencia se intenta conservar también ante fallo.

## Límites y recuperación

No se mide a una persona leyendo o haciendo clic en NSIS: la evidencia futura dice automatización silenciosa. Tampoco se afirma reproducibilidad entre builds de Electron: la identidad publicable será el SHA-256 del único build y su asset canónico descargado.

Rollback: revertir este PR. No toca proyectos, historial, runtimes, tags, releases ni assets 0.1.0. Una release futura defectuosa se corrige con una versión nueva, nunca retaggeando ni sobrescribiendo bytes.

## Handoff

Tras merge, #117 continúa con un change de publicación: tag anotado `companion-v0.2.0` sobre este commit de `main`, dispatch manual, conservación de evidencia y reconciliación posterior de documentación. Hasta entonces 0.1.0 es la única descarga vigente.
