## Context

El cambio está aprobado bajo la delegación expresa del mantenedor para llevar los issues abiertos de este
programa de inicio a fin; el DoR real de #105 pasó con `PASS 13 | FAIL 0 | EXCEPTION 0`. El bounded context es
`companion-evaluation`: la app instalada y sus fuentes son entradas inmutables de la medición; el arnés y la
evidencia son propiedad de este upstream; los repositorios externos conservan su autoría y licencia.

El instrumento sintético actual ya separa tres vías, pero no puede demostrar comportamiento a escala. Además,
una revisión anterior encontró métricas decididas por el propio script. Por eso aquí importan tanto el orden
del procedimiento y los datos crudos como el número final.

Invariantes:

- el producto no cambia para mejorar el resultado;
- repositorios, commits, alcance y preguntas quedan versionados antes de la primera ejecución;
- las tres vías reciben el mismo corpus y el mismo término de búsqueda por pregunta;
- encontrar la fuente y devolver la respuesta conocida son observaciones distintas;
- bytes devueltos, bytes de fuentes leídos y bytes de índice leídos se nombran por separado;
- tokens solo existen si el proveedor los expone; este arnés determinista los declara no medidos;
- un resultado desfavorable se publica en el mismo change.

## Goals / Non-Goals

**Goals:** un protocolo precomprometido y comprobable; dos corpora públicos de dominios distintos fijados por
commit; un arnés reproducible sobre la aplicación instalada; datos crudos por pregunta; publicación fiel de
resultados y límites; y una revisión independiente capaz de intentar que el instrumento falle.

**Non-Goals:** cambiar búsqueda, formatos, límites o ranking de Companion; comparar productos; evaluar la prosa
de un modelo; afirmar ahorro de tokens o alucinaciones; añadir GitNexus/CodeGraph al upstream; o convertir esta
medición en un estudio con personas.

## Decisions

### El protocolo durable es parte del arnés y el precompromiso queda en Git

Un JSON bajo `apps/companion/benchmarks/real-repositories/` nombra repositorio, commit, subtree, licencia,
criterios de tamaño y preguntas. Un manifiesto declara su SHA-256 y el runner se niega a continuar cuando los
bytes no coinciden. La ejecución exige además que protocolo, manifiesto y runner estén limpios y presentes en
el commit que el reporte guarda. La primera ejecución ocurre solo después de ese commit; los resultados se
añaden en un commit posterior.

Alternativa descartada: conservar el archivo únicamente dentro del change. Al archivarlo cambia de ruta y el
comando deja de ser reproducible. Alternativa descartada: calcular el digesto y aceptarlo en la misma línea de
comandos; eso deja que quien corre el experimento cambie preguntas y digesto después de ver una respuesta.

### Los corpora son exportaciones limpias de commits revisados

El runner recibe checkouts locales, comprueba remoto y commit exactos y exporta solo el subtree declarado a
una carpeta temporal. `.git`, índices y artefactos de control no entran al corpus. El inventario de cada
exportación se guarda antes de preparar y prueba los umbrales de al menos 2000 archivos textuales y 20 MiB de
fuentes legibles según el protocolo. Un checkout equivocado, sucio en el subtree o que ya no cumple el umbral
detiene la ejecución antes de medir.

Los candidatos fijados son `kubernetes/website` en `content/en` para prosa/documentación y `python/cpython`
para código. Son públicos, ajenos al proyecto, de dominios distintos y se citarán con sus licencias y commits.
Si la verificación previa invalida un candidato, no se sustituye en silencio: el descarte se publica y el
protocolo vuelve a aprobación antes de ejecutar.

Alternativa descartada: descargar el snapshot de la rama por defecto. No fija identidad. Alternativa
descartada: medir el checkout con `.git` y caches. Hace que las líneas base paguen bytes que Companion excluye.

### La simetría está en la entrada; las diferencias de salida se conservan

Cada pregunta tiene un único `query`, una fuente y una respuesta conocida. Abrir todo concatena los mismos
archivos con localizador de archivo; el barrido literal recorre esos bytes y devuelve coincidencias con
archivo/línea; Companion prepara exactamente esa exportación y busca el mismo `query`. Ninguna vía recibe la
ruta esperada ni la respuesta durante recuperación. La puntuación se calcula después comparando la salida con
la clave.

No se fuerza un localizador idéntico: archivo, archivo/línea y pasaje son capacidades reales distintas. Sí se
exige que cada salida conserve el localizador que naturalmente produce y se reporta su clase.

### Los bytes se contabilizan por capa y nunca se llaman tokens

Las líneas base suman los bytes que abren y los bytes que devuelven. Para Companion se registran por separado
los bytes de fuentes que sus funciones instaladas vuelven a leer para validar frescura y los bytes del índice
que consulta; el total publicado es la suma de esas categorías. Metadatos de directorio y lecturas del sistema
operativo no se convierten en bytes inventados: quedan fuera y el reporte lo declara. El costo inicial conserva
tiempo monotónico, bytes escritos y cobertura completa/parcial.

Alternativa descartada: contar solo el índice, como el arnés sintético actual. Oculta la revalidación de las
fuentes que la aplicación hace en cada búsqueda. Alternativa descartada: derivar tokens con una razón por byte.

### La ejecución no sobrescribe evidencia

Cada intento usa una carpeta nueva y escrituras exclusivas. El reporte conserva identidad de aplicación,
módulos instalados, runner, protocolo, sistema, corpora, cobertura, resultados por pregunta, errores y límites.
Los checkouts y las copias preparadas son temporales; solo se versionan protocolo y evidencia redactada. Las
rutas locales se anclan y ningún secreto ni identidad de cuenta entra al resultado.

## Risks / Trade-offs

- [Los límites del inventario pueden hacer perder a Companion] → se publican como cobertura parcial; no se
  elevan para el benchmark.
- [Un término literal puede favorecer una vía] → distribución por tipos escrita antes, fuente/respuesta
  verificadas y revisión adversarial por pregunta antes de interpretar el resultado.
- [Los bytes internos no equivalen a I/O físico] → el reporte los define como bytes de contenido abiertos por
  el algoritmo, separa categorías y no afirma costo de disco ni de tokens.
- [Clonar dos repositorios consume red y disco] → cache local explícito, commits fijados, clones fuera del repo y
  sin dependencia nueva del producto.
- [Licencias de corpora se confunden con redistribución] → no se versionan fuentes externas; solo identidad,
  preguntas, citas breves necesarias y mediciones.
- [El resultado contradice el mensaje deseado] → publicación y corrección de landing ocurren antes de cerrar.

## Migration Plan

No hay migración de producto. Primero se versionan protocolo, digesto, runner y pruebas negativas. Después se
ejecuta contra la aplicación instalada y se añaden datos crudos, resumen y documentación. El rollback es
revertir el PR completo: vuelve la evidencia sintética anterior y desaparece el arnés nuevo; los clones
temporales se pueden borrar sin afectar la app ni este repositorio.

## Open Questions

Ninguna decisión queda abierta para empezar. Si un commit no cumple los criterios escritos o una pregunta no
resuelve exactamente contra su fuente, la ejecución no empieza: se registra el descarte y se vuelve a NORMAL
para actualizar protocolo y artefactos antes de un nuevo precompromiso.
