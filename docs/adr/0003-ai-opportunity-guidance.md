# ADR 0003: guía opcional de oportunidades de IA

- Estado: aceptada para evaluación y diseño; adopción automática diferida.
- Fecha: 2026-09-05.
- Trazabilidad: [#14](https://github.com/IgnacioBarEsp/project-engineering-os/issues/14) y
  [#15](https://github.com/IgnacioBarEsp/project-engineering-os/issues/15).

## Contexto

El proceso instalado permite documentar capacidades desde el primer día. No permite afirmar que un equipo
tenga fricción, que una intervención aporte valor o que un producto disponga de recorridos validados. El
estudio externo previsto por los issues sigue pendiente. El mantenedor eligió cerrar la evaluación y el
diseño usando evidencia de este repositorio, sin ejecutar ese estudio ni declarar cumplida su evidencia.

## Decisión

Publicar la [guía opcional](../AI_OPPORTUNITY_GUIDE.md). Transferir el vocabulario y el criterio de evidencia
de la capa de proceso, sin copiar una capa de producto. No transferir automáticamente un mapa al bootstrap.
La guía acepta `automatiza`, `reduce-friccion`, `no-ia`, `prohibido`, `hipotesis` y `validado`; separa
capacidad instalada de resultados y permite `no aplica` motivado para la capa de producto.

Cruzar respuestas existentes de discovery, y tratar gates, deuda y excepciones como señales que requieren
diagnóstico. No añadir telemetría, métricas inferidas, tareas obligatorias ni deuda por ausencia del mapa.

La referencia al proceso instalado se versiona con su documentación. Las observaciones se mantienen en un
documento elegido por el consumidor, fuera de archivos gestionados. Se difieren el schema en `.project-os/`
y cualquier regeneración hasta tener consumidores reales y un contrato con migración.

## Alternativas

| Alternativa | Evaluación |
| --- | --- |
| Esperar sin publicar criterio | Retrasa una guía que ya puede sustentarse en hechos del upstream |
| Plantilla obligatoria generada y gate | Impone trabajo sin demostrar utilidad; favorece mapas vacíos o evidencia inventada |
| Inferir fricción automáticamente de fallos | Confunde un control útil o mala configuración con un obstáculo del equipo |
| Guía opcional y diseño acotado | Permite aprender sin imponer formato ni cambiar el runtime; elegida |

## Evidencia y consecuencias

Las fuentes y límites de cada observación están en la guía. Su evidencia demuestra defectos y contratos
del upstream; no demuestra métricas de productividad, entrevistas ni generalización a todos los dominios.
No se requiere una prueba de runtime nueva para este cambio documental. Se verifican enlaces, neutralidad,
coherencia de ownership, contratos existentes y OpenSpec.

Revisar la adopción automática cuando el benchmark externo produzca su evaluación transferible y exista
uso voluntario documentado por un consumidor: utilidad observada, casos de no aplicabilidad, decisiones
prohibidas y propiedad probada durante un upgrade. Esa adopción requiere otro issue, spec, contrato de
datos y migración; cerrar #14 y #15 no autoriza darla por implementada.

Rollback: revertir guía, ADR y enlaces. No hay estado ni migración que deshacer.
