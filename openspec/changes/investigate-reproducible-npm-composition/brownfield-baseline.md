# Baseline de #204, fase de viabilidad

Base limpia main `9751c301976fe27e9bbad33e69f39372b69f901e`, rama `codex/204-npm-composition-feasibility`. Recogido 2026-10-04T03:22:54.8744792Z (UTC); fecha del mantenedor2026-10-03 local. No se tomó un branch UI como base ni se tocó #207.

## Estado observado

- Catálogo/runtime/package Companion fijan npm11.19.1, Node administrado24.20.0; core soporta Node^22.22.0 o^24.18.0.
- Sellado incluye todo npm y nested dependencies; manager verifica treeHash/bytes/identidad. caller toolchain/stack invoca Node/npm fijos con scripts/bin-links/workspaces desactivados y verifica el payload.
- Auditoría root/blueprint incluye dev; root-runtime omite dev; umbral high y exceptions vacías.
- #204/#208 abiertos/Blocked; #149/#150 abiertos y PR#201/#202/#207 abiertos. #207 no es base de esta propuesta ni objetivo de mutación.
- Evidencia anterior: npm11.21/12.2 fallaron el30sept; run37171002125 de9feea659 falla el4oct UTC en Companion y root/blueprint. No se repitieron instalaciones/audits ni se hicieron benchmarks hoy.
- Metadata oficial de npm11.21.0 y su integridad se volvió a consultar sin descargar/instalarlo. http-cache-semantics4.3.0 no demuestra aún corrección max-stale; se investigará sin inferir aceptación.

## Fuentes y límites

[Snapshot con hashes](evidence/proposal-baseline.json), [issue anterior íntegro](evidence/issue-original.md), [enriquecimiento de fase](evidence/issue-enriched.md), [DoR](evidence/readiness-propose.json), [selección humana](evidence/strategy-selection.md).

El CLI OpenSpec1.6.0 se ejecutó desde una instalación local ya existente en el worktree de este mismo proyecto para no reinstalar herramientas. No se usó npx ni versión global; el bin SHA-256 está registrado. La fecha .openspec.yaml la generó el CLI oficial.

- `package.json`: `485f505414eb2470d45c84b6cbd1dd80094d7cfcd7832682467f954c1c89d911`
- `package-lock.json`: `a998d349598124aa401f744750be7edd14ab6eb15c554096608755059bd641dc`
- `apps/companion/package.json`: `d83a917127a3ab0e0e73318e1275f812d62fdf75b9275c95d5ea1ba5d37c04c9`
- `apps/companion/package-lock.json`: `22a733b21c0f69954b38061b8e77282542016bcd2b6da2a48157cfc75efdf785`
- `apps/companion/runtime/catalog.mjs`: `7e337a50c24e672d9f8d7301d6444bb255602c3a00ce63128e6cf43d33feb4d3`
- `apps/companion/runtime/manager.mjs`: `749f4c1a59534fd15e354f346ab56be298995074319826c47384f666d8a18bb4`
- `apps/companion/runtime/process.mjs`: `46a07379ff52362ed86c2e3178193ca211bf692edefbb512af18094ddbcc08ea`
- `apps/companion/runtime/toolchain.mjs`: `54f15a70ac996ad4f8a888a2c17af26924865a5a34443bb59cc7b1f8c813efd6`
- `apps/companion/runtime/stack.mjs`: `878ba7b9b67b2bf0154ae6fda2c8c5487d9d8b55a7e4b6047b8600e4bd02a53b`
- `apps/companion/scripts/seal-npm.mjs`: `967acea8fe1bd40327ccf43521e18a61318714f3721d38e01366972294ae4d5e`
- `apps/companion/scripts/pack-app.mjs`: `b4f55c342021f29f19cbbe4b30eacacc52141b43a01c8df0170c4c8820813f09`
- `config/dependency-audit-policy.json`: `c0742a34e3acc74d61aa115ec5f8eb71bee06907bd80108613372b1b37510444`
- `blueprint/core/package-lock.json`: `7be3078914136e8fb408f3eac8b50a4ede2dfaad6562a8d938e2c73469143a7c`
- `.github/workflows/ci.yml`: `d48d0d96c257c2f533d2b34efb5d078f59b8bb8e32dcace4f38de5f5f1663c5a`

Solo se añade el expediente de propuesta. Catalog/locks/notices/CI/pin/runtime siguen byte-idénticos a main. La creación y validación de documentos no prueba un derivado corregido ni autoriza Apply.
