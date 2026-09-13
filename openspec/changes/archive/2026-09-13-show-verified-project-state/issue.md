## User Story

Como persona que ya preparó uno o varios proyectos, quiero ver de un vistazo cuáles están listos y qué le falta a cada uno, y que el proyecto me diga cómo trabajar con él, para no quedarme sin saber qué pedirle a mi IA ahora.

## Context / Problem

Hoy la lista de proyectos solo muestra nombre y ruta. No dice si un proyecto está completo, qué le falta, ni qué hacer a continuación. Quien preparó una carpeta hace dos semanas vuelve y no tiene forma de saber en qué quedó.

El mantenedor lo describió así: *«cuando los proyectos ya estén listos salgan en verde o con una palomita, así cuando vayas a mis proyectos puedas ver cuáles ya están listos»*, y *«si el proyecto detecta que le faltan cosas, que te ponga un apartado en cada proyecto en el que te dé prompts para terminar de configurar»*.

La aplicación **ya sabe** casi todo lo necesario: verifica base, contexto, entorno, ingeniería, activación y mapa de código, y cada uno reporta su estado. Lo que falta no es detección: es mostrarlo y convertirlo en un siguiente paso.

## Desired Outcome

**En la lista:** cada tarjeta muestra su estado sin abrirla — listo, o cuántas cosas le faltan. Clic en la tarjeta abre el proyecto.

**Dentro del proyecto:** las acciones están visibles como botones, no escondidas en un menú. Los tres puntos quedan solo para lo secundario y lo destructivo: duplicar, eliminar, quitar del historial.

**Y una sección «Cómo trabajar en este proyecto»**, específica de ese proyecto: cómo se trabaja según su perfil, qué le falta configurar, y los prompts concretos para copiar en el orden en que hay que darlos. Una guía genérica no le dice a nadie qué hacer ahora; esta sí.

## Scope

- **En alcance:** estado visible por proyecto, apertura por tarjeta, acciones visibles dentro del proyecto, menú secundario para duplicar/eliminar/quitar, sección «Cómo trabajar en este proyecto», y la lista ordenada de pendientes.
- **Fuera de alcance:** la generación del contenido de los prompts (issue del motor de prompts), la navegación general (issue de navegación), y la apertura de aplicaciones (issue propio).

## Acceptance Criteria

- [ ] La lista muestra el estado de cada proyecto sin abrirlo, y un proyecto completo se distingue de uno incompleto de un vistazo.
- [ ] Un proyecto incompleto dice **qué** le falta, en lenguaje entendible, no con el código de error interno.
- [ ] Ninguna acción principal vive únicamente dentro del menú de tres puntos.
- [ ] Duplicar un proyecto no copia los artefactos de preparación del original, que contienen rutas absolutas.
- [ ] Eliminar pide confirmación y **nunca borra la carpeta de la persona**: solo la quita del historial, y lo dice así.
- [ ] «Cómo trabajar en este proyecto» cambia según el perfil y según lo que falta; dos proyectos distintos no muestran el mismo texto.
- [ ] El estado que se muestra proviene de una comprobación real, nunca de la presencia de una carpeta.

## Decision Criteria

Una palomita verde es una afirmación. Solo puede aparecer cuando cada etapa que ese perfil necesita verificó de verdad. Ante la duda, el estado es «le falta algo» con su causa, nunca un verde optimista.

## SDD / Documentation Impact

- `docs/companion/EXPERIENCE.md`: estados por proyecto y su significado.
- Spec de `companion-experience`: escenario para el estado observable y para el borrado que conserva la carpeta.

## Validation / Evidence

- Recorridos nativos extendidos: un proyecto completo muestra verde, uno incompleto enumera lo que le falta, y eliminar conserva la carpeta en disco con sus archivos intactos.
- Un proyecto al que se le rompe una etapa a propósito deja de mostrarse como listo.

## Risks / Open Questions

