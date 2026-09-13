# Revisión adversarial independiente

**Alcance**: issue #100 / change `open-the-desktop-ai-you-chose-and-install-what-fits`, rama
`issue-100-open-the-desktop-ai-you-chose` (árbol de trabajo sin commitear).

**Quién**: un revisor que no implementó el cambio, siguiendo un playbook local prestado para revisión
adversarial: se asume que hay huecos hasta haber argumentado en contra con evidencia, y no se elogia la
implementación salvo donde una fortaleza mitigue directamente un riesgo documentado.

**Fuentes leídas**: `proposal.md`, `design.md`, `tasks.md`, `brownfield-baseline.md`, `issue.md`, ambos deltas de
spec, `evidence/validation.md`, los seis JSON y los cinco PNG de `evidence/`, el diff completo contra `main`, y
los archivos nuevos (`runtime/stack.mjs`, `runtime/stack-catalog.mjs`, `runtime/stack/*`, `qa/stack.mjs`,
`scripts/pin-stack.mjs`, `scripts/verify-stack-install.mjs`).

**Qué se ejecutó de verdad** (nada de lo que sigue es inferido salvo donde se diga):

| Comprobación | Resultado |
| --- | --- |
| `npm test` en `apps/companion` | 118/118 pasan |
| `npm run test:ui` en `apps/companion` | salida 0 |
| `npm run check` en la raíz | salida 0, 317/317 pruebas |
| 5 escenarios de rechazo contra el lanzador **real** (`local-apps.mjs`), no contra el doble | 3 frases falsas |
| 2 escenarios más (esquema sin registrar, sonda caída) | 1 frase falsa más |
| El arnés de aperturas contra un artefacto con **el defecto restaurado entero** | pasa, salida 0 |
| Instalación real de `typed-code` sobre una carpeta que **sí** tiene `package.json` | producto correcto, medición vacía |
| `npm run evidence:mutations` re-ejecutado desde cero | 26/26 detectadas, `restored: true`, atribuciones idénticas a las del `evidence/` entregado |
| 12 mutaciones propias distintas de las 26 declaradas, contra las 118 pruebas | **11 sobreviven** |
| El asistente real (renderer + servicio reales, Playwright) cambiando de perfil tras elegir tecnología | callejón sin salida |
| Registro de tecnologías ilegible y registro forjado | 1 frase falsa, 0 borrados indebidos |
| Los 5 PNG de `evidence/` inspeccionados píxel y chunks | limpios |

---

## Alineación spec / tareas

Los siete criterios de aceptación del issue se cumplen en sustancia, con una excepción:

| Criterio del issue | Estado |
| --- | --- |
| Elegir escritorio nunca abre una URL, con prueba que falla si vuelve | **Cumplido.** `openExternal` tiene un solo punto de llamada (`service.mjs:668`), fijo a `DESTINATIONS.web` y alcanzable solo con `preview.mode==='web'`, que exige `input.agent===WEB_AGENT`. Tres mutaciones declaradas lo defienden |
| Una IA sin contrato comprobado muestra «ábrela tú» con el prompt copiado y no finge abrirla | **Cumplido** |
| Abrir una carpeta sigue diciendo que no demuestra que la IA la leyó | **Cumplido** |
| Una aplicación sin firma verificable se sigue rechazando **con su causa** | **Incumplido en la causa.** El rechazo se mantiene; la causa que se muestra es falsa en tres situaciones alcanzables (Blocker B1, Major M2) |
| Nada se instala sin identidad, licencia, tamaño y destino mostrados antes | **Cumplido** |
| Un proyecto donde es pronto termina sin stack y la pantalla explica por qué | **Cumplido**, verificado contra la ventana instalada |
| Una recomendación se puede rechazar y la preparación continúa | **Cumplido**, y medido: el veredicto queda idéntico campo por campo |

**`tasks.md` no registra nada.** 0 de 27 casillas marcadas. Los tres changes archivados más recientes de este
repositorio llevan 27/27, 18/18 y 31/31 marcadas, así que la convención es clara y aquí no se siguió.

