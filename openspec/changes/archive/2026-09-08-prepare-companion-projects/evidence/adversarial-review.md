# Independent adversarial review — #77

Reviewer: separate `review_companion_discovery` agent, read-only. Scope began with the OpenSpec contract
then the engine, adapter and tests. No independent human review or future installer QA is attributed.

| Finding | Fix | Revalidation |
| --- | --- | --- |
| Resume accepted changed sources and returned prepared with a stale inventory. | Persist scan settings in journal and reinspect before continuing. | Independent PLAN_STALE; rollback preserved edited source. |
| Custom scan limits were absent from verification. | Persist limits in receipt and reuse their validated values. | Independent fileBytes=2 preparation verified current. |
| Journal reading allowed 20 MiB but its update used the 2 MiB file bound. | Explicit consistent journal bound through checked write. | Independent real 2,600-file fixture: journal 2,489,964 bytes, update/check/rollback PASS. |
| Malformed operation could raise a raw TypeError. | Validate operation objects and receipt consistency before recovery. | Independent operations[0]=null produced JOURNAL_INVALID/action. |
| Lock null or oversized PID raised an unactionable error. | Validate object, bounded PID and nonce before process inspection. | Final independent rerun returned LOCK_INVALID/action and preserved both locks. |

Final independent verdict: **PASS**, no findings remaining in this engine slice. Root's 15 tests pass
after fixes; repository suite contains 286 passing tests. Normal concurrency, corrupted records,
ownership and resource bounds are evidenced. Hostile same-user filesystem mutation, native UI,
installer, graph/PDF processing and external AI behavior are outside this pass and are not certified.

Archive recommended after remaining strict/readiness/debt checks. The parent #66 remains open.
