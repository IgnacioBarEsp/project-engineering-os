## 1. Entrada a implementación

- [x] 1.1 Registrar aprobación de propuesta/spec y autorización para continuar con apply; releer este límite y el preflight.
- [x] 1.2 Revalidar DoR #142 y baseline si cambiaron main, el issue o los artefactos; confirmar las rutas de evidencia y el entorno Windows aislado.

## 2. Barra y navegación

- [x] 2.1 Distinguir barra final de filas locales, situarla después del contenido animado y aplicar sticky en el scroll existente; retirar fixed y padding compensatorio.
- [x] 2.2 Preservar submit, required, Enter, listeners y selección al separar la barra del formulario inicial; comprobar campos y sugerencias al final de las pantallas.
- [x] 2.3 Añadir install y finished a la navegación activa y comprobar los seis estados actuales, estados heredados y salida del asistente.
- [x] 2.4 Derivar el objetivo de la visión como una sola línea y nombrar el editor de visión; comprobar que una sugerencia o un salto de línea llegan a la pantalla final y a PROJECT_VISION.md.
- [x] 2.5 Sustituir en el prompt de «Instalación rápida» la frase que afirma dependencias aprovisionadas por una verdadera, y comprobarlo en el texto copiado.

## 3. Portapapeles

- [x] 3.1 Añadir copyText al servicio y allowlist del preload con forma exacta, validación multilínea, límites UTF-8/JSON, escritura esperada y respuesta copied/bytes/sent.
- [x] 3.2 Integrarlo en Copiar ruta y Copiar Prompt Maestro mediante call; retirar fallback y catch silencioso, mostrar errores y confirmar solo después del éxito.
- [x] 3.3 Probar límites, Unicode, multilinea, entradas inválidas, fallos del adaptador, rechazo IPC y emisor no autorizado; comprobar que no se escribe ante error y que exports/guías/handoff retienen sus controles.

## 4. Evidencia del defecto y su corrección

- [x] 4.1 Añadir el recorrido vigente a verify-ui con los tres viewports y ambos modos de movimiento; medir controles esperados/observados, hit testing, scroll, barra y ambas ramas de instalación.
- [x] 4.2 Añadir a verify-interface-contract la sonda compartida y mutación de fixed bajo .enter; exigir detección geométrica concreta y rechazar observaciones vacías o timeouts como éxito.
- [x] 4.3 Ejecutar prueba Windows con Playwright _electron, main/preload/servicio reales y lectura nativa desde main para ambos botones; guardar procedencia, geometría y confirmación observada.
- [x] 4.4 Ejecutar pruebas Companion, UI, contrato y npm run check; completar revisión de teclado, tecnología asistiva, zoom, contraste y estados de carga/error con autoría real.

## 5. Candidato y estado público

- [x] 5.1 Preparar identidad Companion 0.3.2 en package/lock, notas y aserciones de empaquetado necesarias, manteniendo núcleo 0.5.0 y dependencias fijadas.
- [x] 5.2 Actualizar PROJECT_STATUS con defectos conocidos de 0.3.1 y estado de candidato; coordinar procedencia de capturas con #143 sin atribuir a esta entrega su galería.
- [x] 5.3 Construir el candidato 0.3.2 y probar su ejecutable empaquetado en Windows, documentando el alcance observado; registrar decisión del mantenedor sobre publicación y condiciones de la rama elegida. La instalación en Windows aislado la prueba el workflow de release sobre el tag antes de publicar.

## 6. Cierre posterior

- [x] 6.1 Verificar rollback en fixture, ejecutar revisión adversarial desde contexto limpio y resolver Blockers/Majors; registrar assessment de deuda y capturarlo con el flujo configurado.
- [x] 6.2 Sustituir estados pendientes de readiness solo con evidencia ejecutada; pasar strict y gate de archive aplicable sin excepciones inventadas ni arreglos laterales de #115/#122.
- [x] 6.3 Archivar con el CLI OpenSpec local, firmar los commits con DCO y entregar por PR protegido con la evidencia; la integración queda sujeta a CI requerido y a la decisión del mantenedor.
- [x] 6.4 Registrar la decisión de publicación y lo que ocurre después del merge. Si se publica: tag anotado, workflow existente, comparación de assets canónicos y conciliación de README, guía de instalación y estado, como trabajo posterior a este change. Si se difiere: propietario, motivo y la descarga real con sus defectos conocidos.

Cada tarea tiene su evidencia en la [validación](evidence/validation.md). La 5.3 se reformuló durante el apply.
Decía «Probar el instalador candidato en Windows aislado», y esa instalación la hace el workflow de release
sobre el tag, por la decisión de publicar del mantenedor: aquí se construyó el candidato y se probó su
ejecutable empaquetado. Lo que ocurra después del merge, incluida esa instalación, queda en el PR.
