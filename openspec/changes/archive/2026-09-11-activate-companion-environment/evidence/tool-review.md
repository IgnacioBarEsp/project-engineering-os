# Primary artifact review for #87

Review date: 2026-09-10. These are design inputs and bounded local probes, not app installation or benchmarks.

| Tool | Pinned artifact | Review evidence |
| --- | --- | --- |
| Node | 24.20.0 Windows x64 ZIP | Official download 37,539,751 bytes; SHA256 `6cac9ffbca8f6a47091e4b5c772e0606049c3871cb67d900c0cedde630e545ba`; extracted Node reports v24.20.0, Authenticode Valid / OpenJS Foundation. Includes full LICENSE and bundled notices. Its npm is 11.19.0, so the app must separately use reviewed npm 11.19.1. |
| CodeGraph | 1.6.0 Windows x64 ZIP | Official GitHub release 52,593,717 bytes; SHA256 `cd76c3c3391f2d40abef12b142151950b6d77abc2d8429e648f89eaa90f5b68a`, matched release API digest and local bytes. Package metadata identifies exact 1.6.0. 995 entries / 261,469,875 expanded bytes; path/link/duplicate checks before extraction. |
| CodeGraph license | MIT at v1.6.0 | Tagged LICENSE source blob `31c84c9c80d953a0571b69af15cf815f22c5f2b6`, copyright 2026 Colby Mchenry. Platform ZIP does not include this root notice; distribution must retain it and dependency/runtime notices. |
| npm | 11.19.1 private app dependency | Existing reviewed client metadata confirms Artistic-2.0, official npm/cli source and supported Node engines. Bundle the complete pinned distribution/notices; disable lifecycle scripts during installation. |
| MinGit | 2.55.0.windows.5 Windows x64 ZIP | Official release API digest and local bytes agree: 38,989,688 bytes, SHA256 `56d7b226b7693196cfc71fef26568f536c4a021ab6c37ff2db4287bed908e96e`. 368 entries / 94,375,970 expanded bytes. Includes LICENSE.txt and dependency license files; entry cmd/git.exe. Runtime/source-notice checks continue before activation. |

Sources: [Node release](https://nodejs.org/dist/v24.20.0/),
[CodeGraph release](https://github.com/colbymchenry/codegraph/releases/tag/v1.6.0),
[tagged MIT license](https://github.com/colbymchenry/codegraph/blob/v1.6.0/LICENSE).

The verified CodeGraph platform Node and SDK indexed a temporary JS/C# fixture: two files, five nodes,
three edges, no errors; actual symbol searches returned the JS function and C# class/method with their
relative paths. SDK-reported index duration was 271 ms for this tiny corpus; it is not a product benchmark.
Only `.codegraph`, `budget.js` and `Game.cs` were present in that fixture afterward. No CLI installer was
invoked. Environment set `DO_NOT_TRACK=1`, `CODEGRAPH_TELEMETRY=0`, `CODEGRAPH_NO_UPDATE_CHECK=1`,
`CODEGRAPH_NO_DOWNLOAD=1`, `NODE_DISABLE_COMPILE_CACHE=1`; Windows launch used `--liftoff-only`.
This probe is not a host-wide network or filesystem audit.

Pinned source inspection found `init --yes` may install Git hooks through `offerWatchFallback` when
watching is disabled. Use the controlled SDK bridge rather than assuming this CLI option only indexes.
`CODEGRAPH_DIR` supports one plain directory name, not a nested output path. The approved design instead
indexes reviewed owned copies in a separate staging corpus and maps results to originals. Do not reuse
the npm shim's automatic download fallback.

Installed Codex help confirms `codex app [PATH]` as a workspace-opening interface. Only help was executed;
no new chat or workspace launch is claimed by this probe. Local tool detection and actual supported launch
remain implementation and QA work. External app versions, MinGit distribution/source obligations, portable
npm installation and full dependency notices must pass the catalog review before activation.
