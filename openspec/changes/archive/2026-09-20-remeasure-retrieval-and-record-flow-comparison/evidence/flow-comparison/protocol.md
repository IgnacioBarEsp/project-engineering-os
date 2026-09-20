# Protocolo de la comparación de dos flujos

**Congelado el 20 de septiembre de 2026, antes de ejecutar cualquiera de las dos vías.** Su SHA-256 queda
registrado en `protocol.sha256.json`. Si algo de esta página cambia después de que empiece la primera
ejecución, la comparación se anula y se vuelve a declarar y a ejecutar; no se publica.

Tarea elegida por el mantenedor ([decisiones](../maintainer-decisions.md)).

## El punto de partida, idéntico para las dos vías

Las dos reciben exactamente este párrafo, que es lo que una persona escribiría al reportar el defecto, y nada
más:

> En Project Engineering OS, el gate de Definition of Ready rechaza issues escritos en español correcto:
> frases como «El rollback conserva el historial» o «completa la verificación de extremo a extremo» las marca
> como plantilla sin rellenar. Arréglalo.

Ninguna de las dos recibe los criterios de abajo, ni el issue [#162](https://github.com/IgnacioBarEsp/project-engineering-os/issues/162),
ni su diagnóstico, ni esta página.

## Las dos vías

| Vía | Qué es | Qué no tiene |
| --- | --- | --- |
| **A, prompt suelto** | Una sola petición a un agente con ese párrafo. Se acepta lo que entregue | Sin issue, sin spec, sin criterios escritos, sin pruebas exigidas, sin revisión, sin gate |
| **B, flujo completo** | El recorrido del repositorio desde ese mismo párrafo: enriquecer el reporte, Definition of Ready, change OpenSpec, implementación, evidencia, revisión adversarial, deuda, archivo | — |

La vía B **empieza en el mismo párrafo**, no en el issue #162 ya enriquecido. Aprovechar esa enriquecimiento
sería importar trabajo que el flujo ya hizo antes y regalarle ventaja a la vía B.

## La vara de medir, declarada de antemano

Las dos entregas se puntúan contra estos seis criterios, que salen del issue #162 y son observables:

1. Las 22 construcciones legítimas que hay en los documentos del repositorio pasan el detector.
2. `Conserva la carpeta y revisa la recuperación`, que es un mensaje real del producto, pasa.
3. Un marcador real —`reemplaza con el valor`, `<nombre del cambio>`, `TODO`, `[completar]`— sigue rechazado.
4. Existe un corpus de prueba con las dos clases, y una regresión en cualquiera de ellas hace fallar la suite.
5. Ningún issue archivado históricamente pasa a ser rechazado, verificado sobre su metadata real.
6. El mensaje sigue nombrando el token rechazado.

Y tres medidas de proceso, no de resultado:

7. `npm run check` pasa en el árbol entregado.
8. El cambio se puede revertir sin dejar residuo.
9. Los defectos que aparezcan se registran con quién los encontró y en qué momento.

**Límite de esta vara:** los seis primeros criterios los escribió el propio flujo cuando produjo #162. Medir
las dos vías contra ellos favorece a la vía B en la forma de enunciarlos, aunque no en su contenido: son
comprobables sobre el código con independencia de quién los redactó. Queda declarado aquí porque se sabía
antes de medir.

## Qué se registra de cada vía

- Archivos tocados, con su diff.
- Pruebas que pasan y que fallan, antes y después.
- Defectos encontrados, por quién y en qué momento del recorrido.
- Pasos trazables: qué se hizo, en qué orden y qué quedó escrito.
- Si el resultado se puede revertir, comprobado.
- Reloj de pared de cada vía.

## Qué no se registra

- **Tokens**, salvo que un proveedor los reporte y el reporte quede guardado. No se estiman a partir de bytes,
  de caracteres ni de duración.
- **Calidad juzgada por el mismo agente que produjo la respuesta.** Sería juez y parte.
- **Comparación con productos de terceros.**

## Lo que esta comparación no demuestra

Una tarea demuestra qué pasó en esa tarea. **No demuestra una ventaja general** de ninguna de las dos vías, ni
predice otra tarea, ni mide a las personas que usarían cada vía. Cualquier uso de este registro —incluida una
diapositiva— tiene que decirlo con esas palabras.

## Contaminación conocida

Las dos vías las ejecuta el mismo modelo en la misma sesión, que ya leyó el diagnóstico de #162. Eso **favorece
a la vía que se ejecute en segundo lugar**, porque llega sabiendo lo que aprendió la primera. Mitigación
acordada: la vía A se ejecuta primero, y la decisión de lanzar cada vía en contexto limpio queda planteada al
mantenedor antes de empezar. Lo que se haga, se registra aquí y en el resultado.
