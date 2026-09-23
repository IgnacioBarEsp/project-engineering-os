## 1. Preflight and baseline

> Rebase de release: 0.3.2 ya se publicó el 19 de septiembre. Tras corregir los fallos del arnés de los
> intentos 0.3.3 y 0.3.4, el candidato 0.3.5 se publicó. No se reutilizó ni reemplazó ningún tag o asset
> anterior. La [evidencia de release](evidence/release-0.3.5.md) cubre el ciclo silencioso; la
> [observación asistida](evidence/assisted-sandbox.md) encontró páginas en inglés y exige corregir en 0.3.6.

- [x] 1.1 In a GitHub Actions runner or declared disposable Windows VM, open the unmodified installer before
  editing its language setting; record version, Windows environment, standard-page texts, Finish page and
  contextual-dialog language as baseline evidence.
- [x] 1.2 Revalidate issue #168, this proposal and the clean worktree immediately before apply; record any
  change in the issue contract, installer pin or release harness before modifying source.
- [x] 1.3 Rebase the candidate identity to 0.3.3 after confirming that `companion-v0.3.2` is published and
  immutable; add matching release notes and retain 0.1.0 as the update source.
- [x] 1.4 Tras el intento protegido fallido de 0.3.3, resolver el escritorio de la cuenta del runner antes
  de aislar `USERPROFILE` y rebasar el candidato a 0.3.4; los tags existentes permanecen inmutables.

## 2. Assisted installer choices

- [x] 2.1 Configure the package so its default desktop-link creation is owned by the local NSIS include;
  add an initially selected custom desktop-choice page and preserve its value through install, repair and
  update. Verify with focused packaging assertions and a built installer.
- [x] 2.2 Create or remove only the named product desktop link according to the chosen state and remove it
  during uninstall without touching other desktop entries. Verify the checked and unchecked branches, then
  install/update/uninstall in disposable Windows.
- [x] 2.3 Restore the standard initially selected Finish-page launch choice without auto-launching under
  `/S`. Verify configuration/source assertions and both interactive checked/unchecked outcomes.

## 3. Language, harness and documentation

- [x] 3.1 Declare Spanish NSIS language and retain Spanish custom dialogs, license and guide. Build the
  candidate and compare every standard page and contextual dialog with the recorded baseline in Windows.
- [x] 3.2 Extend `qa/packaging.mjs` to protect the choice/default, Spanish locale, Finish behavior and
  shortcut ownership contract; run `npm test --prefix apps/companion`.
- [x] 3.3 Extend `verify-release-installation.mjs` to assert the default desktop link after silent
  installation/update and its removal after uninstall, while recording the mode's non-human limit. Run it
  only in GitHub Actions or a declared disposable Windows VM.
- [x] 3.4 Update `docs/companion/INSTALLER.md` so it distinguishes the two assisted choices from silent
  defaults and contains no unsupported claim; validate links and repository checks.
- [x] 3.5 Require maintainer attestation and committed Windows Sandbox evidence for the checked and
  unchecked Desktop and Finish choices before the protected release workflow can publish; keep the
  automated silent-install scope and its non-human limit explicit.

## 4. Evidence and closeout

- [x] 4.1 Build and inspect the Windows artifact; capture the checked and unchecked desktop branches, the
  checked and unchecked Finish branches, Spanish pages, upgrade/reinstall and uninstall results with
  artifact identity and environment.
- [ ] 4.2 Run the relevant Companion tests, `npm run check`, a rollback rehearsal and an adversarial review;
  resolve Blockers and Majors, record debt, refresh readiness and archive through the protected-PR flow.
