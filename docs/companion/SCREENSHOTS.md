# Capturas de Companion 0.3.2

Cada imagen de esta página es la ventana real de la aplicación, ejecutada desde el código del commit que se
cita abajo. **No es una captura del instalador.** Junto a cada archivo hay un registro de procedencia
(`<imagen>.png.provenance.json`) con su commit, versión, motor, ventana, fecha y SHA-256, y `npm run check`
falla si una imagen no coincide con su registro o si es idéntica a un [prototipo de diseño](../stitch%20uxui/).

La ventana es la que abre la aplicación por defecto, 1180 × 820, que deja 1164 × 755 px CSS. Cada captura
muestra la pantalla al llegar a ella, con el scroll arriba: lo que queda más abajo, como las sugerencias de
Visión, no aparece.

## 1. Inicio

![Inicio de Companion: titular, dos tarjetas para crear un proyecto nuevo o abrir una carpeta existente, y la barra superior con Inicio, Tus proyectos, Preparar proyecto y Ayuda](../assets/companion/home-companion.png)

Barra superior con los cuatro destinos, la pastilla «Entorno listo» y «Privacidad y alcance». El titular
«Dale a tu IA un buen punto de partida.» y dos tarjetas: «Crear nuevo proyecto», recomendada, y «Abrir carpeta
existente».

## 2. Paso 1: tu proyecto

![Paso 1 del asistente: nombre del proyecto, perfil, objetivo y el tipo de trabajo, con la barra inferior Inicio y Elegir carpeta](../assets/companion/paso-1-perfil.png)

El indicador marca «01 Tu proyecto» de cuatro pasos. Se ven el nombre, «¿Con qué perfil te identificas?» —seis
roles, aquí el que trae por defecto, «Investigador/a»— y «¿Qué quieres lograr?»; el nombre y el objetivo son de
ejemplo. Debajo empieza «¿Qué vas a hacer?», cuyas tarjetas corta el borde inferior: esa elección, y no el rol,
es la que queda como perfil del proyecto. Fuera del encuadre siguen tres grupos más, que la captura no muestra:
la tecnología, la IA con la que vas a trabajar y cuánta guía prefieres. La barra inferior ofrece «Inicio» y
«Elegir carpeta →».

## 3. Paso 2: delimitación

![Delimitación: tarjeta de la carpeta elegida y tarjetas de subtipo de proyecto, con la primera seleccionada](../assets/companion/paso-2-delimitacion.png)

