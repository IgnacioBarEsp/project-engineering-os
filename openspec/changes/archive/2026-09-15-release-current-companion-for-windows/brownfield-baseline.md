# Baseline acotado — 2026-09-15

- Main: `5039992d9058a3d62bca0c9bd7610b74cc573d8f`; app capability source: `0c632a3`.
- Published app: `companion-v0.1.0`, installer `ProjectEngineeringOS-Setup-0.1.0-x64.exe`, SHA-256
  `7ee11c66c1a0f8b2e3f0faca00da333f094814eb161e645adbcd823463a4b51a`; unsigned Windows x64 artifact.
- App manifest/lock: 0.1.0; core dependency: exact 0.5.0. Root package is public 0.5.0 and is out of
  scope for publishing.
- `pack-app.mjs` refuses dirty source by default and emits an installer, `artifact-manifest.json` and
  `SHA256SUMS`; `verify-app-artifact.mjs` checks the actual unpacked artifact and reads signature status
  only on Windows.
- Existing native runner inspects an installed app's resources and already states dialog/foreground
  boundaries. It is not installer evidence by itself.
- Docs #116 accurately call 0.1.0 current and code after it pending installer. They stay correct until
  0.2.0 exists; final reconciliation is deliberately after publication.
