# ADR-148: navegación y lista sin ampliar el servicio

**Status:** Accepted for implementation under delegated issue scope; human visual acceptance pending.
**Date:** 2026-09-26
**Deciders:** IgnacioBarEsp (scope); implementer (technical choice within renderer).

## Context

listProjects devuelve Promise.all con presupuesto individual de 1500 ms; no hay eventos por fila. #144 ya extrajo home/workspace y router. No repetir esa base ni cambiar el servicio.

## Goals / Non-Goals

Goals: lista legible, carga verdadera, cuatro destinos estables, guía primero, acciones únicas. Non-goals: nueva inferencia, modificar comprobaciones, streaming IPC, ola 4.

## Decisions / Options considered

1. Conservar respuesta atómica (complejidad baja, sin costo/deps) vs añadir streaming (medio, fuera de alcance). Elegida respuesta atómica: en reaperturas usar identidades de la lista anterior para esqueletos SIN veredicto anterior; en primera carga usar filas anónimas sin fingir cantidad real. Nada de skeleton antes de 300 ms; a 10 s error accionable y no conservar skeleton. Las demás filas conservan su resultado cuando una falla en el servicio.
2. Extraer componentes de veredicto/fila y pantallas por pestaña, no duplicar su lógica. Reusar clases/atributos semánticos que ya tienen probes; actualizar el conjunto de archivos revisado en pruebas de fuente.
3. Cuatro botones aria-pressed con navegación de flechas/Home/End y Enter/Space, región única etiquetada. Hash interno cerrado por proyecto y pestaña; history.replaceState evita disparar cambios de documentos o cargar rutas externas. No aceptar ids ajenos al proyecto abierto. Cambios de pestaña solo montan su contenido. Mantener foco en el segmento cuando se navega con teclado.
4. Cabecera usa el reporte real del servicio, nunca considera listo porque exista un archivo. Calificador de fecha/cobertura del mismo tamaño. Guía primero con título Qué hacer ahora; la revalidación vive solo en cabecera.

## Risks / Trade-offs

- Respuesta tardía o navegación durante carga → token de generación, timeout acotado y comprobar pantalla vigente; nunca mutar estado con respuesta vencida.
- Pasar un probe vacío → conservar READY_CLAIMS, ROW_MENUS, GUIDE, LIST_PURITY y sus mutaciones; comprobar nuevas rutas con eventos reales.
- URL revelando ruta local → solo id opaco, jamás ruta de disco ni nombre/objetivo.

## Compatibility, ownership, cost and recovery

Sin canales nuevos, migraciones, dependencias ni servicios. MIT existente; datos del consumidor intactos. Revertir PR revierte renderer y pruebas. Dependencias #144–#147 siguen apiladas; no archivar ni fusionar antes de aceptación/revisión requerida.

### Ajuste nativo requerido por las URLs internas

Reproducción Electron: listProjects rechaza `peos://app/index.html#/start` y acepta el mismo documento sin hash. El main valida URL literal y omite el hook de cierre con hash. La compatibilidad exige permitir únicamente el fragmento sobre la identidad EXACTA `peos://app/index.html`; ventana y mainFrame siguen comparándose por identidad. No aceptar query, puerto, credenciales, otro protocolo, host ni ruta. No cambia canales ni servicio; se añade un predicado de identidad compartido por IPC/cierre, probado con negativos y reapertura nativa. Esta excepción mínima al alcance renderer es necesaria para la URL pedida, no una ampliación de acceso.

## Action Items

Ver tasks.md. No preguntas técnicas abiertas; gates humanos continúan pendientes.
