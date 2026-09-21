## 1. Preflight and baseline

- [ ] 1.1 In a GitHub Actions runner or declared disposable Windows VM, open the unmodified installer before
  editing its language setting; record version, Windows environment, standard-page texts, Finish page and
  contextual-dialog language as baseline evidence.
- [ ] 1.2 Revalidate issue #168, this proposal and the clean worktree immediately before apply; record any
  change in the issue contract, installer pin or release harness before modifying source.

## 2. Assisted installer choices

- [ ] 2.1 Configure the package so its default desktop-link creation is owned by the local NSIS include;
  add an initially selected custom desktop-choice page and preserve its value through install, repair and
  update. Verify with focused packaging assertions and a built installer.
- [ ] 2.2 Create or remove only the named product desktop link according to the chosen state and remove it
  during uninstall without touching other desktop entries. Verify the checked and unchecked branches, then
  install/update/uninstall in disposable Windows.
- [ ] 2.3 Restore the standard initially selected Finish-page launch choice without auto-launching under
  `/S`. Verify configuration/source assertions and both interactive checked/unchecked outcomes.

## 3. Language, harness and documentation

- [ ] 3.1 Declare Spanish NSIS language and retain Spanish custom dialogs, license and guide. Build the
  candidate and compare every standard page and contextual dialog with the recorded baseline in Windows.
- [ ] 3.2 Extend `qa/packaging.mjs` to protect the choice/default, Spanish locale, Finish behavior and
  shortcut ownership contract; run `npm test --prefix apps/companion`.
- [ ] 3.3 Extend `verify-release-installation.mjs` to assert the default desktop link after silent
  installation/update and its removal after uninstall, while recording the mode's non-human limit. Run it
  only in GitHub Actions or a declared disposable Windows VM.
- [ ] 3.4 Update `docs/companion/INSTALLER.md` so it distinguishes the two assisted choices from silent
  defaults and contains no unsupported claim; validate links and repository checks.

## 4. Evidence and closeout

- [ ] 4.1 Build and inspect the Windows artifact; capture the checked and unchecked desktop branches, the
  checked and unchecked Finish branches, Spanish pages, upgrade/reinstall and uninstall results with
  artifact identity and environment.
- [ ] 4.2 Run the relevant Companion tests, `npm run check`, a rollback rehearsal and an adversarial review;
  resolve Blockers and Majors, record debt, refresh readiness and archive through the protected-PR flow.
