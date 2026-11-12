# Baseline — main9751c301976fe27e9bbad33e69f39372b69f901e

Observed2026-11-11 before candidate installation or lock edits. Owner IgnacioBarEsp. Metadata and raw source receipt: see [evidence index](evidence/manifest.json).

| Surface | Baseline | SHA-256 |
| --- | --- | --- |
| Root lock | zod4.5.4, OpenSpec1.6.0 | a998d349598124aa401f744750be7edd14ab6eb15c554096608755059bd641dc |
| Blueprint lock | zod4.4.3, OpenSpec1.6.0 | 7be3078914136e8fb408f3eac8b50a4ede2dfaad6562a8d938e2c73469143a7c |
| Root manifest | engine ^22.22.0 or ^24.18.0 | 485f505414eb2470d45c84b6cbd1dd80094d7cfcd7832682467f954c1c89d911 |
| Blueprint manifest | pin remains local OpenSpec1.6.0 | 4f69348302e5c6867e27749ce6662d360fd014515b4b0cb0da28eaace2c592f0 |
| Audit policy | high/critical, no exceptions | c0742a34e3acc74d61aa115ec5f8eb71bee06907bd80108613372b1b37510444 |
| .npmrc | original resolution controls | d32d96bc9b3c2d34791f7a4583d11665e79362a26665d728113318da60ab7db3 |
| CI workflow | existing protected matrix | d48d0d96c257c2f533d2b34efb5d078f59b8bb8e32dcace4f38de5f5f1663c5a |

Fresh earlier audit of these unchanged locks: root exit1,1high/1moderate; root-runtime exit0,0; blueprint exit1,1high. The blocking advisory is zod GHSA-mrhx-c7xc-m3w5, not withdrawn braces. That report was collected from the documentary branch but the source/locks match this integrated base.

The official4.6.6 metadata is not an installed artifact. No payload, LICENSE, regression, resource, runtime or whole-CI PASS is claimed. The fixed OpenSpec binary reused for proposal generation is from an existing owned checkout, SHA-256 ca136f0e9fd4951dcf93d8ed729ebc97b2d97d3980cd9dc9d42fc80e32e797c6; it does not validate the updated dependency graph.

#204 own recipe remains rejected,4/4 exhausted; official11.21.1 remains blocked by undici,11.21.2 still awaits release-age eligibility. Existing UI/human approvals and PR stack retain their scope. No ola4.
