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
