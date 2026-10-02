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

## Revisión adversarial de Companion

La revisión debe ejecutarla una persona o agente distinto del implementador sobre el SHA exacto del PR.
No es una lectura en frío con personas (#149), una revisión del instalador ni una certificación de una
release. No se archiva un change con el informe independiente pendiente.

### Preparación reproducible

1. Registrar revisor, fecha UTC, SHA, sistema, Node, Electron y árbol limpio/sucio.
2. Usar una carpeta de prueba sin datos reales. Instalar con `npm ci --ignore-scripts` en la raíz y en
   `apps/companion`. Instalar explícitamente el Electron fijado con `npm run runtime:install`.
3. En Linux, instalar Chromium de Playwright con su CLI local. No instalar proveedores ni modelos de IA.
4. Ejecutar desde `apps/companion` y guardar salidas, códigos de salida y artefactos:

```text
node scripts/verify-wizard-flow.mjs <evidencia>
node scripts/verify-ui.mjs <evidencia>
node scripts/verify-interface-contract.mjs <evidencia-contrato>
node scripts/verify-electron.mjs <evidencia-nativa>
node scripts/verify-historical-pair.mjs <evidencia-historica>
npm test
```

La prueba Electron requiere Windows. Una omisión no es PASS. El job obligatorio de Windows publica
capturas y sus registros `.png.provenance.json`, compatibles con el contrato v1 de #143. Declara
ventana exterior, viewport real, motor, versión, commit y hash de fuentes; un árbol sucio se identifica
como tal. No publicar capturas de una rama como si fueran del instalador distribuido.

### Qué inspeccionar, además de ejecutar

- Seis perfiles × dos vías × dos modos de movimiento × tres tamaños: cotejar cada celda de
  `profile-matrix.json`; no aceptar únicamente un total.
- Las 20 rutas actuales se derivan de la tabla cerrada del renderer, no de un contador escrito a mano.
  `declared-routes/route-coverage.json` compara las rutas observadas en 1180×820, 1024×700 y 480×540.
  Esa prueba utiliza respuestas de servicio fijas; no certifica instalaciones reales.
- El recorrido general usa los servicios reales con transporte nativo inyectado y conserva las
  variantes heredadas, duplicación, recuperación, búsqueda y handoff en ambos modos de movimiento.
- Leer denominadores por pantalla: controles realmente alcanzables, elementos de contraste, nodos
  y pseudoelementos medidos para movimiento y elementos posicionados. La conexión fallida tiene
  controles globales pero no acciones dentro de la vista. Un diálogo modal bloquea deliberadamente
  su fondo: comprobar foco/teclado en el diálogo, no certificar alcanzabilidad del fondo.
- Desplazarse al final, tabular, usar los controles inferiores y revisar las capturas mínima/default.
  Los paneles con borde cuentan como contenido pintado; un espaciador vacío no cuenta.
- Copiar ruta e instrucción: comprobar el texto exacto mediante `clipboard.readText()` en el proceso
  principal de Electron. Una etiqueta «Copiado» sola no prueba nada.

### Mutaciones del revisor

Trabajar en una rama o copia aislada. No tocar proyectos personales. Introducir al menos dos
mutaciones propias, una en una ruta poco visitada y otra en el transporte o en la evidencia.
Por ejemplo: footer fixed bajo transform, botón detrás de una capa, hueco inferior de 600 px,
un enfoque de otro perfil, riel/breadcrumb/pastilla incoherentes, span con aspecto de botón,
duración de 600 ms, ease-in, color literal fuera de tokens, copiar sin IPC o solo reduced-motion.
La suite debe fallar por la propiedad alterada. Restaurar la mutación y repetir hasta verde.
Adjuntar el diff de cada mutación, fallo observado y restauración. No usar un número fijo de
mutaciones como evidencia: cotejar identificadores declarados, intentados y detectados.

La doble ejecución histórica sirve bytes inmutables obtenidos con `git show`: a3b1efd (defectuoso)
y c044d2d (hotfix #142/#169). Aplica los mismos probes actuales de alcanzabilidad/contención y
contrato de copia. El hotfix precede a la nueva taxonomía y a los tokens de la ola 3; no se le
atribuye cumplir requisitos que todavía no existían. Conservar también los recorridos detenidos.

### Informe obligatorio

Adjuntar al issue y al change un informe con:

- Identidad/independencia del revisor, SHA y entorno exactos.
- Comandos, códigos de salida y límites: renderer, servicio, Electron, instalador.
- Matriz observada y denominadores mínimos; rutas/celdas ausentes.
- Mutaciones propias con reproducción y capturas originales con procedencia.
- Hallazgos P0–P3, pasos, esperado/observado y archivo/línea.
- Reprueba sobre el SHA corregido y veredicto explícito; riesgos pendientes.

El implementador puede aportar una autorrevisión claramente etiquetada, pero no sustituye este
informe ni las dos lecturas humanas de #149. CI verde tampoco sustituye aceptación humana.
