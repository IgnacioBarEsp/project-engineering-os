# Revisión adversarial propia — #145

La realizó el agente que implementó el cambio. No es una revisión independiente ni una aprobación humana; ambos estados permanecen pendientes en `readiness.json`.

1. **Enfoque de otro perfil.** `resolveProfile` y `normalizeSelection` rechazan un enfoque ajeno; la prueba recorre las seis categorías y el renderer solo construye tarjetas desde los enfoques del perfil elegido. Cambiar perfil filtra tecnologías antes elegidas.
2. **Pérdida de semántica antigua.** Una fixture de Unity con recibo, journal e historial consistentes se abre y lista con «Software y apps · Videojuego», conservando bytes y hashes. El mapeo mantiene ingeniería para Unity y reglas creativas para medios. El write path solo acepta los seis ids canónicos.
3. **Id interno en pantalla o archivo humano.** `PROJECT_VISION.md` y la lista derivan nombres de la fuente única. El harness recorre los seis perfiles y los dos legados especializados; las pruebas inspeccionan visión y fila.
4. **Reglas generales accidentalmente compartidas.** Cada enfoque tiene setup, método y receta propios. Una prueba compara el prompt y las recetas renderizados entre enfoques y falla si el cambio es solo una etiqueta.
5. **Señal de carpeta engañosa.** Las once fixtures crean archivos reales y comprueban recomendación de perfil/enfoque. No se usa IA ni se leen nombres de secretos para decidir el perfil.

Resultado de esta revisión propia: cero Blockers o Majors observados. Quedan pendientes la lectura de nombres/descripciones por el mantenedor, la revisión adversarial independiente y los gates de #144; se mantienen como gates, no como pases simulados. Las pantallas antiguas coexistentes se retiran en #146 ya abierto y no se atribuyen como deuda nueva de #145.
