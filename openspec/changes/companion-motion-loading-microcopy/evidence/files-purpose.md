# Origen y finalidad del texto para IA — 2026-09-30

La ronda literal y su confirmación están en `export-reading-followup.json`: una persona
interpreta búsqueda; otra reconoce texto para pegar en la IA. La segunda cumple el mínimo
de contenido original, aunque no conozca su finalidad. No añadir unanimidad ni claridad de
propósito como nuevos criterios de rechazo. Las respuestas pertenecen al nombre anterior;
no se atribuyen al refinamiento nuevo. Inicio y paso 1 no cambian.

La decisión se documentó en diseño/spec antes de implementar. Solo cambian el título,
descripción y nombre de la acción de texto para IA, más sus expectativas en pruebas y
el nombre actual del protocolo. El botón dice «Revisar texto de mis archivos para mi IA».
La descripción identifica fragmentos de la búsqueda, revisión y copia posterior al chat.
No ofrece respuestas de un modelo, envío automático o mejora de calidad.

Verificación local observada:

- Regresiones de Archivos y lenguaje: 11/11, exit 0.
- Companion completo: 219/219, exit 0.
- OpenSpec local fijo 1.6.0 estricto, documentación y diff: exit 0.

La matriz del navegador, la captura y la integración hacia #150 se registrarán allí.
No acreditar las pruebas del nombre anterior como observación humana del nombre nuevo.

Revisión propia: texto local fijo, sin HTML dinámico, dependencia o destino externo nuevo.
El diff no cambia los handlers, los límites de consulta, el bloqueo por actividad,
exportPreview/copyExport, la frescura de fuentes o la revisión/copia explícita. Las pruebas
conservan cancelación sin copia y retorno del foco. El riesgo específico es la longitud del
nombre en ventanas compactas: se comprobará con el renderer real. Esta revisión no cuenta
como independiente; no se detecta deuda nueva diferida en este ajuste de microcopia.

Rollback: revertir estos textos y sus expectativas, sin migrar datos ni tocar originales.
Aceptación visual y observación humana del nombre nuevo, revisión independiente y #204
siguen separados; no hay archivo, cierre de issue o inicio de ola 4.

## Verificación posterior y respuesta del mantenedor

Raíz `npm run check` sobre #149 `4e45b67`, sin modificar ese árbol durante el pase:
391/391, todas las fases y exit 0. La integración hacia #150 conserva los guards propios
del harness. Su prueba de proyecto completa 32 pantallas y ocho celdas de Archivos con
revisión/cancelación/copia exacta, cero aperturas externas y cinco originales intactos,
exit 0. La captura desktop real se inspeccionó y se mostró al mantenedor; la variante
compacta requiere scroll para ver la segunda tarea. Esto no demuestra aceptación humana.

El mantenedor rechazó la dirección de la pantalla: espera administrar los proyectos que
preparó, y no entiende por qué Estado/Archivos/Recetas/Tu IA son su contenido principal.
La respuesta literal se conserva en `maintainer-project-management-feedback.json`. No es
otro lector en frío ni una aprobación. La organización requiere una decisión de producto
de #148; no seguir cambiando nombres y pidiendo lectores como si resolviera ese desajuste.
No prometer que quitar de la lista elimina la preparación, que duplicar copia una carpeta,
o que deshacer una etapa equivale a desinstalar todo lo añadido por Companion.
