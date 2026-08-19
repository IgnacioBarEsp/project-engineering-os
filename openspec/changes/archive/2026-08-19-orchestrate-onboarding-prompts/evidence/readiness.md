# Evidencia de los gates de readiness

## Antes de propose

`readiness-check --phase propose --issue 31`: **PASS**, 13/13 comprobaciones, cero FAIL y cero excepciones.

- Issue #31 verificado, abierto y con `## Historia Original` y `## Enriquecida` presentes.
- Metadata pre-propose válida contra su schema, sin placeholders, sin comandos y sin secretos.
- Pertenencia al Project `Project Engineering OS` verificada.
- Dependencias declaradas #23 y #30 verificadas como `CLOSED`.

## Antes de archive

`readiness-check --phase archive --change orchestrate-onboarding-prompts --run-local`: **PASS**, 18/18
comprobaciones, cero FAIL y cero excepciones.

- Artefactos: proposal, design, tasks, TLDR, baseline brownfield y readiness presentes.
- Tareas: 17/17 completas.
- Validaciones declaradas: 11/11.
- Evidencia proporcional a las superficies activas: 6/6.
- Revisión adversarial: PASS, sin Blockers ni Majors abiertos.
- Runners fijos: `openspec-strict`, `opsx-check`, `sync-check` y `doctor-json-check` en exit code 0.

## Ejecución local aislada

El repositorio fuente no es un consumidor bootstrapeado y no conserva el estado mutable que requieren
`doctor`, `opsx-check` y `sync-check`. Igual que en el cierre anterior, el gate se reprodujo en un
repositorio Git temporal creado con el runtime del árbol de trabajo, con OpenSpec 1.6.0 fijado y el change
copiado sin cambios funcionales. En ese consumidor se ejecutaron `opsx-adapt` y `sync`; después el gate
read-only con `--run-local` obtuvo `sync-check` en `IN_SYNC` y el doctor sin ningún `FAIL`.

Una primera ejecución del gate falló `sync-check` y `doctor-json-check` porque el consumidor todavía tenía
la versión previa del router: un archivo administrado en drift. Corregir el drift con `sync` y repetir el
gate lo resolvió. La detección funcionó como debía y queda registrada en lugar de silenciarse.

No se copió estado mutable del consumidor al repositorio fuente. Esta ejecución no sustituye la suite del
paquete: `npm run check` permanece en PASS con 173/173 pruebas y `npm run pack:verify` en PASS.

## Ensayo de archive

`openspec archive orchestrate-onboarding-prompts --yes` se ensayó en el mismo consumidor: añadió 7
requisitos a `adaptive-onboarding` hasta 13, movió el change a `archive/2026-08-19-orchestrate-onboarding-prompts`
conservando su carpeta `evidence/`, y `openspec validate --all --strict` terminó en 7/7 items.

El ensayo también confirmó el candidato de deuda: el archive no redacta el `Purpose` de la capacidad y
`adaptive-onboarding` conserva el texto TBD generado por el cierre de #30.

Al archivar sobre una capacidad existente, la CLI deja una línea en blanco extra al final de la spec activa
y `git diff --check` la marca. Se normalizó a un único salto final, sin tocar ningún requisito, para que la
spec conserve el mismo final que las otras siete.
