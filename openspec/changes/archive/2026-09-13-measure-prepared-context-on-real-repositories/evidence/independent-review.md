# Revisión adversarial independiente del instrumento

Esta revisión es independiente **del código que produjo y resumió la medición**: usa un verificador separado
que no importa el runner ni su función de agregación. Ancla protocolo, runners y datos crudos a los blobs de
los commits ya publicados y vuelve a derivar simetría, contabilidad, identidad y texto público por caminos
distintos. No se presenta como revisión de una persona ni de otro modelo.

El intento de solicitar además GitHub Copilot code review en el PR 113 no produjo review ni review-request en
este repositorio. Esa ausencia no se convirtió en PASS; el veredicto de abajo procede únicamente de las
propiedades ejecutables que sí se observaron.

## Veredicto

**PASS — 0 blockers y 0 majors abiertos en el arnés o la publicación.** La falla del producto a escala no se
clasifica como defecto del instrumento: queda publicada y registrada como deuda separada.

`apps/companion/scripts/review-real-repository-benchmark.mjs` revisó 2 corpora, 20 preguntas y 180
observaciones crudas. La salida exacta está en `adversarial-review.json`.

## Intentos de refutación

| Mutación deliberada | Resultado |
| --- | --- |
| Cambiar una respuesta después del precompromiso | Detectada por desigualdad con el protocolo anclado al blob de `c808967` |
| Dar a una vía otra pregunta u otra posición | Detectada al reconstruir las 3 repeticiones y las 3 posiciones por pregunta |
| Omitir la relectura de fuentes de los bytes preparados | Detectada por la suma independiente de inventario, colección y dos aperturas del índice |
| Cambiar el commit de un corpus en el agregado | Detectada contra protocolo, preflight y reporte por corpus |
| Publicar 10 / 10 donde los datos dicen 0 / 10 | Detectada al comparar las seis filas documentadas con el agregado anclado |

## Anclas y límites

- Precompromiso: `c808967cd46abc4b340d148834a24e3005cc0247`.
- Primera publicación de los cuatro JSON: `e0a29803149cb454b0eaa61f41282fe992217186`.
- El verificador compara blobs Git, no fechas ni rutas absolutas, y resuelve el mismo intento antes o después
  del archive de OpenSpec.
- El verificador prueba integridad y consistencia del experimento; no convierte dos muestras en evidencia
  universal ni revisa la calidad de respuestas de un modelo.

