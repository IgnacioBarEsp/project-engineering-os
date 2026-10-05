# #204 — receta final ejecutada y rechazada

La migración experimental de 54c6b2c348074c330468317e2790af784ac169af recibió **«Apruebo»**; [registro literal](evidence/cache-migration-approval.md). La cuarta receta de be7a2ed seguía aprobada y se ejecutó: **4/4 variantes consumidas, cero restantes, cero composiciones npm completas**. No hay otro gate pendiente para aquella migración ni permiso para un quinto intento.

**La variante 4 NO es apta.** Dos construcciones independientes por componente fueron idénticas; sintaxis 4/4, verificador/modelo 44/44, componente 161/161, controles nuevos de formato 24/24 y caller básico real 69/69. Esos verdes parciales no bastan. La revisión independiente encontró tres P1 y el padre los reprodujo en el caller real:

- Una respuesta seleccionada fresca puede leerse ya vencida pese a must-revalidate.
- Una petición antigua pendiente, con un header irrelevante diferente, restaura caché después de una respuesta nueva no-store.
- Un stream pausado entrega 30 bytes antiguos que estaban en buffer, aún no entregados, después de revocar su generación; el error posterior no los recupera.

Los probes de protocolo dan **5/8 PASS en ejecución directa y 4/8 en entorno aislado**; el de buffer da **FAIL en ambos**. La ejecución aislada conserva los mismos tres fallos de seguridad y descubre una regresión adicional: dos lecturas legítimas concurrentes pueden fallar con ENOENT al desaparecer una lease entre mkdir y lstat. Es una observación del padre, no un cuarto hallazgo atribuido al revisor. La etiqueta cruda harnessError no cambia que el error proviene de Response.text del caller. [Ledger](evidence/component-apply-ledger.json) enlaza hashes, helpers, resultados crudos, revisión independiente completa y assessment de deuda. Preserva variantes 2/3, los estados v1 byte-idénticos y todas las lecturas/aceptaciones humanas previas.

Solo cambiaron los datos de parche/manifiestos de los dos componentes y el expediente de investigación. El grafo real del caller contiene 1530 archivos con exactamente cuatro fuentes distintas; los 14 límites de producción, originales/licencias y sentinels siguen intactos. **No se modificó tu instalación, proyectos, runtime Companion, catálogo, locks oficiales, avisos, instalador, OpenSpec, auditoría o protecciones.** No se atribuye explotación de Companion a estos probes.

Se detuvo el Apply después del fallo de la última receta, sin retocar sus hashes ni construir una quinta. Siguen desconocidos/pendientes el protocolo completo de dos procesos/interrupción/faults/mantenimiento, npm completo y sus auditorías/advisories, matriz Node, instalación/reparación/recursos y reversibilidad real. La deuda no dispensa los P1.

**Siguiente decisión:** esperar un oficial que supere los mismos gates, o presentar una nueva propuesta de investigación con frontera/presupuesto realmente aprobados antes de otro parche. No se ha preparado ni aprobado esa propuesta futura. Una autorización general no reinicia el límite. La vigilancia oficial puede continuar sin reinstalar inputs iguales ni repetir preguntas humanas ya resueltas.

#204/#208 y ola 3 continúan abiertos. No archivo de fase incompleta, PR nuevo, merge, release u ola 4; adopción es otra spec aprobada con CI protegido verde.

[Proposal](proposal.md) · [Diseño congelado](design.md) · [Requisitos](specs/companion-npm-composition/spec.md) · [Tareas](tasks.md) · [Cuarta variante aprobada](final-recipe-amendment.md) · [Migración aprobada](cache-migration-amendment.md)
