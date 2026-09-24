# Verification evidence

Date: 2026-09-24

## Reproduction and correction

The published npm provenance was valid but `verify-published.mjs` compared its publisher-workflow commit with the source commit in the release manifest. For a `workflow_dispatch` from `main`, the signed provenance correctly identifies the release workflow commit; the protected tag's source commit remains a separate identity.

The verifier now checks the exact canonical tarball's npm signature and SLSA subject digest; requires the attested workflow repository, path and `main` ref; resolves the signed invocation URL to the exact GitHub Actions run and attempt; checks the run commit against the signed workflow dependency; and requires successful source validation, canonical asset comparison, publication and provenance steps in execution order. Independently, the manifest commit is still compared with the immutable remote tag and the published bytes with the canonical GitHub Release tarball.

## Published `v1.0.0`

- GitHub Release: https://github.com/IgnacioBarEsp/project-engineering-os/releases/tag/v1.0.0
- Tag source commit: `71b86233ee5fbd6eef0c1a838c53b504db217d1f`.
- Canonical tarball: 506213 bytes; SHA-256 `a13218806ed340d1cc7618e26d3105e7aa42a45ff615c34eecb0abbd7e16bbdc`.
- npm version: `create-project-engineering-os@1.0.0`; SHA-512 integrity `sha512-Xa1OQPHKbfWH2e79G43tbFp6r8xUo6425Guu1h9Wv5mm0qdXjDPgLm+ggfGVSywKVxEs5ouy5SUnEpNlhHWAMQ==`.
- npm signature audit: `invalid=[]`, `missing=[]`; signed SLSA subject digest equals the canonical tarball.
- Signed publisher workflow commit: `7629bd9fdc52ce1471935f5b62d48040ac5dc457`, intentionally distinct from the tag source commit above.
- Provenance invocation: run `35960439785`, attempt `1`; GitHub API reports successful `workflow_dispatch` from `main` using `.github/workflows/release.yml`. Build, GitHub Release, and npm jobs passed, including tag/source validation, artifact comparison, publish, and registry-provenance steps in order.
- Final read-only command `node scripts/verify-published.mjs --tag v1.0.0`: `PASS`; result identifies the tag commit, byte count, SHA-256, npm integrity, signature, and provenance.

## Automated and adversarial checks

- `node --test test/registry-release.test.mjs`: 12 passed, 0 failed.
- `npm run check`: 360 passed, 0 failed; package, neutrality, documentation, workflow and debt checks passed. The debt report remains the repository's existing tracked state (4/5 plan units, 3 flows with open debt); this change introduces no new debt finding.
- `npm exec -- openspec validate --all --strict --no-interactive`: 21 passed, 0 failed.
- Official archival: `npm exec -- openspec archive verify-published-workflow-provenance --yes --json` returned `specsUpdated: true` and added one requirement; post-archive `npm exec -- openspec validate --all --strict --no-interactive` passed 20/20.
- `git diff --check`: passed.
- `node scripts/verify-published.mjs --tag v1.0.0`: PASS using the reviewed npm `11.19.1` client. On this host, the invocation explicitly set `npm_execpath` from the ephemeral `npm@11.19.1` package because the default system npm is `11.16.0`; the initial unpinned invocation correctly failed before network access.
- `node scripts/verify-fixture.mjs --skip-install --keep --json`: PASS on an empty Git consumer: first and second bootstrap, idempotence, sync, harnesses, capability contract, neutrality and findability all passed. After official OpenSpec 1.6.0 setup and `opsx-adapt`, archive readiness with `--run-local` passed against that disposable fixture: 20 PASS, 0 FAIL, 0 EXCEPTION, `mutationPerformed: false`; its fixed doctor, OpenSpec strict, OPSX and sync runners all passed.
- Debt capture via the project-owned CLI: `clean`, no registry-item changes. `debt check`: PASS; the four pre-existing open issues and upstream plan usage remain unchanged. The exact captured assessment is duplicated at `evidence/debt-assessment.json` and `.project-os/debt/assessments/verify-published-workflow-provenance.json`.
- Adversarial cases cover invalid/missing npm signatures, wrong artifact digest, wrong workflow/repository/ref, malformed or alternate-host invocation, wrong run SHA/attempt/event/branch, missing or failed release steps, out-of-order publication checks, and tag-manifest drift. All fail closed; no tag, release, registry, or published bytes are modified by verification.
