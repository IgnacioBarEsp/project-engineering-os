## MODIFIED Requirements

### Requirement: Las capturas declaran procedencia y alcance
Cada captura de producto SHALL proceder de una ejecución real, declarar fuente, fecha, commit o versión
y entorno. SHALL conservar alt text útil y texto Markdown para información esencial, sin datos privados.
Cada imagen publicada como captura del producto SHALL tener junto a ella un registro de procedencia legible
por máquina con commit, versión de la aplicación, motor, viewport, generador, fecha y SHA-256. Una
comprobación automática de la documentación SHALL rechazar la imagen si ese registro falta, si no coincide
con sus bytes o si contiene una ruta de usuario.

#### Scenario: El renderer actual se prueba en un navegador
- **WHEN** la captura usa el renderer real con transporte nativo sustituido para pruebas
- **THEN** su pie y registro dicen que es verificación en navegador y no prueba del instalador
- **AND** una captura de la landing final espera a que exista esa página terminada

#### Scenario: La captura se toma de la ventana real de la aplicación
- **WHEN** la captura se genera con la aplicación en Electron, desde el código o empaquetada
- **THEN** su pie y su registro dicen qué se ejecutó, en qué commit y versión, y que no es una captura del instalador
- **AND** la imagen muestra la ventana tal como la renderiza esa versión, con sus defectos conocidos y sin retoques

#### Scenario: Una imagen publicada no tiene procedencia válida
- **WHEN** una imagen bajo `docs/assets/companion` o `docs/assets/companion-current-home.png` carece de registro, su SHA-256 difiere del registrado o el registro contiene una ruta de usuario
- **THEN** la comprobación de documentación falla y nombra la imagen y la causa

## ADDED Requirements

### Requirement: Un prototipo de diseño nunca se presenta como el producto
Los prototipos de diseño SHALL estar rotulados como prototipo en el lugar donde se guardan. Ninguna imagen
publicada como captura del producto SHALL ser idéntica, byte a byte, a una imagen de un prototipo.

#### Scenario: Se publica un mock como captura
- **WHEN** una imagen publicada como captura del producto tiene el mismo SHA-256 que una imagen de `docs/stitch uxui/`
- **THEN** la comprobación de documentación falla y nombra las dos imágenes

#### Scenario: Una persona abre la carpeta de prototipos
- **WHEN** abre `docs/stitch uxui/`
- **THEN** encuentra un README que dice que son prototipos de diseño y no capturas del producto
- **AND** ese README enlaza la galería de capturas reales
