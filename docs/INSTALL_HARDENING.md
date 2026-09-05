# Instalación: controles y decisiones del consumidor

Elige el gestor según tu proyecto. Esta guía no cambia el blueprint ni promete que cambiar de gestor
elimine el riesgo. Comprueba la versión instalada: los defaults cambian entre releases.

Consulta de fuentes y sondas: **2026-09-05**. npm 11.19.1 y Yarn 4.18.0 se comprobaron localmente;
pnpm y Bun se describen desde sus referencias oficiales, sin afirmar una prueba de instalación local.

| Gestor y referencia | Scripts de dependencias | Antigüedad mínima | Origen de dependencias |
| --- | --- | --- | --- |
| npm 11.19.1 | `ignore-scripts=false`; usar `--ignore-scripts`. `allowScripts` permite autorizaciones por paquete/versión. | `min-release-age=null`, en días; `min-release-age-exclude` excluye nombres/patrones. | `allow-git=all`, `allow-remote=all`; `none` los bloquea y `root` limita a dependencias directas. |
| pnpm 11/12, referencia actual | `allowBuilds` autoriza o deniega; `dangerouslyAllowAllBuilds=false`. `strictDepBuilds=true` rechaza scripts sin revisar. | `minimumReleaseAge=1440`, en minutos; el default implícito es no estricto. Declarar `minimumReleaseAgeStrict=true` evita fallback; `minimumReleaseAgeIgnoreMissingTime=false` rechaza metadata sin fecha. | `blockExoticSubdeps=true` limita orígenes exóticos transitivos; las dependencias directas y fuentes confiables tienen tratamiento distinto. |
| Yarn 4.18.0 | `enableScripts=false`; los workspaces aún pueden ejecutar scripts. Excepciones mediante `dependenciesMeta`. | `npmMinimalAgeGate=1440`, en minutos; `npmPreapprovedPackages=[]`. El código actual también admite duración como `1d`. | `approvedGitRepositories=[]` bloquea Git no aprobado. No equivale a bloquear todos los protocolos: revisar también URLs y `networkSettings`. |
| Bun, referencia actual | Sin `trustedDependencies` aplica una lista incorporada. `trustedDependencies: []` la vacía; `--ignore-scripts` desactiva scripts también del proyecto. | `install.minimumReleaseAge=null`, en segundos; `minimumReleaseAgeExcludes=[]`. | Admite Git y tarballs. La confianza para ejecutar scripts no es una prohibición de descargarlos. La referencia consultada no ofrece aquí un equivalente general a `allow-remote=none`; revisar procedencia y lockfile. |

Fuentes de cada fila, consultadas en la fecha indicada:

- npm: [configuración v11](https://docs.npmjs.com/cli/v11/using-npm/config/) y
  [npm install](https://docs.npmjs.com/cli/v11/commands/npm-install/).
- pnpm: [resolución](https://pnpm.io/settings/dependency-resolution),
  [builds](https://pnpm.io/settings/build) y [ubicación de ajustes](https://pnpm.io/settings).
  Desde v11 los ajustes de política van en `pnpm-workspace.yaml`; `.npmrc` conserva registro/autenticación.
- Yarn: [configuración](https://yarnpkg.com/configuration/yarnrc),
  [default de antigüedad en el código](https://github.com/yarnpkg/berry/blob/master/packages/plugin-npm/sources/index.ts)
  y [validación de repositorios Git](https://github.com/yarnpkg/berry/blob/master/packages/plugin-git/sources/gitUtils.ts).
  Los ejemplos de la web no siempre son defaults: `1w` es un ejemplo; la sonda de 4.18.0 devolvió `1440`.
- Bun: [scripts](https://bun.com/docs/pm/lifecycle),
  [bunfig](https://bun.com/docs/runtime/bunfig) y [fuentes admitidas](https://bun.com/docs/pm/cli/add).

Para aplicar una política, fija primero cliente y versión. Declara los controles en la configuración
del proyecto, revisa las excepciones y ejecuta una instalación reproducible. Conserva el lockfile y revisa
sus cambios. Prueba que una dependencia demasiado reciente se rechaza: una clave ignorada no protege.
No traduzcas unidades entre gestores sin convertirlas: siete días son 10080 minutos o 604800 segundos.

El blueprint incluye scripts y un lockfile npm como base verificable. La elección de otro gestor requiere
validar su propio lockfile y la invocación de scripts; esta tabla no certifica equivalencia automática de
todos los comandos, adaptadores o modos de publicación.

## Política del upstream

Este repositorio fija **npm 11.19.1** en CI y en los dos jobs que construyen/publican la release. La versión
del registro es del 26 de agosto, supera siete días de rodaje y admite toda nuestra matriz de Node.
El [parche 11.19.1](https://github.com/npm/cli/releases/tag/v11.19.1) corrige destinos explícitos de `pack`
y actualiza dependencias. Se mantienen scripts deshabilitados, OIDC, provenance, checksum y comparación
del tarball canónico. La fijación se revisa cada trimestre, antes de publicar y ante un advisory del cliente.

`.npmrc` declara `min-release-age=7` solo aquí. Elegimos una semana para reducir exposición temprana sin
demorar indefinidamente actualizaciones. No se copia al consumidor, no se publica en el paquete y no cambia
preferencias globales. Los scripts de publicación directa invocan npm: verifica la versión del cliente en
tu entorno antes de ensayar fuera de CI.

Medición local con npm 11.19.1:

```text
npm config get min-release-age -> 7
npm ci --ignore-scripts -> exit 0, 85 paquetes, 0 vulnerabilidades; lockfile sin cambios
npm run check:install-policy -> PASS
versión de hace una hora -> rechazada
excepción para paquete A -> A permitido; B continúa rechazado
npm ci sobre el lock autorizado de A -> PASS, sin excluir A y sin modificar el lock
```

La última línea importa: **la cuarentena controla resolución nueva, no revalida la edad de cada paquete
ya fijado por `npm ci`**. La auditoría y la revisión del lock siguen siendo necesarias. La sonda reproducible
usa un registro local temporal y nunca publica paquetes ni requiere credenciales.

Para un parche urgente, documenta advisory, paquete, versión exacta, procedencia, responsable, motivo y
evidencia en el issue. Ejecuta una excepción de un solo comando, por ejemplo con los valores reales del caso:

```text
npm install paquete@version-exacta --save-exact --ignore-scripts --min-release-age-exclude=paquete
```

El filtro de exclusión de npm es por nombre, **no por versión**; fijar `paquete@version-exacta` restringe
esa operación. Revisa también sus transitivas. No guardes comodines ni exclusiones permanentes en `.npmrc`.
Después verifica diff, auditoría, pruebas y fixture. La siguiente operación recupera la política normal.

## Lo que estos controles no garantizan

Ni la espera ni el bloqueo de scripts demuestran que el código sea confiable al importarlo. Tampoco
resuelven por sí solos nombres confundibles, cuentas comprometidas, filtraciones de credenciales,
dependency confusion, registros hostiles o una autorización demasiado amplia. El lockfile reproduce
lo aprobado; también puede reproducir un error. Provenance acredita origen, no inocuidad.

Relaciona esta guía con [la decisión del upstream](adr/0002-package-manager-supply-chain.md) y con
[el procedimiento de releases](RELEASES.md). Los consumidores son dueños de sus políticas y excepciones.
