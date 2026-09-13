# Brownfield baseline

Measured on `main` at f6ec195, the commit that integrated issue 99. Read from the code and from the machine,
not from memory.

## What the launcher does today

`apps/companion/desktop/local-apps.mjs` knows four applications: Codex, Cursor, Visual Studio Code and
Antigravity. Before anything is opened it checks that the executable is an absolute `.exe`, that no component
of its path is a link, that it is a regular file with one hard link, that its signature is valid, that the
publisher is in a closed per-application list, and that its bytes are identical before and after the signature
check — and again between the review and the launch.

Only Codex has a declared-contract check: `codex app --help` has to print `Usage: codex app … [PATH]`.
Antigravity sits in `noVerifiedFolderContract`: recognised, reported, and never launched, because how its
build takes a folder was never observed.

`claude-code` and `opencode` appear in the wizard's list of AIs and in `DESTINATIONS` as web destinations, but
they are absent from `publishers` and `labels`, so `detect()` returns `null` for both and the interface offers
only the export path, without saying why.

## What is on the machine this was measured on

Both are installed and both are signed — `Anthropic, PBC` and `Anomaly Innovations, Inc https://anoma.ly/`.
Claude's stub forwards its arguments to the instance already running, so it prints no usage; OpenCode opens a
window instead of printing one. Neither has a command-line tool on the PATH. Both register a URL scheme.
Claude's build declares `claude://code/new?folder=<encoded>` beside a check that the target is a directory and
a `realpath` of it; OpenCode's declares no route with a parameter at all.

## What the checks currently assert

- `apps/companion/qa/local-apps.mjs` — four tests: the reviewed-signed-regular-executable path, an installed
  application that cannot be verified, absent versus untrusted locations, and a recognised application with no
  contract that is never launched.
- `apps/companion/scripts/verify-local-launches.mjs` — recognition and every refusal path against the real
  machine, with launching opt-in behind `--launch`, and it distinguishes "not installed" from "the installed
  artifact predates the change".

## Constraints carried in

- Inventing an argument is what this project decided not to do with Antigravity.
- Opening an application never means the AI read the project.
- No absolute path, account name or credential in a versioned file.
- The debt budget stands at 4 of 5.
