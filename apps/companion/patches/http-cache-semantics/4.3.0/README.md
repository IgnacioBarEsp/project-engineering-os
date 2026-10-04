# Experimental reuse guard — http-cache-semantics4.3.0

Approved only for disposable feasibility tests of #204, not production or distribution.
The JSON patch is data consumed by a strict exact-preimage verifier; it is never executed.
manifest.json fixes source integrity, license, all four input files, the single allowed
postimage, patch digest, attribution and retirement. Original LICENSE/copyright and
package name/version remain intact. Modified bytes must be labelled derived.

The patch addresses reuse restrictions and preserves existing conservative cookie
opt-ins; Set-Cookie alone is not an RFC caching prohibition. It is our own work, not
an upstream correction or an adoption of PR58. No new parser, expiry rules, API or
serialized fields are introduced. The matrix must state any remaining semantic limits.

When a new official candidate appears, test it unpatched with identical gates in a
separate immutable slot. Never apply this patch silently to a different version, erase
failed results, waive advisories or accept a vulnerable rollback. IgnacioBarEsp owns the
maintenance/retirement decision. Broad npm audit/runtime/repair and adoption are separate.
