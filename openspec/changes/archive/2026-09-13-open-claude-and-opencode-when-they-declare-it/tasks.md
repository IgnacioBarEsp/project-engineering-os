## 1. Research, before writing anything

- [x] 1.1 Read both installations on the real machine: location, signature, publisher, help output, PATH,
      registered scheme and the routes their own builds declare. **Claude: contract. OpenCode: none.**
- [x] 1.2 Answer the issue's open question about their command-line tools from the same measurement.
      **Neither has one on this machine's PATH, so there is nothing to detect.**
- [x] 1.3 Record both conclusions with what was tried, so a negative answer is a result and not a silence.

## 2. The contract

- [x] 2.1 Recognise both applications with their publishers, so a person learns whether each is installed and
      whether its publisher verifies.
- [x] 2.2 Add the declared-route contract: the build declares the route **and** the system registers that
      scheme to that same verified executable, both re-read between the review and the launch.
- [x] 2.3 Read the declaration in bounded chunks, stopping at the first match, failing closed.
      **11 ms measured against a 36.1 MiB bundle, with the route at byte 7 457 548.**
- [x] 2.4 Open Claude through exactly the route it declares, with the folder encoded and nothing else added.
- [x] 2.5 Keep OpenCode recognised and never opened, with its own reason, beside Antigravity's different one.

## 3. Evidence

- [x] 3.1 Tests: the six checks, each removed on its own, each refusing with its own sentence, and no refusal
      ever reaching a launch.
- [x] 3.2 Extend the launch harness to both applications and record what the real machine answers.
- [x] 3.3 Run the five native journeys and the browser journeys with the rules of #97, #98 and #99 holding.
- [x] 3.4 Independent adversarial review by a subagent that did not implement this change. **FAIL: 1 blocker
      and 6 majors, including a sentence on screen that was false about a correctly signed application, and
      three of the six checks surviving deliberate mutation. All resolved.**
- [x] 3.5 Capture the findings into the debt registry with the category each one actually has.

## 4. Closeout

- [x] 4.1 `openspec validate --all --strict` green.
- [x] 4.2 `readiness-check --phase archive` with 0 FAIL.
- [x] 4.3 Archive with the official CLI and write the seeded `## Purpose`.
- [x] 4.4 DCO-signed commits and a pull request, integrated by squash **only after `CI / required` is green**.
- [x] 4.5 Close the issue saying what was demonstrated and what was not.
