# Validación — companion-installer-choices (#168)

## Revalidación de la corrección 0.3.6 (22–23 de septiembre de 2026)

El fallo de idioma de 0.3.5 se confirmó en [Windows Sandbox](assisted-sandbox.md). Una construcción local
0.3.6 con `installerLanguages: [es_ES]` compiló y las páginas observadas hasta la elección de escritorio
salieron en español. Ese primer build estaba marcado `dirty`: sirvió solo para inspección temprana y
`pack:verify` lo rechazó correctamente. Después se reconstruyó desde el commit limpio
`89a761483a3cd01a9c4cd7bf0b12555e1ca5aa70`: `pack:verify` pasó para el instalador de 133.228.470
bytes y SHA-256 `b92ffc4b81b80b2df0103a21f99df9d692ead2ca53fe1d99d0f3e39147a2602e` (2.547 archivos
empaquetados, 2.619 instalados, núcleo 0.5.0, firma observada `NotSigned`). Este build limpio aún no es el
artefacto reconstruido desde el futuro tag protegido.

El 23 de septiembre se terminó en Windows Sandbox la instalación limpia de ese build, una reparación sobre
la misma versión y su desinstalación. Las páginas estándar observadas (licencia, opciones, destino y Finish)
estaban en español; el texto MIT sigue en inglés y el aviso de datos propio, en español. La casilla Desktop
empezó marcada, respondió a Espacio y el `.lnk` quedó visible en Desktop. Finish abrió la aplicación en
español. Tras Repair, Finish volvió a abrirla y el `.lnk` permaneció. Después, el desinstalador confirmó que
la app quedó desinstalada; su carpeta quedó vacía y el Escritorio conservó solo Microsoft Edge. No se
añadieron datos centinela, así que esta observación no demuestra por sí misma la preservación de proyectos,
historial ni runtimes. Las capturas y la limitación de idioma de los botones nativos del diálogo contextual
están detalladas en [assisted-sandbox.md](assisted-sandbox.md). Las ramas no marcadas constan en la observación
de la actualización 0.3.5 → 0.3.6. La inspección visual a la resolución activa del invitado muestra la página
NSIS completa, con encabezado, casilla, texto y botones visibles sin recorte; este resultado cubre el layout
del asistente en Windows y no afirma pruebas a todas las resoluciones o escalas.

### Revisión manual de teclado, conectividad y claridad

- La página propia se recorrió con Tab y Shift+Tab; Espacio desmarcó y volvió a marcar la casilla. El control
  mantuvo foco visible y respondió por teclado. No se usó lector de pantalla; no se atribuye esa cobertura.
- Windows Sandbox tenía la red deshabilitada. El instalador autocontenido completó instalación y Repair sin
  conectividad. Esta superficie no carga estados dinámicos vacíos/error desde un servicio; no se extrapola
  el resultado al comportamiento de red de la aplicación en ejecución.
- Revisión de claridad/ownership de [INSTALLER.md](../../../../docs/companion/INSTALLER.md) y del
  [mapa de ownership](../../../../docs/architecture/OWNERSHIP.md): la guía identifica a quién sirve, qué
  elige la persona, los defaults silenciosos, las rutas de datos y qué preserva la desinstalación. El enlace
  publicado sigue apuntando a 0.3.5 y advierte de su idioma inglés; no promete anticipadamente 0.3.6. El
  Companion permanece propiedad upstream y no introduce producto/stack en los consumidores.

La revisión de claridad y la comprobación de teclado son del agente del apply; la revisión adversarial
independiente sigue siendo un gate separado y pendiente.

| Comprobación actual | Resultado |
| --- | --- |
| `npm test --prefix apps/companion` | 146/146 PASS |
| `npm run check` | 351/351 PASS |
| `npm run audit --prefix apps/companion` | 0 vulnerabilidades de producción |
| `npx --no-install openspec validate companion-installer-choices --strict --no-interactive` | PASS |
| `git diff --check` | PASS |
| `npm run pack --prefix apps/companion` desde `89a7614` | PASS, árbol limpio |
| `npm run pack:verify --prefix apps/companion -- <salida>` | PASS, identidad y contenido del build limpio |

