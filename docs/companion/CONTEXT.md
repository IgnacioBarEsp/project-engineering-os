# Contexto con fuentes y recetas

El motor de Companion puede preparar contexto local para investigación, software, Unity, contenido y
tareas generales. La interfaz que expondrá estas operaciones corresponde a #79. Este módulo no declara
que el instalador, la IA externa o una herramienta de grafos ya estén funcionando.

## Qué se lee

| Material | Localizador | Límite visible |
| --- | --- | --- |
| Texto UTF-8 y código | Línea del archivo original | Codificación, tamaño y cantidad de extractos |
| PDF con texto | Página real | Páginas sin texto, contraseña, parser, tamaño y máximo de páginas |
| DOCX | Párrafo de `word/document.xml` | No conserva paginación visual; no lee comentarios, notas al pie ni otras partes |
| Imagen, audio, video, otros binarios | Metadatos del inventario | Sin transcripción, OCR ni interpretación automática |

Un PDF escaneado necesita OCR. La extracción no consulta vínculos, ejecuta macros ni envía documentos.
La ausencia de texto no prueba que el documento no contenga información. Tablas, columnas, fórmulas,
orden visual de lectura y PDF con fuentes inusuales necesitan comprobación contra el original.

Los parsers se ejecutan en workers con límite de heap y tiempo. Esto contiene uso de recursos, pero no
es un sandbox del sistema operativo. Los bytes del documento se pasan directamente al parser; no se
aceptan URL de documentos. Los workers no reciben rutas del proyecto.

Los límites máximos iniciales son 8 MiB por archivo, 32 MiB de lectura de fuentes, 2 MiB de texto,
3000 extractos, 100 páginas por PDF y 10 segundos por parser. El inventario tiene además sus propios
límites de entradas/profundidad/lectura. Cualquier cobertura parcial aparece en el plan y el índice.
Se pueden reducir los límites y excluir rutas relativas de archivos o carpetas antes de preparar.

Las rutas propias de control, cachés e índices externos no forman parte del corpus de documentos.
Las entradas de instrucciones de los agentes se conservan y se leen como política por separado; el
índice enumera esas rutas en `controlPaths`. Otras fuentes, como `.github/workflows`, sí se inspeccionan.
La cobertura completa se refiere a ese alcance documental explícito. Se excluyen nombres
habituales de credenciales; un reconocedor adicional retira fuentes con patrones de secretos. Ningún
reconocedor garantiza encontrar todos los datos sensibles. La exportación siempre necesita revisar qué
se compartirá con la IA externa, incluidas rutas y datos personales.

## Buscar y compartir

La búsqueda es léxica y tolera diferencias de acentuación. Devuelve hasta seis extractos por defecto,
con un máximo de dos por fuente para evitar que un único documento ocupe todos los resultados. Las
coincidencias ayudan a localizar evidencia; no son una evaluación semántica de su suficiencia.

Antes de buscar o exportar se vuelve a inspeccionar el corpus y comprobar hashes de los documentos
legibles, incluidos PDF y DOCX. Una fuente modificada o una nueva entrada invalida el índice. Los
extractos obsoletos quedan bloqueados hasta actualizar. Fuera de Companion, el agente debe comprobar
el hash del original antes de citar un extracto guardado.

La exportación devuelve texto revisable con consulta, cobertura, hashes y localizadores. Su presupuesto
incluye encabezado, citas y advertencias en bytes UTF-8, entre 2048 y 64000 bytes. No transmite nada,
no inicia una conversación y no presenta bytes como tokens consumidos. Sin coincidencias, o sin espacio
para incluirlas, declara evidencia insuficiente. Los resultados se serializan como datos; la instrucción
de no obedecer un documento no elimina por sí sola todos los ataques de prompt injection.

## Entrada para agentes

| Selección | Entrada al mapa |
| --- | --- |
| Codex, OpenCode | Bloque delimitado en `AGENTS.md` |
| Claude Code | Bloque delimitado en `CLAUDE.md` |
| Cursor | `.cursor/rules/project-os-companion.mdc`, regla siempre aplicable |
| GitHub Copilot | Bloque delimitado en `.github/copilot-instructions.md` |
| Chat web | Exportación revisable, sin crear archivos de configuración de agentes |

