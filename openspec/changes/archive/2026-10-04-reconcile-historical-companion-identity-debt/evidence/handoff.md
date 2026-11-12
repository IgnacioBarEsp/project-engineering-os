# Handoff de #206 — fase 1

Scope aprobado: reconciliar solo debt-bee2fa0c0549, sin repetir la corrección de la guarda. Spec aprobada por el mantenedor; Bugbot independiente no reportó hallazgos en a6127ce. La revisión posterior del implementador y los recibos reales están separados.

Implementación en la rama: inventario de 37 IDs, fuentes/hashes/prioridades, separación de evidencia estática/histórica, verificador repo-only y cuatro tests; captura oficial nueva y recaptura no-op. 50 items, 36 abiertos, otros 49 objetos y 73 assessments previos intactos; presupuesto 4/5 y tres flujos. QA previa: 393/393; posterior a captura: 62/62, documentos/strict/verificador PASS. DoR 13/13 sin excepciones.

El estado integrado de main no cambia por esta preparación. #206 sigue OPEN, no Done/archivado: quedan 36 entradas que requieren evidencia y decisiones propias. #205 y seguimientos #146/#147/#149/#150/#173 conservan su orden y alcance. No iniciar ola 4.

Progreso de #206/#167 actualizado sin modificar historia (handoff-progress-receipt.json). Readiness archive real 16/16 PASS y archive/sync oficial OpenSpec 1.6.0 realizados (readiness-archive.json, official-archive.json). Siguiente flujo: PR protegido base main con Refs #206 (sin autocierre), revisar CI real. #204 permanece bloqueo externo: esperar npm oficial corregido; ninguna excepción nueva, reconstrucción npm, cambio de gestor, reducción de protección o merge rojo. Un archive no constituye integración.

Después de publicar el PR, conservar URL/head/checks actuales en el recibo de integración. Solo CI requerido verde y merge permitido autorizan reportar esta fase integrada; nunca cerrar todo #206 o ola 3 por este único registro. No falta aprobación humana para esta fase documental; no simular los recorridos humanos pendientes del producto.
