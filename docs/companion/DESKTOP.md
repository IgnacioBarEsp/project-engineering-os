# Companion: la app de escritorio

Companion prepara la carpeta de un proyecto y ayuda a continuar con la IA que ya usas. Tiene su propio
paquete y ciclo de publicación, separados del núcleo. Para empezar, sigue la [guía visual](../USER_GUIDE.md).

**Alcance de esta página:** código integrado hasta `0c632a3`, revisado el 14 de septiembre de 2026.
La descarga pública sigue en 0.1.0 y aún no incluye todas estas mejoras.
[Estado por versión](../PROJECT_STATUS.md) · [capturas actuales](SCREENSHOTS.md).

## Qué puedes hacer en el código actual

- Preparar investigación, software, Unity, contenido o trabajo general con objetivo y experiencia propios.
- Elegir carpeta en Windows y revisar los planes de preparación, lectura y desarrollo antes de aplicarlos.
- Buscar fuentes con línea, página PDF o párrafo DOCX; ver exclusiones y formatos que no pudieron leerse.
- Consultar recetas según el perfil, revisar instrucciones y copiar contexto acotado para tu IA.
- Volver a **Inicio**, **Tus proyectos**, **Preparar proyecto** o **Ayuda**, con nombres consistentes.
- Ver el resultado de la última comprobación y cuándo necesita repetirse; la lista no revalida todas las herramientas.
- Detectar aplicaciones de escritorio compatibles y ofrecer la apertura según su capacidad comprobada.
  El chat web conserva la ruta de copiar contexto; abrirlo no adjunta la carpeta.
- Preparar herramientas administradas y, cuando corresponde, revisar tecnologías opcionales.
  Rechazarlas no vuelve incompleta una preparación que ya estaba lista.
- Elegir si las instrucciones usan plantillas o redacción opcional con un modelo. La lista de modelos
  se consulta mediante una acción explícita; mirar la pantalla no llama al proveedor.

Los presupuestos de contexto se expresan como bytes cuando no hay tokens medidos.
Los PDF escaneados necesitan OCR; los formatos o partes no leídos se explican.
Consulta [contexto](CONTEXT.md), [entorno](ENVIRONMENT.md) y [experiencia](EXPERIENCE.md).

## Tus datos y la recuperación

La app guarda un historial acotado en su directorio de datos. La configuración, índices y registros de
recuperación del proyecto permanecen en la carpeta elegida. Los índices contienen fragmentos de fuentes;
los registros pueden conservar versiones anteriores de archivos propios de la app. Protégelos como parte
del proyecto. Quitar un proyecto de la lista no elimina sus archivos.

La preparación básica no necesita cuenta ni telemetría ni sube las fuentes automáticamente. Si eliges
redacción con proveedor, se muestra qué respuestas y datos agregados se compartirán. La clave es tuya
y no se guarda. La [guía de privacidad](SECURITY.md) conserva el contrato completo.

Una operación interrumpida puede continuarse o revertirse tras comparar hashes. Los cambios tuyos
posteriores se preservan y pueden impedir la recuperación automática. La adopción de archivos existentes
ya se implementó en el núcleo 0.5.0: [qué puede conservarse y cómo](../EXISTING_PROJECTS.md).

## Frontera técnica

La interfaz carga recursos empaquetados mediante un protocolo local y una política restrictiva.
No tiene integración Node, shell ni API IPC arbitraria. El proceso principal valida emisor y payload;
los proyectos proceden del diálogo nativo o historial validado. El texto de las fuentes se presenta
como texto. Las vistas previas de exportación dejan de ser válidas cuando cambia su preparación.

El motor neutral se importa como dependencia fijada. Las herramientas se administran en ubicaciones
propias sin modificar dependencias del producto ni PATH global.
[Arquitectura](ARCHITECTURE.md) · [mapa de piezas](../REPOSITORY_MAP.md).

## Si contribuyes a la app

Usa Node 24.18.0 o superior y el cliente npm revisado en la
[política de instalación](../INSTALL_HARDENING.md). Desde la raíz:

```sh
npm ci --prefix apps/companion --ignore-scripts
npm run runtime:install --prefix apps/companion
npm start --prefix apps/companion
npm test --prefix apps/companion
```

La instalación del runtime de Electron es una descarga explícita comprobada por SHA-256.
Los scripts de instalación de dependencias permanecen deshabilitados.
Para verificar en navegador:

```sh
node apps/companion/node_modules/playwright/cli.js install chromium
npm run test:ui --prefix apps/companion -- /ruta/a/evidencia
```

En Windows, la prueba usa Edge instalado. En CI Linux usa Chromium. Ejecuta la interfaz y motores reales
sobre un fixture temporal, con diálogo, portapapeles, apertura externa y transporte sustituidos por
dobles de prueba. **No demuestra instalación ni aislamiento Electron.**
Los recorridos nativos y el instalador tienen su [verificación separada](INSTALLER.md).

## Entrega

#79 implementó la app; #80 su instalador; #87 la activación y #94 la aceptación de la primera entrega.
Las mejoras #97–#107 se reúnen para la [siguiente release #117](https://github.com/IgnacioBarEsp/project-engineering-os/issues/117).
El cierre histórico del programa no demuestra compatibilidad universal, firma de editor o ahorro comercial.
[Resultados medidos](EVIDENCE.md) · [decisión de inferencia](HOSTED_INFERENCE.md).
