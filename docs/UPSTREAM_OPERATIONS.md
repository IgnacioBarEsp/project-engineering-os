# Operación de controles upstream

El upstream adopta configuración propia en `.project-os/`; no se ejecuta bootstrap sobre este árbol.
`readiness-policy.json`, `profiles.json` y `github/product-os.json` se sembraron desde el blueprint el
2026-09-04 y desde entonces pertenecen a este repositorio. No se sincronizan automáticamente con la semilla.

```sh
node bin/project-os.mjs readiness-check --phase propose --issue 49 --target .
node bin/project-os.mjs debt check --root .
npm run check:debt
node bin/project-os.mjs readiness-check --phase archive --change nombre-del-change --target .
```

La fase archive exige un assessment capturado cuando la deuda está configurada. `--run-local` incluye
gates que requieren un consumidor bootstrapeado; ejecútalos en el fixture, no sobre el upstream. Para OPSX:

```sh
node bin/project-os.mjs opsx-check --target ruta-al-consumidor
```

El script upstream `npm run opsx-check` fue retirado por apuntar a un layout incompatible. El CLI publicado
y el script de los consumidores siguen disponibles.

Los scripts locales `openspec:init` y `openspec:update` aíslan preferencias globales y prompts Codex en un
temporal propio durante la generación oficial. El default core/both no depende de la configuración de la
máquina. Otros comandos no crean ese temporal. La invocación directa de OpenSpec conserva su contrato
upstream; el fixture usa el wrapper y CI ejecuta el fixture completo.

## Deuda histórica

El registro operativo vive en `.project-os/debt/`. `migration.json` conserva rutas, hashes y normalizaciones
del plan propietario de los assessments importados; sus archivos de origen permanecen intactos.
`resolve-historical-purpose` resuelve las dos observaciones ya corregidas, con evidencia, sin borrar historia.
La deuda de selección de reglas por glob conserva su estado real hasta implementar y verificar su renderer.
`npm run check:debt` falla si desaparece la configuración; un SKIP no satisface este control upstream.

## Diagnóstico

Cada resultado expone `evidence.category` y `evidence.applicability`. La declaración explícita
`repositoryKind: upstream` junto con la identidad del paquete hace que las comprobaciones de forma de
consumidor sean SKIP y conserven `originalStatus`. OpenSpec, deuda y manifiesto Product OS siguen siendo
obligaciones verificables. El consumidor conserva los checks de su layout.

`sync --check` y `upgrade --check` también son comprobaciones de forma de consumidor: en este upstream
devuelven `SKIP`, sin construir un plan ni mutar archivos, cuando coinciden `repositoryKind: upstream` y la
identidad del paquete `create-project-engineering-os`. Ejecuta esos checks sobre un fixture bootstrapeado de
consumidor para verificar el blueprint. La omisión no aplica a `sync --dry-run`, `sync` mutante ni
`upgrade --apply`; esas operaciones conservan sus gates estrictos y el upstream no debe ejecutarlas.

## Perfiles y evidencia estructural

Para activar un perfil condicional, actualiza su flag `active`, la lista `active` y `activationDecision`
con una referencia a la decisión aprobada. Los dos perfiles de base permanecen activos. El gate exige la
evidencia aplicable del catálogo y nombra perfiles sin decisión o listas incoherentes.

### Evidencia de perfiles técnicos

Cada perfil técnico activo requiere un recibo consumer-owned en
`.project-os/evidence/technical-profile-<profile-id>.json`. El formato publicable se instala en
`.project-constructor/schema/technical-profile-evidence.schema.json`; los requisitos concretos siempre salen
del catálogo empaquetado `blueprint/core/project-os/profiles.json`, no de las listas editables de
`.project-os/profiles.json`. Mantén el recibo y sus artefactos como evidencia del consumidor: el doctor no
los genera, migra, normaliza ni modifica.

El recibo contiene `schemaVersion: "1.0.0"`, `profileId`, `configHash`, `profileHash`, `issuedAt`,
`expiresAt`, y listas `automaticValidations`, `manualEvidence`, `negativeCases`, además de `rollback` y
`closureGate`. Cada elemento de las tres listas debe tener el ID exacto del catálogo, `status: "PASS"` y un
`artifact` con `path` relativa al repositorio y `sha256` en hexadecimal minúsculo. `rollback` y `closureGate`
usan el mismo objeto de estado y artefacto. No se aceptan listas incompletas, IDs desconocidos o repetidos,
propiedades extra, estados `N/A` ni comandos. Una comprobación condicional como `visual-check-when-configured`
también necesita un artefacto `PASS` que documente cómo se evaluó su condición.

Los hashes usan SHA-256 sobre UTF-8 de JSON estable más un salto de línea: claves ordenadas
recursivamente y arrays conservados en su orden. `profileHash` resume la entrada completa del perfil
canónico empaquetado. `configHash` resume esta proyección: `profileId`, el conjunto efectivo ordenado de
perfiles activos, `config.activeProfiles` ordenado (o `null` si falta), la ruta relativa del catálogo,
`catalog.active` ordenado (o la lista derivada de `profiles[].active`) y la selección del perfil
`{id, active, activationDecision}` (o `null` si no está en el catálogo). Cada referencia de artefacto lleva
el SHA-256 de sus bytes actuales; las rutas deben ser relativas, normalizadas, permanecer dentro del repo y
resolver a un archivo regular; cada ruta admite hasta 2048 caracteres y cada ID hasta 512. No uses URLs ni
enlaces que salgan del repositorio.

