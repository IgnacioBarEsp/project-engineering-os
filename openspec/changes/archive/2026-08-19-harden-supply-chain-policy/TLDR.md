# El riesgo de dependencias se decide con evidencia, no por alertas aisladas

El reporte de Socket mezcló una vulnerabilidad real, dependencias de una plantilla y señales informativas.
El cambio convierte ese análisis puntual en una política repetible: CI revisa los dos lockfiles que llegan
al desarrollo y falla ante vulnerabilidades altas o críticas. Una excepción solo puede existir si identifica
exactamente el paquete y advisory, tiene responsables, caduca pronto y explica cómo recuperar el estado.

## Privacidad local sin apropiarse de la configuración del usuario

OpenSpec 1.6.0 guarda la preferencia de telemetría de forma global. Project Engineering OS no cambiará esa
preferencia. Sus scripts usarán un wrapper multiplataforma que establece telemetría apagada cuando el usuario
no decidió otra cosa y conserva un opt-in explícito. Las invocaciones directas fuera de los scripts quedan
documentadas como límite.

## Evidencia y atribución comprensibles

El triage explica por qué `blueprint/core/package.json` es una plantilla consumidora y no una dependencia
de runtime del paquete publicado. Pruebas de política, auditoría real, fixture, checks de paquete y revisión
manual comprobarán que el gate falla cuando corresponde y que `allowScripts` sigue alineado.

## Plan de trabajo

Primero se especifican auditoría, excepciones, telemetría y documentación. Después se implementan scripts,
workflow, pruebas y guía; se verifica un repositorio recién generado; finalmente se ejecutan OpenSpec strict,
revisión adversarial, captura de deuda y archive. Cada tarea se marcará completa solo con evidencia.

## Resumen integral del change

El proyecto pasará de una remediación manual a un control continuo y legible. CI no dará un PASS falso ante
vulnerabilidades altas ni ante fallos del registro; las excepciones serán pequeñas y temporales. Los comandos
administrados respetarán privacidad por defecto sin tocar ajustes globales. La documentación distinguirá
runtime, plantilla y señales de terceros para que una persona pueda entender qué riesgo es real y por qué.

