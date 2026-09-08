# Arquitectura candidata de Companion

Estado: decisión de implementación propuesta para #66/#76, con IA externa confirmada por el mantenedor.
El núcleo npm mantiene distribución y ownership actuales. La aplicación tendrá su propio paquete y ciclo
de versión; sus dependencias de UI no se sembrarán ni publicarán en el núcleo universal.

## Alternativas

| Opción | Ventaja | Costo o límite | Decisión inicial |
| --- | --- | --- | --- |
| Electron + instalador NSIS | Reutiliza Node y motor existente; UI web comprobable, runtime incluido y mismo renderer en equipos distintos. | Descarga/memoria mayores; mantener Chromium/Node; aislamiento estricto de privilegios. | Candidato para primera entrega comprobable. |
| Tauri + WebView2 + motor lateral | Shell pequeño, permisos explícitos, instaladores convencionales. | Rust/toolchain más sidecar Node; distribución/actualización de WebView2 y más piezas que verificar. | Reconsiderar con métricas reales de tamaño/memoria. |
| .NET nativo | Controles Windows e integración de sistema. | UI/QA distintos del sitio, runtime/toolchain y puente al motor Node. | Alternativa si Windows exclusivo domina a largo plazo. |
| Web local/portable | Prototipo rápido y distribución sencilla. | Lanzador, permisos de carpetas y ciclo de vida aún requieren una solución para personas no técnicas. | Prototipo/diagnóstico, no sustituye el instalador solicitado. |

Fuentes primarias: [seguridad de Electron](https://www.electronjs.org/docs/latest/tutorial/security),
[NSIS en electron-builder](https://www.electron.build/nsis/),
[instalación Windows en Tauri](https://v2.tauri.app/distribute/windows-installer/),
[distribución WebView2](https://learn.microsoft.com/en-us/microsoft-edge/webview2/concepts/distribution).
La elección se verifica con tamaño, arranque, memoria y recorrido real; no se deduce rendimiento de un framework.

## Componentes

```text
Instalador → aplicación local
                 interfaz sin privilegios
                         ↓ contrato validado
                 coordinador de preparación
                  ↙          ↓          ↘
           motor neutral   contexto     adaptadores externos
             /SDD          y recetas    seleccionados
                  ↘          ↓          ↙
                   carpeta del proyecto
                   plan / recibo / fuentes
```

El coordinador recibe selección explícita de carpeta y un plan ligado a su contenido. No acepta comandos
arbitrarios desde el renderer ni ejecuta scripts encontrados en el proyecto. Operaciones largas no bloquean
la UI. El estado persistido permite reconocer interrupciones; repetir no significa ejecutar a ciegas.

La aplicación lee solo recursos empaquetados en su UI, con aislamiento, sandbox, CSP, navegación/ventanas
restringidas y validación del emisor de mensajes. Enlaces externos provienen de destinos revisados.
Diálogos nativos eligen archivos/carpetas; el motor verifica límites, vínculos y ownership independientemente
de la interfaz. Autenticación de agentes y licencias de herramientas siguen en sus clientes oficiales.

El motor mantiene inventario acotado, plan, aplicación transaccional, comprobación y retirada de archivos
propios sin tocar modificaciones humanas. La aplicación guarda historial en su directorio de usuario;
los proyectos conservan su estado recuperable. Desinstalar la app no recorre carpetas del usuario.

## Adaptadores y recuperación

| Necesidad | Base o candidato | Condición de aceptación |
| --- | --- | --- |
| Encontrar texto y referencias | Índice local acotado y consulta con fuentes; PDF.js para texto PDF. | Página/línea, frescura, exclusiones y fallos visibles; OCR no se presupone. |
| Estructura de código | GitNexus, identidad upstream exacta. | Versión/licencia revisada, plataforma soportada, indexado y consulta de muestra. |
| Segundo analizador | CodeGraph con repositorio exacto, no por nombre genérico. | Resolver forks/renombres y verificar interoperabilidad antes de activar. |
| Grafo mixto/documental | Graphify con backend/receta explícitos. | Costos, uso de modelos, límites y calidad observados en el corpus objetivo. |
| Medios locales | Adaptador a hub existente de recetas. | Servicio local, modelo/hardware y salida real; no empaquetar el hub privado. |

Fuentes de evaluación: [GitNexus](https://github.com/abhigyanpatwari/GitNexus),
[Graphify](https://github.com/Graphify-Labs/graphify),
[CodeGraph/Synaptic](https://github.com/Synaptic-Graph/Synaptic),
[PDF.js](https://mozilla.github.io/pdf.js/).
Existen proyectos distintos llamados CodeGraph y Graphify. Un nombre, una carpeta de índice o un
README no prueban compatibilidad. La base local funciona aunque un adaptador opcional esté ausente.

## Distribución y privacidad

Build de Windows por usuario, identidad y checksum por artefacto, licencias incluidas y separación de
versión del núcleo/aplicación. Dependencias fijadas, instaladas con scripts deshabilitados salvo pasos
explícitamente revisados del empaquetado. No hay token de publicación dentro del instalador.

La primera prueba local puede usar un artefacto sin firma. Eso no satisface distribución con editor
verificado: no se suprimen advertencias del sistema ni se afirma que desaparecerán en otros equipos.
La firma de distribución, actualización segura y compatibilidad en Windows limpio se registran con su
evidencia propia antes de una promesa pública de instalación sin fricción.

Por defecto no se envían archivos a un servicio externo. La exportación de contexto lista qué contendrá;
la persona decide si entregarlo al chat. Diagnóstico compartible excluye contenido, credenciales y rutas
personales. No se escanea el equipo entero buscando proyectos, secretos o cuentas.

Rollback de código: PR de reversión. Rollback de proyecto: recibo atribuible y comparación de hashes;
preservar cambios posteriores del usuario. Rollback de app: instalador anterior verificado, con estado
migrado mediante esquema explícito y copia recuperable. No usar resets destructivos.
