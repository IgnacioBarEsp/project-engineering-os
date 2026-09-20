## Why

El [issue #165](https://github.com/IgnacioBarEsp/project-engineering-os/issues/165) cierra la ola 0 del
[handoff #167](https://github.com/IgnacioBarEsp/project-engineering-os/issues/167): la presentación del
**24 de septiembre de 2026**.

El issue se escribió el 18 de septiembre con una advertencia en su primera línea: la evidencia medida del
repositorio **contradecía** una de las afirmaciones que la charla quería hacer, y la ruta crítica estaba
bloqueada por dos issues. Hoy los tres hechos han cambiado:

- **#142 está publicado**: el asistente se puede terminar y la 0.3.2 está en la calle.
- **#143 está integrado**: las capturas son de la ventana real, con procedencia comprobable.
- **#166 está integrado**: se eligió la salida A, se re-midió con la versión publicada y **el número no
  cambió**: el contexto preparado sigue en 0 de 20 frente a 20 de 20 del barrido literal.

Queda lo único que faltaba: montar el mazo sin afirmar nada que la evidencia no sostenga.

## What Changes

- **Guion completo de veinte diapositivas** en `docs/presentations/2026-09-24-congreso.md`: lo que se ve, lo
  que se dice y **de qué registro sale cada cifra**, con una tabla final que las ata una por una.
- **Las dos demos no se actúan ni se reconstruyen.** Son las dos ejecuciones reales de la misma tarea que
  midió #166, con sus artefactos: tiempos, archivos tocados, criterios cumplidos por cada vía y lo que
  ninguna resolvió.
- **El resultado adverso ocupa una diapositiva propia**, con su número grande y su causa medida, y la
  diapositiva del microcorpus no se presenta sin ella.
- **Una diapositiva de límites** enumera lo que no se midió: tokens, calidad de respuesta, alucinaciones,
  comparación con terceros y ahorro de tiempo.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `public-documentation-experience`: una presentación pública del proyecto pasa a ser una superficie que
  declara la procedencia de cada cifra y no afirma lo que la evidencia no sostiene, con la misma regla
  simétrica que ya rige la página de evidencia.

## Impact

**Superficie: `documentation`**, como declara la metadata del issue.

**Lo que este change no hace:** no inventa números ni estima tokens a partir de bytes; no compara con
productos de terceros; no presenta una captura de prototipo como producto; y no afirma ninguna ventaja de
recuperación, de eficiencia ni de ahorro, porque la evidencia del propio repositorio dice lo contrario.

**Decisiones del mantenedor**, tomadas el 20 de septiembre de 2026 y registradas en
[decisiones](evidence/maintainer-decisions.md): las demos salen de los artefactos de #166, y el contenido se
escribe y se revisa **antes** de crear ningún diseño en su cuenta de Canva.

**Riesgo declarado:** el guion es texto; el mazo visual todavía no existe. La entrega en Canva y su PDF
exportado dependen de una decisión posterior del mantenedor sobre el contenido ya escrito.
