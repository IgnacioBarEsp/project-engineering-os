# Upstream y consumidores

Hay dos responsabilidades distintas: el upstream evoluciona el sistema de ingeniería y cada consumidor
decide su producto. Separarlas evita que un upgrade sobrescriba código, políticas o evidencia local.

**Úsala si:** quieres modificar el runtime desde un proyecto consumidor o adoptar una nueva versión.

Este repositorio público gobierna runtime, blueprint, schemas, tests, documentación de distribución,
Debt Control Loop y specs completas de evolución.

Un proyecto consumidor fija una versión exacta y conserva:

- configuración, perfiles y políticas seed-once;
- registros y assessments de deuda;
- licencia y código del producto;
- contratos locales de aceptación de la versión adoptada.

El consumidor no edita una copia del runtime. Un cambio de comportamiento se propone upstream, se publica
como release SemVer y después se adopta mediante `upgrade --check` y PR normal. Los workflows OPSX siguen
siendo generados por la CLI oficial de OpenSpec; el renderer solo adapta bloques neutrales delimitados.

Antes de actualizar, revisa ownership en [architecture/OWNERSHIP.md](architecture/OWNERSHIP.md) y ejecuta
`upgrade --check`. Las versiones y migraciones se explican en
[architecture/VERSIONING.md](architecture/VERSIONING.md).

La [guía de oportunidades de IA](AI_OPPORTUNITY_GUIDE.md) es opcional. Si la adoptas, conserva observaciones
y decisiones como documentación propia; el constructor no genera, valida ni sobrescribe ese mapa.
