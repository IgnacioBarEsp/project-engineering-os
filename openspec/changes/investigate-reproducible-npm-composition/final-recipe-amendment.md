# #204 — propuesta final de receta y representaciones

**Propuesta, NO aprobada ni aplicada.** La segunda ampliación aprobada en d6e2b543d632dc35b099037746891dbe2f3983db sí se implementó; no se pide repetir esa aprobación. Esta decisión es distinta: ampliar el máximo acumulado de **3 a 4 variantes congeladas**, permitiendo **una cuarta y última candidata** para corregir los fallos concretos de variante3. Hasta una aprobación humana de esta revisión publicada permanece vigente el máximo3, ya agotado.

## Evidencia y por qué hace falta otra decisión

[Ledger](evidence/component-apply-ledger.json): variante3 reproducible en dos construcciones por componente, 44/44 tests internos, matriz inicial152/152 y ampliada154/161; caller real67/69. No npm completo, auditoría de distribución, aceptación independiente, instalación o adopción.

- Historia de caché: los casos reales 304-introduce-vary y304-vary-star muestran una entrada pre304 todavía elegible aunque la metadata nueva tenga Vary correcto. No basta con modificar el último registro.
- Representaciones: normalizar tokens separados por coma dentro de una extensión entre comillas fabrica public/SWR/SIE o altera max-age legítimo. Se conservaron controles positivos. [RFC9111§5.2](https://www.rfc-editor.org/rfc/rfc9111.html#section-5.2) permite argumentos quoted-string; su contenido no equivale a nuevas directivas.
- Revalidación: Expires nuevo de304 se descarta, conservando freshness heurística. Las llamadas directas del componente aún discrepan respecto de Pragma con casing y matching URL; el caller cubre parte de estas rutas, no todas.
- La revisión independiente de esta candidata entregó observaciones preliminares y terminó sin informe final; no se considera aprobada. El padre confirmó los casos y dejó sus resultados persistentes.

La prioridad es cerrar la frontera completa y preservar usos legítimos, no hacer verde una selección de tests. No se reinicia ni oculta la historia de tres intentos.

## Cambio exacto propuesto

Mismas fuentes oficiales e integridades, sin cambio de versión: http-cache-semantics4.3.0 y make-fetch-happen15.0.6 del npm11.21.0 fijado. Allowlist upstream sigue siendo cuatro archivos:

1. index.js del componente: delimitar correctamente solo la lista Cache-Control necesaria para canonicalización, respetando comillas/escapes y contenido de extensiones, sin parser HTTP general ni nueva dependencia. Representaciones inválidas/ambiguas no conceden permisos. Conservar duración válida, TTL, API y campos v1; no reparsear headers para revivir controles efectivos eliminados por ignoreCargoCult. Comprobar representación legacy y el desacuerdo de markers cargo-cult explícitamente, sin cambiar defaults.
2. Mismo index.js: aplicar matching y Pragma consistentemente en entradas directas y corregir incorporación de Expires de304 en la frontera de freshness, además del Vary ya autorizado. Una validación legítima puede servir el cuerpo actual; la próxima reutilización debe respetar la política actualizada.
3. policy.js, entry.js e index.js del caller: impedir que historia/compaction de una clave conserve una alternativa pre304 que eluda la nueva restricción. Usar API existente de cacache sin modificar su código. Preservar otras claves/variantes legítimas, errores, edad SIE y defaults shared:false/ignoreCargoCult:true. Borrado fallido, metadata no persistida, interrupción o concurrencia no permiten reactivar una selección obsoleta. No borrar caché compartida completa ni carpetas del usuario.

Cualquier archivo/componente/fuente adicional, cambio de serialización/API o comportamiento ajeno exige detenerse. No se cambia npm source, otro header por conveniencia, gestor, baseline ni políticas. No se promete que la cuarta receta sea apta.

## Presupuesto y controles

Máximo4 solo tras aprobación real de esta revisión y sus cambios explícitos de proposal/design/spec. Una combinación congelada de patches/recipe nueva consume exactamente el cuarto intento; dos builds idénticos de esa receta no son dos variantes. Inputs/postimages/patchHash/recipeHash se fijan antes de construir. No quinta variante, rebase automático, reset ni retoques sucesivos después de congelar.

Antes de cualquier npm completo deben pasar los161 casos conservados más las representaciones relevantes construidas/legacy, matching, controles positivos y negativos; integración real debe añadir Expires, historia/compaction durable, fallo de escritura/invalidation, peticiones sucesivas/concurrentes y redirects/HEAD a los69 casos anteriores. No cambiar expectativas para esconder fallos. Verificadores rechazan links, drift, fuzz, paths y datos ejecutables; originales/LICENSE/copyright/identidad upstream intactos, atribución propia y diff exacto.

Un nuevo diff requiere un nuevo ciclo de revisión independiente y assessment de deuda; las observaciones parciales anteriores no lo aprueban. No repetir ni atribuir como nueva aprobación la revisión de variante3. Si no puede demostrarse la compatibilidad bajo los defaults/effective maps, detener y presentar el desacuerdo.

Solo si componente/caller pasan, continuar los gates originales: composición npm reproducible, grafo físico completo y auditor independiente, raw audit sin excepciones y todos los avisos/regresiones, Node22.22.0/24.18.0/24.20.0, npm version/ci y controles de scripts/bin-links/workspaces/registry/release-age, instalación/reparación/interrupción y recursos. Fixtures sintéticos no acreditan reversibilidad real. #208 y CI protegido siguen siendo obligaciones separadas.

## Costo, alternativas y parada

IgnacioBarEsp es owner. Cuatro archivos/dos componentes con representación y persistencia añaden mantenimiento y superficie de revisión; licencias BSD-2-Clause/ISC y procedencia se conservan, sin redistribución en esta fase ni compromiso de fork indefinido. El esfuerzo adicional propuesto es acotado a un intento verificable, sin prometer fecha ni corrección.

Alternativa: rechazar esta ampliación y seguir esperando correcciones oficiales, sin repetir instalaciones de inputs iguales. Un oficial nuevo se prueba sin parche, con los mismos gates y slot/identidad propios. El retorno oficial y cambios horizontales preservan historia/selección ante fallo y nunca activan un oficial vulnerable.

Si falla la cuarta receta, registrar no-viable/inconcluso y parar, sin aplicar una quinta ni ampliar alcance automáticamente. No archivar una fase incompleta o cerrar204/ola3 por investigación parcial. Adopción/publicación continúa necesitando otra aprobación, validación completa y PR protegido/CI verde. No ola4.

Aprobar significa aprobar **esta propuesta concreta** y sus additions de proposal/design/spec, presupuesto4 y costo, solo para Apply experimental. Una autorización general o un «si» a la segunda ampliación no aprueba esta tercera decisión.
