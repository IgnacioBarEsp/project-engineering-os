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

## Resultado de la cualificación de e713e9a

PR #217 abierto/draft: CI43364174800 pasó12jobs, incluido Electron Windows.
El instalador actual se construyó y verificó; el ciclo canónico en VM falló
PROFILE_INVALID en el harness de perfiles retirados. Una revisión independiente
concluyó con dos P2 de verificadores (fixtures y anclas de mutaciones), no una
regresión de UI demostrada. Fallos y revisiones originales se conservan.

[Ampliación concreta propuesta](installed-evidence-harness-amendment.md) para
corregir solo verificadores/fixtures/QA y reconciliar ese diff. **Aprobada2667452**:
«Sí, apruebo la enmienda 2667452». [Recibo](evidence/installed-harness-approval.md).
El Apply se congeló en662fc27; las regresiones dieron5/7 y dos fallos por el rol
`analyst` del fixture de Negocio. La app conserva su guarda correcta. Se retienen
los fallos, el presupuesto y las fuentes originales. El runner completo terminó
PASS37/37 por comportamiento, con tres baselines aptos y fuentes restauradas.
[Resultado y evidencia](evidence/harness-apply-result-662fc27.json).
La VM y reconciliación incremental no se han usado.

[Decisión adicional concreta](fixture-role-correction-amendment.md): cambiar solo
ese literal por `freelancer`, con una variante adicional y una comprobación de las
mismas regresiones sobre entrada corregida. **Todavía no aprobada ni aplicada.**
2667452 y f9ed23c ya están aprobadas y no se vuelven a pedir. Humanos #146/#147
siguen pendientes en candidata apta; no archive, merge, release u ola4.
