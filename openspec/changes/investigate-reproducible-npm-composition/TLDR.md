# #204 — tercera variante probada, todavía no apta

**La segunda ampliación de d6e2b543d632dc35b099037746891dbe2f3983db está aprobada y aplicada solo en copias desechables.** Tu respuesta literal «si» está en [el registro de aprobación](evidence/boundary-amendment-approval.md). No hay instalación ni adopción en host/Companion.

Dos construcciones de cada componente son idénticas; originales, BSD-2-Clause/ISC, identidades y 14 límites de producción siguen intactos. Pasan 44/44 pruebas del verificador/modelo. La matriz inicial pasó 152/152, pero la ampliación con los casos confirmados de revisión resulta **154/161**. La integración con HTTP local, cacache y streams reales resulta **67/69**.

Los dos fallos reales permiten recuperar una entrada antigua después de un Vary nuevo de 304. La revisión también mostró interpretación incorrecta de comillas, Expires nuevo perdido y diferencias entre controles directos del componente y del caller. Las pruebas fallidas se conservan; no se presenta el resultado inicial como corrección completa. El único ciclo de revisión independiente produjo observaciones parciales, pero no un informe final: ese gate sigue incompleto.

**Se consumieron 3/3 variantes, sin reiniciar el presupuesto; composiciones npm completas: 0.** No habrá otro parche automáticamente. La [ampliación final propuesta](final-recipe-amendment.md), todavía NO aprobada ni aplicada, solicita una cuarta y última receta y refinamientos concretos de esas mismas representaciones/metadata, con los mismos dos componentes/cuatro archivos y controles. La alternativa es seguir esperando upstream.

El [registro de avance](evidence/component-apply-ledger.json) enlaza los resultados completos, hashes, controles legítimos, revisión parcial y evaluación de deuda. No se repiten instalaciones oficiales sin inputs nuevos. Catálogo, locks, avisos, baseline, OpenSpec, auditorías y protecciones no cambiaron.

Un oficial futuro se prueba sin parches con los mismos gates, en identidad/slot separado. Reversibilidad real, auditoría completa, runtimes, instalación/reparación y recursos aún no están demostrados. IgnacioBarEsp decide mantenimiento/retirada; no se promete un fork indefinido.

#204/#208 y ola3 siguen abiertos. No archivo, PR nuevo, merge, release ni inicio de ola4. Adopción requiere otra spec aprobada y PR protegido/CI verde.

[Proposal](proposal.md) · [Diseño](design.md) · [Requisitos](specs/companion-npm-composition/spec.md) · [Tareas](tasks.md) · [Segunda ampliación aprobada](boundary-amendment.md) · [Ampliación anterior aprobada](patch-amendment.md)
