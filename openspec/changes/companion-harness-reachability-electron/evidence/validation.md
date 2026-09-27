# Validación técnica #150

Fecha local 2026-09-26 (artefactos UTC 2026-09-27). Node 24.18.0, Electron 44.1.1.
Worktree aislado codex/150-harness-electron sobre #149. Sin modificación de la instalación o proyectos del usuario.

## Ejecuciones

- OpenSpec local fijo 1.6.0: validate --strict PASS. DoR previo 13/13, sin PR duplicado.
- Companion: 182/182 pruebas PASS; raíz npm run check: 391/391 PASS, además de contrato de paquete,
  neutralidad, documentación, workflows, deuda y baseline doctor. Fixture consumidor vacío PASS.
- Matriz de perfiles: 72 recorridos, 534 pantallas, cero errores. Se conservan los resultados por celda,
  no solo el total, en profile-matrix.json.
- Recorrido visual general: 28 recorridos del asistente, 168/168 pantallas, 1708/1708 controles,
  56/56 copias exactas. Siete variantes heredadas en ambos modos: búsqueda, exclusiones, handoff,
  duplicación y recuperación con servicios reales y originales conservados.
- Todas las rutas: 20 rutas × 2 modos × 3 tamaños = 120 celdas; renderer real con respuestas de servicio
  fijas, explícitamente NO prueba de instalación del motor. Los 14 controles negativos nuevos detectados,
  incluyendo copia que evita IPC y color funcional fuera de tokens.
- Contrato previo: 46/46 mutaciones; construcción 1/1; 36 pantallas, 372/372 controles y cero hallazgos.
  Copia aprobada, rechazada, transporte fallido y éxito seguido de rechazo se conservan.
- Electron local: 18 capturas (Inicio/paso 1/final × tres ventanas × dos modos), 12 copias con texto
  exacto leído desde clipboard.readText en main, cero errores. Capturas de fuente, NO instalador.
- Doble ejecución histórica: seis recorridos de a3b1efd producen 90 hallazgos; seis del hotfix
  c044d2d producen cero en el mismo alcance (alcanzabilidad/contención/copia). Ver historical-pair.json.
- Ocho recorridos adicionales PASS: reanudar borrador en ambos modos y abrir carpeta preparada/quitar de
  lista/abrir sin preparar en ambos modos y tres tamaños. Archivos y fuentes conservados.
- Guard de colores ampliado: 62 declaraciones rgba (39 layout, 7 components, 16 pages) centralizadas en
  34 tokens con valores idénticos. Equivalencia comprobada expandiendo referencias; captura, contraste
  y las 120 celdas se repitieron después. La CI repetirá la matriz completa sobre el commit final.
- CI de #150: pendiente de publicación del PR; no se declara PASS remoto todavía.

## Límites y comprobaciones del núcleo

El upstream no consume el layout que genera. sync --check es SKIP sin mutación; opsx-check directo
informa falta de openspec-ownership.json (no se crea un recibo ficticio). doctor JSON conserva exactamente
los tres FAIL justificados por issues del baseline anterior. npm run check valida esa igualdad y el
fixture consumidor comprueba instalación, doctor, sync, segunda ejecución e idempotencia en su ámbito.
Ninguno de esos diagnósticos se oculta ni se corrige fuera del alcance de la ola 3.

Inspección visual propia de captura mínima Electron: navegación legible, paso/encabezado presentes y
formulario desplazable; prueba geométrica recorre también sus controles inferiores. No es lectura en frío,
lector de pantalla humano ni aceptación visual del mantenedor.

## Reproducción y artefactos

Desde apps/companion: npm run test:ui -- <directorio>; npm run evidence:contract -- <directorio>;
npm run evidence:electron -- <directorio>; node scripts/verify-historical-pair.mjs <directorio>.
Los JSON crudos y capturas locales están bajo el directorio temporal project-os-closeout/wave3-150-*.
CI adjunta companion-browser-evidence y companion-electron-evidence; el segundo contiene registros v1
.png.provenance.json. EVALUATION.md describe el informe independiente obligatorio.

## Cierre

Revisión independiente y aceptación humana: pendientes. No archivar, fusionar ni cerrar #150 sin ellas.
#149 también conserva dos lectores humanos pendientes. La ola 4 no se ha iniciado.
Rollback: revertir este PR; las correcciones son de CSS y pruebas/CI, sin migración de datos.
