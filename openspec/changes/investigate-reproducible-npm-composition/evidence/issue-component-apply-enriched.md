## Historia Original

Al revalidar la ola3, CI bloquea los PR #201/#202 por vulnerabilidades del npm empaquetado.

## Enriquecida

### Estado actual: experimento aprobado, candidata todavía bloqueada

El mantenedor aprobó la fase original fa279d9 y su reversibilidad oficial/derivado/versiones, y después respondió «apruebo» a la ampliación real6b3997. El Apply autorizado toca **solo index.js de http-cache-semantics4.3.0 en copias desechables**. No modifica el npm instalado en Companion/host, catálogo, locks, gestor, baseline, OpenSpec, auditoría ni protecciones.

- Variante actual: patchHash e37eb3e458539ededb9161104b1d68d72273e09795733f4631560b035b031a62. Dos construcciones tienen inventarios/bytes idénticos; originales/LICENSE y sentinels intactos.
- Matriz **121/123**, no verde. Permanecen S-Maxage con vencimiento ignorado y nueva metadata304/Vary perdida. La revisión independiente detectó además un gap temporal, reproducido y corregido dentro del único archivo aprobado.
- Tests unit/modelo29/29, strictOpenSpec1.6.0/docs/neutralidad/workflows/debt PASS;14 límites de producción conservados. Los tests sintéticos y el recibo de hashes no certifican seguridad, CI ni switching real.
- Fuente oficial npm11.21.0 verificada desde el tarball ya cacheado: make-fetch-happen15.0.6 devuelve cuerpo stale sintético tras fallo de red aunque el componente lo niegue; force-cache/only-if-cached también evitan su decisión. Son probes de caller con stubs, no una explotación de Companion ni instalación nueva.
- **Segunda ampliación propuesta, NO aprobada/aplicada**: permitir solo parsing/expiry/304-Vary necesario en el mismo index.js y tres archivos del caller15.0.6. Actual proposal/design/spec/TLDR/boundary-amendment.md están en rama codex/204-npm-composition-feasibility. Requiere aprobar esa revisión real; no se infiere de la aprobación anterior.
- Presupuesto acumulado:2/3 variantes de patch consumidas, una restante; **composiciones npm completas realizadas0**. No se reinicia el presupuesto ni se siguen recetas indefinidas.
- Latest observados2026-10-04UTC: npm11.21.0/12.2.0 y cache4.3.0 sin cambio. make-fetch-happen16.0.1 pide22.22.2 en rama22; no es compatible con baseline22.22.0. No se repite la instalación de npm sin input nuevo.
- [#208](https://github.com/IgnacioBarEsp/project-engineering-os/issues/208) permanece bloqueo distinto de braces3.0.3 root/blueprint. [CI37171002125](https://github.com/IgnacioBarEsp/project-engineering-os/actions/runs/37171002125), SHA9feea659, es fallo histórico de #207; no se atribuye a esta candidata ni se mezcla fix con ese PR.
- Evidencia anterior/modelo14/14/originales se conserva. No archive, PR nuevo, merge o release; ola3 incompleta, no inicio de ola4.

### Criterios y próxima decisión

Aprobar el alcance nuevo antes de otro parche; fuente/allowlist/hash/licencia y rechazo de drift/fuzz/paths/links siguen obligatorios. Solo con componente y caller aptos continuar dos builds, grafo físico/auditor independiente y todos los avisos, Node22.22.0/24.18.0/24.20.0, scripts/bin-links/workspaces/release-age/registry, instalación/reparación/interrupción/recursos. Sin excepción, ocultar paquetes o levantar protecciones.

Un oficial futuro debe pasar sin nuestros parches los mismos gates en identidad/slot separado. Conservar selección e historia ante fallo; un oficial vulnerable no es rollback apto. Publicar/adoptar necesita otra spec aprobada y PR protegido/CI requerido verde. #204 permanece abierto/Blocked.

La preparación OpenSpec completa no es aprobación humana ni implementación completa. No se repiten lecturas visuales ya aprobadas ni se simulan recorridos humanos faltantes.

<!-- project-os-readiness:pre-propose
{
  "schemaVersion": "1.0.0",
  "change": "investigate-reproducible-npm-composition",
  "execution": "versioned",
  "dependencies": [],
  "currentState": {
    "summary": "Ampliación6b3997 aprobada y aplicada solo a index.js4.3.0 en copias desechables. Dos variantes/fuentes frozen; última matriz121/123 y29/29 tests; gap temporal confirmado y corregido. Dos residuals de parsing/expiry y304-Vary más rutas verificadas de make-fetch-happen15.0.6 impiden aceptar candidata. Segunda ampliación preparada y NO aprobada/aplicada; #204/#208 siguen abiertos.",
    "sources": [
      "https://github.com/IgnacioBarEsp/project-engineering-os/issues/204",
      "https://github.com/IgnacioBarEsp/project-engineering-os/actions/runs/37171002125",
      "https://github.com/IgnacioBarEsp/project-engineering-os/issues/208",
      "main9751c301976fe27e9bbad33e69f39372b69f901e; apps/companion/runtime/catalog.mjs y scripts/seal-npm.mjs",
      "Confirmación humana directa en esta conversación: si a preparar spec de alternativa reproducible, 2026-10-03 local",
      "Aprobación literal recibida en esta conversación y evidence/spec-approval.md del change investigate-reproducible-npm-composition",
      "Component preflight2026-10-04T04:03:45.713Z: SHA256 ede1cc404a492fa348eb9d97a3007a0d72aa717bd22cd86a56bd0824c19729ca; evidence/cache-component-preflight.json",
      "Respuesta humana literal si a preparar ampliación de spec para corregir la dependencia nosotros; no equivale a aprobación de la spec aún no presentada",
      "https://github.com/kornelski/http-cache-semantics/pull/58#issuecomment-5975673900",
      "https://www.rfc-editor.org/rfc/rfc9111.html#section-7.3",
      "Aprobación humana literal apruebo sobre6b399724e41fb3633bb0900ecbdd49cf6622fee9; evidence/patch-amendment-approval.md",
      "evidence/component-apply-ledger.json: matrices originales/derivadas123 casos,2/3 variantes de patch,0 whole npm builds; artefactos persistentes con digests",
      "npm11.21.0 tarball oficial SHA512 validado desde cache; caller15.0.6 con stubs de red/body conserva rutas sin guard del componente; sin exposición Companion demostrada",
      "boundary-amendment.md es propuesta sin aprobación: cuatro archivos upstream exactos, misma política/baseline y presupuesto acumulado"
    ]
  },
  "scope": [
    "Fase A de #204: evaluar en directorios desechables una composición reproducible con fuentes oficiales npm y dependencias compatibles realmente corregidas, después de aprobar la spec",
    "Crear receta explícita, inventario completo, procedencia/integridades, hashes de dos builds y auditoría de los bytes efectivos",
    "Validar regresiones de avisos y contrato npm/Node bajo los mismos controles de instalación, caché, fallo y reparación a escala de experimento",
    "Emitir dictamen viable o no-viable con evidencia y próxima decisión; no reemplazar npm ni publicar artefactos al usuario en esta fase",
    "Ensayar modelo reversible con identidades de canal/version/treeHash/recipeHash y slots separados; la transición real solo si hay dos distribuciones aptas",
    "Ampliación6b3997 aprobada: parche de datos index.js de http-cache-semantics4.3.0, solo copias desechables; artefactos, revisión, compatibilidad y política conservadora declarada",
    "Preparar segunda ampliación documental de parsing/expiry/304-Vary y caller15.0.6 policy.js/entry.js/index.js; no aplicar esos cambios sin aprobación concreta de proposal/design/spec"
  ],
  "observableCriteria": [
    "La fase utiliza OpenSpec local1.6.0 y no ejecuta Apply sin aprobación explícita de proposal/design/spec",
    "Cada candidato declara inputs fijos, integridades, grafo físico completo incluidos bundled y fuente de avisos con fecha",
    "Dos construcciones independientes de la misma receta producen árbol, inventario y hash idénticos o el dictamen rechaza la reproducibilidad",
    "Auditoría de producción sin high/critical es necesaria pero no basta: se comprueba remediación de los avisos conocidos y que no se omiten bytes distribuidos",
    "Se conserva scripts desactivados, sin bin-links, workspaces desactivadas, registry fijado, min-release-age existente, entorno aislado, límites y verificación del payload",
    "Se verifica npm --version y operaciones ci bajo Node22.22.0 y24.18.0 y la versión administrada del catálogo; incompatibilidad se registra sin subir baseline",
    "Un defecto fuera del allowlist realmente aprobado o presupuesto acumulado detiene candidata; fuente/code drift exige nueva decisión, no excepciones",
    "Catálogo, locks oficiales, avisos publicados, CI/protecciones, pin OpenSpec, runtimes del host y carpetas de usuario permanecen sin modificaciones; #208 queda separado",
    "No se cierra #204 por un spike verde ni se declara CI ola3 verde; adopción requiere diseño/spec adicionales y PR protegido",
    "Oficial a derivado a oficial y versiones usan las mismas guardas; fallo/cancelación/selección obsoleta no cambia la anterior; fixtures sintéticos no se presentan como switching real",
    "La aprobación de6b3997 habilita solo primer parche; la segunda ampliación requiere aprobar su revisión real y costo/allowlist antes de Apply; una autorización general no sustituye ese gate",
    "Clasificar cookies como política conservadora del componente, no como prohibición HTTP ni explotación demostrada; no-cache/proxy-revalidate se verifican aparte y no se copia automáticamente PR58",
    "Parche allowlist de un componente/un archivo, preimage/postimage y diff exactos, originales intactos, dos outputs reproducibles; cualquier otro fix propio requiere acuerdo distinto",
    "Sin renombrar/bumpear dependencias para esconder avisos: conservar grafo físico/identidad upstream, raw auditoría, regresiones y derivación trazable; los controles existentes siguen obligatorios",
    "Dos variantes de patch consumen2/3 del mismo presupuesto; receipts de integridad no equivalen a aceptación de una matriz con dos fallos; no repetir builds de igual patch solo por wake"
  ],
  "owner": "IgnacioBarEsp",
  "risks": [
    "Auditoría incompleta de bundled o ausencia del identificador sin corrección real: contrastar árbol físico, grafo y regresiones",
    "Composición incompatible con API npm o baseline Node: usar contratos y matriz real sin relajar requisitos",
    "Cadena de suministro del derivado y mantenimiento propio: fijar fuentes, receta, integridades, avisos y responsable antes de cualquier adopción",
    "Confundir experimento con release o resolver #208 por asociación: conservar fase, issue y gates separados",
    "Pérdida de evidencia o escapes del temporal: preservar entradas/resultados y verificar rutas absolutas dentro de raíz propia",
    "El aviso es disputado por upstream; separar requisitos normativos de política conservadora y comprobar usos legítimos/serialización evita convertir expectativas dudosas en falsa corrección",
    "Mantener un parche local agrega responsabilidad de vigilancia y retirada; una release oficial se evalúa sin parche con los mismos gates antes de cambiar de canal, nunca por ser latest"
  ],
  "surfaces": [
    "documentation",
    "harness-tooling"
  ],
  "manualInterventions": [],
  "costLicenseReview": {
    "status": "approved",
    "owner": "IgnacioBarEsp",
    "evidence": "Aprobación humana literal apruebo de6b3997, registrada en evidence/patch-amendment-approval.md",
    "justification": "El primer Apply permite mantenimiento experimental y conserva BSD-2-Clause/originales sin redistribución ni servicios. La segunda ampliación/costo a dos componentes sigue solo propuesta, requiere aprobación concreta antes de nuevos parches; no aprueba obligaciones de publicación futura."
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
    "trigger": "Falla un gate o drift de inputs/patch; se requiere otra modificación upstream o una ampliación aún no aprobada",
    "recovery": "Marcar candidata no-viable, conservar hashes/logs y retomar exclusivamente baseline fijado. No publicar ni revertir a usuario una versión vulnerable; #204 permanece abierto. Una adopción posterior definirá su rollback verificado en una spec separada. La selección reversible entre slots solo admite destinos que pasan nuevamente los mismos gates; conservar un slot no autoriza ejecutarlo si está vulnerado o alterado."
  },
  "nonGoals": [
    "No sustituir runtime npm, cambiar catálogo/locks/avisos de release ni distribuir instalador en esta fase",
    "No aplicar parche propio sin aprobar la ampliación concreta; no modificar más componentes/archivos que el allowlist propuesto ni cambiar de gestor",
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
