## Historia Original

Al revalidar la ola 3, CI bloquea los PR #201 y #202 por vulnerabilidades del npm empaquetado.

## Enriquecida

### Decisión vigente y fase propuesta

El 2026-10-03 (hora local) el mantenedor confirmó «si» a **preparar una spec de una composición reproducible de npm**. Esto cambia la estrategia exclusivamente de esperar el bundle oficial a evaluar una alternativa. La autorización es para preparar el acuerdo: Esa selección anterior no aprobaba Apply. Posteriormente el mantenedor **aprobó la spec fa279d9 y añadió directamente la condición reversible oficial/derivado/versiones**; ahora Apply de la faseA está autorizado, pero publicación/adopción siguen fuera de alcance.

La primera fase propuesta es un spike acotado, en carpetas desechables, con fuentes oficiales fijadas y dependencias compatibles realmente corregidas. Obtendrá receta, inventario/procedencia, hashes de dos builds, auditorías de bytes efectivos, regresiones y comprobaciones del contrato de runtime. Dictamen viable/no-viable; **no sustituye npm de Companion ni instala un derivado en el host**. Si requiere parches propios o cambiar gestor, detener y solicitar una decisión distinta. Adopción y distribución necesitarán un acuerdo posterior con catálogo/lock/avisos/hashes, instalador/reparación y flujo protegido.

### Estado y límites de evidencia

