# Diseño

## 1. Una elección de escritorio no puede abrir un navegador

### Lo que está mal hoy

```js
// service.mjs, handoffPreview
return {id,prompt,destination:local?.label??DESTINATIONS[input.agent],mode:local?'local':'web',…};
// service.mjs, handoff
if(preview.local)opened=await localApps.open(preview.local,p.root);
else {await openExternal(DESTINATIONS[preview.agent]);opened={opened:'web',…};}
```

`mode` se decide por `local`, que es «¿hay una aplicación verificada?». La elección de la persona no entra en la
decisión en ningún punto. Y `DESTINATIONS` tiene una URL web por cada aplicación de escritorio, así que la rama
`else` siempre tiene adónde ir.

### La decisión

`DESTINATIONS` se queda con una sola entrada: `web`. Las otras seis se retiran. No es una comprobación nueva:
es que **ya no existe la dirección** que la rama abría. Un cambio futuro que quiera volver a mandar a la web a
alguien que eligió escritorio tendría que volver a escribir la URL, no solo quitar un `if`.

El modo sale de la elección, y el estado de la instalación solo puede degradarlo:

```
agent === 'web'                                        → 'web'      abre el chat, copia la instrucción
agent de escritorio  +  contrato observado y verificado → 'local'    abre la aplicación con la carpeta
agent de escritorio  +  cualquier otra cosa             → 'manual'   no abre nada, copia la instrucción
```

`'manual'` cubre situaciones distintas, y la frase sale de **qué comprobación falló**, no de qué información
llegó adjunta al rechazo:

| Causa | Qué pasó de verdad |
| --- | --- |
| `not-installed` | se buscó y no se encontró en este equipo |
| `not-measured` | no se pudo buscar: la enumeración falló, o esta versión no trae lanzador |
| `signature` | la firma o el editor no verificaron |
| `no-desktop-app` | su herramienta de línea de comandos está verificada, pero falta la aplicación que recibiría la carpeta |
| `no-help-contract` | está verificada, pero esta versión no confirma que acepte una ruta |
| `no-declaration` | está verificada, pero su build no declara cómo recibir una carpeta |
| `no-handler` | está verificada **y** su build sí declara la ruta, pero el sistema entrega ese esquema a otro ejecutable |
| `no-contract` | se reconoce y no se observó ningún contrato |

La primera versión de este diseño tenía cuatro causas y deducía cuál decir de si el rechazo traía editor
adjunto. Una revisión independiente manejó el lanzador **real** —no un doble de `detect`— por seis rechazos
distinguibles y encontró **tres frases falsas**: un Claude firmado cuyo esquema el sistema entrega a otro
ejecutable leía que nadie observó cómo recibe una carpeta, cuando sí se observó y lo que falló fue la quinta
comprobación de #106; y los dos rechazos de Codex decían que no se pudo comprobar su firma, cuando la misma
función acababa de verificarla. Deducir una causa de un efecto colateral es cómo una frase se vuelve cierta por
coincidencia, que es exactamente el blocker que #106 ya pagó.

Así que cada rechazo se nombra a sí mismo, los dos de Codex pasan por `refuse` para llevar el editor ya
verificado, y la pantalla vuelve a mostrar además la frase específica que escribe el lanzador — que el primer
intento de este cambio había borrado, sustituyendo una frase verdadera por una genérica que podía ser falsa.

`no-contract` es la de OpenCode y ya existe desde #106; lo que cambia es que ahora termina en una ruta que sirve
—texto copiado— en vez de en un sitio web.

### Lo que `handoff` devuelve

`opened` deja de ser `'local' | 'web'` y pasa a ser `'local' | 'web' | 'nothing'`. Quien lea `opened === 'nothing'`
sabe que no se lanzó nada; los cuatro campos que ya existían —`projectAttached`, `agentActivated`,
`agentReadProject`— siguen en `false`, porque siguen siendo falsos.

Ninguna de las seis comprobaciones de #106 se toca. Este cambio no puede abrir nada que antes no se abriera.

## 2. Instalación proporcionada

### Los tres caminos, guardados en la selección

`normalizeSelection` gana un campo opcional, con el mismo patrón que `role` y `goal` para no invalidar ninguna
preparación existente:

```js
stack: { decision: 'chosen' | 'unsure' | 'too-early', requested: string[] }
```

`requested` solo puede tener contenido con `decision: 'chosen'`, y cada id tiene que existir en el catálogo y
estar ofrecido para ese perfil. `decision` ausente se lee como `'too-early'`: una preparación anterior a este
cambio no pidió nada, y eso es exactamente el tercer camino.

### El catálogo: solo lo que se puede anclar

`apps/companion/runtime/stack-catalog.mjs` es datos y reglas, sin E/S. Cada tecnología ofrecida declara lo que
la pantalla tiene que mostrar **antes** de tocar nada:

