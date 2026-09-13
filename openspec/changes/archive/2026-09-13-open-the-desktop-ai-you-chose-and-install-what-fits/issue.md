## User Story

Como persona que eligió trabajar con aplicaciones de escritorio, quiero que Companion abra la aplicación que elegí —o me diga con claridad que la abra yo y me deje el prompt copiado—, y que instale lo que mi proyecto necesita de verdad, para no terminar en una página web que no pedí ni con un montón genérico que no uso.

## Context / Problem

**Defecto observado.** El mantenedor eligió versiones de escritorio y al final los botones lo mandaron a la versión web de esas IA. Cita: *«yo puse que quería las versiones de escritorio y al final los botones mandaban a la parte web»*. Eso es la aplicación ignorando una elección explícita.

**Estado real medido en su equipo**, con el lanzador propio de la aplicación y sin inyectar nada:

| IA | Instalada | Firma | Apertura local verificada |
| --- | --- | --- | --- |
| Codex | sí | OpenAI OpCo, LLC | **sí** |
| Cursor | sí | Anysphere, Inc. | **sí** |
| Visual Studio Code | sí | Microsoft Corporation | **sí** |
| Claude | sí | Anthropic | no hay contrato comprobado |
| OpenCode | sí | Anomaly Innovations | no hay contrato comprobado |
| Antigravity | sí | **sin firma** | rechazada, correctamente |

**Segundo problema: la instalación es genérica.** Cita: *«me gustaría que fuera más a fondo y que te lleve más de la mano, que te instale React, Flutter, etc. si no lo tienes (y si especificaste que lo querías) o si no sabías porque tu proyecto no va de eso o eres principiante, que te lo recomiende, o si aún es muy pronto para definir tecnología, que no lo haga e instale solo lo necesario»*.

## Desired Outcome

**Apertura honesta.** Si elegiste escritorio, nunca se abre la web. Para las tres con contrato comprobado, se abre la aplicación con la carpeta. Para el resto, la aplicación dice «abre tu aplicación y pega esto», con el prompt ya en el portapapeles. La web solo aparece si la persona eligió chat web.

**Instalación proporcionada.** Tres caminos según lo que la persona dijo:
1. **Pidió una tecnología concreta** → se ofrece instalarla, con su tamaño y destino a la vista.
2. **No sabe o es principiante** → se recomienda, con una frase que explique por qué, y se puede decir que no.
3. **Aún es pronto, o el proyecto no va de eso** → no se instala nada y se dice por qué no.

## Scope

- **En alcance:** respetar la elección escritorio/web, la ruta «abre tu app y pega esto», y los tres caminos de instalación con su explicación.
- **Fuera de alcance:** verificar el contrato de apertura de Claude y OpenCode (issue propio de investigación), y el motor que redacta el prompt (issue propio).

## Acceptance Criteria

- [ ] Elegir escritorio **nunca** abre una URL web, y existe una prueba que falla si vuelve a ocurrir.
- [ ] Una IA sin contrato de apertura comprobado muestra la instrucción de abrirla manualmente con el prompt copiado, y no finge abrirla.
- [ ] Abrir una carpeta sigue informando que no demuestra que la IA la haya leído.
- [ ] Una aplicación presente pero sin firma verificable se sigue rechazando con su causa; este cambio **no debilita** esa comprobación.
- [ ] Nada se instala sin que su identidad, licencia, tamaño y destino se hayan mostrado antes.
- [ ] Un proyecto donde aún es pronto para elegir tecnología termina sin instalar stack, y la pantalla explica por qué eso es correcto.
- [ ] Una recomendación se puede rechazar y la preparación continúa.

## Decision Criteria

La frontera de seguridad de #87 y #94 no se toca: firma válida, editor en lista, bytes sin cambiar entre revisión y apertura, y rechazo con código. Ninguna comodidad justifica abrir algo que no se pudo verificar.

## SDD / Documentation Impact

- `docs/companion/ENVIRONMENT.md`: los tres caminos de instalación.
- `docs/companion/SECURITY.md`: qué se abre, qué no y por qué.
- Spec de `companion-program-acceptance`: escenario de elección de escritorio respetada.

## Validation / Evidence

- `npm run evidence:launches` extendido: una elección de escritorio nunca produce una apertura web.
- Recorridos nativos con un perfil que pide tecnología, uno que no sabe y uno donde es pronto, comparando qué se instaló en cada caso.

## Risks / Open Questions

