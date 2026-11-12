# Revalidation after official npm integration — #152

Old head1256381f7efa9a7c3381e565a3c18c4d3635baed and its failed CI36965605481 remain historical.
#204/#214 integrated through protectedPR#216, mainba31e06f157eb64150a54e2488257d8de7e06e1c,
with current requiredCI43315582343 SUCCESS and actual installer/VM evidence in their own archives.

This existing#152branch received that main by normal merge, no rebase/reset/force:
ce4861c0909d297ce3648e5eb9dfb5402d81c92f. No conflict or new production patch was needed.
The original checked vendoring removal, hook/notice guards, platform/map/peer controls, contributor
guidance, export allowlist and clean assessment are byte-identical to1256381. Their independent
[review](adversarial-review.md), [maintainer decision](maintainer-decisions.md) and original official
archive retain their own dates/scope; this is compatibility revalidation, not a new independent review.

The new main's npm source, compiled identities/runtime/packager/verifier and zod root/blueprint locks
are unchanged by this merge. The preexisting#152metadata normalization still adds only the documented
Apache-2.0 label for qrcode-terminal in app lock/notices; official payload bytes/source/SRI remain
unchanged. No new dependency, npm patch, audit exception, Node/OpenSpec pin, CI or policy adjustment.
The empty-hook rule and absence of all57vendored paths were checked without executing any hook.

Focused current checks on frozen ce4861c with actual Node24.18.0:
- supply-chain/neutrality/zod regressions **25/25**, no skip/cancel/failure;
- fixed local OpenSpec1.6.0 **21/21** canonical specs;
- package contract, docs, neutrality, debt and diff checks PASS;
- tree stayed clean through checks. Existing identical root-lock dependencies were copied into
  ignored node_modules; no install or scripts ran to prepare this local check.
- Registry50items/37open and existing assessments remain unchanged;76assessment files include the
  original#152assessment, plus75from main. No recapture or duplicate debt item.

Managed evidence: targetPath C:/Users/RitualDesktop/.codex/worktrees/152-post-npm-main/project-engineering-os,
storage persistent, read through read_codex_security_artifact:
| Path | SHA256 |
| --- | --- |
| artifacts/152-revalidation/run.mjs | ea23023207aa4c96a343a85b1b9da7695dfe61f8d0ea917701f9a55ce4e9dfb8 |
| artifacts/152-revalidation/result.json | af7100cdd30f6ca6115e2206924cea136aacc314e3c451736452098adc58ab82 |
| artifacts/152-revalidation/merge-boundary-check.json | b9edb7cce6146a9179d360eaa3fed56f12b7d249a86eb8c772ee4514823aa822 |

Current required CI at the final PR head remains a separate gate; prior greens do not approve it.
Only after that result and unchanged protection canPR#192 integrate/close#152. No new archive or
human review is invented, old failed results are retained, and ola3/ola4 status is unchanged.
