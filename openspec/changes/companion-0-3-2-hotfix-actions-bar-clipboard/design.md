## Context

Base: `a3b1efda6a53501a2a06e277cf0b7f18f11c6bed`, Companion 0.3.1, núcleo 0.5.0 y OpenSpec local
1.6.0. El issue #142 ya contiene reproducción en navegador y Electron; se reutiliza como evidencia
histórica, sin atribuirla a esta sesión. [Baseline y procedencia](brownfield-baseline.md).

`render()` envuelve el contenido en `.enter`. La regla de barra alcanza tanto `.enter > .actions` como
`form > .actions` y usa `fixed`. También declara 145 px de padding, que nunca se aplica: `main#content`
(especificidad 1,0,1) gana a `main:has(.steps)` (0,1,1) y el medido es 60 px
([antes](evidence/before/README.md)). El scroll actual es el del documento;
`main#content` no tiene un scroll independiente. El paso inicial usa submit real de un formulario.

El proceso principal ya inyecta `clipboard.writeText` al servicio, registra sus métodos por IPC y valida
webContents, mainFrame, URL exacta y tamaño serializado de 64000 bytes. El preload expone una allowlist.
`call()` comprueba `{ok,value/error}`; los dos botones finales eluden `call()` y silencian excepciones.
`copyExport`, `copyGuideStep` y handoff ya tienen validaciones de contexto propias que deben mantenerse.

## Goals / Non-Goals

Objetivo: reparar alcanzabilidad y copia del recorrido existente con un cambio acotado y verificable.
Los límites son los de [proposal.md](proposal.md). No se afirma que este hotfix corrija la semántica de
«proyecto listo» o instale lo que hoy no instala: eso pertenece a #147.

## Decisions

### 1. Barra explícita, fuera de la animación

Introducir una distinción explícita entre la barra final del asistente y las filas `.actions` locales.
El contenedor de contenido de `#view` mantiene `.enter`; la barra final será su hermana posterior, dentro
del flujo normal del mismo scroll del documento, con `position:sticky; bottom:0`. No añadir otro scroller
ni un shell nuevo. El aviso accesible de copia/errores permanece visible y no se elimina para medir el hueco.

Retirar los selectores globales que convierten acciones del formulario en fixed y la regla del padding de
145 px, aunque este nunca se aplicara.
Las acciones de tarjetas de instalación y de copia permanecen locales. Si la barra inicial sale del
formulario, asociar su submit mediante `form` y un ID estable: click, Enter, validación nativa y guardado
de selección deben seguir el mismo handler. No clonar controles ni listeners al moverlos.

Alternativas descartadas: desactivar movimiento ocultaría el defecto; aumentar padding depende de alturas
y zoom; aplicar sticky a todas las `.actions` repetiría superposiciones. Mover la barra exige una pequeña
adaptación del renderer, pero hace explícita su función sin reconstruir las pantallas.

Añadido durante el apply: una barra sticky tapa el fondo de la ventana, y el navegador no lo sabe al llevar
el foco del teclado. `render` mide la barra con un `ResizeObserver` y la publica como
`--wizard-footer-height`, que alimenta `scroll-padding-bottom`. Sin eso, al tabular por el paso 1 quedaban
controles enteros bajo la barra; con eso, ninguno: [experimento](evidence/after/keyboard-scroll-padding.json).
La clase de la barra es `.wizard-footer`, porque `.wizard-bar` ya nombraba las pastillas de progreso.
En ventanas de hasta 500 px de alto o 380 px de ancho la barra queda estática después del contenido, sin
scroll-padding: sticky ocuparía una parte grande de la ventana. Las dos ventanas pequeñas reales caen en ese
caso. Medido en Electron 44 en Windows 11, la ventana por defecto de 1180 × 820 deja un viewport de
1164 × 755 px CSS; con zoom al 200 %, 582 × 377. La mínima, de 480 × 540, deja 464 × 475. El recorrido del
asistente pasa por esos dos viewports y la prueba nativa los mide en la ventana real
([validación](evidence/validation.md)). En las demás ventanas la barra es sticky, y los harness lo exigen.

El contrato permite la superposición temporal propia de sticky en contenido largo solo si cada control
se puede desplazar a una zona visible y pulsar. Con contenido que cabe, la barra debe quedar después del
último contenido. Al final del scroll no habrá reserva de altura de barra ni padding compensatorio;
los márgenes normales y un aviso visible sí cuentan como contenido legítimo.

### 2. Escritura de texto acotada con el envelope existente

