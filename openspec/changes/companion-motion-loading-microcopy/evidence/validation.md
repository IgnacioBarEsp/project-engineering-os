# Evidencia técnica #149

2026-09-26. Worktree aislado sobre #148. Sin cambios al servicio, canales IPC, formatos, dependencias ni instalación del usuario.

- OpenSpec local 1.6.0 strict PASS; DoR 13/13 previo.
- QA Companion 179/179 PASS, raíz 391/391 PASS con árbol inmóvil. La primera ejecución raíz coincidió con ediciones de archivos públicos y rechazó un export divergente; se repitió completa sin editar, sin relajar la comprobación.
- Contrato: 46/46 mutaciones, construcción 1/1, 372/372 controles en 36 pantallas del asistente, cero hallazgos. Ningún timeout cuenta como detección.
- UI: 20 recorridos, 120 pantallas, 1220/1220 controles, 40/40 copias; 48 pantallas de perfiles heredados sin hallazgos y 736 definiciones. Cobertura ampliada a toda la matriz y rutas pertenece a #150.
- Proyecto: 32 pantallas (4 pestañas × 4 anchos × dos movimientos), teclado/foco/hash/contenido único/contraste PASS. Lista a 299 ms sin skeleton, 300 ms con skeleton, 10 s error; 4 verificadas/1 ilegible, cinco originales intactos.
- Motion componentes: navegador y Electron Windows 44.1.1 PASS en ambos modos. Cuatro transiciones nativas por recorrido normal, cero en reducido. Avisos máximo dos a 3999/4000 ms, copia a 1999/2000 ms, espera a 999/1000 ms; eventos controlados 2/7 y 10 s con Detener y footer. Los eventos controlados no son evidencia de una operación real.
- Copia Electron: bytes exactos leídos con clipboard.readText en proceso principal y fallo nativo de escritura sin Copiado ni aviso de éxito; causa visible. No se sustituyó IPC por navigator.clipboard.
- Estados calculados reposo/hover/foco/deshabilitado/pulsado: diez nodos por estado; duraciones acotadas, reducido sin animación/transición, contraste PASS; opacity 1 en deshabilitado. QA estática adicional valida declaraciones de todos los CSS/tokens.
- Operación real Electron: lectura de 48 fuentes, progreso mostrado igual a eventos reales, cancelar sin escribir índice antes de aprobación, reintentar y terminar base/context, 48 originales conservados, 49 eventos contados y cero errores.
- Electron shell: Inicio/Ayuda, cero errores/CSP/red; capturas locales en C:/Users/RitualDesktop/AppData/Local/Temp/project-os-closeout/wave3-149-shell. Inspección visual propia de Inicio: gradiente indigo/cian, controles legibles, sin pulso decorativo; NO aceptación humana.

Reproducir: npm --prefix apps/companion test; npm test; npm --prefix apps/companion run test:ui; npm --prefix apps/companion run evidence:contract; npm --prefix apps/companion run evidence:project; npm --prefix apps/companion run evidence:motion; npm --prefix apps/companion run evidence:motion-native; node apps/companion/scripts/verify-electron-preparation.mjs --cancel-only.

## Hallazgos corregidos durante ejecución

El primer pase marcaba el DOM como disponible durante las instantáneas de View Transitions: elementFromPoint devolvía #view, no los controles. Se espera finished/skip además de updateCallbackDone antes de habilitar interacción; repetición amplia verde. El probe de spill medía el botón oculto del progreso como un rectángulo cero fuera de la barra; ahora excluye solo nodos sin caja pintada, conserva todos los visibles y los 46 controles negativos.

Los relojes controlados empiezan después de la transición real para no congelar el compositor; la medición conserva los límites exactos desde la solicitud. El harness de Electron no recarga una URL con fragmento, bloqueada intencionalmente por la política nativa; no se aflojó la seguridad del producto.

## Gates no satisfechos

Dos lectores ajenos y sus respuestas literales: pending en cold-reading.json. Recorrido/aceptación del mantenedor y revisión independiente: pending. No se archiva, fusiona o cierra #149. Automatización de accesibilidad no equivale a lector de pantalla humano. Rollback: revertir renderer/estilos, sin migraciones de datos.

