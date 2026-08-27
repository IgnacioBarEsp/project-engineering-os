# Brownfield baseline - recuperación npm de v0.2.0

## 1. Superficie acotada

Workflow `Release`, checker y pruebas de política, guía `docs/RELEASES.md` y requisito de identidad en la
spec `distribution`.

## 2. Fuentes vigentes

- Run 33105347334 y job 98633794902.
- Tag protegido `v0.2.0` y GitHub Release con tres assets canónicos.
- `.github/workflows/release.yml`, `scripts/pack-release.mjs`, `scripts/release-workflow-policy.mjs` y
  `config/export-allowlist.json`.

## 3. Comportamiento actual

El build y GitHub Release pasan. Después de la aprobación, npm crea `rebuilt/`; neutralidad la rechaza y no
se descargan ni comparan los assets. npm conserva 0.1.6.

## 4. Comportamiento objetivo

Reconstruir en `release/`, descargar lo canónico en `canonical-release/`, comparar ambos directorios y
publicar solo `./canonical-release/*.tgz` con OIDC y provenance.

## 5. Compatibilidad heredada

Se preservan tag, package version, commit, tarball, manifest, checksum, Release, environment, aprobación y
comando relativo de `npm publish`.

## 6. Owner de spec y contexto

Project Engineering OS upstream posee workflow, checker y spec `distribution`. GitHub posee Release y
environment; npm posee Trusted Publishing. El Issue #40 gobierna la corrección.

## 7. Evidencia prevista

OpenSpec estricto, pruebas positivas y negativas del workflow, suite completa, audit, pack, revisión
adversarial, Debt Control, readiness y reejecución real del mismo tag.

## 8. Exclusiones

Mover tags, regenerar assets, ampliar allowlist, quitar el gate humano o publicar manualmente quedan fuera.
