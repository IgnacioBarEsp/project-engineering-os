## User Story

Como persona que usa Companion sin ser especialista, quiero una aplicación con destinos claros y un lenguaje que me hable a mí, para entender qué hace, qué gano y qué hacer ahora sin tener que descifrar vocabulario técnico.

## Context / Problem

El mantenedor recorrió la aplicación instalada y encontró problemas concretos:

- **«Preparar una carpeta» de la barra lateral y «Preparar mi proyecto» del cuerpo hacen lo mismo.** Dos entradas, una acción.
- **«Tus proyectos» no es la lista de proyectos: es un home.** Lleva saludo, descripción, tres pasos, y los proyectos quedan hasta el fondo.
- **«Preparar contexto para compartir» no se entiende.** Cita textual: «No sé para qué sirve este apartado». Es un problema de nombre y de afordancia, no de función.
- **El lenguaje habla como si la persona ya conociera los conceptos.** «Lo que sí se afirma y lo que no», «revisión adversarial», «harness», «contexto preparado». Ese vocabulario lo conoce el autor, no quien descarga la app.

El tono defensivo nació de una disciplina correcta —tres revisiones adversariales castigaron afirmaciones sin evidencia— pero se aplicó al lugar equivocado. **Ser honesto no obliga a ser árido.** Se puede explicar un beneficio real con calidez.

## Desired Outcome

Cuatro destinos, cada uno con un trabajo que no comparte con ningún otro:

1. **Inicio** — bienvenida, qué hace la app en una frase entendible, cómo trabaja, qué se instala y por qué, privacidad, y una acción principal para empezar.
2. **Tus proyectos** — solo la lista. Sin saludo, sin explicaciones, sin pasos. Cada proyecto con su estado visible.
3. **Preparar proyecto** — el asistente actual, que es lo mejor que tiene la app hoy y no se toca salvo para el lenguaje.
4. **Ayuda** — el método general y el glosario de términos.

Y un idioma nuevo en toda la aplicación: frases cortas, beneficio antes que mecanismo, y cada término técnico explicado la primera vez que aparece.

## Scope

- **En alcance:** estructura de navegación, contenido de Inicio, limpieza de «Tus proyectos», pantalla de Ayuda, glosario, renombrado de controles confusos, y reescritura del lenguaje de toda la interfaz.
- **Fuera de alcance:** el estado por proyecto y sus acciones (issue propio), el motor de prompts (issue propio), la apertura de aplicaciones (issue propio), y la landing (repositorio aparte).

## Acceptance Criteria

- [ ] Ninguna acción está disponible desde dos entradas distintas de navegación con nombres distintos.
- [ ] «Tus proyectos» no contiene texto explicativo, saludo ni pasos: solo proyectos y su estado.
- [ ] Inicio explica en una frase qué hace la app sin usar «contexto preparado», «harness», «RAG» ni «SDD» antes de haberlos explicado.
- [ ] Cada término técnico que aparezca en la interfaz tiene una definición breve accesible desde donde aparece, y todas se reúnen en el glosario.
- [ ] «Preparar contexto para compartir» tiene un nombre que una persona entiende sin abrirlo, verificado preguntándole a alguien que no conozca la app.
- [ ] Los cinco recorridos nativos siguen pasando con cero hallazgos tras la reestructuración.
- [ ] Contraste, orden de encabezados, navegación por teclado y reflujo se mantienen verificados en las pantallas nuevas.

## Decision Criteria

El lenguaje no puede ganar calidez a costa de decir algo que no se puede sostener. La regla: **se elimina el vocabulario técnico y el tono defensivo, no la verdad**. Si un beneficio no está demostrado, se deja de mencionar o se mide primero; no se suaviza hasta parecer cierto.

## SDD / Documentation Impact

- `docs/companion/EXPERIENCE.md`: actualizar el recorrido principal y el mapa de navegación.
- Glosario nuevo, referenciado desde la interfaz.
- Spec de `companion-experience` si la estructura de destinos cambia contratos observables.

## Validation / Evidence

- `npm run evidence:native` con cero hallazgos en los cinco perfiles.
- Recorridos de navegador actualizados a la estructura nueva.
- Una persona que no conozca la aplicación abre Inicio y dice qué hace la app; su respuesta queda registrada como evidencia, sin adornos.

## Risks / Open Questions

- Reescribir el lenguaje toca casi toda la interfaz: riesgo de romper selectores de las comprobaciones existentes. Mitigación: actualizar recorridos en el mismo cambio.
- Queda abierto si «Preparar proyecto» debe ser un destino permanente o solo una acción desde Inicio y Tus proyectos.


---

## Historia Original

Todo lo anterior a esta línea es la historia original tal como la escribió el mantenedor el 12 de septiembre
de 2026, después de recorrer la aplicación 0.1.0 instalada en su equipo. No se reinterpreta ni se resume: los
criterios de aceptación y de decisión de arriba son los que rigen.

## Enriquecida

La base es `0ba59af`, con el programa #66 y el issue #94 cerrados y la aplicación 0.1.0 instalada y
publicada. Los cuatro hallazgos están en el código, no en una impresión: `apps/companion/ui/app.mjs:24-37`
tiene dos entradas de navegación con nombres distintos para una sola acción (`#home` «Tus proyectos ↗» y
`#new` «Preparar una carpeta ＋», más el botón «Preparar mi proyecto ↗» del cuerpo), y `home()` renderiza
saludo, héroe, intro y tres pasos antes de las tarjetas de proyecto. `listProjects` en
`desktop/service.mjs:90` devuelve solo `{id, name, root}`, así que la lista no puede mostrar estado aunque
quisiera. El control de exportación se llama «Preparar contexto para compartir» (`app.mjs:187`). No existe
pantalla de ayuda ni glosario en ninguna parte de la aplicación.