---

## Hallazgos

### Blocker

#### B1 — El modo manual dice una causa que no es la que aplica, y el cambio borró la frase que sí era verdad

**Dónde.** `apps/companion/desktop/service.mjs:683` (la expresión que elige la causa) y `:52-57`
(`MANUAL_CAUSES`), que dependen de `apps/companion/desktop/local-apps.mjs:180`:

```js
publisherVerified: refused.code==='APP_UNSUPPORTED' && !!refused.publisher
```

La causa se deduce de `publisherVerified` en vez de deducirse de **qué comprobación falló**. Seis rechazos
distinguibles del lanzador se aplastan en dos causas, y en tres casos la frase resultante es falsa.

**Qué rompe.** `specs/companion-program-acceptance/spec.md`: «**AND** the reason SHALL be the one that applies,
told apart from the other reasons». También `docs/companion/ENVIRONMENT.md` («The four reasons … are told
apart») y `docs/companion/SECURITY.md` («se dice cuál de las cuatro causas es»).

**Escenarios ejecutados** (lanzador real, servicio real; no se inyectó ningún doble de `detect`):

| Entrada | `detect` devuelve | Causa | Lo que dice la pantalla | Verdad |
| --- | --- | --- | --- | --- |
| Claude instalado, firma válida, editor `Anthropic, PBC`, el build **sí declara** `code/new?folder=`, pero el sistema entrega `claude://` a otro ejecutable (o la clave de HKCU no existe) | `APP_UNSUPPORTED` «El sistema no entrega esa dirección a esta misma aplicación», `publisherVerified:true` | `no-contract` | «…pero **no se observó cómo recibe una carpeta**…» | **Falsa.** Sí se observó. Lo que falló es la quinta comprobación de #106, el registro del esquema |
| Codex instalado, ambos ejecutables firmados y editor en la lista cerrada, pero `codex app --help` no confirma la ruta | `APP_UNSUPPORTED` «Esta versión de Codex no confirmó cómo abrir una carpeta», `publisherVerified:false` | `not-verifiable` | «…**no se pudo comprobar su firma o quién la publica**…» | **Falsa.** La firma se verificó. Lo que falta es justamente el contrato de carpeta |
| Codex: CLI firmado y verificado, sin la aplicación de escritorio | `APP_UNTRUSTED` «No se encontró la aplicación de escritorio de Codex instalada» | `not-verifiable` | la misma frase sobre la firma | **Falsa** por el mismo motivo |

La causa raíz del segundo y tercer caso es que esos dos rechazos usan `fail(...)` y no `refuse(...)`
(`local-apps.mjs:140-141`), así que no cargan el editor ya verificado y `publisherVerified` sale `false`.

**Agravante: el cambio *perdió* información que `main` sí mostraba.** En `main`, `ui/app.mjs` pintaba
`preview.unverified.message`, que es la frase específica y correcta. Ahora `handoffView` pinta solo
`preview.causeMessage` más el editor:

```js
manual?p(preview.causeMessage+(preview.unverified?.publisherVerified?` Su editor es ${preview.unverified.publisher}.`:''),'subtle'):null,
```

El servicio sigue devolviendo `unverified.message` por IPC; la pantalla ya no lo usa. Es decir: se sustituyó una
frase verdadera y específica por una genérica que puede ser falsa.

**Por qué ninguna prueba lo ve.** `qa/stack.mjs:38-45` inyecta un doble de `detect` que ya devuelve
`code` y `publisherVerified` ya decididos, así que la prueba comprueba el mapeo *desde el doble* y nunca ejecuta
`local-apps.mjs`. Y el arnés de aperturas solo ejercita los dos rechazos que esta máquina produce —Antigravity
(firma que de verdad falla) y OpenCode (que de verdad no declara ruta)—, cuyas frases son ciertas por
coincidencia. Es exactamente el patrón que #106 ya había dejado como blocker: una frase verdadera por accidente.

