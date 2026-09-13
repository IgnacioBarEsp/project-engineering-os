# Revisión adversarial independiente

Conducida por una sesión que **no** implementó este cambio, con un playbook local prestado. Veredicto:
**FAIL — 1 blocker y 6 majors**, más 10 minors y 2 preguntas.

La revisión hizo algo que merece decirse primero: **comprobó por su cuenta las dos afirmaciones centrales**
contra las instalaciones reales, extrayendo el paquete de Claude y localizando la declaración en el byte
7 457 548 —`JIn(e,t){return \`${e}//code/new?folder=${encodeURIComponent(t)}\`}`, invocada tras comprobar
`statKind(...)==='dir'`— y confirmando que el paquete de OpenCode contiene `opencode://` exactamente dos veces
y cero ocurrencias de `folder=`, `?cwd=`, `?path=` o `?directory=`. También probó once nombres de carpeta
hostiles contra el constructor de la URL. Su conclusión sobre la investigación:

> La investigación en sí es correcta y está bien respaldada: verifiqué por mi cuenta las dos conclusiones y
> ambas se sostienen contra la instalación real, sin suposición ni documentación.

Y su conclusión sobre el cambio:

> Pero el cambio **no es integrable como está**.

Tenía razón en las dos cosas.

---

## Blocker

### La pantalla decía algo falso sobre una aplicación correctamente firmada

El diálogo mostraba, para cualquier aplicación que no se abre: «está instalado en este equipo, pero **no se
pudo comprobar su firma o quién lo publica**». La firma de OpenCode **sí** verifica —`Anomaly Innovations,
Inc`— y su rechazo es `APP_UNSUPPORTED`, no `APP_UNTRUSTED`. La frase era cierta por accidente con Antigravity,
cuya firma sí falla aquí, y se volvió falsa en cuanto este cambio añadió una aplicación rechazada por otra
razón. Incumplía el criterio del issue («se dice si su editor verifica»), la spec de este mismo cambio y el
design, que afirmaba que las dos causas se mantienen separadas en pantalla.

**Resuelto.** El rechazo lleva ahora el editor y si se verificó, el servicio los transporta, y la pantalla
tiene una frase por causa: «su editor sí se pudo comprobar (Anomaly Innovations, Inc), pero no se abre desde
aquí» frente a «no se pudo comprobar su firma o quién lo publica». Medido contra las tres instalaciones:
Claude verificada, OpenCode `publisherVerified: true`, Antigravity `false`.

---

## Majors

| Hallazgo | Qué se hizo |
| --- | --- |
| **Tres de las seis comprobaciones sobrevivían a la mutación**: los bytes iguales, el guardia de vínculos, y —la peor— la aguja de la declaración debilitada de `code/new?folder=` a `code`, porque **todas las pruebas inyectaban `declaration`** y el lector real nunca se ejecutaba | Resueltas: dos pruebas nuevas construyen paquetes reales y ejercitan el lector de verdad, incluida la aguja **partida en el límite de un mebibyte** —que es lo que hace falta para que el acarreo entre trozos importe—, un paquete ausente, un directorio en su lugar, bytes que cambian entre las dos lecturas y un enlace duro |
| **El arnés convertía en éxito cualquier lanzamiento que no hizo nada** si la aplicación ya estaba abierta, contaba una caída (`after < before`) como entrega, y relajaba la regla para **todas** las aplicaciones | Resuelto: la relajación aplica solo a una aplicación cuyo contrato es una dirección, exige `after === before`, y menos procesos que antes es un hallazgo |
| **El registro afirmaba una entrega que no midió**: «la instrucción se entregó a la instancia que ya estaba abierta» cuando lo único observado fue un conteo que no cambió | Resuelto: dice lo que observó — que no apareció ni desapareció ningún proceso, que es lo esperable — y que si la instancia la recibió no se observó. La revisión encontró además que el propio log de Claude registra un `second-instance` en el instante exacto de la corrida y **corrobora** que el argv llegó; eso queda como observación suya, no como algo que este arnés mida |
| **El impacto documental declarado no se entregó**, y `ENVIRONMENT.md` quedaba falso: decía que la carpeta va «as a literal argument» y listaba solo tres aplicaciones | Resuelto: `SECURITY.md` gana una sección con las seis comprobaciones y `ENVIRONMENT.md` distingue las dos formas de contrato y las dos razones de rechazo |
| **Dos de las seis comprobaciones viven en rutas que la propia cuenta puede escribir** y no están ancladas a ninguna firma: `resources/app.asar` no lo cubre el Authenticode del ejecutable, y `HKCU` es del usuario. El design las presentaba al mismo nivel que las otras cuatro | Resuelto diciéndolo: una sección propia en `design.md` y el mismo párrafo en `SECURITY.md`. Quien pueda escribir ahí ya corre como esa persona y lo que lograría es abrir la aplicación legítima con la carpeta de esa misma persona. Existen para distinguir un contrato observado de un argumento inventado, no para detener a quien ya está dentro |
| **Tareas de cierre marcadas sin estarlo** y sin evaluación de deuda | Resuelto: la evaluación existe y las tareas de cierre se marcan cuando ocurren |

