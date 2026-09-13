# Validación

Todo lo de aquí se corrió en este equipo, con la aplicación instalada sincronizada con esta rama. Cada número
sale de un archivo de esta carpeta; ninguno se escribió de memoria.

## Lo que se midió

| Comprobación | Cómo se corre | Resultado |
| --- | --- | --- |
| Pruebas de la raíz | `npm run check` | 317/317 |
| Pruebas del companion | `npm test` en `apps/companion` | 122/122 |
| Recorridos de navegador | `npm run test:ui` | 38 pantallas, 0 hallazgos |
| Contrato de interfaz | `npm run evidence:contract` | 39/39 mutaciones, 10 pantallas, 0 hallazgos |
| Mutaciones de servicio | `npm run evidence:mutations` | 35/35 detectadas, cada una por una prueba con nombre |
| Aperturas locales | `npm run evidence:launches` | 6 instaladas, 4 verificadas, 2 rechazadas, **0 direcciones abiertas**, 0 hallazgos |
| Recorridos nativos | `npm run evidence:native` | 5 perfiles, 0 hallazgos |
| Instalación de tecnología | `npm run evidence:stack` | 3 caminos, 1 instalación real, 0 hallazgos |
| Pin de cada tecnología | `node scripts/pin-stack.mjs` | 3 medidas, digesto reproducible entre corridas |

## El defecto, medido contra las seis instalaciones reales

`evidence/local-launches.json`. La elección se puso en las seis aplicaciones de escritorio y se pidió continuar
con cada una. Direcciones que el artefacto instalado guarda: `["web"]`. Direcciones abiertas: **0**.

| Aplicación | Modo | Causa | Abrió |
| --- | --- | --- | --- |
| Codex | `local` | — | no se pidió: abrirla pondría una ventana en la pantalla |
| Cursor | `local` | — | no se pidió |
| GitHub Copilot | `local` | — | no se pidió |
| Claude | `local` | — | no se pidió |
| Antigravity | `manual` | `signature` | `nothing`, instrucción copiada |
| OpenCode | `manual` | `no-contract` | `nothing`, instrucción copiada |

Las dos causas son distintas y se dicen distintas: la firma de Antigravity no verifica aquí; el editor de
OpenCode **sí** verifica y lo que no hace es declarar cómo recibe una carpeta.

## Los tres caminos, contra tres carpetas idénticas salvo la respuesta

`evidence/stack-install.json`. Las tres carpetas tienen los mismos dos archivos, uno de ellos `App.tsx`.

| Respuesta | Resultado | Se ofreció | Por qué | ¿Escribió algo al revisar? |
| --- | --- | --- | --- | --- |
| pidió una tecnología | `chosen` | `typed-code` | «Lo pediste al preparar este proyecto.» | no |
| no sabe todavía | `recommended` | `web-interface` | «Tu carpeta ya tiene 1 archivo de interfaz con React.» | no |
| es pronto | `none` | nada | «Dijiste que todavía es pronto para elegir tecnología…» | no |

## Una instalación real, por el camino del producto

| | Mostrado antes de escribir | Medido después |
| --- | --- | --- |
| Nombre | TypeScript | — |
| Cierre | 1 paquete | — |
| Licencias | Apache-2.0 | — |
| Descarga | 4 377 468 bytes | — |
| Instalado | 23 626 590 bytes | **23 626 590 bytes** |
| Archivos | — | 135 |
| Destino | `.project-os/stack/typed-code` | ahí quedó |
| Tiempo | — | 2 130 ms |
| Digesto del árbol | fijado en el catálogo | coincide |
| Los 5 archivos de la persona | comparados por digesto antes | **0 cambiados** |

La carpeta de esta prueba tiene `package.json`, `package-lock.json`, un `node_modules` propio y dos archivos de
trabajo, y los cinco se comparan por digesto antes y después. La primera versión de esta medición comprobaba que
**no existiera** un `package.json`, que es cierto por construcción de la carpeta sintética y falso en cualquier
proyecto real: una revisión independiente instaló sobre una carpeta que sí tenía uno, demostró por digesto que
quedó intacto, y este arnés lo informaba como tocado.

Retiro, en sus dos formas: con un archivo ajeno dentro, rechazado con `STACK_INTEGRITY` y el archivo conservado;
sin él, retirado y borrado del registro del proyecto.

