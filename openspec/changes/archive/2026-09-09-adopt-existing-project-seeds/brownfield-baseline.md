Observed at core 0.3.0: src/plan.mjs planProjectEntry rejects all unregistered existing project seeds.
The journal stores material operations only, so adoption also needs explicit read guards. Companion
cannot safely work around this by moving originals or mutating constructor state. Issue #85 records it.