---

## Minors

| Hallazgo | Qué se hizo |
| --- | --- |
| El lector de la declaración no fallaba cerrado: un paquete ausente llegaba a la pantalla como `ENOENT` **con una ruta absoluta y el nombre de cuenta dentro** | Resuelto: falla cerrado, y una prueba comprueba que ninguna ruta absoluta llega al mensaje |
| Las versiones se ordenaban por su nombre: `app-1.9.0` quedaba por encima de `app-1.52386.3` | Resuelto: se ordenan por sus números |
| El tope acotaba bytes pero no tiempo | Resuelto: quince segundos |
| «47 MB» publicado cuatro veces; el paquete mide **36,1 MiB** y la ruta está en el byte 7 457 548, no «cerca del principio» | Resuelto en los cuatro lugares. Los 11 ms sí se sostienen |
| La prueba fijaba el valor de `folder` pero no que fuera el **único** parámetro | Resuelto |
| `refused ??= error` conservaba el primer rechazo, no el más informativo | Resuelto: gana el más específico |
| Un solo mensaje para dos causas distintas | Resuelto, y es la mitad del blocker |
| Un directorio `apps/companion/openspec/` huérfano, creado desde el directorio equivocado | Borrado |
| La rama «no medido» del arnés es inalcanzable hoy | **Se conserva a propósito**: es el guardia para una aplicación futura sin entrada en el mapa de nombres, y el día que falte, `null` no volverá a leerse como cero |
| El paquete de Claude declara además una CLI, `Usage: ccd [--] [path]`, bajo un nombre que no está en el PATH ni instalado junto al ejecutable | Registrado en `design.md`: la frase «no responde a ninguna ayuda» se acota a `claude.exe`, que es lo que este producto ejecutaría |

## Preguntas

- **La aplicación se lanza con un entorno recortado sin `PATH`.** Con Claude ya abierta da igual; en frío, su
  propio utillaje podría fallar. El registro de deuda ya lo tiene como `debt-9e0738544eb1` para los editores.
  **Sin verificar, con su causa**: comprobarlo exige abrir una aplicación en el equipo de una persona.
- **Que la ventana de Claude muestre esa carpeta.** Sin verificar: necesita que alguien lo mire.

## Dónde la revisión buscó y no encontró nada

Inyección por la URL (once nombres hostiles, todos con un solo parámetro y round-trip exacto, `shell:false`);
alguna vía para abrir OpenCode (ninguna: `check()` lo rechaza y `open()` siempre llama a `check()`); que algo
no se relea en `open()` (se relee todo); y secretos, rutas absolutas o nombres de cuenta en lo versionado,
incluidas las ocho capturas, que abrió una por una.
