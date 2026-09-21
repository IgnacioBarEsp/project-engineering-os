# Plan de evidencia

## Antes de apply

- DoR de #162 sobre el commit base.
- Identidad por blob entre el detector actual y el medido por #166.
- OpenSpec strict sobre propuesta, diseño, delta y tareas.

## Durante apply

- Corpus congelado y con fuente: 34 frases legítimas y 19 marcadores reales.
- Lectura de las plantillas sembradas para impedir que el corpus quede obsoleto.
- Casos negativos de alcance para la excepción del campo `change`.
- Re-evaluación de toda metadata archivada con schema 1.0.0.
- Medición antes/después producida por un evaluador que importa el detector real.

## Antes de archive

- Unit y contract tests; artifact y compatibilidad del paquete.
- Checks del perfil `harness-tooling`, sin convertir fallos conocidos de #122/#115 en trabajo lateral.
- Suite completa y CI protegida sobre los sistemas/versiones declarados.
- Revisión adversarial independiente, deuda capturada y rollback ensayado.
- Gate de archive 100% derivado de evidencia ejecutada; `SKIP` o `pending` no cuentan como PASS.
