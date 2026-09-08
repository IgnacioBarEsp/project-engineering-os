# Evaluar comodidad y eficiencia sin inventar resultados

El programa #66 exige comprobar el recorrido real y comparar antes/después. Este documento es el protocolo;
los resultados se añaden con artefactos y versiones cuando exista implementación.

## Matriz de QA

Para cada perfil de [experiencia](EXPERIENCE.md): carpeta vacía/existente, ruta con espacios y Unicode,
archivos originales conservados, permisos insuficientes, selección incorrecta de carpeta, vínculo fuera
de raíz, formato ilegible, doble clic, cancelación, interrupción, reintento, segunda ejecución, modificación
humana posterior e índice obsoleto. Agregar PDF textual/escaneado/corrupto, Unity sin editor o con versión
incorrecta, hub de medios apagado/modelo ausente y chat web sin acceso a archivos.

La instalación se observa con UI Automation y capturas: iniciar `.exe`, leer aviso/licencia, elegir ruta,
instalar, abrir, preparar el proyecto piloto, comprobar, cerrar y reabrir. Ensayar reinstalación y
desinstalación manteniendo hashes de proyectos. La máquina del mantenedor tiene herramientas previas;
ese ensayo no equivale a Windows limpio. Un fixture sin variables/dependencias del desarrollador y una
prueba de instalación limpia tienen resultados separados.

La landing se prepara desde la app y se construye como proyecto consumidor. Verificar navegación,
descarga real, contenido honesto, tres tamaños de pantalla, teclado, zoom, contraste, movimiento reducido,
carga de recursos, consola y red. Sin testimonios, métricas, logos de clientes o capacidades inventadas.
Un asset generado incluye receta/licencia/procedencia y fallback; una captura del producto no se falsifica.

## Benchmark pareado

1. Congelar corpus público o sintético, hash, versión de herramientas y preguntas con respuestas de referencia.
   No publicar los PDFs o proyectos privados del mantenedor.
2. Incluir los cinco perfiles y tareas respondibles/no respondibles. Separar localización de fuentes,
   modificación de código, ejecución de receta y generación de respuestas.
3. Comparar preparación manual/base contra Companion; para recuperación comparar lectura del corpus,
   búsqueda lexical convencional y contexto recuperado. Documentar la base en lugar de elegir una débil.
4. Misma tarea, modelo exacto, temperatura, presupuesto y límites. Alternar orden AB/BA y repetir al menos
   tres veces cuando se mida inferencia. Separar caché fría/caliente y no mezclar modelos con GPU saturada.
5. Registrar costo inicial (indexado/preparación), costo por tarea y punto de amortización. Una reducción
   por consulta no compensa automáticamente una preparación costosa para proyectos pequeños.
6. Conservar resultados crudos, errores y exclusiones. Publicar resumen con mediana/rango y tamaño de muestra;
   no generalizar un corpus pequeño a todos los investigadores, motores o modelos.

| Métrica | Medición válida | Distinción necesaria |
| --- | --- | --- |
| Tiempo de preparación | Reloj monotónico desde inicio hasta comprobación, con descargas y acción humana separadas. | No equiparar tiempo del agente con tiempo de una persona. |
| Contexto | Bytes/caracteres y elementos enviados; tokenizer identificado si se usa. | Dividir caracteres entre cuatro solo es estimación. |
| Tokens | Contadores de uso del proveedor/modelo, entrada/salida/caché separados. | Si no están disponibles: no medido; no inferir ahorro de facturación. |
| Calidad de recuperación | Fuente correcta, recall/precision por consulta y ubicación comprobable. | No mide por sí sola veracidad de la respuesta final. |
| Respuesta sin respaldo | Afirmaciones evaluables frente a corpus y rúbrica, citas inválidas, tasa de abstención adecuada. | Pruebas sintéticas automáticas no sustituyen revisión experta en investigación. |
| Correctitud de tarea | Pruebas funcionales, salida esperada y archivos preservados. | Un comando con exit code cero puede producir un resultado incorrecto. |
| Comodidad | Pasos/correcciones observados, errores de uso, éxito sin ayuda y observaciones de personas. | La revisión heurística del agente no es un estudio con usuarios. |

## Aceptación y límites

Cero blockers/majors abiertos en los recorridos ensayados, sin pérdida de datos ni falso estado listo.
Cada fallo produce reproducción, corrección y nueva comprobación del caso afectado. No ampliar o repetir
toda la suite si no cambió la causa; sí repetir el recorrido completo cuando la corrección altera su integración.

La evidencia distingue **PASS**, **FAIL**, **no disponible** y **no medido**. Un benchmark no está obligado
a mostrar mejora; una regresión se explica y corrige o limita la capacidad. No declarar cero alucinaciones,
perfección, éxito comercial ni compatibilidad con miles de usuarios como resultado de este ensayo.

Un revisor separado es preferible para el pase adversarial. La autoría de revisión y la participación real
del mantenedor se registran; no se fabrican sesiones humanas, calificaciones de diseño ni certificados.
