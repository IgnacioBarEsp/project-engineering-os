## Why

El [issue #142](https://github.com/IgnacioBarEsp/project-engineering-os/issues/142), primero del
[handoff #167](https://github.com/IgnacioBarEsp/project-engineering-os/issues/167), documenta que Companion
0.3.1 tapa controles del asistente con animaciones activas y que sus dos botones de copia finales fallan
en Electron. El hotfix debe permitir terminar el recorrido público antes de la reconstrucción #144.

## What Changes

- Colocar la barra final del asistente en flujo normal, sticky y fuera del contenedor animado; retirar
  el espacio compensatorio y mantener las acciones de las tarjetas dentro de cada tarjeta.
- Añadir `copyText({text})` al puente IPC existente, con validación de texto, límites y errores visibles.
  Copiar ruta y Prompt Maestro usarán el envelope de respuesta común y confirmarán solo después del éxito.
- Mantener activa la navegación «Preparar proyecto» en `setup`, `folder`, `delimitation`, `vision`,
  `install` y `finished`, sin retirar los estados heredados que todavía existen.
- Enviar el objetivo como una línea derivada de la visión, que conserva sus párrafos, y dar nombre
  accesible al editor de visión. Añadido durante el apply: con la barra corregida, una sugerencia o un salto
  de línea en Visión hacía fallar la instalación con `GOAL_INVALID` ([decisión 6](design.md)).
- Quitar del prompt de «Instalación rápida» la frase que afirma dependencias aprovisionadas, que no se
  instalan. Decisión del mantenedor durante el apply ([decisión 7](design.md)).
- Comprobar el flujo actual con movimiento normal y reducido, hit testing, scroll y copia nativa real;
  demostrar que reintroducir el defecto de layout produce un fallo específico del contrato.
- Preparar identidad y notas 0.3.2 y registrar los defectos conocidos de 0.3.1. La publicación posterior
  usará el workflow existente; si se difiere, quedarán una decisión explícita y el estado público correcto.

## Capabilities

### New Capabilities

Ninguna capacidad independiente nueva.

### Modified Capabilities

- `companion-experience`: alcanzabilidad del asistente con animaciones y estado activo de navegación.
- `companion-desktop`: escritura acotada al portapapeles desde el proceso principal, errores y prueba nativa.
- `companion-distribution`: distinguir candidato 0.3.2 de descarga comprobada y documentar una publicación diferida.

## Impact

Superficies: `ui` y `documentation`. El issue declara `ui`; se añade `documentation` en la metadata local
porque su alcance también exige notas y estado público. La comprobación del renderer pertenece a la
superficie UI; este change no modifica el harness del constructor ni activa perfiles adicionales.

Rutas previstas: `apps/companion/ui/{app.css,app.mjs}`, `desktop/{preload.cjs,service.mjs,main.mjs}`,
`scripts/{verify-ui.mjs,interface-contract.mjs,verify-interface-contract.mjs,verify-native-journeys.mjs}`,
pruebas de `apps/companion/qa/`, identidad del paquete Companion, notas y documentación de distribución.
Un nuevo script de prueba nativa acotado es admisible si evita mezclar recorridos distintos.

Sin dependencias nuevas, costos, servicios, cambios de licencia ni cambios al núcleo 0.5.0.
Ownership: aplicación upstream y documentación; los archivos de consumidores permanecen fuera del alcance.

## Non-goals

Rediseño #144, taxonomía #145, cambio de flujo #146, trabajo real del paso 4 #147, harness general #150,
galería pública #143 y arreglos de doctor/perfiles #115/#122. La publicación de 0.3.2 no forma parte de
este change: ocurre después del merge, por decisión del mantenedor ([registro](evidence/maintainer-decisions.md)).

## Risk and rollback

Riesgos principales: alterar el submit al separar la barra del formulario; mantener una superposición
sticky inadvertida; aceptar texto sin validar; mostrar éxito ante `{ok:false}`; confundir navegador con
Electron o código candidato con release. Las specs y la matriz de evidencia cubren esos casos.

Si aparecen regresiones, revertir el PR y verificar los recorridos anteriores en una carpeta desechable.
No hay migración de datos. Un rollback a 0.3.1 reintroduce sus defectos conocidos y debe decirlo; los tags
publicados son inmutables y una corrección posterior requiere otra identidad de versión.

## Handoff boundary

La preparación respondió a «Lleva el primer Issue que dice el handoff y para antes del apply» y se detuvo
ahí. El 19 de septiembre el mantenedor pidió continuar el flujo del issue: la entrada a implementación
consta en [apply-entry](evidence/apply-entry.md). Sus decisiones sobre la prueba nativa, la publicación, el
prompt y los defectos vistos fuera de alcance están en [decisiones](evidence/maintainer-decisions.md).
Este change termina con el archivo y el PR protegido. El tag, el workflow de release y el cambio del
enlace de descarga son trabajo posterior al merge.
