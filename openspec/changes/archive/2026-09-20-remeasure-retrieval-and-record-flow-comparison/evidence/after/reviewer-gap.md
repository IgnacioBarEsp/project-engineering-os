# El verificador del benchmark no podía verificar una segunda corrida

Encontrado el 20 de septiembre de 2026 al intentar la tarea 2.3, que pide pasar el revisor sobre los cuatro
JSON de la corrida nueva. No es un hallazgo buscado: el revisor simplemente no arrancaba.

`apps/companion/scripts/review-real-repository-benchmark.mjs` es el verificador independiente de la medición
más incómoda que publica el proyecto, la que dice que el contexto preparado no devuelve ninguna respuesta.
Tenía tres defectos, y los tres son de la misma familia: daba por eterno lo que era circunstancial.

| # | Defecto | Consecuencia |
| --- | --- | --- |
| 1 | Se anclaba a `e0a29803`, el commit de la rama que midió | La integración es por squash, así que ese commit **no está en el historial de `main`**. El verificador fallaba en la primera aserción sobre cualquier clon actual: no podía ejecutarse sobre lo publicado |
| 2 | La ruta de la evidencia estaba escrita a mano como `openspec/changes/<change>/evidence/run-01` | Archivar el change movió la evidencia a `archive/2026-09-13-…`, y la comparación contra los blobs publicados buscaba donde ya no estaba |
| 3 | Exigía que el campo `precommit` del registro fuera exactamente `c808967c` | Ese campo es **el HEAD con el que se midió**, no una constante del protocolo. Ninguna re-medición podía cumplirlo, por definición: el revisor estaba escrito para revisar una sola corrida, para siempre |

## Qué se corrigió

- El ancla por defecto pasa a ser `de66a2e`, el commit que publicó la corrida **en `main`**, donde la evidencia
  ya vive archivada.
- La ruta publicada se deriva de la evidencia que se revisa, así que archivar deja de romperla.
- La identidad deja de compararse contra un commit fijo y pasa a comprobarse por **contenido**: el digest del
  protocolo contra el que declara su manifiesto, los hashes de los cinco archivos congelados contra el árbol
  revisado, y la coherencia del commit declarado entre preflight, agregado y reportes.
- El revisor acepta `--evidence` y `--result-commit`, así que cualquier corrida futura se puede verificar. Sin
  banderas, se comporta como siempre.
- La mutación de publicación construye la fila de la corrida que se está revisando. Antes reemplazaba la
  primera fila que encontrara, y con dos mediciones publicadas habría mutado la tabla equivocada y la mutación
  habría sobrevivido sin que nadie se enterara.

## Lo que sigue sin poder probarse desde `main`

Que las preguntas se congelaron **antes** de medir. El precompromiso `c808967c` y el resultado `e0a29803` eran
dos commits de la misma rama, y el squash los fundió en uno: desde el historial de `main` los dos artefactos
aparecen publicados a la vez.

El orden sí consta en el [PR #113](https://github.com/IgnacioBarEsp/project-engineering-os/pull/113), que
conserva los tres commits originales con `c808967c` antes que `e0a29803`. El registro del revisor lo dice con
esas palabras en vez de afirmar una garantía que su propio historial no sostiene.

**Para la próxima medición congelada**, si se quiere que el orden sea comprobable sin depender de la interfaz
de GitHub, el precompromiso tiene que entrar a `main` en un commit propio, antes del que publica el resultado.
Eso es un cambio de procedimiento de integración, no de código, y no se decide aquí.

## Resultado

| Corrida | Veredicto | Mutaciones detectadas |
| --- | --- | --- |
| `run-01`, 0.1.0, 13 de septiembre | PASS | 5 de 5 |
| `run-02`, 0.3.2, 20 de septiembre | PASS | 5 de 5 |

El registro de la segunda está en [review-run-02.json](review-run-02.json).
