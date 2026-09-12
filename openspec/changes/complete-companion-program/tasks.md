## 1. Baseline and readiness
- [x] 1.1 Inspect real repository, installed application and Claude handoff; preserve prior evidence.
- [x] 1.2 Create enriched issue #94 and pass Definition of Ready (13 PASS).
- [x] 1.3 Record scope under the maintainer's existing delegation and obtain independent initial gap review.

## 2. Native acceptance
- [x] 2.0 Record the maintainer's interview answers; admit the AI they named that the app did not offer.
- [x] 2.1 Fix absent-app discovery and add a negative regression.
- [~] 2.2 Complete wizard pages and verify installer provenance. Application wizard driven through the
      installed window; the folder picker is a measured human boundary (`evidence/native-acceptance.md`).
      The installer's own pages remain unexercised.
- [x] 2.3 Run five native profile journeys and persistence with original hashes preserved. Five profiles
      through the installed window, 0 findings, citations resolved against the files on disk
      (`evidence/native-journeys.json`, `npm run evidence:native`).
- [ ] 2.4 Observe trusted local launches with the synthetic folder.

## 3. Evaluation and delivery
- [x] 3.1 Freeze and execute paired model experiment; keep prompts, responses, usage and failures.
      Six real v2 trials: tied 15/15 grounded answers and 15/15 abstentions per condition; prepared slower
      (9.597 s median vs 8.427 s). See `evidence/model-experiment.md` and the six raw run records.
      Outside this measurement: new questions/models, model snapshot identity, controlled provider cache,
      billing savings and generalised quality; one abstention question has a numeric-format limitation.
- [ ] 3.2 Review current visual references and correct public state documentation.
- [ ] 3.3 Build and verify clean-commit EXE and publish Companion release and landing.
- [ ] 3.4 Verify public download hashes and live landing behavior.

## 4. Closeout
- [ ] 4.1 Run appropriate repository/app/browser/audit/OpenSpec checks after changes.
- [ ] 4.2 Complete independent adversarial review, resolve Major/Blocker and assess real debt.
- [ ] 4.3 Pass archive readiness, archive with official CLI and integrate DCO PR through protection.
- [ ] 4.4 Close #94 and #66 only with evidence for all acceptance criteria.
