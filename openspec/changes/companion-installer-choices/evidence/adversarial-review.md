# Revisión adversarial — companion-installer-choices (#168)

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