**Qué haría falta.** Derivar la causa del rechazo concreto, no de `publisherVerified`: separar al menos
`no-declaration`, `no-handler`, `no-help-contract` y `no-desktop-app` de `not-verifiable`; hacer que los dos
rechazos de Codex usen `refuse(...)` para que lleven el editor verificado; y volver a pintar
`preview.unverified.message` junto a la causa. La prueba tiene que ejercitar `createLocalAppLauncher` real con
`discover`/`signature`/`declaration`/`handler` inyectados —como hice yo— en vez de un doble de `detect`.

### Major

#### M2 — Una sonda que falla se informa como «no está instalada»

**Dónde.** `apps/companion/desktop/local-apps.mjs:161`:

```js
const found = await candidates(agent).catch(()=>[]);
```

Cualquier fallo de la enumeración (PowerShell ausente, `Get-AppxPackage` con error, timeout, permisos sobre el
directorio) se convierte en «no hay candidatos», `detect` devuelve `null`, y `service.mjs:683` elige
`not-installed` → «**No se encontró en este equipo.** Si la tienes en otra ubicación, ábrela tú.»

**Ejecutado.** Con `discover` lanzando un error para `codex`: `detect -> null`, `cause: not-installed`.

**Por qué importa.** El comentario del propio código, en `service.mjs:48-51`, dice lo contrario: «"we did not
find it" is not the same as "we never looked" — a launcher that is absent measures nothing, and saying it is not
installed would be concluding from an absence we created ourselves». La mutación declarada
`a-launcher-that-was-never-asked-is-reported-as-not-installed` solo protege el caso exterior (`!localApps`); un
nivel más abajo se comete el mismo error que dice evitar.

**Qué haría falta.** Distinguir en `detect` entre «la enumeración no encontró nada» y «la enumeración falló», y
propagar `not-measured` en el segundo caso.

#### M3 — El arnés de aperturas pasa igual si el defecto vuelve entero

**Dónde.** `apps/companion/scripts/verify-local-launches.mjs:154-159`:

```js
const heldForDesktop = addresses.filter(id => id !== 'web');
if (heldForDesktop.length) {
  return { measured: false, addressesHeld: addresses, cause: '…es anterior a esta regla…' };
}
```

`measured:false` se anota en `record.unverified` y **no** genera un finding, así que el script sale 0.

**Ejecutado.** Copié el artefacto instalado, restauré en la copia las tres líneas exactas del defecto original
(las siete `DESTINATIONS`, `const mode=local?'local':'web'`, y el `else` que hace
`openExternal(DESTINATIONS[preview.agent])`), y corrí el arnés contra esa copia:

```
"findings": 0,
"desktopChoiceMeasured": false,
"addressesOpenedForADesktopChoice": null
EXIT CODE: 0
```

Con el defecto puesto de vuelta al completo —que es literalmente «revertir el cambio»— el arnés que `tasks.md`
4.2 y la sección *Validation* del issue nombran como la evidencia de esta regla informa cero hallazgos y pasa.
La propiedad **sí** está defendida, pero por `qa/stack.mjs` y las tres mutaciones declaradas, no por el arnés.
Una reversión parcial (revertir el modo sin devolver las URL) sí la detecta.

**Qué haría falta.** `measured:false` tiene que ser un finding, o al menos salida distinta de 0: un arnés que no
pudo medir su propia razón de existir no es un arnés que pasó.

#### M4 — `projectManifestUntouched` no mide lo que su nombre dice

**Dónde.** `apps/companion/scripts/verify-stack-install.mjs:126`:

```js
projectManifestUntouched: !(await stat(path.join(root, 'package.json')).then(() => true).catch(() => false)),
```

Eso es «no existe un `package.json`», no «el manifiesto de la persona no se tocó». Las carpetas sintéticas que
el script crea (`folderFor`) nunca tienen uno, así que la afirmación es `true` por construcción y no puede
fallar por el motivo correcto; y en cualquier carpeta real fallaría por el motivo equivocado.

