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
  publicado apunta ahora a 0.3.6, y la guía distingue el idioma de las páginas del instalador del idioma de
  los cuadros propios de Windows. El Companion permanece propiedad upstream y no introduce producto/stack
  en los consumidores.

La revisión de claridad y la comprobación de teclado son del agente del apply. La revisión adversarial
independiente posterior consta en [adversarial-review.md](adversarial-review.md); no se infiere de las
pruebas locales ni de CI.

| Comprobación actual | Resultado |
| --- | --- |
| `npm test --prefix apps/companion` | 146/146 PASS |
| `npm run check` | 351/351 PASS |
| `npm run audit --prefix apps/companion` | 0 vulnerabilidades de producción |
| `npx --no-install openspec validate companion-installer-choices --strict --no-interactive` | PASS |
| `git diff --check` | PASS |
| `npm run pack --prefix apps/companion` desde `89a7614` | PASS, árbol limpio |
| `npm run pack:verify --prefix apps/companion -- <salida>` | PASS, identidad y contenido del build limpio |
| Workflow protegido 35937040623 | PASS; build del tag, ciclo 0.1.0 → 0.3.6 → desinstalación, preservación de sentinelas y comparación canónica; [detalle](release-0.3.6.md) |

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

## Cobertura Windows del candidato publicado 0.3.6

El verificador conserva la guardia que solo permite ejecutarse en GitHub Actions o con
`PROJECT_OS_DISPOSABLE_WINDOWS=1`. El [workflow protegido de 0.3.6](release-0.3.6.md) reconstruyó el tag,
actualizó 0.1.0 a 0.3.6, retiró instalación y acceso directo tras desinstalar y preservó los sentinelas de
proyecto, historial y runtime. Es cobertura automatizada silenciosa en un runner desechable, no interacción
humana con el asistente.

La observación asistida cubre el baseline 0.3.2, el defecto de idioma de 0.3.5, las dos ramas de las casillas
con 0.3.6, una instalación limpia, actualización, reparación, apertura desde Finish, desinstalación y retirada
del enlace, en Windows Sandbox. La preservación de datos se atribuye solo al arnés automatizado, no a la
observación Sandbox. El gate de publicación exige la confirmación del mantenedor y las cinco capturas antes
de construir y publicar. El verificador no automatiza la casilla asistida desmarcada: esa rama queda cubierta
por la observación manual versionada y el gate obligatorio; la CI sí comprueba los defaults silenciosos.

El informe complementario `native-journeys.json` registró cinco perfiles abiertos, cero hallazgos y diez
etapas no verificadas que requerían responder selectores del sistema. No se declara como ejecución completa
de esas etapas ni como cobertura del instalador. La revisión adversarial, el rollback conjunto y los gates
de deuda/readiness están registrados por separado para el archive.

## Deriva y límites

No se detecta deriva de versión, núcleo, rutas de datos o propiedad del menú Inicio. La UI asistida, la
comparación contra el baseline y el ciclo de publicación tienen evidencia manual/automatizada separada; sus
límites de cobertura permanecen explícitos y no se presentan como señales equivalentes.
