# Debt Control Loop

El motor de deuda evita dos extremos: ignorar hallazgos reales o convertir cada warning en una obligación.
Primero verifica, después clasifica y solo entonces decide si el plan debe detenerse.

**Úsalo si:** estás cerrando un change, recibiste resultados de un scanner o un plan quedó pausado.

Un warning, TODO o scanner es un candidato, no deuda verificada. Cada cierre SDD produce un assessment
inmutable con resultado `clean` o candidatos clasificados.

Categorías: `defect`, `technical-debt`, `external-risk`, `decision-required`, `optional-improvement`,
`false-positive` y `duplicate`.

Disparan saneamiento: Blocker/Major verificado, riesgo transversal crítico, excepción vencida, cinco
flujos con deuda residual, el mismo hallazgo en tres flujos o presupuesto de cinco unidades. La pausa
afecta al plan dueño salvo riesgo transversal crítico. El issue de saneamiento es idempotente y exige
**NO GENERAR MÁS DEUDA TÉCNICA**.

`debt check` es read-only. `capture` y `sync` son las mutaciones explícitas. La configuración seed-once
permite modos GitHub `required`, `advisory` y `off`. Indisponibilidad nunca se presenta como PASS falso.

`debt handoff` recomienda continuar o cambiar de chat según el alcance/contexto y genera un prompt
redactado. Los assessments y excepciones no se borran como forma de recuperación.

## Comandos esenciales

```sh
project-os debt capture --root . --flow mi-change --input assessment.json
project-os debt sync --root .
project-os debt check --root .
project-os debt handoff --root . --plan mi-plan
```

Si una operación se interrumpe, no borres el registro: sigue la [guía de recuperación](RECOVERY.md).

Para evaluar si una señal del proceso merece automatización, usa la
[guía opcional de oportunidades de IA](AI_OPPORTUNITY_GUIDE.md). Una recurrencia es una señal que requiere
diagnóstico; no prueba fricción por sí sola y no añade un gate ni deuda por no mantener un mapa.
