# Validación

Este cambio produce **un documento y ningún código**, así que lo que se valida no es un comportamiento: es que
cada afirmación del documento sobre el código sea cierta, que la comparación no esté construida para llegar a
una conclusión, y que no se haya construido nada.

## Lo que se corrió

| Comprobación | Resultado |
| --- | --- |
| `npm run check` en la raíz | 317/317 |
| `npm test` en `apps/companion` | 129/129 |
| `openspec validate --all --strict` | 21/21 |
| `npm run check:docs` | 27 enlaces del README, contrato de prompts y 20 propósitos de spec |
| `git diff main -- .github/` | vacío |
| `git diff main --stat` sobre `apps/` | vacío |

## Cada afirmación sobre el código, comprobada

| Lo que el documento dice | Dónde se comprobó | ¿Cierto? |
| --- | --- | --- |
| `asar: false` hace extraíble una clave | `electron-builder.yml:12`, y `qa/packaging.mjs` lo afirma | sí |
| Los cuatro niveles y sus cuatro etiquetas | `inference.mjs:19-25`, palabra por palabra | sí |
| `shareableFacts` reconstruye campo por campo, siete campos de primer nivel | `inference.mjs:54-75` | sí |
| `projectDataIn` compara en NFC y minúsculas | `inference.mjs`, guardia de #99 | sí |
| El borrador y las notas no viajan | `prompts.json → request.fields` de #99 | sí |
| `MAX_OUTPUT_TOKENS` es 1200 | `inference.mjs:41` | sí |
| `off` es de primera clase y la recomendación de #100 no depende del modelo | `stack-catalog.mjs` no tiene **ningún** `import` | sí |
| La degradación con su motivo ya está construida | prueba con nombre en `qa/prompts.mjs:178` | sí |
| `PROVIDERS` declara una ruta `models` por proveedor que no se llama | `inference.mjs:29-30`; ninguna referencia en todo `apps/` | sí |
| `provider` pide teclear el identificador del modelo; `local` ofrece lista | `ui/app.mjs:547-550` frente a `:551-552` | sí |
| La clave se vuelve a pedir en cada arranque | `ui/app.mjs:558` | sí |
| Las cinco frases de promesa citadas | `ui/app.mjs:129`, `:214`, `ui/index.html:17`, `SECURITY.md:17` | sí |

## Lo que se corrigió antes de la revisión

Dos cosas, encontradas comprobando las propias citas:

- El documento citaba «Tus documentos se leen **en este equipo**…» y la pantalla dice «se leen **aquí**».
  Corregido al texto exacto.
- El documento afirmaba que Cerebras y Groq dan la clave **sin tarjeta**. Es una política de dos empresas que
  no se puede verificar desde el código y puede cambiar sin avisar. Retirada, y sustituida por lo que sí
  consta: la etiqueta que la propia aplicación usa.

## La revisión independiente: FAIL, resuelta

**0 blockers, 3 majors, 7 minors**, de un revisor que no escribió el documento. Confirmó la recomendación tras
construir el mejor caso posible a favor del gateway, y comprobó contra el historial de ediciones del issue que
el criterio que decide es del mantenedor y precede a todo lo demás.

| | Qué encontró | Cómo quedó |
| --- | --- | --- |
| **M1** | Faltaba la opción que **domina** al gateway. La fricción de `provider` no es una cosa sino cuatro, medidas en la interfaz, y tres se quitan sin infraestructura usando una ruta `models` que ya está declarada y nunca se llama. El documento acreditaba a «no ofrecerlo» con «nada falta» doce líneas después de conceder que la fricción es real | Cuarta opción **D** en la tabla, con las mismas seis filas; gana en los seis criterios a las dos que hostean. La recomendación la nombra. «Nada falta» corregido a «la fricción medida se queda» |
| **M2** | El supuesto de coste era **cuatro veces** la medición que este repositorio ya publicó —1228 caracteres reales en la evidencia de #99, unos 350 tokens frente a los 1500 asumidos— y en la dirección que hace parecer peor el abuso. Y el documento decía que nada estaba medido | Las tres filas recalculadas desde los 350 medidos; el abuso baja de 233 a 134 millones. Se cita la fuente y se dice qué asumió el primer borrador |
| **M3** | El delta de spec se contradecía: la prosa prohibía un nivel que dependa de una máquina del proyecto y su propio escenario lo permitía «si se registra». Duplicaba un escenario existente, y su escenario de proceso era incomprobable | Reescrito como requisito de **proceso**, no de prohibición; dice explícitamente que no reenuncia el escenario de la clave; y el «antes» se ancla a un digesto declarado, como el precedente de `companion-evaluation` |
| **m1** | «Degrada al nivel de abajo» describe una cascada que el código no implementa | Dicho como es: un intento, y si falla la plantilla con su motivo. Sin cascada |
| **m2** | El inventario de promesas omitía dos superficies y atribuía mal una | Cinco superficies, cada una con su archivo y su línea |
| **m3** | El desglose de qué viaja omitía tres campos que viajan | Enumerados, con la nota de que las rutas no viajan porque `limitations` descarta `path` |
| **m4** | El único límite que acota el abuso se quedaba sin número | Dicho que el tope por instalación **no** acota, que el global tiene que salir del presupuesto y no al revés, y que el presupuesto del proveedor es el único límite dimensionable sin medir uso real |
| **m5** | El párrafo de `SECURITY.md` estaba en la sección equivocada | Movido a «Cuando hay un modelo de por medio» |
| **m6** | Faltaban `TLDR.md` y `readiness.json`, y `tasks.md` iba 0/24 | Escritos y marcadas |
| **m7** | La reapertura no nombraba el hecho externo del que depende todo | Nombrado: si Cerebras y Groq dejan de emitir claves gratuitas, el criterio 1 cambia de signo |

