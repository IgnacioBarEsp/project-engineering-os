# Binarios que el empaquetado descarga

Empaquetar el instalador necesita, además de las dependencias del lockfile, algunos binarios que
`electron-builder` obtiene en tiempo de construcción. No están en el lockfile, así que su identidad se
registra aquí y una prueba comprueba que el empaquetador fijado sigue pidiendo exactamente estos bytes.
Si una actualización del empaquetador cambia cualquiera de estos valores, la prueba falla y el cambio
exige una revisión nueva en vez de descargarse en silencio.

Se descargan desde `https://github.com/electron-userland/electron-builder-binaries` y se comprueban
contra estos SHA-256 antes de usarse. Ninguno se ejecuta con privilegios elevados y ninguno entra al
artefacto publicado: solo participan en construirlo.

| Binario | Bytes | SHA-256 | Para qué |
| --- | --- | --- | --- |
| `nsis-3.0.4.1.7z` | 1287512 | `9877df902530f96357d13a7a31ae2b9df67f48b11ffc9a1700a7c961574ec5fa` | Compilar el instalador NSIS |
| `nsis-resources-3.4.1.7z` | 730800 | `593a9a92ef958321293ac6a2ee61e64bf1bd543142a5bd6b3d310709cc924103` | Recursos y plugins del instalador |
| `7zip-win-x64.tar.gz` | 491982 | `be071f15bd6da2f78fe81c6ddef2009b0c4d8a51f36b780cb806c7e6df95e1b3` | Comprimir la carga del instalador |

## Licencias

El repositorio que los aloja es MIT, pero eso es la licencia del repositorio de redistribución, no la de
cada programa. Las licencias reales de lo que se descarga son:

- NSIS: licencia zlib/libpng para el programa, con componentes bajo Common Public License. El instalador
  producido incorpora el stub y los plugins de NSIS, cuyos avisos acompañan a esa distribución.
- Recursos y plugins de NSIS: sus propias licencias, mayoritariamente zlib/libpng, según cada plugin.
- 7-Zip: LGPL-2.1 o posterior, con la restricción adicional del código de unRAR. Aquí solo se usa para
  comprimir durante la construcción; su ejecutable no se publica.

El runtime de Electron se descarga por separado desde el proyecto Electron con su propio checksum
publicado, mediante `@electron/get`, y sí se instala: su aviso viaja como `LICENSE.electron.txt` y los
de Chromium como `LICENSES.chromium.html`.

No se descarga ni se usa ninguna herramienta de firma con certificado: el artefacto no se firma.

## Qué no está fijado

`electron-builder` admite seleccionar otro conjunto de binarios mediante la opción `toolsets`. Este
proyecto no la define, de modo que se usa la ruta heredada comprobada arriba. Añadirla cambiaría los
binarios descargados, así que la configuración se comprueba en las pruebas junto con estos checksums.
