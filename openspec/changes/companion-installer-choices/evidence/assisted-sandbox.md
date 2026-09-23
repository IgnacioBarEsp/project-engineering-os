# Recorrido asistido en Windows Sandbox — #168

## Entorno y alcance

Observación inicial el 22 y continuación el 23 de septiembre de 2026 en Windows Sandbox de Windows 11,
interfaz del sistema en inglés, con la carpeta de instaladores del host montada de solo lectura en
`C:\TestInstallers`, red y vGPU deshabilitadas. Todo lo instalado se limitó al invitado desechable; no se
ejecutó un instalador en el host. Las capturas incluyen la barra de Windows Sandbox para distinguir el
invitado.

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

Con la casilla de escritorio desmarcada, la actualización 0.3.5 → 0.3.6 completó. La página
[Finish apareció en español con apertura marcada por defecto](screenshots/candidate-0.3.6-finish-checked-spanish.jpg).
Se [desmarcó la apertura](screenshots/candidate-0.3.6-finish-unchecked-spanish.jpg), se pulsó Terminar y
no se abrió la app. La [carpeta Escritorio de la cuenta](screenshots/candidate-0.3.6-desktop-unchecked-user-folder.jpg)
contenía solo el acceso de Microsoft Edge: el enlace de Project Engineering OS que existía desde 0.3.5
había sido retirado. El shell conservó el icono unos segundos, pero al refrescarse
[también desapareció del escritorio visible](screenshots/candidate-0.3.6-desktop-unchecked-cleared.jpg).

### Candidato limpio: instalación y reparación completadas (23 de septiembre)

Se instaló en una sesión nueva de Windows Sandbox el build limpio 0.3.6 (SHA-256
`b92ffc4b81b80b2df0103a21f99df9d692ead2ca53fe1d99d0f3e39147a2602e`, construido desde `89a7614`).
Las páginas de [licencia](screenshots/candidate-0.3.6-clean-install-license.jpg),
[opciones por usuario](screenshots/candidate-0.3.6-clean-install-options.jpg) y
[destino](screenshots/candidate-0.3.6-clean-install-location.jpg) mostraron encabezados y controles estándar
en español. El texto legal MIT permanece en inglés y el aviso de datos propio, en español. En la página
personalizada la casilla apareció [marcada por defecto](screenshots/candidate-0.3.6-clean-desktop-checked.jpg);
con el foco de teclado sobre la casilla, Espacio la desmarcó y volvió a marcarla. Se instaló con ella marcada.

Finish mostró el control estándar [«Ejecutar Project Engineering OS» marcado](screenshots/candidate-0.3.6-clean-finish-checked.jpg).
Al pulsar Terminar, la [aplicación se abrió y presentó su inicio en español](screenshots/candidate-0.3.6-clean-opened-app.jpg).
El Explorador confirmó en la carpeta Desktop el archivo `Project Engineering OS`, tipo Acceso directo;
la [captura de disco](screenshots/candidate-0.3.6-clean-desktop-shortcut-disk.jpg) conserva esa verificación.

Después se abrió el mismo instalador limpio con 0.3.6 ya instalado. Reconoció la versión y presentó el
[diálogo de reparación/desinstalación/cancelación](screenshots/candidate-0.3.6-repair-choice-spanish.jpg):
el mensaje es español; los botones Sí/No/Cancelar son controles nativos que Windows Sandbox, configurado en
inglés, muestra en inglés. Se eligió Sí, se recorrieron las páginas de acuerdo, instalación por usuario,
destino y [acceso directo marcado](screenshots/candidate-0.3.6-clean-desktop-checked.jpg), y Repair terminó.
Finish volvió a abrir la app; la [pantalla inicial quedó operativa](screenshots/candidate-0.3.6-repair-opened-app.jpg).
El Explorador confirmó que el [acceso directo persiste tras Repair](screenshots/candidate-0.3.6-repair-desktop-shortcut-preserved.jpg).

Las ramas de rechazo de la casilla del escritorio y Finish, incluida la comprobación en disco de que el enlace
desaparece, constan en la sección de actualización 0.3.5 → 0.3.6 de arriba. El arnés automatizado contiene
comprobaciones para instalación silenciosa, actualización y preservación de sentinelas, pero no se ejecutó
contra este candidato desde el workflow de release protegido. La CI del PR solo valida sus checks declarados;
no se presenta como prueba de ese arnés. La desinstalación manual del Sandbox aún espera autorización específica.
Este build limpio tampoco procede de un tag protegido: una reconstrucción de release tendrá otra identidad y
requerirá una nueva comprobación de hash.
