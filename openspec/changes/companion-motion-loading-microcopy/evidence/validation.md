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
