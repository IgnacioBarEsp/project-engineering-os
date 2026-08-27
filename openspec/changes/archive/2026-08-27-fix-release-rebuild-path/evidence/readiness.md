# Evidencia de readiness y deuda

Fecha operativa: 27 de agosto de 2026. Change: `fix-release-rebuild-path`.

## Validaciones locales

```text
Definition of Ready: PASS, 13 PASS, 0 FAIL, 0 EXCEPTION
OpenSpec 1.6.0 strict del change: PASS
npm run check: PASS, 210 tests
npm run check:audit: PASS, 0 high-or-critical findings
npm run pack:verify: PASS, tarball instalado y probado
workflow policy: PASS, incluidos negativos de ruta, descarga, comparación y publish
```

La suite preserva constructor, cinco harnesses, sync, doctor, segunda ejecución, neutralidad, enlaces,
compatibilidad y los contratos del release. No hay dependencias, exports, secretos, permisos ni tokens
nuevos.

## Recuperación real del tag

Un worktree detached de `v0.2.0` ejecutó la secuencia corregida sin modificar el tag ni el Release:

```text
pack en release/: PASS
verify de canonical-release/: PASS
compare release/ canonical-release/: PASS
tarball: create-project-engineering-os-0.2.0.tgz
bytes: 258804
sha256: b9acb97bbb4f449ac86c45c6a452b046a36a6416636ffc885aebdd7c953bad76
```

La primera ejecución remota 33105347334 demostró también que el environment exige aprobación y que el
fallo ocurrió antes de `npm publish`. La reejecución posterior al merge seguirá usando ese mismo tag.

## Revisión y recuperación

La revisión adversarial está en `evidence/adversarial-review.md`. Revertir el commit restaura el workflow
previo; ante cualquier divergencia npm permanece sin 0.2.0. No se borra ni mueve el tag y no existe fallback
manual con token.

## Debt Control

`evidence/debt-assessment.json` declara resultado `clean`, cero candidatos y ninguna excepción.
