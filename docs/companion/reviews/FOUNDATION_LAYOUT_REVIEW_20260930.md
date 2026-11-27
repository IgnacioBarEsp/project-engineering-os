# Independent Inicio/Ayuda layout pass — #144

Reviewer: separate Codex agent `/root/wave3_closeout_review`, using `engineering:code-review`; no delegation and no simulated maintainer approval. Exact clean head **fb98d62001e3ec57935b477724c34f2dc173742b**, in `C:/Users/RitualDesktop/.codex/worktrees/wave3-companion/project-engineering-os`.

## Result

Own technical layout review of Inicio and Ayuda passed in **four actual viewport sizes × two motion preferences × two screens =16 cells**, with32 original start/end-scroll screenshots individually opened and inspected by this reviewer. No P0–P3 layout defect was confirmed in this scope. This completes the requested independent, proportional Home/Help layout examination at this head, exceeding the three-size minimum; it is not a maintainer visual acceptance, real Electron/installer test, complete application usability evaluation, or permission to archive/merge/close Wave3.

The preceding independent reports/addendum remain intact. This report is additional evidence, not a replacement or extrapolation to #147–#150 or other newly rebased heads.

## Own execution and boundaries

- Command: `node <this-directory>/layout-review.mjs`, executed via the separate `run.mjs` logger; cwd was the exact worktree above, executable `C:/Program Files/nodejs/node.exe`, Node24.18.0, Windows.
- Successful attempt2: **exit0**, `2026-10-01T05:05:04.631Z`–`05:05:13.728Z` UTC (30September local). Raw metrics: `layout-evidence-attempt2.json`; command/exit/log: `layout-attempt2-command.json`, `layout-attempt2.log`.
- Real fb98 renderer modules/CSS/local SVG served read-only through an HTTP allowlist derived directly from its `ASSETS`. The actual response carried its exact production `CSP` string; request/response, page-error, console and forbidden external-request checks passed.
- Browser: **Microsoft Edge154.0.4258.37**, headless. No engine/core/service operations were invoked. The only injected `window.companion` member was a minimal fixed `onProgress`; Inicio/Ayuda themselves render their real static DOM and use their real navigation actions.
- Existing Playwright/runtime dependencies were reused. No npm install/audit/candidate, installer, source edit, branch/GitHub mutation, real project, artificial human reading or Wave4 work.

## Measured matrix

Every row below was executed for **both no-preference and reduce**. CSS viewport dimensions and reduced-motion state were checked in the actual page, not inferred from labels. Metrics are the same across the two preferences for these settled screens.

| Viewport | Contrast-text elements Inicio / Ayuda | Reachable/measured controls Inicio / Ayuda | Header / main height | Content scroll heights Inicio / Ayuda |
| --- | --- | --- | --- | --- |
|1180×820|36 /88|9/9 /7/7|56 /764px|1225 /2931px|
|1024×700|36 /88|9/9 /7/7|56 /644px|1216 /2949px|
|768×700|34 /86|9/9 /7/7|56 /644px|1451 /3430px|
|480×540|33 /85|9/9 /7/7|56 /484px|1739 /4059px|

Total: **128/128 controls** reached and centre-hit-tested across the16 cells. The probe covered the persistent header/nav/Privacy control as well as visible view controls; the intentionally off-canvas skip link and closed-dialog content were excluded from this pointer hit test. Existing accessible-name/focusable/heading probes supplied their own nonzero denominators, not a human assistive-technology certification.

In every cell:

- Computed-style AA contrast probe found no violations (ordinary text4.5:1, large text3:1), heading-order violations, inaccessible control names or navigation words split into excess lines. These are computed-style contrast measurements, not a pixel-by-pixel certification of gradients/antialiasing.
- Document, main scroller and navigation had no horizontal overflow. All four navigation destinations remained present; exactly the current destination was active, with correct INICIO/AYUDA breadcrumb. The compact Privacy icon retained its accessible label at480px.
- Local brand sprite had positive visible bounds; no CSP, console, failed-resource or external network error occurred.
- All visible interactive controls could be scrolled to and hit at their centre. Positioned elements had no transformed/filter/perspective containing-block ancestor. Last content was within the bottom of the main scroll viewport at scroll end.
- Motion normal/reduced was executed, then screenshots were captured after finite entry animation settled. This is not a frame-by-frame review of every intermediate animation moment or a downstream ambient-motion certification.

## Actual image inspection

I individually opened all32 originals through `view_image`: each filename is `<viewport>-<motion>-<screen>-<scroll-position>.png`, with viewport one of1180x820/1024x700/768x700/480x540, motion no-preference/reduce, screen start/help and scroll-position start/end. No collage, generated mockup, edited product image or inherited screenshot was substituted.

-1180×820 and1024×700: hero, two primary-area actions, method cards and help method are readable and separated; the four-destination header stays intact. Download/privacy panels and the final glossary definitions are visible at their actual scroll positions. Content continuing below the viewport is ordinary scrolling, not a clipped control.
-768×700: compact header preserves destinations and Privacy; the method cards reflow3+1 without overlap. Help text wraps within its panel. At scroll end the final content remains exposed, with no horizontal cut or covered final control.
-480×540: four compact nav entries plus named Privacy icon remain visible; Home's two action controls still fit. Hero/description, Help list and final glossary wrap inside the available width. Start/end captures show the actual484px main viewport; below-the-fold content remains scroll-accessible rather than pretending the full long screen fits at once.
- Normal/reduced image pairs preserve the same settled layout. I observed no missing text, obscured action, horizontal clipping or final-content dead obstruction. Layout taste, the old first-layer prose and later #149 composition are not treated as interchangeable approval targets.

## Screenshot provenance and retained failed attempt

Each original PNG has its own `.provenance.json` with exactfb98 commit,0.3.6 application version, actual engine/window/viewport/DPR, screen, generator, phase, timestamp, PNG byte count/dimensions and SHA-256. The script checked required v1 fields and IHDR dimensions. These files live with the generator in this fresh temporary directory; no repository screenshot gallery was published or altered. The raw metrics record hashes every served renderer asset and records the exact CSP/allowed requests. Private temporary evidence is not a release artifact.

Attempt1 was retained as `layout-command.json`, `layout.log`, `layout-evidence.json`: exit1, zero cells/captures, due to my own probe calling unsupported SVGRect `getBBox().toJSON()`. It was corrected to reading x/y/width/height, then attempt2 passed. That tooling failure is neither a product defect nor counted as a mutation detection; its evidence was not overwritten/deleted.

Final checks confirm headfb98 still clean with `git diff --check` passing. The two prior P2 corrections remain resolved as stated in the separate addendum, but `visual-check` correctly remains pending for the maintainer, and #204 remains its own production dependency blocker. This review does not certify any later head's different wizard phase/route observer or claim that the Wave3 pile is integrated or complete.
