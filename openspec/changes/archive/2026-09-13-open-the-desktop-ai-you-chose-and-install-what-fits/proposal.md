# Propuesta

Issue [#100](https://github.com/IgnacioBarEsp/project-engineering-os/issues/100).

## Por qué

Dos cosas distintas, reportadas juntas porque a la persona le pasaron juntas.

**La primera es un defecto, no una carencia.** El mantenedor eligió versiones de escritorio y los botones lo
mandaron a la web de esos productos. No es una rama olvidada: `handoffPreview` declara `mode: 'web'` en cuanto
no hay una aplicación local verificada, `DESTINATIONS` guarda una URL web por cada aplicación de escritorio, y
`handoff` la abre con `openExternal`. La pantalla incluso promete «Se abrirá … en tu navegador». La aplicación
tomaba una elección explícita —escritorio— y la sustituía por otra que nadie pidió, precisamente en el momento
en que no podía cumplirla.

Y la sustitución es peor de lo que parece: quien eligió una IA de escritorio la eligió porque **lee archivos**.
Mandarlo a un chat web no es una versión degradada de eso, es otra cosa. Lo que la persona necesitaba oír es
que su aplicación está ahí y que abra ella, con el texto ya copiado.

**La segunda es una carencia real.** Se instala lo mismo para todo el mundo: motor de Node, npm, Git y el cache
de ingeniería, decidido por `IDS = ['node','npm','git']`. `selection` guarda perfil, rol, objetivo y experiencia,
y nada de eso cambia lo que se instala. Quien dijo que va a hacer una interfaz web recibe lo mismo que quien
dijo que aún no sabe, y los dos reciben lo mismo que quien está escribiendo una tesis. El mantenedor lo dijo
como una petición de profundidad: que instale lo que mi proyecto necesita, que me lo recomiende si no sé, y que
no instale nada si todavía es pronto.

## Qué se va a hacer

**Una elección de escritorio no puede abrir un navegador.** No por convención: las URL web por aplicación de
escritorio se retiran de `DESTINATIONS`, que se queda con la única que corresponde a una elección de chat web.
La rama que abría la web deja de existir en vez de dejar de tomarse.

**Tres modos de continuación, decididos por lo que la persona eligió**, no por lo que hay instalado:

| La persona eligió | Lo que hay | Qué pasa |
| --- | --- | --- |
| Una IA de escritorio | contrato observado y las seis comprobaciones de #106 pasan | se abre con la carpeta |
| Una IA de escritorio | instalada sin contrato observado, o sin firma verificable, o no instalada | **se copia la instrucción y se dice que la abras tú**, con la causa |
| Chat web | — | se abre el chat web y se copia la instrucción |

El modo de en medio es el que no existía. No abre nada, no finge haber abierto nada, y no manda a ningún sitio.

**Instalación proporcionada, con los tres caminos del issue.** El asistente pregunta por la tecnología y la
respuesta se guarda en la selección:

1. **La pidió** → se ofrece instalar lo que corresponde, con identidad, licencia, tamaño de descarga, tamaño
   instalado y destino a la vista antes de tocar nada.
2. **No sabe o es principiante** → se recomienda a partir del perfil y del inventario ya medido, con una frase
   que dice por qué, y se puede decir que no sin que la preparación se detenga.
3. **Es pronto, o el proyecto no va de eso** → no se instala stack y la pantalla explica por qué eso es
   correcto, en vez de dejar el hueco callado.

**Lo que se instala entra por la puerta que ya existe.** El cache de ingeniería se prepara con
`npm ci --ignore-scripts --bin-links=false` contra un lockfile revisado que fija la integridad de cada paquete,
y después se compara el digesto del árbol completo contra un pin del repositorio. Las tecnologías usan ese mismo
camino y ese mismo anclaje. Nada entra por un `npm install` libre.

**Lo que no se va a fingir.** Flutter y el editor de Unity son SDK e instaladores con licencia propia, fuera de
un lockfile de npm; Python tampoco entra por ahí. No se ofrecen con un botón que no funciona: se nombran, se
dice de dónde vienen y se dice por qué no se instalan desde aquí. Una negativa honesta es una respuesta.

## Qué no se va a hacer

- No se añade ningún contrato de apertura nuevo. Los de #106 se respetan tal cual: seis comprobaciones, lista
  cerrada de editores, y rechazo con su causa. Este cambio **quita** una ruta y **añade** una que no abre nada.
- No se toca el motor que redacta el prompt (#99). La recomendación no depende del modelo: con el nivel `off`
  la persona tiene el mismo derecho a una recomendación explicada, así que la decisión es de reglas sobre
  perfil e inventario y el modelo, si está, solo puede ampliar la explicación.
- No se escribe en archivos que la persona ya tenía. Lo que se instale vive en la carpeta que Companion
  administra, y la pantalla dice dónde está y que el `package.json` del proyecto no se modificó.
- No se ofrece ninguna tecnología cuya integridad no se pueda fijar.

## Riesgos

- **Quitar la web puede dejar a alguien sin salida.** Mitigación: el modo manual no es un error, es una ruta
  con su texto copiado y su causa dicha; se comprueba que exista para cada aplicación de escritorio, instalada
  o no.
- **Instalar stack escribe mucho más en la carpeta de alguien.** Mitigación: la misma revisión previa, el mismo
  diario reversible y el mismo anclaje por digesto que el resto de la preparación, y un retiro que solo borra
  un árbol que sigue coincidiendo con su pin.
- **Una recomendación puede volverse una instalación por omisión.** Mitigación: recomendar y aceptar son dos
  actos distintos, y rechazar deja la preparación en un estado válido que se comprueba.
