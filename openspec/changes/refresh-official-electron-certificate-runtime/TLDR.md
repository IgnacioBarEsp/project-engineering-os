# #218 — Electron oficial con la mitigación de certificados

**Revisión7af8a2a aprobada; Apply acotado iniciado, todavía sin candidata apta.**
[Respuesta literal y alcance](evidence/spec-approval.md). C8cd8d5 y los anteriores
cambios del harness ya están aprobados/aplicados; esta decisión es independiente.

**STOP antes de generar fixtures o congelar variante:** la investigación previa
confirmó un desacuerdo estático en el testigo TLS propuesto, no un fallo medido de
Electron44.9.1. [Evidencia y presupuestos intactos](evidence/prepatch-stop.md).
La [enmienda concreta del testigo](production-chain-witness-amendment.md)2d2d28c
también fue aprobada: «Sí, apruebo la enmienda 2d2d28c». Continúa únicamente el
Apply acotado con ese protocolo; no se añade presupuesto ni se repite investigación.
Ninguna de las dos aprobaciones vuelve a estar pendiente.

El instalador candidato0.3.7 empaqueta Electron44.1.1, incluido en el
[aviso primario](https://github.com/electron/electron/security/advisories/GHSA-jr5w-w6x2-84p9).
La etiqueta devDependency no excluye el runtime entregado. La triage estática
encontró una configuración soportada con TLS remoto; no explotación del proyecto.

Se propone **Electron oficial44.9.1**, primera corregida de la rama44, conservando
la app candidata0.3.7. Sus Node/Chromium embebidos cambiarán con el binario y se
medirán; Node gestionado, npm11.21.2, Git, CodeGraph y OpenSpec1.6.0 no cambian.
[Diseño, allowlist e identidades](design.md); [baseline y límites](brownfield-baseline.md).

La decisión incluye:
- Solo pin/entrada Electron del lock; ninguna otra dependencia.
- Una comprobación nueva de TLS/HTTPS/fetch en Electron real, conectada al
  verificador Windows ya requerido, preservando18capturas/12copias y su timeout.
- Datos públicos de certificado fijados por hash y dos identidades localhost de
  prueba vigentes, generadas una vez con el OpenSSL ya existente y congeladas.
  No entran en la aplicación distribuida ni en el almacén de confianza del sistema.
- Una variante, una comprobación de contraste, dos builds con fuentes/fixtures
  congelados, una revisión previa y una adversarial posterior acotadas. Se
  reutiliza el único ciclo instalado corregido todavía sin consumir de #150:
  se cambia su candidata por la final44.9.1, no se añade otro ciclo.
- Suites/auditorías/recuperación/recursos/archivo y PR protegido con CI vigente.
  Humanos146 y SoftwareA/B147 siguen separados en candidata realmente apta.

El ZIP Windows declarado pesa158389896bytes (~151MiB), más dependencias ya
existentes; las medidas reales de descarga/build/instalación/memoria deben
registrarse contra el artefacto e713 retenido. No hay servicio de pago,
dependencia nueva, rebuild de Electron ni parche de certificados propio.

Los tests oficiales usan hooks de depuración y sus certificados de ejemplo
caducaron en abril2026. Esos skips o fixtures inválidos no acreditan el arreglo.
El protocolo propuesto usa el binario oficial de producción y la verificación
TLS estricta. Si no demuestra su testigo y controles, se detiene; no se cambia
la expectativa, el reloj, el trust del host o las protecciones para lograr verde.

DoR de preparación13/13 sin excepciones; OpenSpec local1.6.0 strict29/29,
docs/neutralidad/deuda read-only/diffcheck PASS. Readiness de archivo9PASS/6FAIL,
13tareas pendientes,mutationPerformed:false; ningún archive.
[Evidencia e identidades](evidence/manifest.json).
La integridad del ZIP y el wrapper todavía es declarada, no medida por descarga.
No pin/lock/runtime nuevo aplicado, installer nuevo, archive, merge, tag o release.
Ola3 sigue abierta y ola4 no se inicia.
