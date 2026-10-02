# TL;DR

Replace the unconditional `FAIL` for active technical profiles with read-only verification of one fixed,
versioned consumer evidence record per profile. The record must cover the exact validations, manual evidence,
negative cases, rollback and closure gate in the packaged canonical catalog; it is bound to current profile
selection and the canonical profile hash, expires within 30 days, and references hash-checked repository
artifacts. A `PASS` means the record is complete and intact, not that the core reran or authenticated the
consumer's tests. Missing or invalid records still fail, inactive profiles remain `SKIP`, readiness keeps
its fixed doctor runner, and a 0.5.0-shaped consumer is not silently migrated. Retire the landing workaround
only through its own reviewed change after publishing the corrected core.
