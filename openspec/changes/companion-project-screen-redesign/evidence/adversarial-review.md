# Revisión propia #148

Agente implementador, usando engineering:code-review; NO independiente ni humana.

## Hallazgos corregidos

1. El nuevo heading de lista aparece antes de sus filas: la prueba ahora espera aria-busy=false, no confunde heading con lectura terminada.
2. Estado de error migrado de feedback global a alerta local: probe exige alerta real visible y conserva la causa del servicio.
3. Foco perdido al reconstruir segmentos durante busy: se restaura después de habilitar controles, verificado con flechas, Home/End, Enter y ambas preferencias de movimiento.
4. Prompt largo en Tu IA desbordaba el panel: wrap explícito; 32 pantallas verificadas sin overflow.
5. No mostrar veredictos almacenados mientras se recargan; identidad solamente en skeleton y respuesta caducada no muta la pantalla.
6. URI cerrada a pestañas conocidas e id del proyecto abierto; no acepta navegación a un proyecto ajeno ni expone rutas locales en hash. Alias de perfiles legados se resuelven con el catálogo existente.
7. Gemini/Kiro/Windsurf son destinos de instrucciones, no instalaciones detectadas; la causa route-only conserva ese límite en el diálogo.
8. Electron rechazaba IPC y omitía guardado al cerrar con hash. Reproducción con/sin hash aisló la comparación literal. Se conserva ventana/frame por identidad y documento exacto antes del fragmento; negativos para query, ruta, host, puerto, protocolo y credenciales. Cierre/reapertura/fallo de guardado nativos repetidos sin errores. No se cambió ningún canal ni se aceptó navegación externa.

## Decisión

Sin cambios al servicio, core ni ownership. Excepción mínima en main documentada en ADR: identidad del mismo documento con fragmento para IPC/cierre. Assessment principal capturado antes de ese hallazgo; suplemento native-url registra su resolución sin reescribir historia. 46 mutaciones originales conservadas; nuevos ensayos no reemplazan revisión externa. Pending: gates humanos/independientes, ramas base y archivo oficial.
