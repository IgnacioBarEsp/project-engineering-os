# Independent adversarial review — issue 81

An independent session reviewed this change without having implemented it, against a locally borrowed
adversarial-review playbook. It read the proposal, design, tasks, spec delta, every evidence file, the
branch diff and the untracked files, and it reproduced measurements rather than reading them.

**Verdict: FAIL — 4 blockers, 8 majors.** Every blocker and major below is resolved, and this record
keeps what was wrong so the fix can be checked against the claim.

## What it found, and what changed

### The measurement decided its own result (3 blockers)

The most consequential finding. The published comparison said a literal scan answered 5 of 10 questions
because it cannot read PDF or Word, "a difference of format, not of search quality". The reviewer
rebuilt the corpus PDF byte for byte from the script's own generator and showed its content streams are
uncompressed ASCII: `grep` reads it. The 5 of 10 was produced by `TEXT = new Set(['.txt','.md',...])`,
an extension allowlist that simply never opened the file.

Two more of the same kind. `read-all` never measured anything: `found` was hard-coded `true` and
`answerPresent` was derived from the file extension instead of from the text the method returned. And
`locator` was hard-coded `false` for both baselines while `filesOpened` was hard-coded `0` for the
prepared context — so two of the three advantages the page sold were bookkeeping. `grep -n` returns
`file:line`, and the prepared context reads the index it wrote.

Fixed by measuring instead of assuming. Every file is now decoded and scanned as bytes, readability is
observed rather than inferred from the extension, the scan emits `file:line` and it is counted, and the
prepared method reports the index files and bytes it reads. The measurement was rerun.

**The honest result is much smaller than what was published.** The literal scan answers **8 of 10**, the
same eight as reading the whole corpus, while reading 6812 bytes per query against the prepared
context's 88 814 bytes of index. What preparation adds over a competent scan on this corpus is two
questions — both in the Word document, which is genuinely deflated — and a passage locator instead of a
line number. `docs/companion/EVIDENCE.md` and the landing page now say that, including a paragraph
naming the earlier number as an artefact of the instrument.

### A review recorded as done that had not happened (1 blocker)

`tasks.md` marked the adversarial review complete and `validation.md` cited this file as existing
evidence. It did not exist. This review is the first. The task stayed open until this record was written.

### The journeys asserted almost nothing (major)

Two `assert` calls in the whole script: one on `argv`, one on `CONTEXT_STALE`. Everything else was
recorded and never checked, and `corruptIndex` fabricated its expected value with `?? 'requires-action'`
while reading a field the product leaves undefined for that case — so it printed the right-looking state
no matter what the product did.

Now twelve assertions. Removing the fabricated default immediately exposed that the degraded state lives
on `status`, not on `context`; the assertion reads what the product actually returns (`requires-action`,
with `CONTEXT_CONFLICT`) and fails if a corrupted index is ever reported as ready.

### The optional-tool refusal came from the harness (major)

The journey passed `environment: null` for profiles without engineering, and the service refuses on a
missing engine **or** on the profile — overdetermined. Every profile now gets a real engine, so the
refusal can only come from the product's own rule, and the exact code is asserted:
`ENVIRONMENT_UNAVAILABLE` for the tool stage and `GRAPH_PROFILE` for the code map, which is the tool
that is genuinely optional and downloads 52 MB of its own.

### The packaging test tested its own source code (major)

`qa/packaging.mjs` asserted that `runtime/manager.mjs` still *contained* certain strings. The reviewer
showed that reintroducing the exact regression the test exists to prevent left all seven assertions
passing. It is now a behaviour test: it builds a tree with a dependency vendored inside another
dependency, seals it with the real sealing code, extracts it with the real extractor, and compares
tree digests. Reintroducing the regression was tried again and the test fails, as it should.

### Smaller, all fixed

- "From an empty cache" was false for the second engineering profile, which reuses what the first
  downloaded. The record now states the cache state at start and each profile's download separately.
- `coverage.complete: false` was recorded for the engineering profiles and never explained or published.
  The record now carries the count of excluded files that makes it false.
- The code-map stage was skipped silently after an earlier finding, producing a shorter matrix that read
  like a shorter journey. A skip is now a recorded step.
- `design.md` promised a research project with a PDF **and** a Word document, and negatives for a moved
  project. The Word document and the moved-project case now exist.
- `contextBytesMedian` took the sixth of ten values. It is a median now.
- The worst published contrast, 5.51, was not the worst on the page: `querySelector` returned the first
  `.claim li`, and the ones under `.claim.plain` measure 5.35. Every matching node is measured now, in
  **both** colour schemes — the dark palette was never checked — which is 78 nodes and a true worst case
  of 5.35.
- The reflow check read `documentElement.scrollWidth`, which cannot see text clipped inside an
  `overflow:hidden` container. It now also checks every text-bearing element against the viewport, while
  treating content inside a scrollable ancestor as reachable rather than lost.
- The forbidden-claims lint matched only phrases that were already gone, and the number reconciliation
  included assertions as weak as `includes("0")`. Both were rebuilt; the reconciliation now matches each
  number as its own number, which caught that stripping whitespace welded adjacent figures together.
- Committed evidence carried absolute paths and the maintainer's Windows account name, against the
  project's own rule. Paths are anchored to `<repo>`, `<home>`, `<localappdata>` and `<temp>`.
- `site/` had no ownership row; screenshots existed in two places; `EVIDENCE.md` pointed at an archive
  path that did not exist from a package where it never would; `apps/npm-dist.zip`, which silently
  switches how the runtime manager resolves npm, was not ignored. All fixed.
- The artifact verifier imported the runtime catalog from the development tree, answering "does the
  sealed archive match the dev pin?" instead of "does it match the pin the installed application will
  apply?". It now reads the packaged catalog and asserts the two agree.

## What the review confirmed as sound

The extraction path for the sealed archive is genuinely hardened — it rejects `..`, backslashes,
absolute paths and reserved names, checks CRC and size per entry, opens with `wx` and caps the total —
and the pin is enforced at runtime on both the development and packaged branches. A substituted,
truncated or zip-slipping archive fails closed rather than executing. The packaging fix from #80 is
correct; what was worthless was the test guarding it.

## Not fixed, recorded instead

The issue's first observable criterion asks for evidence from the installer onward. The installer's
wizard pages are not exercised by any automated journey and no person walked them. That is stated in
every record and captured as debt rather than quietly satisfied.

## Limits of this review

One reviewer, one pass, reading the branch as it stood. It reproduced the benchmark corpus and the
contrast arithmetic independently, and confirmed the packaging test's weakness by mutation. It did not
build the installer, run the application's interface, or review the Electron runtime.