**Ejecutado.** Instalación real de `typed-code` por el camino del producto, contra el artefacto instalado, sobre
una carpeta que **sí** tenía `package.json` y su propio `node_modules`:

```
instalado: [{"id":"typed-code","bytes":23626590,"files":135}]
package.json de la persona INTACTO: true
su node_modules INTACTO: true
raiz despues: [".project-os","App.tsx","node_modules","package.json"]

LO QUE MIDE verify-stack-install.mjs  -> projectManifestUntouched = false
LO QUE ES VERDAD                      -> intacto = true
```

El producto se comporta bien —lo comprobé por digesto antes y después—, pero el `"projectManifestUntouched":
true` de `evidence/stack-install.json` no es evidencia de la cláusula «files the person owns, including the
project's own manifest, SHALL NOT be written at any point».

**Qué haría falta.** Medir digestos antes y después sobre una carpeta que sí tenga manifiesto y dependencias,
como `verify-native-journeys.mjs` ya hace con `hashesOf`.

A favor: `evidence/validation.md` lo redacta con honestidad —«`package.json` del proyecto … **no existe: no se
escribió**»— y no afirma más de lo medido. Lo que sobreafirma es el nombre del campo en el JSON
(`projectManifestUntouched`) y la cláusula de spec que se apoya en él.

#### M5 — Once de doce mutaciones propias sobreviven las 118 pruebas, cinco de ellas sobre la puerta de instalación

Apliqué 12 mutaciones distintas de las 26 declaradas, corrí la suite completa con cada una y restauré el archivo
después. Sobrevivieron 11:

| Mutación | Archivo | Resultado |
| --- | --- | --- |
| quitar `--ignore-scripts` de `npm ci` | `runtime/stack.mjs:113` | **sobrevive** |
| quitar `--bin-links=false` | `runtime/stack.mjs:113` | **sobrevive** |
| apuntar a otro registro | `runtime/stack.mjs:114` | **sobrevive** |
| quitar `--min-release-age=7` | `runtime/stack.mjs:114` | **sobrevive** |
| **no verificar el árbol recién descargado antes de moverlo** | `runtime/stack.mjs:118` | **sobrevive** |
| `previewStack` sin proyecto preparado | `desktop/service.mjs` | **sobrevive** |
| `applyStack` sin herramientas verificadas | `desktop/service.mjs` | **sobrevive** |
| el catálogo miente sobre el tamaño de `web-interface` | `runtime/stack-catalog.mjs` | **sobrevive** |
| el catálogo miente sobre el digesto de `web-interface` | `runtime/stack-catalog.mjs` | **sobrevive** |
| `validateRecord` acepta cualquier forma | `runtime/stack.mjs:37` | **sobrevive** |
| `rm(..., force:true)` en el retiro | `runtime/stack.mjs:146` | **sobrevive** |
| un plan usado no se consume (rechazar y luego instalar) | `desktop/service.mjs:346` | detectada |

La quinta es la que más importa. La mutación declarada
`the-installed-tree-is-accepted-without-comparing-its-digest` cambia el **cuerpo** de `verifyStackTree` a
`if (false)`, y eso lo detecta `qa/stack.mjs` por las rutas de `inspect` y `remove`. Pero quitar la **llamada
dentro de `install`** —de modo que lo que acaba de bajar de la red se renombre a su sitio sin compararse contra
el pin— no lo detecta nada. La spec dice «the installed tree SHALL be compared against its pinned digest before
being moved into place»; esa cláusula concreta no está anclada por ninguna prueba.

Contexto que calibra la severidad: `runtime/toolchain.mjs:50-51` tiene exactamente la misma invocación sin
pruebas, así que la debilidad de los flags es práctica heredada, no una regresión nueva. Lo que sí es nuevo es
que esta spec convierte «lifecycle scripts disabled» en un SHALL explícito.

