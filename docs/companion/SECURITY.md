# Decisión de seguridad local de Companion

Estado: alcance aprobado por delegación explícita del mantenedor para #66 y #77, 8 de septiembre de 2026.
Activa `auth-security` solo en la configuración upstream; no cambia la semilla universal. Esta decisión
cubre planificación, datos y recuperación del motor; la frontera IPC/Electron y distribución se amplían
y verifican en #79–#81 antes de entregar la app.

## Activos y fronteras

Los originales del usuario, el alcance de carpeta seleccionado y los recibos de preparación son los
activos principales. El llamador de confianza es el proceso principal de la app, que mantiene los planes;
la futura interfaz recibe una vista y un identificador, no autoridad para elegir comandos o contenidos.
Los archivos, nombres, recibos y journals de un proyecto se tratan como entrada no confiable. No existe
autenticación remota, sesión web, secreto de proveedor, telemetría, envío de documentos ni ejecución de IA
en esta etapa. Un identificador de plan es local al proceso y no se puede reutilizar en otra instancia.

| Riesgo | Control y comprobación |
| --- | --- |
| Plan manipulado o de otra sesión | Mapa privado de planes; la vista devuelta es una copia; un identificador desconocido exige nueva revisión. |
| Cambios después de revisar | Reinspección/fingerprint y comparación de cada hash antes de aplicar; también al reanudar. |
| Dos aplicaciones sobre una carpeta | Creación exclusiva del bloqueo y rechazo de proceso activo; retiro explícito de un bloqueo abandonado. |
| Recibo/journal adulterado | Límites de lectura, tipos, versiones, hashes, consistencia del recibo y lista fija de destinos. |
| Vínculo o ruta fuera de alcance | Raíz canónica, comprobación de rutas, rechazo de symlinks/junctions y hardlinks administrados. |
| Lectura excesiva o sensible | Presupuestos de entradas/profundidad/bytes, exclusiones conocidas y sin ejecución de código del proyecto. |
| Pérdida de ediciones en recuperación | Prevalidación de todas las operaciones, restauración por hash y conflicto visible ante cambios humanos. |
| Constructor con autoridad ampliada | Adaptador limitado a plan/apply/check/rollback; módulo fijado inyectado por el proceso de confianza; conserva ownership del núcleo. |

## Privilegios, límites y recuperación

Se trabaja con permisos normales de la persona y dentro de una carpeta de proyecto explícita. No se
elevan privilegios, alteran controles del sistema, instalan servicios ni toman credenciales. La selección
de toda la unidad, carpeta personal o directorio de instalaciones del sistema se rechaza.

La persistencia local no es una firma criptográfica: alguien con permiso de escritura puede modificar
su carpeta. Las rutas de recuperación permanecen limitadas aunque modifique un recibo. No se promete
aislamiento frente a un proceso hostil que cambie el sistema de archivos en paralelo con privilegios
equivalentes; los cambios ordinarios y la concurrencia de aplicaciones sí tienen controles comprobados.
Una escritura parcial que no coincida con el journal exige preservar y revisar el conflicto; nunca se
convierte un hash desconocido en permiso de sobrescritura. No hay exportación de datos en este motor.

El retiro y reanudación usan solo la operación registrada. No se retira un bloqueo malformado por
suposición. El constructor conserva su propio journal y su propio rollback. La futura desinstalación
de la app debe conservar proyectos y no activar recuperación en ellos. Consulta [preparación](PREPARATION.md).
