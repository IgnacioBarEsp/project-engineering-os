# Verification of issue #89

Automated and agent-operated evidence; no participant study or human review is claimed. Implementation,
review, protected integration and release are authorized by the maintainer's explicit program #66
delegation. The initial approved design and DoR precede implementation; the compatible 0.5.0 identity was
added to the issue and passed DoR before its preparation. Distribution remains pending until protected merge.

## Local evidence

- `npm run check`: PASS, 304 tests; package identity/content, neutrality, documentation, workflow and debt
  checks also pass. Windows, Node 24.18.0. No new dependency; existing core and generated resolver are MIT.
- `node .../openspec.js validate support-isolated-local-toolchain --strict --no-interactive`: PASS using
  the local exact OpenSpec 1.6.0. `validate-release --tag v0.5.0`: PASS preflight, not publication proof.
- The packed isolated fixture installs the candidate and official OpenSpec, generates all five harnesses,
  adapts OPSX, passes OPSX and doctor, and checks read-only snapshots. Product manifest, lock and existing
  dependency hashes stay unchanged. See `windows-isolated-fixture.json`.
- Unit/integration evidence exercises absent and selected toolchains, exact wrapper execution, declared /
  locked / installed identity mismatches, missing actual entries despite a `.bin` shim, malformed and
  oversized metadata, config schema/runtime agreement, reserved/traversal/linked paths and project-root
  aliases. Returning between prepared locations preserves both installations and all consumer bytes.
- Consumer seed, journal, rollback and idempotence tests remain in the full suite. Changing selection
  requires explicit sync to record configuration identity; the isolated fixture verifies this sync has no
  file create/update/delete/conflict operations. The guide describes selection, verification and recovery.

## Findings corrected during verification

- The first fixture attempted to copy a consumer `.npmrc` that the blueprint does not generate. Removed
  that assumption; installs retain explicit `--ignore-scripts` and reviewed npm 11.19.1.
- The first full suite overlapped documentation edits and its export snapshot detected a changed source
  tree (301/302). Repeating against a stable tree passed; no assertion was weakened.
- The isolated fixture initially omitted explicit sync after changing configuration. Doctor correctly
  reported pending state. The reviewed sync now records that change while retaining product files.
- Independent review found doctor re-reading rejected oversized config and reading the classification
  manifest without the new bound. Both use the bounded shared resolver now. Schema/runtime reserved-path
  casing and Unicode separator behavior agree; wrapper failures include a recovery action.

## Remaining validation at this checkpoint

The traditional packed fixture also passed (windows-default-fixture.json). The independent final verdict
is PASS: 30 focused tests and five additional repros, with all four review findings resolved. Protected
multi-platform CI, captured debt and official archive remain pending before integration. The installer and native app journeys belong
to #87, #80 and #81 and are not declared complete by these core checks.

## Limits and recovery

Checks verify declared package identity and expected local entry paths, not every installed byte or a
filesystem lock against another process. No automatic dependency installation, movement, global fallback
or consumer script execution is added. Consumer configuration and toolchain folders remain owned by the
consumer. Restore a previously verified selection and explicitly sync; rollback only hash-verified
constructor writes. Published versions and tags are immutable.
