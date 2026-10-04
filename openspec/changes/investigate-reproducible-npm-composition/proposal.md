## Why

[#204](https://github.com/IgnacioBarEsp/project-engineering-os/issues/204) bloquea la auditoría de producción del npm incluido en Companion. El mantenedor eligió preparar una alternativa reproducible para no depender exclusivamente de la siguiente publicación completa de npm; necesitamos comprobar su viabilidad antes de asumir mantenimiento o distribuirla.

## What Changes

- Añadir un expediente y un harness de investigación de composición npm, limitado a carpetas desechables propias, sin reemplazar herramientas del host ni del Companion.
- Partir de fuentes oficiales npm11.21.0 fijadas por commit e integridad, declarar las diferencias de metadata/dependencias y generar un lock e inventario candidatos fuera de los locks oficiales.
- Probar reproducibilidad, auditoría independiente del árbol físico, regresiones de avisos y contrato de instalación/runtime de Companion.
- Emitir un dictamen trazable viable/no-viable. No declarar corrección integrada, release apta o cierre de #204 por completar la investigación.
- Mantener separada la adopción: si hay evidencia suficiente, proponer después el cambio de catálogo/locks/avisos/hashes y la validación del instalador mediante otra aprobación.

## Capabilities

### New Capabilities

- `companion-npm-composition`: evaluación reproducible, aislada y verificable de una composición npm candidata sin adopción automática.

### Modified Capabilities

Ninguna. No se cambia el contrato actual de distribución, instalación, preparación o CLI público en esta fase.

## Impact

Superficies: `documentation` y `harness-tooling`. Implementación futura, después de aprobación: harness y pruebas de investigación bajo `apps/companion/scripts/` y `apps/companion/test/`, expediente OpenSpec y evidencia. No se modifica el núcleo universal ni los workflows OPSX generados.

Se permite obtener y evaluar fuentes/dependencias oficiales solo en temporales, sin scripts de instalación ni compilación arbitrarios. No se instala nada nuevo durante esta preparación. La distribución candidata de producción, identidad de versión, soporte y cumplimiento de redistribución no se deciden aquí.

## Non-Goals

No reemplazar npm en runtime; no cambiar catálogo, locks oficiales, avisos publicados, pin OpenSpec, gestor, baseline Node, CI o protecciones; no editar dependencias vendorizadas a mano ni mantener parches propios; no publicar artefactos o ejecutar instaladores en el host; no resolver #208 ni iniciar ola4.

## Risk and Recovery

Podríamos obtener un audit verde que omita archivos bundled o no represente una corrección real. Contrastaremos inventario físico, grafo y avisos/regresiones; una discrepancia bloquea la candidata. Conservaremos fuentes e inputs/resultados separados y sus hashes. Un fracaso termina en dictamen no-viable, no en excepciones o rollback a una release vulnerable.

## Gates

Issue enriquecido y DoR **13/13 PASS** en [evidence/readiness-propose.json](evidence/readiness-propose.json). Change creado por OpenSpec local fijo **1.6.0**. La selección de estrategia autoriza preparar la spec; **proposal/design/spec aún no aprobados; Apply no iniciado**.

El archivo futuro exige evidencia real, revisión adversarial y assessment de deuda. Cualquier integración espera `CI / required` verde bajo protecciones existentes; #208 y el orden de los PR de ola3 permanecen obligaciones separadas. No se mezclará este trabajo en #207.
