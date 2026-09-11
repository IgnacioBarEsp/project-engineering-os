# Instalar Companion en Windows

Companion se distribuye como un instalador de Windows x64 para que una persona pueda usarlo sin
preparar Node ni abrir una terminal. Esta página describe qué instala, qué no toca y cómo quitarlo.

**Úsala si:** vas a instalar, actualizar o desinstalar la aplicación, o necesitas comprobar que el
archivo que descargaste es el que se publicó.

## Antes de instalar

El artefacto **no está firmado** con un certificado de editor. Windows mostrará una advertencia de
SmartScreen al ejecutarlo. Esa advertencia es correcta: la app es de un editor que Windows no puede
verificar. No la evites ni la desactives. Lo que sí puedes hacer es comprobar que el archivo es el
publicado, comparando su SHA-256 con el que acompaña a la descarga:

```powershell
Get-FileHash -Algorithm SHA256 .\ProjectEngineeringOS-Setup-0.1.0-x64.exe
```

Si el valor no coincide con el publicado, no lo instales.

## Qué hace el instalador

El asistente muestra la licencia y el aviso de datos, te deja elegir la carpeta de destino y crea
accesos directos en el escritorio y en el menú inicio. La instalación es **por usuario**: no pide
administrador y no modifica el equipo para otras cuentas.

| Ubicación | Qué contiene | Quién la escribe |
| --- | --- | --- |
| `%LOCALAPPDATA%\Programs\Project Engineering OS` | El programa | El instalador |
| `%APPDATA%\Project Engineering OS` | Tu historial local de proyectos | La aplicación |
| `%LOCALAPPDATA%\Project Engineering OS\runtimes` | Las herramientas que decidas descargar | La aplicación, solo cuando lo autorizas |
| La carpeta que elijas | Tu proyecto, su contexto y sus registros de recuperación | La aplicación, según el plan que revises |

## Actualizar y desinstalar

Instalar una versión nueva reemplaza el programa y conserva todo lo demás. Desinstalar quita el
programa, sus accesos directos y la copia del instalador que el empaquetado guarda en tu carpeta local
para actualizaciones diferenciales, que esta aplicación no usa. **No borra** tus proyectos, tu historial
ni las herramientas descargadas: esas rutas no le pertenecen al instalador.

El asistente rechaza como destino una carpeta que ya contenga archivos tuyos y cuyo nombre incluya el
del producto, porque en ese caso no se añadiría una subcarpeta y la desinstalación borraría esa carpeta
entera. Elige una carpeta vacía o deja la que propone.

Si además quieres liberar el espacio de las herramientas descargadas, borra
`%LOCALAPPDATA%\Project Engineering OS\runtimes` a mano. Ten en cuenta que hacerlo deja sin
poder ejecutarse las entradas locales que Companion dejó en tus proyectos, y sin poder verificarse
los mapas de código, hasta que los vuelvas a preparar. Consulta
[la activación del entorno](ENVIRONMENT.md) para el detalle.

Tus proyectos nunca dependen de que la aplicación siga instalada para conservar sus archivos.

## Qué contiene el artefacto

El empaquetado usa una lista explícita de lo permitido, no una lista de exclusiones: solo entran el
código de la aplicación, sus dependencias de ejecución y sus avisos de licencia. Antes de publicar,
una verificación lee el artefacto producido y falla si aparece una ruta no permitida, una dependencia
de desarrollo, un documento, un vínculo, una licencia faltante o un núcleo distinto del fijado. Esa
verificación también lee la firma del propio ejecutable en vez de confiar en lo que declare el
manifiesto.

La aplicación se empaqueta sin archivar en `asar` a propósito: copia parte de su propio código dentro
del proyecto que preparas y lo ejecuta con el Node administrado, que no puede leer un archivo `asar`.

Junto al instalador se publican su SHA-256 y un manifiesto con versión, commit, tamaño, núcleo
fijado, número de paquetes y estado real de firma.

## Comprobación para quien contribuye

Desde `apps/companion`, con Node 24.18.0 o superior y el cliente npm revisado:

```bash
npm ci --ignore-scripts
npm run runtime:install
npm run pack
```

El empaquetado escribe fuera del repositorio y muestra la ruta de salida. Después:

```bash
npm run pack:verify -- <ruta de salida>
```

Empaquetar requiere Windows y descarga el runtime de Electron y tres binarios del empaquetador, cada
uno comprobado contra un SHA-256 fijado por la versión que fija el lockfile. Esas identidades quedan
registradas en `apps/companion/build/BUILD-TOOLS.md`, y una prueba falla si el empaquetador fijado deja
de pedir exactamente esos bytes, de modo que una actualización no los cambia en silencio. Ninguno de
esos binarios entra al artefacto publicado. Por eso CI no construye el artefacto: comprueba el contrato
de empaquetado, y la construcción e instalación reales se registran como evidencia del cambio. Volver a generar el icono, si cambia la identidad visual, es
`node scripts/build-icon.mjs`.

## Límites

Una instalación probada en un equipo no demuestra compatibilidad en otros. No hay firma, canal de
actualización automática, otras plataformas ni publicación en una tienda. El empaquetado es #80; los
recorridos por perfil, la landing y los benchmarks son #81. Vuelve a
[documentación](../README.md) o a [la app de escritorio](DESKTOP.md).