El indicador marca «02 Carpeta», después de elegir la carpeta del proyecto, que aparece en su tarjeta con la
ruta pública que creó esta captura. El subtítulo dice «Elige el subtipo para Investigación para ajustar las
recomendaciones», pero las tarjetas que ofrece son las de software: «Plataforma Web / SaaS», «Página Web o
Landing», «Aplicación Móvil» y, cortada por el borde, «Prototipo o Arquitectura Propia». La primera aparece
marcada sin que nadie la eligiera. No es un recorte de la captura, es un defecto abierto:
[issue #145](https://github.com/IgnacioBarEsp/project-engineering-os/issues/145). La barra inferior ofrece
«Volver» y «Paso 3: Visión y Descripción →».

## 4. Paso 3: visión y descripción

![Paso 3: editor de visión con el objetivo escrito, contador de palabras y la barra inferior con Volver y Paso 4](../assets/companion/paso-3-vision.png)

El indicador marca «03 Preparación». El editor guarda la descripción en `PROJECT_VISION.md`, cuenta las
palabras y admite Markdown. Las sugerencias que ayudan a enriquecer el texto están debajo del editor, fuera de
esta captura.

## 5. Paso 4: instalación

![Paso 4: dos tarjetas, Instalación rápida y Que mi IA se encargue, cada una con su botón](../assets/companion/paso-4-instalacion.png)

El indicador marca «04 Archivos». Las dos tarjetas son las dos formas de terminar. Hoy hacen lo mismo:
guardan las elecciones y escriben `PROJECT_VISION.md`. La tarjeta de «Instalación rápida» dice que instala
dependencias base y ninguna versión lo hace todavía; eso es el
[issue #147](https://github.com/IgnacioBarEsp/project-engineering-os/issues/147).

## 6. Proyecto listo

![Pantalla final: ruta de la carpeta con el botón Copiar ruta, y los dos pasos de activación con el Prompt Maestro](../assets/companion/proyecto-listo-activacion.png)

La pantalla final muestra la carpeta preparada, «Copiar ruta» y el Prompt Maestro para pegar en tu IA. La
carpeta que se ve es la carpeta pública que la captura creó para este recorrido, no una carpeta de la persona
que ejecutó.

## Lo que se ve y está abierto

- **«Carpeta:» pegado a la ruta** en la pantalla final: la política de seguridad de la ventana bloquea los
  estilos en línea que separan esos elementos. Es parte del renderer que rehace el
  [issue #144](https://github.com/IgnacioBarEsp/project-engineering-os/issues/144), y la captura lo muestra tal
  cual.
- **Las dos formas de instalar** hacen lo mismo: [issue #147](https://github.com/IgnacioBarEsp/project-engineering-os/issues/147).
- **Subtipos que no corresponden al perfil** en el paso 2: con el perfil «Investigación», la pantalla pide
  elegir «el subtipo para Investigación» y ofrece los de software, con el primero ya marcado. Es lo que rehace
  el [issue #145](https://github.com/IgnacioBarEsp/project-engineering-os/issues/145), y la captura lo muestra
  tal cual.

## Procedencia

| Dato | Valor |
| --- | --- |
| Fuente | [Commit 766d671](https://github.com/IgnacioBarEsp/project-engineering-os/tree/766d671e880156638e0e68e70479ed59b3db04f6) |
| Versión de la aplicación | 0.3.2 |
| Entorno | Ventana real de la aplicación en Windows 11, ejecutada desde el código con `electron .` |
| Motor | Electron 44.1.1, Chromium 152.0.7977.65 |
| Ventana | 1180 × 820 exterior; 1164 × 755 px CSS, `devicePixelRatio` 1 |
| Ejecución UTC | 2026-09-19T19:55:20.856Z |
| Generador | `apps/companion/scripts/capture-screenshots.mjs` |
| Sustituido | El selector de carpetas del sistema, que un script no puede manejar, y los datos de usuario, aislados en un directorio temporal |

| Imagen | SHA-256 | Bytes |
| --- | --- | --- |
| [`docs/assets/companion/home-companion.png`](../assets/companion/home-companion.png) | `6561a1481139d03fc5ca51427c15fac682789881b38c7d69d293a34affb2e6d2` | 94 993 |
| [`docs/assets/companion-current-home.png`](../assets/companion-current-home.png) | `d32afe9859edeba69fcdc37662b275eb4adab22c12425e07ab088ed406ae16f2` | 94 973 |
| [`docs/assets/companion/paso-1-perfil.png`](../assets/companion/paso-1-perfil.png) | `890c2ffdd07a91786e40d97833f15e0af6bbb5484fc717fa2c07da5376ac8af2` | 78 254 |
| [`docs/assets/companion/paso-2-delimitacion.png`](../assets/companion/paso-2-delimitacion.png) | `55ca30ad8f14aa67676bdc4844e6a36906be9012dc8d65081197171b03eaec28` | 91 297 |
| [`docs/assets/companion/paso-3-vision.png`](../assets/companion/paso-3-vision.png) | `6b545d29d831e96b2dd4e587f82502ae4bef40572f89411a48c7fbf1296e4b9f` | 76 964 |
| [`docs/assets/companion/paso-4-instalacion.png`](../assets/companion/paso-4-instalacion.png) | `178a1d22c55bad815e5d9cf363f13035c8edcbf4138c8da724314d15716c696e` | 118 915 |
| [`docs/assets/companion/proyecto-listo-activacion.png`](../assets/companion/proyecto-listo-activacion.png) | `c4f3df32a481fd5e2c218164323bdaf9bbfc7072f66c010b43df4e2b7a1847c4` | 84 882 |

Las capturas de Inicio son dos ejecuciones del mismo momento del recorrido: una para esta galería y otra para
el README. Difieren en bytes, no en contenido.

Ninguna imagen contiene datos personales ni proyectos privados. El recorrido usa un proyecto de ejemplo en una
carpeta pública que se borra al terminar.
