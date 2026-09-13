# TLDR

Issue [#106](https://github.com/IgnacioBarEsp/project-engineering-os/issues/106).

Claude y OpenCode están en la lista de imprescindibles del mantenedor, las dos instaladas y firmadas, y hasta
ahora **ninguna se reconocía siquiera**: quien usara cualquiera de las dos caía en la exportación sin que la
aplicación le dijera por qué. El issue pedía una respuesta verificada por cada una —hay contrato y es este, o
no hay y aquí está por qué— y decía que **las dos respuestas son válidas**. Salieron distintas.

## Qué se encontró, leyendo las instalaciones

| | Claude | OpenCode |
| --- | --- | --- |
| Firma | Válida, `Anthropic, PBC` | Válida, `Anomaly Innovations, Inc` |
| `--help` | no imprime ayuda; entrega los argumentos a la instancia que ya corre | no imprime ayuda; abre una ventana |
| CLI en el PATH | ninguna | ninguna |
| Esquema registrado | `claude://` → ese mismo ejecutable | `opencode://` → ese mismo ejecutable |
| Ruta con carpeta declarada por su build | **`claude://code/new?folder=<codificada>`**, construida tras comprobar que el destino es un directorio | **ninguna** |

**Claude sí tiene contrato observado. OpenCode no.** Ninguna de las dos respuestas salió de documentación.

## Qué hace

- **Claude se abre** por exactamente la ruta que declara, con la carpeta codificada y nada más, y solo cuando
  se cumplen seis cosas a la vez, releídas entre la revisión y la apertura: archivo regular sin vínculos, firma
  válida, editor en la lista, bytes idénticos, el sistema entregando ese esquema a ese mismo ejecutable, y el
  build declarando la ruta. Quitar cualquiera rechaza con su propia frase y no abre nada.
- **OpenCode se reconoce y no se abre**, con su causa, y la exportación revisada sigue siendo su respuesta.
- **Cada rechazo dice cuál es**: Antigravity porque su firma no verifica aquí, OpenCode porque no declara cómo
  recibe una carpeta **aunque su editor sí se comprueba**. Son hechos distintos y la persona recibe los dos.

## Qué se midió

**6 aplicaciones instaladas, 4 verificadas, 2 rechazadas, 0 hallazgos.** Leer la declaración cuesta **11 ms**
en un paquete de 36,1 MiB. Cinco recorridos nativos con 0 hallazgos, 36 pantallas de navegador con 0 hallazgos,
39 mutaciones de interfaz y 17 de servicio detectadas. Se abrió Claude una vez, por el camino del producto,
contra una carpeta llamada `carpeta sintetica & literal`.

## Una revisión independiente, FAIL, resuelta

**1 blocker y 6 majors.** El blocker: la pantalla decía que no se pudo comprobar el editor de OpenCode, y sí se
puede — la frase era cierta por accidente mientras el único rechazo era el de Antigravity. Los majors: **tres
de las seis comprobaciones sobrevivían a una mutación deliberada** porque las pruebas inyectaban el lector y el
real nunca corría; el arnés convertía en éxito cualquier lanzamiento que no hizo nada; el registro afirmaba una
entrega que no midió; la documentación declarada no se entregó; y dos de las seis comprobaciones viven en rutas
que la propia cuenta puede escribir sin estar ancladas a ninguna firma. Todo resuelto o dicho.

La revisión también **verificó por su cuenta** las dos conclusiones contra las instalaciones reales, y ambas se
sostienen.

## Qué NO demuestra

**Nadie miró la ventana de Claude.** Es lo único que separa «se le entregó la carpeta» de «la abrió», y necesita
una persona. **OpenCode no se abrió nunca**, que es el resultado correcto. Las CLI de ambas no se detectan
porque no hay ninguna en el PATH de este equipo. La comprobación se probó contra **un** build de Claude. Y
arrancar una aplicación en frío con el entorno recortado sin `PATH` sigue sin comprobarse, con su causa.