API pública: `window.companion.copyText({text})` a través de `call('copyText', {text})`.
El servicio acepta únicamente un objeto con la clave `text`, de tipo string, no vacío ni solo espacios,
sin NUL y de 1 a 32000 bytes UTF-8; acepta Unicode, tabulaciones y saltos de línea. Copia exactamente el
texto, sin trim, truncamiento ni lectura del sistema de archivos. También exige que el objeto serializado
ocupe como máximo 64000 bytes, igual que el transporte actual; el escaping puede alcanzar ese segundo
límite antes que el primero. Ambos límites se comprueban antes de llamar al adaptador.

El helper `text()` actual rechaza saltos de línea y recorta: no sirve para un Prompt Maestro multilínea.
Usar validación específica junto a `exact()`. Resultado tras esperar la escritura:
`{copied:true, bytes:<bytes UTF-8>, sent:false}`, envuelto por el handler IPC común. Error de entrada:
`INPUT_INVALID` con explicación recuperable. Error del adaptador: causa segura y acción para reintentar;
no devolver el payload en diagnósticos ni registrar contenidos del portapapeles.

El preload añade solo `copyText`, nunca lectura de clipboard ni acceso genérico a IPC. Se preservan
los permisos denegados, sandbox, aislamiento, allowlist, CSP y las comprobaciones de emisor del main.
La escritura nativa se espera aunque el adaptador pueda devolver una promesa.

Todos los controles de copiar pasan por operaciones validadas del servicio. Los dos finales usan el
nuevo método. `copyExport`, `copyGuideStep` y handoff mantienen sus handles, límites y comprobaciones de
frescura; no se sustituyen por texto arbitrario enviado desde UI. Se elimina el fallback a
`navigator.clipboard` de los dos botones afectados. `run()`/`error()` muestran los fallos, incluidos
`{ok:false}` y rechazo del transporte; la confirmación visible y accesible aparece solo tras éxito.

