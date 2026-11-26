# Aprobación literal — cualificación de reparación pendiente f41af24

El mantenedor recibió la revisión inmutable `f41af246138fcfbae8d528f71fa933e99f9c1820`
([remaining-repair-qualification-proposal.md](../remaining-repair-qualification-proposal.md))
antes de aprobarla en el chat mediante la respuesta literal:

> apruebo

Alcance aprobado:
- Una preparación adicional (<= `180 s`) con fuente QA original **sin instrumentación**
  (`changed: []`), copia física verificada de los 1.944 archivos de `npm 11.21.2` y
  entorno aislado en Windows x64 con Node `24.18.0`.
- Una sola ejecución (proceso <= `120 s`, caso `90 s`, limpieza `5 s`, sin reintento)
  del caso original `interrupted repair restores only the journal-owned unchanged quarantine, and retains project/history bytes`
  con el filtro exacto de `fa15`.
- Reutilización condicionada de los nueve `PASS` de `fa15` únicamente si coinciden los
  hashes de código, runtime, dependencias y entradas pertinentes, presentando sus
  recibos junto al resultado independiente del caso pendiente sin declarar un `10/10`
  de la misma corrida.
- Requerimiento de CI vigente y revisión de la evidencia antes de pasar a gates
  posteriores; ninguna autorización implícita de arreglo futuro, builds (`0/2`),
  VM (`0/1`), archivo o cierre.

Recibo persistente en almacenamiento managed (`artifacts/wave3-current/remaining-repair-qualification/approval.json`):
- SHA256: `dcf103a483243f049cafc170305e9626796f853b1d4f40cf4890df97e3e576eb`
- Registrado en la metadata `pre-propose` del issue `#150` (`manualInterventions`: `remaining-repair-qualification`, `status: "approved"`).
- DoR fresca previa a la preparación (`dor.stdout`): `13 PASS / 0 FAIL / 0 EXCEPTION`,
  SHA256 `00aa9865569281f4e7671f23b60c1de42503ed4b6a62b4dd176d0533b717044f`.