Y para que quede claro qué se está diciendo y qué no: **las 26 mutaciones declaradas son legítimas**. Re-ejecuté
`npm run evidence:mutations` desde cero y obtuve 26/26 detectadas, `restored: true` y exactamente las mismas
atribuciones a pruebas con nombre que trae el `evidence/` entregado. El problema no es que las 26 mientan, es
que el conjunto elegido deja fuera la puerta por donde entra el código de terceros.

**Qué haría falta.** Inyectar el ejecutor de procesos y afirmar el argv exacto; y una prueba que ponga un
payload distinto del pin y compruebe que `install` se niega a renombrarlo.

#### M6 — El asistente deja arrastrar una tecnología a un perfil que no la ofrece, y el bloqueo cae en otra pantalla con el remedio equivocado

**Dónde.** `apps/companion/ui/app.mjs`, `showSetup`. El radio de perfil es `onChange:()=>{s.profile=id;}` —sin
volver a renderizar— mientras que el radio de tecnología sí llama a `showSetup()`. Así, `offered` y
`s.stack.requested` quedan desfasados.

**Reproducido con el renderer y el servicio reales** (Playwright, canal msedge):

1. Perfil «Software o página web» → «Sí, ya sé cuál quiero» → marcar TypeScript.
2. Cambiar el perfil a «Investigación».
   → `tras cambiar a Investigación, la casilla de TypeScript sigue en pantalla: true | marcada: true`
3. Continuar, elegir carpeta, «Revisar preparación →».
   → la pantalla se queda en **«Tu trabajo empieza en una carpeta»** con:

```
Esa tecnología no se ofrece para este tipo de proyecto.
Revisa la carpeta y vuelve a comprobar.
STACK_INVALID
```

El error es correcto (`normalizeSelection` hace bien su trabajo), pero la persona lo recibe en la pantalla de
**carpeta**, que no tiene ningún control de tecnología, con un remedio que apunta a la carpeta —el
`action` por defecto de `PreparationError` (`engine/files.mjs:11`), porque las cuatro llamadas
`fail('STACK_INVALID', …)` no pasan uno—. Para salir hay que adivinar que se vuelve al asistente a desmarcar una
casilla que la propia interfaz dejó marcada. Sin errores de página: el flujo simplemente se atasca.

**Qué haría falta.** Que el cambio de perfil vuelva a renderizar y descarte las tecnologías que ya no se ofrecen
—una línea, simétrica con lo que ya hace el radio de tecnología—, y dar a `STACK_INVALID` un `action` que
señale el asistente.

### Minor

#### m1 — `tasks.md` sin una sola casilla marcada
0 de 27, con el trabajo dado por hecho. Los tres changes archivados más recientes llevan 27/27, 18/18 y 31/31.
No queda registro de qué se hizo. Arreglo: artefactos OpenSpec.

#### m2 — Tareas y diseño que el código no sostiene
- **`tasks.md` 4.1 y `design.md` §4** prometen mutaciones para «instalar sin revisión aceptada» y «instalar tras
  un rechazo». Ninguna de las dos existe en `MUTATIONS`. La propiedad sí está cubierta por una aserción de
  `qa/stack.mjs` (`applyStack` tras `declineStack` → `PLAN_UNKNOWN`): fue la única de mis doce mutaciones que la
  suite detectó. Lo que falta es la evidencia declarada, no el comportamiento.
- **`tasks.md` 4.3, `design.md` §4 y la sección *Validation* del issue** prometen recorridos nativos con tres
  respuestas de tecnología. `verify-native-journeys.mjs:730-747` corre la **misma** respuesta (`too-early`) en
  los cinco perfiles, y `evidence/native-journeys.json` lo confirma: los cinco registran la misma frase de «es
  pronto». Los tres caminos se miden en `verify-stack-install.mjs`, a nivel de servicio del artefacto instalado,
  no como recorrido nativo.

