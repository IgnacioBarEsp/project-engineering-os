# TLDR

Issue [#100](https://github.com/IgnacioBarEsp/project-engineering-os/issues/100).

Dos cosas distintas, reportadas juntas porque a la persona le pasaron juntas: **la aplicación ignoraba una
elección explícita**, y **instalaba lo mismo para todo el mundo**.

## La primera es un defecto, y estaba en el camino declarado

El mantenedor eligió versiones de escritorio de su IA y los botones lo mandaron a la web de esos productos. No
era una rama olvidada:

```js
// antes
return {…, mode: local ? 'local' : 'web'};     // `local` = ¿hay aplicación verificada?
else { await openExternal(DESTINATIONS[preview.agent]); … }
```

`DESTINATIONS` guardaba **una URL web por cada aplicación de escritorio**, y la pantalla lo prometía en voz
alta: «Se abrirá … en tu navegador». La elección de la persona no entraba en la decisión en ningún punto. Y la
sustitución es peor de lo que parece: quien elige una IA de escritorio la elige porque **lee archivos**; un chat
web no es una versión reducida de eso.

**Ahora el modo sale de lo que la persona eligió, y lo instalado solo puede degradarlo:**

| Eligió | Lo que hay | Qué pasa |
| --- | --- | --- |
| aplicación de escritorio | contrato observado y las seis comprobaciones de #106 pasan | se abre con la carpeta |
| aplicación de escritorio | cualquier otra cosa | **no se abre nada**, se copia la instrucción y se dice la causa |
| chat web | — | se abre el chat y se copia la instrucción |

Y las seis URL web **ya no existen**: la aplicación guarda una sola dirección, la del chat que alguien puede
elegir. Devolver la sustitución exige volver a escribir una URL, no borrar un `if`.

Ocho causas, una por comprobación que puede fallar, porque son hechos distintos: no se encontró; **no se pudo
buscar**, que no es lo mismo; la firma no verifica; falta la aplicación de escritorio aunque su CLI sí verifique;
esta versión no confirma que acepte una ruta; su build no declara ninguna; su build **sí** declara pero el
sistema entrega ese esquema a otro ejecutable; o no se observó ningún contrato. Y junto a la causa, la frase que
el propio lanzador escribe.

## La segunda es profundidad: tres respuestas, no una

| La persona dijo | Qué pasa |
| --- | --- |
| «ya sé cuál quiero» | se ofrece, con identidad, licencias de **todo** el cierre, tamaño de descarga, tamaño instalado y destino a la vista antes de escribir nada |
| «no sé todavía» | se recomienda desde el perfil y el inventario ya medido, con la frase que lo explica, y se puede rechazar |
| «es pronto» | no se instala nada, y la pantalla dice por qué eso es correcto |

La recomendación **no depende del modelo**: `off` es un nivel de primera clase y quien lo tenga apagado tiene el
mismo derecho a que se le explique. El modelo, si está, amplía la explicación; no añade tecnologías ni cambia la
decisión.

Lo que se instala entra por la puerta que ya existía: lockfile revisado, `npm ci --ignore-scripts` con su propio
`HOME`, y el digesto del árbol comparado contra un pin antes de mover nada. Una tecnología solo se puede ofrecer
si **todo** su cierre declara licencia, no trae scripts de instalación y no restringe `os` ni `cpu`.

**Y lo que no cabe ahí se nombra en vez de fingirse.** El mantenedor pidió Flutter por su nombre: la respuesta es
que llega con su propio instalador y su propia licencia, así que no se instala desde aquí. Igual el editor de
Unity y Python. Un botón que no funciona no es una respuesta; una negativa con su motivo sí.

## Qué se midió

**Contra las seis instalaciones reales del equipo: 4 en modo `local`, 2 en `manual` con su causa, y 0
direcciones abiertas.** Tres carpetas idénticas salvo la respuesta dieron los tres caminos, y ninguna escribió
nada al solo revisar. Una instalación real por el camino del producto: TypeScript, **23 626 590 bytes, 135
archivos, 2 130 ms**, coincidiendo con el digesto fijado. La carpeta de esa prueba tiene `package.json`, lockfile
y su propio `node_modules`, y los cinco archivos de la persona se comparan por digesto antes y después: **0
cambiados**. El retiro rechazó con `STACK_INTEGRITY` un árbol con un archivo ajeno dentro, y lo conservó.

**35 mutaciones de servicio y 39 de interfaz, todas detectadas**, cada una por una prueba con nombre. 122
pruebas del companion, 317 de la raíz, 38 pantallas de navegador, 10 del contrato de interfaz y 5 recorridos
nativos con 0 hallazgos. Y el mismo resultado desde un artefacto **realmente empaquetado**, no solo desde el
sincronizado, para descartar que el empaquetador reescriba los manifiestos que el pin incluye.

## Una revisión independiente, FAIL, resuelta

**1 blocker, 5 majors y 6 minors**, de un subagente que no implementó el cambio y que ejecutó sus propias
comprobaciones en vez de leer las mías.

El **blocker**: la causa que la pantalla daba por no abrir una aplicación se deducía de si el rechazo traía
editor adjunto, no de qué comprobación falló. Manejando el lanzador **real** salieron tres frases falsas — un
Claude firmado cuyo esquema el sistema entrega a otro ejecutable leía que nadie observó cómo recibe una carpeta,
cuando sí se observó. Y el cambio había **borrado** la frase específica que la versión anterior sí mostraba. Es
la misma forma del blocker que #106 ya pagó: una frase cierta por coincidencia. Ahora son ocho causas, cada
rechazo se nombra a sí mismo, y una prueba maneja el lanzador real en vez de un doble.

Los **majors** más serios fueron de instrumento, no de conducta: **el arnés de aperturas pasaba con el defecto
restaurado entero** —la revisión lo restauró en una copia y obtuvo 0 hallazgos y salida 0—, el manifiesto se
declaraba intacto con una comprobación que no podía detectar que hubiera cambiado, y **once de doce mutaciones
propias sobrevivían las 118 pruebas**, incluida quitar la verificación del árbol dentro de `install`, de modo que
lo recién bajado de la red se renombraba sin compararse. Todo resuelto y anclado.

## Tres defectos propios que encontró la evidencia, no las pruebas

El arnés de medición informaba **0 bytes de descarga como éxito** porque el registro responde a `HEAD` sin
`content-length` y `Number(null)` es cero: un fallo y un cero se veían idénticos. Un **candado reentrante** mataba
toda instalación real con `BUSY`, y ninguna prueba lo alcanzaba porque alcanzarlo exige una escritura que tenga
éxito. Y `removeStack` **pisaba su propio campo `status`**. Los tres corregidos, con mutaciones que los
reintroducen y pruebas que las atrapan.

Y el presupuesto de deuda se puso en rojo al capturar los hallazgos, no por una clasificación generosa sino
porque una decisión abierta desde otro flujo se volvió **recurrente**. El gate pedía mirarla, así que se tomó:
lo que esta aplicación regenera —hasta 23 MB por proyecto— ahora dice que se regenera, en
`.project-os/.gitignore`, sin tocar nada de la persona y sin pisar reglas que ella hubiera escrito.

## Qué NO demuestra

Que el árbol instalado sea **idéntico en macOS y Linux**: es plausible y aquí se midió en un solo sistema. Que la
aplicación de escritorio que se abre **lea** la carpeta: sigue necesitando que una persona mire la ventana, igual
que en #106. Y que los paquetes que quedan en la carpeta administrada **sirvan al proyecto tal cual**: quedan
verificados y ubicados, y conectarlos es trabajo de la persona; la pantalla lo dice con esas palabras.