El resto de este archivo es evidencia histórica del primer candidato 0.3.2; no describe el estado
publicable de 0.3.6.

Esta evidencia de UI la produjo el agente del apply en Windows Sandbox; no se presenta como observación
humana. La instalación silenciosa y las comprobaciones de fuente tampoco equivalen a interacción humana.

> **Registro histórico, supersedido para publicación:** el candidato descrito abajo era 0.3.2. Esa versión se
> publicó antes de completar #168 y no se reemplazó. La publicación y el ciclo silencioso de 0.3.5 constan en
> [release-0.3.5.md](release-0.3.5.md). Todavía falta la observación de UI asistida.

## Resultado local

| Comprobación | Resultado | Registro |
| --- | --- | --- |
| `npx --no-install openspec validate companion-installer-choices --strict --no-interactive` | PASS | Validación estricta del change |
| `npm test --prefix apps/companion` | 145 tests, 145 PASS, 0 FAIL | Suite de Companion |
| `npm run audit --prefix apps/companion` | 0 vulnerabilidades de producción | Auditoría npm |
| `npm run check` | 350 tests, 350 PASS, 0 FAIL | Suite completa del repositorio |
| `npm run pack --prefix apps/companion` | PASS, instalador x64 generado | Candidato local limpio |
| `npm run pack:verify --prefix apps/companion -- directorio-de-candidato` | PASS | Árbol limpio, 2.547 archivos empaquetados, 2.619 instalados, núcleo 0.5.0 |
| `node --check` sobre los scripts modificados | PASS | Sintaxis de los harnesses |
| `git diff --check` | PASS | Sin errores de whitespace |

El candidato medido desde el árbol limpio `dc2509a1e13c4fcd908ea64ddb952489e8cd175b` es
`ProjectEngineeringOS-Setup-0.3.2-x64.exe`, 133.310.012 bytes, SHA-256
`3890ab25c794a92629fb65cecc78a436277e0aaf809c997e8382938eda5a2c65`. `pack:verify` observó árbol limpio,
2.547 archivos empaquetados, 2.619 instalados, núcleo 0.5.0 y firma `NotSigned`. El workflow de release debe
reconstruir el candidato desde el commit integrado antes de publicar.

## Cobertura Windows pendiente

El verificador conserva la guardia que solo permite ejecutarse en GitHub Actions o con
`PROJECT_OS_DISPOSABLE_WINDOWS=1`. La release 0.3.5 completó el ciclo silencioso documentado en
[release-0.3.5.md](release-0.3.5.md). El workflow de release para el tag protegido aún no se ejecutó para 0.3.6;
los checks verdes del PR validan sus propios trabajos, pero no se presentan como ejecución del arnés de
instalación. La ejecución del release debe registrar actualización, desinstalación, retirada del enlace y
preservación de los tres sentinelas. Esa automatización no se presentará como interacción humana.

La observación asistida cubre el baseline 0.3.2, el defecto de idioma de 0.3.5, las dos ramas de las casillas
con 0.3.6, una instalación limpia, actualización, reparación, apertura desde Finish, desinstalación y retirada
del enlace. La preservación de datos centinela y la ejecución del workflow protegido desde el tag aún quedan
pendientes, junto con la revisión independiente y los gates de archivo/PR; esta evidencia no cierra #168.

## Deriva y límites

No se detecta deriva de versión, núcleo, rutas de datos o propiedad del menú Inicio. La observación real de UI,
la comparación contra el baseline y la ejecución de instalación/actualización/desinstalación son una deuda de
evidencia del runner protegido, no una afirmación satisfecha por este checkout.
