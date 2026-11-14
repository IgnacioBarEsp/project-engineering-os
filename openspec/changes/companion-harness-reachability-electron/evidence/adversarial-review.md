# Revisión propia #150 (no independiente)

Autor: agente implementador. Fecha local: 2026-09-26. Alcance: diff contra #149, CI, fixtures,
probes y las dos correcciones CSS acotadas. No constituye aceptación del mantenedor ni informe independiente.

## Correctitud y evidencia

- Se preservan 46 controles negativos previos y se extrae su fixture sin cambiar las mutaciones.
- 14 controles adicionales detectan su propiedad, no un timeout: enfoque ajeno, riel, navegación,
  breadcrumb, control decorativo, duración, ease-in, contención, oclusión, hueco inferior,
  modo de movimiento ausente, ruta ausente, copia que evita IPC y color funcional fuera de tokens.
- El guard anterior solo detectaba hex. Se centralizaron las 62 declaraciones rgba existentes en 34
  tokens de valores idénticos; el guard CSSOM y estático verifica también colores funcionales.
- La cobertura compara identidades contra ROUTES y seis perfiles, no solo contadores. El contrato rechaza
  vacíos y que se declare únicamente movimiento reducido o se quite un tamaño obligatorio.
- Corregidos dos falsos positivos de medición: texto/contorno pintado omitido al medir el final y medición
  del formulario anterior durante el guardado asíncrono. No se amplió el límite de hueco de 24 px.
- Corregidos dos defectos visuales acotados: reserva vacía de avisos y transición de dimensiones de
  navegación al cambiar de breakpoint. No se desactivaron las animaciones para hacer pasar la prueba.
- Los historiales de los dos modos son distintos. Las capturas no se sobreescriben entre modos.
  Un runner Node pasa el directorio de evidencia a ambas suites, cosa que una cadena shell && no hacía.
- Electron usa IPC real, lee clipboard en main, conserva fuente y captura ventana real. El único
  componente nativo sustituido es el picker. Un fallo guarda informe incompleto y no se convierte en PASS.
- Procedencia: SHA de bytes PNG, dimensiones de cabecera, commit, versión, runtime, ventana exterior
  y viewport reales. Las fuentes sucias se declaran con un hash adicional; no son una release.

## Seguridad, recursos y límites

Servidores solo loopback con allowlist de assets; historial se sirve desde blobs Git inmutables en memoria.
No hay evaluaciones del texto del proyecto como código ni nuevas capacidades del bridge.
Fixtures bajo directorios temporales de nombre controlado, comprobados antes de eliminarlos.
userData y LOCALAPPDATA nativos aislados. Sin dependencias nuevas, secretos, modelos o servicios.

CI usa acciones fijadas, permisos contents:read y aggregate que rechaza resultado ausente/fallido/omitido
de Electron. Se guardan los artefactos nativos y de navegador. El timeout del recorrido ampliado es acotado.

La comparación histórica NO atribuye al hotfix requisitos de taxonomía/tokens que aparecieron después.
Solo certifica los defectos comunes medidos: alcance/contención/copia. Sus recorridos detenidos se conservan.

No se observaron blockers/majors adicionales en esta autorrevisión. El informe independiente sigue
PENDIENTE y debe incluir mutaciones propias y el SHA final conforme a docs/companion/EVALUATION.md.
