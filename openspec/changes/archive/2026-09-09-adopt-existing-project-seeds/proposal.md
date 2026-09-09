## Why

Issue #85: existing software and Unity folders often contain README.md or package.json. The constructor
currently treats those project-owned seeds as collisions, preventing safe preparation of existing work.

## What Changes

- Report eligible existing project seeds in read-only plans.
- Accept explicit target/SHA-256 consent through the API and a bounded local JSON file in the CLI.
- Register adoption without rewriting originals; guard consent during apply and interrupted resume.
- Preserve the default collision behavior and all non-project ownership boundaries.
- Prepare compatible minor version 0.4.0 for publication through the existing pipeline after protected merge.

## Capabilities

### New Capabilities
- `project-seed-adoption`: reviewed, hash-bound adoption and original-preserving recovery.

### Modified Capabilities
None. Default runtime behavior remains unchanged unless the new explicit option is supplied.

## Impact

Neutral planner, command/CLI API, transaction guards, tests and public documentation. No new dependency.
Companion uses the resulting published API in #87; this change does not edit its installed package.
No product framework, package merge, tool execution or external ownership adoption is introduced.

Risk: stale consent or recovery could misrepresent or destroy originals. Rollback only changes owned
transaction operations/state and must never touch adopted files. Upstream recovery reverts this PR.
Approved under the maintainer's explicit #66 delegation; not represented as human or independent review.
