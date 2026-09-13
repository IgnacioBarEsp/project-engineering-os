## User Story

Como persona que va a continuar en su propia IA, quiero que el prompt que me entrega Companion sea profundo y específico de mi proyecto —no una plantilla genérica—, para que mi IA sepa qué instalar, cómo trabajar y qué reglas seguir sin que yo tenga que explicárselo.

## Context / Problem

El mantenedor lo dijo directo: *«el prompt que te da al final para dárselo a la IA es muy simple, vago y sin profundidad, no le pide a la IA que instale las herramientas necesarias según tu tipo de proyecto»*.

Hoy el prompt es prácticamente el mismo para los cinco perfiles. No sabe si la persona es principiante o desarrolladora, si eligió React o Flutter, si aún es pronto para elegir tecnología, ni qué hay realmente dentro de la carpeta.

## Desired Outcome

Un motor que arma el prompt a partir de lo que la aplicación ya sabe —perfil, objetivo, experiencia, IA elegida, y un **inventario de tipos y conteos de archivo**— y que opcionalmente lo afina con un modelo.

**Cuatro niveles, y el modelo nunca ve el contenido de tus archivos:**

| Nivel | Cuándo | Qué necesita |
| --- | --- | --- |
| 0 · Plantillas | siempre | nada; la app funciona completa |
| 1 · Modelo local | LM Studio detectado en el equipo de la persona | nada hosteado |
| 2 · Proveedor gratuito | si la persona lo acepta | clave del proveedor, declarado en pantalla |
| 3 · Clave propia | la persona pega la suya | nada nuestro |

**Cuando hace falta más profundidad**, el companion no lee los archivos: genera un prompt para que la IA que la persona **ya usa** investigue su propia carpeta y pegue el resumen de vuelta en el asistente. Esa IA ya tiene acceso a los archivos y es más capaz que cualquier modelo pequeño, y así la promesa de la pantalla —«los documentos se procesan en este equipo»— queda intacta.

## Scope

- **En alcance:** motor de prompts por perfil/experiencia/inventario, interfaz compatible con OpenAI para los cuatro niveles, degradación honesta cuando no hay modelo, el prompt de «que tu IA investigue y pegue aquí», y la declaración en pantalla de qué recibe cada proveedor.
- **Fuera de alcance:** **el gateway hosteado por el mantenedor** (issue propio, ver riesgos), la apertura de aplicaciones, y la instalación de stack.

## Acceptance Criteria

- [ ] Sin ningún modelo disponible, la aplicación funciona completa y el prompt que entrega es útil: el nivel 0 no es un modo degradado disfrazado.
- [ ] **Ninguna ruta envía contenido de archivos a ningún modelo.** Solo respuestas del asistente e inventario de tipos y conteos, y existe una prueba que falla si eso cambia.
- [ ] La pantalla dice qué proveedor se usará y qué recibirá, antes de usarlo, y la persona puede negarse sin perder la aplicación.
- [ ] Dos proyectos de perfiles distintos producen prompts distintos, y la diferencia es comprobable, no cosmética.
- [ ] Un proveedor caído o lento degrada al nivel inferior sin bloquear la preparación, y lo dice.
- [ ] Los tiempos de espera y los límites de uso están acotados: ningún nivel puede colgar la interfaz.

## Decision Criteria

**Ninguna clave del mantenedor se distribuye dentro de la aplicación.** El companion se empaqueta con `asar: false`, así que su código va en texto plano en `resources/app` y una clave ahí se extrae en segundos. Un nivel hosteado exige un servicio que guarde la clave del lado del servidor con límites por instalación, y eso es su propio issue.

Recomendación de proveedor por defecto para el nivel 2: **Cerebras**, por su volumen diario, con **Groq** como respaldo automático por tener límites distintos. Ambos detrás de la misma interfaz para que LM Studio y una clave propia se conecten igual. Los tiers gratuitos suelen entrenar con lo que reciben; como no se envía contenido de archivos el riesgo es bajo, pero **debe decirse en pantalla**.

## SDD / Documentation Impact

- `docs/companion/EXPERIENCE.md` y `docs/companion/SECURITY.md`: qué recibe cada nivel y qué no.
- Spec nueva o extendida para el contrato del motor de prompts.

## Validation / Evidence

- Prueba que falla si cualquier ruta mete contenido de archivo en la petición al modelo.
- Prompts generados para los cinco perfiles, conservados como evidencia y comparados entre sí.
- Comprobación de degradación: sin modelo, con modelo caído y con modelo lento.

## Risks / Open Questions

