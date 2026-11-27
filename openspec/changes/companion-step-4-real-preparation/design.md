## Context

ADR-147. Estado: aceptado para implementar dentro del alcance autorizado; revisión independiente y aceptación visual pendientes. Fecha: 2026-09-26. Decisor de alcance: IgnacioBarEsp (#147 y autorización de completar la ola 3). Base apilada: #196/#197/#198, aún sin fusionar. Los motores tienen previews con identificadores opacos, hash/revalidación y transacciones recuperables; no se sustituyen.

## Goals / Non-Goals

**Goals:** ejecutar las dos vías con estados reales y producir un prompt fiel; preservar consentimiento, aislamiento, proyectos antiguos y controles de recuperación.

**Non-Goals:** otro instalador, inferencia, dependencias, descargas no catalogadas, aprobación humana simulada o empezar ola 4.

## Decisions

1. Orquestador pequeño en renderer, probado sin DOM, llama pares IPC existentes. Mantiene estados por etapa y nunca considera `apply` sin error como prueba de todo el proyecto. El resultado final pide `status`, cuyo `stageReport` es la autoridad. No se crea un segundo sistema transaccional.
2. Revisión incremental en el mismo paso 4. Contexto necesita base guardada; bootstrap necesita herramientas; activación necesita bootstrap. El plegable acumula la unión de planes que realmente existen y avisa de los pendientes. Cada nuevo alcance de escritura/descarga requiere el botón primario de aplicar el plan mostrado. Alternativa descartada: predecir archivos futuros (impreciso); alternativa descartada: clonar/preparar en una sombra para calcularlos (coste alto, descargas antes de aprobación y resultados distintos por ubicación). Consecuencia: varias aprobaciones dentro de un solo paso, sin volver al antiguo recorrido de pantallas separadas.
3. Reconciliar la base/contexto y las instrucciones al final si los archivos generados por etapas posteriores invalidaron los recibos. Esos planes también se revisan, con límite de ciclos; nunca un bucle automático ni ocultar lo pendiente.
4. Prompt de activación puro compuesto por el servicio con comprobación actual, nunca por estado optimista del renderer. El handoff conserva texto revisado e identidad de carpeta; copiar no abre ni envía. El modo de activación es opcional en el endpoint existente y no cambia prompts de mantenimiento.
5. Rutas nuevas mediante un formato versionado compatible: recibos/transacciones v1 se validan con su conjunto cerrado original; v2 conoce el conjunto ampliado y bloques por destino. Claude importa AGENTS; archivos ajenos se preservan. Ningún archivo acredita que el agente lo leyó.
6. En Software local, el primer contexto reserva `.project-os/instructions.md` antes del bootstrap, sin crear espejos propiedad del núcleo. `corePresent` registra por separado la presencia real del núcleo, que invalida el contexto para revisarlo después de bootstrap. El núcleo adopta la fuente project-owned solo con su propio plan/hash. Los espejos existentes del núcleo (incluido CLAUDE.md) conservan su formato oficial; el import @AGENTS.md corresponde a rutas directas gestionadas por Companion, no a una reescritura de espejos ajenos.
7. La visión se integra en un journal base v2 (v1 sigue siendo recuperable). Es seed-once, revisada por hash, nunca se sustituye un archivo existente. Se retira el catch vacío previo, que podía declarar la base aplicada aunque faltara la visión.

## Risks / Trade-offs

- [Cancelación entre etapas] → no iniciar otra etapa tras detener; estados interrumpidos conservados; cerrar mientras se escribe se rechaza como en #146.
- [Planes caducados] → re-preview al reintentar y conservar comprobación hash de cada motor; no reutilizar tokens consumidos.
- [Bootstrap adopta archivos de agentes] → replanificación y sincronización de contexto explícitas, pruebas de compatibilidad.
- [Lectura/descarga lenta] → canal real de progreso; solo usar porcentaje si completed/total son finitos y total positivo.
- [Prompt injertado por documentos] → agregados sin nombres/contenido; visión identificada como datos del usuario y reglas fijas; no llamar modelos.

## Ownership, Cost and License

Companion posee renderer/estado de aplicación/recibos; núcleo y OpenSpec conservan archivos y workflows oficiales. Catálogos y licencias existentes sin cambios de coste ni servicios. No alterar archivos no gestionados ni instalar en proyectos reales para pruebas.

## Migration Plan

Lectura compatible sin escrituras. Actualización de rutas solo por preview/aplicar explícitos. Revertir PR para código; conservar originales y recuperación de operaciones antiguas. Pruebas en carpetas temporales.

## Open Questions

Aceptación visual y recorrido del mantenedor pegando el prompt en su IA quedan como gates reales. No se cierran por la revisión propia.
