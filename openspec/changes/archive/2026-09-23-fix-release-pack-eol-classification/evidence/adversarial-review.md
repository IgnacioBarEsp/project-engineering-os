# Revisión adversarial independiente

Fecha: 2026-09-24. Cambio: `fix-release-pack-eol-classification`, issue #155.

## Resultado

PASS después de resolver todos los findings; cero hallazgos abiertos. La revisión fue read-only y se
realizó sobre el diff del follow-up. La suite y los comandos de validación se ejecutaron por separado.

## Hallazgos y resolución

| Finding | Riesgo | Resolución y verificación |
| --- | --- | --- |
| El tag histórico habría usado su validador antiguo. | La corrección no correría desde el tag inmutable. | Los tres jobs extraen el helper, validador y resolvedor del SHA exacto del workflow en `main` antes de usarlos; GitHub Release extrae también el verificador del manifest. Tests de policy bloquean carga ausente o tardía. |
| Referencia de tag ambigua e input interpolado en shell. | Una rama homónima o una entrada interpretada como código podría seleccionar fuente incorrecta. | Checkout usa `refs/tags/<tag>`, shell recibe `RELEASE_TAG` como dato; prueba dinámica con branch/tag del mismo nombre rechaza la rama y acepta el tag; prueba de Bash conserva literalmente el valor y no crea marcador. |
| El nombre de tag no probaba identidad del source y el candidato podía declarar otro commit. | Podía adjuntarse un candidato cuyo source no coincidiera con el tag. | Preflight resuelve el commit remoto exacto; `github-release` repite la comprobación y exige que el `commit` del manifest sea el `HEAD` del tag verificado. |
| `w/none` podía aceptarse aunque el índice tuviera otra forma. | La salida empaquetada podía divergir de los bytes del commit. | El clasificador acepta solo `lf/lf` y `none/none`; pruebas negativas cubren pares divergentes, CRLF, mixed y unknown; el tarball exacto `v1.0.0` conserva su hash. |
| El workflow aceptaba prereleases sin canal npm explícito. | GitHub Release podía crearse y npm rechazar después la publicación. | Preflight ahora acepta solo versiones estables hasta definir un mapeo de dist-tag y el estado prerelease de GitHub; prueba unitaria comprueba el rechazo antes de candidato/publicación. |
| Las reglas de tags no bloqueaban actualización sin bypass; la policy no fijaba el orden de carga. | Un tag podía moverse y una regresión de orden podía ejecutar herramientas viejas. | Ruleset activo sin bypass bloquea actualización/borrado de `v*` y `companion-v*`; las pruebas de policy comprueban tanto orden de validadores como extracción del verificador antes de invocarlo. |

La policy externa de ambos environments se verificó en vivo: solo `main`, bypass administrativo deshabilitado,
y se conservó el reviewer requerido de `npm-publish`. No se inició release ni publicación durante esta revisión.