| Campo | Para qué |
| --- | --- |
| `name`, `packages[]` con nombre, versión y licencia | identidad |
| `licenses` | resumen de licencias del cierre completo |
| `downloadBytes`, `installedBytes`, `files` | tamaño |
| `relative` | destino, dentro de lo que Companion administra |
| `treeHash` | anclaje del árbol instalado |
| `because` | la frase que explica por qué se recomienda, cuando se recomienda |

Lo que entra en el catálogo tiene que cumplir tres cosas, comprobadas contra el cierre real de dependencias:
ningún paquete con script de instalación, ninguna restricción de `os` o `cpu` —o el árbol no sería el mismo en
dos equipos—, y licencia declarada en cada paquete.

Medido sobre el cierre real:

| Tecnología | Paquetes | Licencias | Scripts de instalación |
| --- | --- | --- | --- |
| React | 3 | MIT | ninguno |
| TypeScript | 1 | Apache-2.0 | ninguno |
| Express | 68 | MIT, ISC, BSD-3-Clause | ninguno |

### Lo que no se ofrece, dicho por su nombre

Flutter y el editor de Unity son SDK e instaladores con su propia licencia y su propio proceso; Python no entra
por un lockfile de npm. `NOT_OFFERED` los nombra con de dónde vienen y por qué no se instalan desde aquí, y la
pantalla los muestra en la misma vista que los ofrecidos. El mantenedor nombró Flutter explícitamente: la
respuesta es «no desde aquí, y este es el motivo», no un botón que no funciona ni un silencio.

### La recomendación se decide con lo que ya se mide

`recommend({ profile, inventory })` usa el perfil elegido y el inventario que `inspectFolder` ya produjo —las
extensiones y cuántos archivos de cada tipo hay—, nada más:

| Lo que se observa | Qué se recomienda | La frase |
| --- | --- | --- |
| perfil software, hay `.tsx`/`.jsx` | React | «Tu carpeta ya tiene archivos de interfaz React.» |
| perfil software, hay `.ts` sin `.tsx` | TypeScript | «Tu carpeta ya tiene TypeScript.» |
| perfil software, no hay código todavía | nada | «Todavía no hay código que indique una tecnología; es pronto.» |
| perfil unity | nada, con el editor nombrado | «El editor de Unity se instala aparte, con su licencia.» |
| perfil research, media o general | nada | «Este tipo de proyecto no necesita un stack de programación.» |

El modelo de #99 no entra en esta decisión. Con el nivel `off` la recomendación es la misma, porque una persona
con el modelo apagado tiene el mismo derecho a que se le explique por qué. Si el modelo está, puede ampliar la
explicación en el prompt; no puede añadir una tecnología al catálogo ni cambiar la decisión. Eso es una regla,
no una preferencia: el catálogo es un objeto congelado y la recomendación solo devuelve ids que están en él.

### La instalación reutiliza la puerta que ya existe

`createStackStore` es el mismo patrón que `createToolchainStore`, con el mismo aislamiento:

1. Copiar `package.json` y el lockfile revisados desde los recursos de la aplicación a una carpeta de trabajo
   dentro de `.project-os`.
2. `npm ci --ignore-scripts --bin-links=false --workspaces=false` con `HOME` en una carpeta temporal propia, sin
   config del sistema ni del proyecto, contra `registry.npmjs.org` y con la integridad que fija el lockfile.
3. `inspectTree` sobre el resultado y comparación contra `treeHash` y `bytes` del pin. Si no coincide, no se
   mueve nada y se dice por qué.
4. `rename` a `.project-os/stack/<id>`.

**No hay cache compartido entre proyectos.** El cache de ingeniería lo tiene porque se instala en todos los
proyectos de ingeniería; un stack lo pide quien lo pide. Sin cache no hay estado compartido que pueda quedar
corrupto y no hace falta un flujo de reparación para él; el precio es que dos proyectos que pidan React lo
descargan dos veces, y las descargas son pequeñas. Queda dicho, no escondido.

**Nada se escribe fuera de lo que Companion administra.** El `package.json` del proyecto no se toca, y la
pantalla lo dice con esas palabras: los paquetes verificados quedan en esa carpeta y el proyecto sigue siendo
de la persona.

### Lo que se regenera, dicho

Instalar una tecnología puede dejar 23 MB y 135 archivos dentro de `.project-os`, y hasta ahora lo que caía ahí
eran recibos pequeños y un cache de herramientas. Una persona que prepara su proyecto y lo commitea empujaría
algo que nunca eligió versionar. El registro de deuda llevaba esa decisión abierta desde otro flujo; este cambio
la vuelve concreta, así que se toma en vez de diferirse otra vez.

La primera instalación —de una tecnología o del cache de ingeniería— escribe `.project-os/.gitignore` nombrando
`/toolchain/` y `/stack/`. Las dos se reconstruyen desde un pin y se comprueban comparando un digesto, no su
historial. Los recibos de `.project-os/companion/` **no** entran en las reglas: son pequeños y dicen qué se
preparó. El archivo vive dentro de lo que esta aplicación administra, explica en palabras cómo deshacerlo, y uno
que la persona haya escrito ahí no se toca nunca — porque escribir reglas ahí es una decisión, y esa ya era suya.

