## Context

El renderer modular de #144 ya separa rutas y pantallas; #145 provee seis perfiles desde un catálogo del motor. Sin embargo, `setup.mjs` y `flow.mjs` mantienen preguntas duplicadas, `showFolder()` deja entrar sin nombre, y `reviews.mjs` ofrece desde Carpeta un segundo recorrido antiguo. `chooseFolder` crea un handle en memoria; antes de aplicar la base todavía no hay entrada de historial, por lo que un borrador persistente necesita restablecer ese handle sin escribir en la carpeta elegida.

## Goals / Non-Goals

**Goals:** cuatro pasos con una sola salida a `previewBase`/`applyBase`, nombres y estados coherentes, respuestas conservadas al volver/reabrir, plan plegado aprobado, resultado limitado a lo que se verificó y controles medibles en ventanas pequeñas.

**Non-Goals:** orquestar contexto, herramientas y OpenSpec desde el paso 4 (#147); rediseñar el proyecto ya preparado (#148); decidir distribución (#150); instalar un modelo o cambiar el núcleo neutral.

## Decisions

1. **Estado único y rutas cerradas.** `wizard.mjs` es dueño de `step`, selección, carpeta y plan; `setup`/`flow` se sustituyen como entrada del asistente. El riel consume las cuatro rutas canónicas del router. Una acción de volver cambia `step` y vuelve a dibujar desde el estado; los campos persisten antes de navegar. Alternativa rechazada: coordinar cinco pantallas independientes por llamadas cruzadas, que permite estados parciales.
2. **Borrador app-owned.** El servicio expone `draftLoad`, `draftSave` y `draftClear` en el mismo sobre IPC validado. Un JSON versionado, de tamaño acotado y esquema cerrado se guarda en `dataRoot`, separado del historial y de la carpeta del proyecto. `draftLoad` valida límites, restablece un handle de carpeta solo si la ruta sigue siendo canónica y accesible, y degrada a elegir carpeta de nuevo si no. La escritura usa lock y hash previo; un borrador corrupto no se sobrescribe ni se convierte en estado válido. Alternativa rechazada: `localStorage` en el renderer, que no ofrece el contrato de archivo/recuperación del servicio.
3. **Una carpeta, dos entradas.** «Preparar proyecto» abre Tu proyecto; «Abrir carpeta existente» llama al selector nativo. Si el handle corresponde a un historial ya preparado, se abre su estado; si no, entra a Tu proyecto con nombre y recomendación de la inspección. Ninguna entrada llama a la etapa antigua `showFolder()`.
4. **Plan real en paso 4.** El plegable enseña la lista devuelta por `previewBase`, no una lista imaginada; cualquier cambio en la selección invalida ese plan y exige otro preview. #146 aplica solamente la base y lo dice en Listo. #147 añadirá contexto/herramientas como subetapas y actualizará la afirmación final después de comprobarlas.
5. **Visión fiel.** El objetivo obligatorio y tres apartados opcionales se guardan como respuestas de la persona, no texto inventado. El modo libre es un `textarea` con etiqueta; los botones de ayuda insertan preguntas explícitas y nunca ejemplos declarativos. La vista previa usa la misma función pura `renderProjectVision` que el motor escribe, con escape de Markdown para campos de identidad. Sin descripción se conserva el objetivo original. El documento no depende de la vía de instalación, de modo que cambiarla después de previsualizar no cambia los bytes; se retiran las directrices declarativas heredadas y la garantía de «100%» para cumplir el criterio de fidelidad de #146. #147 conserva la composición del prompt y de las comprobaciones. El contador muestra palabras reales y una guía, no una evaluación ficticia.
6. **Mantenimiento fuera del asistente.** `read-files`, revisión de herramientas y reparación siguen en la pantalla del proyecto hasta #148. Se retiran las rutas de preparación antiguas del camino de Inicio, no las APIs de recuperación ni la capacidad de releer un proyecto existente. El contrato de una etiqueta por acción permanece cerrado.
7. **Cierre normal verificado.** El proceso principal espera una función fija del renderer local que vacía el debounce y la cola del borrador. No evalúa texto del usuario ni expone capacidades nuevas. Un error de guardado mantiene la ventana abierta. La prueba en Electron real cierra inmediatamente después de escribir y comprueba reapertura; una terminación forzada del proceso o del sistema no permite prometer el guardado del último evento todavía no entregado.

## Risks / Trade-offs

### Corrección de revisión independiente — 2026-09-27

R1: antes de que Abrir proyecto cambie la selección compartida, el asistente vacía su debounce/cola
y conserva una instantánea separada de paso, carpeta y respuestas para reanudar. Solo después de
guardar correctamente se suspende el asistente; un error impide cambiar al otro proyecto. Cerrar
mientras se consulta otro proyecto no guarda esa selección encima del borrador. Volver al paso 4
genera un nuevo plan para la carpeta del borrador, no reutiliza el del proyecto consultado.

R4: el selector de carpeta dentro del asistente solo cambia la carpeta y, si estaba vacío, su nombre.
No reasigna perfil/enfoque/stack. La entrada inicial Abrir carpeta existente, cuando no hay respuestas
previas y la carpeta no está preparada, puede ofrecer la recomendación inicial como ya se especificó.
Las regresiones recorren cambio de proyecto, cierre/reapertura y cambios de carpeta con respuestas,
en ambos modos de movimiento, sin escribir en proyectos personales.

- Borrador corrupto o apuntando a otra carpeta → validación estricta, tamaño límite, no aplicar ni borrar automáticamente, error accionable.
- Interrupción durante escritura del borrador → lock y writeChecked; el último borrador íntegro es el único que se ofrece.
- Ruta elegida mientras el usuario vuelve de paso 4 → invalidate plan, preview nuevo; `applyBase` vuelve a comprobar hash y carpeta.
- La pantalla Listo de #146 solo acredita base → texto explícito de contexto/herramientas pendientes; #147 integra el trabajo y la verificación.
- Retirar pasos antiguos puede dejar acciones sin consumidor → pruebas de contrato, navegación desde historial y journeys por seis perfiles.

## Migration Plan

Primero se añaden API y pruebas de borrador; después el flujo único y los harnesses; por último se retira la entrada antigua. El historial y los recibos no se migran. Revertir el PR restaura el renderer anterior; un `draft.json` nuevo queda app-owned e ignorado por versiones previas, sin afectar proyectos. Sin dependencias ni cambios de licencia/costo.

## Open Questions

Ninguna de producto para #146: el mantenedor aprobó los cuatro pasos y el plan plegado. La revisión de lectura en frío y el recorrido humano permanecen gates externos del PR, no decisiones que el código pueda inferir.
