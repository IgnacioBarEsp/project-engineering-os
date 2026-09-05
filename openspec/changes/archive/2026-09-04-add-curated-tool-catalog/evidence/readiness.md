# Evidencia de readiness y deuda

Fecha operativa: 28 de agosto de 2026. Change: `add-curated-tool-catalog`. Issue:
[#34](https://github.com/IgnacioBarEsp/project-engineering-os/issues/34).

## Validaciones locales

```text
Definition of Ready: PASS, 13 PASS, 0 FAIL, 0 EXCEPTION
OpenSpec 1.6.0 strict del change: PASS
npm run check: PASS, 228 tests, 0 fallos
npm run check:audit: PASS, 0 high-or-critical findings
npm run pack:verify: PASS, tarball instalado y probado
```

La suite conserva constructor, cinco harnesses, sync, doctor, segunda ejecución, neutralidad, enlaces,
compatibilidad y los contratos del release. El cambio añade 18 pruebas dirigidas al catálogo.

## Árbol limpio

`npm run check` se ejecutó en un worktree separado del repositorio, no en el árbol de trabajo. El árbol
local contiene `.claude/worktrees/`, un checkout completo que crea el tooling de agentes dentro del
repositorio y que la neutralidad rechaza como ruta no permitida. Ese hallazgo es ambiental: no aparece en un
checkout limpio ni en CI, y no lo introduce este change.

```text
worktree limpio: PASS package contract, PASS neutrality, PASS docs, PASS workflows
tests: 228 pass, 0 fail
```

## Artefacto empaquetado

```text
package: create-project-engineering-os
commit: b9958441db30713b162cd849eebbda48176c8ba7
tarball: create-project-engineering-os-0.2.0.tgz
bytes: 271275
sha256: 56681e7141971c610c8df8db07a50df9ab621bfdc90c819a79927b9eef6a835b
tested: true
```

## Recuperación probada

Un bootstrap real sembró el catálogo y su transacción se revirtió por completo:

```text
bootstrap: APPLIED, tx-2026-08-28T21-54-16-020Z-80915571
.project-os/tool-catalog.json presente tras el bootstrap
rollback: ROLLED_BACK, 77 restauraciones
.project-os/tool-catalog.json ausente tras el rollback
```

La semilla participa del mismo modelo transaccional que el resto del blueprint. No deja residuo.

## Revisión adversarial

`evidence/adversarial-review.md` registra **PASS con cero Blockers y cero Majors abiertos**. La revisión
encontró y corrigió dentro del change:

- un **Major**: aceptar cualquier identificador en mayúsculas como referencia de entorno dejaba pasar un
  literal hexadecimal en un campo de credencial. La excepción se acotó a `secretEnvRefs`;
- un **Minor**: `--candidate` se descartaba en silencio junto a `list`, pudiendo leerse como una evaluación
  que no ocurrió.

Ambos quedan fijados por pruebas nuevas, junto con travesía de rutas y rechazo de ruta absoluta.

Dos degradaciones quedan declaradas y no son deuda: el catálogo no se renderiza en las instrucciones de los
cinco harnesses, y una verificación vencida se reporta como stale en lugar de caducar la entrada.

## Debt Control

`evidence/debt-assessment.json` declara resultado `clean`, cero candidatos y ninguna excepción. No se
añadieron dependencias de runtime, proveedores activados, permisos, tokens ni excepciones.

## Gates humanos

Los dos gates declarados en el bloque pre-propose del issue —`catalog-seed-approval` y
`provenance-source-verification`— fueron aprobados explícitamente por el owner el 28 de agosto de 2026. La
procedencia sembrada se verificó en la fuente oficial de cada herramienta ese mismo día:

| Entrada | Referencia | Licencia | Fuente |
| --- | --- | --- | --- |
| `github-mcp-server` | `v1.11.0` | MIT | repositorio `github/github-mcp-server` |
| `context7` | `4.0.4` | MIT | paquete publicado por `upstash` |
| `playwright-test` | `1.62.1` | Apache-2.0 | `@playwright/test` |
| `structural-code-intelligence` | sin proveedor | desconocida | pospuesta por contrato |
