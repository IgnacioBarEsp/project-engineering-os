# Third-party notices

Project Engineering OS Companion 0.1.0 is MIT; see LICENSE. It also ships two bodies of
third-party software: the Electron runtime that executes it, and the npm packages it depends on.

## Electron runtime

Most of the installed bytes are the Electron runtime, which embeds Chromium, Node.js, V8 and their
own dependencies. Electron is MIT. Its complete notice ships beside the executable as
`LICENSE.electron.txt`, and the Chromium notices as `LICENSES.chromium.html`; both are installed
next to the application and are verified to be present before publication.

## Portable tools downloaded later

Node, MinGit and the optional code symbol extractor are not part of this artifact. Their identities,
licenses and notices are reviewed and shown before any download, and are listed in
`runtime/notices/README.md`.

## Packages

These are the packages installed inside the artifact, with the license each one declares. Their
complete license texts ship inside each package directory under `resources/app/node_modules`.
Optional dependencies for other platforms are excluded because they are not installed here.

- ISC: 73 packages
- MIT: 48 packages
- BlueOak-1.0.0: 11 packages
- Apache-2.0: 9 packages
- BSD-2-Clause: 5 packages
- Artistic-2.0: 1 package
- BSD-3-Clause: 1 package
- CC-BY-3.0: 1 package
- CC0-1.0: 1 package
- declared in the package: 1 package

