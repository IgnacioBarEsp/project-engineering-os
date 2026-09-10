# Library and CLI compatibility decision

Approved under the maintainer's explicit program #66 delegation on 2026-09-09 for issue #85 and subsequent
neutral API/CLI changes. Activate the upstream library-cli validation profile.

The core remains a separately published MIT package, using the documented supported Node versions and
existing Windows/macOS/Linux CI. New options are opt-in; existing calls, ownership protections and
read-only checks retain their contract. Consumer manifests, stack and license remain consumer-owned.
No new dependency is needed for seed adoption. Distribution follows the existing immutable release,
canonical tarball, integrity/provenance and protected pipeline. App dependencies remain outside the core.

State additions are optional and compatible with the existing format; transaction guards are additive.
Test older journals, repeated calls, invalid inputs, package contents and interrupted recovery. Reverse
only hash-verified owned writes and state; adopted originals and later consumer edits survive rollback.
Reinstall the previous verified core artifact when reverting an upstream regression. Never claim an
adopted package or generated workflow has been installed or executed without a separate runtime check.