- Instalar stack aumenta mucho lo que la aplicación escribe en la carpeta de alguien. Mitigación: mismo contrato de revisión previa y reversibilidad que el resto.
- Abierto: si recomendar tecnología requiere el modelo del issue de prompts o basta con reglas por perfil e inventario.



---

## Historia Original

Todo lo anterior a esta línea es la historia original tal como la escribió el mantenedor el 12 de septiembre
de 2026. No se reinterpreta ni se resume: los criterios de aceptación y de decisión de arriba son los que
rigen.

Una corrección de hecho, no de criterio: la tabla de arriba dice que Claude «no hay contrato comprobado».
Eso era cierto cuando se escribió el issue. #106 encontró que el propio build de Claude declara la ruta
`claude://code/new?folder=` y que el sistema entrega ese esquema a ese mismo ejecutable firmado, así que
Claude sí se abre desde hoy. OpenCode sigue sin declarar ninguna ruta con parámetro y sigue siendo la
aplicación que ejercita la ruta de «ábrela tú y pega esto». Antigravity sigue rechazada por su firma.

## Enriquecida

La base es `main` con #97, #98, #99 y #106 integrados. Lo que existe hoy, leído del código:

**El defecto está localizado.** En `apps/companion/desktop/service.mjs`, `handoffPreview` declara
`mode: 'web'` y `destination: DESTINATIONS[agent]` en cuanto no hay una aplicación local verificada, sin
mirar qué eligió la persona, y `handoff` llama a `openExternal(DESTINATIONS[preview.agent])`. `DESTINATIONS`
tiene una URL web por cada una de las seis aplicaciones de escritorio y otra para el chat web. Es decir: la
persona elige Claude, OpenCode, Codex, Cursor, Copilot o Antigravity de escritorio, y si esa aplicación no
está instalada o no se pudo verificar, la aplicación abre el sitio web de ese producto en el navegador. Es
exactamente lo que el mantenedor describió. La pantalla además promete «Se abrirá … en tu navegador», así
que no es un descuido de una rama poco visitada: es la ruta declarada.

La elección se guarda en `selection.agents`, validada contra el conjunto de siete de
`apps/companion/engine/preparation.mjs`, donde `'web'` es el chat en el navegador y las otras seis son
aplicaciones de escritorio. No hace falta un campo nuevo para saber si alguien eligió escritorio: elegir
`codex` es elegir escritorio, y `web` es lo único que autoriza un navegador.

**La instalación es la misma para todo el mundo.** `apps/companion/runtime/catalog.mjs` fija cuatro
herramientas —motor de Node, npm, Git y el mapa de código— y `apps/companion/runtime/environment.mjs`
instala tres de ellas más el cache de ingeniería, siempre las mismas, con `IDS = ['node','npm','git']`. No
existe ninguna noción de tecnología del proyecto: ni la que la persona pidió, ni una recomendación, ni la
posibilidad de que sea pronto para decidir. `selection` guarda perfil, experiencia, rol y objetivo, y nada
de eso cambia lo que se instala.

Sí existe la maquinaria para instalar algo verificable. `createToolchainStore` prepara dependencias en una
carpeta propia con `npm ci --ignore-scripts --bin-links=false`, contra un `package-lock.json` revisado que
fija la integridad de cada paquete, sin config del sistema ni scripts de ciclo de vida, y después compara el
digesto del árbol completo y su tamaño en bytes contra un pin del repositorio. Eso es el patrón que una
capa de tecnologías tiene que reutilizar, no reinventar: lo que se instale queda anclado por un lockfile
revisado y por el digesto del árbol resultante.

**La pregunta abierta del issue se responde con una medición, no con una preferencia.** Recomendar no puede
depender del modelo: el nivel `off` de `apps/companion/runtime/inference.mjs` es un estado de primera clase
y una persona con el modelo apagado tiene el mismo derecho a una recomendación explicada. Así que la
recomendación se decide con reglas sobre perfil e inventario, que es lo que ya se mide, y el modelo —si
está— solo puede ampliar la explicación, nunca decidir qué se instala ni añadir nada al catálogo.

**Frontera que no se mueve.** Las seis comprobaciones de #106 y la lista cerrada de editores siguen
intactas. Este cambio quita una ruta —la apertura web cuando se eligió escritorio— y añade otra que no
abre nada: copiar la instrucción y decir a la persona que abra su aplicación. Nada de lo que se instale
puede llegar sin su identidad, su licencia, su tamaño y su destino a la vista, y nada puede instalarse por
una recomendación que no se aceptó.

