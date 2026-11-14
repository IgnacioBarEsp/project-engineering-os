# Revisión propia de #147

Autor: agente implementador, con la guía engineering:code-review. No es revisión independiente ni humana; esas aprobaciones siguen pendientes.

## Hallazgos corregidos

1. La visión se escribía fuera del plan y un catch vacío ocultaba errores. Se incluyó como seed-once en journal base v2: prueba de cancelación justo antes de escribirla, recuperación, rollback, cambio después del preview, UTF-8/BOM y original preexistente. Journals v1 mantienen su conjunto cerrado y no adquieren propiedad sobre esa visión.
2. Contexto antes de bootstrap creaba espejos que el núcleo correctamente rechazaba por falta de ownership. La vía local prepara la fuente canónica project-owned y separa `corePresent` de la estrategia de rutas. El bootstrap propone adoptar su hash; nunca se fuerza a sobrescribir un espejo ajeno.
3. Cambiar CLAUDE a import y agregar destinos habría invalidado journals v1. Lectura v1/v2 separada, rutas cerradas por versión y pruebas de reanudar/deshacer v1. Migración solo por plan aplicado; texto circundante preservado. Espejos del núcleo siguen siendo del núcleo.
4. Una cancelación en el límite del commit podía iniciar la siguiente etapa. El controlador retiene la operación completada y bloquea la siguiente; la prueba nativa detiene la lectura desde el botón, contrasta completed/total con la barra, reintenta y verifica 48 originales.
5. Elegir la vía local no demuestra herramientas instaladas. Resultado y prompt salen de `stageReport` y comprobaciones nativas. Tecnología se inspecciona por bytes, no por un registro de instalación. El handoff vuelve a validar su reporte antes de abrir.
6. Gemini/Kiro/Windsurf no tienen contrato de apertura local verificado. Su causa es «solo instrucciones», nunca «no instalado» por no haberlo medido; no abren un chat sustituto.
7. Un resumen de rollback del harness suponía que nunca había habido contexto antes. Ahora la vía ya lo prepara: el test observa que rollback restaura el contexto previo, y una modificación posterior explícita de fuente es el control negativo de frescura. No se rebajaron probes de lista, guía ni citas.
8. El recorrido visual encontró «exclusiones» sin definición en el plan. Se enlazó la definición desde esa misma pantalla, marcando solo las rutas elegidas como contenido personal; el plan de desarrollo también ofrece la definición de OpenSpec.

## Límites y decisión

Los planes se revisan progresivamente dentro del paso 4, no se inventa una lista futura. La preparación canónica no altera los espejos oficiales de CLAUDE del núcleo; el import nuevo aplica a rutas directas de Companion. No hubo aprobación humana ni prueba de la calidad de respuesta de una IA externa. Conservar esos gates y los PRs base; no archivar por esta revisión propia.
