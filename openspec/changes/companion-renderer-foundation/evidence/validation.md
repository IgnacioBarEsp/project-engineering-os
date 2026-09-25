# Validación de #144

Fecha local: 2026-09-24. Worktree aislado `codex/144-renderer-foundation`, basada en `9751c301976fe27e9bbad33e69f39372b69f901e`. Se comprobaron Inicio y Ayuda de la app real con Electron 44 y `userData`/`LOCALAPPDATA` desechables; no se abrió el instalador, no se eligió una carpeta del usuario y no se publicaron artefactos.

| Gate | Resultado y alcance |
| --- | --- |
| OpenSpec local 1.6.0 strict | PASS: `openspec validate companion-renderer-foundation --strict --no-interactive`. |
| Pruebas estructurales | PASS: allowlist `peos://` igual al árbol `ui/`, rutas cerradas, suscripciones, archivos menores de 400 líneas, sin hexadecimales fuera de tokens ni emoji de UI. |
| Companion | PASS: 150/150 pruebas. |
| Repositorio | PASS en la repetición estable: `npm run check`, 389/389 pruebas, incluidos package, neutralidad, docs, workflows y deuda. El primer pase coincidió con la creación de archivos bajo `openspec/changes/` y falló solo la comparación de exportación de árbol completo; se repitió sin escrituras simultáneas y pasó. |
| Navegador con CSP exacta | PASS: 20 recorridos del asistente, 140 pantallas, 1100/1100 controles alcanzables, 40/40 copias; cinco perfiles vigentes, 38 pantallas medidas para contraste/orden de encabezados/vocabulario sin hallazgos, 502 términos alcanzables. Ventanas 1180/1024/768/480/240 px sin desbordamiento y movimiento normal/reducido. [Reporte](browser/browser-evidence.json). |
| Contrato y mutaciones | PASS: 45/45 mutaciones detectadas, 318/318 controles del asistente alcanzables, 11 pantallas y cero hallazgos. Ninguna excepción de harness cuenta como detección. [Reporte](contract/interface-contract.json). |
| Electron real | PASS: `peos://app/index.html`, cabecera 56 px, `main` scroller, sprite SVG visible, nav/breadcrumb coherentes en Inicio y Ayuda, 18 términos de glosario, cero fallos de CSP/consola/red. [Reporte](electron/electron-shell.json), [Inicio](electron/home-electron.png), [Ayuda](electron/help-electron.png). |
| `git diff --check` | PASS. |

El navegador usa renderer y motores reales, pero sustituye únicamente transporte IPC, selector nativo de carpeta, portapapeles y apertura externa; no afirma cobertura de instalación. La sesión de Electron sí usa el protocolo y la CSP de la app real, pero limita el smoke a Inicio/Ayuda; #150 amplía la matriz nativa.

La inspección visual de estas capturas por Codex identificó y corrigió dos fallos: un alias CSS autorreferencial que ocultaba el texto de marca y el sprite SVG bloqueado por la allowlist del protocolo. También se separaron las cabeceras de la lista de Ayuda y se retiraron estilos de prototipo sin consumidores. La captura a 464 px descubrió una pestaña oculta; una aserción nueva falló a 480 px y pasó tras compactar la navegación y conservar el nombre accesible de Privacidad. Esta inspección no equivale a aprobación visual del mantenedor ni a la revisión adversarial independiente solicitada por el issue; ambos gates siguen pendientes en `readiness.json` y antes del archive.

Rollback: revertir el PR antes de release restaura el renderer anterior. La prueba de recorrido conserva byte a byte los archivos originales del fixture tras una operación y su deshacer; el change no tiene migración de datos ni altera el motor.