Los bloques apuntan a `.project-os/companion/context/MAP.md`, que conduce a recetas y fuentes. La
instrucción existente se conserva. El estado es **instrucciones configuradas**; comprobar que una versión
concreta del agente las carga requiere el recorrido de #79/#81. No se escriben workflows OPSX.

Cuando la carpeta ya tiene estado del constructor, sus espejos AGENTS/CLAUDE/Copilot permanecen bajo
ese owner. El bloque se añade a la fuente del consumidor `.project-os/instructions.md`; el resultado
indica **comprobar sincronización**. El adaptador ofrece `planSync` y aplica el plan mediante el constructor
real. Después de sincronizar se actualiza el contexto si cambiaron fuentes generadas. El recorrido
base → ingeniería → contexto → sync → contexto se comprueba en QA: al final ambas verificaciones pasan.
Si se añade ingeniería a una carpeta que ya tenía rutas directas, la app debe recuperar esas rutas antes
de cambiar su estrategia; el motor rechaza mezclar owners silenciosamente.

Las recetas propias de Companion tienen entradas, pasos, salidas, validación, presupuesto inicial de
contexto y regla de detención. Incluyen navegación económica y escritura clara, más una tarea específica
por perfil. Software y Unity remiten al OpenSpec local cuando esté verificado; las demás tareas no
heredan procesos de ingeniería innecesarios. No se atribuyen a skills de terceros ni prometen ahorro medido.

## Recuperar cambios

El plan no escribe archivos. La aplicación verifica fuentes, selección y destinos de nuevo, usa el
mismo bloqueo de carpeta que el motor base y registra una transacción con rutas fijas y hashes. Una
interrupción admite continuar o deshacer; las ediciones posteriores detienen la recuperación para no
sobrescribirlas. Las actualizaciones pueden preservar texto agregado fuera del bloque de instrucciones.
El diario conserva los valores anteriores de la última operación y puede contener extractos sensibles;
debe permanecer local y excluirse de publicaciones junto con el índice cuando corresponda.

El modelo protege contra entradas/estados inválidos, vínculos, errores e interrupciones. No autentica
criptográficamente a otro proceso del mismo usuario con permiso de escribir toda la carpeta. La
mutación hostil simultánea del sistema de archivos está fuera de esta garantía.

## Dependencias del paquete separado

| Dependencia | Versión | Licencia | Motivo y alternativa |
| --- | --- | --- | --- |
| [PDF.js](https://github.com/mozilla/pdf.js) | 6.3.289 | Apache-2.0 | Texto por página sin ejecutable de conversión externo; alternativa: conversor empaquetado con su mantenimiento y licencias |
| [fflate](https://github.com/101arrowz/fflate) | 0.8.3 | MIT | Leer solo el XML de documento DOCX con límites; alternativa: conversor de Office completo |
| [saxes](https://github.com/lddubeau/saxes) | 6.0.0 | ISC; xmlchars 2.2.0 MIT | Validación XML con namespaces y párrafos vacíos; sustituye una extracción con expresiones regulares que falló revisión adversarial |
| [@napi-rs/canvas](https://github.com/Brooooooklyn/canvas) | 1.0.8, lockfile | MIT, con avisos de bibliotecas nativas | Dependencia opcional de PDF.js necesaria para sus objetos gráficos en Node; no se usa para generar assets |

La app usa Node 24.18.0 para validación; el núcleo conserva sus versiones Node 20/22. El lockfile incluye
integridades de paquetes por plataforma. No hay servicio pagado, cuenta ni telemetría de Companion.
Los avisos completos de dependencias deben acompañar el instalador en #80; MIT no sustituye los avisos
de PDF.js o bibliotecas nativas. El paquete público del núcleo excluye `apps/` y sus dependencias.

La elección de herramientas de grafos está en [GRAPH_TOOLS.md](GRAPH_TOOLS.md). El protocolo de
comparación real de eficiencia está en [EVALUATION.md](EVALUATION.md).
