# Revisión adversarial

**Alcance:** Issue #30 y change `add-adaptive-onboarding-classifier`.

**Fuentes:** issue enriquecido, proposal, design, spec, tasks, diff contra `origin/main`, schemas, módulo,
CLI, documentación, 24 pruebas específicas, integración consumidor, suite completa y tarball probado.

## Alineación spec/tareas

- La inspección solo emite IDs, rutas relativas y detalles saneados; no devuelve contenido ni URL remota.
- Las cinco respuestas son cerradas, parciales y admiten `unknown`/`defer` sin añadir una sexta pregunta.
- Evidencia de preservación o `project=preserve` domina `guidance=brief` y deshabilita rebootstrap.
- El estado v1 no contiene tiempo, máquina o ruta absoluta; valida su hash, orden, ruta y listas derivadas.
- v0 migra en memoria con source hash y el archivo original no cambia; estado futuro/corrupto falla cerrado.
- Texto y JSON derivan del mismo resultado y declaran cero mutaciones locales/remotas.
- Persistencia, prompts, trackers remotos, skills/MCP y arquitectura permanecen fuera de #30.

## Hallazgos corregidos

| Severidad | Área | Hallazgo adversarial | Corrección y evidencia |
| --- | --- | --- | --- |
| Major | Git / ejecución | Un `.git` symlink o `core.fsmonitor` podía ampliar la lectura o ejecutar un hook durante `status`. | `.git` symlink se rechaza como inspección incompleta; Git fuerza fsmonitor/untracked cache off, ignora submodules y usa shell false. Fixture específica en `test/onboarding.test.mjs`. |
| Major | Recursos | `readFile` aceptaba answers/state sin límite y `readdir` materializaba un directorio completo antes de aplicar el máximo. | Inputs limitados a 256 KiB; `opendir` detiene/discarda el directorio cuando supera el presupuesto global. Tests de tamaño y entry limit. |
| Major | Privacidad | Mensajes nativos de `JSON.parse` y nombres de campos desconocidos podían repetir contenido controlado por el input. | Errores usan `invalid-json` y conteo de campos; el test CLI confirma que keys/contenido hostil no aparecen en stderr JSON. |
| Major | Clasificación | Git con state/answers dentro de un directorio untracked podía reportar el directorio completo y forzar brownfield por el propio input. | `--untracked-files=all` y filtro exacto/case-aware de inputs; fixture `.project-os/onboarding-state.json` conserva ruta beginner. |
| Minor | Determinismo | `localeCompare` podía elegir evidencia distinta según locale/ICU. | Orden total por code point para nombres, evidencia y warnings; el estado mantiene fingerprint estable. |
| Minor | Canonicalidad | Un v1 podía declarar ruta/listas/hash internamente inconsistentes y aun aportar respuestas. | El lector verifica cinco respuestas exactas, IDs únicos, orden, hash, ruta derivada, pasos, status y rebootstrap antes de reutilizarlo. |
| Minor | Falso negativo | Un directorio vacío justo en el límite de profundidad se trataba como lectura incompleta. | Se comprueba una entrada sin recorrer el subtree; un directorio vacío ya no fuerza brownfield. |
| Minor | Documentación | La sección inglesa y `PROJECT_OS.md` todavía decían que todo #23 era trabajo futuro. | Se separa clasificador disponible en `main` de persistencia/prompts/trackers aún pendientes. |

## Casos negativos y de abuso

- Carpeta Git sin commit y con inputs untracked permanece greenfield.
- Historia, dirty state, code, docs, harness, tracker, CI, symlink, límite o lectura parcial fuerzan preservar.
- Una URL Git con credencial solo produce el proveedor `github`; token y repo no aparecen en output.
- Contenido secreto en JS, Markdown, workflow, JSON inválido, key desconocida o evidence externa no se repite.
- Inputs por symlink y targets symlink fallan; symlinks encontrados no se siguen.
- Estado futuro, incompleto, con answers extras, ruta manipulada o hash inconsistente falla con recuperación.
- El comando instalado conserva snapshot exacto del consumidor y el tarball incluye módulo/schemas.

## Pregunta/suposición resuelta

Jira o Azure Boards sin archivo local estándar no se infieren leyendo texto arbitrario. El campo `tracker`
registra esa respuesta y #33 decidirá adapters remotos. Esta limitación preserva privacidad y no debilita
brownfield: código, documentación o tooling existente siguen forzando inventario.

## Veredicto

**PASS.** Cero Blockers y cero Majors abiertos. Cuatro Majors y cuatro Minors se corrigieron antes del
cierre. No queda deuda residual; archivar es aconsejable después de repetir la suite final y readiness.

## Seguimiento de CI multiplataforma

La primera matriz detectó en Node 20/Windows que `Dirent.isSymbolicLink()` podía presentar una junction
como directorio. El scanner dejó de depender de esa clasificación: ahora confirma cada entrada con
`lstat` antes de decidir si puede recorrerla. La regresión conserva la junction como inspección incompleta,
elige preservación y nunca lee el destino enlazado.