- Un modelo pequeño puede redactar un prompt peor que la plantilla. Mitigación: la plantilla es el piso y el modelo solo puede mejorarla, con comparación registrada.
- Abierto: si el nivel 2 debe venir activado o apagado de fábrica. Inclinación: apagado, y que la persona lo encienda sabiendo qué recibe.


---

## Historia Original

Todo lo anterior a esta línea es la historia original tal como la escribió el mantenedor el 12 de septiembre
de 2026, con su cita textual. No se reinterpreta ni se resume: los criterios de aceptación y de decisión de
arriba son los que rigen.

## Enriquecida

La base es `main` con #97 y #98 integrados. Lo que hoy existe, leído del código y no de la memoria:

- **El prompt final es una sola plantilla.** `startingPrompt` en `apps/companion/desktop/service.mjs` produce
  el mismo texto para los cinco perfiles: nombre del proyecto, objetivo, «abre la carpeta y lee START.md y
  context/MAP.md», y tres frases de límite. No sabe si la persona es principiante, ni qué eligió, ni qué hay
  en la carpeta. La cita del mantenedor —«muy simple, vago y sin profundidad»— describe exactamente eso.
- **#98 dejó una composición que este issue reemplaza.** `guide()` compone pasos desde las recetas del perfil
  y las etapas pendientes, y su texto para la IA sale de la receta. Está declarado ahí que el contenido de
  esos textos es este issue.
- **El inventario ya existe y ya distingue tipos.** `inspectFolder` devuelve por archivo `{path, extension,
  bytes, modified, kind}` con `kind ∈ text|pdf|binary`, más una recomendación de perfil. El nivel 0 puede ser
  específico sin abrir un solo archivo.
- **La aplicación nunca ha hecho una petición HTTP saliente desde la interfaz.** La política de contenido del
  renderer es `connect-src 'none'`: el renderer no puede hablar con la red aunque quiera. Lo único que sale a
  Internet hoy son las descargas de la cadena de herramientas, en el proceso principal, contra una lista de
  orígenes revisada y verificadas por digest (`runtime/download.mjs`).

Eso último es lo que este issue cambia de verdad, y conviene decirlo antes de empezar: **los niveles 1, 2 y 3
introducen una capacidad que esta aplicación no tiene**, que es hablar con un servicio de inferencia. La
frontera que ya existe es la correcta y hay que conservarla —la petición se hace en el proceso principal,
nunca en el renderer— pero el resto hay que construirlo con el mismo cuidado que las descargas: lista de
destinos explícita, tiempos de espera acotados, tamaño de respuesta acotado, y ninguna credencial dentro del
paquete.

Hay una segunda cosa que merece precisión. El criterio dice «solo respuestas del asistente e **inventario de
tipos y conteos**». El inventario que existe lleva **la ruta de cada archivo**, y una ruta es dato de la
persona: `contrato-despido-2024.pdf` dice más que su extensión. Lo que puede salir es un agregado —extensión,
cantidad y clase, más totales— y nunca la lista de rutas. La prueba que el issue pide tiene que fallar si una
ruta aparece en la petición, no solo si aparece el contenido de un archivo.

### Criterios observables

- Sin ningún modelo disponible la aplicación funciona completa, y el prompt del nivel 0 se compara con el
  actual: es más largo, nombra el tipo de proyecto, lo que hay en la carpeta y lo que falta, y se conserva
  como evidencia para los cinco perfiles.
- Ninguna petición a un modelo contiene el contenido de un archivo **ni la ruta de un archivo**, comprobado
  interceptando la petición y fallando si aparece cualquiera de los dos.
- La pantalla dice qué proveedor se usará y qué recibirá antes de usarlo, y negarse deja la aplicación
  completa; el nivel 2 viene apagado de fábrica.
- Dos perfiles distintos producen prompts distintos, comparados por su contenido y no por su longitud.
- Un proveedor caído, lento o que responde basura degrada al nivel inferior sin bloquear la preparación, y la
  pantalla lo dice con su causa.
- Ningún nivel puede colgar la interfaz: cada llamada tiene tiempo de espera y tamaño máximo, y la prueba mide
  el tiempo en lugar de afirmarlo.
- La plantilla es el piso: si el modelo devuelve algo peor o inválido, se usa la plantilla, y la comparación
  queda registrada.

### Alcance y límites

