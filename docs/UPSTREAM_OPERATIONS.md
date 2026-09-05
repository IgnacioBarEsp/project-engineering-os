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

## Perfiles y evidencia estructural

Para activar un perfil condicional, actualiza su flag `active`, la lista `active` y `activationDecision`
con una referencia a la decisión aprobada. Los dos perfiles de base permanecen activos. El gate exige la
evidencia aplicable del catálogo y nombra perfiles sin decisión o listas incoherentes.

`codeIndexable: true` habilita comprobación, no instalación. GitNexus y CodeGraph usan recibos separados
`code-intelligence-gitnexus.json` y `code-intelligence-codegraph.json` en `.project-os/evidence/` (también
se admite la ubicación histórica `.project-constructor/evidence/`). Cada recibo exige `schemaVersion:
1.0.0`, `optIn: true`, `status: PASS`, `issuedAt`, `expiresAt` y `configHash`. El hash SHA-256 representa el
JSON canónico del config: claves ordenadas recursivamente, arrays en su orden y sin espacios. La ventana
máxima es 30 días; recibos ausentes, ilegibles, vencidos, futuros o con hash incorrecto fallan. El doctor
no arranca herramientas, indexa código ni interpreta configuración como evidencia de operación.

La metadata permite la palabra española «todo». El marcador pendiente `TODO` en mayúsculas y las formas
explícitas `[todo ...]` siguen fallando; la salida nombra campo y patrón sin repetir el contenido sensible.

Vuelve a [documentación](README.md) o a la [decisión de autoaplicación](SELF_APPLICATION.md).