- Riesgo de que «listo» se vuelva una afirmación vacía si el umbral se elige por conveniencia. Mitigación: el criterio de cada etapa se declara en la spec.
- Abierto: si duplicar debe ofrecer reusar la misma selección o volver a preguntar.


---

## Historia Original

Todo lo anterior a esta línea es la historia original tal como la escribió el mantenedor el 12 de septiembre
de 2026, con sus dos citas textuales. No se reinterpreta ni se resume: los criterios de aceptación y de
decisión de arriba son los que rigen.

## Enriquecida

La base es `main` con #97 integrado, que ya dejó cuatro destinos, `Tus proyectos` como lista y nada más, y
`listProjects` devolviendo por fila el perfil y un estado **registrado** leído del recibo de cada etapa sin
volver a inspeccionar la carpeta, acotado a 1500 ms.

Ahí está la tensión que este issue tiene que resolver, y conviene nombrarla antes de empezar. El criterio
dice que el estado mostrado proviene de **una comprobación real, nunca de la presencia de una carpeta**, y
el criterio de decisión dice que una palomita verde solo puede aparecer cuando cada etapa que ese perfil
necesita verificó de verdad. Pero verificar de verdad es lo que hace `status()` al abrir un proyecto:
reinspecciona la carpeta, rehashea las fuentes y, en software, comprueba la cadena de herramientas
administrada — minutos de trabajo. Hacerlo por fila en cada visita convertiría la lista en la pantalla más
lenta de la aplicación, que es exactamente lo que #97 evitó y midió.

La salida no es elegir uno de los dos extremos: es **guardar el veredicto de la comprobación real junto a
los hashes de los recibos sobre los que se hizo**. La lista compara esos hashes, que ya lee, y con eso puede
decir tres cosas distintas y todas verdaderas: verificado y nada cambió desde entonces; verificado pero
algo cambió, así que hay que volver a comprobar; o nunca verificado. La palomita verde solo aparece en el
primer caso. Lo que la lista **no** puede afirmar es la frescura del contenido de los archivos de la
persona: eso lo comprueba el contexto al abrir, y la pantalla tiene que decirlo en lugar de insinuar que la
palomita lo cubre.

Lo que falta no es detección: la aplicación ya verifica base, contexto, entorno, ingeniería, activación y
mapa de código, y cada uno reporta su estado. Falta persistir ese veredicto, mostrarlo, y convertirlo en un
siguiente paso.

### Criterios observables

- La lista distingue de un vistazo un proyecto completo de uno incompleto, y un proyecto incompleto enumera
  **qué** le falta en lenguaje entendible, no con el código de error interno.
- La palomita verde solo aparece cuando cada etapa que ese perfil necesita verificó de verdad y los recibos
  sobre los que se verificó no han cambiado; ante la duda, el estado es «le falta algo» con su causa.
- La tarjeta abre el proyecto, y ninguna acción principal vive únicamente dentro del menú de tres puntos,
  comprobado leyendo la página renderizada y no por revisión a ojo.
- «Cómo trabajar en este proyecto» cambia según el perfil y según lo que falta: dos proyectos distintos no
  muestran el mismo texto, comprobado comparando el texto de dos perfiles en el mismo recorrido.
- Duplicar no copia los artefactos de preparación del original, comprobado sobre el disco y no sobre la
  intención: la carpeta nueva no contiene `.project-os/companion/`.
- Eliminar pide confirmación, dice que solo quita del historial, y la carpeta de la persona queda en disco
  con sus archivos byte a byte idénticos.
- Romper a propósito una etapa de un proyecto verificado lo saca del estado listo, y la pantalla dice cuál.
- Los cinco recorridos nativos siguen con cero hallazgos, y las reglas de #97 —un nombre por acción, el
  vocabulario alcanzable desde cada pantalla, contraste, encabezados, teclado y denominadores— siguen
  pasando en las pantallas nuevas.

### Alcance y límites

