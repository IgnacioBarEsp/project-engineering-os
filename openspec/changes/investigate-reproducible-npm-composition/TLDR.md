# #204 — última variante aprobada; límite de compatibilidad confirmado

**Tu «si» aprobó la cuarta y última variante de be7a2ed48c0f977f49da9857245f9f2096f83788.** [Registro literal](evidence/final-recipe-approval.md). No se pide repetir esa aprobación. Presupuesto: **3/4 consumidas, una restante, cero composiciones npm completas**. No se congeló ni construyó la cuarta receta.

La investigación previa reprodujo tres pares de estados oficiales v1 byte-idénticos: permisos legítimos frente a permisos fabricados por el error de comillas. No pueden distinguirse manteniendo toda la compatibilidad histórica prometida. El [ledger](evidence/component-apply-ledger.json) conserva helper, resultados completos y hashes. Es un defecto del componente; no prueba explotación del Companion ni que el caller siempre guarde los mismos headers reformateados.

La [decisión de migración propuesta](cache-migration-amendment.md), **todavía no aprobada ni aplicada**, permite dejar intacta pero no reutilizar la caché antigua, emitir políticasv2 y probar un journal/generaciones propios del caller para impedir resurrección de datos. El costo es perder parte de la reutilización offline legítima y descargar otra vez cuando haya red, más mantenimiento/I/O. Sin red/only-if-cached se falla cerrado; no se borran proyectos ni cachés del usuario. La alternativa es parar este derivado y seguir esperando upstream. No añade un quinto intento, componente o archivo upstream.

El acuerdo aprobado exige detenerse y presentar este desacuerdo antes de gastar la última variante. No se ha modificado tu instalación. Originales, licencias/identidades, defaults, catálogo, locks, avisos, OpenSpec, auditorías y protecciones siguen intactos.

**Variante3 sigue congelada y NO apta:** dos construcciones por componente idénticas,44/44 tests; matriz inicial152/152 histórica, ampliada154/161; integración real del caller67/69. Persisten comillas, Expires/matching/Pragma e historia pre304/Vary. Su revisión independiente fue parcial/incompleta, no aceptación. Se preservan todas las candidatas y fallos; no se repiten instalaciones de inputs iguales.

Incluso un componente/caller apto no basta: siguen pendientes npm completo, grafo/auditor independiente, audit raw/advisories, runtimes, instalación/reparación/recursos y reversibilidad real. IgnacioBarEsp decide mantenimiento/retirada; no se promete fork indefinido. Un oficial futuro se prueba sin patch, en identidad/slot separado y con los mismos gates; nunca rollback a un oficial vulnerable.

#204/#208 y ola3 siguen abiertos. No archivo, PR nuevo, merge, release ni ola4. Adopción requiere otra spec aprobada y PR protegido/CI verde.

[Proposal](proposal.md) · [Diseño](design.md) · [Requisitos](specs/companion-npm-composition/spec.md) · [Tareas](tasks.md) · [Cuarta variante aprobada](final-recipe-amendment.md) · [Migración pendiente](cache-migration-amendment.md)
