## Historia Original

Al revalidar la ola3, CI bloquea los PR #201/#202 por vulnerabilidades del npm empaquetado.

## Enriquecida

### Estado actual: ampliación aprobada y aplicada, variante3 NO apta

El mantenedor aprobó fa279d9 con reversibilidad oficial/derivado/versiones,6b3997 para el primer archivo, y respondió literalmente «si» a la segunda ampliación real d6e2b543d632dc35b099037746891dbe2f3983db. No repetir ni tratar ese gate como pendiente. Apply toca solo index.js de http-cache-semantics4.3.0 y policy.js/entry.js/index.js de make-fetch-happen15.0.6 en copias desechables. No host/Companion instalado, catálogo, locks, avisos, gestor, baseline, OpenSpec, auditoría ni protecciones.

- Variante3 frozen: cache patchHash d8bddc955de493355e26f5ce86b6ed26d575599fa36df518c0832fdc7bb99d1c, caller patchHash d8c65f353eff15543312c92a64f226443ea5c7a14b41658696acda47aa28cac2. Dos builds por componente idénticos; originales/LICENSE/sentinels intactos y14 límites de producción sin cambio.
- Verificador/modelo44/44 PASS. Matriz inicial152/152 conservada; la ampliación con los casos confirmados resulta **154/161**, no verde. Comillas fabrican directivas/alteran freshness, Expires nuevo perdido y discrepancias Pragma/matching en llamadas directas.
- **Caller real67/69**, usando loopback HTTP, streams y cacache reales con grafo físico verificado1530 archivos y solo cuatro diferencias. Fallan304-introduce-vary y304-vary-star: un registro antiguo todavía elegible puede eludir la metadata nueva. No VM/stubs ni explotación de producto demostrada.
- Investigador independiente prepatch completado. El único reviewer fresco entregó observaciones preliminares y terminó sin informe final; el padre confirmó casos y los retuvo. Gate de revisión incompleto, sin aprobación independiente.
- **Presupuesto vigente3/3 variantes consumidas; npm completos0**. No otro patch automáticamente. [Propuesta final](https://github.com/IgnacioBarEsp/project-engineering-os/blob/codex/204-npm-composition-feasibility/openspec/changes/investigate-reproducible-npm-composition/final-recipe-amendment.md) requiere otra aprobación: una cuarta y última receta más refinamientos concretos dentro de los mismos cuatro archivos. NO aprobada/aplicada. Alternativa: esperar oficial.
- Observación oficial2026-10-05T02:40:36Z: npm next11=11.21.0/latest=12.2.0, cache4.3.0 y braces3.0.3 sin cambio. Caller16.0.1 exige22.22.2 en rama22 y no satisface baseline22.22.0. Metadata solo; no repetir instalaciones de fuentes iguales. Avisos primarios conservan patched:null/withdrawn:null.
- Evidencia completa/sha en openspec/changes/investigate-reproducible-npm-composition/evidence/component-apply-ledger.json, incluyendo originales, todas las candidatas fallidas, controles y evaluación de deuda. No assessment clean, captura duplicada, archivo, PR nuevo, merge o release.
- [#208](https://github.com/IgnacioBarEsp/project-engineering-os/issues/208) sigue bloqueo independiente de braces root/blueprint. [CI37171002125](https://github.com/IgnacioBarEsp/project-engineering-os/actions/runs/37171002125), SHA9feea659, es fallo histórico de #207, no de esta candidata. No mezclar fixes ni interpretar archivo como integración.
- #149/#150/#204/#206/#208 siguen abiertos; #201/#202/#207 draft y SHA/bases comprobados sin cambios. Mantener pila, ola3 incompleta y sin ola4. Lecturas/aceptaciones humanas previas conservan alcance.

### Criterios y próxima decisión

Actualmente no queda variante autorizada. Aprobar la propuesta final y sus changes reales de proposal/design/spec antes de cualquier cuarto parche; no basta autorización general. Preimages/postimages, integridades/licencias, rechazo de drift/fuzz/paths/links, defaults/effective maps y controles legítimos siguen obligatorios.

Solo con componente/caller aptos seguir gates originales: npm completo reproducible, grafo/auditor independiente y todos los avisos, Node22.22.0/24.18.0/24.20.0, scripts/bin-links/workspaces/release-age/registry, instalación/reparación/interrupción/recursos y reversibilidad real. Ninguna excepción o protección reducida.

Un oficial futuro se prueba sin nuestro patch con mismos gates en identidad/slot separado. Conservar selección e historia ante fallo/cancelación/obsolescencia; oficial vulnerable no es rollback apto. Adopción/publicación requiere otra spec y PR protegido/CI verde.204 permanece Open/Blocked.

<!-- project-os-readiness:pre-propose
{
  "schemaVersion": "1.0.0",
  "change": "investigate-reproducible-npm-composition",
  "execution": "versioned",
  "dependencies": [],
  "currentState": {
    "summary": "Segunda ampliación d6e2b54 aprobada literalmente si y aplicada a cuatro archivos exactos en copias desechables. Variante3 reproducible pero no apta:44/44 tests,154/161 componente (152/152 histórico inicial),67/69 caller real. Fallos de historia/Vary, quoted directives, Expires y entradas directas quedan conservados; revisión independiente parcial sin informe final.3/3 variantes consumidas,0 npm completos. Cuarta receta y refinamientos propuestos, NO aprobados/aplicados;204/208 y ola3 siguen abiertos.",
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
      "Aprobación humana literal si de boundary-amendment.md y proposal/design/spec en d6e2b543d632dc35b099037746891dbe2f3983db: evidence/boundary-amendment-approval.md; cuatro archivos upstream exactos, misma política/baseline y presupuesto acumulado",
      "Resultados persistentes artifacts/cache-boundary: component-result-v3.json, caller-integration-v3.json, expanded-matrix-v3.json y review-confirmation.json; hashes y rutas en evidence/component-apply-ledger.json",
      "Revisión independiente de variante3 parcial/incompleta; observaciones preliminares verificadas por padre; artifacts/cache-boundary/adversarial-review-partial.md",
      "final-recipe-amendment.md propuesta final: máximo acumulado4 y refinamientos explícitos, pendiente aprobación real; presupuesto3 actual agotado"
    ]
  },
  "scope": [
    "Fase A de #204: evaluar en directorios desechables una composición reproducible con fuentes oficiales npm y dependencias compatibles realmente corregidas, después de aprobar la spec",
    "Crear receta explícita, inventario completo, procedencia/integridades, hashes de dos builds y auditoría de los bytes efectivos",
    "Validar regresiones de avisos y contrato npm/Node bajo los mismos controles de instalación, caché, fallo y reparación a escala de experimento",
    "Emitir dictamen viable o no-viable con evidencia y próxima decisión; no reemplazar npm ni publicar artefactos al usuario en esta fase",
    "Ensayar modelo reversible con identidades de canal/version/treeHash/recipeHash y slots separados; la transición real solo si hay dos distribuciones aptas",
    "Ampliación6b3997 aprobada: parche de datos index.js de http-cache-semantics4.3.0, solo copias desechables; artefactos, revisión, compatibilidad y política conservadora declarada",
    "Segunda ampliación d6e2b54 aprobada: Apply experimental de parsing/expiry/304-Vary y caller15.0.6 policy.js/entry.js/index.js, sin adoptar distribución ni cambiar otros componentes"
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
    "Parche allowlist aprobada de dos componentes/cuatro archivos, preimage/postimage y diff exactos, originales intactos, dos outputs reproducibles; cualquier otro fix propio requiere acuerdo distinto",
    "Sin renombrar/bumpear dependencias para esconder avisos: conservar grafo físico/identidad upstream, raw auditoría, regresiones y derivación trazable; los controles existentes siguen obligatorios",
    "Tres variantes de patch consumen3/3 del presupuesto vigente; no cuarta candidata hasta aprobación real de final-recipe-amendment.md y sus proposal/design/spec, ni quinta por inferencia. Receipts y subconjuntos verdes no certifican una matriz/caller con fallos."
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
    "evidence": "Aprobación humana literal si de d6e2b543d632dc35b099037746891dbe2f3983db, registrada en evidence/boundary-amendment-approval.md; primera aprobación preservada en evidence/patch-amendment-approval.md",
    "justification": "La aprobación de d6e2b54 cubre Apply experimental acotado a dos componentes/cuatro archivos; su variante restante ya se consumió. Conserva BSD-2-Clause/ISC y originales sin redistribución ni servicios. Esta aprobación no certifica resultados ni aprueba el nuevo presupuesto/refinamientos de final-recipe-amendment.md, todavía pendiente."
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