Estado verificado y persistido por proyecto, apertura por tarjeta, acciones visibles dentro del proyecto,
menú secundario para duplicar/eliminar/quitar, la sección «Cómo trabajar en este proyecto» y la lista
ordenada de pendientes. El contenido de los prompts se compone de las recetas y las etapas pendientes que ya
existen; **la generación de prompts es el issue #99** y reemplazará esa composición. Fuera de alcance: la
navegación general (#97, ya integrado), la apertura de aplicaciones (#100) y la landing (#101–#104). Sin
republicar el núcleo 0.5.0, sin tocar `CI / required`, la protección de rama ni la lista de archivos del
instalador. No se declara estudio de usabilidad ni revisión humana.

Queda abierto en el issue si duplicar debe reusar la misma selección o volver a preguntar. Se resolverá en
el design con su motivo registrado, y elegir carpeta seguirá necesitando una persona.

<!-- project-os-readiness:pre-propose
{
  "schemaVersion": "1.0.0",
  "change": "show-verified-project-state",
  "execution": "versioned",
  "dependencies": [97],
  "currentState": {
    "summary": "Tras #97 la lista muestra por fila el perfil y un estado registrado leído de los recibos, pero no dice si el proyecto está completo, qué le falta ni qué hacer ahora, y las acciones del proyecto no están ordenadas por importancia.",
    "sources": ["https://github.com/IgnacioBarEsp/project-engineering-os/issues/98", "https://github.com/IgnacioBarEsp/project-engineering-os/pull/108"]
  },
  "scope": ["Veredicto de verificación persistido y mostrado por proyecto", "Acciones visibles dentro del proyecto y menú secundario para lo destructivo", "Sección Cómo trabajar en este proyecto, específica del perfil y de lo que falta"],
  "observableCriteria": ["La palomita verde solo aparece con cada etapa del perfil verificada de verdad y los recibos sin cambios", "Un proyecto incompleto enumera qué le falta en lenguaje entendible", "Duplicar no deja .project-os/companion en la carpeta nueva, comprobado sobre el disco", "Eliminar deja en disco la carpeta de la persona, con sus archivos byte a byte idénticos", "Romper una etapa saca al proyecto del estado listo y la pantalla dice cuál", "Las reglas de #97 siguen pasando en las pantallas nuevas"],
  "owner": "Ignacio Bar Esp",
  "risks": ["Que listo se vuelva una afirmación vacía si el umbral se elige por conveniencia", "Que un veredicto guardado se presente como vigente cuando la carpeta ya cambió", "Que verificar por fila devuelva a la lista la lentitud que #97 quitó"],
  "surfaces": ["documentation", "harness-tooling", "ui"],
  "manualInterventions": [],
  "costLicenseReview": {"status":"approved","owner":"Ignacio Bar Esp","evidence":"Autorización expresa del mantenedor para llevar los once issues abiertos de inicio a fin con el flujo SDD del repositorio, 12 de septiembre de 2026.","justification":"No se añaden dependencias, servicios pagados ni licencias. Se reutilizan la aplicación instalada y las herramientas ya fijadas. Licencia MIT sin cambios."},
  "evidence": {"automatic":["component-or-interaction-tests","accessibility-check","responsive-check-when-configured","openspec-strict","secret-scan","constructor-tests"],"manual":["Cinco recorridos en la ventana de la aplicación instalada, rotura deliberada de una etapa verificada y revisión adversarial independiente"]},
  "rollback": {"strategy":"Revertir el PR: la lista vuelve al estado registrado de #97 y el veredicto guardado deja de leerse. No se toca ninguna carpeta preparada ni entrada de historial.","trigger":"Un proyecto incompleto mostrado como listo, o una carpeta de la persona alterada por duplicar o eliminar.","recovery":"Restaurar los archivos de interfaz y de servicio anteriores y volver a ejecutar los dos harness contra la ventana instalada."},
  "nonGoals": ["Generación del contenido de los prompts, que es #99", "Apertura de aplicaciones de escritorio, que es #100", "Landing", "Estudio de usabilidad o revisión humana"],
  "exceptions": []
}
project-os-readiness:pre-propose -->

