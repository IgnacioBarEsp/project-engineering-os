## Why

Companion can now be installed from an artifact and can activate verified tools, but the promise behind
the program is that this makes a person's work with their AI easier and better. That claim has not been
tested end to end by anyone, and it has never been measured. Issue #81 turns the promise into evidence:
one real journey from installer to verified result, a matrix that includes what goes wrong, a landing
page built with the product itself, and a before/after measurement whose method survives inspection.

## What Changes

- Run the complete journey on the installed application for the five profiles: research with documents,
  software, Unity, creative work and general use. Record happy path, negative cases, recovery, and what
  happens when an optional tool is not installed.
- Prepare the Project Engineering OS landing project with the installed application, then build a
  distinctive, accessible and fast landing page reviewed against current reference work without copying
  any asset or code from it.
- Measure preparation and retrieval before and after, on the same corpus, with a deterministic method and
  raw data kept. Report negative results and the cost of preparing.
- Fix what the journeys break, and repeat the affected journey after fixing it.

## Capabilities

### New Capabilities
- `companion-evaluation`: the reproducible five-profile journey matrix and the measurement method,
  including what each number does and does not support.

### Modified Capabilities
None. The landing page extends `public-documentation-experience` in its own page rather than redefining
its requirements.

## Impact

Evaluation scripts and evidence, a landing page and its assets, and whatever the journeys prove is broken.
No product claim is added that the evidence does not carry.

Risk: measuring the wrong thing and presenting it as proof. Token counts are not observable here, so the
measurement reports context bytes, files opened, retrieval accuracy against a known answer key and
preparation cost, and never presents bytes as tokens or asserts fewer hallucinations. A journey run by the
same agent that built the product is not a user study and is not described as one.
