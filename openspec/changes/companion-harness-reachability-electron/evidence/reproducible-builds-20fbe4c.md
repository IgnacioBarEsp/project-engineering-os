# Builds reproducibles (2/2 PASS) sobre 20fbe4c (Electron 44.9.1 + npm 11.21.2)

Tras la [aprobación literal](builds-and-vm-approval-20fbe4c.md), CI `45906034881` (`12/12 SUCCESS`) y DoR `13/13` en `#150` y `#218`, se ejecutaron exactamente los dos builds autorizados (`2/2`, `0` restantes) sobre copias limpias e independientes del commit `20fbe4cc685023a3bf27a9483d592c94cb0cf307` usando Node fijado `v24.18.0` (`9a4eb5f1c29c6a2e93852ead46b999e284a6a5ca8bab4d4e241d587d025a52de`) y copia verificada de `node_modules` desde `c/` y `k218b/repo/` sin ejecutar `npm install`, scripts de ciclo de vida ni descargas.

## Resumen de ambos builds

| Campo | Build 1 (`o20f-1`) | Build 2 (`o20f-2`) | Comparación |
| --- | --- | --- | --- |
| Commit / árbol | `20fbe4c` / `clean` | `20fbe4c` / `clean` | Idéntico |
| Electron / packager / core | `44.9.1` / `electron-builder 26.15.3` / `0.5.0` | `44.9.1` / `electron-builder 26.15.3` / `0.5.0` | Idéntico |
| `pack-app.mjs` | `101,294 ms` (`exit 0`) | `84,020 ms` (`exit 0`) | `2/2 PASS` |
| `verify-app-artifact.mjs` | `10,637 ms` (`PASS`) | `9,714 ms` (`PASS`) | `2/2 PASS` |
| Firma real observada | `NotSigned` (`signed: false`) | `NotSigned` (`signed: false`) | Sin certificado de editor |
| Dependencias / empaquetados | `151` paquetes / `2,590` archivos (`69,083,820` B) | `151` paquetes / `2,590` archivos (`69,083,820` B) | Idéntico |
| `win-unpacked/` | `2,662` archivos / `458,983,230` B | `2,662` archivos / `458,983,230` B | **0 diferencias** (`d8ea18bb...`) |
| `resources/npm-dist.zip` | `4,207,812` B (`fef16d4e...`) | `4,207,812` B (`fef16d4e...`) | **Idéntico** (`treeHash 5f3ed514...`, `1,944` archivos) |
| Instalador NSIS `.exe` | `133,698,243` B (`3b6410b4...`) | `133,698,238` B (`e05bda0f...`) | Diferencia de `5` bytes por metadatos/timestamps del contenedor NSIS/PE |

### Identidades exactas congeladas

- `win-unpacked/` digest de inventario (Build 1 y Build 2): `d8ea18bb268bd209e6a058f8e2c43c5506821124568b8a9373e69f7ad80e9215` (`0` diffs entre `2,662` archivos).
- `resources/npm-dist.zip`: SHA256 `fef16d4e55a97a22965ab51dd6dc2b670274a4d303d48e6b1da1d0f7a29803ef`, `treeHash` `5f3ed5146082cfcb794ebb8fe6c1d8cc58b336aec26e3df0f871823c1758ec82`, distribución `eac8d0556bad1da3835d0fd1376c546ce5840bc9191b5e92cd5ef1da02a0e835`, `1,944` archivos / `12,296,462` bytes (identidad oficial `npm 11.21.2` sin cambios respecto a `e713`).
- `electron.exe` de origen (`44.9.1`): SHA256 `1432afee01d6a788f11cb6649efd271923e1e490beef688c24d31f47965013aa`.
- Build 1 instalador `ProjectEngineeringOS-Setup-0.3.7-x64.exe`: `133,698,243` bytes, SHA256 `3b6410b47da3e141ee00786aedc91ac673f28faed31e3a36a2aae474581d8197`.
- Build 2 instalador `ProjectEngineeringOS-Setup-0.3.7-x64.exe`: `133,698,238` bytes, SHA256 `e05bda0fbbc1bdc2f751cb12308c03162d6720fdb9c5feaf953fdb575740336d`.

## Comparación frente al artefacto retenido `e713` (Electron 44.1.1)

- Instalador `e713`: `133,307,422` bytes (`Electron 44.1.1`) → Build 1 `20fbe4c`: `133,698,243` bytes (`Electron 44.9.1`), delta **`+390,821` bytes** (`+0.37 MiB`).
- `pack-app.mjs`: `107,782 ms` (`e713`) → `101,294 ms` (Build 1) y `84,020 ms` (Build 2).
- `verify-app-artifact.mjs`: `15,188 ms` (`e713`) → `10,637 ms` (Build 1) y `9,714 ms` (Build 2).
- `resources/npm-dist.zip`: idéntico byte a byte (`fef16d4e55a97a22965ab51dd6dc2b670274a4d303d48e6b1da1d0f7a29803ef`).

## Límites explícitos

- La diferencia de `5` bytes entre ambos `.exe` corresponde al no-determinismo de contenedor/timestamps PE de NSIS, reportado explícitamente conforme a `#218 design.md`, mientras el árbol empaquetado completo `win-unpacked/` es `100%` idéntico byte a byte.
- Ningún instalador fue firmado (`NotSigned`), instalado en el host del mantenedor ni publicado. El recibo de reproducibilidad de `npm` ya existente se conserva aparte y no se «re-gana» por estos builds.
- Estos `2/2` builds no acreditan instalación en Windows, recorridos nativos ni aprobación humana (`#146`/`#147`).

## Artefactos persistentes

Prefijo: `artifacts/wave3-current/builds-and-vm-20fbe4c/`.

| Archivo | Bytes | SHA256 |
| --- | ---: | --- |
| `approval.json` | 486 | `50299de442d29d53074c05fa8542c4d552693ec7f39b61b086a2d26b3896258f` |
| `frozen-builds.json` | 1847 | `0b7960a7b24f65ce8c3b92d6d4c478ab7ebb6b470b4a2b877454fb7a48360a76` |
| `build1-pack.json` | 5445 | `57670a0b7c488d0ae47629f6a6bea3a7d97963239195d596e3caa7e98feefc2f` |
| `build1-verify.json` | 1550 | `b8c12b9a04c735f5d5984ecfe765f257400bd5fb9be3bb326a279265edbdf5fc` |
| `build1-unpacked-inventory.json` | 517801 | `7165d5534405af5506d9bc8408f07dae0e5ecbedfc3e151994a10a1c7c7f08e4` |
| `build2-pack.json` | 5444 | `c99f0f221392502422d058f0d28d974d20e4941d044b37e23ecb47cafecda92d` |
| `build2-verify.json` | 1549 | `0260e09e8a44c03d102b4d4d25a9f31c84124ba5814863e870447398e484496a` |
| `build2-unpacked-inventory.json` | 517801 | `32c83a858276901a71f5a37cc6f68808f5945e4bcc4e9e84f8694ff831fd4f50` |
| `builds-comparison.json` | 8858 | `1524a8c08f79213c2dede510d4d77453c8c61de9b9a07f2e5a651917a0decee6` |
