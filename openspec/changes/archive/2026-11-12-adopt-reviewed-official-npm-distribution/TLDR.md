# #204 — npm oficial comprobado, listo para archivo e integración

Las dos decisiones están aprobadas: revisión **8d335a2** y enmienda **f3b4ff2**.
[Registros](evidence/spec-approval.md) · [Enmienda](evidence/windows-source-approval.md).
La candidata Companion **0.3.7** incorpora **npm oficial intacto11.21.2**; no usa un fork ni otro parche.
La CI completa del código **346e3bd** pasó en Windows, macOS y Linux.
[Verificación final](evidence/final-product-verification.md) · [Índice de producto](evidence/product-manifest.json).

- Auditorías raíz/runtime/blueprint/Companion: **0 high/critical**, cero excepciones; permanecen
  **1/0/0/32 moderate** respectivamente. No se afirma ausencia de vulnerabilidades.
- Árbol npm oficial completo: **1944 archivos / 12296462 bytes**, hash, licencias y ZIP exactos.
  La copia de desarrollo excluye únicamente los27auxiliares Windows aprobados, inventariados y no ejecutados.
- Identidad/slot/selección con fuente y árbol completo, generación esperada y readback durable.
  Solo está habilitado el oficial revisado; futuras versiones/derivados requieren su propia adopción.
- Instalador real construido y verificado; actualización, reparación, cancelación, crash/reinicio y
  desinstalación probados en Windows Sandbox. Proyectos/historial/slots anteriores conservados;
  el npm antiguo vulnerable nunca se activa como fallback.
- Revisiones independientes con sus alcances distintos completadas; sus hallazgos fueron reproducidos,
  corregidos y comprobados por el padre. No se atribuye una aprobación independiente post-fix.
- Assessment clean capturado una vez: registro50objetos/37abiertos y74assessments previos intactos.

El ensayo nativo automatizado cubrió5perfiles,0hallazgos y14aspectos no verificados. No sustituye
lecturas ni aceptación visual humanas. La VM ya está detenida. Dos canales aptos reales no existen;
las pruebas de igual versión/canal siguen etiquetadas como sintéticas. No se prueba FS hostil/power loss.

El archivo oficial y el merge protegido se ejecutan después de readiness real y CI verde del head final.
#214 viaja con sus bytes aprobados intactos y expediente propio; #215 se conserva hasta sustitución
integrada. #207 y la pila UI no se mezclan. La descarga pública sigue0.3.6: no hay tag/release0.3.7.

La investigación rechazada conserva4/4recetas consumidas,0restantes; no se archiva incompleta.
Este avance no cierra ola3 ni inicia ola4.

[Propuesta](proposal.md) · [Diseño](design.md) · [Requisitos](specs/companion-environment/spec.md) ·
[Tareas](tasks.md) · [Baseline](brownfield-baseline.md)

## Official archive checkpoint — 2026-11-12

Readiness16PASS/0FAIL/0exceptions for each phase was verified without mutation. Fixed official
OpenSpec1.6.0 then archived both changes and updated the three canonical specs with validation enabled.
This is an actual local archive, not integration. Protected merge still waits for required CI at the
closure head; published download remains0.3.6. The rejected research was not archived.
