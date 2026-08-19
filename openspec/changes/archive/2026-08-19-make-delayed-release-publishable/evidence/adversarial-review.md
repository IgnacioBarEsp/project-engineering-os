# Revisión adversarial

**Alcance:** Issue #17 y change `make-delayed-release-publishable`.

**Fuentes:** issue enriquecido, proposal, design, delta spec, tasks, diff contra `origin/main`, workflow,
scripts de release, documentación, pruebas negativas, suite completa, audit y pack dry-run.

## Alineación spec/tareas

- El GitHub Release recibe el candidato probado y conserva la identidad canónica.
- El job npm conserva environment, OIDC y tag, pero ya no descarga el artifact temporal.
- La reconstrucción posterior se usa solo como evidencia y nunca como argumento de publicación.
- El comparador exige los tres nombres esperados, archivos regulares y bytes idénticos.
- La retención de 35 días excede la espera máxima documentada de 30 días.

## Hallazgos corregidos durante la revisión

| Severidad | Área | Hallazgo | Corrección |
| --- | --- | --- | --- |
| Minor | Pruebas negativas | La primera cobertura agrupaba assets distintos, pero no demostraba por separado ausencia y divergencia válida. | Se añadieron casos independientes para asset ausente, adicional, distinto con checksum válido y manifest malformado. |
| Minor | Checker estático | Una búsqueda global de `retention-days: 35` podía aceptar el valor en otro bloque. | La política vincula ahora el valor al artifact `release-candidate`. |

## Casos negativos revisados

- **Artifact temporal expirado o eliminado:** npm obtiene la copia del GitHub Release.
- **Release ausente:** `gh release download` falla antes de comparar o publicar.
- **Asset ausente o adicional:** el conjunto exacto de tres archivos se rechaza.
- **Tarball distinto pero autoconsistente:** la comparación byte por byte falla.
- **Manifest con ruta o nombre no seguro:** solo se admite un basename `.tgz`.
- **Release mutable reemplazado:** la reconstrucción desde el tag no coincide y bloquea npm.
- **Regresión a download-artifact:** el checker estático y su prueba fallan.
- **Token persistente o pérdida de OIDC/environment:** la política estática falla.
- **Reintento con Release existente:** se compara contra el candidato recién validado.

## Veredicto

**PASS.** Cero Blockers y cero Majors abiertos. Dos Minors de cobertura se corrigieron antes del cierre. El
Issue #25 conserva deuda histórica de OpenSpec ajena a este change; #17 no añade deuda residual.
