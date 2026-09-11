## Context

Approved under the maintainer's explicit #66 delegation after current #81 DoR passed. The application is
installed on the maintainer's machine from the artifact verified in #80, and it can activate and verify
real tools after #87. What has never happened is a complete run through that installed application for
each profile, a landing page built with the product itself, or any measurement at all.

## Goals / Non-Goals

Goals: a reproducible matrix of the five profile journeys on the installed application including negative
cases, recovery and unavailable optional tools; a landing page that is distinctive, accessible and fast;
a before/after comparison whose method, corpus, raw data and limits are published; and fixes for whatever
the journeys break, with the affected journey run again.

Non-Goals: a study with users, a claim about token usage, a claim about hallucinations, a performance
comparison against another product, or any assertion that the evidence does not carry. Copying assets,
markup or styles from reference work is out of scope and out of bounds.

## Decisions

### What the journeys drive, and what they do not

The journeys run against the code of the installed application, through its own service layer, with the
native capabilities injected the same way the browser journeys inject them. That is the honest boundary:
it exercises the installed engines, the installed core and the managed runtimes this machine downloads,
and it does not exercise the interface. The interface is covered by the five browser journeys from #87,
and the installer's own wizard pages remain unexercised by a person. Every record says which of the three
it is, so nobody can read a passing matrix as "a person did this".

Each profile gets a project whose materials are representative rather than minimal: a research project
with a PDF and a Word document, software and Unity projects with real source files and a pre-existing
product manifest, a creative project with a workflow description, and a general project with notes. The
journey then walks preparation, context, search with citations, and for software and Unity the reviewed
tools, official activation and the code map, ending at a query whose answer is known in advance.

### What counts as a negative case

A negative case is one where the correct behaviour is refusal or an honest degraded state, and the
journey asserts that state rather than recording it. The matrix covers a changed source after indexing,
a corrupted app-owned index, a moved project, and the stages whose optional tools a profile cannot use.
A journey that reaches a wrong state is a finding: it is recorded, fixed, and the journey is run again
against the fix.

Two boundaries are worth naming. A moved project is not one case but two, and asserting a single answer
for both would demand wrong behaviour: the document index is addressed by content, so a copy holding the
same bytes is legitimately current at the new path and its relative citations still resolve; the code map
and the tool receipt name absolute locations, so they must refuse until reviewed again. The journey
asserts each separately. And an interrupted operation is not driven from here: reaching it requires
killing the process mid-transaction, which a journey cannot do without becoming a test of the harness.
The application's own contract tests cover interruption and recovery, and the journeys assert the states
that a person can actually produce.

### What is measured, and what cannot be

The comparison asks a fixed question set against a fixed corpus, twice: once with only the raw folder,
once after preparation. What can be measured deterministically is measured — whether the answer to each
question is present in what the method returns, how many bytes of context that takes, how many files must
be opened, and whether the result carries a locator that can be checked against the original. Preparation
cost is measured in time and in bytes written.

Token usage is not exposed to this measurement, so it is reported as not measured. Bytes are reported as
bytes and never presented as tokens. Nothing about hallucinations is claimed, because the method cannot
observe them. The comparison is between two retrieval methods over the same corpus, not between two
products and not between two people, and the published result says so in the same place it says the
numbers.

### The landing page

The landing is built as a project prepared by the installed application, so the product is used to build
its own public page. It is a static page: system fonts, no external requests, no analytics, no fabricated
metrics or testimonials. Reference work is reviewed for what it does well — hierarchy, restraint, motion
discipline — and the review is recorded as observations, never as copied assets, markup or styles.
Accessibility is not asserted: keyboard order, contrast, reduced motion and reflow are checked and the
result is recorded with what was not checked.

It lives in its own top-level directory, added to the export allowlist as a reviewed decision. The
published package lists the files it ships and the landing is not among them, so the page belongs to this
repository and never reaches a consumer's project or the npm tarball. The preparation artifacts the
application wrote while building it stay out of version control for the same reason the documentation
recommends to everyone else: they hold absolute paths and excerpts of the sources.

## Risks / Trade-offs

- Measuring the wrong thing and presenting it as proof → the method names, in the same document as the
  numbers, what each number does not support, and reports what it could not measure.
- An agent-run journey read as a user study → every record states what drove it.
- A landing that overstates → no metric, testimonial or claim appears on it that this repository cannot
  evidence today.
- Downloading real tools onto the maintainer's machine → that is what the application is for; the
  journeys use the same reviewed catalog, the same explicit plans and the same destinations a person gets.

## Migration Plan

None. This change adds evaluation material and a landing page, and fixes whatever the journeys break in
the existing application.

## Validation and Open Questions

Run every journey, keep the raw records, fix findings and rerun. Publish the method before the numbers.
Independent adversarial review, captured debt, official archive and protected CI precede merge.
