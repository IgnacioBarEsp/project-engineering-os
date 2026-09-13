# Brownfield baseline

Measured on `main` at d815607, the commit that integrated issue 106. Read from the code and from the machine,
not from memory.

## The defect, located line by line

`apps/companion/desktop/service.mjs`:

```js
export const DESTINATIONS = Object.freeze({ web: 'https://chatgpt.com/', 'claude-code': 'https://claude.ai/',
  codex: 'https://chatgpt.com/codex', cursor: 'https://cursor.com/', 'github-copilot': 'https://github.com/copilot',
  opencode: 'https://opencode.ai/', antigravity: 'https://antigravity.google/' });
```

Seven entries: one for the web chat and one per desktop application. In `handoffPreview`:

```js
return {id,prompt,destination:local?.label??DESTINATIONS[input.agent],mode:local?'local':'web',…};
```

`mode` is `'web'` whenever `local` is falsy, and `local` is `null` when the application is absent, when its
signature or publisher cannot be verified, or when it declares no folder route. What the person chose is never
read. In `handoff`:

```js
else {await openExternal(DESTINATIONS[preview.agent]);opened={opened:'web',…};}
```

And in `apps/companion/ui/app.mjs` the dialog promises it out loud:

```js
`Se abrirá ${preview.destination} en tu navegador.`
```

So the chain is complete and deliberate: choosing Codex, Cursor, Copilot, Claude, OpenCode or Antigravity as a
desktop application and not having a verified contract for it opens that product's web site. Exactly the
reported behaviour.

## Where the choice already lives

`apps/companion/engine/preparation.mjs`:

```js
const AGENTS = new Set(['codex','claude-code','cursor','github-copilot','opencode','antigravity','web']);
```

`'web'` is the browser chat; the other six are desktop applications. `normalizeSelection` stores
`agents: [...new Set(input.agents)].sort()` in the receipt. No new field is needed to know that someone chose
desktop: choosing `codex` *is* choosing desktop, and `web` is the only id that authorises a browser.

`role` and `goal` show the pattern for adding an optional field without invalidating an existing receipt:
`if (input.role !== undefined) { … }`.

## What gets installed today, for everyone

`apps/companion/runtime/catalog.mjs` pins four tools: Node's engine (37.5 MB download, 93.5 MB installed), npm
(bundled), Git (39.0 MB / 94.4 MB) and the code map (52.6 MB / 169.2 MB). `apps/companion/runtime/environment.mjs`
installs three of them — `const IDS = ['node', 'npm', 'git']` — plus the engineering cache, for every project
that prepares tools. There is no notion of project technology anywhere: not requested, not recommended, not
deferred. `selection` carries `profile`, `experience`, `role` and `goal`, and none of them changes the set.

## The machinery that a technology layer must reuse

`createToolchainStore` in `apps/companion/runtime/toolchain.mjs` already installs something verifiable:

- `package.json` and `toolchain-lock.json` are copied from the application's own resources into a working folder
  (the lockfile is stored under a different name because packagers strip `package-lock.json`).
- `npm ci --ignore-scripts --bin-links=false --workspaces=false --registry=https://registry.npmjs.org
  --min-release-age=7 --fund=false --audit=false` runs with `HOME` pointed at a fresh temporary folder through
  `isolatedEnvironment`, so neither user nor project config enters, and no lifecycle script runs.
- `verifyToolchain` then compares `inspectTree(root).sha256` and `.bytes` against `TOOLCHAIN.treeHash` and
  `TOOLCHAIN.bytes` from `toolchain-pin.mjs`, and fails with `TOOLCHAIN_INTEGRITY` on any difference.
- The verified tree is `rename`d into place; a stage folder is removed in a `finally` guarded by `assertPath`.

`inspectTree` in `apps/companion/runtime/tree.mjs` refuses symlinks and hard links, re-stats every file before
and after reading it, and returns `sha256` over the sorted list of `{path, bytes, sha256}`. That is the anchor.

## The dependency closures, measured

Run with `npm install --package-lock-only` against the real registry on this machine:

| Requested | Packages in closure | Licences | Install scripts | `os`/`cpu` constraints |
| --- | --- | --- | --- | --- |
| `react@19.2.0`, `react-dom@19.2.0` | 3 (`react`, `react-dom`, `scheduler`) | MIT | none | none |
| `typescript@5.9.3` | 1 | Apache-2.0 | none | none |
| `express@5.1.0` | 68 | MIT, ISC, BSD-3-Clause | none | none |

Vite and the usual bundlers were considered and left out: they pull `esbuild` and `rollup`, whose optional
platform binaries make the installed tree different on each operating system, so a single pinned digest would be
a lie on two of the three.

## What the checks currently assert

- `apps/companion/qa/desktop.mjs` exercises the handoff for five profiles with `agent: 'web'`, and asserts
  `f.opened[0] === DESTINATIONS.web`. That test stays true: it is about the web chat, which keeps its URL.
- Nothing anywhere asserts that a desktop choice does not open a browser. There is no test to break.
- `apps/companion/scripts/verify-local-launches.mjs` measures recognition and every refusal path against the
  real machine: 6 installed, 4 verified, 2 refused after issue 106.
- `apps/companion/runtime/inference.mjs` has `off` as a first-class level, which is why a recommendation cannot
  depend on a model.

## Constraints carried in

- The six checks from issue 106 and the closed publisher list do not move.
- Companion writes only inside `.project-os/`; `validateOwned` fails with `NAMESPACE_COLLISION` if anything is
  already in its place, and with `OWNED_FILE_CHANGED` if one of its files was edited.
- Every write goes through a journal that can be resumed or rolled back.
- No absolute path, account name or session identifier may reach a versioned file; `portable()` anchors them.
