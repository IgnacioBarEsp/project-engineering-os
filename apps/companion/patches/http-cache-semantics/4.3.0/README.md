# Experimental reuse guard — http-cache-semantics4.3.0

Approved only for disposable feasibility tests of #204, not production or distribution.
The JSON patch is data consumed by a strict exact-preimage verifier; it is never executed.
manifest.json fixes source integrity, license, all four input files, the single allowed
postimage, patch digest, attribution and retirement. Original LICENSE/copyright and
package name/version remain intact. Modified bytes must be labelled derived.

The patch addresses reuse restrictions and preserves existing conservative cookie
opt-ins; Set-Cookie alone is not an RFC caching prohibition. It is our own work, not
an upstream correction or an adoption of PR58. The second amendment approved in
d6e2b543d632dc35b099037746891dbe2f3983db permits necessary directive-name/expiry
normalization, serialized v1 normalization without reparsing cleared controls, and
new304 Vary propagation. It does not introduce a new HTTP parser or serialized
fields. A request eligibility helper is internal to the approved derived caller;
it is not a production Companion API. The matrix must state remaining limits.

Frozen variant3 is NOT apt: the expanded component matrix passes154/161.
Quoted-extension tokenization, new304 Expires and direct request-boundary cases
remain failed. Initial152/152 is retained historical coverage, not full acceptance.
Three of three variants are consumed; do not change these frozen postimages without
the separate proposed final-recipe amendment actually receiving approval.

When a new official candidate appears, test it unpatched with identical gates in a
separate immutable slot. Never apply this patch silently to a different version, erase
failed results, waive advisories or accept a vulnerable rollback. IgnacioBarEsp owns the
maintenance/retirement decision. Broad npm audit/runtime/repair and adoption are separate.