## 2026-09-27 · aclaración del paso 1 tras feedback parcial

El mantenedor aportó tres capturas privadas de respuestas a una captura del paso 1 y confirmó que esas personas no vieron Inicio. Se transcribieron solo frases anónimas en `cold-reading.json`; no se publicaron imágenes, nombres ni datos de conversación. Las respuestas sugieren que, sin Inicio, el propósito se lee como IA o gestión de tareas en general. No indican de forma clara nombre, carpeta y tipo de trabajo ni una próxima acción; son feedback parcial, **no** la lectura en frío exigida por #149. La fecha de entrevista y el commit exacto de la captura no constan, y no se infieren.

Se aclaró el texto del paso 1: propósito de preparar una carpeta para la IA que la persona ya usa, tres elecciones concretas y revisión previa a cualquier cambio. El grupo de perfiles ahora se llama «Tipo de trabajo». No cambian el formulario, el flujo, los datos ni las promesas del producto. En la primera ejecución de la prueba visual, la regla de glosario detectó que quitar «fuentes» del párrafo dejaba el término de las tarjetas sin definición alcanzable; se restauró su enlace y la repetición completa pasó. No se relajó la regla.

- OpenSpec local 1.6.0 `validate companion-motion-loading-microcopy --strict`: PASS.
- Companion `npm test`: 212/212 PASS. Raíz `npm run check`: 391/391 PASS, incluyendo paquete, neutralidad, docs, workflows, deuda y baseline doctor.
- `verify-ui.mjs`: 20/20 recorridos, 120/120 pantallas, 1360/1360 controles alcanzables, 40/40 copias exactas; 48 pantallas adicionales de perfiles, cero hallazgos de contraste, glosario o teclado. Compatibilidad histórica y aislamiento del borrador completados sin fallas.
- `verify-interface-contract.mjs`: 46/46 mutaciones detectadas, 1/1 control de construcción, 408/408 controles alcanzables en 36 pantallas; cero hallazgos. El recorrido exige el propósito, las tres elecciones y la revisión posterior en cada variante.
- Inspección propia de la captura sintética 1180×820 del paso 1: texto, campos, tipos y barra de acciones caben y son legibles. A 582×377, el contenido largo requiere desplazamiento, cubierto por la prueba de teclado/alcanzabilidad. Esto no es aceptación visual del mantenedor ni prueba con personas nuevas.

### Hallazgo de CI entre plataformas

El primer head de este ajuste (cabcd0c) pasó en la ejecución local Windows, pero el job Ubuntu del run 36370057872 rechazó el paso 1 a 1180×820: `scrollHeight=818`, `clientHeight=764`. La tipografía de ese runner llevó el párrafo largo a más líneas; la captura local no demostraba el contrato de Linux. Se compactó el párrafo y se le permitió usar el ancho de su columna, sin reducir la fuente ni retirar el propósito, los tres datos solicitados, la revisión previa o el enlace «fuentes». La ejecución local de `npm run test:ui` en 6c3f008 pasó: 12 recorridos más 2 casos adicionales de flujo, y luego 20 recorridos/120 pantallas/1360 controles/40 copias del navegador, sin hallazgos. El resultado entre plataformas del head siguiente se comprueba mediante un nuevo run de CI, no se atribuye al intento fallido.

El siguiente head (6c3f008) pasó el paso vacío en Ubuntu, pero al escoger carpeta el mismo gate todavía midió `scrollHeight=777` frente a `clientHeight=764` (run 36371224419). Se redujeron solo márgenes verticales del primer paso (fieldset, carpeta y barra de acciones) para recuperar 28 px; ningún control se oculta y la regla `scrollHeight <= clientHeight + 1` sigue intacta. Tras el ajuste, `npm run test:ui` local repitió 12+2 recorridos de flujo y 20 recorridos/120 pantallas/1360 controles/40 copias sin fallas; las 10 pruebas focales de movimiento/lenguaje también pasaron. Los dos runs fallidos se conservan como evidencia de la regresión y no se cuentan como verdes. La CI del nuevo head comprobará el caso con carpeta seleccionada.

