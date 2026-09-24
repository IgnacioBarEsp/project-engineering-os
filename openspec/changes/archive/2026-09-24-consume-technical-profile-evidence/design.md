## Context

The doctor currently emits an unconditional `FAIL` for each active technical profile. The profile catalog
already defines the automatic validations, manual evidence, negative cases, rollback and closure gate, but
the doctor neither consumes evidence for them nor has a fixed contract for doing so. Readiness archive runs
the fixed `constructor-doctor-json` runner, so it inherits the same impossible failure.

The consumer owns its profile decisions and evidence. The core owns the CLI, packaged canonical profile
definitions, validation contract and documentation. The doctor is read-only: it must not create or update
evidence, run consumer tests, or treat consumer metadata as executable instructions. The evidence is an
integrity-checked consumer attestation, not independent proof that a test or approval occurred.

## Goals / Non-Goals

**Goals:**

- Let a technically active profile report `PASS` only when its consumer-owned record is complete, current,
  bound to the current profile configuration and packaged canonical definition, and all referenced artifacts
  are present and hash-correct.
- Keep inactive technical profiles at `SKIP` and keep absent, invalid, stale or unsafe evidence fail-closed.
- Allow the fixed local readiness runner to consume that doctor result without changing the runner or
  executing consumer-supplied commands.
- Define a migration path for consumers with the 0.5.0 configuration shape without automatically changing
  their files or retiring the landing consumer's temporary workaround before a corrected core release.

**Non-Goals:**

- Changing active-profile decisions/defaults, manufacturing evidence, or automatically migrating a consumer.
- Executing or authenticating test, deployment, rollback, or manual-review claims.
- Modifying the landing consumer repository in this core change. Its workaround is removed only in its own
  reviewed change after a corrected core release is available.
- Adding dependencies, network access, product-specific behavior or paid services.

## Decisions

1. **Use the packaged canonical profile definition.** For the existing fixed set of technical profile IDs,
   derive the expected automatic validations, manual evidence, negative cases, rollback and closure gate
   only from `blueprint/core/project-os/profiles.json` inside the installed package. Never accept the
   consumer's copy of those requirement lists as authority; otherwise a consumer could remove a requirement
   and obtain a false `PASS`. Hash the full canonical profile entry using the same recursively key-sorted JSON
   representation as other doctor receipts, plus a trailing newline.

2. **Use one fixed receipt path per active profile.** Read only
   `.project-os/evidence/technical-profile-<profile-id>.json`. The versioned record contains `schemaVersion`,
   `profileId`, `configHash`, `profileHash`, UTC `issuedAt`/`expiresAt`, one `PASS` evidence item per
   canonical automatic validation, manual-evidence item and negative case, and `PASS` evidence for rollback
   and closure gate. Each item has its exact canonical `id` (where applicable) and an artifact reference with
   a repository-relative path and lowercase SHA-256. Duplicates, unknown IDs, missing IDs, alternate
   statuses, extra properties and wrong-profile records fail. There is no generic `N/A`: conditional checks
   such as `visual-check-when-configured` must provide a passing artifact showing how the condition was
   evaluated.

3. **Bind the receipt to effective profile selection and the profile decision.** `configHash` is SHA-256 of
   the canonical JSON projection containing the target profile ID, the sorted effective active-profile set,
   the sorted `config.activeProfiles` when present, the sorted profile-catalog active list (or its
   active-entry-derived equivalent), and the consumer catalog's matching `{id, active, activationDecision}`
   projection. This prevents reuse after an activation/deactivation or decision-reference change without
   invalidating evidence for unrelated configuration edits. `profileHash` binds the fixed canonical
   definition, including its requirements and rollback/closure text. Both hashes use lowercase hex SHA-256.

4. **Bound parsing, freshness and artifact reads.** Guard the fixed receipt path itself before opening it, so
   a symlinked `.project-os/evidence` path cannot make the doctor read outside the target root. Limit a
   receipt to 256 KiB, each artifact to 10 MiB and
   total artifact bytes per profile record to 50 MiB. Require canonical RFC 3339 UTC timestamps in
   `YYYY-MM-DDTHH:mm:ss.sssZ` form, `issuedAt` not in the future, `expiresAt` later than now and later than
   `issuedAt`, and a validity window no longer than 30 days. Resolve artifact references using the shared
   path guards; reject traversal, unreadable/missing/non-regular files, symlink escapes, and SHA-256
   mismatches. Hash the artifact's raw bytes. These bounds keep a read-only doctor invocation from becoming
   an unbounded parser or file reader.

5. **Keep readiness's execution boundary unchanged.** `readiness-check --phase archive --run-local`
   continues to invoke only the fixed `constructor-doctor-json` runner. The receipt schema has no command,
   argument, runner, shell, environment-variable or URL fields; no value in it is executed or fetched.
   Evidence reads do not write or normalize either the receipt or its artifacts.

6. **Keep 0.5.0 configuration readable but do not infer migrated evidence.** The previous configuration
   shape remains accepted by existing config/profile parsing. Without a new valid record, active technical
   profiles still fail. The consumer must create records against the new packaged definition after upgrading
   the core. Document that the landing workaround remains until that release is available, then must be
   retired in the landing repository's own reviewed change. This preserves ownership and avoids a broken
   interim consumer state.

7. **Publish a consumer-visible schema with the blueprint.** Add
   `blueprint/schema/technical-profile-evidence.schema.json` and seed it under
   `.project-constructor/schema/` through `blueprint/manifest.json`. JSON Schema checks shape; runtime checks
   canonical requirement membership, duplicates, hashes, time, size and path safety. This adds no runtime
   dependency and keeps the contract discoverable to consumers.

## Risks / Trade-offs

- [A consumer can self-report a false `PASS`] → State the boundary in doctor output and docs; verify only
  completeness, binding, freshness and artifact integrity, never execution or human approval.
- [Canonical profile wording or IDs change and old receipts stop passing] → Include `profileHash`; consumers
  regenerate affected receipts against the new definition rather than accepting stale requirements.
- [A large or hostile artifact slows doctor] → Bound receipt size, per-file size and total bytes; reject
  unsafe paths before reading and do not fetch external references.
- [Old consumers expect the temporary fail-closed workaround] → Keep the 0.5.0-shaped fixture fail-closed,
  document upgrade/receipt creation and defer workaround removal to the consumer after release.
- [An accidental behavior regression masks unrelated doctor findings] → Assert independent failures remain
  visible and that only the relevant `profile.<id>` result changes when its evidence is complete.

## Migration Plan

1. Add the schema, fixed receipt verification and consumer instructions without changing any consumer data.
2. Verify complete and adversarial fixtures, including an unchanged 0.5.0-shaped consumer; archive readiness
   must pass only for the complete evidence fixture.
3. Merge using the protected PR flow and publish the corrected core through its normal release process.
4. After the corrected version is available, update the landing consumer in its own issue/SDD/PR: add its
   profile receipts, remove only the exact obsolete classifier/runner workaround, and verify all other
   doctor failures remain fail-closed.
5. To roll back the core behavior, revert the protected core PR or publish a corrective release. Do not
   rewrite receipts, delete artifacts or deactivate profiles as rollback. A rollback restores the prior
   active-profile `FAIL`, not a silent `PASS`.

## Open Questions

None. The issue DoR fixes ownership, compatibility, receipt verification limits and the release-gated
consumer migration.
