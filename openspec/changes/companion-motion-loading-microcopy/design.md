# ADR-149: movimiento como cambio de estado, nunca como evidencia

**Status:** Accepted for implementation within issue scope; human observations pending.
**Date:** 2026-09-26
**Deciders:** IgnacioBarEsp (scope) / implementer (bounded technical decisions).

## Context

Base #148: lista ya tiene 300 ms/10 s medidos; #147 tiene progreso real y copia nativa. Reusar, no implementar servicios duplicados. Shell tiene CSP sin inline, módulos ES y runtime Electron 44.1.1.

## Goals / Non-Goals

Goals: transición legible y finita, progreso verdadero en acciones, estado accesible de copia y espera. Non-goals: bibliotecas, animar con datos inventados, cambios al servicio, cierre humano ficticio, ola 4.

## Decisions / Options

- API nativa vs biblioteca: elegir API nativa y fallback instantáneo sin dependencias. [Chrome, same-document](https://developer.chrome.com/docs/web-platform/view-transitions/same-document) consultado el 2026-09-26: snapshot anterior, callback que cambia DOM, snapshot nuevo. No dispararla después de mutar ni asumir callback síncrono. Solo cambios de ruta/pestaña, no cada letra/archivo. Un controlador serializa/cancela generaciones; run espera el commit y restaura foco después de habilitar controles. Reduced motion no llama la API; skip/fallo no deja pantalla vacía.
- Tokens de duración 120/200/280 ms y salida; entradas de filas 40 ms escalonadas hasta ocho. Sin transform persistente en contenedor ni pulsos decorativos. Gradiente solo Inicio/final; deshabilitados legibles.
- Lista hereda el umbral contractual 300 ms (prevalece criterio observable del issue sobre el texto orientativo 1 s), timeout 10 s. Para actividad breve no mostrar indicador antes de 1 s salvo progreso determinado recibido; jamás fabricar porcentaje. Pasados 10 s se mantiene etapa y Detener. Indicador del asistente se monta en footer hermano de contenido; otras pantallas usan bloque en flujo.
- Avisos de éxito: máximo dos, duración 4 s, texto plano y región status. Copia: iniciar restaura texto normal; solo éxito IPC pone Copiado durante 2 s. Fallos llegan al panel global y no conservan éxito anterior.
- Lectura en frío: solicitar dos personas ajenas al comienzo; respuestas literales sobre Inicio y paso 1. Mantener prueba de exportación previa del protocolo. Si no hay respuestas, archivo con readers vacío/status pending, tarea y gate abiertos. Un agente no es un lector.

## Compatibility, ownership, cost and recovery

No servicios o canales nuevos, ni dependencias/costo. Datos de consumidores y ownership intactos; MIT existente. Revertir PR restaura UI. Preservar seguridad de documento exacto con hash de #148 y todos los controles negativos anteriores.

## Risks / Trade-offs

- Snapshot/foco tardío → commit awaitable y token de generación; probar teclado y cambios sucesivos.
- Barra pierde indicador al reconstruirse → nodo persistente montado después de cada commit, prueba de progreso/cancelación nativa.
- Toast fuera de pantalla / tapa controles → región acotada en flujo, no overlay permanente.
- Efecto decorativo parece actividad → retirar animaciones de reposo; medir pseudo-elementos y reduced-motion.

## Action Items

Ver tasks.md. Personas para lectura siguen pendientes; no bloquea la implementación técnica ni se cuenta como aprobada.

## 2026-09-29 · ajuste de Inicio solicitado por el mantenedor

La segunda lectura de la copia breve cumple; no acredita variantes posteriores. Después de rechazar la
columna centrada y el ejemplo de preparación, el mantenedor pidió beneficios y profundidad visual con
gradientes o movimiento. Se conserva el titular y párrafo principal. El apoyo describe capacidades
implementadas: cambios de software definidos y revisables con OpenSpec, consulta de archivos con
referencias e instrucciones organizadas en la carpeta. No afirma mayor precisión, ahorro ni eficiencia
de una IA, ni presenta CodeGraph como un RAG general.

El fondo degradado se limita a Inicio; no es un halo de estado ni un patrón de otras pantallas. La entrada
y la respuesta de opacidad al cursor/foco son finitas, de hasta 280 ms. Se conserva la prohibición de
animación decorativa permanente, blur, transform persistente en contenedores, red y nuevas dependencias.
Los beneficios quedan junto al texto en escritorio y después de las acciones en ventanas compactas.
Se miden reflow, teclado, gradientes, pseudo-elementos y movimiento reducido antes de mostrar capturas.
La propuesta sigue pendiente de aceptación visual y de una lectura correspondiente a su copia final.

## 2026-09-29 · fondo continuo de toda la aplicación

El mantenedor aprobó el carácter del degradado, no la variante completa, y pidió explícitamente que
cubra toda la ventana, encabezado incluido, y esté animado en todos los pasos y menús. Esta petición
reemplaza las restricciones anteriores de fondo solo en Inicio y ausencia total de animación ambiental.
Se adopta una única excepción: pseudo-elementos del body, fijos al viewport, sin descendientes ni
captura de puntero. Un campo base permanece estático y otro cruza su opacidad en un ciclo de 20 s.
No se anima ni transforma el body, shell, main, contenido, rail o footer. La capa no se reconstruye al
cambiar de ruta; no extiende el scroll. No hay blur, red ni dependencia nueva.

Reduced motion detiene el ciclo y mantiene un gradiente estático. Controles y navegación conservan
120/200/280 ms; la excepción no autoriza animaciones largas arbitrarias. Los harnesses deben detectar
esa única animación por su nombre y origen exacto, comprobar su duración/propiedades/ausencia en reduced
y no esperar que termine un ciclo infinito antes de continuar. Contraste y hit-testing se prueban en
ambos extremos de la opacidad y con menús/diálogos abiertos.

La copia de Inicio ahora ofrece revisar los cambios que la IA documente con OpenSpec en software,
preparar sin terminal y revisar la continuación o deshacer una preparación. No promete registrar
automáticamente todos los cambios de cualquier IA. Se conservan el titular, el párrafo breve y el
primer paso. Lectura en frío de la copia final y aceptación visual siguen abiertas.

## 2026-09-29 · aprobación de la base y refinamiento de iluminación

El mantenedor aprobó la variante mostrada (fondo global y beneficios) y pidió dos refinamientos:
retirar el subtítulo redundante del paso 1, y destacar solo Project Engineering OS, sin colorear «con»,
con una pasada de brillo. También pidió llevar ese lenguaje a las acciones de continuación del resto
del Companion. Se conserva la aprobación de la base, no se inventa aprobación de los nuevos bytes.

La iluminación es decorativa y finita: token independiente de 900 ms. Los títulos que ya tienen
degradado reciben una pasada al entrar; el overlay compartido de button.primary recibe una al hover
o al foco visible por teclado. No se anima el texto de los botones ni sus cajas; el pseudo-elemento
no recibe clics y no existe en estados deshabilitados. No se añaden animaciones de espera, de éxito
ni incentivos a borrar/deshacer. Reduced motion la elimina. Esta excepción no permite que los estados
de control, la navegación o las esperas superen los límites existentes, ni añade otro bucle.

El contraste se acota incluyendo el máximo de brillo sobre cada fondo primario, normal y hover.
El harness comprueba nombre, origen, duración y una sola iteración, puntero, disabled/reduced,
hit-testing y pasos reales, sin esperar el infinito ambiental. Las capturas corresponden al renderer
real; las muestras de fases de iluminación se identifican como tiempo controlado de la prueba.

## 2026-09-30 · distinguir búsqueda y texto para la IA

La ronda final reportada identifica los campos del paso 1, pero una persona pregunta qué control
debe evaluar en Archivos y otra interpreta la pantalla como búsqueda de archivo. El protocolo
de lector nuevo y señalamiento del botón todavía debe confirmarse. No convertir estas respuestas
en aprobación del control de exportación; la interrupción duplicó el mensaje, no los lectores.

Dentro de la delegación de ola 3 y la microcopia de #149, separar dos tareas con encabezados y
superficies: Buscar en tus archivos y Preparar texto para tu IA. En escritorio compartirán una
fila; en pantallas compactas quedarán en secuencia, búsqueda primero. Los resultados quedan
debajo, no dentro de la acción para IA. Conservar las definiciones locales, nombre del botón,
IPC de exportPreview/copyExport, revisión y aviso de no envío. Explicar en una frase que se
prepara texto con coincidencias de la búsqueda para revisar y pegar en el chat. Una consulta
vacía no puede exportarse: deshabilitar esa acción hasta escribirla, sin sustituir la validación
del servicio ni exigir que se haya pulsado Buscar. No es una integración automática con IA.

Riesgos: paneles apilados demasiado largos, acción fuera de alcance, pérdida de definiciones o
query desincronizada. Verificar tamaños/movimientos, contraste/oclusión, consulta vacía → escrita
→ vacía, vista previa y copia explícita real. Rollback: revertir renderer y tests, sin migraciones.
Lectura humana del control revisado y aceptación visual siguen pendientes.

El controlador común de actividad vuelve a habilitar controles al terminar. Para no perder la
condición de consulta vacía al renderizar o buscar, la acción declara `data-disabled-idle` y el
controlador conserva esa condición además de busy. El atributo no autoriza una exportación ni
reemplaza la validación del servicio. Probar reentrada y liberación de actividad, no solo input.

## 2026-09-30 · origen y finalidad del texto exportado

La siguiente observación se conserva en `evidence/export-reading-followup.json`: una persona
interpreta el control como búsqueda de archivos y otra reconoce texto para llevar a la IA,
aunque pregunta con qué motivo. La segunda reconoce la acción mínima que pide el protocolo;
su duda sobre la finalidad no añade un criterio de rechazo nuevo. El resultado conjunto es
mixto. El mantenedor confirmó después lectores nuevos, captura actual y control señalado sin
abrirlo ni explicar; no se infiere fecha de entrevista o momento de dudas. No exigir unanimidad
como si el protocolo la hubiera establecido.

Refinamiento acotado dentro de la delegación de ola 3/#149: sustituir el nombre genérico por
«Revisar texto de mis archivos para mi IA», nombrando origen y siguiente acción real. El título
será «Dale información de tus archivos a tu IA» y la descripción explicará que reúne fragmentos
de la búsqueda para darle esa información, con revisión antes de copiar. No escribe respuestas
con un modelo, no promete mejoras de calidad y no envía contenido. Esta actualización sustituye
la conservación del nombre anterior en la decisión de arriba; las evidencias viejas conservan
el nombre observado entonces. Actualizar el protocolo actual, no sus criterios de comprensión.

Sin cambiar consultas, handlers, IPC, revisión/copia explícita, límites o disponibilidad. Inicio
y paso 1 permanecen intactos. Riesgo: el nombre más largo debe envolver sin overflow/oclusión
en cuatro anchos y ambos movimientos. Probar revisión, Escape/foco, copia exacta y avisos;
revertir solo microcopia/tests si falla. Aceptación visual y observación humana no se simulan.