### Reversible, y solo hacia atrás sobre lo propio

`.project-os/companion/stack.json` registra qué se instaló, con su digesto y su fecha, y qué se rechazó. Retirar
un stack vuelve a medir el árbol: si sigue coincidiendo con su pin, se borra; si no coincide, **no se borra** y
se dice que hay cambios que no son de Companion. Un retiro nunca puede llevarse por delante algo que la persona
puso ahí.

### Rechazar no rompe nada

Una recomendación rechazada se registra y la preparación sigue. `stack` no entra en `REQUIRED_STAGES` de #98: no
es una etapa que falte, es una decisión tomada. El estado del proyecto no empeora por decir que no, y eso se
comprueba: después de rechazar, `status()` devuelve el mismo veredicto que antes de preguntar.

## 3. Dónde se ve

- **Asistente:** una pregunta nueva, «¿Sabes con qué tecnología vas a trabajar?», con las tres respuestas. Con
  la primera aparecen las tecnologías ofrecidas para ese perfil.
- **Revisión previa:** la sección de tecnología junto a la de archivos, con identidad, licencia, tamaño de
  descarga, tamaño instalado y destino, o con la frase de por qué no hay nada que instalar.
- **Estado del proyecto:** qué stack está instalado, dónde, y qué se rechazó y cuándo.
- **Continuar con tu IA:** tres modos con tres textos, y el modo manual con su causa.

## 4. Cómo se comprueba que no se puede volver atrás

- **Mutación de servicio:** quitar el guardia que decide el modo por la elección, o devolver una URL web para
  una aplicación de escritorio, tiene que hacer fallar una prueba con nombre. Lo mismo para deducir la causa en
  vez de tomarla del rechazo, para informar una sonda caída como ausencia, para quitar cualquiera de los
  argumentos con los que corre `npm ci`, para mover lo que bajó de la red sin compararlo contra su pin, y para
  retirar un árbol que ya no coincide. Instalar tras un rechazo lo ancla una aserción, no una mutación: un plan
  consumido no se puede volver a usar.
- **Prueba contra el lanzador real:** las causas no se comprueban contra un doble de `detect` que ya decidió,
  sino manejando `createLocalAppLauncher` con sus sondas inyectadas, porque lo que hay que comprobar es
  justamente que la causa que sale es la de la comprobación que falló.
- **Contrato de interfaz:** las acciones nuevas entran en la tabla de nombres y de conteo, y la pantalla de
  tecnología se recorre ahí, así que un segundo control con el mismo nombre o un nombre repetido se detecta.
- **Arnés de aperturas:** por cada aplicación de escritorio del equipo, con la elección puesta en escritorio, se
  comprueba que no se abrió ninguna URL y que el modo es `local` o `manual`, nunca `web`. Si el artefacto
  instalado todavía guarda direcciones web por aplicación de escritorio, eso es un **hallazgo**: un arnés que no
  pudo medir su razón de existir no ha pasado.
- **Tres caminos:** un perfil que pide tecnología, uno que no sabe y uno donde es pronto, contra tres carpetas
  idénticas salvo la respuesta, medidos con el **servicio del artefacto instalado**. Las carpetas llevan
  `package.json`, lockfile y su propio `node_modules`, y los cinco archivos de la persona se comparan por
  digesto antes y después. Los cinco recorridos nativos van por la **ventana** instalada y comprueban que dice
  qué tecnología hay y por qué; los tres caminos no se recorren por la ventana.

## 5. Lo que este diseño no resuelve

- El árbol instalado se ancla por su digesto **en este equipo y con esta versión de npm**. Que dos sistemas
  operativos produzcan el mismo árbol para estas tecnologías es plausible —ningún paquete tiene `os`, `cpu` ni
  scripts— pero aquí solo se midió en uno, y así queda dicho.
- **Que el catálogo siga diciendo la verdad sobre lo que instalaría no lo comprueba ninguna prueba unitaria.**
  Cambiar a mano un tamaño o un digesto en el catálogo no rompe nada en `npm test`, porque comprobarlo exige
  descargar e instalar. Lo detectan dos cosas que sí miden: `pin-stack.mjs`, que ahora sale distinto de cero
  cuando lo medido no coincide, y `verify-stack-install.mjs`, que compara lo instalado contra lo que la pantalla
  mostró antes. Ninguna de las dos corre en CI, por la misma razón que el resto de arneses de máquina real.
- Dejar los paquetes en una carpeta administrada no configura el proyecto de la persona para usarlos. La
  pantalla dice dónde están; conectarlos es trabajo suyo.
- Que la aplicación de escritorio que se abre lea de verdad la carpeta sigue necesitando que alguien mire la
  ventana, igual que en #106.
