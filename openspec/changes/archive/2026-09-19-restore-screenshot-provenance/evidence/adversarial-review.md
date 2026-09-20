# Revisión adversarial — restore-screenshot-provenance

Una ronda, hecha por un agente. Según [CONTRIBUTING.md](../../../../../CONTRIBUTING.md), la revisión de un agente
sobre trabajo de agentes no es revisión humana ni independiente, y esta no lo es. La integración sigue la
delegación explícita del mantenedor ([decisiones](maintainer-decisions.md)).

| Ronda | Quién | Contexto | Alcance |
| --- | --- | --- | --- |
| 1 | Un agente revisor (Claude Opus 5) sin la conversación del apply | Contexto limpio: solo el repositorio y las instrucciones de revisión, en solo lectura | Diff de `eefa1bc..51a9b5a`: comprobación de procedencia, generador de capturas, pruebas, galería, README, estado, prototipos rotulados y el change entero |

Resultado: **0 Blockers, 3 Majors, 7 Minors y 3 Info**. Los tres Majors y los siete Minors están corregidos en
`d744c47`; los Info, en el mismo commit y en la reejecución posterior. El revisor no volvió a pasar sobre las
correcciones: quien las verificó fue el agente que las hizo, y eso no equivale a una segunda ronda.

La revisión encontró además un defecto del producto que no es de este change: en el paso 2, con el perfil
«Investigación», la aplicación ofrece los subtipos de software. Por decisión del mantenedor se comentó en
[#145](https://github.com/IgnacioBarEsp/project-engineering-os/issues/145), que ya rehace esa taxonomía, y la
galería lo nombra donde se ve.

## Majors

| # | Hallazgo | Resolución |
| --- | --- | --- |
| 1 | El [README](../../../../../README.md) decía «selecciona uno de los 7 perfiles canónicos». La aplicación ofrece seis roles en «¿Con qué perfil te identificas?» y once tipos en «¿Qué vas a hacer?»; los siete perfiles canónicos son claves internas de `DELIMITATIONS` que nadie elige por ese nombre. Publicar una afirmación falsa sobre la pantalla es el defecto que este change corrige, en el mismo documento. | El paso 3 describe la pantalla real: nombre, objetivo, con qué perfil te identificas y qué vas a hacer. |
| 2 | La [galería](../../../../../docs/companion/SCREENSHOTS.md) decía que «las tarjetas de subtipo afinan las recomendaciones del perfil elegido», y su propia captura muestra lo contrario: subtitulada «Elige el subtipo para Investigación», ofrece Plataforma Web / SaaS, Página Web o Landing y Aplicación Móvil. El texto contradecía a la imagen que acompaña, que es exactamente lo que #143 arregla. Además, «perfil» nombraba dos cosas distintas en las secciones 2 y 3: el rol de la persona y el perfil del proyecto. | La sección 3 describe lo que muestra la imagen, dice que la primera tarjeta aparece marcada sin que nadie la eligiera y lo anota como defecto abierto (#145). La sección 2 distingue el rol del perfil del proyecto. El defecto se añadió a «Lo que se ve y está abierto». |
| 3 | El [diseño](../design.md) afirmaba que, si las capturas volvieran a ser de navegador, la regla de `public-guidance.mjs` obligaría a declararlo. Esa regla solo comprueba que la frase «ventana real de la aplicación» esté escrita; nada impedía escribirla sobre capturas de navegador. El mismo comentario estaba en el código. | La comprobación de procedencia contrasta ahora el texto publicado con los registros: la galería tiene que citar el commit, el motor y la forma de ejecutar que ellos declaran. Con eso la afirmación es cierta, y el diseño y el comentario lo explican en esos términos. |

## Minors

| # | Hallazgo | Resolución |
| --- | --- | --- |
| 1 | `USER_PATH_RE` exigía un separador detrás del nombre de la cuenta, así que `C:\Users\ana` al final de un valor pasaba, y no reconocía la forma `/Users/` de macOS. | Regex reescrita; tres casos cubiertos en pruebas, incluidos el final de cadena y `/Users/`. |
| 2 | El registro declaraba `width` y `height` y nadie los comparaba con la imagen: recortar una captura y rehacer hash y tamaño cuadraba. | Se leen ancho y alto del IHDR del PNG y se comparan. Otros formatos no se miden, y el diseño lo dice. |
| 3 | La superficie era una lista de dos rutas. Una imagen nueva, en otra subcarpeta o en otro formato, no se comprobaba; y si alguien movía las imágenes, la comprobación pasaba por vacío. | El alcance es todo lo que cuelga de `docs/assets/companion*`, a cualquier profundidad y en ocho formatos, y falla si no encuentra ninguna imagen que comprobar. |
| 4 | El generador escribía cada imagen y su registro según los capturaba. Una ejecución interrumpida dejaba media galería del commit nuevo y media del viejo, cada mitad con su registro válido. | Publica todo o nada: captura a una carpeta de trabajo y copia a `docs/assets/` solo con las siete. Y la comprobación rechaza imágenes publicadas con commits distintos, que es la mitad que no depende del generador. |
| 5 | La carpeta pública y el directorio temporal se creaban antes del `try`; Ctrl-C no borraba nada; y el `finally` tenía una aserción que, al fallar, habría dejado la carpeta puesta y tapado el error real. | Las carpetas se crean dentro del `try`, `SIGINT` y `SIGTERM` limpian, y el `finally` llama a una limpieza idempotente sin aserciones que comprueba cada ruta y registra lo que no borre. |
| 6 | `window` y `screen` se aceptaban vacíos —`{}` decía lo mismo que no declararlos— y cualquier campo de más pasaba sin nota. El fixture de pruebas usaba una forma que el generador real nunca produce, que es como el hueco sobrevivió. | Se exigen `window.outer`, `window.viewport`, `devicePixelRatio`, `screen.id` y `screen.title`, se rechaza lo que no esté en el contrato v1, y el fixture usa ahora la forma real. |
| 7 | La sección del paso 1 de la galería decía que la pantalla pide cuatro cosas y no mencionaba los tres grupos que quedan fuera del encuadre. | Nombra lo que se ve, lo que corta el borde y los tres grupos que no aparecen. |

## Info

- **Cobertura:** las pruebas nuevas cubren cada rechazo añadido. `test/screenshot-provenance.test.mjs` pasa de
  7 a 14 casos.
- **Casos negativos documentados:** la escritura a medias y la comprobación sin nada que comprobar están
  descritas en el [diseño](../design.md) y en la [validación](validation.md), y cada una tiene su prueba.
- **Medición al día:** las capturas se rehicieron desde `d744c47` con el generador endurecido, y `npm run check`
  se volvió a ejecutar sobre el árbol final ([check.json](after/check.json)).

## Lo que esta revisión no cubre

- Ninguna persona revisó este change.
- El revisor leyó el diff y el repositorio; no ejecutó la aplicación ni regeneró las capturas.
- Las correcciones a sus hallazgos no las revisó nadie más que quien las escribió.
