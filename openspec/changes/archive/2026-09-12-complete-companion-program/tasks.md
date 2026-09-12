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
- [x] 2.3 Run five native profile journeys and persistence with original hashes preserved. **Five profiles,
      zero findings**, in the installed window, with the PDF and Word document the profiles promise restored
      to the fixtures and both cited by the product. Closing and reopening is driven: three profiles keep
      their citation and two refuse it with a stated reason, which is correct behaviour and is recorded as
      such after reading the screen rather than concluding from absence. Engineering reached
      reviewEngineering, prepareTools and applyEnvironment; the rest stays unverified with its cause, a
      limit of the harness (`evidence/native-journeys.json`, `evidence/native-acceptance.md`).
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
- [x] 3.3 Build and verify clean-commit EXE and publish Companion release and landing. Built from the merge
      commit `4b863af`, verified PASS, and published as `companion-v0.1.0` with its checksum and manifest.
      The landing deployed to GitHub Pages by its own workflow (`evidence/public-delivery.md`).
- [x] 3.4 Verify public download hashes and live landing behavior. The released asset was downloaded from
      the network and re-hashed: `7ee11c66…`, matching `SHA256SUMS`, the manifest and the byte count, with
      the observed signature `NotSigned` matching what the manifest declares. The live page answers 200 at
      13 728 bytes, byte-identical to the deployed `site/index.html`. Publishing made the page's "no release
      yet" sentence false within the hour; it now names the release and its unsigned status.

## 4. Closeout
- [x] 4.1 Run appropriate repository/app/browser/audit/OpenSpec checks after changes. `npm test` 78/78,
      `npm run check` 304/304, five browser journeys, `openspec validate --all --strict` 19/19, docs,
      neutrality and audit PASS, and `debt check` PASS at 4/5.
- [x] 4.2 Complete independent adversarial review, resolve Major/Blocker and assess real debt. Review done:
      FAIL with 2 Blockers and 6 Majors. Both Blockers and four Majors resolved; the account name is out of
      the versioned screenshot and anchored at capture, the corpus carries the formats it promises again,
      locators resolve by kind, and the benchmark regressions now test the property — both mutations that
      defeated the old ones fail. Debt captured honestly: classifying the reopen question as
      `decision-required` paused the plan at 5/5, the investigation it forced showed the product was right,
      and a remediation assessment refuted it with evidence (`evidence/debt-remediation.json`). Plan back to
      4/5. Open: the model experiment was measured on a build older than the delivered artifact, declared
      rather than re-measured.
- [x] 4.3 Pass archive readiness, archive with official CLI and integrate DCO PR through protection. Two
      protected pull requests: the work itself, then this archive, because publication had to follow the
      merge for the released manifest to name a reachable commit.
- [x] 4.4 Close #94 and #66 only with evidence for all acceptance criteria, and only for the criteria the
      evidence actually carries. What it does not carry is named in the issues rather than implied: the
      installer's own wizard pages and the folder picker need a person, and the native window does not
      exercise activation, engineering apply or the code map.