#### m3 — Con el registro ilegible, la pantalla afirma que no hay nada instalado
Ejecutado: con un árbol de `typed-code` en disco y `.project-os/companion/stack.json` corrupto,
`status.stack` queda en `{status:'requires-action', error:{code:'STACK_RECORD', …}}`. En `stackPanel`
(`ui/app.mjs`) `record` sale `null`, así que se pinta «Todavía no hay ninguna tecnología instalada en este
proyecto.» —o la frase de «es pronto»— junto al remedio del error. Justo la afirmación que no puede hacerse es
la que hace. Arreglo: cuando `s.stack.error` exista, decir que el registro no se pudo leer y no afirmar nada
sobre lo instalado.

#### m4 — Un registro forjado pinta texto arbitrario en la pantalla del proyecto
`validateRecord` no comprueba `id` contra el catálogo, `summary()` lo devuelve y `stackName()` cae al id crudo.
Ejecutado: un `installed:[{id:'TEXTO ARBITRARIO PUESTO EN EL ARCHIVO', …}]` llega a `status.stack.installed`.
Es `textContent`, así que no hay inyección de HTML, y el botón «Retirar» falla cerrado con `STACK_UNKNOWN`.
Cosmético. Arreglo: filtrar en `validateRecord` los ids que no estén en el catálogo.

#### m5 — La pantalla de revisión de tecnología no entra en el contrato de interfaz
El stub de `verify-interface-contract.mjs:321-328` expone `stackCatalog` pero no `previewStack`, así que
`showStackReview` nunca se renderiza ahí: las 9 pantallas contadas no la incluyen. Sí la recorre
`verify-ui.mjs` (vocabulario, contraste y desbordamiento comprobados), así que el hueco es de la tabla de
nombres y conteo, no de cobertura total.

#### m6 — La deriva del catálogo no la detecta nada automático
`evidence/validation.md` sí reporta los tres pines medidos a mano con `node scripts/pin-stack.mjs`, con digesto
repetido entre corridas, y sus números concuerdan con el catálogo. El hueco no es que no se midieran: es que
nada **vuelve** a medirlos. `pin-stack.mjs` imprime «NO coincide con el catálogo» y sale 0, y ninguna prueba
compara `treeHash`, `installedBytes`, `downloadBytes` ni `files` contra la realidad. De ahí que las dos
mutaciones de catálogo de M5 sobrevivan: hoy se puede cambiar el tamaño o el digesto de `web-interface` en el
código y las 118 pruebas siguen verdes, mientras la pantalla enseña un número falso antes de instalar. Arreglo:
salida distinta de 0 en `pin-stack.mjs` cuando `matchesCatalogue` sea falso, para que al menos la herramienta
que sí mide pueda usarse como compuerta.

---

## Lo que no pude comprobar

- **`web-interface` y `http-service` no los instalé yo de extremo a extremo**; solo `typed-code`, dos veces.
  `evidence/validation.md` reporta los tres pines medidos con `pin-stack.mjs` y repetidos entre corridas, pero
  eso no lo re-ejecuté. Lo que sí verifiqué a mano en las tres: el catálogo concuerda con sus lockfiles en
  cierre, licencias, integridad fijada y ausencia de scripts y de restricciones `os`/`cpu`. **Coincide en las
  tres**, paquete por paquete.
- **El empaquetado real.** `validation.md` afirma que `npm run pack` produce los seis archivos de recursos con
  los mismos bytes y que la comprobación completa se repitió contra el artefacto empaquetado. No corrí `pack`;
  todo lo mío se midió contra el artefacto instalado sincronizado.
- **Determinismo entre sistemas operativos y versiones de npm** de los árboles fijados. `design.md` §5 ya lo
  declara como medido en un solo equipo; no lo amplié.
- **El instalador de Windows y el sandbox de Electron**: fuera del alcance de lo que ejecuté.
- **Que la aplicación de escritorio que se abre lea de verdad la carpeta**: sigue necesitando que alguien mire
  la ventana, igual que en #106.

---

## Fortalezas que mitigan riesgos documentados

Solo las que cancelan directamente un riesgo del `proposal.md` o una pregunta de la revisión, según el playbook.

