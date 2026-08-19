# Evidencia de los gates de readiness

## Antes de propose

`readiness-check --phase propose --issue 32`: **PASS**, 13/13 comprobaciones, cero FAIL y cero excepciones.

- Issue #32 verificado, abierto y con `## Historia Original` y `## Enriquecida` presentes; el texto original
  se conserva byte por byte por delante de ambas secciones.
- Metadata pre-propose válida contra su schema, sin placeholders, sin comandos y sin secretos.
- Pertenencia al Project `Project Engineering OS` verificada.
- Dependencia declarada #23 verificada como `CLOSED`.

El repositorio upstream no tiene `.project-os/readiness-policy.json`, `profiles.json` ni
`github/product-os.json`, así que el gate se ejecutó contra un harness temporal con `origin` apuntando al
remoto real y el título de Project tomado de `.project-os/repository-governance.json`.

## Antes de archive

`readiness-check --phase archive --change revalidate-agent-adapters --run-local`: ver el resultado registrado
al cierre.

- Artefactos: proposal, design, tasks, TLDR, baseline brownfield y readiness presentes, más
  `specs/runtime/spec.md`.
- Tareas: todas completas con su evidencia.
- Superficies activas: `documentation`, `harness-tooling` y `library-cli`, esta última porque el change toca
  `src/` y añade exportaciones a la API pública y campos al schema que reciben los consumidores.
- Validaciones declaradas: 15, derivadas de las tres superficies.
- Evidencia manual: 9, incluidas las tres que aporta `library-cli`.
- Revisión adversarial: PASS, sin Blockers ni Majors abiertos.

## Alcance real de `multi-platform-smoke`

Esta validación merece una nota explícita porque es la única cuya cobertura no termina en local.

Lo ejecutado en esta máquina, Windows: instalación del tarball verificado, bootstrap desde ese tarball,
segundo run sin drift, `sync --check` en `IN_SYNC`, `opsx-check` y `doctor --json` en 0, y el contrato de
normalización a LF que es la parte sensible a plataforma, cubierto por las pruebas de normalización del
bootstrap y de rechazo de CRLF en el empaquetado.

Lo que **no** se ejecutó en local: Ubuntu y macOS. Esa cobertura la aporta la matriz advisory de CI en el
pull request, con Node 20.20.0 y 22.22.0 sobre los tres sistemas. El código añadido por este change no
introduce rutas dependientes de plataforma nuevas: es normalización de JSON y de texto sobre las utilidades
de path ya existentes.

El estado se declara `passed` por lo ejecutado y por el contrato que cubre la diferencia entre plataformas,
y la Definition of Done sigue exigiendo que la CI requerida corra y pase antes del merge. Esta nota existe
para que nadie lea `passed` como si los tres sistemas ya hubieran corrido en local.

## Ejecución local aislada

El repositorio fuente no es un consumidor bootstrapeado y no conserva el estado mutable que requieren
`doctor`, `opsx-check` y `sync-check`. Igual que en los cierres anteriores, el gate se reproduce en un
repositorio Git temporal creado con el runtime del árbol de trabajo, con OpenSpec 1.6.0 fijado y el change
copiado sin cambios funcionales.

No se copia estado mutable del consumidor al repositorio fuente. Esta ejecución no sustituye la suite del
paquete: `npm run check` permanece en PASS con 210/210 pruebas, `npm run pack:verify` en PASS y
`npm run fixture` en PASS.
