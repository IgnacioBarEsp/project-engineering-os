## ADDED Requirements

### Requirement: The npm tarball is constrained to declared package contents

The npm package SHALL declare a curated `files` allowlist for its universal runtime and consumer guidance. Package validation SHALL inspect the actual tarball, reject every path outside that allowlist, and reject relative Markdown links that do not resolve inside the extracted tarball. Repository-only Companion, Stitch, upstream status/release documents and non-core images SHALL NOT be included.

#### Scenario: A tarball contains a path outside the package allowlist

- **WHEN** a path appears in the actual npm tarball but does not match an exact allowed path or allowed directory in `package.json#files`
- **THEN** package validation fails and names the unexpected path

#### Scenario: A retained document links to a file absent from the tarball

- **WHEN** a packaged Markdown document contains a relative inline or reference link whose decoded path is not present in the extracted tarball
- **THEN** package validation fails and names the document and unresolved link

#### Scenario: Companion and prototype documentation remain in the repository

- **WHEN** npm packages the core CLI
- **THEN** no path under `docs/companion/`, `docs/stitch uxui/`, or `docs/assets/` is present in the tarball
- **AND** repository validation continues to retain those source documents unchanged

### Requirement: New release manifests record package inventory metrics

The release packer SHALL record the npm file count and unpacked tarball bytes in every newly generated release manifest, in addition to its existing compressed byte count and digest. Candidate verification SHALL require finite positive inventory metrics; published verification SHALL accept historical manifests only when both fields are absent and SHALL reject partial or invalid metric pairs.

#### Scenario: A new candidate records its package inventory

- **WHEN** the pinned npm client produces a tested package tarball
- **THEN** `release-manifest.json` records its entry count as `fileCount`
- **AND** it records its unpacked size as `unpackedBytes`
- **AND** candidate verification accepts those values only when they are positive bounded integers

#### Scenario: A historical published manifest predates inventory metrics

- **WHEN** read-only published verification checks a canonical release manifest with neither `fileCount` nor `unpackedBytes`
- **THEN** the historical manifest remains verifiable under the existing identity and checksum rules
- **BUT** a manifest with only one metric or malformed metrics fails closed
