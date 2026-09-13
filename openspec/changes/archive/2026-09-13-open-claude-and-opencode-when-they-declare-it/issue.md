## User Story

Como persona que usa Claude u OpenCode de escritorio, quiero que Companion abra mi proyecto en ellas si es posible, para no tener que abrir la aplicación y buscar la carpeta a mano.

## Context / Problem

Medido en el equipo del mantenedor: ambas están instaladas y **firmadas** —Claude por Anthropic, OpenCode por Anomaly Innovations— pero **ninguna expone una forma comprobada de recibir una carpeta**, así que hoy caen en la ruta de exportación revisada.

Codex, Cursor y Visual Studio Code sí tienen contrato comprobado. Claude y OpenCode están en la lista de imprescindibles del mantenedor, así que la diferencia se nota.

## Desired Outcome

Una respuesta verificada por cada una: existe un contrato de apertura y cuál es, o no existe y queda registrado por qué. **Las dos respuestas son resultados válidos.**

## Scope

- **En alcance:** investigar la interfaz de línea de comandos de cada aplicación, comprobar en la instalación real, y si hay contrato, añadirlo con su regresión.
- **Fuera de alcance:** Antigravity, que llega sin firma y se rechaza correctamente por eso.

## Acceptance Criteria

- [ ] Por cada aplicación, una conclusión respaldada por lo observado en la instalación real, no por documentación.
- [ ] Si hay contrato, se verifica como el de Codex —comprobando que la ayuda declara aceptar una ruta— y no por suposición.
- [ ] Si no hay contrato, queda escrito con lo que se intentó, y la ruta de exportación se mantiene como respuesta correcta.
- [ ] **La frontera de seguridad no se debilita**: firma válida, editor en lista y bytes sin cambiar siguen siendo obligatorios.
- [ ] Ninguna apertura nueva afirma que la IA leyó el proyecto.

## Decision Criteria

Inventar un argumento de línea de comandos porque «probablemente funcione» es exactamente lo que este proyecto decidió no hacer con Antigravity. Sin contrato observado, no hay apertura.

## SDD / Documentation Impact

`docs/companion/SECURITY.md` y el registro de aperturas locales.

## Validation / Evidence

`npm run evidence:launches` con el resultado de cada una, y regresión nueva si se añade alguna apertura.

## Risks / Open Questions

- Puede terminar en que ninguna de las dos se pueda abrir. Es un resultado aceptable.
- Abierto: si conviene detectar también sus CLI, que sí aceptan rutas, aunque sean otra aplicación distinta de la de escritorio.


---

## Historia Original

Todo lo anterior a esta línea es la historia original tal como la escribió el mantenedor el 12 de septiembre
de 2026. No se reinterpreta ni se resume: los criterios de aceptación y de decisión de arriba son los que
rigen.

## Enriquecida

La base es `main` con #97, #98 y #99 integrados. Lo que existe hoy, leído del código:

`apps/companion/desktop/local-apps.mjs` reconoce cuatro aplicaciones —Codex, Cursor, Visual Studio Code y
Antigravity— y para cada una comprueba, antes de abrir nada, que el ejecutable sea un archivo regular sin
vínculos, que su firma sea válida, que el editor esté en una lista cerrada, y que sus bytes no cambien entre
la revisión y la apertura. Codex lleva además una comprobación de contrato: se ejecuta `codex app --help` y se
exige que la ayuda declare `Usage: codex app … [PATH]`. Antigravity está en `noVerifiedFolderContract`: se
reconoce, se dice si está instalada y si su editor verifica, y **nunca se abre**, porque nadie comprobó cómo
recibe una carpeta.

**Claude y OpenCode no están en ninguna de esas listas**: hoy no se detectan siquiera, así que una persona que
usa cualquiera de las dos cae en la ruta de exportación sin que la aplicación le diga por qué.

### Lo que ya se observó en la instalación real de este equipo

Medido antes de escribir una línea, porque este issue es investigación y su respuesta tenía que salir de la
instalación y no de la documentación:

| Qué | Claude | OpenCode |
| --- | --- | --- |
| Instalada | `%LOCALAPPDATA%\AnthropicClaude\app-<versión>\claude.exe` | `%LOCALAPPDATA%\Programs\@opencode-aidesktop\OpenCode.exe` |
| Firma | **Válida**, editor `Anthropic, PBC` | **Válida**, editor `Anomaly Innovations, Inc https://anoma.ly/` |
| `--help` | no imprime ayuda; entrega los argumentos a la instancia que ya corre | no imprime ayuda; abre una ventana |
| CLI en el PATH | no hay | no hay |
| Protocolo registrado | `claude://` → `claude.exe "%1"` en `HKCU\Software\Classes` | `opencode://` → `OpenCode.exe "%1"` |
| Ruta con carpeta declarada por su propio build | **Sí**: `claude://code/new?folder=<ruta codificada>`, construida por una función del propio paquete que antes comprueba que el destino es un directorio y resuelve su ruta real | **No**: registra el protocolo y reparte los enlaces al renderer, pero no declara ninguna ruta con parámetro |

Así que las dos respuestas del issue son distintas, y las dos son válidas:

- **Claude sí tiene contrato observado.** No por documentación ni por suposición: por lo que su propio build
  instalado declara, junto con el manejador de protocolo que el sistema tiene registrado apuntando a ese mismo
  ejecutable firmado. Comprobar la declaración cuesta **11 ms** leyendo el paquete por partes.