El motor de prompts por perfil, experiencia e inventario agregado; una interfaz compatible con OpenAI para los
cuatro niveles; la degradación honesta; el prompt de «que tu IA investigue tu carpeta y pega el resumen aquí»;
y la declaración en pantalla de qué recibe cada proveedor. **Fuera de alcance: el gateway hosteado por el
mantenedor, que es el issue #107**, la apertura de aplicaciones (#100) y la instalación del stack. Ninguna
clave del mantenedor se distribuye dentro de la aplicación: se empaqueta con `asar: false` y el código va en
texto plano.

Sin republicar el núcleo 0.5.0, sin tocar `CI / required`, la protección de rama, la lista de archivos del
instalador ni la política de contenido del renderer, que es la que impide que la interfaz hable con la red.

Queda abierto en el issue si el nivel 2 viene activado de fábrica. La inclinación del propio issue es que no;
se resolverá en el design con su motivo registrado. Y probar el nivel 1 de verdad exige un modelo local
corriendo en esta máquina: si no lo hay, se declara sin verificar con su causa en lugar de simularlo.

<!-- project-os-readiness:pre-propose
{
  "schemaVersion": "1.0.0",
  "change": "compose-project-specific-prompts",
  "execution": "versioned",
  "dependencies": [98],
  "currentState": {
    "summary": "El prompt final es una sola plantilla igual para los cinco perfiles, la composicion de #98 declara que su contenido es este issue, el inventario ya distingue tipos y clases sin abrir archivos, y la aplicacion no tiene ningun cliente de inferencia: el renderer no puede hablar con la red y lo unico que sale hoy son las descargas de la cadena de herramientas contra origenes revisados.",
    "sources": ["https://github.com/IgnacioBarEsp/project-engineering-os/issues/99", "https://github.com/IgnacioBarEsp/project-engineering-os/pull/109"]
  },
  "scope": ["Motor de prompts por perfil, experiencia e inventario agregado", "Interfaz compatible con OpenAI para los cuatro niveles, con degradacion honesta", "Prompt para que la IA de la persona investigue su carpeta y pegue el resumen", "Declaracion en pantalla de que recibe cada proveedor"],
  "observableCriteria": ["El nivel 0 produce un prompt especifico sin ningun modelo y se conserva para los cinco perfiles", "Ninguna peticion a un modelo lleva contenido ni rutas de archivo, comprobado interceptando la peticion", "El nivel 2 viene apagado y negarse deja la aplicacion completa", "Dos perfiles producen prompts distintos comparados por contenido", "Un proveedor caido o lento degrada al nivel inferior y lo dice", "Cada llamada tiene tiempo de espera y tamano maximo medidos"],
  "owner": "Ignacio Bar Esp",
  "risks": ["Que una ruta o el contenido de un archivo salgan hacia un proveedor", "Que una clave quede dentro del paquete, que va en texto plano", "Que un modelo pequeno redacte un prompt peor que la plantilla", "Que una llamada lenta cuelgue la preparacion"],
  "surfaces": ["documentation", "harness-tooling", "ui"],
  "manualInterventions": [],
  "costLicenseReview": {"status":"approved","owner":"Ignacio Bar Esp","evidence":"Autorizacion expresa del mantenedor para llevar los once issues abiertos de inicio a fin con el flujo SDD del repositorio, 12 de septiembre de 2026.","justification":"No se anaden dependencias ni servicios pagados. Los niveles 2 y 3 usan tiers gratuitos o la clave de la propia persona, ninguna clave del mantenedor se distribuye, y el nivel 0 funciona sin nada. Licencia MIT sin cambios."},
  "evidence": {"automatic":["component-or-interaction-tests","accessibility-check","responsive-check-when-configured","openspec-strict","secret-scan","constructor-tests"],"manual":["Prompts generados para los cinco perfiles conservados y comparados, interceptacion de la peticion al modelo, degradacion con proveedor caido y lento, y revision adversarial independiente"]},
  "rollback": {"strategy":"Revertir el PR: el prompt vuelve a la plantilla unica, el cliente de inferencia desaparece con el cambio y no queda ninguna configuracion que leer. No se toca ninguna carpeta preparada ni entrada de historial.","trigger":"Cualquier ruta o contenido de archivo saliendo hacia un modelo, una clave dentro del paquete, o una llamada que bloquee la preparacion.","recovery":"Restaurar los archivos anteriores del servicio y de la interfaz y volver a correr los dos arneses contra la ventana instalada."},
  "nonGoals": ["El gateway hosteado por el mantenedor, que es el issue 107", "La apertura de aplicaciones de escritorio, que es el issue 100", "La instalacion del stack de desarrollo", "Estudio de usabilidad o revision humana"],
  "exceptions": []
}
project-os-readiness:pre-propose -->

