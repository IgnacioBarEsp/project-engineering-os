# Observación física 4a88216: 1 PASS en modo DIAGNOSTIC_ONLY

La [aprobación literal](physical-source-observation-approval-4a88216.md) de
`4a8821642bd87e41c94da613e6f4adffb77611a3` y la DoR fresca `13 PASS / 0 FAIL / 0 EXCEPTION`
precedieron a la única preparación e invocación autorizadas. El presupuesto de `4a88216`
quedó consumido (`1/1` copia y `1/1` invocación, `0` restantes).

## Resultado real (26 de noviembre de 2026 UTC)

- Preparación: `39,329 ms` (<= `180,000 ms`). Los 223 archivos de `apps/companion`
  coincidieron con la fuente QA `2a4c824`; solo `qa/distribution-identity.mjs` en la
  copia recibió la instrumentación congelada (`ccaa13a46dc50bae657064e928f245b3563670fa33b334b0def69f59bcb9f546`).
- Transporte físico de dependencias: los 1.944 archivos (`12,296,462` bytes) de
  `npm 11.21.2` se copiaron como archivos regulares con `COPYFILE_EXCL` (`nlink === 1`,
  sin enlaces ni ancestros vinculados), verificando el digest de inventario
  `6265d0c895db1a5185ab99bea58611055572066754901ade9639edea59953ead` en origen y destino.
- Invocación única (`2026-11-26T19:57:20.598Z` – `2026-11-26T19:58:25.598Z`):
  `64,999 ms` de proceso, `exit 0`, `signal: null`, `closed: true`, `failure: null`,
  `1 PASS / 0 FAIL / 0 CANCELLED / 0 SKIP`, TAP del caso `64,865.1983 ms`
  (TAP total `64,935.4316 ms`).
- Target exacto: `interrupted repair restores only the journal-owned unchanged quarantine, and retains project/history bytes`.
- Traza recolectada: `54` eventos / `7,090` bytes combinados (`trace-1580.jsonl`: `47` eventos,
  `6,211` bytes en proceso padre; `trace-9640.jsonl`: `7` eventos, `879` bytes en hijo
  terminado con `SIGKILL` en `npm-quarantined`). Relojes monotónicos mantenidos por proceso.
- Fases principales medidas en el reloj monotónico del proceso padre (`pid 1580`):
  - `parent.install`: `15.94 s` (`15,938 ms`)
  - `parent.waitForCrash` (hijo `SIGKILL` en `npm-quarantined`): `2.45 s` (`2,454 ms`)
  - `parent.inspectAfterRestart`: `8.59 s` (`8,593 ms`)
  - `parent.finalPlanRepair`: `12.01 s` (`12,015 ms`)
  - `parent.finalRepair`: `23.79 s` (`23,795 ms`)
  - `parent.finalInspect`: `0.80 s` (`799 ms`)
- Limpieza e integridad: los 223 archivos de origen y la copia observada permanecieron
  intactos tras el freeze; el root del fixture fue limpiado normalmente por el helper
  (`homeChildren: ["diag-trace"]`).
- CI de `4a88216`: run [45885753453](https://github.com/IgnacioBarEsp/project-engineering-os/actions/runs/45885753453)
  terminó en `SUCCESS` (`12/12` jobs).

## Límites conservados

- Clasificación estricta: `DIAGNOSTIC_ONLY`. Este resultado **no** cualifica el gate
  local, **no** borra el `9 PASS / 1 CANCELLED` histórico de `fa15`, el `2 PASS / 2 CANCELLED`
  de `d812` ni el fallo de preparación `0999922` (`LINK_REJECTED`), y **no** demuestra la
  causa del timeout histórico (que permanece `UNKNOWN`).
- No autorizó builds, VM, cambios de producto/QA, archivo ni integración.

## Artefactos persistentes

Prefijo: `artifacts/wave3-current/physical-source-observation/`.

| Archivo | SHA256 |
| --- | --- |
| `approval.json` | `fb9f8808ebe6686b05f6ac12bce242f666bac80615d2268f49f800ab751cf305` |
| `frozen.json` | `9f0c3c5161e04199510368bc24b852ace3047d9c0af2f14aec8575f4b4b02b44` |
| `result.json` | `f4a836dac72e3c43731316d757624a3e7cbc84c66c077047ab9786e5fc10a7f4` |
| `stdout.tap` | `eb253f526453c1ecec8065265360d6b41c48c0aff9aaa38aeaa16c3adfd172f9` |
| `trace-1580.jsonl` | `253b6dcdef46af61f305fe7ac134f012b1c69c928284a294a92c1c73e5f3200d` |
| `trace-9640.jsonl` | `ce15440c4206a641d41f79a4f2f67bf713bca766318f24894438e44195f9addc` |
