# ADR 0002: gestor de paquetes frente al riesgo de cadena de suministro

**En pocas palabras:** npm se conserva en las tres superficies. Los controles que motivaban migrar a pnpm
existen hoy en npm, y pnpm 11 no soporta la mitad baja del rango de Node que este proyecto declara. La
decisión se revisa el 1 de marzo de 2027.

**Úsalo si:** vas a proponer cambiar de gestor de paquetes, o quieres saber qué protege realmente cada uno.

- Status: accepted
- Date: 2026-08-30
- Decisión: **rechazar la migración en las tres superficies, con condición de revisión fechada**
- Origen: [#19](https://github.com/IgnacioBarEsp/project-engineering-os/issues/19)

## Context

La premisa a evaluar era que npm sufre ataques con frecuencia y que migrar a pnpm reduciría esa exposición.

La premisa tiene una parte cierta y una falsa. La cierta: el ecosistema npm ha sido el blanco de campañas
reales y repetidas. La falsa: esos ataques —typosquatting, cuentas de mantenedor comprometidas, paquetes
maliciosos, `postinstall` hostiles, dependency confusion— son ataques **al registro**, no al CLI. pnpm, Yarn
y Bun instalan desde `registry.npmjs.org`. Cambiar de cliente no retira esa superficie.

Lo que sí cambia entre gestores son los **defaults** y los **controles disponibles**. Esta decisión mide esa
diferencia contra tres superficies independientes y contra la línea base que este repositorio ya aplica.

### Línea base vigente

Lo que ya está en su sitio, y contra lo que hay que medir cualquier ganancia:

- `npm ci --ignore-scripts` en `ci.yml` y en `release.yml`: los install scripts no se ejecutan en CI.
- Actions fijadas por SHA.
- `allowScripts` en `blueprint/core/package.json` fijado a versión exacta, verificado por
  `scripts/check-package.mjs` y `test/supply-chain.test.mjs`.
- Publicación con Trusted Publishing por OIDC, `publishConfig.provenance: true` y `SHA256SUMS` verificable.
- Cero dependencias de runtime en el paquete publicado.
- Gate de auditoría que bloquea riesgo `high` o `critical`, con política en
  `config/dependency-audit-policy.json`.

## Matriz comparativa

Actualización del 5 de septiembre de 2026: la [guía de instalación](../INSTALL_HARDENING.md) precisa
los defaults con fuentes y sondas actuales. No debe interpretarse el bloqueo de subdependencias de pnpm
como una prohibición de todas las fuentes, ni hardened mode de Yarn como una allowlist de Git. Yarn 4.18.0
devolvió `enableScripts=false`; esta observación no demuestra el default de todas las versiones desde v2.

Fuentes oficiales consultadas el 30 de agosto de 2026. Las filas marcadas *medido* se comprobaron
ejecutando el comando en esta máquina y su salida está en la sección de sondas.

| Eje | npm 11.17 (hoy) | npm 12 (jul 2026) | pnpm 11 (abr 2026) | Yarn Berry 4 |
| --- | --- | --- | --- | --- |
| Install scripts de dependencias | ejecutan; `ignore-scripts=false` *medido* | **no ejecutan**; `allowScripts` por defecto en off, con `npm approve-scripts` | no ejecutan desde v10; allowlist con `allowBuilds` | `enableScripts: false` comprobado en 4.18.0; workspaces mantienen scripts |
| Cuarentena por antigüedad de versión | **existe**: `min-release-age`, default `null` *medido* | igual | **existe y viene activa**: `minimumReleaseAge` default `1440` min | existe: `npmMinimalAgeGate` |
| Exclusiones de la cuarentena | `min-release-age-exclude` *medido* | igual | `minimumReleaseAgeExclude` | sí |
| Dependencias de origen exótico | permitidas; `allow-git=all`, `allow-remote=all` *medido* | **bloqueadas**: ambas pasan a `none` | bloqueadas: `blockExoticSubdeps: true` | restringible con hardened mode |
| Lockfile determinista | `package-lock.json`, ya versionado | igual | `pnpm-lock.yaml` | `yarn.lock` |
| Provenance al publicar | sí, automática con Trusted Publishing | igual | sí | sí, desde la resolución de yarnpkg/berry#5430 |
| Trusted Publishing por OIDC a npmjs | sí, requiere npm ≥ 11.5.1 | sí | sí, **con una regresión en 2026** que rompió el flujo (pnpm/pnpm#11513) | sí |
| Preinstalado en el runner ubuntu-24.04 | **sí** (Npm 10.9.8) | vía `setup-node` | **no aparece en la imagen** | sí (Yarn 1.22.22) |
| Compatible con `engines: ^20.20.0 \|\| >=22.22.0` | sí | sí | **no: pnpm 11 requiere Node ≥ 22** | sí |

Dos celdas deciden casi todo:

1. **La cuarentena ya existe en npm.** `min-release-age` entró en **npm 11.10.0, el 11 de febrero de 2026**
   (npm/cli#8965). La diferencia con pnpm no es de capacidad sino de default: pnpm 11 la trae encendida a
   1440 minutos y npm la trae en `null`. Un ajuste de una línea en `.npmrc` cierra esa distancia sin migrar
   nada.
2. **pnpm 11 no soporta Node 20.** La matriz de CI ejecuta Node 20.20.0 y 22.22.0 sobre tres sistemas
   operativos. Adoptar pnpm 11 rompería tres de las seis combinaciones y contradiría el `engines` publicado.
   pnpm 12, reescrito en Rust, restaura Node 18 y 20, pero es demasiado reciente para apoyar en él una
   migración de la cadena de publicación.

## Vectores que ningún cambio de gestor mitiga

Esta es la sección que impide tomar la decisión sobre una ganancia inexistente. Ninguno de los cuatro
gestores retira lo siguiente, porque los cuatro resuelven contra el mismo registro:

| Vector | Por qué el gestor no lo mitiga |
| --- | --- |
| Cuenta de mantenedor comprometida | La versión maliciosa es legítima para el registro y para cualquier cliente. |
| Typosquatting | El nombre equivocado se resuelve igual en los cuatro. |
| Dependency confusion | Depende de la configuración de registros, no del cliente. |
| Código malicioso en el propio paquete | Se ejecuta al importar, no al instalar; bloquear install scripts no lo alcanza. |
| Compromiso del registro | Superficie compartida por definición. |
| Compromiso del runner de CI | Anterior al gestor en la cadena. |

La cuarentena por antigüedad **retrasa** los tres primeros, no los elimina, y ese retraso está disponible en
npm hoy.

## Contraste con el triage real

El issue pedía cuantificar cuántas alertas reales habría evitado otro gestor. El triage del 18 de agosto de
2026, en `docs/security/SUPPLY_CHAIN_TRIAGE_2026-08-18.md`, registra nueve señales. Aplicando cada una a la
pregunta:

| Señal | ¿La habría evitado otro gestor? |
| --- | --- |
| OpenSpec como dependencia del paquete | No: era atribución incorrecta, no una vulnerabilidad. |
| `fast-uri` 3.0.0–3.1.4, GHSA-7p8r-x3mc-p8w7 | No: vulnerabilidad publicada en una dependencia de desarrollo; se remedió con el lockfile. La cuarentena no aplica a una versión antigua ya instalada. |
| Telemetría de `posthog-node` | No: es comportamiento en tiempo de ejecución de OpenSpec, ya acotado por el wrapper. |
| Cadenas con URL | No: informativa. |
| Override de Socket para `is-interactive` | No: promoción de registro, no remediación. |
| Acceso a shell en `@inquirer/external-editor` | No: esperado y ausente en CI. |
| Install script de OpenSpec | **Parcialmente**: pnpm y Yarn lo bloquean por default. Aquí ya está fijado por `allowScripts` a versión exacta y verificado por prueba, y CI usa `--ignore-scripts`. |
| ReDoS en `picomatch@2.3.2` | No: sin advisory reproducible. |
| Acceso de red en `@posthog/core` | No: privacidad en tiempo de ejecución. |

**Nueve señales, cero que otro gestor hubiera evitado y una donde el control ya estaba puesto por otra vía.**
Ese es el dato que el issue pedía, y apunta en la dirección contraria a migrar.

## Decision

### Superficie 1 — desarrollo y release upstream: **rechazar la migración**

Se conserva npm. Razones, en orden de peso:

1. pnpm 11 no soporta Node 20 y rompería la mitad de la matriz de CI y el `engines` publicado.
2. Los tres controles que motivaban la migración —bloqueo de install scripts, bloqueo de orígenes exóticos y
   cuarentena— existen en npm: los dos primeros como default desde v12, la tercera como ajuste desde v11.
3. La cadena de publicación depende de Trusted Publishing por OIDC contra npmjs, y pnpm la rompió en 2026
   con una regresión que necesitó corrección aguas arriba. La superficie que menos tolera un cliente en
   evolución es precisamente la de publicación.
4. pnpm no está preinstalado en el runner, así que la migración añade un paso de instalación a cada job.

Un hallazgo colateral de la matriz, medido y no supuesto: `release.yml` fija `npm install --global npm@11.5.1`,
publicado el 24 de julio de **2025**. La cuarentena llegó en 11.10.0 y `--allow-remote` en 11.15.0, ambas de
2026. El npm con el que este proyecto publica es anterior a los dos controles que esta decisión considera
material, y esa es una brecha propia que no depende de ningún debate sobre gestores.

Esto **no** es "no hacer nada". La misma matriz identifica tres refuerzos concretos, cada uno con issue
propio (ver más abajo): fijar la cuarentena, adoptar los defaults de npm v12 de forma explícita, y actualizar
el npm fijado en la publicación, que hoy es anterior a la aparición de la cuarentena.

### Superficie 2 — repositorios generados: **rechazar la migración**

Se conserva npm, y por una razón adicional a las anteriores: **imponer un gestor sería un default de
producto**, y el núcleo universal tiene prohibido introducirlos.

El acoplamiento real resultó menor de lo que el planteamiento suponía. Los cuatro scripts `openspec:*` del
blueprint invocan `node ./.project-constructor/openspec.mjs`, un wrapper propio, no `npm exec`. El único
script que menciona npm es `project-os:check`, que encadena `npm run`, forma que funciona igual bajo pnpm,
Yarn y Bun.

Queda una decisión de consumidor, no de upstream: un repositorio generado puede adoptar el gestor que
prefiera. Lo que el upstream sí debe hacer es documentar el endurecimiento **agnóstico del gestor**, para que
esa elección no cueste seguridad.

### Superficie 3 — invocación del CLI por el consumidor: **rechazar el cambio, porque no hay nada que cambiar**

`pnpm create` resuelve `create-*` con la misma convención que `npm create`, y lo mismo hacen `yarn create` y
`bunx`. El paquete ya es agnóstico en la frontera de invocación: quien use pnpm ejecuta
`pnpm create project-engineering-os` contra el mismo tarball publicado, sin que el upstream cambie nada.

Tocar el nombre o la forma de invocación sería breaking bajo SemVer y no compraría ninguna propiedad de
seguridad.

### Condición de revisión

Esta decisión se revisa el **1 de marzo de 2027**, o antes si ocurre cualquiera de estos hechos:

- npm deja de publicar un control que pnpm o Yarn sí ofrecen y que la matriz clasifique como material;
- pnpm 12 acumula al menos dos trimestres de estabilidad con Node 20 soportado y OIDC sin regresiones;
- un incidente real alcanza a este repositorio por un vector que otro gestor hubiera bloqueado.

El tercero es el único que justificaría revisar antes de la fecha.

## Consequences

- npm se conserva en las tres superficies; no hay migración, ni parcial ni escalonada, ni dos toolchains que
  mantener.
- La ganancia de seguridad que motivaba el issue se obtiene igualmente, por configuración de npm en vez de
  por cambio de cliente, y a un costo mucho menor.
- Quedan tres refuerzos identificados y **no ejecutados aquí**, cada uno con su propio issue: este ADR decide,
  no implementa.
- La decisión queda fechada y con condición de revisión, de modo que "conservar npm" no se convierta en una
  postura por inercia.
- El endurecimiento agnóstico del gestor para repositorios consumidores queda pendiente de documentar, y es
  la única pieza que el upstream debe a quien elija otro gestor.

## Sondas locales reproducibles

Ejecutadas el 30 de agosto de 2026 con npm 11.17.0 sobre Node v26.4.0.

```text
$ npm config get min-release-age
null

$ npm config get min-release-age-exclude
(vacío)

$ npm config get allow-git
all

$ npm config get allow-remote
all

$ npm config get ignore-scripts
false
```

Comprobación de que `min-release-age` es un ajuste reconocido y no una clave ignorada, contrastándolo con
una inventada en el mismo `.npmrc`:

```text
$ printf 'min-release-age=7\nnot-a-real-npm-config=1\n' > .npmrc
$ npm config get min-release-age
npm warn Unknown project config "not-a-real-npm-config". This will stop working in the next major version of npm.
7
```

npm avisa por la clave inventada y acepta `min-release-age` en silencio: el ajuste existe en el cliente
instalado hoy.

## Fuentes

Consultadas el 30 de agosto de 2026.

- [Config reference de npm CLI v11](https://docs.npmjs.com/cli/v11/using-npm/config/) — `min-release-age`
  default `null`, `min-release-age-exclude`, `before`, `allow-git` default `all`, `allow-remote` default
  `all`, `ignore-scripts` default `false`.
- [Release de npm CLI v11.10.0](https://github.com/npm/cli/releases/tag/v11.10.0), 11 de febrero de 2026 —
  "add min-release-age (#8965)". Fechas de publicación de cada 11.x contrastadas con `npm view npm time`.
- [Upcoming breaking changes for npm v12](https://github.blog/changelog/2026-06-09-upcoming-breaking-changes-for-npm-v12/),
  publicado el 9 de junio de 2026 — `allowScripts` pasa a off, `--allow-git` y `--allow-remote` pasan a
  `none`, salida estimada en julio de 2026.
- [Trusted publishing for npm packages](https://docs.npmjs.com/trusted-publishers/) — requiere npm ≥ 11.5.1 y
  publica provenance automáticamente.
- [Mitigating supply chain attacks, pnpm](https://pnpm.io/supply-chain-security) — `minimumReleaseAge`,
  `minimumReleaseAgeExclude`, `blockExoticSubdeps`, `trustPolicy`, `namedRegistries`.
- [pnpm 11.0 release notes](https://pnpm.io/blog/releases/11.0), 28 de abril de 2026 — `minimumReleaseAge`
  default `1440`, `blockExoticSubdeps` default `true`.
- [pnpm installation and compatibility](https://pnpm.io/installation) — pnpm 11 requiere Node ≥ 22; pnpm 12
  restaura Node 18 y 20.
- [pnpm/pnpm#11513](https://github.com/pnpm/pnpm/issues/11513) — Trusted Publishing por OIDC roto en pnpm 11,
  corregido en pnpm/pnpm#11526.
- [pnpm create](https://pnpm.io/cli/create) — resuelve `create-*` con la convención de npm.
- [yarnpkg/berry#5430](https://github.com/yarnpkg/berry/issues/5430) — soporte de provenance al publicar,
  cerrado por yarnpkg/berry#6750.
- [Imagen ubuntu-24.04 de actions/runner-images](https://github.com/actions/runner-images/blob/main/images/ubuntu/Ubuntu2404-Readme.md)
  — Node.js 22.23.2, Npm 10.9.8, Yarn 1.22.22; pnpm y Bun no figuran.

## Trabajo derivado

El ADR decide y no implementa. Los tres refuerzos que la matriz identifica viven en issues separados,
enlazados a [#19](https://github.com/IgnacioBarEsp/project-engineering-os/issues/19). Los tres declaran esa
dependencia, así que su Definition of Ready pasa cuando este ADR se cierra.

| Issue | Qué corrige | Por qué |
| --- | --- | --- |
| [#58](https://github.com/IgnacioBarEsp/project-engineering-os/issues/58) | El npm fijado para publicar es de julio de 2025 | Es anterior a la cuarentena y al bloqueo de dependencias desde URL, los dos controles que esta decisión considera materiales. |
| [#59](https://github.com/IgnacioBarEsp/project-engineering-os/issues/59) | La cuarentena por antigüedad no está configurada | Rechazar la migración solo es honesto si además se adopta el control equivalente que ya existe. |
| [#60](https://github.com/IgnacioBarEsp/project-engineering-os/issues/60) | No hay guía de endurecimiento agnóstica del gestor | Un consumidor puede elegir gestor, y esa libertad hoy le cuesta defaults de seguridad que nadie le explica. |

La decisión de ownership del paquete publicado está en [ADR 0001](0001-public-distribution.md). El triage por
señal que alimenta la sección de contraste está en
[triage de cadena de suministro](../security/SUPPLY_CHAIN_TRIAGE_2026-08-18.md). Las reglas de costo y
licencia para cualquier dependencia nueva están en [costos y licencias](../COSTS_AND_LICENSES.md).
