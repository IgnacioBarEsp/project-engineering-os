## Context

Companion 0.1.0 publicado corresponde a `4b863af12df351b402dc4fda3683de1f3a445da2`.
El source auditado es `0c632a3` tras PR #114. La entrada pública aún exige terminal y afirma que el
instalador está pendiente. La nueva landing tiene base técnica integrada, no página final publicada.
DoR del issue #116: 13 PASS, 0 FAIL, 0 EXCEPTION, 2026-09-14.

## Goals / Non-Goals

**Goals:** orientación visual primero, detalle técnico accesible, estado verificable por canal, capturas
auténticas y explicación del método portable con lenguaje cercano.

**Non-Goals:** cambiar runtime/API, nueva identidad visual, activar servicios o skills por defecto,
firmar/publicar un instalador, desplegar/retirar una landing o borrar archivos del usuario.

## Decisions

1. README empieza por beneficio concreto, descarga real y recorrido. La ruta terminal se conserva como
   sección secundaria y guía técnica; alternativa de dos rutas con igual peso descartada por la elección
   explícita del mantenedor. No se cambian comandos exigidos por el contrato de documentación.
2. Un registro público fechado (`docs/PROJECT_STATUS.md`) diferencia descarga, main, límites y siguientes
   entregas. Las guías no presentan nuevas pantallas como si vinieran en 0.1.0. La actualización de #117
   reconciliará enlaces tras verificar el nuevo artefacto.
3. Se conserva núcleo/CLI/bootstrap/npm: la app importa el núcleo 0.5.0, administra npm y ejecuta el
   bootstrap en proyectos aplicables. Se documenta qué usa la app y qué necesita quien contribuye.
   Retirar o reemplazar estos mecanismos requeriría migración y evidencia; no resuelve la confusión editorial.
4. Inventario (`docs/REPOSITORY_MAP.md`) distingue fuente necesaria, historia, salida regenerable y
   superficie con retiro condicionado. `site/` y su workflow siguen sirviendo la página publicada.
   Un archivo histórico no se reescribe como política actual; se corrigen enlaces desde guías vigentes.
5. Copiar el método de un proyecto de referencia significa adaptar instrucciones, decisiones, validación y contexto, no
   instalar su stack o publicar documentos de otros proyectos. Un producto de referencia aporta comunicación por resultado y
   siguiente paso; no se copian datos de clientes ni su diseño de marca. `PRODUCT.md` registra esta regla.
6. Capturas del código actual con datos de prueba declarados, fuente/commit, fecha y alcance de ejecución.
   Si se usa renderer en navegador se dice; la evidencia del instalador nuevo pertenece a #117.
   Reusar el verificador existente, inspeccionar y seleccionar pocas imágenes; sin composiciones generadas
   ni fingir ventanas instaladas. No cambiar identidad visual requiere otro concurso de propuestas.
7. Validaciones documentales prueban navegación/enlaces y los estados por canal. Casos negativos: enlace
   inexistente, captura sin procedencia, versión confundida y ausencia de rutas operativas. Contratos
   existentes de prompts, neutralidad y paquete permanecen activos.

## Risks / Trade-offs

- [Documentación vuelve a envejecer] → registro fechado, fuente y lista de reconciliación por release.
- [Captura de main se confunde con instalador] → etiqueta visible junto a la imagen y datos de procedencia.
- [Entrada sigue demasiado técnica] → ruta corta sin comandos y lectura en frío pendiente de una persona;
  la revisión del agente no sustituye esa medición.
- [Documentos crecen en vez de aclarar] → enlazar cada contrato desde su guía; conservar historia fuera de
  la ruta inicial. Retirada de fuentes vivas se pospone al reemplazo verificable en #118.

## Migration Plan

Publicar los cambios por PR protegido después de evidencia, revisión adversarial, deuda y archivo local
OpenSpec 1.6.0. Sin migración de datos. Rollback por PR de reversión; ninguna release existente se altera.

## Open Questions

El mantenedor aprobó expresamente esta spec el 2026-09-14: «Apruebo la spec de #116».
Los gates de instalador, nueva landing y eliminación quedan en sus entregas, no se dan por completados aquí.
