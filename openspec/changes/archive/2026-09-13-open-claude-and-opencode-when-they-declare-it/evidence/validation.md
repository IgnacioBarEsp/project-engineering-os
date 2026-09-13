# Validación — qué declara cada aplicación, y qué se hizo con esa respuesta

Todo lo de aquí se ejecutó en esta rama, contra las instalaciones reales de este equipo.

## Puertas

| Comprobación | Resultado |
| --- | --- |
| `npm run check` (raíz) | **317 pruebas, 0 fallos** |
| `apps/companion` `npm test` | **107 pruebas, 0 fallos** |
| `apps/companion` `npm run evidence:launches` | **6 instaladas, 4 verificadas, 2 rechazadas, 0 hallazgos** |
| `apps/companion` `npm run evidence:contract` | **39 mutaciones, 39 detectadas** |
| `apps/companion` `npm run evidence:mutations` | **17 mutaciones, 17 detectadas**, fuente restaurada |
| `apps/companion` `npm run evidence:native` | **5 perfiles, 0 hallazgos** |
| `openspec validate --all --strict` | 21 de 21 |

## La respuesta de cada aplicación

`evidence/local-launches.json`, leído de lo instalado:

| Aplicación | Editor verificado | Contrato | Resultado |
| --- | --- | --- | --- |
| Codex | OpenAI OpCo, LLC | `codex app --help` declara `[PATH]` | se abre |
| Cursor | Anysphere, Inc. | argumento de ruta | se abre |
| Visual Studio Code | Microsoft Corporation | argumento de ruta | se abre |
| **Claude** | **Anthropic, PBC** | **`claude://code/new?folder=` declarado por su propio build, y el sistema entrega ese esquema a ese mismo ejecutable** | **se abre** |
| **OpenCode** | Anomaly Innovations, Inc | **ninguno**: registra `opencode://` y reparte los enlaces a su renderer, sin ninguna ruta con parámetro | **no se abre**, con su causa |
| Antigravity | — | — | no se abre: su firma no verifica aquí |

Las dos respuestas que pedía el issue son distintas y las dos son resultados. Ninguna salió de documentación:
se leyeron la ubicación, la firma, la ayuda, el PATH, el esquema registrado y las rutas que cada build declara.

## Lo que se exige antes de abrir Claude

Seis comprobaciones, todas releídas entre la revisión y la apertura. Cada una se quitó por separado en
`qa/local-apps.mjs` y cada una rechaza con su propia frase:

| Se quita | Qué contesta |
| --- | --- |
| la ruta declarada por el build | «Esta versión de la aplicación no declara cómo recibir una carpeta.» |
| el esquema registrado | «El sistema no entrega esa dirección a esta misma aplicación.» |
| el esquema apunta a otro ejecutable | la misma, y no se abre |
| la firma válida | «La firma o el editor de la aplicación no se pudo verificar.» |
| el editor esperado | la misma |
| los bytes iguales | «La aplicación cambió después de la revisión.» |

Y ninguna de esas rutas llega a una apertura: la prueba cuenta los lanzamientos y solo hay uno, el que cumplía
las seis.

La dirección se construye con la carpeta **codificada**: la prueba usa `mi proyecto & notas` y comprueba que
llega entera, con su espacio y su ampersand.

## La apertura real, y lo que no se puede ver desde aquí

Se abrió una vez, por el camino del propio producto, contra una carpeta sintética llamada
`carpeta sintetica & literal`:

- **14 procesos de Claude antes y 14 después.** No apareció uno nuevo, y eso **no es un fallo**: Claude ya
  estaba abierta y entrega la dirección a la instancia que existe. El arnés distingue ahora las dos formas —
  una aplicación que arranca un proceso y otra que entrega a la que ya corre— porque contar procesos reportaba
  como fallo un lanzamiento que funcionaba. Concluir desde una ausencia es el error que este repositorio ya
  pagó dos veces.
- El registro dice `projectAttached: true`, `agentReadProject: false`. Abrir no afirma que la IA leyó nada.
- **Que la ventana muestre esa carpeta no se puede observar desde aquí.** Queda en la lista de «sin verificar,
  con su causa», que es donde debe estar: necesita que una persona lo mire.

El arnés también aprendió otra cosa por el camino: contaba procesos solo para cuatro aplicaciones y devolvía
`null` para el resto, y `null` se estaba leyendo como cero. Ahora distingue **no medido** de **cero**, y lo
no medido se registra como tal en vez de convertirse en una conclusión.

## Lo que no se midió

- **Nadie miró la ventana de Claude.** Es lo único que separa «se le entregó la carpeta» de «la abrió».
- **OpenCode no se abrió nunca**, que es el resultado correcto: sin contrato observado no hay apertura.
- **Las CLI de ambas no se detectan** porque no hay ninguna en el PATH de este equipo. Si aparece una, es otra
  aplicación y necesitaría su propio contrato.
- La comprobación de la ruta declarada se probó contra **un** build de Claude. Otra versión podría declararla
  en otro lugar del paquete, y entonces la apertura dejaría de ofrecerse — que es el comportamiento correcto.
- Nadie usó la interfaz a mano.