Dos criterios del issue exigen una persona que no conozca la aplicación. No se sustituyen por un agente ni
por una heurística: quedan sin verificar con su causa y con el protocolo para ejecutarlos.

### Criterios observables

- Cuatro destinos con trabajos que no se solapan; ninguna acción alcanzable desde dos entradas de navegación
  con nombres distintos, comprobado leyendo la página renderizada y no por revisión a ojo.
- «Tus proyectos» contiene únicamente la lista y el estado de cada proyecto; el estado declara que es el
  registrado y cómo comprobarlo, y una carpeta ilegible no impide renderizar las demás filas.
- «Inicio» explica en una frase qué hace la aplicación, qué se descarga y por qué, y qué se queda en este
  equipo, sin usar un término antes de definirlo.
- Cada término técnico que sobrevive en la interfaz abre su definición desde donde aparece, y todas se
  reúnen en el glosario de «Ayuda».
- Los cinco recorridos nativos pasan con cero hallazgos en la ventana instalada, y la evidencia registra por
  digest que esa ventana corría la interfaz de esta rama.
- Contraste, orden de encabezados, navegación por teclado y reflujo verificados en las pantallas nuevas.
- Revisión adversarial independiente sin Blocker ni Major abiertos, deuda clasificada por lo que es, y los dos
  criterios que necesitan una persona registrados como no verificados con su causa.

### Alcance y límites

Interfaz del companion, un resumen de solo lectura añadido al servicio y sus dos motores, la lista de
activos del proceso principal de Electron, `docs/companion/EXPERIENCE.md`, un glosario nuevo y los dos
harness de recorridos. Sin republicar el núcleo 0.5.0, sin tocar `CI / required`, la protección de rama ni la
lista de archivos del instalador. No entra el estado por proyecto y sus acciones (#98), el motor de prompts
(#99), la apertura de aplicaciones (#100) ni la landing (#101–#104). No se declara estudio de usabilidad ni
revisión humana: la delegación del mantenedor cubre ejecución, pruebas, commits DCO, revisión independiente
e integración protegida, y no cubre hacer de lector que nunca ha visto la aplicación.

<!-- project-os-readiness:pre-propose
{
  "schemaVersion": "1.0.0",
  "change": "restructure-companion-navigation",
  "execution": "versioned",
  "dependencies": [],
  "currentState": {
    "summary": "La aplicación 0.1.0 está instalada y publicada; su navegación duplica una acción, su home usa el nombre de la lista, el control de exportación no se entiende por su nombre y no hay ayuda ni glosario.",
    "sources": ["https://github.com/IgnacioBarEsp/project-engineering-os/issues/97", "https://github.com/IgnacioBarEsp/project-engineering-os/pull/96"]
  },
  "scope": ["Cuatro destinos de navegación sin solapamiento", "Lenguaje entendible con glosario accesible desde donde aparece cada término", "Estado registrado por proyecto en la lista"],
  "observableCriteria": ["Ninguna acción alcanzable bajo dos nombres de navegación distintos, comprobado sobre la página renderizada", "La lista de proyectos no contiene saludo, explicación ni pasos", "Cinco recorridos nativos con cero hallazgos en la ventana instalada, con la identidad de la interfaz registrada por digest", "Contraste, orden de encabezados, teclado y reflujo verificados en las pantallas nuevas"],
  "owner": "Ignacio Bar Esp",
  "risks": ["Que la reescritura del lenguaje rompa los selectores de las comprobaciones existentes", "Que la calidez introduzca un beneficio no demostrado", "Que un estado mostrado en la lista se lea como verificado cuando solo está registrado"],
  "surfaces": ["documentation", "harness-tooling", "ui"],
  "manualInterventions": [],
  "costLicenseReview": {"status":"approved","owner":"Ignacio Bar Esp","evidence":"Autorización expresa del mantenedor para llevar los once issues abiertos de inicio a fin con el flujo SDD del repositorio, 12 de septiembre de 2026.","justification":"No se añaden dependencias, servicios pagados ni licencias. Se reutilizan la aplicación instalada y las herramientas ya fijadas. Licencia MIT sin cambios."},
  "evidence": {"automatic":["component-or-interaction-tests","accessibility-check","responsive-check-when-configured","openspec-strict","secret-scan"],"manual":["Cinco recorridos en la ventana de la aplicación instalada y revisión adversarial independiente"]},
  "rollback": {"strategy":"Revertir el PR: la interfaz vuelve a su estructura anterior y no se toca ninguna carpeta preparada, entrada de historial ni caché de herramientas.","trigger":"Regresión reproducida en los recorridos nativos o de navegador, o un hallazgo Blocker/Major abierto.","recovery":"Restaurar los tres archivos de interfaz anteriores y volver a ejecutar los dos harness contra la ventana instalada."},
  "nonGoals": ["Estudio de usabilidad o revisión humana", "Estado por proyecto y sus acciones", "Motor de prompts y apertura de aplicaciones", "Landing en repositorio aparte"],
  "exceptions": []
}
project-os-readiness:pre-propose -->