## Y otra vez desde un artefacto realmente empaquetado

El digesto del árbol instalado incluye el `package.json` y el lockfile que se copian desde los recursos de la
aplicación, y este repositorio tiene `removePackageScripts` y `removePackageKeywords` activados, que reescriben
todo manifiesto anidado. Si el empaquetador reescribía esos dos archivos, el pin sería correcto en el árbol de
trabajo y falso en la aplicación entregada — y todo lo de arriba se midió sobre un artefacto **sincronizado**,
que copia los bytes de la rama tal cual y no habría notado la diferencia.

Así que se empaquetó de verdad con `npm run pack` y se comparó: los seis archivos de recursos salen del
empaquetador **con los mismos bytes**. Y la comprobación completa se repitió contra ese artefacto empaquetado,
no contra el sincronizado: 3 caminos, instalación real de TypeScript en **23 626 590 bytes, 135 archivos,
2 632 ms**, digesto coincidente, 0 hallazgos. El pin se sostiene en lo que se entrega, no solo aquí.

## Los pines, medidos tres veces

`node scripts/pin-stack.mjs` corre el mismo `npm ci --ignore-scripts` que el producto, con el mismo motor
gestionado, y compara. Las tres tecnologías dieron el mismo digesto en corridas separadas.

| Tecnología | Cierre | Licencias | Descarga | Instalado | Archivos | Tiempo |
| --- | --- | --- | --- | --- | --- | --- |
| React | 3 | MIT | 1 311 203 | 7 576 468 | 88 | 577–588 ms |
| TypeScript | 1 | Apache-2.0 | 4 377 468 | 23 626 590 | 135 | 722–735 ms |
| Express | 68 | BSD-3-Clause, ISC, MIT | 743 738 | 2 396 995 | 604 | 791–792 ms |

Ninguno de los 72 paquetes del conjunto trae script de instalación ni restringe `os` o `cpu`, y todos declaran
licencia e integridad fijada. Vite y los empaquetadores habituales se quedaron fuera a propósito: arrastran
binarios opcionales por plataforma, y un digesto único sería falso en dos de las tres.

## La revisión independiente, FAIL, y lo que cambió

Un subagente que no implementó el cambio devolvió **FAIL: 1 blocker, 5 majors y 6 minors**, ejecutando sus
propias comprobaciones en vez de leer las mías. El verdicto completo está en `independent-review.md`. Lo que
encontró y cómo quedó:

