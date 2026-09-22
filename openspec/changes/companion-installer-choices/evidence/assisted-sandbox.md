# Recorrido asistido en Windows Sandbox — #168

## Entorno y alcance

Observación el 22 de septiembre de 2026 en Windows Sandbox de Windows 11, interfaz del sistema en inglés,
con la carpeta de instaladores del host montada de solo lectura en `C:\TestInstallers`, red y vGPU
deshabilitadas. Todo lo instalado se limitó al invitado desechable; no se ejecutó un instalador en el host.
Las capturas incluyen la barra de Windows Sandbox para distinguir el invitado.

Las versiones publicadas se comprobaron contra sus SHA-256 de release antes de abrirlas:

| Versión | SHA-256 del instalador | Uso |
| --- | --- | --- |
| 0.3.2 | `cab544dddd31a83fb86f744646cffcb2b1da346f950428c5c6a17b5931ac632e` | Baseline sin las elecciones nuevas |
| 0.3.5 | `9860c3fe476469a5e07b8f8cdf0936d305b7851638eab37a354cf739a604ab1d` | Release con elecciones, falla idioma |
| 0.3.6 de trabajo | `c5761c3255316057b92224b928d454d9b59b6332bce9eae995c935c383ca4e68` | Construcción local marcada `dirty`, **no publicable** |
| 0.3.6 limpio | `b92ffc4b81b80b2df0103a21f99df9d692ead2ca53fe1d99d0f3e39147a2602e` | Build verificado desde `89a7614`, pendiente de UI y publicación |

## Baseline 0.3.2 y hallazgo 0.3.5

La 0.3.2 publicada mostró páginas estándar en inglés: [licencia](screenshots/baseline-0.3.2-license.jpg),
[opciones](screenshots/baseline-0.3.2-options.jpg),
[destino](screenshots/baseline-0.3.2-location.jpg) y
[final](screenshots/baseline-0.3.2-finish.jpg). No ofreció apertura en Finish. Se completó su instalación
en Sandbox.

La 0.3.5 publicada detectó 0.3.2 y ofreció actualizar en un [diálogo español](screenshots/candidate-0.3.5-upgrade-dialog.jpg).
Su casilla de escritorio apareció [marcada por defecto](screenshots/candidate-0.3.5-desktop-checked.jpg)
y su casilla de apertura apareció [marcada por defecto](screenshots/candidate-0.3.5-finish-checked-english.jpg).
Sin embargo, las páginas estándar [de licencia](screenshots/candidate-0.3.5-license-english.jpg),
[opciones](screenshots/candidate-0.3.5-options-english.jpg) y
[final](screenshots/candidate-0.3.5-finish-checked-english.jpg) seguían en inglés; la página propia heredó
«Choose Install Location» como encabezado inglés. Se desmarcó apertura y se pulsó Finish; no se abrió la
app. Este resultado bloqueó el cierre de #168 pese al ciclo silencioso exitoso de esa release.

## Corrección 0.3.6 en revisión

`nsis.language: "1034"` solo cambió VERSIONINFO, no el idioma MUI. La corrección agrega
`installerLanguages: [es_ES]` y un encabezado explícito de la página propia. El instalador 0.3.6 local
detectó 0.3.5 y ofreció [actualizarla en español](screenshots/candidate-0.3.6-upgrade-dialog.jpg). Sus
páginas estándar de [licencia](screenshots/candidate-0.3.6-license-spanish.jpg),
[opciones](screenshots/candidate-0.3.6-options-spanish.jpg) y
[destino](screenshots/candidate-0.3.6-location-spanish.jpg) se mostraron en español. La página propia
tenía [encabezado español y casilla marcada](screenshots/candidate-0.3.6-desktop-checked-spanish.jpg);
la casilla también se pudo [desmarcar](screenshots/candidate-0.3.6-desktop-unchecked-spanish.jpg).

El build limpio pasó `pack:verify`, pero su UI y el ciclo completo aún no están observados. La
construcción desde el futuro tag protegido tendrá otra identidad y requerirá comprobar su hash. Los
resultados de instalación, ambas ramas de Finish, reparación y desinstalación se añadirán solo cuando se
observen.