| Package | Version | License |
| --- | --- | --- |
| @gar/promise-retry | 1.0.3 | MIT |
| @isaacs/fs-minipass | 4.0.1 | ISC |
| @isaacs/string-locale-compare | 1.1.0 | ISC |
| @napi-rs/canvas | 1.0.8 | MIT |
| @napi-rs/canvas-win32-x64-msvc | 1.0.8 | MIT |
| @npmcli/agent | 4.0.2 | ISC |
| @npmcli/arborist | 9.9.1 | ISC |
| @npmcli/config | 10.12.0 | ISC |
| @npmcli/fs | 5.0.0 | ISC |
| @npmcli/git | 7.0.2 | ISC |
| @npmcli/installed-package-contents | 4.0.0 | ISC |
| @npmcli/map-workspaces | 5.0.3 | ISC |
| @npmcli/metavuln-calculator | 9.0.3 | ISC |
| @npmcli/name-from-folder | 4.0.0 | ISC |
| @npmcli/node-gyp | 5.0.0 | ISC |
| @npmcli/package-json | 7.0.5 | ISC |
| @npmcli/promise-spawn | 9.0.1 | ISC |
| @npmcli/query | 5.0.0 | ISC |
| @npmcli/redact | 4.0.0 | ISC |
| @npmcli/run-script | 10.0.4 | ISC |
| @sigstore/bundle | 4.0.0 | Apache-2.0 |
| @sigstore/core | 3.2.1 | Apache-2.0 |
| @sigstore/protobuf-specs | 0.5.1 | Apache-2.0 |
| @sigstore/sign | 4.1.1 | Apache-2.0 |
| @sigstore/tuf | 4.0.2 | Apache-2.0 |
| @sigstore/verify | 3.1.1 | Apache-2.0 |
| @tufjs/canonical-json | 2.0.0 | MIT |
| @tufjs/models | 4.1.0 | MIT |
| abbrev | 4.0.0 | ISC |
| agent-base | 7.1.4 | MIT |
| aproba | 2.1.0 | ISC |
| archy | 1.0.0 | MIT |
| balanced-match | 4.0.4 | MIT |
| bin-links | 6.0.2 | ISC |
| binary-extensions | 3.1.0 | MIT |
| brace-expansion | 5.0.9 | MIT |
| cacache | 20.0.4 | ISC |
| chalk | 5.6.2 | MIT |
| chownr | 3.0.0 | BlueOak-1.0.0 |
| ci-info | 4.4.0 | MIT |
| cidr-regex | 5.0.5 | BSD-2-Clause |
| cmd-shim | 8.0.0 | ISC |
| common-ancestor-path | 2.0.0 | BlueOak-1.0.0 |
| create-project-engineering-os | 0.5.0 | MIT |
| cssesc | 3.0.0 | MIT |
| debug | 4.4.3 | MIT |
| diff | 8.0.4 | BSD-3-Clause |
| env-paths | 2.2.1 | MIT |
| exponential-backoff | 3.1.3 | Apache-2.0 |
| fastest-levenshtein | 1.0.16 | MIT |
| fdir | 6.5.0 | MIT |
| fflate | 0.8.3 | MIT |
| fs-minipass | 3.0.3 | ISC |
| glob | 13.0.6 | BlueOak-1.0.0 |
| graceful-fs | 4.2.11 | ISC |
| hosted-git-info | 9.0.3 | ISC |
| http-cache-semantics | 4.2.0 | BSD-2-Clause |
| http-proxy-agent | 7.0.2 | MIT |
| https-proxy-agent | 7.0.6 | MIT |
| iconv-lite | 0.7.2 | MIT |
| ignore-walk | 8.0.0 | ISC |
| ini | 6.0.0 | ISC |
| init-package-json | 8.2.5 | ISC |
| ip-address | 10.5.0 | MIT |
| is-cidr | 6.0.4 | BSD-2-Clause |
| isexe | 4.0.0 | BlueOak-1.0.0 |
| json-parse-even-better-errors | 5.0.0 | MIT |
| json-stringify-nice | 1.1.4 | ISC |
| jsonparse | 1.3.1 | MIT |
| just-diff | 6.0.2 | MIT |
| just-diff-apply | 5.5.0 | MIT |
| libnpmaccess | 10.0.3 | ISC |
| libnpmdiff | 8.1.12 | ISC |
| libnpmexec | 10.3.2 | ISC |
| libnpmfund | 7.0.26 | ISC |
| libnpmorg | 8.0.1 | ISC |
| libnpmpack | 9.1.13 | ISC |
| libnpmpublish | 11.2.0 | ISC |
| libnpmsearch | 9.0.1 | ISC |
| libnpmteam | 8.0.2 | ISC |
| libnpmversion | 8.0.4 | ISC |
| lru-cache | 11.5.1 | BlueOak-1.0.0 |
| make-fetch-happen | 15.0.6 | ISC |
| minimatch | 10.2.5 | BlueOak-1.0.0 |
| minipass | 3.3.6 | ISC |
| minipass | 7.1.3 | BlueOak-1.0.0 |
| minipass-collect | 2.0.1 | ISC |
| minipass-fetch | 5.0.2 | MIT |
| minipass-flush | 1.0.6 | BlueOak-1.0.0 |
| minipass-pipeline | 1.2.4 | ISC |
| minipass-sized | 2.0.0 | ISC |
| minizlib | 3.1.0 | MIT |
| ms | 2.1.3 | MIT |
| mute-stream | 3.0.0 | ISC |
| negotiator | 1.0.0 | MIT |
| node-gyp | 12.4.0 | MIT |
| nopt | 9.0.0 | ISC |
| npm | 11.19.1 | Artistic-2.0 |
| npm-audit-report | 7.0.0 | ISC |
| npm-bundled | 5.0.0 | ISC |
| npm-install-checks | 8.0.0 | BSD-2-Clause |
| npm-normalize-package-bin | 5.0.0 | ISC |
| npm-package-arg | 13.0.2 | ISC |
| npm-packlist | 10.0.4 | ISC |
| npm-pick-manifest | 11.0.3 | ISC |
| npm-profile | 12.0.2 | ISC |
| npm-registry-fetch | 19.1.1 | ISC |
| npm-user-validate | 4.0.0 | BSD-2-Clause |
| p-map | 7.0.4 | MIT |
| pacote | 21.5.1 | ISC |
| parse-conflict-json | 5.0.1 | ISC |
| path-scurry | 2.0.2 | BlueOak-1.0.0 |
| pdfjs-dist | 6.3.289 | Apache-2.0 |
| picomatch | 4.0.4 | MIT |
| postcss-selector-parser | 7.1.4 | MIT |
| proc-log | 6.1.0 | ISC |
| proggy | 4.0.0 | ISC |
| promise-all-reject-late | 1.0.1 | ISC |
| promise-call-limit | 3.0.2 | ISC |
| promzard | 3.0.1 | ISC |
| qrcode-terminal | 0.12.0 | declared in the package |
| read | 5.0.1 | ISC |
| read-cmd-shim | 6.0.0 | ISC |
| safer-buffer | 2.1.2 | MIT |
| saxes | 6.0.0 | ISC |
| semver | 7.8.5 | ISC |
| signal-exit | 4.1.0 | ISC |
| sigstore | 4.1.1 | Apache-2.0 |
| smart-buffer | 4.2.0 | MIT |
| socks | 2.8.9 | MIT |
| socks-proxy-agent | 8.0.5 | MIT |
| spdx-exceptions | 2.5.0 | CC-BY-3.0 |
| spdx-expression-parse | 4.0.0 | MIT |
| spdx-license-ids | 3.0.23 | CC0-1.0 |
| ssri | 13.0.1 | ISC |
| supports-color | 10.2.2 | MIT |
| tar | 7.5.22 | BlueOak-1.0.0 |
| text-table | 0.2.0 | MIT |
| tiny-relative-date | 2.0.2 | MIT |
| tinyglobby | 0.2.17 | MIT |
| treeverse | 3.0.0 | ISC |
| tuf-js | 4.1.0 | MIT |
| undici | 6.28.0 | MIT |
| util-deprecate | 1.0.2 | MIT |
| validate-npm-package-name | 7.0.2 | ISC |
| walk-up-path | 4.0.0 | ISC |
| which | 6.0.1 | ISC |
| write-file-atomic | 7.0.1 | ISC |
| xmlchars | 2.2.0 | MIT |
| yallist | 4.0.0 | ISC |
| yallist | 5.0.0 | BlueOak-1.0.0 |
