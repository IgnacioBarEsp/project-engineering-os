## Context

La configuración actual de `electron-builder` fija una instalación NSIS asistida, por usuario y sin
elevación, pero declara `createDesktopShortcut: true` y `runAfterFinish: false`. Esto fuerza el enlace de
escritorio y suprime la casilla final de apertura. El include local ya contiene los macros de inicialización
y desinstalación, por lo que puede añadir comportamiento sin sustituir el script mantenido por
electron-builder.

La versión fijada de electron-builder es 26.15.3. Su interfaz documenta que `runAfterFinish: false` elimina
la casilla del final y que, si no se declara `language`, NSIS usa LCID 1033. Sus plantillas 26.15.3 ofrecen
los hooks `customPageAfterChangeDir` y `customInstall`; las páginas no se ejecutan bajo `/S`. El verificador
de release ya se niega a ejecutarse fuera de GitHub Actions o una VM Windows desechable declarada, pero hoy
solo comprueba directorio, actualización y desinstalación, no el enlace.

Véase [proposal.md](proposal.md) para la motivación y
[el baseline del issue #168](https://github.com/IgnacioBarEsp/project-engineering-os/issues/168) para el
alcance aceptado.

## Goals / Non-Goals

**Goals:**

- Ofrecer una decisión de escritorio clara, marcada por defecto y aplicable sin interacción en `/S`.
- Hacer visible la apertura posterior a la instalación como elección estándar, no como lanzamiento
  forzado.
- Mantener todas las páginas estándar del instalador y los mensajes propios en español.
- Demostrar la semántica de archivos con automatización y la experiencia asistida con una observación real
  de Windows, sin exponer una estación de trabajo normal.

**Non-Goals:**

- No añadir firma, elevación, telemetría, autoactualización, selector de idiomas, otras plataformas ni una
  dependencia de NSIS.
- No cambiar la detección de versión, la carpeta por usuario, el menú Inicio, la propiedad de datos ni la
  versión o publicación de Companion.
- No inferir la interacción humana a partir de `/S` ni automatizar una instalación en el escritorio del
  mantenedor.

## Decisions

### 1. La elección de escritorio pertenece al include local, no a una plantilla bifurcada

La configuración desactivará la creación incondicional que proporciona electron-builder y el include local
insertará una página pequeña después de elegir directorio. La casilla «Crear acceso directo en el
escritorio» se inicializará marcada. Su estado se conservará hasta `customInstall`: marcado crea el enlace
con la identidad generada del paquete; desmarcado no lo crea y retira solamente un enlace previo que sea
propiedad del producto. El macro de desinstalación eliminará ese mismo enlace, además de su limpieza de
cache existente.

El estado por defecto se inicializará antes de las páginas para que `/S`, que no las muestra, conserve el
enlace. La elección se reevaluará en reparación o actualización: desmarcarla no conserva un enlace previo
del producto, y marcarla lo crea o conserva. Menú Inicio, directorio de programa, registro y rutas de datos
siguen con el comportamiento existente.

Se descarta dejar `createDesktopShortcut: true`: el script de electron-builder crea el enlace antes del
hook posterior y no entrega una elección asistida. También se descarta copiar o bifurcar la plantilla
completa de electron-builder: perdería sus correcciones y ampliaría indebidamente la superficie que debe
mantenerse.

### 2. La casilla de apertura usará el control estándar de Finish

`runAfterFinish` se habilitará para recuperar la casilla estándar del final, inicialmente marcada. Una
persona puede desmarcarla; el cambio no lanzará la aplicación antes de completar la instalación ni hará que
`/S` la abra. La plantilla de la versión fijada sólo lanza una instalación asistida desde el control Finish;
el flujo silencioso mantiene su comportamiento salvo una petición explícita de force-run.

Se descarta un `Exec` propio porque duplicaría el ciclo de vida, podría abrir la aplicación aunque se
desmarque la opción y mezclaría el comportamiento interactivo con la automatización de publicación.

### 3. Español fijo y comprobado en un instalador real

La configuración declarará el LCID español `"1034"` y no añadirá un selector de idioma. Los mensajes
personalizados existentes, la licencia y la guía permanecerán en español. Antes de cambiar esa
configuración, el apply capturará en Windows desechable el baseline del instalador actual: versión,
plataforma, páginas estándar, texto del final y los diálogos contextuales. Después se comparará el
artefacto candidato para confirmar que no mezcla controles estándar en inglés con el contenido propio.

Se descarta depender de detección automática del idioma del sistema: el producto, sus mensajes propios y
su documentación ya usan español, y un resultado dependiente del perfil no cumple una experiencia
consistente. La observación del baseline evita afirmar el detalle de UI sólo a partir de la configuración.

### 4. Dos clases de evidencia, declaradas sin confundirse

Las pruebas estáticas comprobarán la configuración, el valor por defecto y los macros de propiedad. El
verificador de release localizará el escritorio del usuario desechable, comprobará que `/S` deja el enlace
por defecto tras instalar/actualizar y que el desinstalador lo retira; guardará modo, rutas y resultados en
su evidencia. Su guardia actual de VM/GitHub Actions se conserva, aunque el enlace esté fuera del root
temporal.

Una ejecución asistida real comprobará las dos ramas de la casilla de escritorio, las dos ramas de la
casilla Finish, la localización de las páginas y la ausencia de restos tras desinstalar. El registro
nombrará máquina/VM, versión, modo y límites. Ningún resultado silencioso se etiquetará como observación
humana.

## Risks / Trade-offs

- Una página NSIS propia puede no persistir el estado al cambiar de atrás/adelante → inicializar un valor
  explícito, leer el control al salir y cubrir ambas ramas en un instalador real.
- El cambio de `createDesktopShortcut` puede dejar un enlace de una versión anterior → la ruta de actualización
  y el opt-out se prueban antes de aceptar el candidato; el desinstalador elimina sólo el nombre de enlace
  que el producto creó.
- El enlace de escritorio no está dentro del root temporal → se mide sólo en runner GitHub o VM declarada
  desechable y se mantiene la negativa a usar una estación ordinaria.
- Configurar un LCID no demuestra por sí solo los textos → registrar baseline y captura/inspección de las
  páginas construidas antes de declarar conformidad.
- Abrir al terminar puede confundirse con lanzar bajo `/S` → usar el control Finish mantenido por el
  empaquetador y conservar una aserción explícita de no interacción humana en el verificador silencioso.

## Migration Plan

No hay migración de datos. Una instalación nueva adopta el valor por defecto marcado; una reparación o
actualización presenta de nuevo la elección y retira el enlace propio si la persona lo desmarca. El rollback
es revertir el PR antes de publicar una nueva versión; un artefacto ya publicado permanece inmutable y una
corrección posterior requiere otra identidad de release. Desinstalar sigue preservando proyectos, historial
y runtimes.
