# Evidencia de readiness y deuda

Fecha operativa: 30 de agosto de 2026. Change: `research-upstream-self-application`. Issue:
[#46](https://github.com/IgnacioBarEsp/project-engineering-os/issues/46).

## Definition of Ready

Verificado con el gate real sobre un target bootstrapeado, no por inspección:

```text
readiness-check --phase propose --issue 46
Veredicto: PASS | PASS 13 | FAIL 0 | EXCEPTION 0
```

## Definition of Done

```text
readiness-check --phase archive --change research-upstream-self-application --run-local
Veredicto: PASS | PASS 18 | FAIL 0 | EXCEPTION 0
Runners: openspec-strict, opsx-check, sync-check y doctor-json en PASS
```

## Validaciones locales

```text
OpenSpec 1.6.0 strict: 9 passed, 0 failed
npm run check: PASS package, PASS neutrality, PASS docs, PASS workflows; 231 tests, 0 fallos
npm run fixture -- --skip-install: PASS
npm run check:audit: PASS, 0 high-or-critical findings
```

El recuento de pruebas es el mismo que antes del spike. Es intencional: un spike documental que cambiara el
número de pruebas estaría tocando runtime, y este no lo toca.

## El spike no dejó residuo

Todas las sondas de configuración se revirtieron. Al terminar:

```text
git status --short   ->  solo CHANGELOG.md, docs/README.md, docs/SELF_APPLICATION.md y el change
ls .project-os/      ->  repository-governance.json
```

## Mediciones que sostienen la decisión

La evidencia completa está en `evidence/current-truth.md`, con doce secciones. Las cuatro que más peso
cargan:

```text
sync --check --target .        conflicts 9 | creates 67 | writes 0
allowlist frente a creates     26 archivos en 10 raíces rechazadas
tres archivos en .project-os/  readiness-check in situ: PASS 13 | FAIL 0 | EXCEPTION 0
debt capture sobre 10          8 aceptados, 2 rechazados, 1 item de registro creado
```

El item creado es la deuda de Purpose de cuatro specs históricas, fechada el 18 de agosto de 2026: la misma
que se redescubrió por lectura humana en los issues #42 y #45.

## Desglose creado y verificado

Los nueve issues del desglose se crearon y los nueve pasaron el Definition of Ready con el gate real:

```text
#48 Fijar OpenSpec en el manifiesto y el lockfile              PASS 13 | FAIL 0 | EXCEPTION 0
#49 Sembrar la configuración de readiness in situ              PASS 13 | FAIL 0 | EXCEPTION 0
#50 Adoptar el motor de deuda sobre el propio repositorio      PASS 13 | FAIL 0 | EXCEPTION 0
#51 Separar forma de consumidor de deuda real en el doctor     PASS 13 | FAIL 0 | EXCEPTION 0
#52 Arreglar o retirar el script npm run opsx-check            PASS 13 | FAIL 0 | EXCEPTION 0
#53 Dar requisito de spec a opsx-check y readiness-check       PASS 13 | FAIL 0 | EXCEPTION 0
#54 Permitir un conjunto de perfiles activo distinto           PASS 13 | FAIL 0 | EXCEPTION 0
#55 Resolver la bandera codeIndexable                          PASS 13 | FAIL 0 | EXCEPTION 0
#56 Corregir el detector de marcadores de la metadata          PASS 13 | FAIL 0 | EXCEPTION 0
```

## Revisión adversarial

`evidence/adversarial-review.md` registra **PASS con cero Blockers y cero Majors abiertos**. La revisión
encontró y corrigió dentro del change:

- un **Major**: el criterio se estaba aplicando en la dirección cómoda y absolvía los seis `FAIL` del doctor.
  Aplicado con rigor, dos son deuda real y tienen issue propio;
- un **Minor**: el recuento del resumen no cuadraba con la matriz que él mismo resume.

Un hallazgo lateral se incorporó al desglose: escribiendo la metadata del noveno issue, la propia metadata
reprobó el gate porque la palabra española que significa la totalidad es homógrafa de un marcador inglés de
la lista prohibida.

Una degradación queda declarada y no es deuda: el criterio de clasificación depende de que las promesas del
upstream estén escritas. Una promesa sostenida solo por costumbre quedaría clasificada como forma de
consumidor por omisión. No se encontró ningún caso, pero el modo de fallo existe.

## Debt Control

`evidence/debt-assessment.json` declara resultado `clean`, cero candidatos y ninguna excepción. La deuda que
el spike descubre no entra como candidato porque ya tiene issues propios, del #48 al #56.

## Gates humanos

La creación de los nueve issues del desglose se autorizó explícitamente antes de ejecutarla. Ninguna otra
acción remota ocurrió: no se crearon tableros, no se autenticó ningún servicio y no se mutó ninguna
configuración de repositorio.