- **Riesgo «quitar la web puede dejar a alguien sin salida»: mitigado, y la sustitución es estructuralmente
  inalcanzable.** `openExternal` tiene un único punto de llamada (`service.mjs:668`), fijo a `DESTINATIONS.web`,
  alcanzable solo con `preview.mode==='web'`, que exige `input.agent===WEB_AGENT`. `main.mjs:38-39` deniega
  `setWindowOpenHandler` y `will-navigate`. No encontré ninguna otra puerta a un navegador. La ruta manual copia
  el prompt y lo dice.
- **Riesgo «un retiro puede llevarse por delante algo de la persona»: mitigado, e intenté romperlo sin éxito.**
  La ruta de borrado se ancla en el catálogo congelado (`known(id)` + `assertPath(root, entry.relative)`), nunca
  en el registro, y `verifyStackTree` la condiciona. Ni un registro corrupto ni uno forjado consiguen que se
  borre nada: el peor resultado es texto cosmético y un botón que falla cerrado.
- **Riesgo «una recomendación puede volverse una instalación por omisión»: mitigado y medido.** Rechazar deja el
  veredicto idéntico campo por campo —`required`, `stages`, `witnessTruncated`, `witnessed`, `saved`, `error`—,
  no solo `stages` como afirma la prueba de la suite. `stack` no está en `REQUIRED_STAGES`.
- **La recomendación no depende del modelo.** Verificado por lectura: ni `runtime/stack-catalog.mjs` ni
  `runtime/stack.mjs` importan nada de inferencia, y `previewStack` no consulta modelos.
- **Higiene de rutas.** Ni un solo path absoluto, nombre de cuenta o identificador de sesión en los archivos
  versionados del change, PNG incluidos: inspeccioné los cinco por chunks y por píxeles, y las rutas aparecen
  como `<localappdata>/…`. De hecho la compuerta de neutralidad del repositorio detectó un archivo temporal
  *mío* con una ruta absoluta y falló, lo que demuestra que esa compuerta funciona.
- **CI, protección de rama y la compuerta `CI / required` no se tocan**: `git diff main -- .github/` está vacío.

---

## Veredicto

# FAIL

Un **Blocker** (B1) y cinco **Major** (M2–M6). El defecto central de #100 está bien resuelto —la sustitución no
está desactivada, está ausente, y eso lo comprobé— y la instalación proporcionada funciona de verdad sobre una
carpeta real sin tocar nada de la persona. Lo que falla es la mitad que este cambio prometió explícitamente: que
la causa dicha sea la que aplica, y que la medición mida lo que dice medir.

Tres de los seis hallazgos no son fallos de comportamiento sino de **evidencia**: el arnés de aperturas pasa con
el defecto restaurado entero, el manifiesto se declara intacto con una comprobación que no puede detectar que
haya cambiado, y once mutaciones propias —cinco sobre la puerta de instalación— sobreviven las 118 pruebas. La
diferencia importa porque el criterio de aceptación del issue no dice «que no vuelva», dice «y existe una prueba
que falla si vuelve a ocurrir».

**No es aconsejable archivar (`/opsx:archive`) en este estado.** Antes hace falta, como mínimo:

1. Arreglar B1: la causa se deriva del rechazo concreto, los rechazos de Codex llevan su editor verificado, y la
   pantalla vuelve a mostrar `unverified.message`. Con una prueba que ejercite el lanzador **real**.
2. Arreglar M2: una sonda que falla es `not-measured`, no `not-installed`.
3. Arreglar M3 y M4: `measured:false` es un finding; el manifiesto se comprueba por digesto sobre una carpeta
   que sí lo tenga.
4. Anclar con pruebas el argv de `npm ci` y la verificación del payload antes del `rename` (M5).
5. Arreglar M6: el cambio de perfil vuelve a renderizar y descarta lo que ya no se ofrece.
6. Marcar `tasks.md` con lo que de verdad se hizo, corregir `design.md` §4 y `tasks.md` 4.3 para que describan la
   evidencia que existe, y registrar estos hallazgos en `blueprint/core/project-os/debt-registry.json`, hoy
   vacío (tarea 4.7).
