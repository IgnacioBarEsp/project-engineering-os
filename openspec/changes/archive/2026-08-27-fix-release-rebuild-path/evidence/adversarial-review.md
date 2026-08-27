# Revisión adversarial

**Alcance:** Issue #40 y change `fix-release-rebuild-path`.

**Fuentes:** issue enriquecido, proposal, design, delta spec, tasks, diff contra `origin/main`, workflow,
checker, documentación, pruebas negativas, suite de 210 tests, audit, pack dry-run y una reconstrucción real
desde el tag protegido `v0.2.0` comparada con los assets actuales del GitHub Release.

## Intentos de refutación

- **¿Puede npm publicar la copia reconstruida?** No. El workflow apunta a
  `./canonical-release/*.tgz`, el checker exige esa cadena y una prueba negativa la invierte para demostrar
  que CI falla.
- **¿El tag existente rechaza la ruta nueva?** No. Un worktree detached del commit
  `ae9f1ac67d24d5402f064a567f957a6a43a6a5c4` ejecutó `pack-release` en `release/` con PASS.
- **¿La descarga canónica podría mezclarse con la reconstrucción?** No. Se crea después, en
  `canonical-release/`, y el comparador exige conjuntos y bytes idénticos.
- **¿La corrección mueve o reconstruye el Release?** No. La prueba descargó los assets existentes; tag,
  Release y checksum permanecieron iguales.
- **¿Se debilita la cadena de suministro?** No hay dependencias, tokens ni permisos nuevos; environment,
  OIDC, provenance, lockfile y SHA de actions permanecen intactos.
- **¿La reejecución podría aceptar un Release divergente?** No. El job GitHub compara el Release existente
  con un candidato nuevo del mismo tag y el job npm repite la comparación después de la aprobación.

## Hallazgos corregidos durante la revisión

| Severidad | Área | Hallazgo | Corrección |
| --- | --- | --- | --- |
| Minor | Prueba negativa | La sustitución inicial de `pack-release --output release` alteraba la primera aparición del workflow, no necesariamente el job npm. | Se usa `replaceAll`, de modo que la regresión elimina también el contrato requerido del job protegido y la aserción demuestra el fallo. |
| Minor | Claridad operativa | `release/` ahora representa la copia reconstruida y podía confundirse con la descarga canónica. | La descarga se llama explícitamente `canonical-release/`; guía, checker y argumento de publish fijan que solo esa carpeta es publicable. |

## Evidencia de identidad

La reconstrucción detached produjo `create-project-engineering-os-0.2.0.tgz`, 258804 bytes, SHA-256
`b9acb97bbb4f449ac86c45c6a452b046a36a6416636ffc885aebdd7c953bad76`. `verify-release` y
`compare-release` confirmaron que coincide con los tres assets canónicos actuales.

## Veredicto

**PASS.** Cero Blockers y cero Majors abiertos. Los dos Minors encontrados se corrigieron antes del gate de
archive. No queda deuda residual atribuible al change.
