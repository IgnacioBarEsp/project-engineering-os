## 1. La elección de escritorio se respeta

- [x] 1.1 Retirar de `DESTINATIONS` las seis URL web por aplicación de escritorio, dejando solo la del chat web,
      y mover la validación del agente al conjunto que ya define la selección.
- [x] 1.2 Decidir el modo por lo que la persona eligió: `web` solo si eligió chat web, `local` si eligió
      escritorio y hay contrato observado y verificado, `manual` en cualquier otro caso.
- [x] 1.3 Ruta manual: copiar la instrucción, no abrir nada, y devolver `opened: 'nothing'` con los cuatro
      campos de lo que no se demostró en `false`.
- [x] 1.4 Una frase por comprobación que puede fallar, derivada del rechazo concreto y no de si el rechazo traía
      editor adjunto. Eran cuatro causas deducidas; una revisión independiente encontró tres frases falsas
      manejando el lanzador real, así que ahora son ocho —`not-installed`, `not-measured`, `signature`,
      `no-desktop-app`, `no-help-contract`, `no-declaration`, `no-handler`, `no-contract`— y la pantalla vuelve
      a mostrar además la frase específica que el lanzador escribe.
- [x] 1.5 Pantalla: el diálogo de continuación con los tres modos, sin ninguna promesa de abrir un navegador
      cuando se eligió escritorio.

## 2. Instalación proporcionada

- [x] 2.1 Campo opcional `stack` en la selección con las tres decisiones, validado, y una selección sin el
      campo leída como «es pronto».
- [x] 2.2 Catálogo de tecnologías con identidad, licencias del cierre completo, tamaños, destino y digesto del
      árbol, y la lista de lo que no se ofrece con su motivo.
- [x] 2.3 Comprobar contra el cierre real que ninguna tecnología ofrecida trae scripts de instalación ni
      restricciones de `os` o `cpu`, y dejar esa comprobación como prueba.
- [x] 2.4 Reglas de recomendación sobre perfil e inventario, con su frase, sin que el modelo pueda cambiarlas.
- [x] 2.5 Instalador con el patrón del cache de ingeniería: lockfile revisado, `npm ci --ignore-scripts`, entorno
      aislado, digesto del árbol comparado contra el pin, y `rename` solo después de verificar.
- [x] 2.6 Registro de lo instalado y de lo rechazado, con fecha, y retiro que se niega si el árbol ya no
      coincide con su pin.
- [x] 2.7 Revisión previa con identidad, licencia, tamaño de descarga, tamaño instalado y destino a la vista, y
      la frase de por qué no hay nada que instalar cuando no lo hay.
- [x] 2.8 Rechazar una recomendación deja la preparación en el mismo estado válido que antes de preguntar.

## 3. Pantallas

- [x] 3.1 Pregunta de tecnología en el asistente con las tres respuestas y las tecnologías ofrecidas por perfil.
- [x] 3.2 Sección de tecnología en la revisión previa y en el estado del proyecto, con lo instalado, dónde, y lo
      rechazado.
- [x] 3.3 Lo que no se ofrece, nombrado en pantalla con de dónde viene y por qué no se instala desde aquí.
- [x] 3.4 Vocabulario: cada palabra nueva definida o en el glosario, y cada acción con un solo nombre y un solo
      control por pantalla.

## 4. Evidencia

- [x] 4.1 Mutaciones de servicio: el guardia del modo, la URL web para una aplicación de escritorio, la causa
      deducida en vez de nombrada, una sonda caída informada como ausencia, el argv de `npm ci`, mover a la
      carpeta de la persona lo que bajó de la red sin verificarlo, y retirar un árbol que ya no coincide.
      Instalar tras un rechazo lo cubre una aserción de `qa/stack.mjs` —un plan consumido no se puede reusar—,
      no una mutación: fue la única de las doce que una revisión independiente probó y la suite ya detectaba.
- [x] 4.2 Arnés de aperturas: por cada aplicación de escritorio del equipo, ninguna URL abierta y modo `local`
      o `manual`, nunca `web`.
- [x] 4.3 Los tres caminos —pide tecnología, no sabe, es pronto— contra tres carpetas idénticas salvo la
      respuesta, comparando qué quedó instalado en cada caso. Medido con el **servicio del artefacto instalado**,
      no con su ventana: instalar por la ventana exige teclear el asistente tres veces y no añade nada que estos
      arneses no vean. Los cinco recorridos nativos sí van por la ventana, y comprueban que dice qué tecnología
      hay y por qué.
- [x] 4.4 Instalar una tecnología de verdad una vez, por el camino del producto, y registrar bytes y tiempo.
- [x] 4.5 Contrato de interfaz y recorridos de navegador con las reglas de #97, #98, #99 y #106 intactas.
- [x] 4.6 Revisión adversarial independiente por un subagente que no implementó el cambio, con el verdicto
      completo guardado, incluido lo que estaba mal. **FAIL: 1 blocker, 5 majors y 6 minors.** Todo resuelto.
- [x] 4.7 Capturar los hallazgos en el registro de deuda con la categoría que cada uno tenga de verdad. El
      presupuesto se puso en rojo porque una decisión ya abierta se volvió **recurrente** —dos flujos, y un
      minor recurrente cuesta el doble—, así que se investigó y se **tomó** en vez de reclasificarla: reglas de
      ignore para lo que esta aplicación regenera. Presupuesto 3/5.

## 5. Documentación

- [x] 5.1 `docs/companion/ENVIRONMENT.md`: los tres caminos de instalación y lo que no se ofrece.
- [x] 5.2 `docs/companion/SECURITY.md`: qué se abre, qué no, y por qué una elección de escritorio no puede
      terminar en un navegador.
- [x] 5.3 Delta de spec en `companion-program-acceptance` con la elección de escritorio respetada, y en
      `companion-environment` con los tres caminos de instalación. El issue apuntaba a `companion-experience`
      para la segunda, pero es `companion-environment` la que ya define qué se instala, con qué identidad,
      licencia, tamaño y destino, así que el requisito vive donde vive lo que extiende.