| | Qué encontró | Cómo quedó |
| --- | --- | --- |
| **B1** | La causa que se dice en pantalla se deducía de si el rechazo traía editor adjunto, no de qué comprobación falló. Manejando el lanzador **real**, tres frases salían falsas: un Claude firmado cuyo esquema el sistema entrega a otro ejecutable leía que nadie observó cómo recibe una carpeta, y los dos rechazos de Codex decían que no se pudo comprobar su firma. Además el cambio había **borrado** la frase específica que la versión anterior sí mostraba | Cada rechazo se nombra a sí mismo: ocho causas en vez de cuatro. Los dos de Codex pasan por `refuse` y llevan su editor ya verificado. La pantalla vuelve a mostrar la frase del lanzador. Prueba nueva que maneja `createLocalAppLauncher` real, no un doble de `detect` |
| **M2** | Una enumeración que falla se informaba como «no se encontró en este equipo» — concluir de una ausencia que el propio código crea, justo lo que su comentario dice no hacer | `detect` distingue «no encontró» de «no pudo buscar» y propaga `not-measured` |
| **M3** | **El arnés de aperturas pasaba con el defecto restaurado entero.** La revisión copió el artefacto, devolvió las seis URL, el modo decidido por lo instalado y la rama que abre una dirección, y el arnés informó 0 hallazgos y salió 0 | No poder medir es un hallazgo. Comprobado restaurando el defecto entero en una copia: **salida 1**, con su frase |
| **M4** | `projectManifestUntouched` medía «no existe un package.json», que es cierto por construcción de la carpeta sintética y falso en cualquier proyecto real | Cinco archivos de la persona, incluidos manifiesto, lockfile y su `node_modules`, comparados por digesto antes y después |
| **M5** | **Once de doce mutaciones propias sobrevivían las 118 pruebas**, cinco sobre la puerta de instalación: quitar `--ignore-scripts`, `--bin-links=false`, el registro fijado, el piso de antigüedad, y —la peor— **quitar la verificación del árbol dentro de `install`**, de modo que lo recién bajado de la red se renombra sin compararse | El ejecutor de procesos es inyectable y una prueba afirma el argv exacto; otra pone un payload distinto del pin y comprueba que no llega a la carpeta ni deja nada atrás. Cuatro mutaciones nuevas |
| **M6** | Cambiar de perfil tras elegir una tecnología dejaba la casilla marcada, y la preparación se bloqueaba tres pantallas después —en la de carpeta, que no tiene ningún control de tecnología— con un remedio que apuntaba a la carpeta | El cambio de perfil vuelve a renderizar y descarta lo que ese perfil no ofrece, y `STACK_INVALID` señala el asistente |
| **m1** | `tasks.md` sin casillas | Estaba sin marcar cuando la revisión lo leyó; se marcó después, antes de recibir el verdicto. No es un arreglo en respuesta |
| **m2** | Tareas y diseño prometían mutaciones y recorridos nativos que no existen | Corregidos para describir la evidencia que existe: los tres caminos se miden con el servicio del artefacto instalado, no por la ventana |
| **m3** | Con el registro ilegible la pantalla afirmaba que no hay nada instalado — la única afirmación que no podía hacer | Dice que no se pudo leer el registro y no afirma nada sobre lo instalado |
| **m4** | Un registro forjado pintaba texto arbitrario | `validateRecord` filtra los ids que el catálogo no conoce |
| **m5** | La pantalla de tecnología no entraba en el contrato de interfaz | Entra: 10 pantallas en vez de 9 |
| **m6** | La deriva del catálogo no la detectaba nada: `pin-stack.mjs` imprimía «NO coincide» y salía 0 | Sale distinto de cero, y usa los argumentos del producto en vez de una copia suya |

La revisión también verificó por su cuenta que el defecto central está bien resuelto: `openExternal` tiene un
solo punto de llamada, fijo a la única dirección que queda, alcanzable solo por una elección de chat web; que
rechazar una recomendación deja el veredicto idéntico **campo por campo**, no solo en `stages`; que ni un
registro corrupto ni uno forjado consiguen que se borre nada de la persona; y que los cinco PNG están limpios,
inspeccionados por chunks y por píxeles.

## Las mutaciones nuevas

Dieciocho mutaciones nuevas sobre los archivos de este cambio, todas detectadas por una prueba con nombre.
Las nueve primeras:

| Mutación | Qué devuelve | La atrapó |
| --- | --- | --- |
| el modo lo decide lo instalado | elegir escritorio sin poder abrirlo manda a un navegador | «a desktop choice never opens an address…» |
| la rama manual abre una dirección | lo mismo, por la otra puerta | la misma |
| vuelven las seis URL web | la sustitución vuelve a ser posible | «the only address this application holds…» |
| no haber mirado se informa como no instalada | se concluye de una ausencia propia | «a desktop choice never opens an address…» |
| el árbol se acepta sin comparar su digesto | se podría borrar algo ajeno | «a technology tree that no longer matches…» |
| un destino fuera de `.project-os` | se escribe donde la persona guarda su trabajo | «what the catalogue claims matches…» |
| la recomendación deja de leer la carpeta | recomienda lo mismo a cualquiera | «a recommendation comes from profile and inventory…» |
| se registran tecnologías sin haberlas pedido | una recomendación se vuelve una petición | «the technology answer is one of three…» |
| el escritor del registro retoma el candado | toda instalación real muere con `BUSY` | «writing the record from inside the folder lock…» |

Una décima mutación se escribió primero como error de sintaxis, y el arnés lo dijo atribuyendo la detección al
archivo en vez de a una prueba. Se reescribió como cambio de conducta. Una suite que no puede cargarse no
acredita nada a nadie, y eso es exactamente para lo que esa distinción está en el arnés.

Y ocho más, todas nacidas de la revisión independiente:

