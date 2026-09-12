# Independent adversarial review — issue 94

An independent session reviewed the whole branch against `main` without having implemented any of it,
following a locally borrowed adversarial-review playbook. It reproduced rather than read: it rescored the
inference trials with a scorer written from the rubric text, re-ran the native journeys against the
installed artifact, and mutated the code the tests exist to protect twenty-two times.

**Verdict: FAIL — 2 blockers, 6 majors.** This record keeps what was wrong, because the fixes only mean
something next to it.

## Blockers

**The versioned screenshot showed the maintainer's Windows account name** in an absolute path. Every text
record is anchored through `portable-path.mjs`, and no check reads an image — so the one place the
discipline silently did not apply was the one thing a reader looks at. The reviewer reproduced the leak
with its own run, confirming it was systematic, and showed the equivalent capture in an earlier archived
change did not have it. The path is now anchored in the page before the capture rather than after, and the
leaked image was removed.

**Task 2.3 was marked done with two clauses of its own requirement unverified**: source preservation after
closing and reopening, and engineering, official OpenSpec and the code map for software and Unity. Neither
existed anywhere in the script. Both are driven now, and both found something.

## Majors

**The corpus had been narrowed to what the verifier could read.** The citation check was an extension
allowlist of `txt|md|json|js`, and the five fixtures held exactly those four extensions — in the two
profiles the product defines as "artículos, **PDF**, documentos" and "**imágenes**, música, video". The
reviewer showed an earlier archived change had already exercised `paper.pdf · página 1` and
`protocol.docx · párrafo 1`, so this was a regression against evidence the project already had. Both
formats are back and the product cites both.

**Every locator was resolved as a line number**, including `página` and `párrafo`, which would have meant
checking an arbitrary offset of a binary read as text. Resolution now depends on the kind, and the record
carries which kind each citation received.

**The benchmark regressions tested the spelling of the old defect, not the property.** The reviewer
reintroduced the discarded pilot's exact bias — a third field on each public question saying whether it was
answerable — and all six tests stayed green, including the one titled "both model conditions use the same
envelope". They only asserted that the strings `'expected'` and `'47'` were absent. The property is that
answerability must not be observable in the prompt at all: three question sets differing only in whether
they carry an answer key must render byte-identical prompts. Both of the reviewer's mutations now fail.
Also added: a citation naming the wrong file no longer counts, which matters because every answer sits at
`:L2` of its own source, so the filename is the only discriminant.

**The measurements ran against an artifact older than the delivered one.** The native journeys were
re-run against the delivered artifact and reproduced their result; the model experiment was not
re-measured, and that is declared in its own limits with the module hashes that identify the version.

**Merging would deploy the landing**, which `tasks.md` said was reserved for the maintainer. The maintainer
authorised publication before the merge, so the trigger stayed and the stale sentence was corrected.

**The closing section of the acceptance record contradicted itself** and held a truncated sentence. It was
rewritten.

## What the review confirmed as sound

Worth recording because it bounds the risk. Every published figure reconciles: the reviewer rescored the
six trials independently and got the same 15/15 and 15/15, the same medians, and matching protocol hashes.
The excluded pilot was excluded for real bias — it leaked answerability in the ids and announced which
questions had no evidence — and excluding it **hardened** the published result against the product rather
than flattering it. Antigravity survived seven mutations with no reachable launch path. The Pages workflow
pins four actions to real commit SHAs, takes least privilege and does not touch the required gate. No text
file on the branch carried an absolute path or the account name.

## Two findings that were the product being right

Resolving the review surfaced a mistake worth keeping. The strengthened journeys reported that software and
Unity lose their citation after reopening, and that activation stopped advancing. Reading the screen instead
of concluding from absence: the application says **"Cambió el entorno de ingeniería; revisa sus
instrucciones"** and **"Vuelve a revisar los cambios antes de aplicarlos"**. Both are honest refusals with a
cause — preparing engineering changes the folder, and a plan went stale. The checks now read the reason, and
a refusal with a stated cause is recorded as correct while silence remains a finding.

That mistake was made twice before it was noticed. Concluding from absence is how a check manufactures a
defect, and it is the mirror image of the bias this review was looking for.

## Debt, and a gate that did its job

Classifying the reopen question honestly as `decision-required` took the plan to 5/5 and **paused it**. It
was not reclassified to fit: the investigation the gate demanded showed the product was correct, the
capture refused to rewrite immutable history, and a remediation assessment refuted the item with its
evidence. The plan is back to 4/5 with the refutation recorded rather than erased.

## Not resolved

The native window still does not exercise activation, the engineering apply or the code map: the
application refuses the stale plan and the review control is not on that screen from where the harness
stands. That is a limit of this harness, recorded as unverified with its cause, with the capability covered
by the service-layer journeys from #81. The model experiment was not re-measured against the delivered
artifact.

## Limits of this review

One reviewer, one pass, reading the branch as it stood. It did not build the installer, drive the interface
by hand, or review the Electron runtime. It was not a human usability review.
