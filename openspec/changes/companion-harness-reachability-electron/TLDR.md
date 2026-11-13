# #150 — harness de producto y Electron

Ampliar pruebas existentes sin duplicar motores: matriz completa, cobertura de rutas, probes con denominador, mutaciones y evidencia nativa Windows con procedencia. Ejecución histórica sobre a3b1efd y hotfix #142. Revisión independiente y aceptación humana no se simulan. Último issue de ola 3; no entrar en ola 4.

## Nueva decisión preparada — 13 de noviembre de 2026

[Enmienda propuesta](coordinated-final-head-amendment.md): comprobar las siete fases
sobre una fuente final identificada, conservar sus criterios y recibos y, solo tras
todos sus gates, archivarlas en orden y presentar un PR protegido conjunto.
**El mantenedor aprobó f9ed23c:** «Sí, apruebo la enmienda f9ed23c».
[Recibo exacto](evidence/coordinated-final-head-approval.md).
Comienza el protocolo; [matriz por fase](evidence/coordinated-final-head-matrix.md).
No atribuye aceptación a layouts
históricos ni sustituye los recorridos humanos de #146 y Software A/B de #147.

Npm/Zod, #152 y la fase 1 de #206 ya están integrados en main `7073033`.
La composición local `332a261` conserva la UI de la pila, pero **no es apta todavía**:
strict 28/28 pasa; núcleo y Companion mantienen timeouts reales conservados.
No hay CI actual o instalador calificado de esa UI, archive de las siete fases
ni merge. [Resultados y límites](evidence/coordinated-final-head-preflight.json).
