## Context

El decision record de #23 define tres rutas y cinco preguntas, pero el runtime solo conoce bootstrap, sync,
doctor, readiness y planes remotos. El nuevo clasificador debe operar sobre carpetas vacías y repositorios
existentes en Windows, macOS y Linux sin convertir una inspección en bootstrap, autenticación o escritura.

El upstream posee CLI, schemas, documentación pública y tests. Las respuestas, el estado emitido y cualquier
decisión de producto pertenecen al consumidor. El paquete sigue MIT, costo cero y sin dependencias de runtime.

## Goals / Non-Goals

**Goals:**

- Detectar señales explicables de Git, contenido, harnesses, tracker y automatización con lectura acotada.
- Clasificar de forma determinista `beginner`, `experienced-new` o `brownfield` usando hasta cinco respuestas.
- Definir un estado portable, versionado, sin timestamps ni rutas absolutas y con fingerprint estable.
- Leer un estado previo, migrar el draft v0 en memoria y conservar una recuperación no destructiva.
- Ofrecer contrato humano y JSON equivalente, errores accionables y cobertura multiplataforma.

**Non-Goals:**

- Persistir o aplicar el estado dentro del target; #30 solo planifica y emite el documento canónico.
- Cambiar Prompt 00/01, crear recursos remotos o investigar/instalar herramientas.
- Inferir stack, arquitectura, CI/CD de producto o nivel profesional desde nombres de archivos.
- Leer contenido arbitrario, secretos, dependencias instaladas o destinos de symlinks.

## Decisions

### 1. Un comando read-only y una API pura

`project-os onboarding-plan` recibirá `--target`, `--answers <ruta>` y `--state <ruta>`. Answers y state son
JSON opcionales dentro del target; el estado usa por defecto `.project-os/onboarding-state.json` si existe.
El comando nunca crea ese archivo. El módulo exportará funciones de inspección, clasificación, migración y
render para que #31 pueda componerlas sin ejecutar otra CLI.

Alternativa descartada: entrevista interactiva dentro del proceso. Bloquea CI, es difícil de reanudar y
mezcla conversación con el contrato determinista. El comando devuelve preguntas pendientes para el agente.

### 2. Inspección acotada, local y explicable

El scanner recorrerá como máximo cuatro niveles y 2,000 entradas, saltará `.git`, dependencias, caches,
outputs y directorios de vendors. No seguirá symlinks. Solo registrará IDs, categorías, rutas relativas y
metadatos seguros; no devolverá contenido. Comandos Git se ejecutarán sin shell, con timeout y únicamente
para historial, estado de trabajo y proveedor del remoto; no usan red ni imprimen la URL.

Señales fuertes de preservación: historial, cambios sin commit, código/manifiestos/documentación,
instrucciones de agentes, tracker, automatización o symlink/inspección incompleta. Una carpeta con `.git`
vacío no basta por sí sola. Los límites e inaccesibilidad quedan visibles y fuerzan conservación.

### 3. Cinco respuestas canónicas

El schema fija exactamente cinco IDs: `project`, `guidance`, `tracker`, `agent` y `remoteSetup`. Cada uno
admite valores de dominio más `unknown` y `defer`; campos ausentes se normalizan a `unknown`. `defer` añade
una decisión pospuesta y `unknown` mantiene la pregunta pendiente. Respuestas adicionales o valores libres
fallan, en lugar de ser ignorados silenciosamente.

Alternativa descartada: texto libre. Haría la clasificación dependiente del modelo y no reproducible.

### 4. Prioridad brownfield y default seguro

La ruta es `brownfield` si existe una señal fuerte o `project=preserve`; esto no puede ser rebajado por
`guidance=brief`. Sin señales, `guidance=brief` produce `experienced-new`; cualquier otro caso produce
`beginner` provisional. Así `unknown` y `defer` no bloquean el flujo, pero tampoco autorizan menos cuidado.

El plan incluye `rebootstrapAllowed=false` para brownfield y pasos de inventario/preservación. Las rutas
nuevas nunca deciden tracker, arquitectura ni configuración remota por inferencia.

### 5. Estado canónico determinista

El estado v1 contiene versiones de schema/clasificador, ruta, estado de decisión, evidencia ordenada,
respuestas normalizadas, preguntas pendientes, decisiones pospuestas, próximos pasos y `inputHash`. No
incluye fecha, hostname, username, ruta absoluta ni texto de archivos. `inputHash` se calcula sobre evidencia
y respuestas canónicas; la misma entrada produce JSON byte por byte idéntico.

El resultado separa metadata de lectura (`stateSource`, migraciones y warnings) del estado canónico para no
cambiarlo por el simple hecho de leer una copia anterior equivalente.

### 6. Migración y rollback sin escritura

El lector admite v1 y un draft v0 documentado con `stateFormatVersion: 0`, `profile`, `answers`, `signals`,
`pending` y `deferred`. Migra nombres y valores en memoria, pero vuelve a clasificar con evidencia actual.
Entrega un receipt con hash del source y versiones. Versiones futuras, JSON inválido o shapes desconocidos
fallan con recuperación explícita.

Como #30 no escribe, rollback significa conservar el archivo original y descartar la salida migrada. El
receipt permite verificar que el source no cambió. Una escritura transaccional se diseñará en #31 si la
orquestación necesita persistencia.

### 7. Compatibilidad y distribución

Los schemas viven en `schema/`, incluido por el tarball. La API se exporta desde `src/index.mjs`; el CLI
mantiene todos sus comandos actuales. Las pruebas usan rutas nativas de Node y fixtures temporales, y la CI
existente demuestra Node 20/22 en Windows, macOS y Linux. No se añade dependencia, servicio, licencia ni
telemetría.

## Risks / Trade-offs

- [Falso brownfield] → señales fuertes allowlisted, evidencia visible y pruebas negativas sobre carpetas vacías.
- [Falso greenfield por lectura parcial] → límite, symlink o error se registra y fuerza preservación.
- [Filtración de información] → no contenido, remoto reducido a proveedor, rutas relativas y errores saneados.
- [Schema prematuro] → versión y migración explícitas; campos desconocidos fallan para evitar semántica muda.
- [No persistir aún] → mantiene #30 realmente read-only; #31 recibirá API/estado estables para decidir escritura.
- [Default beginner para unknown] → añade explicación, no mutación; es más reversible que asumir experiencia.

## Migration Plan

1. Introducir módulo, schemas y tests sin modificar archivos generados del blueprint.
2. Exponer el comando y API manteniendo los argumentos existentes.
3. Validar draft v0, v1, estado futuro/corrupto, reejecución y package instalado.
4. Publicar como capacidad aditiva. Si falla, revertir el commit y usar la release anterior; ningún target
   necesita limpieza porque el comando no escribe.

## Open Questions

No quedan preguntas bloqueantes para #30. La persistencia transaccional y el uso conversacional del estado
pertenecen a #31; la configuración de trackers pertenece a #33.