Los gates humanos permanecen abiertos. La siguiente lectura debe mostrar Inicio y después el paso 1 a dos personas nuevas que no conozcan la aplicación, con preguntas separadas y respuestas literales. Rollback: revertir este cambio de renderer y prueba; no hubo migraciones ni archivos del usuario modificados.

## 2026-09-27 · preferencia del mantenedor por copia breve

Tras ver el ajuste anterior, el mantenedor pidió recuperar el texto antiguo del primer paso porque la explicación nueva era excesiva. Se restauraron literalmente «Nombre, carpeta y tipo de trabajo. Tus archivos pueden aportar fuentes.» y el título original del grupo de perfiles. Solo se añadió sobre el título un rótulo breve: «Herramienta de preparación de proyectos para tu IA». El enlace de glosario «fuentes» permanece. Se actualizó la prueba de copia exacta y el escenario OpenSpec para exigir esta versión, sin convertir las tres respuestas parciales en una lectura humana completa. Los runs verdes anteriores corresponden a otra copia; este head requiere su propia verificación entre plataformas.

Verificación local de esta versión: OpenSpec estricto PASS; Companion 212/212; `test:ui` PASS (12 recorridos + 2 casos, 20 recorridos visuales, 120 pantallas, 1360/1360 controles alcanzables, 40/40 copias exactas y 0 fallos de glosario); `check-docs` PASS; `git diff --check` PASS. Se inspeccionó la captura sintética actual a 1180×820: rótulo, título, párrafo, seis opciones y barra final son visibles. El veredicto de Ubuntu CI y la lectura humana siguen siendo gates independientes.

El contrato adversarial de este head pasó 46/46 mutaciones detectadas, 1/1 control de construcción y 408/408 controles alcanzables en 36 pantallas, con cero hallazgos.

## 2026-09-29 · primera ronda válida de lectura en frío: no cumple

