## Alcance

Refs #150. Último issue de implementación de la ola 3. **Draft apilado sobre #201**; no iniciar ola 4.
No fusionar este PR a una rama de la pila: integrar los padres primero y retarget/revalidar contra main protegido.

- Matriz real: seis perfiles × dos vías × dos movimientos × tres tamaños; abrir carpetas preparadas/sin preparar, quitar de lista conservando archivos y reanudar borradores.
- Cobertura de las 20 rutas desde el renderer, probes compartidos de alcance/oclusión/scroll/contención, coherencia de navegación y estilos/tokens.
- 14 negativos nuevos; se conservan las 46 mutaciones anteriores. Comparación inmutable a3b1efd vs c044d2d.
- Job Windows Electron obligatorio: portapapeles real, 18 capturas con procedencia v1, agregado requerido que falla cerrado y artefactos persistidos.
- Protocolo independiente en EVALUATION.md. Centralización sin cambio de paleta de 62 rgba en 34 tokens y dos correcciones acotadas de layout.

## Evidencia local

- Companion 182/182; raíz 391/391; fixture consumidor y OpenSpec 1.6.0 strict PASS.
- 72 recorridos / 534 pantallas + 8 adicionales.
- Recorrido visual: 168/168 pantallas, 1708/1708 controles alcanzables, 56/56 copias.
- 20 rutas × 2 modos × 3 tamaños = 120 celdas; 14 controles negativos nuevos.
- Electron Windows 44.1.1: 18 capturas, 12 copias exactas, cero errores.
- Historial: a3b1efd reproduce 90 hallazgos; el hotfix pasa los mismos probes de alcance/contención/copia.
- Deuda: assessment clean, registro existente sin cambios.

Los JSON resumidos y el par histórico están en el change companion-harness-reachability-electron.
Los resultados completos de CI se adjuntan como companion-browser-evidence y companion-electron-evidence.
El recorrido general completo se ejecutó antes de la centralización alpha (equivalencia exacta demostrada);
contraste/rutas y Electron se repitieron después. CI repite la matriz completa sobre el SHA final.

## Gates abiertos — no sustituir por CI verde

- Informe adversarial independiente sobre SHA final con mutaciones propias.
- Aceptación visual del mantenedor; las dos lecturas humanas de #149 siguen pendientes.
- Integración en orden de los padres #196 → #197 → #198 → #199 → #200 → #201 y este PR.
- Archivo oficial OpenSpec y cierre de issues solo después de cumplir esos gates.

Sin dependencias nuevas, cambios a IPC, instalación del usuario, migraciones, releases ni trabajo de ola 4.
