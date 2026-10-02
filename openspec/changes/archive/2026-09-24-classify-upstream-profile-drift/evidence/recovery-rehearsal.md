# Recovery rehearsal

The full integration suite exercises an actual constructor transaction and explicit rollback in a temporary
consumer fixture. The test `path rule retirement respects modifications and rollback restores owned files`
applies a generated change, removes a retired generated file, rolls back by transaction ID, and compares the
restored bytes before introducing a later human edit. The final `npm run check` runs this test; no files in
the upstream working tree are used as a rollback target.

For this issue specifically, `sync --check` and `upgrade --check` on the upstream report `SKIP` without
creating a transaction or changing files. Mutation-mode regression tests verify the pre-existing strict
profile mismatch aborts before writes.