El mantenedor aportó cuatro respuestas literales de dos personas distintas que no conocían la aplicación ni habían visto antes las capturas. Confirmó que a cada una se le mostró Inicio y después el primer paso de la versión que le enviamos (#201 `d34b2b5`). Las respuestas están completas en `cold-reading.json`; se registró la fecha de recepción, no se inventó la fecha exacta de entrevista ni si dudaron. No se publicaron capturas de conversaciones privadas ni identificadores personales.

En Inicio, una persona entendió «configurar tu IA» y la otra «conocer sobre IA o usar una nuevas como tipo chatgpt», incluso crear una cuenta o instalarla. Ninguna mencionó preparar una carpeta para la IA que ya usa. En el primer paso, la primera identificó nombre y tipo de proyecto pero dijo que le costó ver la carpeta; la segunda interpretó un asistente tipo ChatGPT y no nombró la carpeta como elección. Por los criterios de `COLD_READING.md`, esta ronda **no cumple**. No se convierte en aprobación por haber participado dos personas: el change y su gate visual siguen pendientes, y una segunda ronda necesita otras personas nuevas.

Diagnóstico acotado: el título prominente de Inicio hablaba de «un buen punto de partida» y el propósito concreto estaba en un párrafo largo; la carpeta del paso 1 parecía una tarjeta secundaria entre el nombre y los perfiles. El mantenedor aprobó hacer más directo el titular de Inicio y acortar el párrafo. Se preservó literalmente el párrafo breve del paso 1 que había aprobado; la tarjeta de carpeta ahora nombra la acción, usa el icono local existente y se distingue mientras falta seleccionarla. No se añadieron servicios, permisos, escrituras ni promesas de chat/IA integrada. Hipótesis, no resultado humano: la nueva jerarquía debería hacer visibles propósito y acción; se verificará con pruebas técnicas y dos lectores diferentes.

Tras ver la primera captura corregida, el mantenedor prefirió el titular exacto «Prepara tus proyectos con Project Engineering OS» y una descripción con tono problema → ayuda. Se aplicó ese titular y un párrafo más directo sobre la carpeta, las instrucciones revisables y continuar en la IA que ya usa. No se adoptaron las frases «guiando a tu IA de inicio a fin» o «las mejores normas y herramientas de la industria»: la evidencia actual no acredita guía automática integral ni superioridad comparativa. La propuesta visual intermedia no se presenta como aprobada; la nueva captura y una nueva lectura en frío deben corresponder al texto final.

El mantenedor pidió un segundo refinamiento: terminar la descripción en «un método claro», quitar «Preparación local · Tú conservas el control» y sacar de Inicio las cuatro tarjetas del proceso, la descarga y la privacidad. Inicio conserva titular, descripción breve, acciones y mensajes condicionales de borrador. Ayuda ofrece el método y las dos explicaciones restantes como tres preguntas frecuentes desplegables; el diálogo detallado de privacidad sigue disponible desde la barra superior. No se agregó movimiento decorativo: la ubicación opcional y el control nativo de despliegue resuelven la saturación observada. Este ajuste responde a una preferencia del mantenedor, no a una segunda ronda humana; el gate permanece abierto.

Verificación de la versión refinada en el worktree: OpenSpec local estricto PASS; Companion 212/212; raíz `npm run check` 391/391; contrato adversarial 46/46 mutaciones, 1/1 construcción y 408/408 controles; `test:ui` 12+2 recorridos de flujo, 20 recorridos de matriz, 120 pantallas, 1360/1360 controles y 40/40 copias exactas. La prueba abre y cierra las tres preguntas de Ayuda por sus controles nativos. El ensayo de movimiento en navegador pasó ambos modos (4 transiciones normales, 0 reducidas) y los límites de avisos, copia y progreso. Inspección propia de las capturas de navegador y Electron: Inicio conserva el titular, párrafo y dos acciones sin los bloques anteriores; Ayuda muestra tres preguntas cerradas legibles. No es aceptación humana.

La captura nativa de Electron 44, con datos de aplicación aislados, informó cero errores de renderer/CSP/red y guardó Inicio y Ayuda. Su comprobador de shell no prueba el cierre normal: `application.close()` quedó esperando en Windows después del informe y las capturas, por lo que el proceso **solo de prueba** se cierra con `app.exit(0)` en su limpieza. No se afirma que el cierre normal esté verificado; queda fuera de este probe. El primer intento de UI concurrente con la raíz y el contrato no se contó: su instancia adicional quedó en la pantalla de fallback; la repetición aislada sí terminó con código 0. La primera ejecución de raíz leyó la frase antigua y falló como era debido; tras actualizar su prueba de texto y ejecutar sin competencia, pasó completa. La nueva CI entre plataformas y los gates humanos aún están pendientes.

Al integrar #149 en #150, el harness Electron más estricto encontró un borde que el probe de shell y el navegador no veían: a 480×540, Inicio casi no necesitaba desplazamiento (`max=3 px`) pero dejaba 34 px vacíos al final. El margen inferior de 34 px de `.home-actions` ya no separa nada desde que se retiraron los paneles. Se eliminó ese margen en #149; el umbral `dead-scroll` de #150 no se modificó. La repetición nativa de esa matriz y la CI del nuevo head deben confirmar el arreglo antes de darlo por validado.

## 2026-09-29 · segunda lectura en frío y composición de Inicio

El mantenedor recibió las capturas de Inicio y del primer paso del run CI `36588084388` de #202, con el texto de #201 `f1d2d8c`. Aportó cuatro respuestas literales y confirmó dos personas distintas de la primera ronda, sin exposición previa a la aplicación ni a las capturas, con Inicio seguido del primer paso y sin explicación. La fecha exacta de entrevista no consta; se registra la recepción, sin inventar dudas ni preguntas previas.

Las dos respuestas sobre Inicio describen preparar proyectos o carpetas para trabajar con IA. Ambas respuestas del primer paso identifican nombre, carpeta y tipo de proyecto. **Cumple en la segunda ronda**, conservada en `followUpRound` de `cold-reading.json`; el resultado negativo anterior permanece en el mismo archivo. La primera persona también señaló que Inicio se ve vacío y sugirió redistribución o ejemplos. El mantenedor eligió explícitamente «Ajustar distribución, sin añadir más texto».

La primera propuesta de redistribución centró una columna de 780 px. Su verificación local pasó 20 recorridos/120 pantallas/1360 controles/40 copias y la comprobación geométrica de equilibrio, pero el mantenedor la rechazó visualmente por seguir pequeña y rodeada de espacio vacío. Autorizó añadir ejemplos o explicar concretamente en qué ayuda, con adaptación a los tamaños de ventana. Esa preferencia reemplaza la restricción anterior de no añadir texto. Una segunda propuesta muestra una preparación ilustrativa junto al mensaje en escritorio y después de las acciones en ventanas pequeñas. El mantenedor pidió otro ajuste; la dirección concreta sigue pendiente. Los probes de ambas propuestas conservan cero errores de renderer/red/CSP, y la segunda probó 1180×820, 1024×700 y 480×540 sin overflow horizontal y con la acción principal visible. Estos resultados técnicos no son aprobación visual. Las personas de la segunda lectura no vieron estas propuestas posteriores. El control de exportación requiere todavía su propia observación humana.

La matriz de navegador de la propuesta con ejemplo terminó con código 1: su regla anterior rechazaba cualquier `.eyebrow` en Inicio y, por tanto, el rótulo «Ejemplo de preparación». El fallo corresponde a la restricción de copia anterior, sustituida por la nueva petición explícita del mantenedor. Se conserva el intento y se acota la regla a la cabecera principal y los paneles retirados, exigiendo además un único ejemplo identificado. Su repetición queda pendiente del siguiente ajuste visual. OpenSpec estricto, documentación, tres pruebas focales de renderer/movimiento y `git diff --check` pasaron; no se atribuye un pase de la matriz completa a este intento.

## 2026-09-29 · beneficios y profundidad visual de Inicio

El mantenedor concretó el ajuste: prefiere beneficios en vez del ejemplo de archivos y pide gradientes,
animaciones o detalles que eviten texto sobre un fondo plano. Se conserva literalmente el titular y la
descripción principal, así como todo el primer paso. El apoyo nuevo describe cambios de software definidos
y revisables con OpenSpec, contexto consultable con referencias e instrucciones organizadas en la carpeta.
No se adoptaron las promesas de mayor precisión o eficiencia de IA ni la identificación de CodeGraph como
un RAG general: no las acredita la evidencia del repositorio. Los términos OpenSpec y Contexto conservan
su definición local. La propuesta añade lenguaje; las personas de la segunda ronda no la vieron.

La composición conserva dos columnas en escritorio y coloca los beneficios después de las acciones en
ventanas compactas. Los gradientes locales tienen tokens propios y una máscara que suaviza sus bordes;
la entrada y la respuesta de opacidad a hover/foco son finitas, de hasta 280 ms. No hay bucle decorativo,
blur, nueva dependencia, activo remoto ni indicador de éxito inventado. Se eligieron acentos índigo/cian/
violeta, sin reutilizar el verde reservado a estados comprobados.

Durante el primer probe nativo, los tres iconos tenían caja de dibujo cero: sus símbolos nuevos no estaban
en la allowlist exacta de fragmentos `peos://`. Se añadieron únicamente sus tres identificadores, sin
ampliar el protocolo, CSP o las rutas permitidas. El ensayo de contraste analítico motivó bajar la opacidad
del fondo de la introducción; la prueba final calcula un límite superior conservador de cada canal,
componiendo las capas en orden CSS, incluyendo el hover. Esto complementa el probe general, que no
muestrea píxeles de imágenes degradadas; no es certificación de accesibilidad.

Se amplió además el shell para medir el extremo del scroll como hace el harness de #150. Detectó un hueco
de 69.39 px en el primer borrador con beneficios a 1180×820. Se retiraron únicamente el padding inferior
de la sección, la extensión inferior del pseudo-elemento y el espacio del aviso vacío en Inicio; se acotó
el padding final de esa pantalla a 24 px. No se aflojó el umbral de 24 px. La repetición nativa final reporta
0–0.5 px extra en las ocho celdas y cero scroll en el escritorio grande.

Resultados locales, sin atribuirlos a CI ni a aceptación humana:

- `verify-ui.mjs` sobre la primera variante con beneficios: código 0, 20 recorridos/120 pantallas,
  1360/1360 controles, 40/40 copias; 48 pantallas adicionales sin hallazgos y 750 definiciones sin
  desajustes; compatibilidad de perfiles y aislamiento completados. Directorio
  `C:/Users/RitualDesktop/AppData/Local/Temp/project-os-wave3-home-benefits-ui-v1`. Este pase precede la
  extracción mecánica de colores a tokens y la corrección final del hueco; no se atribuye a esos últimos
  bytes como una nueva ejecución de la matriz completa.
- Companion `npm test`: 214/214 y raíz `npm run check`: 391/391, código 0. Después de los ajustes finales,
  14 pruebas focales de beneficios, contraste, assets, movimiento y lenguaje: PASS.
- `verify-electron-shell.mjs` final: código 0; tamaños exteriores 1180×820, 1024×700, 768×700 y 480×540,
  cada uno con movimiento normal y reducido. Cero overflow horizontal, acción primaria visible,
  composición correcta, tres iconos pintados, pseudo-elementos sin captura de puntero y cero errores
  de renderer/red/CSP. Directorio
  `C:/Users/RitualDesktop/AppData/Local/Temp/project-os-wave3-home-benefits-native-complete`.
- `verify-motion.mjs` después del arreglo: código 0, cuatro transiciones normales y cero reducidas;
  límites de avisos, copia y progreso conservados. OpenSpec local estricto y `git diff --check`: PASS.

Se inspeccionaron las capturas locales de escritorio, 1024 px y ventana compacta: el contenido se lee,
la acción principal precede a los beneficios y estos siguen disponibles mediante scroll. El probe nativo
no verifica instalador, selector de carpeta ni cierre normal; termina solo su proceso de prueba aislado.
La aceptación visual de esta variante, su lectura en frío final, la observación del control de exportación
y la revisión independiente siguen pendientes. No se ha archivado, fusionado ni cerrado #149 ni iniciado
la ola 4. Los cambios permanecen locales, pendientes de la elección visual del mantenedor.

## 2026-09-29 · beneficios revisados y fondo global continuo

El mantenedor dijo que le gusta el degradado y pidió extenderlo a toda la aplicación: marca,
navegación, privacidad, todos los pasos y menús, sin recortes en los márgenes del contenido. También
pidió reemplazar el encabezado del apoyo y dos beneficios, y acercar la frase de OpenSpec a su propuesta.
Se conservan el titular, el párrafo principal y todo el primer paso. El apoyo ahora se titula «Así cambia
tu forma de trabajar» y describe revisar cambios documentados con OpenSpec en software, preparar sin
terminal y retomar o revisar cómo deshacer una preparación. «Que documente» limita expresamente la
frase: OpenSpec no captura automáticamente todos los cambios de cualquier IA.

Esta petición sustituye la restricción de gradientes locales de la entrada anterior y la prohibición
absoluta de bucles decorativos. La spec y DESIGN registran una única excepción: `body::after`, fijo a
todo el viewport, cruza solo la opacidad de un segundo campo índigo/cian durante 20 s, en alternancia
lineal. `body::before` conserva el campo base. No hay máscara, blur, transformación del layout,
captura de puntero ni reconstrucción del fondo por ruta. Encabezado y shell son transparentes; las
superficies de menús y diálogo dejan pasar el fondo sin perder legibilidad. Reduced motion detiene el
ciclo y conserva el campo estático. Controles y transiciones mantienen 120/200/280 ms.

Resultados sobre esta variante, todos locales y con terminación código 0:

- Companion `npm test`: 214/214. Raíz `npm run check`: 391/391, además de paquete, neutralidad, docs,
  workflows, deuda y baseline doctor. El renderer permaneció sin ediciones durante esos recorridos.
- `verify-ui.mjs`: 20 recorridos, 120 pantallas, 1360/1360 controles alcanzables, 40/40 copias exactas,
  tres casos sin texto, 48 pantallas adicionales y 736 controles de definición sin desajustes.
  Compatibilidad histórica y aislamiento del asistente también finalizaron, no solo el informe previo
  a esas dos fases. El contrato ambiental compartido mide las 120 pantallas y las rutas adicionales;
  cero hallazgos de cobertura del fondo, bucles indebidos o movimiento en reduced.
  `C:/Users/RitualDesktop/AppData/Local/Temp/project-os-wave3-app-ambient-ui-v1`.
- `verify-motion.mjs`: cuatro transiciones normales y cero reducidas; límites exactos de avisos,
  copia y progreso conservados. La espera del harness excluye solo animaciones infinitas de su espera
  de finalización, y el probe posterior exige que el único bucle sea el fondo autorizado.
- `verify-electron-shell.mjs` final: cuatro tamaños exteriores (1180×820, 1024×700, 768×700, 480×540),
  normal y reducido; cero overflow horizontal, acción primaria visible, tres iconos pintados,
  0–0.5 px de hueco extra y cero scroll en escritorio grande. El fondo mide exactamente cada viewport.
  Inicio, paso 1, Tus proyectos, Ayuda, Privacidad y FAQ conservan la capa; las cuatro rutas retienen
  la misma instancia de animación en normal. Dos muestras de la animación real pausada solo para la
  prueba verifican opacidad 0/1 y los siete controles de encabezado/privacidad/Inicio alcanzables en
  ambos extremos. Cuatro mutaciones deliberadas son detectadas por el mismo probe: captura de clics,
  fondo recortado, encabezado opaco y bucle de 20 s en una tarjeta. Cero errores de renderer/red/CSP.
  `C:/Users/RitualDesktop/AppData/Local/Temp/project-os-wave3-app-ambient-native-final-v2`.
- El ensayo analítico de contraste compone las cuatro capas en orden CSS y acota conservadoramente
  todos los colores/fases, incluida la superficie translúcida y el hover del glosario. Los colores
  de texto medidos conservan AA. Complementa, no sustituye, el probe de controles ni la lectura humana.

Se conservan los intentos fallidos del harness: primero se seleccionaron dos botones «Preparar proyecto»
sin acotar a navegación; después una mutación mediante un style inline fue bloqueada por la CSP. Se
corrigió el comprobador con selección de la navegación y CSSOM del stylesheet local existente, sin
aflojar CSP. La nueva medición de hit-testing de los extremos detectó instantáneas de una transición
todavía activa; el probe ahora espera `aria-busy=false`, igual que la matriz, sin acortar la transición
del producto. Esos intentos no se cuentan como pases. Las capturas finales se inspeccionaron visualmente:
el campo llega a la barra superior y a los bordes en ambas pantallas, sin el recuadro local anterior.

El shell usa datos aislados y no prueba instalador, selector nativo ni cierre normal; limpia solo su
proceso de prueba. No se afirma un pase de CI ni de la matriz nativa completa de #150: la rama apilada
debe integrar esta variante estable y reconocer únicamente la excepción ambiental, conservando los
negativos y límites de controles. La aceptación del estilo del degradado no es aceptación final de las
frases y composición nuevas. Lectura en frío final, control de exportación y revisión independiente
siguen pendientes; las rondas previas permanecen intactas. Sin archivo, merge, cierre de #149 u ola 4.

## 2026-09-30 · iluminación finita y primer paso sin subtítulo

El mantenedor aprobó la composición con fondo global y beneficios mostrada en la variante nativa
`project-os-wave3-app-ambient-native-final-v2`. Solicitó retirar el subtítulo redundante del primer paso,
dejar «con» sin degradado y añadir iluminación al nombre y las acciones principales del Companion.
Se conserva esa aprobación de la base, sin atribuirle aprobación de una animación todavía no mostrada.

Se retiró el párrafo bajo «¿Qué vas a preparar?». Nombre, carpeta, seis perfiles y propósito breve
siguen presentes. La descripción de Investigación se simplificó a «Papers, tesis de posgrado y datos
que se puedan comprobar»: al retirar el párrafo también desapareció su definición de «fuentes»;
no se añade otro texto ni un botón dentro de una etiqueta de radio para compensarlo.

La iluminación usa un token exclusivo de 900 ms, una sola pasada izquierda → derecha. El nombre en
Inicio y el título final conservan degradado y brillo de entrada; «con» es texto blanco normal.
El pseudo-elemento de los botones primary se activa en hover o foco visible por teclado, en todo
el renderer: Inicio, progresión del asistente, revisiones, búsquedas y diálogos. No cambia geometría,
handlers, etiquetas, ni transiciones de estado/navegación. No tiene puntero, no se repite y desaparece
al terminar; disabled, danger y reduced no lo animan. El fondo global sigue siendo el único bucle.

Evidencia recuperada después de la interrupción, sin inventar códigos de salida perdidos:

- Native final previo a la interrupción terminó con código 0 en
  `C:/Users/RitualDesktop/AppData/Local/Temp/project-os-wave3-illumination-native-complete`.
  Ocho celdas de ventana/movimiento, rutas, fondo completo y seis mutaciones detectadas. Ratón y
  teclado reales en Inicio y paso 1: duración 900 ms/una iteración, puntero none, tres fases distintas,
  dimensiones intactas, foco visible conservado, disabled sin capa y reduced sin movimiento.
  Las muestras pausadas de 100/450/800 ms son controles de tiempo de la prueba, no vídeo manual.
- Los informes persistidos de UI registran 20 recorridos/120 pantallas/1340 controles alcanzables,
  40 copias exactas, cero problemas; 48 pantallas adicionales y 721 definiciones sin desajustes.
  Los informes de compatibilidad y aislamiento también existen. La reducción de controles corresponde
  al botón de definición retirado con el subtítulo, no a omitir pantallas.
  `C:/Users/RitualDesktop/AppData/Local/Temp/project-os-wave3-illumination-ui-v1`.
  Las sesiones anteriores ya no estaban disponibles al retomar: esos archivos no se presentan como
  un código de salida recuperado. Companion y raíz se repiten para obtener terminación verificable.
- Seis tests focales pasaron antes de la interrupción, incluida copia y contraste AA del botón en el
  máximo de iluminación, tanto normal como hover. Motion de componentes finalizó con código 0.

Los primeros intentos del nuevo probe corrigieron acceso a animaciones de pseudo-elementos usando
subtree y una suposición incorrecta del harness sobre un outline de 2 px: el estilo real conserva
3 px. No se cambió el producto para satisfacer ese supuesto. No se debilitaron reduced, contraste,
captura de clics, origen de animación, número de iteraciones ni límites de transiciones de estado.
No se acredita CI, revisión independiente, instalador, selector nativo o cierre normal.
Falta lectura en frío de la copia final, exportación y revisión independiente; #149 permanece abierto.

Repetición tras retomar: Companion **217/217, código 0**. Compatibilidad e aislamiento recuperados
declaran `completed:true`, y aislamiento tiene failures vacío. La raíz terminó **390/391, código 1**:
el único fallo fue igualdad del hash entre export y check mientras se actualizaban estos documentos,
incluidos en el árbol exportable. No se cuenta como pase. Con el árbol inmóvil, la repetición de
`node --test test/export.test.mjs` terminó **2/2, código 0**, conservando la comparación exacta de hash
y el caso negativo de README alterado. No se cambió el exportador ni sus pruebas. Se distingue ese
pase focal de una nueva ejecución completa de npm run check, que no se afirma.

## 2026-09-30 · separación del primer campo

El mantenedor pidió más espacio entre «¿Qué vas a preparar?» y «Nombre de tu proyecto».
El formulario del paso 1 recibe margin-top de 16 px, sin subtítulo ni texto nuevo y
sin modificar los otros pasos. Regresión focal 3/3, exit 0; Electron real con ocho
celdas responsive/movimiento, controles alcanzables, brillo y seis negativos: exit 0,
failures vacío. Evidencia fuente en Temp/peos-step1-spacing; no installer/release.

La raíz completa se repitió anteriormente sobre el árbol inmóvil: 391/391, exit 0;
véase independent-refinement-review.md. Ese pase no se atribuye a este nuevo CSS.
