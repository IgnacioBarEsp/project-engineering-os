# Revisión adversarial — companion-installer-choices (#168)

## Revisión de la corrección 0.3.6

Una segunda pasada con la lente de seguridad, corrección, rendimiento y mantenibilidad encontró la causa
que la revisión estática inicial no había captado: en 0.3.5 `nsis.language` fija VERSIONINFO, pero no
selecciona las páginas MUI. **Major confirmado en el artefacto publicado:** las páginas estándar y el
encabezado heredado de la página propia seguían en inglés en Windows Sandbox. No se aceptó 0.3.5 como
cierre de #168. La corrección añade `installerLanguages: [es_ES]` y fija el encabezado propio. El build
limpio 0.3.6 mostró páginas estándar en español; la prueba asistida confirmó Desktop marcado por defecto,
ambas ramas de apertura en Finish, creación del `.lnk`, reconocimiento de misma versión, Repair completado,
apertura real tras Finish/Repair y persistencia del enlace tras Repair. El opt-out anterior retiró el enlace
de escritorio y no abrió la app tras desmarcar Finish. En aquel momento la desinstalación asistida y el
workflow de release protegido seguían pendientes. La desinstalación quedó después comprobada en Sandbox el
23 de septiembre. La release protegida 0.3.6 se publicó luego, tras reconstrucción y ensayo automatizado en un
runner Windows desechable; el resultado está en [release-0.3.6.md](release-0.3.6.md).

El diff nuevo no añade red, secretos, elevación, procesos en el host ni rutas de borrado. El include
adicional `MUI2.nsh` se necesita porque electron-builder incluye el archivo propio antes de MUI2; la
compilación real comprueba esa dependencia. Las pruebas de configuración protegen la lista de idiomas y
el encabezado, y `npm test --prefix apps/companion` pasó 146/146. El build limpio pasó `pack:verify` desde
`89a7614`. El veredicto de esa pasada era provisional hasta completar el recorrido asistido y la publicación;
lo sustituye la revisión independiente del PR #182 registrada abajo. Esta primera revisión es del mismo agente,
no un reviewer independiente.

La revisión se hizo sobre el diff desde `2384fab`, con la lente de seguridad, corrección, rendimiento y
mantenibilidad de la skill `code-review`. Es una revisión del agente en el mismo checkout; por tanto no se
declara revisión independiente ni sustituye al reviewer protegido del PR.

### Segunda pasada del diff vigente de PR #181 (23 de septiembre)

Se volvió a inspeccionar el diff desde la base actual `ad9ebf0` hasta `4bfface`, centrado en la selección
`installerLanguages`, la cabecera MUI propia, las aserciones de packaging, el harness de instalación y la guía
pública. La página personalizada no hereda ya el encabezado previo; los controles de idioma impiden volver
silenciosamente a `en_US`; la comprobación de enlace del harness limita sus operaciones al nombre exacto del
producto. Los cambios no agregan elevación, red, credenciales, dependencias ni borrado de datos de usuario.
No surgieron Blockers o Majors de código nuevos en esta pasada. Los botones Sí/No/Cancelar del diálogo
contextual siguen la lengua configurada en Windows; el mensaje propio está en español y esa limitación queda
registrada en la evidencia Sandbox.

Esta segunda pasada también era del agente implementador, no independiente. Al registrarla, el PR #181 seguía
Draft y sin decisión de review. El veredicto provisional de entonces fue **no aprobar archive**; ese estado
quedó superado por el ensayo asistido, la publicación y la revisión independiente posterior.

## Hallazgos

| Severidad | Superficie | Hallazgo | Resolución |
| --- | --- | --- | --- |
| Major | Verificación de release | No es legítimo ejecutar el instalador en la estación normal porque la identidad HKCU del desinstalador no queda aislada. | **Resuelto por aislamiento**: el ciclo se ejecutó en el runner `windows-latest` de la corrida 35937040623; se conserva la guardia y no se usó bypass en el host. |
| Minor | Acceso directo | El escritorio puede ser una carpeta conocida del shell fuera del root temporal. | El harness solo elimina el nombre exacto del producto y lo hace también en `finally`; no borra el directorio ni otros enlaces. |
| Minor | UI asistida | La página NSIS propia necesitaba verificación de foco y ramas interactivas. | El foco, Espacio, ambas opciones Desktop/Finish, Repair y persistencia del enlace quedaron observados en Windows Sandbox; no se declara revisión de lector de pantalla. |
| Info | Artefacto | Un build local no es el binario publicable hasta reconstruirlo desde el commit integrado. | **Resuelto**: el workflow reconstruyó desde `companion-v0.3.6`, comparó los tres assets y publicó solo tras PASS; ver [release-0.3.6.md](release-0.3.6.md). |

No se encontró inyección de rutas, elevación nueva, escritura fuera de las superficies declaradas, dependencia
nueva, autoejecución bajo `/S` ni eliminación de archivos que no sean el enlace con nombre del producto. No
quedan Blockers o Majors abiertos. La opción asistida desmarcada no se automatiza en el runner: las capturas
Sandbox la prueban y el gate protegido exige la confirmación del mantenedor antes de publicar; esa limitación
permanece explícita y no se presenta como test automatizado.

### Revisión independiente Bugbot del PR #181 (23 de septiembre)

Bugbot revisó de forma independiente el diff integrado de #181. No encontró defectos accionables en la corrección
de idioma, pero señaló un P2 en `verify-release-installation.mjs`: el arnés protegido solo cubre el valor
predeterminado silencioso, no la opción asistida desmarcada. La evidencia Sandbox existente sí demuestra las ramas
marcadas y desmarcadas, pero hasta ahora no era un pre-requisito del workflow de publicación.

Resolución integrada en PR #182 (`dc10e33`): `workflow_dispatch` exige una confirmación
explícita y una ruta a evidencia JSON committed; el gate verifica versión, árbol `apps/companion` exacto del tag,
estado PASS de las cinco ramas y existencia de cada captura antes de construir o publicar. Usar el árbol, en vez
de exigir que el commit de prueba sea ancestro, conserva la comprobación ante el squash merge de #181. La limitación
queda explícita: la CI sigue probando los defaults silenciosos; el gate requiere una persona mantenedora que revise
la evidencia de Sandbox para el asistente real. La mitigación fue comprobada por CI y por la publicación protegida;
se conserva como cobertura manual obligatoria, no como aserción automática del verificador.

La primera revisión independiente del PR #182 encontró un P1 en el flujo de refs: el candidato 0.3.6 apunta al
commit `cb0995e`, que contiene las capturas y el árbol probado pero no el JSON de evidencia recién añadido. El
gate inicial leía ese JSON desde el checkout del tag, por lo que fallaría; mover el tag al commit con el JSON
cambiaría indebidamente el árbol fuente que se probó. La corrección mantiene el tag en el commit candidato,
exige despachar desde `main` protegido y obtiene el JSON desde el SHA exacto del workflow; las capturas y el
`sourceTree` se siguen comprobando contra el tag. La segunda revisión independiente del PR #182 verificó la
corrección, que el árbol y las capturas coinciden con el tag, que packaging pasó 22/22 y no encontró defectos
accionables adicionales. CI del PR pasó en todas las plataformas y el merge quedó en `dc10e33`.

## Veredicto final

**PASS para archive**: las revisiones independientes no dejan Blockers ni Majors abiertos, las limitaciones
manuales están declaradas, y la evidencia asistida y de release está ligada a la versión publicada. El gate de
deuda pasó 2/2, readiness pasó 16/16 y el archive oficial se ejecutó; este registro no suplanta el merge
protegido de cierre, que cierra #168.
