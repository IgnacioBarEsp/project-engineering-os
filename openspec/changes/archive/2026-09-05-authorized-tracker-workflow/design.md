## Approved bounded contract

Issue #33 defines v1 operations: verify, description configure, and private GitHub Project create. Existing
Azure/Jira projects are preserved; creation of those organizational containers and arbitrary fields/views
are outside v1. Unsupported requests fail rather than producing a partial success claim.

## Planning and authority

Read a local request and canonical onboarding state plus local Git origin without credentials or network.
Do not propose a default for an unknown/existing/restricted tracker. GitHub is a suggestion only when origin
is github.com and the canonical answer explicitly says none. Bind plan to exact local source bytes and
origin, deterministic operation payloads, target root, 24-hour expiry and SHA-256. Approval separately binds
the plan digest, individual operation IDs and exact application scopes. It is an operator assertion, not
cryptographic identity proof or introspection of the credential's actual grants.

## Execution and recovery

Credentials are environment-only and supplied after local checks. Fixed HTTPS origins, no redirects,
bounded requests and sanitized errors prevent credential forwarding or response leakage. Providers expose
read/create/configure/delete primitives with normalized snapshots; production callers cannot supply arbitrary
remote method, URL, body or command. Re-read immediately before writes and after completion. Separate local
configuration, remote existence and read smoke. A read smoke never claims write permissions or AI operation.

Use a per-target exclusive lock and durable write-ahead journal per digest. Record mutation intent before
dispatch and remote identity immediately after create. An incomplete journal blocks blind retries; verify
reports state for explicit reconciliation. A completed receipt rechecks drift and never repeats writes.
Snapshots contain only identity/configuration and bounded structural metadata, never tokens or raw errors.

Rollback is separately approved against the original receipt. Description updates are restored only if the
current owned value still matches; preexisting containers are never deleted. Created GitHub Projects must
still match the recorded snapshot and have no items. Provider APIs do not supply a universal atomic
compare-and-swap: require a quiet maintenance window and report conflicts/uncertainty, not exactly-once.

## Verification

Exercise three provider request contracts with injected HTTP fixtures; offline/no-auth behavior, tampered
plans, expanded approvals, changed context, stale timestamps, drift, idempotence, crashes, locks and rollback
ownership. Use the maintainer's existing GitHub project for live read smoke and an explicitly attributable
temporary private project for create/configure/rollback. Do not claim live Azure/Jira authentication.