| Mutación | Qué devuelve | La atrapó |
| --- | --- | --- |
| la causa se deduce del editor adjunto | tres frases falsas sobre aplicaciones firmadas | «a desktop choice never opens an address…» |
| un rechazo deja de nombrar su comprobación | quien escribe la frase tiene que adivinarla | «each refusal says the check that actually failed…» |
| el rechazo de Codex vuelve a `fail` | se dice que no se pudo comprobar una firma que sí se comprobó | la misma |
| una sonda caída se informa como ausencia | se concluye de una ausencia propia | la misma |
| `npm ci` con los scripts habilitados | cada paquete ejecuta código al instalarse | «installing runs npm with the arguments…» |
| el registro deja de estar fijado | un mirror puede sustituir los paquetes | la misma |
| **lo que bajó de la red se mueve sin verificarse** | bytes sin revisar llegan a la carpeta de la persona | la misma |
| el registro acepta un nombre que el catálogo no conoce | texto arbitrario en la pantalla del proyecto | «a record on disk cannot name something…» |
| las reglas de ignore pisan lo que la persona escribió | se decide por ella en su propio repositorio | «what regenerates says so…» |

## La decisión que el presupuesto de deuda obligó a tomar

Capturar los hallazgos puso el presupuesto en **5/5** y pausó el plan. No por una clasificación generosa: una
decisión que llevaba abierta desde otro flujo —no hay reglas de ignore revisadas para lo que Companion escribe
dentro de `.project-os`— se volvió **recurrente** al aparecer en un segundo flujo, y por política un minor
recurrente cuesta el doble. El gate estaba pidiendo mirar esa decisión, no reetiquetar el hallazgo.

Mirada: es cierta, y este cambio es lo que la volvió urgente. Antes ahí caían recibos pequeños y un cache de
13 MB; ahora puede caer un `node_modules` de 23 MB y 135 archivos, y quien prepare su proyecto y lo commitee
empujaría algo que nunca eligió versionar. Así que se **tomó** en vez de diferirse otra vez:
`.project-os/.gitignore` nombra `/toolchain/` y `/stack/`, que se reconstruyen desde un pin y se comprueban por
digesto y no por historial. Los recibos quedan fuera a propósito. El archivo vive dentro de lo que esta
aplicación administra, explica cómo deshacerlo, y uno que la persona haya escrito ahí no se toca nunca.

Presupuesto después: **3/5, PASS.**

## Tres defectos propios que encontró la evidencia, no las pruebas

1. **`pin-stack.mjs` informaba 0 bytes de descarga como éxito.** Pedía con `HEAD`, y el registro responde a `HEAD`
   sin `content-length`; `Number(null)` es 0, `Number.isInteger(0)` es verdadero, y la suma daba cero sin que
   nada fallara. Una medición que falla y una que no encuentra nada se veían idénticas. Ahora la petición exige
   una longitud positiva y un valor ausente es un problema, no un total.
2. **Un candado reentrante mataba toda instalación real.** `install()` toma el candado de la carpeta y el escritor
   del registro lo volvía a tomar: la primera instalación por el camino del producto murió con `BUSY`. Ninguna
   prueba lo alcanzaba porque alcanzarlo exige una escritura que tenga éxito. Corregido, con una prueba que sí
   llega por el camino más barato y una mutación que lo reintroduce.
3. **`removeStack` pisaba su propio campo `status`.** Devolvía `{...resultado, status: estadoDelProyecto}`, así que
   el «removed» del almacén desaparecía bajo el estado del proyecto. La corrida de evidencia lo vio porque leyó
   un objeto donde esperaba una palabra. Ahora son dos campos con dos nombres.

## Lo que no se comprobó, con su causa

- **Que el árbol instalado sea idéntico en macOS y en Linux.** Es plausible —ningún paquete del conjunto trae
  script ni restringe `os` o `cpu`— pero aquí se midió en un solo sistema operativo, y un pin medido en uno no
  es una afirmación sobre tres.
- **Que la aplicación de escritorio que se abre lea de verdad la carpeta.** Igual que en #106: hace falta que una
  persona mire la ventana. El arnés no abrió ninguna aplicación en esta corrida.
- **Que los paquetes que quedan en la carpeta administrada sirvan al proyecto tal cual.** Quedan verificados y
  ubicados; conectarlos al proyecto es trabajo de la persona, y la pantalla lo dice.
- **El asistente del instalador.** Fuera del alcance de estos arneses, como en las entregas anteriores.
