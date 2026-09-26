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
