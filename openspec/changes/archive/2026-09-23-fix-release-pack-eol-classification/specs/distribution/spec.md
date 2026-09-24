## ADDED Requirements

Release dispatch tags are untrusted input. All release checkouts MUST name the fully qualified
`refs/tags/<tag>` ref, shell steps MUST receive the value through a quoted environment variable, and
release preflight MUST prove that checked-out `HEAD` equals the commit currently resolved by the exact
remote tag before creating a candidate or publishing. The GitHub Release and npm publishing jobs MUST
use environments restricted to `main`, without administrator bypass. Every release job MUST be
conditional on a dispatch from `main`. Before attaching a candidate, the GitHub Release job MUST
compare the manifest commit with the checked-out remote tag commit. Active tag rules MUST block
updates and deletions for `v*` and `companion-v*` release tags without bypass actors.

### Requirement: Release EOL preflight preserves files without line terminators

The release preflight SHALL reject tracked files explicitly governed by `eol=lf` when index and worktree line-ending states diverge or either state is CRLF, mixed, or unknown. It SHALL accept `none` only when both index and worktree contain no line terminator, without rewriting that file. When an immutable tag predates a compatible release-tool fix, the build and npm packaging jobs SHALL load the EOL helper, release validator and tag-source resolver from the exact protected `main` workflow commit; the GitHub Release job SHALL load the source validator, tag resolver and candidate verifier from that same commit. The workflow SHALL preserve the tag and package identity.

The current core release workflow SHALL reject prerelease package versions during build preflight, before creating a GitHub Release, until a channel-specific npm distribution-tag policy is supported.

#### Scenario: Empty or single-line files have no line ending in index or worktree

- **WHEN** a protected tag contains an empty file or a file without CR/LF and Git reports `i/none w/none`
- **THEN** the release EOL preflight accepts the file without changing its bytes
- **AND** the canonical package is still built from the protected tag

#### Scenario: A checkout contains CRLF or mixed endings

- **WHEN** a tracked file governed by `eol=lf` is checked out with CRLF or mixed line endings
- **THEN** the release preflight rejects the checkout before producing a candidate

#### Scenario: The index and worktree disagree on line-ending state

- **WHEN** a tracked file governed by `eol=lf` reports different index and worktree EOL states
- **THEN** the release preflight rejects it before producing a candidate

#### Scenario: An old protected tag uses release tooling from a newer workflow commit

- **WHEN** the release workflow constructs or verifies a candidate for an immutable tag
- **THEN** build and npm load the release helper, source validator and tag resolver from the exact workflow commit on `main`
- **AND** GitHub Release loads those validators and the candidate verifier from that same commit
- **AND** it does not rewrite the tag, historical files, or public package contents

#### Scenario: A release dispatch selects only its remote tag source

- **WHEN** the release workflow checks out and validates its requested tag
- **THEN** checkout explicitly resolves `refs/tags/<tag>` rather than an ambiguous ref
- **AND** shell commands receive the tag as quoted data rather than source text
- **AND** preflight rejects a checked-out commit that differs from the exact remote tag commit
- **AND** GitHub Release and npm deployment jobs are available only from `main`
- **AND** the candidate's manifest commit matches the checked-out tag commit
- **AND** the immutable tag ruleset blocks later updates and deletions without bypass

#### Scenario: A prerelease is requested before channel publishing is supported

- **WHEN** a release tag identifies a prerelease package version
- **THEN** build preflight fails before producing a candidate or creating a GitHub Release
- **AND** it reports that stable releases are the only supported release channel
