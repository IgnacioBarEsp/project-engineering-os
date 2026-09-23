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
de escritorio y no abrió la app tras desmarcar Finish. La desinstalación asistida sigue pendiente de respuesta
a la solicitud de confirmación; el workflow de release protegido tampoco se ejecutó para este candidato.

El diff nuevo no añade red, secretos, elevación, procesos en el host ni rutas de borrado. El include
adicional `MUI2.nsh` se necesita porque electron-builder incluye el archivo propio antes de MUI2; la
compilación real comprueba esa dependencia. Las pruebas de configuración protegen la lista de idiomas y
el encabezado, y `npm test --prefix apps/companion` pasó 146/146. El build limpio pasó `pack:verify` desde
`89a7614`. Veredicto provisional: **solicitar cambios hasta completar el recorrido asistido y la publicación**;
no hay otro Blocker o Major en el diff de corrección. Esta revisión es del mismo agente, no un reviewer
independiente.

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

Esta segunda pasada también es del agente implementador, no independiente. El PR #181 sigue Draft y sin
decisión de review. Veredicto: **no aprobar archive todavía**; falta cerrar el ensayo asistido de uninstall,
ejecutar el workflow protegido sobre el tag integrado y recibir revisión independiente.

## Hallazgos

| Severidad | Superficie | Hallazgo | Resolución |
| --- | --- | --- | --- |
| Major | Verificación de release | No es legítimo ejecutar el instalador en la estación normal porque la identidad HKCU del desinstalador no queda aislada. | Se conserva la guardia de GitHub Actions/VM desechable y se deja el resultado como pendiente, sin forzar una variable de bypass. |
| Minor | Acceso directo | El escritorio puede ser una carpeta conocida del shell fuera del root temporal. | El harness solo elimina el nombre exacto del producto y lo hace también en `finally`; no borra el directorio ni otros enlaces. |
| Minor | UI asistida | La página NSIS propia necesitaba verificación de foco y ramas interactivas. | El foco, Espacio, ambas opciones Desktop/Finish, Repair y persistencia del enlace quedaron observados en Windows Sandbox; no se declara revisión de lector de pantalla. |
| Info | Artefacto | Un build local no es el binario publicable hasta reconstruirlo desde el commit integrado. | La evidencia registra identidad/hash de los candidatos; la reconstrucción y el arnés del tag protegido siguen pendientes. |

No se encontró inyección de rutas, elevación nueva, escritura fuera de las superficies declaradas, dependencia
nueva, autoejecución bajo `/S` ni eliminación de archivos que no sean el enlace con nombre del producto. No hay
Blockers de código identificados; la evidencia interactiva pendiente impide cerrar el gate de archive, no se oculta
como aprobación.