- **OpenCode no tiene contrato observado.** Se comprobó su firma, su ayuda, su PATH, su protocolo y sus rutas
  declaradas. Queda registrado con lo que se intentó, y la exportación revisada sigue siendo la respuesta
  correcta para ella.

Lo que **no** se puede comprobar desde aquí: que la ventana de Claude efectivamente abra esa carpeta. Se le
entregó la URL a la instalación real y el proceso la aceptó, pero mirar el resultado en pantalla necesita una
persona. Eso queda como «sin verificar, con su causa», separado de los hallazgos.

### Criterios observables

- Cada aplicación tiene una conclusión respaldada por lo que se observó en la instalación real, con lo que se
  intentó escrito, y las dos conclusiones se conservan como evidencia reproducible.
- La apertura de Claude solo se ofrece cuando se cumplen, en ese momento: firma válida, editor en la lista,
  archivo regular, bytes idénticos entre revisión y apertura, manejador de protocolo registrado apuntando a
  ese mismo ejecutable, y la ruta con carpeta declarada por el build instalado.
- Quitar cualquiera de esas seis comprobaciones se detecta, comprobado mutando el código a propósito.
- OpenCode se reconoce, se dice si está instalada y si su editor verifica, y **no se abre**, con la misma
  forma que Antigravity.
- Ninguna pantalla afirma que la IA leyó el proyecto por haberse abierto.
- Las reglas de #97, #98 y #99 siguen pasando en las pantallas que este cambio toca.

### Alcance y límites

Detección y contrato de Claude y OpenCode, su regresión, y el registro de aperturas locales. Fuera de alcance:
Antigravity, que ya se rechaza por no tener contrato comprobado; el resto del issue #100, que es abrir la
aplicación desde la interfaz y profundizar qué se instala; y cualquier apertura basada en un argumento que
nadie haya observado. Sin republicar el núcleo 0.5.0, sin tocar `CI / required`, la protección de rama, la
lista de archivos del instalador ni la política de contenido del renderer.

Queda abierto en el issue si conviene detectar también sus CLI. En este equipo **no hay ninguna de las dos en
el PATH**, así que no hay nada que detectar aquí; se resolverá en el design con ese dato.

<!-- project-os-readiness:pre-propose
{
  "schemaVersion": "1.0.0",
  "change": "open-claude-and-opencode-when-they-declare-it",
  "execution": "versioned",
  "dependencies": [99],
  "currentState": {
    "summary": "El lanzador reconoce Codex, Cursor, Visual Studio Code y Antigravity, con firma, editor en lista cerrada, archivo regular y bytes sin cambiar, y exige un contrato declarado solo a Codex. Claude y OpenCode no se detectan siquiera. En la instalacion real las dos estan firmadas; Claude declara en su propio build la ruta claude://code/new?folder= y tiene el protocolo registrado, y OpenCode no declara ninguna ruta con parametro.",
    "sources": ["https://github.com/IgnacioBarEsp/project-engineering-os/issues/106", "https://github.com/IgnacioBarEsp/project-engineering-os/pull/110"]
  },
  "scope": ["Deteccion y contrato de Claude, con sus seis comprobaciones", "Deteccion de OpenCode sin apertura, con su causa registrada", "Regresion de ambas en el arnes de aperturas locales"],
  "observableCriteria": ["Cada aplicacion tiene una conclusion respaldada por la instalacion real y conservada como evidencia", "La apertura de Claude exige firma, editor, archivo regular, bytes iguales, protocolo registrado y ruta declarada por el build", "Quitar cualquiera de esas comprobaciones se detecta por mutacion", "OpenCode se reconoce y no se abre, con su causa", "Ninguna pantalla afirma que la IA leyo el proyecto"],
  "owner": "Ignacio Bar Esp",
  "risks": ["Que se invente un argumento que nadie observo, como se decidio no hacer con Antigravity", "Que una comprobacion de firma o de bytes se debilite para que una apertura alcance", "Que abrir se confunda con que la IA leyo el proyecto"],
  "surfaces": ["documentation", "harness-tooling", "ui"],
  "manualInterventions": [],
  "costLicenseReview": {"status":"approved","owner":"Ignacio Bar Esp","evidence":"Autorizacion expresa del mantenedor para llevar los once issues abiertos de inicio a fin con el flujo SDD del repositorio, 12 de septiembre de 2026.","justification":"No se anaden dependencias ni servicios. Se usan aplicaciones que la persona ya tiene instaladas y firmadas. Licencia MIT sin cambios."},
  "evidence": {"automatic":["component-or-interaction-tests","accessibility-check","openspec-strict","secret-scan","constructor-tests"],"manual":["Deteccion y contrato medidos contra las instalaciones reales de este equipo, entrega de la URL a la instalacion de Claude, y revision adversarial independiente"]},
  "rollback": {"strategy":"Revertir el PR: Claude y OpenCode vuelven a no detectarse y la ruta de exportacion sigue siendo la respuesta para ambas. No se toca ninguna aplicacion instalada ni ninguna carpeta preparada.","trigger":"Una apertura que se ofrezca sin las seis comprobaciones, o una pantalla que afirme que la IA leyo el proyecto.","recovery":"Restaurar el modulo de aperturas anterior y volver a correr el arnes de aperturas contra este equipo."},
  "nonGoals": ["Antigravity, que ya se rechaza con su causa", "Abrir la aplicacion desde la interfaz y la profundidad de instalacion, que son el issue 100", "Cualquier apertura basada en un argumento no observado"],
  "exceptions": []
}
project-os-readiness:pre-propose -->

