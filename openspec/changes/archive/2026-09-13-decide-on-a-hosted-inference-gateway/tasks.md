## 1. Los criterios, antes de mirar nada

- [x] 1.1 Seis criterios escritos en el cuerpo del issue antes de evaluar ninguna opción, y congelados por
      digesto en `criteria.json` para que el orden no dependa del historial de un servicio externo.
- [x] 1.2 Decir cuáles pesan más, en vez de promediarlos: el primero casi resuelve el issue por sí solo.

## 2. La evaluación

- [x] 2.1 Qué aporta un gateway que los tres niveles existentes no den, leído del código y no supuesto.
- [x] 2.2 Qué promesas de la aplicación cambiarían, citadas tal como están hoy en pantalla.
- [x] 2.3 Qué datos de terceros pasarían por dónde, y qué obligaciones trae eso.
- [x] 2.4 Coste con supuestos de volumen declarados antes que los números, y con el caso de abuso incluido.
      La entrada **no se estima**: sale de la medición que este repositorio ya publicó en la evidencia de #99.
      El primer borrador asumió cuatro veces esa cifra, y en la dirección que empeora el abuso.
- [x] 2.5 Qué pasa cuando falla, y a quién deja sin nivel.
- [x] 2.6 Cuánto trabajo continuo exige, como criterio y no como nota al pie.

## 3. Las opciones

- [x] 3.1 Al menos dos opciones de alojamiento comparadas contra los seis criterios. **Son cuatro**: una
      revisión independiente encontró que faltaba la que ataca el mismo problema sin hostear nada, y que
      gana en los seis criterios a las dos que hostean.
- [x] 3.2 No ofrecerlo evaluado como opción de pleno derecho, con las mismas filas que las demás.
- [x] 3.3 Decir cuál de las dos que construyen es mejor, y que las dos comparten lo que las hace mala idea hoy.

## 4. Si se decidiera que sí

- [x] 4.1 Autenticación por instalación, diciendo qué no resuelve.
- [x] 4.2 Límites diseñados contra alguien que lo use como API gratuita, no contra un usuario educado.
- [x] 4.3 Qué se registra, cuánto se conserva y qué ve el mantenedor.
- [x] 4.4 La propiedad de que el registro no reconstruye el proyecto de nadie, enunciada junto a la condición
      de la que depende.
- [x] 4.5 Qué tendría que cambiar en lo que la aplicación promete.

## 5. La decisión

- [x] 5.1 Recomendación explícita, con su razón, al principio del documento.
- [x] 5.2 Cuándo se reabre, escrito.
- [x] 5.3 Qué no decide este documento, escrito.

## 6. Evidencia y entrega

- [x] 6.1 Registro de decisión en `docs/companion/HOSTED_INFERENCE.md`, alcanzable desde la documentación.
- [x] 6.2 Delta de spec que fije **el proceso** por el que se decide añadir un nivel de inferencia, no una
      prohibición. Una revisión independiente encontró que la primera versión se contradecía: su prosa prohibía
      un nivel que dependiera de una máquina del proyecto y su propio escenario lo permitía si se registraba.
      Que no se reparta una clave dentro de la aplicación ya lo fija un escenario vigente, y no se reenuncia.
- [x] 6.3 Revisión adversarial independiente de si la comparación está construida para llegar a una conclusión,
      con el verdicto completo guardado.
- [x] 6.4 Capturar los hallazgos en el registro de deuda con la categoría que cada uno tenga de verdad.
- [x] 6.5 Compuertas de la raíz y del companion en verde, y `openspec validate --all --strict` sin fallos.
