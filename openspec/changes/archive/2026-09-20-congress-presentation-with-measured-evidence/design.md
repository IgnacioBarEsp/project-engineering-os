# Diseño — congress-presentation-with-measured-evidence

## 1. La regla que ordena todo el mazo

Una sola: **si una cifra no está en la tabla de procedencia del guion, no entra en una diapositiva.** La tabla
vive dentro del propio guion, no en un anexo, para que revisarla sea inevitable.

De ahí salen las demás decisiones. No se estiman tokens, no se comparan terceros y no se afirma ahorro, no
porque sean temas prohibidos, sino porque no hay registro que los sostenga.

## 2. El resultado adverso no se esconde ni se diluye

La diapositiva 17 es **0 de 20** a pantalla completa, con su causa medida —45 de 2654 fuentes indexadas— y con
la re-medición de cuatro días antes que volvió a dar lo mismo.

Va inmediatamente después de la diapositiva del microcorpus, donde el producto gana 10 de 10. Ese orden es
deliberado: enseñar el número bueno sin el malo sería exactamente lo que la spec prohíbe, y enseñar solo el
malo sería igual de incompleto.

## 3. Las demos son las de #166, no una dramatización

El issue pedía dos demos grabadas. Lo que existe, medido y con artefactos, son las dos ejecuciones reales de
la misma tarea que hizo #166: mismo párrafo de partida, una con un prompt suelto y otra por el flujo completo,
cada una en contexto limpio.

Se usan esas. No se graba una demostración nueva porque sería una reconstrucción, y porque el resultado real
es **más interesante que una demostración lograda**: ninguna de las dos vías resolvió el defecto del todo, y
fallaron en cosas distintas. Esa es la diapositiva 15, y es la más honesta del mazo.

## 4. Lo que la charla no intenta ser

No es una demostración de producto. El único momento en que aparece el producto es la diapositiva 19, después
de haber contado que sus capturas eran maquetas hasta esta semana.

Tampoco es una charla sobre herramientas: los siete conceptos —contexto, SDD, harness, loops, revisión,
deuda, skills y MCP— entran por el problema que resuelven y ocupan **una frase y un ejemplo** cada uno.

## 5. Contenido antes que diseño

Decisión del mantenedor. El guion se escribe y se revisa como texto; solo después, si lo aprueba, se crea el
diseño en su cuenta de Canva y se exporta el PDF. Generar primero el diseño obligaría a rehacerlo con cada
cambio de estructura, y el contenido es lo que hay que discutir.

El conector de Canva está autorizado y hay un brand kit disponible; el issue lo daba por bloqueado y ya no lo
está.

## 6. Dónde vive el guion

En `docs/presentations/`, no dentro del change. Es un documento que el mantenedor va a usar y a retocar hasta
el día 24, y archivar el change no debe enterrarlo. Queda enlazado desde el índice de documentación.

## Open Questions

Ninguna. Las dos que había —cómo resolver las demos y dónde montar el mazo— las decidió el mantenedor antes de
escribir una línea.
