# Revisión adversarial

**Alcance:** Issue #18 y change `harden-supply-chain-policy`.

**Fuentes:** proposal, design, delta spec, tasks, diff contra `origin/main`, política y evaluador de audit,
workflow requerido, wrapper OpenSpec, pruebas, fixture limpio y repositorio temporal bootstrapeado.

## Alineación spec/tareas

- Los tres scopes de dependencias se auditan mediante una política versionada y CI depende del resultado.
- Las excepciones coinciden por scope, paquete y advisory; fechas y metadata fallan cerradas.
- El wrapper usa el binario local fijado, no usa shell, conserva opt-in y no escribe preferencias globales.
- El triage distingue paquete público y plantilla consumidora, enlaza evidencia y declara el límite directo.

## Hallazgos refutados y corregidos

| Severidad | Área | Hallazgo | Evidencia | Corrección |
| --- | --- | --- | --- | --- |
| Major | Excepciones | Una fecha con forma ISO pero imposible podía normalizarse por `Date.parse`; una creación futura también podía aplicar. | Casos `2026-02-30` y creación posterior al reloj del gate. | Validación por round-trip UTC, rechazo de fecha futura y pruebas negativas. |
| Major | Triage de audit | Los registros meta con `via: ["paquete"]` producían un advisory sintético por cada padre y obligaban a excepciones duplicadas. | Fixture realista `ajv -> fast-uri -> GHSA`. | Se resuelve la cadena hacia el advisory identificado y solo el paquete vulnerable produce el finding; caso cubierto. |
| Minor | Evidencia de tests | La prueba de binario ausente imprimía una línea `FAIL` aunque la aserción pasara. | Salida de `npm test`. | El writer de error es inyectable y la prueba negativa lo captura sin contaminar el log. |

## Casos negativos revisados

- **Advisory high sin excepción:** exit no cero y finding con scope, paquete, advisory y severidad.
- **Registro o JSON indisponible:** resultado `FAIL evidence`; no se interpreta como grafo limpio.
- **Excepción distinta, incompleta, vencida, demasiado larga o futura:** no suprime el finding.
- **Dependencia meta transitiva:** se atribuye al advisory y paquete vulnerables sin duplicar excepción.
- **Variable ausente o explícita:** default `0`; un `1` explícito se conserva.
- **Binario OpenSpec ausente o child con error:** exit no cero; el status del child se propaga.
- **Shell y configuración global:** el wrapper usa `process.execPath`, `shell: false` y no ejecuta `config set`.
- **Resultado requerido omitido o cancelado:** `CI / required` exige éxito tanto de matrix como de audit.
- **Atribución de Socket:** `npm view ... dependencies` no devuelve dependencias de runtime.

## Veredicto

**PASS CON HUECOS.** Cero Blockers y cero Majors abiertos. Dos Majors y un Minor del change se corrigieron
antes del cierre. La validación global posterior detectó un Minor preexistente en cuatro specs históricas;
quedó gobernado por Debt Control y el Issue
[#25](https://github.com/IgnacioBarEsp/project-engineering-os/issues/25), fuera del alcance de #18.
