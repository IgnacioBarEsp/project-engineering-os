# Brownfield baseline — publicación después de aprobación tardía

## 1. Superficie acotada

Workflow `Release`, checker y pruebas de workflows, `docs/RELEASES.md` y requisito de identidad en
`openspec/specs/distribution/spec.md`.

## 2. Fuentes vigentes

- `.github/workflows/release.yml` y ejecución fallida de `v0.1.6`.
- Scripts `pack-release`, `verify-release`, `validate-release` y `check-workflows`.
- Spec `distribution` y documentación oficial de GitHub Actions/CLI.

## 3. Comportamiento actual

Build crea un artifact por 7 días. GitHub Release y npm descargan esa copia; npm puede empezar tras una
aprobación hasta 30 días posterior. Si el artifact expiró, el job falla sin recuperación útil.

## 4. Comportamiento objetivo

GitHub Release conserva el candidato. npm descarga sus tres assets, reconstruye desde el mismo tag y exige
igualdad byte a byte antes de publicar. La retención de 35 días cubre toda la espera permitida.

## 5. Compatibilidad heredada

Se preservan tag, package version, manifest, checksum, tarball, OIDC, environment y comando relativo de
`npm publish`. No se reutiliza versión ni se publica una reconstrucción diferente.

## 6. Owner de spec y contexto

Project Engineering OS upstream posee release automation y spec distribution. GitHub posee environments,
artifacts y Releases; npm posee trusted publishing. #17 gobierna el cambio.

## 7. Evidencia prevista

Checks del workflow, pruebas negativas, pack dry-run, suite completa, fuentes oficiales, revisión
adversarial, Debt Control y matriz del PR.

## 8. Exclusiones

Habilitar immutable releases, cambiar aprobación, tokens, SemVer, gestores o publicar una versión real
quedan fuera.
