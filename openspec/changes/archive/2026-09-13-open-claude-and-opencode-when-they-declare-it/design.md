## Context and decisions

### What was measured, before anything was written

This is a research issue, so the answer had to come from the installations rather than from documentation.
On the maintainer's machine, read directly:

| | Claude | OpenCode |
| --- | --- | --- |
| Where | `%LOCALAPPDATA%\AnthropicClaude\app-<version>\claude.exe` | `%LOCALAPPDATA%\Programs\@opencode-aidesktop\OpenCode.exe` |
| Signature | Valid, `Anthropic, PBC` | Valid, `Anomaly Innovations, Inc https://anoma.ly/` |
| `--help` | prints no usage; hands its arguments to the instance already running | prints no usage; opens a window |
| CLI on PATH | none | none |
| Registered scheme | `claude://` → that executable, `"%1"` | `opencode://` → that executable, `"%1"` |
| Route taking a folder, declared by its own build | **`claude://code/new?folder=<encoded>`**, built next to a check that the target is a directory and a `realpath` of it | **none**: it registers the scheme and forwards deep links to its renderer, and declares no route with a parameter |

Two different answers, both valid, both from the installation.

### Why a declared route counts, and a plausible one does not

Codex's contract is read from a help line. Claude answers no help command at all, so the same method does not
apply — but that does not make the contract unobservable. **The build declares the route it accepts**, and the
system declares who receives that scheme. Those are two facts about the installed software, obtained the same
way Codex's is: by asking the installation, not a manual.

What is still forbidden is what Antigravity taught: constructing an argument because it looks plausible. The
difference between `claude://code/new?folder=` and a guess is not confidence — it is that one appears in the
software's own resources and the other does not. If a future build stops declaring it, the check stops passing
and the opening stops being offered, which is the behaviour that matters.

### What is anchored to a signature, and what is not

Four of the six checks below are anchored to the executable's Authenticode signature. **Two are not**, and
saying so is part of the design rather than a footnote: `resources/app.asar` is not covered by that signature,
and `HKCU\Software\Classes` is writable by the account itself. Anyone who can write to either already runs as
that person, and what they would achieve is Companion opening the legitimate application with that same
person's folder. Those two checks exist to tell an observed contract from an invented argument, not to stop
someone who is already inside. `docs/companion/SECURITY.md` says the same thing to the person.

### The six things that must hold, together

Every one of them is re-read between the review and the launch, because a person can install an update in
between:

1. The executable is a regular file, reached without a link, at an absolute `.exe` path.
2. Its signature is valid.
3. Its publisher is in the closed list for that application.
4. Its bytes are identical before and after the signature check, and again at launch.
5. The system hands that scheme to **that same** executable.
6. That build declares the route.

The first four already existed. This change adds the last two, and makes them refuse with their own sentence,
so a person reads which one failed rather than a generic refusal.

### Reading the declaration without becoming a way to hang the interface

The declaration lives in a **36.1 MiB** bundle. It is read in one-megabyte chunks with a carry between them,
stopping at the first match — **11 ms measured**, because the route sits at byte **7 457 548**, so about 8 MiB
are read before it is found — and bounded three ways: 256 MB, fifteen seconds, and the first match. If the
bundle is missing, is a directory, or cannot be read, the check fails closed: no declaration, no opening, and
no filesystem error carrying an absolute path reaches a screen.

An independent review corrected both numbers here: the bundle is not 47 MB and the route is not near the
start. The measurement of 11 ms was right, which is the one that decided the design.

### What the answer for OpenCode is, and why it is a result

OpenCode joins the set this product will not launch. That set already contains Antigravity for a different
reason — its signature does not verify here — and the two reasons are kept apart on screen: one says the
publisher could not be verified, the other says how it takes a folder was never observed. The reviewed export
remains the correct answer for both, and this change does not weaken it.

The issue's open question — whether to detect their command-line tools as well — is answered by the same
measurement: **neither has one on the PATH of this machine**, so there is nothing to detect. If one appears, it
is a different application from the desktop one and would need its own contract, observed the same way.

One correction worth keeping, found by an independent review reading the same bundle: Claude's build **does**
declare a command-line contract — `Usage: ccd [--] [path]` — but only under the name `ccd`, which is not on
this machine's PATH and is not installed beside `claude.exe`. So "it answers no help command" is true of the
executable this product would run, and the sentence is narrowed to say that rather than something broader.

### What a person is told, and what is not claimed

An application that can be opened is offered; one that cannot says why, in its own words. Opening still does
not mean the AI read the project — the sentence that says so stays untouched, and this change adds no claim.

## Recovery and acceptance

Rollback is reverting the pull request: both applications stop being recognised and the export path is the
answer again. Nothing on the machine is modified by either direction.

Accepted when: each application has a conclusion backed by the installation and kept as reproducible evidence;
Claude is offered only with all six checks holding, and removing any one is detected; OpenCode is recognised
and never opened, with its own cause; no screen claims the AI read the project; and the rules from #97, #98
and #99 still pass.