- npm empaquetado actual: 11.19.1. npm oficiales11.21.0/12.2.0 ya tienen pruebas fallidas registradas; no repetir su instalación porque se preparó una spec.
- [CI37171002125](https://github.com/IgnacioBarEsp/project-engineering-os/actions/runs/37171002125), SHA9feea6597d4fc43ab1f4dfb6a45f5bf4c797ac92: auditoría Companion fallida, 24 vulnerabilidades (1moderate,23high). Este resultado no es prueba nueva de las candidatas oficiales.
- http-cache-semantics4.3.0 existe; el cambio inspeccionado corrige Vary, no acredita la remediación de [GHSA-ch52-4w7c-c8xp](https://github.com/advisories/GHSA-ch52-4w7c-c8xp). Actualizar una versión o salir del rango textual del aviso no será prueba suficiente.
- [#208](https://github.com/IgnacioBarEsp/project-engineering-os/issues/208) conserva el bloqueo distinto de braces3.0.3 en root/blueprint. No es una dependencia necesaria para **proponer/ejecutar este spike aislado**; sí es obligación separada antes de cualquier CI requerido verde.
- Main fijado9751c301976fe27e9bbad33e69f39372b69f901e. Rama de propuesta separada `codex/204-npm-composition-feasibility`; nada se mezcla en #207 ni en los PR de la pila UI.

### Criterios y guardas de la fase

Mantener auditorías y controles actuales; documentar fuentes/licencias, comprobar reproducibilidad y código real distribuible, y no declarar seguridad por un simple audit verde. Preservar Node soportado, scripts desactivados, argumentos de instalación, entorno aislado, caché y verificación. Evidencia negativa y recuperación preintegración en temporales propios. Emitir informe honesto incluso si no hay candidata apta.

DoR se ejecutará contra este enriquecimiento antes de crear el change oficial OpenSpec1.6.0. Spec fa279d9 aprobada con requisito humano de reversibilidad; Apply autorizado solo para el spike/modelo experimental. No hay aprobación de una adopción futura. #204 continúa abierto/Blocked hasta una corrección integrada y validada; no inicia ola4.

<!-- project-os-readiness:pre-propose
{
  "schemaVersion": "1.0.0",
  "change": "investigate-reproducible-npm-composition",
  "execution": "versioned",
  "dependencies": [],
  "currentState": {
    "summary": "Spec fa279d9 aprobada por respuesta humana literal con condición explícita de reversibilidad oficial/derivado/versiones. La faseA permanece experimental, sin adopción/runtime/catálogo/locks; #204 y #208 abiertos y CI no apta.",
    "sources": [
      "https://github.com/IgnacioBarEsp/project-engineering-os/issues/204",
      "https://github.com/IgnacioBarEsp/project-engineering-os/actions/runs/37171002125",
      "https://github.com/IgnacioBarEsp/project-engineering-os/issues/208",
      "main9751c301976fe27e9bbad33e69f39372b69f901e; apps/companion/runtime/catalog.mjs y scripts/seal-npm.mjs",
      "Confirmación humana directa en esta conversación: si a preparar spec de alternativa reproducible, 2026-10-03 local",
      "Aprobación literal recibida en esta conversación y evidence/spec-approval.md del change investigate-reproducible-npm-composition"
    ]
  },
  "scope": [
    "Fase A de #204: evaluar en directorios desechables una composición reproducible con fuentes oficiales npm y dependencias compatibles realmente corregidas, después de aprobar la spec",
    "Crear receta explícita, inventario completo, procedencia/integridades, hashes de dos builds y auditoría de los bytes efectivos",
    "Validar regresiones de avisos y contrato npm/Node bajo los mismos controles de instalación, caché, fallo y reparación a escala de experimento",
    "Emitir dictamen viable o no-viable con evidencia y próxima decisión; no reemplazar npm ni publicar artefactos al usuario en esta fase",
    "Ensayar modelo reversible con identidades de canal/version/treeHash/recipeHash y slots separados; la transición real solo si hay dos distribuciones aptas"
  ],
  "observableCriteria": [
    "La fase utiliza OpenSpec local1.6.0 y no ejecuta Apply sin aprobación explícita de proposal/design/spec",
    "Cada candidato declara inputs fijos, integridades, grafo físico completo incluidos bundled y fuente de avisos con fecha",
    "Dos construcciones independientes de la misma receta producen árbol, inventario y hash idénticos o el dictamen rechaza la reproducibilidad",
    "Auditoría de producción sin high/critical es necesaria pero no basta: se comprueba remediación de los avisos conocidos y que no se omiten bytes distribuidos",
    "Se conserva scripts desactivados, sin bin-links, workspaces desactivadas, registry fijado, min-release-age existente, entorno aislado, límites y verificación del payload",
    "Se verifica npm --version y operaciones ci bajo Node22.22.0 y24.18.0 y la versión administrada del catálogo; incompatibilidad se registra sin subir baseline",
    "Un componente sin corrección comprobable, parche propio necesario o cambio de gestor detiene la candidata y exige nueva decisión de alcance",
    "Catálogo, locks oficiales, avisos publicados, CI/protecciones, pin OpenSpec, runtimes del host y carpetas de usuario permanecen sin modificaciones; #208 queda separado",
    "No se cierra #204 por un spike verde ni se declara CI ola3 verde; adopción requiere diseño/spec adicionales y PR protegido",
    "Oficial a derivado a oficial y versiones usan las mismas guardas; fallo/cancelación/selección obsoleta no cambia la anterior; fixtures sintéticos no se presentan como switching real"
  ],
  "owner": "IgnacioBarEsp",
  "risks": [
    "Auditoría incompleta de bundled o ausencia del identificador sin corrección real: contrastar árbol físico, grafo y regresiones",
    "Composición incompatible con API npm o baseline Node: usar contratos y matriz real sin relajar requisitos",
    "Cadena de suministro del derivado y mantenimiento propio: fijar fuentes, receta, integridades, avisos y responsable antes de cualquier adopción",
    "Confundir experimento con release o resolver #208 por asociación: conservar fase, issue y gates separados",
    "Pérdida de evidencia o escapes del temporal: preservar entradas/resultados y verificar rutas absolutas dentro de raíz propia"
  ],
  "surfaces": [
    "documentation",
    "harness-tooling"
  ],
  "manualInterventions": [],
  "costLicenseReview": {
    "status": "not-applicable",
    "owner": "IgnacioBarEsp",
    "evidence": null,
    "justification": "Esta fase diseña y evalúa internamente con herramientas locales fijadas, sin redistribuir el derivado, cambiar licencias publicadas ni contratar servicios. La viabilidad documentará Artistic-2.0 y licencias incluidas; cualquier redistribución, parche propio o cambio de licencia exige una decisión posterior aprobada. Aprobación de spec antes de Apply sigue pendiente y no se simula en DoR."
  },
  "evidence": {
    "automatic": [
      "readiness-propose",
      "openspec-strict",
      "input-integrity",
      "physical-inventory-comparison",
      "repeat-build-tree-hash",
      "production-audit",
      "advisory-regressions",
      "node-runtime-matrix",
      "fixed-install-contract",
      "disposable-repair-and-failure",
      "repository-boundary-diff",
      "documentation-checks"
    ],
    "manual": [
      "Aprobación concreta de proposal/design/spec antes de Apply",
      "Revisión cualitativa de licencias, provenance y costo de mantener derivado",
      "Revisión adversarial real de receta y evidencia antes del archivo",
      "Dictamen del mantenedor sobre viabilidad; adopción no se autoriza automáticamente"
    ]
  },
  "rollback": {
    "strategy": "Preservar baseline e inputs/resultados de candidatas en carpetas propias separadas; no instalar ni sustituir el npm de Companion o del host",
    "trigger": "Falla auditoría, regresión, compatibilidad, reproducibilidad o límite de ownership; se necesita un parche propio o cambio no aprobado",
    "recovery": "Marcar candidata no-viable, conservar hashes/logs y retomar exclusivamente baseline fijado. No publicar ni revertir a usuario una versión vulnerable; #204 permanece abierto. Una adopción posterior definirá su rollback verificado en una spec separada. La selección reversible entre slots solo admite destinos que pasan nuevamente los mismos gates; conservar un slot no autoriza ejecutarlo si está vulnerado o alterado."
  },
  "nonGoals": [
    "No sustituir runtime npm, cambiar catálogo/locks/avisos de release ni distribuir instalador en esta fase",
    "No mantener forks/parches propios sin una decisión nueva ni cambiar de gestor",
    "No añadir excepciones, omitir dependencias auditadas, usar audit fix forzado o reducir protecciones",
    "No actualizar OpenSpec ni resolver braces/root/blueprint #208 silenciosamente",
    "No mezclar fixes con PR207, cerrar #204 o toda ola3 por el resultado del spike, ni iniciar ola4"
  ],
  "exceptions": []
}
project-os-readiness:pre-propose -->

<details>
<summary>Cuerpo anterior íntegro conservado: diagnóstico histórico y alcance inicial</summary>

## Historia Original

Al revalidar la ola 3, CI bloquea los PR #201 y #202 por vulnerabilidades del npm empaquetado.

## Enriquecida

El job Windows de #201, run 36684024088/job 109785636413, pasa las pruebas pero falla
`npm audit --omit=dev --audit-level=high` con tres paquetes vulnerables dentro de npm:
brace-expansion (high), ip-address (moderate), undici (high). #202 repite el bloqueo.
No se desactiva el gate ni se propone una excepción automática.

Diagnóstico del 2026-09-30 en carpeta desechable y sin scripts: npm 11.20.0 y 12.1.0
siguen fallando el mismo audit. Overrides acotados sobre npm 11.19.1 tampoco corrigen
las dependencias bundled. `npm audit fix --dry-run` declara que no puede repararlas.
Existen versiones corregidas de los componentes, pero sustituir bytes dentro del npm
empaquetado requiere una distribución trazable, no editar node_modules del usuario.

Alcance propuesto: evaluar actualización oficial frente a composición reproducible de npm,
mantener runtime catalog/notices/lock/artifact hashes coherentes y comprobar instalación,
reparación, caché y ejecución real. No cambiar el gestor de dependencias sin decisión técnica.

Criterios: auditoría de producción sin high/critical; dependencias parcheadas realmente
incluidas en el artifact; CI protegida de ola 3 verde; pruebas de runtime/reparación y
regresión negativa; licencias, procedencia y rollback documentados.

Este es un issue de diagnóstico, todavía no DoR/spec aprobada ni implementación.
Bloquea cerrar ola 3; no es inicio de ola 4. No duplicado en issues abiertos al comprobar.

</details>
