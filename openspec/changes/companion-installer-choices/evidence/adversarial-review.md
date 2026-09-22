# Revisión adversarial — companion-installer-choices (#168)

## Revisión de la corrección 0.3.6

Una segunda pasada con la lente de seguridad, corrección, rendimiento y mantenibilidad encontró la causa
que la revisión estática inicial no había captado: en 0.3.5 `nsis.language` fija VERSIONINFO, pero no
selecciona las páginas MUI. **Major confirmado en el artefacto publicado:** las páginas estándar y el
encabezado heredado de la página propia seguían en inglés en Windows Sandbox. No se aceptó 0.3.5 como
cierre de #168. La corrección añade `installerLanguages: [es_ES]` y fija el encabezado propio; el
instalador local 0.3.6 compiló y las páginas hasta escritorio se observaron en español. Falta medir el
Finish y el efecto del opt-out en disco antes de aprobar la rama.

El diff nuevo no añade red, secretos, elevación, procesos en el host ni rutas de borrado. El include
adicional `MUI2.nsh` se necesita porque electron-builder incluye el archivo propio antes de MUI2; la
compilación real comprueba esa dependencia. Las pruebas de configuración protegen la lista de idiomas y
el encabezado, y `npm test --prefix apps/companion` pasó 146/146. Veredicto provisional: **solicitar cambios
hasta completar el recorrido asistido y verificar el build limpio**; no hay otro Blocker o Major en el
diff de corrección. Esta revisión es del mismo agente, no un reviewer independiente.

La revisión se hizo sobre el diff desde `2384fab`, con la lente de seguridad, corrección, rendimiento y
mantenibilidad de la skill `code-review`. Es una revisión del agente en el mismo checkout; por tanto no se
declara revisión independiente ni sustituye al reviewer protegido del PR.

## Hallazgos

| Severidad | Superficie | Hallazgo | Resolución |
| --- | --- | --- | --- |
| Major | Verificación de release | No es legítimo ejecutar el instalador en la estación normal porque la identidad HKCU del desinstalador no queda aislada. | Se conserva la guardia de GitHub Actions/VM desechable y se deja el resultado como pendiente, sin forzar una variable de bypass. |
| Minor | Acceso directo | El escritorio puede ser una carpeta conocida del shell fuera del root temporal. | El harness solo elimina el nombre exacto del producto y lo hace también en `finally`; no borra el directorio ni otros enlaces. |
| Minor | UI asistida | La página NSIS propia necesita verificación real de foco, idioma y las dos ramas de Finish. | Se protegen configuración y macros estáticamente; las cuatro ramas quedan declaradas para el runner Windows. |
| Info | Artefacto | Un build local no es el binario publicable hasta reconstruirlo desde el commit integrado. | La evidencia registra identidad y hash de cada candidato y el workflow vuelve a construir desde el tag protegido. |

No se encontró inyección de rutas, elevación nueva, escritura fuera de las superficies declaradas, dependencia
nueva, autoejecución bajo `/S` ni eliminación de archivos que no sean el enlace con nombre del producto. No hay
Blockers de código identificados; la evidencia interactiva pendiente impide cerrar el gate de archive, no se oculta
como aprobación.
