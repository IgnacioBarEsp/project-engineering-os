# Evidencia #148

2026-09-26. Worktree aislado sobre #147. No modifica servicio, canales ni proyectos reales.

- DoR 13/13; OpenSpec local 1.6.0 strict PASS antes de aplicar.
- Ensayo dirigido: 32 pantallas (4 pestañas × 4 anchos 1180/1024/768/480 × ambos movimientos), AA/encabezados/overflow, foco y rutas PASS. Renderer/servicio reales con IPC/picker/clipboard inyectados, NO evidencia de Electron.
- Reloj controlado en renderer: sin skeleton a 299 ms, aparece a 300; no marcas antiguas mientras lee; error a 10 s; 5 filas, una ilegible y cuatro verificadas, 5 originales preservados.
- QA navegación: 4/4; renderer base/assets 4/4; lenguaje 9/9.
- UI general final PASS: 20 recorridos, 120 pantallas, 1220/1220 controles y 40 copias; 48 pantallas sin hallazgos y 736 definiciones coherentes.
- Contrato PASS 46/46 negativos, construcción 1/1, 372/372 controles. No se eliminó ningún probe; la alerta ahora está dentro de la lista y la prueba exige esa alerta visible.
- Companion PASS 174/174 y npm run check PASS 391/391 en árbol inmóvil. Después se corrigió identidad nativa del documento: nuevo test 1/1 y pruebas nativas PASS. CI repetirá suites sobre el commit.
- Electron 44: reproducción aislada demuestra rechazo con hash y aceptación sin hash antes del fix. Después: Inicio/Ayuda con hash, cero errores/CSP/red, cierre inmediato guarda, reapertura restaura y fallo de guardado conserva ventana/bytes. Cero escrituras en proyecto. Capturas locales en `C:/Users/RitualDesktop/AppData/Local/Temp/project-os-closeout/wave3-148-shell`.

Reproducción: `npm --prefix apps/companion run evidence:project`, `npm --prefix apps/companion test`, `npm --prefix apps/companion run test:ui`, `npm --prefix apps/companion run evidence:contract`, `npm run check`.

Aceptación visual humana, revisión independiente y archivo oficial siguen pendientes. La comprobación automática de accesibilidad no equivale a una prueba humana con lector de pantalla. Rollback de renderer: revertir PR; ningún formato de datos cambia.