**Lo que no se va a fingir.** Una tecnología que esta aplicación no puede instalar con la verificación que
exige —Flutter y el editor de Unity son SDK e instaladores con licencia propia, fuera de un lockfile de
npm— no se ofrece con un botón que no funciona. Se nombra, se dice de dónde viene y se dice por qué no se
instala desde aquí. Una negativa honesta es una respuesta; un botón que finge, no.

<!-- project-os-readiness:pre-propose
{
  "schemaVersion": "1.0.0",
  "change": "open-the-desktop-ai-you-chose-and-install-what-fits",
  "execution": "versioned",
  "dependencies": [106],
  "currentState": {
    "summary": "handoffPreview declara mode web y destino DESTINATIONS[agent] en cuanto no hay aplicacion local verificada, y handoff abre esa URL con openExternal, asi que elegir una IA de escritorio termina en su sitio web. La eleccion vive en selection.agents, donde web es el chat de navegador y las otras seis son aplicaciones de escritorio. La instalacion es identica para todos: node, npm y git mas el cache de ingenieria, sin ninguna nocion de la tecnologia del proyecto. La maquinaria para instalar algo verificable ya existe en createToolchainStore: npm ci con lockfile revisado, sin scripts, y digesto del arbol comparado contra un pin.",
    "sources": ["https://github.com/IgnacioBarEsp/project-engineering-os/issues/100", "https://github.com/IgnacioBarEsp/project-engineering-os/pull/111"]
  },
  "scope": ["Elegir escritorio nunca abre una URL web, con regresion que falla si vuelve a ocurrir", "Ruta de abrir a mano con la instruccion copiada para una IA sin contrato observado", "Tres caminos de instalacion segun lo que la persona dijo, con identidad, licencia, tamano y destino a la vista", "Una recomendacion rechazable que no detiene la preparacion"],
  "observableCriteria": ["Ninguna eleccion de escritorio produce una apertura de navegador, comprobado por mutacion deliberada", "Una IA sin contrato observado muestra la instruccion de abrirla a mano con el texto copiado y no afirma haberla abierto", "Abrir una carpeta sigue diciendo que no demuestra que la IA la haya leido", "Una aplicacion sin firma verificable se sigue rechazando con su causa", "Nada se instala sin que su identidad, licencia, tamano y destino se hayan mostrado antes", "Un proyecto donde es pronto para elegir termina sin stack y la pantalla explica por que eso es correcto", "Rechazar una recomendacion deja la preparacion en un estado valido"],
  "owner": "Ignacio Bar Esp",
  "risks": ["Que quitar la apertura web deje a alguien sin ninguna salida en vez de darle la instruccion copiada", "Que instalar stack escriba mucho mas en la carpeta de alguien sin revision previa ni reversibilidad", "Que una recomendacion se vuelva una instalacion por omision", "Que se ofrezca una tecnologia que esta aplicacion no puede instalar con la verificacion que exige"],
  "surfaces": ["documentation", "harness-tooling", "ui"],
  "manualInterventions": [],
  "costLicenseReview": {"status":"approved","owner":"Ignacio Bar Esp","evidence":"Autorizacion expresa del mantenedor para llevar los once issues abiertos de inicio a fin con el flujo SDD del repositorio, 12 de septiembre de 2026.","justification":"Las tecnologias que se ofrezcan entran por el mismo lockfile revisado que ya usa el cache de ingenieria, con licencia declarada por paquete y sin scripts de ciclo de vida. No se anade ningun servicio de pago. Licencia MIT del repositorio sin cambios."},
  "evidence": {"automatic":["component-or-interaction-tests","accessibility-check","openspec-strict","secret-scan","constructor-tests"],"manual":["Recorridos nativos con un perfil que pide tecnologia, uno que no sabe y uno donde es pronto, comparando que se instalo en cada caso, y revision adversarial independiente"]},
  "rollback": {"strategy":"Revertir el PR: la apertura vuelve a su comportamiento anterior y no queda ninguna tecnologia por instalar. Lo que ya se instalo en una carpeta se retira con el mismo diario reversible que el resto de la preparacion.","trigger":"Una eleccion de escritorio que abra un navegador, o cualquier instalacion que ocurra sin revision previa aceptada.","recovery":"Restaurar los modulos anteriores y volver a correr el arnes de aperturas y los recorridos nativos contra este equipo."},
  "nonGoals": ["Verificar contratos de apertura nuevos, que fue el issue 106", "El motor que redacta el prompt, que fue el issue 99", "Instalar SDK con instalador propio o licencia aparte, como Flutter o el editor de Unity, que se nombran y se explican en vez de ofrecerse"],
  "exceptions": []
}
project-os-readiness:pre-propose -->
