## Why

Issue #65 records verified minor debt: the renderer flattens four scoped rules into universal text even
though Claude Code, Cursor and Copilot support path selectors. DoR passes all 13 checks. The maintainer
authorized completing this debt in the September 4 session.

## What Changes

- Render one managed file per canonical rule for the three compatible harnesses, preserving globs.
- Keep existing aggregate files as indexes, avoiding unconditional copies of scoped instructions there.
- Verify each selector and body against the canonical source, with explicit fallback for other harnesses.
- Reuse transaction ownership, conflict, retirement and rollback handling for dynamic entries.

## Capabilities

### Modified Capabilities
- runtime: canonical scoped rule rendering.

## Impact

Renderer, compatible shells, capability metadata, fixtures and public guidance. No runtime dependency,
external execution or authenticated model claim. Rollback restores the preceding renderer and regenerates
through a reviewed plan, preserving modified and unmanaged files.
