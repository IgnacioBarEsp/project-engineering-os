# Adversarial self-review

The implementing agent performed this review under explicit maintainer delegation. It is not independent
human review. Scope: bounded propagation, published-artifact verifier, workflow permissions and recovery.

- Deadline and request/body limits prevent indefinite metadata polling or unbounded registry buffering.
  Missing data cannot pass; permanent errors and identity divergence fail. Controlled tests cover these.
- Tag input is data in the workflow and is validated before argument arrays. Fixed repository/registry,
  exact tarball names and manifest validation precede any manifest-controlled read. Redirects are rejected.
- Canonical bytes, npm integrity, installed lock identity and npm's cryptographic audit agree before PASS.
  Signed provenance is checked for exact subject, source repository, release workflow and canonical commit.
  Merely having a provenance URL is insufficient in the recovery workflow.
- Subprocesses use argument arrays, bounded time/output and hidden Windows execution. npm installation
  disables scripts and restricts the age exception to this reviewed package. No downloaded code executes.
  Review found JSON parsing could echo malformed child output; parsing now emits a fixed message, with
  a negative regression assertion. No raw child output appears in errors.
- Recovery grants contents:read only, has no publishing/OIDC step and retains action/npm pins. It reads
  existing tag/assets from current reviewed tooling without moving the tag or repacking 0.3.0.
- Read-only recovery trusts the existing GitHub/npm authorities and npm signature verifier; it is not an
  independent reproducible build. Errors or unavailable older-format evidence fail closed. Temporary
  local diagnostic directories remain; remote state is unchanged. The workflow limits total execution.
- The original release probe failure is retained and documented. Live local recovery passed; final
  GitHub recovery evidence remains a post-merge issue obligation. No source review impersonates a human.

Blockers: 0. Majors: 0. Residual technical debt: none for this bounded fix.
