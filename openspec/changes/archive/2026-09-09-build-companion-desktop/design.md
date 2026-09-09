## Decision

Approved under the maintainer's explicit #66 delegation. Use Electron 44.1.1, an exact eligible release
older than seven days at implementation time, with its security posture reviewed before distribution.
Render local HTML/CSS/modules with no UI framework runtime; the main process owns engines and native
operations. System fonts, CSS transitions and semantic elements suit a small offline app and keep the
dependency surface limited. Tailwind or animation libraries remain options when they solve a concrete
need; no remote CDN, canvas-only controls or decorative load delays are required for this app.

## Visual and interaction contract

Implement the recommended Estudio direction: light work surface, dark ink, green completion signal,
restrained borders and a visible sequence. A compact dark navigation area carries the brand. Headings
state the person's decision; explanations avoid technical acronyms until expanded. One primary action,
back/cancel where meaningful, persistent errors with a remedy and progress separate from success.

Onboarding captures role/experience, project type, name, selected AI(s) and a native chosen folder.
Five profiles remain explicit and can override detection. A review shows planned changes and limitations
before writing. Project workspace offers status, search, sources/coverage, recipes and handoff. History
allows reopening a folder without running setup again. No hidden provider account or built-in chat.

Recent Awwwards navigation informs editorial hierarchy and purposeful transitions; detailed observations
are retained in the reference evidence. The landing has its own expressive treatment in #81. App
animations are short and respect reduced motion. Focus remains stable while progress changes; Escape
closes dialogs and returns focus. Layout supports keyboard, 200% zoom and narrow windows without clipping.

## Trust boundaries

Use a dedicated local protocol with an exact static asset allowlist, restrictive CSP, sandbox,
contextIsolation and no Node in the renderer. Reject new windows, arbitrary navigation, permissions and
network requests from app content. Preload exposes named methods, not raw ipcRenderer or arbitrary URLs,
commands, paths or filesystem operations. Main validates sender frame and every payload.

Folder handles originate from the native picker or validated local history; the renderer receives
opaque IDs. Queries, selections, byte budgets and relative exclusions are validated again by the engine.
Only bounded data crosses IPC. Render all project names, paths and excerpts as text, never HTML.
The app never executes repository scripts as part of inspecting or preparing context.

One active job per app session prevents overlapping navigation/operation confusion; the engine's
per-folder lock remains authoritative across processes. Cancellation/recovery surfaces actual journal
state. Local history stores chosen paths and display choices in app data, with bounded checked writes.
It contains no account credentials, model keys, private source text or outbound diagnostics.

## Integration sequence and readiness

Preview base changes; for engineering profiles inspect the real constructor plan. Preserve collision
messages and prerequisites. Apply only reviewed stages, then prepare source context, synchronize
canonical instructions through the constructor when applicable and refresh context after generated
sources change. Check each stage independently. OpenSpec workflow activation and graph execution are
not inferred from configuration; package/tool provisioning is completed in #80 and its dependent work.

Handoff copies a reviewed starting instruction or bounded context and opens only an allowed provider
destination or a verified compatible local application. Never launch a command or URL read from the
project. Missing native integration has a clear external/web path, not a false active badge. Actual agent
loading and installer-level usability are verified in #81.

## Evidence and recovery

Test service contracts, invalid payloads/handles, navigation/network isolation, source injection, stale
plans, failure, cancel/recovery, history and five-profile UI. Use the real local renderer/engines for UI
checks and record which tests use injected native dialog results. Native installer + picker tests remain
separately identified. Run adversarial review/debt assessment, local OpenSpec archive and protected PR.
On regression, revert app changes and recover only verified owned project writes; keep originals/history.
