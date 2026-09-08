# Herramientas de contexto: identidad antes de activar

Evaluación de identidad y distribución realizada el 8 de septiembre de 2026. Estas herramientas no son
intercambiables ni necesarias para todos los proyectos. El contexto léxico local de Companion funciona
sin ellas; no es un grafo AST ni un índice semántico con embeddings.

| Candidato exacto | Licencia observada | Encaje | Decisión de integración |
| --- | --- | --- | --- |
| [GitNexus](https://github.com/abhigyanpatwari/GitNexus), npm `gitnexus@1.6.10` | PolyForm Noncommercial 1.0.0 | Análisis estructural de código | Opción condicionada al uso permitido; no distribuir como default universal para actividad comercial |
| [CodeGraph](https://github.com/colbymchenry/codegraph), npm `@colbymchenry/codegraph@1.6.0` | MIT | Código de software y juegos; identidad confirmada en el consumidor de referencia | Candidato preferido para evaluar estructura de código en el empaquetado; todavía no activado por Companion |
| [Graphify](https://github.com/Graphify-Labs/graphify), PyPI `graphifyy`, identidad observada 0.9.56 | Apache-2.0 con atribuciones MIT | Grafo de código y documentos mediante opciones de extracción | Candidato optativo para corpus mixto; validar runtime, extras, modo determinista y licencia de cada dependencia antes de empaquetarlo |

La [licencia de GitNexus](https://github.com/abhigyanpatwari/GitNexus/blob/main/LICENSE) distingue usos
permitidos; que un usuario se identifique como investigador no determina por sí solo todos los términos
de su actividad. La recomendación de producto es mantenerlo optativo y no basar la distribución general
en una suposición sobre el uso final. Su release 1.6.11 aún no cumplía la cuarentena de siete días en la
fecha de evaluación; 1.6.10 sí. Ninguna versión se instaló por esta evaluación.

CodeGraph tiene [telemetría documentada](https://github.com/colbymchenry/codegraph/blob/main/TELEMETRY.md).
La futura integración debe desactivarla y comprobarlo: `DO_NOT_TRACK=1` también desactiva la comprobación
de nuevas versiones; `CODEGRAPH_TELEMETRY=0` y `CODEGRAPH_NO_UPDATE_CHECK=1` dejan explícitas ambas
decisiones. Son variables del proceso de la herramienta, no cambios globales al entorno del usuario.
El paquete npm 1.6.0 selecciona binarios por plataforma, con runtime propio. No se ejecuta un instalador
remoto pegado al shell ni se delega al proyecto la elección del ejecutable.

Graphify usa el nombre PyPI con doble **y** final. Su [pyproject oficial](https://github.com/Graphify-Labs/graphify/blob/v8/pyproject.toml)
separa extras de PDF, Office, MCP, visión y modelos. Instalar todos los extras sería un costo evitable.
La lectura de metadata no prueba que sus analizadores, ruedas Windows o modos sin proveedor funcionen
en Companion. La versión observada no es todavía un pin aprobado de distribución.

Otros repositorios llamados CodeGraph, entre ellos Synaptic, son proyectos distintos con licencias y
interfaces distintas. La selección del consumidor se verificó en sus scripts npm; no se dedujo por el nombre.

## Contrato para una activación futura

1. Identidad exacta, versión, integridad del binario, licencia y plataforma revisadas.
2. Plan de cambios y consumo de disco visible; opciones de red/modelos explícitas.
3. Ejecución desde la app con argumentos validados, sin shell ni comandos tomados de documentos.
4. Índice creado sobre el corpus permitido, comprobación de vigencia y una consulta representativa.
5. Entrada del agente comprobada; desactivación y recuperación documentadas.

Encontrar `.codegraph/`, `.gitnexus/` o `graphify-out/` solo significa **artefacto presente**. Un archivo
de configuración significa **configuración presente**. Ambos siguen sin verificar hasta cumplir el
contrato anterior. #79/#80 implementan las opciones de instalación; #81 compara su utilidad real por perfil.
