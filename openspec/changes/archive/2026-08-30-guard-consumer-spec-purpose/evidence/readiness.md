# Evidencia de readiness y deuda

Fecha operativa: 30 de agosto de 2026. Change: `guard-consumer-spec-purpose`. Issue:
[#45](https://github.com/IgnacioBarEsp/project-engineering-os/issues/45).

## Definition of Ready

Verificado con el gate real sobre un target bootstrapeado desechable, no por inspección:

```text
readiness-check --phase propose --issue 45
Veredicto: PASS | PASS 13 | FAIL 0 | EXCEPTION 0
```

## Definition of Done

El gate de archive se ejecutó con sus runners locales sobre un repositorio consumidor fiel: bootstrap con la
CLI instalada, `npm install` del tarball y de OpenSpec 1.6.0, `openspec init`, `opsx-adapt` y `sync` hasta
dejar `sync --check` en `IN_SYNC`.

```text
readiness-check --phase archive --change guard-consumer-spec-purpose --run-local
Veredicto: PASS | PASS 18 | FAIL 0 | EXCEPTION 0
Runners: openspec-strict, opsx-check, sync-check y doctor-json en PASS
```

## Validaciones locales

```text
OpenSpec 1.6.0 strict: 9 passed, 0 failed
npm run check: PASS package, PASS neutrality, PASS docs, PASS workflows; 235 tests, 0 fallos
npm run fixture -- --skip-install: PASS
npm run fixture: PASS
npm run check:audit: PASS, 0 high-or-critical findings
npm run pack:verify: PASS, tarball instalado y probado
```

El fixture completo importa aquí más que el acotado: ejecuta bootstrap, `openspec init`, `opsx-adapt` y
`opsx-check` sobre un repositorio vacío real, y exige `PASS` sin ningún `FAIL`. Es la comprobación de que el
gate nuevo no rompe a un consumidor recién creado.

## Árbol limpio

`npm run check` se ejecutó en un worktree separado del repositorio. El árbol local contiene
`.claude/worktrees/`, un checkout que crea el tooling de agentes dentro del repositorio y que la neutralidad
rechaza como ruta no permitida. Es ambiental, no aparece en CI y no lo introduce este change.

## Artefacto empaquetado

```text
package: create-project-engineering-os
commit: d662df04be7eaa51e14a37d78bacce54304950ac
tarball: create-project-engineering-os-0.2.0.tgz
bytes: 274926
sha256: ca34453d8185fa834aa2a5ffc191af9a0a0bea434f35025ef70e7c110a7ed4c6
tested: true
```

## Comprobación manual sobre un repositorio real

Un target bootstrapeado con `openspec init` archivó un change de demostración con la CLI local fijada. El
archive sembró el Purpose por sí mismo; el texto no se escribió a mano:

```text
openspec archive add-demo-capability --yes
  Specs to update: demo-capability: create
  Change 'add-demo-capability' archived as '2026-08-30-add-demo-capability'.

openspec validate --all --strict   -> 1 passed, 0 failed
opsx-check                         -> [FAIL] opsx.spec-purpose.demo-capability
  Recuperación: Sustituya en `openspec/specs/demo-capability/spec.md` el texto que sembró el archive.
                Escriba bajo `## Purpose` una o dos frases que declaren qué contrato observable posee
                la capability.
```

Ese contraste es el issue entero en dos líneas: el validador estricto aprueba exactamente la spec que el
gate rechaza. Tras redactar el Purpose:

```text
opsx-check -> [PASS] opsx.spec-purpose.demo-capability
```

La recuperación nombra el archivo y qué escribir en él, que era la condición de aceptación de la decisión de
diseño.

## Revisión adversarial

`evidence/adversarial-review.md` registra **PASS con cero Blockers y cero Majors abiertos**. La revisión
encontró y corrigió dentro del change:

- un **Major**: un `openspec/specs` enlazado fuera del repositorio convertía un comando read-only en una
  enumeración de directorios ajenos. Se comprobó retirando y reponiendo la corrección;
- un **Minor**: fallar cerrado ante un árbol de specs *ausente* rompía el fixture de integración y castigaba
  el estado legítimo de un repositorio que aún no ha archivado nada.

Ambos quedan fijados por pruebas nuevas. Una degradación queda declarada y no es deuda: el gate comprueba
presencia del Purpose, no su calidad.

## Debt Control

`evidence/debt-assessment.json` declara resultado `clean`, cero candidatos y ninguna excepción. Sin
dependencias, licencias, proveedores, permisos, secretos ni telemetría nuevos: solo módulos estándar de Node.

## Migración declarada

Un consumidor cuyas specs publicadas ya arrastran el texto sembrado verá un fallo nuevo tras el upgrade. Es
deuda preexistente que se vuelve observable, no un falso positivo. La entrada de `CHANGELOG.md` lo declara y
[docs/SPEC_PURPOSE.md](../../../../docs/SPEC_PURPOSE.md) explica la corrección. No hay estado que migrar ni
configuración que cambiar, y el comando sigue siendo read-only.
