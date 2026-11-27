# Aprobación literal para builds reproducibles (2/2) y ciclo VM corregido (1/1) sobre 20fbe4c

- **Commit aprobado como entrada**: `20fbe4cc685023a3bf27a9483d592c94cb0cf307` (rama `codex/wave3-current-source-verification`, PR draft `#217`).
- **CI requerida previa sobre `20fbe4c`**: run [45906034881](https://github.com/IgnacioBarEsp/project-engineering-os/actions/runs/45906034881) — `SUCCESS` (`12/12` jobs, incluidos `CI / required`, `CI / dependency audit`, `CI / Companion Electron / windows-latest` y matrices de 3 SO para core y Companion).
- **DoR verificada antes de ejecutar**:
  - Issue `#150`: `13 PASS / 0 FAIL / 0 EXCEPTION`
  - Issue `#218`: `13 PASS / 0 FAIL / 0 EXCEPTION`
- **Propietario**: `IgnacioBarEsp`
- **Fecha/hora UTC**: `2026-11-26T23:12:50Z`
- **Respuesta literal**: `continua donde te quedaste, autorizo`
- **Recibo persistente**: `artifacts/wave3-current/builds-and-vm-20fbe4c/approval.json` (`486` bytes, SHA256 `50299de442d29d53074c05fa8542c4d552693ec7f39b61b086a2d26b3896258f`).

## Alcance autorizado y límites

1. Ejecutar los dos builds reproducibles del candidato `20fbe4c` (`0/2` → `2/2`, Electron `44.9.1` + `npm 11.21.2`) desde copias limpias congeladas con `verify-app-artifact.mjs`, comparando inventarios completos, runtime oficial, archivo sellado de `npm`, firmas reales y métricas frente al artefacto retenido `e713`.
2. Ejecutar el único ciclo canónico corregido en Windows Sandbox offline (`0/1` → `1/1`, `4 GiB`, red desactivada, entradas de solo lectura, evidencia en directorio propio) usando el instalador verificado de `20fbe4c`.
3. **Fuera de alcance**: no instalar Companion en el host del mantenedor, no modificar código de producto, QA, locks, CI o `.project-os/debt/`, no sustituir recorridos humanos `#146` o Software A/B `#147`, no archivar cambios, no integrar PR `#217`, no publicar release ni iniciar ola 4.
