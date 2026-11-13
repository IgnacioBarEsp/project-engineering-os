# Decisión propuesta: corregir un rol del fixture de Negocio

**Propuesta preparada; no aprobada ni aplicada.** La aprobación2667452 está
resuelta y se aplicó en `662fc2786444ad32dec6a26d30ce3f604ca69d65`.
Esta decisión no vuelve a pedirla ni la sustituye.

## Diagnóstico y evidencia que se conserva

La primera y única ejecución formal de las siete regresiones de2667452 terminó
con5PASS/2FAIL, exit1, sin timeout ni cambios en la copia congelada. Ambas fallan
por `ROLE_INVALID`: el nuevo fixture `business` suministra `role:'analyst'`.
`normalizeSelection` admite researcher/student/developer/freelancer/creator/general;
student ya era válido. No es un fallo demostrado de producto o de CI.

La regresión negativa de perfil omitido no alcanza su comprobación esperada
porque valida antes ese fixture inválido. No se modifican sus expectativas para
ocultar el error. Los otros cinco controles pasaron, incluyendo todas las anclas
actuales únicas y el rechazo de detecciones por setup/parse/timeout.

Raw permanente standalone de este worktree:
`artifacts/wave3-current/regressions-harness266.json`,
SHA256 `89b9e35d3cbb0292a4b77eaf941e268ce05e554e799e9134be5914807e68478c`.
El ledger congelado, el commit662fc27 y ese fallo permanecen inmutables.

## Cambio exacto propuesto, todavía sin Apply

Solo `apps/companion/scripts/native-project-fixtures.mjs`, una aparición:

```diff
-  business: {name:'Propuesta de trabajo',role:'analyst',profile:'business',focus:'plan',
+  business: {name:'Propuesta de trabajo',role:'freelancer',profile:'business',focus:'plan',
```

`freelancer` ya está reconocido por el validador de producto intacto y corresponde
al corpus de propuesta/cotización existente. Los siete escenarios, seis perfiles,
enfoques, documentos, consultas, formatos y testigos permanecen iguales.
No se cambia el validador, la app, las aserciones QA ni los otros cuatro archivos
de la corrección2667452; tampoco npm, CI, timeouts, aislamiento o protecciones.

Preimage SHA256 `11ec2daf6a4ff9a816c6dc1647c1fee42cd08037a8b0e111e6b370fb2047f117`,
4623bytes. Postimage propuesto SHA256
`ce9106b2fb2ff04c139a3ac4c1a0755505a3b364bbaf1a15c00fc8580be65b61`,4626bytes.
El cálculo del postimage es preparación de datos; no modificación de la fuente.

## Decisión de presupuesto y comprobación

La enmienda aprobada fijó «una variante de corrección» y «Ejecutar una vez las
regresiones nuevas». Esa variante y ejecución ya están consumidas. La decisión
propuesta autoriza **una variante adicional exclusivamente para ese literal** y
una nueva ejecución de las mismas siete regresiones sobre la entrada corregida,
sin borrar, reinterpretar o reiniciar el contador anterior: máximo acumulado2,
consumidas1 antes de esta decisión. No autoriza una cadena de variantes.

La única ejecución completa de mutaciones autorizada por2667452 terminó PASS:
37/37 puntos únicos,37/37 mutaciones detectadas por comportamiento, fuentes
restauradas y copia limpia. Baselines reales: project-list16/16, prompts13/13,
stack13/13; Node24.18.0/Windows, sin timeout. Raw permanente
`artifacts/wave3-current/service-mutations-266/service-mutations.json`,
SHA256 `bd49c655e96d4eb6d6b8a02f0a11e0a07c407df3f2d0e31a4381a140a8d00303`.
Este cambio no modifica sus entradas y no autoriza repetir ese runner.

[Resultado e índice de evidencia](evidence/harness-apply-result-662fc27.json).
DoR fresca13/13,0excepciones, OpenSpec local fijo1.6.0 strict28/28,
docs/neutralidad/debt-read-only/diffcheck PASS para la propuesta. Son controles
de preparación, no certificación de la corrección todavía sin aplicar.
Readiness de archivo12PASS/4FAIL,0excepciones,mutationPerformed:false: tareas,
regresiones y revisión siguen abiertas. No se ejecutó archive.

El único ciclo canónico instalado y la única reconciliación incremental por el
mismo revisor de e713 siguen sin consumir. Solo tras regresiones aptas se usarían
esos gates ya aprobados, registrando las nuevas identidades del harness y las
del instalador e713 por separado. Un fallo no acredita pasos posteriores.
Se conserva la limitación informativa del wrapper fuera de allowlist que imprime
cinco recorridos: el denominador exigido por JSON es seis perfiles/siete escenarios,
sin editar ese sexto archivo o aceptar cinco como completos.

## Recuperación y límites finales

La modificación se congelaría con preimage/postimage y hash nuevo enlazado al
ledger anterior, append-only. Recuperación por revert revisado conservando
originales y resultados. El instalador e713 solo se reutilizaría con los cinco
directorios de producto byte-idénticos; no se atribuiría su manifiesto al harness.

No revisión post-fix, cierre de deuda, archive, merge, release o aceptación humana
se infiere de esta propuesta. #146 y SoftwareA/B#147 siguen pendientes en candidata
apta. Las siete fases se cerrarían solo mediante el protocolo f9ed23c ya aprobado.
Ola3 continúa abierta y no se inicia ola4.