El revisor también corrigió a mitad de camino un hallazgo falso propio y dejó la corrección visible en su
archivo en vez de borrarla.

## El plan de deuda quedó pausado, y eso no se tapa

Capturar los hallazgos llevó el presupuesto del plan a **7/5 unidades**. Se investigaron los tres que aporta
este cambio, que es lo que el gate pide:

- **Resuelto:** el spec vigente decía que un proveedor caído «degrada al nivel de abajo» y el código entrega la
  plantilla sin cascada. Se alineó el spec con el código, se comprobó que no queda ninguna aparición de la
  frase laxa en `openspec/specs` ni en `docs/companion`, y se capturó como saneamiento. **7 → 6.**
- **No resuelto, y real:** la fricción del nivel `provider`. Es deuda del producto, preexistente, descubierta
  por esta revisión, y **este issue no autoriza tocar el producto**. Arreglarla dentro de este cambio sería
  transformar el alcance de un issue de decisión en uno de implementación.
- **No resoluble:** que el veredicto dependa de que dos proveedores externos sigan emitiendo claves gratuitas.
  Nadie de este lado puede cerrarlo; está nombrado en la condición de reapertura.

Con eso quedaban **6/5**, y el plan seguía pausado — y `npm run check` incluye el gate de deuda y CI corre
`npm run check`, así que la pausa bloqueaba de verdad. El mantenedor eligió sanear dos ítems, y esto es lo que
salió:

- **La fricción del nivel `provider`, resuelta.** `PROVIDERS` declaraba desde siempre una ruta `models` por
  proveedor que **no se llamaba desde ningún sitio**, mientras la pantalla hacía teclear el identificador
  exacto a mano y el nivel `local` sí ofrecía una lista. Ahora hay un control explícito que la trae —una acción
  propia, no un efecto de mirar la pantalla, porque preguntarle a un proveedor qué sirve usa la clave de la
  persona contra su cuenta— y el campo de texto se conserva como salida cuando el proveedor no responde. Se
  añadió además dónde se emite una clave, que la pantalla no decía. **Lo que no se tocó:** que la clave no se
  guarde en ninguna parte, que es una decisión deliberada y no una fricción. La revisión de cierre encontró
  además que la primera opción de la lista parecía elegida antes de guardarse; ahora empieza en «Elige un
  modelo» y una mutación de navegador demuestra que reintroducir esa divergencia falla.
- **La cobertura de CI, resuelta por un camino distinto del previsto.** El ítem decía «CI corre las travesías
  del navegador sin cache de runtimes», y al investigarlo **la premisa era falsa**: los runtimes gestionados
  son `win32-x64` únicamente y las travesías corren en ubuntu, así que ningún cache podía llenarlos ahí. La
  causa real era otra —el panel de herramientas y el mapa de código no se cubrían en ninguna parte salvo un
  equipo Windows— y se resolvió metiendo en CI el arnés de contrato de interfaz, que alcanza esas pantallas
  desde payloads simulados, no necesita ningún runtime y revalida sus 40 mutaciones. Siete líneas añadidas
  dentro del job `companion`: **nada añadido ni quitado de `CI / required`**.

Los cuatro restantes son de otros flujos, y uno de ellos —que el contexto preparado cubre solo un prefijo
pequeño en repositorios grandes— es precisamente el hallazgo que #105 publicó y que ese issue **prohibía
arreglar** para no medir un producto cambiado.

La pausa fue correcta y dijo algo verdadero: **cinco issues seguidos encontraron cosas reales y se registraron
en vez de esconderse.** Se salió de ella haciendo trabajo con evidencia, no editando el registro — que es
exactamente lo que la política prohíbe.

## Lo que no se comprobó, con su causa

- **Las políticas de alta de Cerebras y de Groq.** No se puede verificar desde el código y puede cambiar sin
  avisar. El documento no lo afirma, y la condición de reapertura lo nombra como el único hecho externo del
  que depende el veredicto.
- **Ningún coste real.** Todos los números son estimaciones con sus supuestos declarados, salvo la entrada, que
  sale de una medición publicada. Si la decisión se reabre, hay que medir uso real antes de dimensionar nada.
- **Ninguna opción de alojamiento por nombre.** Elegir un proveedor antes de decidir si se hace es empezar por
  el final, y se dice en el documento.
- **La opción D no se implementó ni se midió su efecto.** Está medida la fricción que quitaría; que quitarla
  cambie cuánta gente usa el nivel es una hipótesis, y este issue no autoriza tocar el producto.