`issuedAt` y `expiresAt` deben ser instantes UTC canónicos como `2026-09-24T18:30:00.000Z`; la emisión no
puede estar en el futuro, el vencimiento debe ser posterior a la hora actual y a la emisión, y la ventana
no puede superar 30 días. El doctor limita cada recibo a 256 KiB, cada artefacto a 10 MiB y el total leído
por perfil a 50 MiB. Una evidencia ausente, no legible, desactualizada, futura, de otra configuración o con
hash incorrecto mantiene `FAIL`; revisa la causa y reemplaza manualmente el expediente por uno completo y
actual. Los checks no escriben nada.

En un `PASS`, el doctor verifica catálogo, selección, vigencia, completitud e integridad de las referencias.
**No afirma que ejecutó o autenticó las pruebas, despliegues, rollback ni aprobaciones humanas del
consumidor.** Conserva por separado sus logs, revisiones y aprobaciones originales; no uses el `PASS` del
core como prueba independiente de su veracidad.

La configuración sembrada por `create-project-engineering-os@0.5.0` sigue siendo legible. La compatibilidad
no transforma recibos viejos: cada perfil técnico activo permanece `FAIL` hasta que el consumidor cree un
recibo vigente para este contrato y el catálogo del core corregido. El workaround temporal fail-closed
usado por el consumer de landing se conserva hasta que esa versión esté publicada; después se retira en un
cambio propio revisado del consumer, migrando la evidencia y volviendo a ejecutar su misma suite. No
desactives perfiles ni relajes el runner fijo para evitar el gate, y conserva cualquier `FAIL` no relacionado.

`codeIndexable: true` habilita comprobación, no instalación. GitNexus y CodeGraph usan recibos separados
`code-intelligence-gitnexus.json` y `code-intelligence-codegraph.json` en `.project-os/evidence/` (también
se admite la ubicación histórica `.project-constructor/evidence/`). Cada recibo exige `schemaVersion:
1.0.0`, `optIn: true`, `status: PASS`, `issuedAt`, `expiresAt` y `configHash`. El hash SHA-256 representa el
JSON canónico del config: claves ordenadas recursivamente, arrays en su orden y sin espacios. La ventana
máxima es 30 días; recibos ausentes, ilegibles, vencidos, futuros o con hash incorrecto fallan. El doctor
no arranca herramientas, indexa código ni interpreta configuración como evidencia de operación.

## Baseline y recibo del doctor upstream

El upstream conserva activados sus perfiles elegidos. Como no es un consumidor y no tiene evidencias de
producto para esos perfiles, `profile.auth-security`, `profile.library-cli` y `profile.ui` continúan en
`FAIL` hasta que exista evidencia verificable bajo el contrato de #115. El archivo
`.project-os/doctor-failure-baseline.json` los relaciona con ese issue; no los convierte en PASS ni cambia
su estado. `npm run check` compara el conjunto completo de fallos actuales con esa lista. Un FAIL nuevo o
una fila retirada mientras el doctor aún falla detiene el gate. Una fila solo se retira después de que el
doctor ya no produzca ese FAIL y la resolución tenga evidencia.

El `github.project` smoke es independiente de `doctor`: el doctor solo lee el recibo.
`.project-os/evidence/github-project.json` conserva el Project configurado, fechas UTC canónicas, el hash
del manifiesto, y el procedimiento permitido. `freshness` compara ese hash con el manifiesto Product OS
local; un recibo aún no vencido también queda `invalid` si cambió la configuración. Su lectura no demuestra
acceso futuro ni autoriza escritura.

Para renovar manualmente:

```sh
gh project view 3 --owner IgnacioBarEsp --format json
```

Compara el número 3, owner `IgnacioBarEsp` y título `Project Engineering OS` con
`.project-os/github/product-os.json`. Guarda solo owner, URL, título/resultado de esa comparación y los
tiempos `issuedAt`/`expiresAt`; no guardes tokens, item lists, issues ni detalles privados. La vigencia no
puede superar 180 días. `project-os freshness --target . --json` muestra el recibo como `due-soon`, `stale`
o `invalid` junto a las entradas de frescura del catálogo; devuelve código 0 cuando solo está vencido y
nunca ejecuta el comando de renovación. `npm run check` sí falla si el recibo expirado convierte
`github.project` en un FAIL nuevo. El gate es local y offline.

La semilla del catálogo se informa como `blueprint-seed` en el upstream porque este repositorio no consume
`.project-os/tool-catalog.json`; en un consumer se informa `target`. La frescura de herramientas y la de
recibos conservan sus estados separados. El catálogo futuro de decisiones con `reviewBy` y el workflow que
abre issues corresponden a #158, no a este baseline.

La metadata permite la palabra española «todo» y la prosa indicativa como «conserva» o «sustituye la firma».
El detector solo trata como instrucción las formas observadas que nombran una ranura (`Replace with`,
`Complete the review`, `reemplaza con`, `sustituye aquí`, etc.). El marcador pendiente `TODO` en mayúsculas y
las formas explícitas `[todo ...]` siguen fallando; la salida nombra campo y patrón sin repetir el contenido
sensible. Un identificador `change` válido puede contener un término reservado si tiene varios segmentos
kebab-case; el mismo término en otro campo, o como nombre aislado, sigue fallando.

Vuelve a [documentación](README.md) o a la [decisión de autoaplicación](SELF_APPLICATION.md).