Alternativa descartada: conceder `clipboard-sanitized-write` amplía permisos del renderer y rompe el
límite del issue. Copiar desde el proceso principal sigue la
[API oficial](https://www.electronjs.org/docs/latest/api/clipboard); validar el emisor sigue la
[guía de Electron](https://www.electronjs.org/docs/latest/tutorial/security#17-validate-the-sender-of-all-ipc-messages).
La versión ejecutada seguirá siendo la fijada en el lockfile y su prueba nativa será la evidencia decisiva.

### 3. Cobertura enumerada del recorrido actual

La navegación reconoce `setup`, `folder`, `delimitation`, `vision`, `install`, `finished`; retiene los
estados heredados `stack-choice` y `ready`. Los seis estados son pantallas; los pasos numerados 1–4 no
son seis pasos nuevos. Fuera del asistente, «Preparar proyecto» deja de estar seleccionado.

Ampliar `verify-ui.mjs` con un recorrido explícito del asistente vigente, independiente del recorrido
histórico de cinco perfiles. Matriz obligatoria: 1180×820, 1160×810 y 1040×700, cada una con
`no-preference` y `reduce`. Medir cajas, viewport real, scroll y `elementFromPoint` en cada control esperado,
incluidos los dos caminos de instalación y los dos botones finales. Un hijo del botón cuenta únicamente
si `closest('button')` es ese botón. Clicks ordinarios, sin `force`, sin invocar handlers desde evaluate.

Esperar la animación finita de entrada observada, sin desactivar CSS y sin esperar animaciones infinitas
decorativas. Registrar visitas y controles esperados/observados para que cero observaciones nunca sea PASS.
Comprobar click y submit inicial con teclado, último campo, sugerencias de Visión y contenido al fondo.
Conservar los checks existentes de zoom 200 %, mínimo, contraste y movimiento reducido.

Compartir la sonda geométrica acotada entre UI y `verify-interface-contract.mjs`, sin emprender #150.
La mutación en una copia del renderer restaurará la barra bajo `.enter` con el posicionamiento fixed y
la animación originales. Debe fallar por intercepción/geometría en una pantalla visitada. Un timeout,
excepción o ruta ausente es fallo del harness, nunca detección satisfactoria de la mutación.

### 4. Electron real y procedencia

Usar Playwright `_electron` con el main y preload reales, proyecto e historial temporales, y
`clipboard.readText()` evaluado desde el proceso principal. El picker puede recibir la carpeta fixture;
no se sustituye el servicio, IPC ni la escritura/lectura nativa. Probar Copiar ruta y Prompt Maestro por
click, comparar bytes/texto esperados y confirmación. Registrar Electron, SO, commit, ruta del ejecutable
y tamaño interior observado, distinto del tamaño exterior de BrowserWindow. No registrar texto ajeno.

La prueba usa una sesión de escritorio de pruebas y limpia solo recursos de esa sesión; no toca una
instalación personal. El resultado de `electron .` se identifica como fuente ejecutada, separado del
recorrido del instalador candidato en Windows. Una prueba ausente o plataforma omitida queda pendiente.
Casos negativos de servicio y de envelope se pueden medir con adaptadores controlados, identificándolo.

### 5. Identidad y distribución

Tras apply, alinear package/lock y aserciones relevantes de empaquetado con 0.3.2, mantener el núcleo
0.5.0 y escribir notas que enlacen #142. `PROJECT_STATUS.md` distingue 0.3.1 publicada y 0.3.2 candidata.
No cambiar la descarga recomendada hasta verificar assets canónicos del workflow existente.

La decisión de publicar se registra en el cierre, tras evidencia y merge protegido. Si se difiere,
registrar responsable, motivo, versión realmente descargable y defectos conocidos. No tratar esa
alternativa como release exitosa ni como prueba del instalador. La renovación de la galería es #143;
las capturas de prueba de este change se guardan como evidencia con procedencia, sin presentar mocks
como producto real.

### 6. Descubierto al medir: una visión de varias líneas detiene la instalación

Añadida durante el apply, antes de implementarla. El recorrido nuevo pulsa las sugerencias de Visión porque
son el último contenido de esa pantalla. Con movimiento reducido las sugerencias sí se pulsan, y aun así la
pantalla final no llega: la instalación falla con `GOAL_INVALID` y el mensaje «Describe tu objetivo en hasta
500 caracteres. Revisa la carpeta y vuelve a comprobar», aunque el texto no pasa de 500 caracteres. Escribir
un salto de línea a mano produce lo mismo; una visión de una sola línea termina bien. Reproducido en esta
sesión con el renderer y el servicio reales: [reproducción](evidence/before/vision-line-break.json).

Causa: `showVision` copia la visión entera en `goal` (`s.goal = text.slice(0, 500)`). El motor admite saltos
de línea en `vision`, pero rechaza cualquier carácter de control en `goal`. Hoy queda oculto porque la barra
tapa las sugerencias; al corregir la barra, cualquiera que las use llegaría a un callejón sin salida.

Corrección mínima: el objetivo se deriva de la visión como una sola línea: sin marcas de encabezado al
inicio de cada línea, con los espacios colapsados y con 500 caracteres como máximo. La visión conserva sus
párrafos y llega así a `PROJECT_VISION.md`. Se mantiene lo que 0.3.1 ya hacía, que el objetivo siga a la
visión, porque decidir si deben separarse es de #146.

Alternativas descartadas: relajar la validación de `goal` en el motor cambia un contrato que usan el
historial, los prompts y otras pantallas; dejar de sobrescribir `goal` es una decisión de producto de #146.

En la misma pantalla, el editor de visión solo tiene placeholder y ningún nombre accesible, como mide
`ACCESSIBLE_NAMES`. Recibe un `aria-label`, sin cambiar lo que se ve.

### 7. El prompt rápido deja de afirmar dependencias instaladas

Decisión del mantenedor durante el apply ([registro](evidence/maintainer-decisions.md)). El prompt de
«Instalación rápida» decía a la IA que las dependencias base «ya quedaron aprovisionadas localmente»,
aunque ninguna de las dos vías instala nada. Con la copia arreglada, esa frase llegaría a la IA de quien la
use. Se sustituye solo esa frase por una verdadera: la carpeta está preparada y `PROJECT_VISION.md` escrito,
y no se instaló ninguna dependencia. Las tarjetas de instalación y el resto del prompt quedan para #147.

## Risks / Trade-offs

- Separar el submit puede romper Enter o required → cubrir ambos y estado de selección.
- Sticky puede ocultar contenido al desplazarse → medir hit testing tras scroll, geometría y fondo.
- Unicode/escaping puede exceder el envelope → comprobar ambos límites y ausencia de escritura al fallar.
- Pruebas solo en navegador pueden mentir sobre copia → lectura real desde main en Windows.
- Mezclar publicación y código puede producir enlaces inexistentes → candidato y assets verificados separados.
- Bloqueos upstream previos → ejecutar preflight de archive y registrar checks concretos; no arreglar #115/#122 aquí.

## Migration Plan

No hay migración de datos, esquema ni dependencias. La implementación siguió las [tareas](tasks.md) y
el [plan de evidencia](evidence/plan.md), con revisión adversarial y evaluación de deuda antes de archivar.
La publicación viene después del merge, según la decisión del mantenedor.
Rollback: revert del PR, ensayado en fixture ([ensayo](evidence/after/rollback.json)); 0.3.1 sigue
teniendo sus defectos.

## Open Questions

Ninguna. La entrada a implementación consta en [apply-entry](evidence/apply-entry.md) y la decisión de
publicar 0.3.2, en [decisiones](evidence/maintainer-decisions.md). La geometría se ejecutó. Lo que cambió
respecto del diseño inicial entró en esta spec y en este diseño durante el apply: el scroll-padding, la
clase `.wizard-footer`, la barra estática en ventanas pequeñas y las decisiones 6 y 7.
