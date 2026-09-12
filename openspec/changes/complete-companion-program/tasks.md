## 1. Baseline and readiness
- [x] 1.1 Inspect real repository, installed application and Claude handoff; preserve prior evidence.
- [x] 1.2 Create enriched issue #94 and pass Definition of Ready (13 PASS).
- [x] 1.3 Record scope under the maintainer's existing delegation and obtain independent initial gap review.

## 2. Native acceptance
- [x] 2.0 Record the maintainer's interview answers; admit the AI they named that the app did not offer.
- [x] 2.1 Fix absent-app discovery and add a negative regression.
- [~] 2.2 Complete wizard pages and verify installer provenance. Application wizard driven through the
      installed window; the folder picker is a measured human boundary (`evidence/native-acceptance.md`).
      Installer provenance verified: built from clean commit 9db2689, artifact rehashed and its bundled npm
      matched against the catalog pin (`evidence/artifact-manifest.json`). The installer's own wizard pages
      remain unexercised: it was installed silently, and its prompts need a person for the same reason the
      folder picker does.
- [~] 2.3 Run five native profile journeys and persistence with original hashes preserved. Five profiles in
      the installed window; fixtures restored to include the PDF and Word document the profiles promise, and
      both are cited by the product. Closing and reopening is now driven: three profiles keep their citation,
      **software and Unity do not**, recorded as a finding for a person to look at. Engineering reached
      reviewEngineering, prepareTools and applyEnvironment; activation stopped advancing, so that stage, the
      engineering apply, the code map and the symbol search stay **unverified with their cause** rather than
      claimed (`evidence/native-journeys.json`, `evidence/native-acceptance.md`).
- [x] 2.4 Observe trusted local launches with the synthetic folder. Cursor launched against a folder whose
      name holds a space and an ampersand; all three verified applications refuse a recorded identity that
      no longer matches their bytes (`evidence/local-launches.json`, `npm run evidence:launches`). The
      artifact built from a clean commit was then installed, closing that gap: Antigravity is recognised and
      refused with `APP_UNTRUSTED` because its executable is unsigned. Four recognised, three verified, one
      refused, zero findings. The install preserved the maintainer's projects and history.

## 3. Evaluation and delivery
- [x] 3.1 Freeze and execute paired model experiment; keep prompts, responses, usage and failures.
      Six real v2 trials: tied 15/15 grounded answers and 15/15 abstentions per condition; prepared slower
      (9597 ms median vs 8427 ms). See `evidence/model-experiment.md` and the six raw run records.
      Outside this measurement: new questions/models, model snapshot identity, controlled provider cache,
      billing savings and generalised quality; one abstention question has a numeric-format limitation.
- [x] 3.2 Review current visual references and correct public state documentation. Two live Sites of the
      Day observed, nothing imported (`evidence/visual-review.md`); the landing no longer claims every
      release publishes its checksum when no release exists.
- [~] 3.3 Build and verify clean-commit EXE and publish Companion release and landing. Built from clean
      commit 9db2689 and verified PASS (`evidence/artifact-manifest.json`, `SHA256SUMS`): 133 229 173 bytes,
      sha256 926cfc1e, bundled npm matching its pin, signed:false reported honestly. **Publishing the
      release is not published yet**. The maintainer authorised publishing the release, deploying the landing
      and installing the build; the artifact is built and verified and the landing workflow is in place, and
      publication follows the merge so the released manifest names a commit reachable from `main`.
- [ ] 3.4 Verify public download hashes and live landing behavior.

## 4. Closeout
- [ ] 4.1 Run appropriate repository/app/browser/audit/OpenSpec checks after changes.
- [ ] 4.2 Complete independent adversarial review, resolve Major/Blocker and assess real debt.
- [ ] 4.3 Pass archive readiness, archive with official CLI and integrate DCO PR through protection.
- [ ] 4.4 Close #94 and #66 only with evidence for all acceptance criteria.
