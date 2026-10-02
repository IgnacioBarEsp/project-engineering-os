# TL;DR

The blueprint's two consumer defaults and the upstream's five project-owned active profiles are both
intentional. `sync --check` and `upgrade --check` should therefore return an explicit `SKIP` only when the
target has both the upstream governance marker and the core package identity. Consumer drift and all
mutating commands remain strict. No profile list or consumer default changes.
