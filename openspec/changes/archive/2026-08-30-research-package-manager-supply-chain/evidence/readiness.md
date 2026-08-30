# Evidencia de readiness y deuda

Fecha operativa: 30 de agosto de 2026. Change: `research-package-manager-supply-chain`. Issue:
[#19](https://github.com/IgnacioBarEsp/project-engineering-os/issues/19).

## Definition of Ready

El issue no traía bloque pre-propose ni las dos secciones que el gate exige. Se enriqueció conservando el
texto original bajo `## Historia Original`, y después se verificó con el gate real:

```text
readiness-check --phase propose --issue 19
Veredicto: PASS | PASS 13 | FAIL 0 | EXCEPTION 0
```

## Definition of Done

```text
readiness-check --phase archive --change research-package-manager-supply-chain --run-local
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

El recuento de pruebas es el mismo que antes del spike, que es la comprobación de que la investigación no
toca nada ejecutable.

## El spike no cambió ninguna superficie

```text
git status --short   ->  CHANGELOG.md, docs/README.md, docs/adr/0002-*.md y el change
package-lock.json    ->  sin cambios
.github/workflows/   ->  sin cambios
blueprint/core/      ->  sin cambios
```

## Sondas locales reproducibles

Ejecutadas con npm 11.17.0 sobre Node v26.4.0:

```text
npm config get min-release-age          -> null
npm config get min-release-age-exclude  -> (vacío)
npm config get allow-git                -> all
npm config get allow-remote             -> all
npm config get ignore-scripts           -> false
```

Y la sonda que distingue un ajuste reconocido de una clave ignorada, contrastando ambas en el mismo
`.npmrc`:

```text
npm warn Unknown project config "not-a-real-npm-config". This will stop working in the next major version.
7
```

npm avisa por la clave inventada y acepta `min-release-age` en silencio: el ajuste existe en el cliente
instalado hoy. Sin esta sonda, la afirmación que sostiene la decisión se apoyaría en documentación en vez de
en comportamiento.

Fechas de publicación de npm contrastadas con `npm view npm time`, no con recuerdo:

```text
11.5.1  -> 2025-07-24   (versión fijada hoy en release.yml)
11.10.0 -> 2026-02-11   (add min-release-age, npm/cli#8965)
11.15.0 -> 2026-05-20   (--allow-remote disponible)
11.19.1 -> 2026-08-26   (última publicada)
```

## Prueba contra datos reales

Las nueve señales del triage del 18 de agosto de 2026 se pasaron una a una por la pregunta que el issue
pedía cuantificar:

```text
9 señales | 0 que otro gestor hubiera evitado | 1 donde el control ya estaba puesto por otra vía
```

## Issues derivados creados

Los tres refuerzos que la matriz identifica se abrieron como issues independientes:

```text
#58 El npm fijado para publicar es anterior a los controles materiales
#59 Adoptar la cuarentena por antigüedad de versión que npm ya ofrece
#60 Documentar el endurecimiento de instalación de forma agnóstica del gestor
```

Los tres declaran dependencia de #19, así que el gate los reporta como no listos mientras este issue siga
abierto:

```text
readiness-check --phase propose --issue 58|59|60
Veredicto: FAIL | PASS 12 | FAIL 1 | EXCEPTION 0
[FAIL] issue.dependencies: Hay dependencias abiertas o no verificables.
```

Es el comportamiento correcto y no un defecto: pasan a estar listos cuando este ADR se cierra. Declarar la
dependencia y aceptar el `FAIL` es más honesto que retirarla para poner el gate en verde.

## Revisión adversarial

`evidence/adversarial-review.md` registra **PASS con cero Blockers y cero Majors abiertos**. La revisión
encontró y corrigió dentro del change:

- un **Major**: una premisa del issue —que el manifiesto del blueprint acopla los repositorios generados a
  npm mediante `npm exec` en cuatro scripts— es falsa contra `main`. Usarla habría cargado de costo una
  superficie que no lo tiene y habría tapado la deuda real de esa misma superficie;
- un **Minor**: una celda de la matriz venía de una fuente secundaria que falseaba a un candidato,
  afirmando que Yarn no genera provenance al publicar. Corregida contra el issue upstream.

Una degradación queda declarada y no es deuda: la matriz describe el estado de cuatro gestores en una fecha
y envejece por construcción. Se mitiga con fecha de consulta por dato y condición de revisión explícita.

## Debt Control

`evidence/debt-assessment.json` declara resultado `clean`, cero candidatos y ninguna excepción. Sin
dependencias, licencias, proveedores, permisos, secretos ni telemetría nuevos. La deuda que el spike
descubre no entra como candidato porque ya tiene issues propios.

## Gates humanos

La creación de los tres issues derivados se autorizó explícitamente antes de ejecutarla. Ninguna otra acción
remota ocurrió: no se autenticó ningún servicio, no se publicó ningún paquete y no se mutó ninguna
configuración de repositorio.
