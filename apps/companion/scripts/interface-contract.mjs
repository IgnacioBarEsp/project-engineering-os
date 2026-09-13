// The structural properties this interface has to hold, in one place, so the journey harness and the
// mutation harness check the same code rather than two similar-looking copies of it.
//
// Each probe is a function handed to `page.evaluate`, so it closes over nothing and runs in the page. Where
// a probe needs the vocabulary, it is passed in as data.
//
// Every probe reports a DENOMINATOR — how much it actually examined. A probe that returns only its failures
// cannot be told apart from a probe that examined nothing, and an independent review showed each of these
// passing vacuously against an emptied screen. `vacuous()` at the bottom is what the callers refuse on.

// Every control that offers a navigable action declares which action it is, and `doBtn` takes the label from
// the action table rather than from the caller, so a declared action cannot carry two labels through that
// path. Two names are reported per control: the text a reader sees and the name a screen reader speaks. A
// review offered a declared action under a second name through `aria-label` alone, which `textContent` could
// not see, so both are collected and a disagreement between them is itself a second name.
export const ACTION_PAIRS = () => [...document.querySelectorAll('[data-action]')].map(node => {
  const clone = node.cloneNode(true);
  clone.querySelectorAll('.sr-only').forEach(hidden => hidden.remove());
  const visible = clone.textContent.replace(/\s+/g, ' ').trim();
  const label = node.getAttribute('aria-label')?.replace(/\s+/g, ' ').trim();
  return { action: node.dataset.action, visible, spoken: label || visible,
    inDialog: !!node.closest('#dialog') };
});

// The real question, asked per screen: is a word of this repository's vocabulary on this screen without its
// definition being openable from this screen? The earlier version asked a much weaker one — six fixed words,
// on Inicio only — and an independent review put `harness` on the help screen and passed both harnesses.
//
// The whole document is inspected, not just `#view`: the sidebar and the topbar are on every screen, and an
// open dialog is the screen the person is looking at. Attribute text counts as screen text — a `placeholder`
// is drawn and an `aria-label` is spoken, and a review got a glossary word onto a screen through each of
// them while `textContent` saw neither.
//
// What is NOT the interface's own text: the person's words, marked at the point they are rendered with
// `data-content="person"`, and content generated from their files — a search result, a planned file list, a
// citation, a first instruction for an AI. An earlier version keyed this off the `own` and `path` CLASSES,
// and the same review found three places where the interface wrote its own prose inside one of them and was
// therefore exempt. A class is a styling decision; whose words these are is not.
export const UNDEFINED_VOCABULARY = vocabulary => {
  const notInterface = '[data-content="person"], pre, .file-list, .result, .citation';
  const clone = document.body.cloneNode(true);
  clone.querySelectorAll(`.term, .glossary, #dialog:not([open]), ${notInterface}`).forEach(node => node.remove());
  // Read node by node and joined with a space. Taking `textContent` off the whole clone glued adjacent list
  // items together — "tu perfil" + "qué etapas" became "perfilqué" — and the patterns require a non-letter
  // after the word, so an independent review found a glossary word hiding in that seam.
  const walker = document.createTreeWalker(clone, NodeFilter.SHOW_TEXT);
  const pieces = [];
  for (let node = walker.nextNode(); node; node = walker.nextNode()) pieces.push(node.textContent);
  const parts = [pieces.join(' ')];
  // Attributes are read from the live document: removing an element's text nodes from a clone says nothing
  // about a placeholder or a label it is still carrying.
  const attributeSources = [];
  for (const element of document.body.querySelectorAll('[placeholder], [aria-label], [title]')) {
    if (element.closest(`.term, .glossary, ${notInterface}`)) continue;
    if (element.closest('#dialog') && !document.getElementById('dialog')?.open) continue;
    for (const attribute of ['placeholder', 'aria-label', 'title']) {
      const value = element.getAttribute(attribute);
      if (value) { parts.push(value); attributeSources.push(`${element.tagName.toLowerCase()}[${attribute}]`); }
    }
  }
  const text = parts.join('   ').replace(/\s+/g, ' ');
  const openable = new Set([...document.querySelectorAll('.term[data-term]')].map(node => node.dataset.term));
  const missing = [];
  for (const entry of vocabulary.terms) {
    const pattern = new RegExp(`(^|[^\\p{L}])(${entry.forms.join('|')})([^\\p{L}]|$)`,
      entry.caseSensitive ? 'u' : 'iu');
    const hit = text.match(pattern);
    if (hit && !openable.has(entry.id)) {
      missing.push({ id: entry.id, word: hit[2],
        context: text.slice(Math.max(0, hit.index - 60), hit.index + hit[0].length + 60) });
    }
  }
  const forbidden = [];
  for (const [name, form, caseSensitive] of vocabulary.forbidden) {
    if (new RegExp(`(^|[^\\p{L}])(${form})([^\\p{L}]|$)`, caseSensitive ? 'u' : 'iu').test(text)) forbidden.push(name);
  }
  return { missing, forbidden, openable: [...openable],
    examinedChars: text.length, attributes: attributeSources.length, terms: vocabulary.terms.length };
};

// A control that opens a definition must name the term it opens. `makeTerm` refuses a mismatched label when
// the page is built; this checks the rendered result too, because the two failures look identical to a
// reader and only one of them is a code path.
export const TERM_LABELS = () => [...document.querySelectorAll('.term[data-term]')].map(node => {
  const clone = node.cloneNode(true);
  clone.querySelectorAll('.sr-only').forEach(hidden => hidden.remove());
  return [node.dataset.term, clone.textContent.replace(/\s+/g, ' ').trim()];
});

// "Sin saludo, sin explicaciones, sin pasos" as a property rather than as a list of selectors. An earlier
// version asserted "no <p> outside a project card" plus six class names, and a review reintroduced the
// greeting as a <div>, as a <details>/<summary>, and the steps as an <ol class="method"> — all three passed.
// What is checked now is every piece of text the screen shows: with entries on screen, the only text outside
// the project cards is the heading.
export const LIST_PURITY = () => {
  const view = document.getElementById('view');
  const walker = document.createTreeWalker(view, NodeFilter.SHOW_TEXT);
  const stray = [];
  let textNodes = 0;
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const value = node.textContent.replace(/\s+/g, ' ').trim();
    if (!value) continue;
    textNodes += 1;
    if (node.parentElement?.closest('article.project')) continue;
    if (node.parentElement?.closest('h1')) continue;
    stray.push(value.slice(0, 70));
  }
  return { cards: view.querySelectorAll('article.project').length, stray, textNodes,
    headings: [...view.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(node => node.tagName.toLowerCase()) };
};

// Declared explicitly, because a check that only inspects the controls it finds can be satisfied by removing
// one. The set has to match, not merely be consistent.
export const EXPECTED_ACTIONS = ['open-start', 'open-project-list', 'prepare-project', 'open-help',
  'privacy-scope', 'open-workspace', 'recheck-project', 'read-files', 'resave-base', 'review-development',
  'review-code-map', 'repair-tools'];

// Two of them only exist when the managed toolchain is available: the code map and its repair belong to the
// runtime, and a probe run without it would report them as missing rather than as out of scope. One more
// only exists when a project's saved answers no longer describe its folder, which no journey can force
// without editing the person's folder from outside the interface.
export const RUNTIME_ONLY_ACTIONS = ['review-code-map', 'repair-tools'];
export const CONDITIONAL_ACTIONS = ['resave-base'];

export function duplicateActionNames(seen) {
  return [...seen].filter(([, names]) => names.size > 1)
    .map(([action, names]) => `${action}: ${[...names].map(([name, where]) => `"${name}" (${where})`).join(' vs ')}`);
}

// A name only assistive technology hears is still a name, so it is recorded under the same action and a
// control whose spoken name differs from its visible one fails the same rule.
export function collectActionPairs(pairs, into, where) {
  for (const pair of pairs) {
    if (!into.has(pair.action)) into.set(pair.action, new Map());
    into.get(pair.action).set(pair.visible, pair.inDialog ? `${where} (diálogo)` : where);
    if (pair.spoken !== pair.visible) into.get(pair.action).set(pair.spoken, `${where} (hablado)`);
  }
}

export function missingActions(seen, { runtime = true, conditional = true } = {}) {
  return EXPECTED_ACTIONS
    .filter(action => runtime || !RUNTIME_ONLY_ACTIONS.includes(action))
    .filter(action => conditional || !CONDITIONAL_ACTIONS.includes(action))
    .filter(action => !seen.has(action));
}

export function undeclaredActions(seen) {
  return [...seen.keys()].filter(action => !EXPECTED_ACTIONS.includes(action));
}

// The controls that act on one listed project. They are not destinations, so they are not in the action
// table, but the same rule applies: one name per action. The project's own name is content marked as the
// person's and is removed before the name is read, which is what lets a screen reader announce which row a
// control belongs to without the interface's own name for the action multiplying by the number of rows.
export const EXPECTED_ROW_ACTIONS = ['open-project', 'duplicate-project', 'forget-project'];
export const PRIMARY_ROW_ACTIONS = ['open-project'];
export const ROW_ACTION_PAIRS = () => [...document.querySelectorAll('[data-row-action]')].map(node => {
  const clone = node.cloneNode(true);
  clone.querySelectorAll('[data-content="person"]').forEach(part => part.remove());
  const visible = clone.textContent.replace(/\s+/g, ' ').replace(/^[\s—-]+|[\s—-]+$/g, '').trim();
  const label = node.getAttribute('aria-label')?.replace(/\s+/g, ' ').trim();
  return { action: node.dataset.rowAction, visible, spoken: label || visible, inMenu: !!node.closest('details') };
});

// One control per declared action per screen. Since the label lives with the action, two controls cannot
// carry two names any more — but they can still make a screen ambiguous, and an ambiguous screen is read as
// two different things to do. This was found by the journey harness clicking a name that resolved to two
// controls: the guidance for the project offered the file reading as its pending step while a second panel
// offered it as the next step.
//
// Scoped to the screen's own content. The persistent navigation and the topbar are a different region, read as
// such, and a screen whose own call to action repeats a navigation entry is not ambiguous — removing Inicio's
// primary control because the sidebar also lists that destination would be a worse screen, not a clearer one.
// Two controls for one action inside the content is what a person reads as two different things to do.
export const ACTION_COUNTS = () => {
  const open = !!document.getElementById('dialog')?.open;
  const counts = {};
  const regions = [document.getElementById('view'), open ? document.getElementById('dialog') : null].filter(Boolean);
  for (const region of regions) {
    for (const node of region.querySelectorAll('[data-action]')) {
      if (region.id !== 'dialog' && node.offsetParent === null) continue;
      counts[node.dataset.action] = (counts[node.dataset.action] ?? 0) + 1;
    }
  }
  return counts;
};
export const repeatedActions = counts => Object.entries(counts).filter(([, count]) => count > 1)
  .map(([action, count]) => `${action} en ${count} controles`);

// Read off the rendered page, not reviewed by eye: which row actions each card offers, which of them are
// inside the secondary menu, and whether the card itself is the control that opens the project.
export const ROW_MENUS = () => [...document.querySelectorAll('article.project')].map(card => {
  const controls = [...card.querySelectorAll('[data-row-action]')];
  // The card opens the project only if the control that does it is the card's own heading and is NOT inside
  // the secondary menu. Without the second half, moving the opener into a disclosure inside the heading
  // would still read as "the card opens it".
  const opener = card.querySelector('h2 [data-row-action="open-project"]');
  return { actions: controls.map(node => node.dataset.rowAction),
    outside: controls.filter(node => !node.closest('details')).map(node => node.dataset.rowAction),
    opensFromCard: !!opener && !opener.closest('details'),
    menus: card.querySelectorAll('details.more').length };
});
export function rowMenuProblems(cards) {
  const problems = [];
  cards.forEach((card, index) => {
    for (const action of PRIMARY_ROW_ACTIONS) {
      if (!card.outside.includes(action)) problems.push(`fila ${index + 1}: ${action} solo vive en el menú`);
    }
    if (!card.opensFromCard) problems.push(`fila ${index + 1}: la tarjeta no abre el proyecto`);
    if (card.menus !== 1) problems.push(`fila ${index + 1}: ${card.menus} menús secundarios`);
    const missing = EXPECTED_ROW_ACTIONS.filter(action => !card.actions.includes(action));
    if (missing.length) problems.push(`fila ${index + 1}: falta ${missing.join(', ')}`);
    const undeclared = card.actions.filter(action => !EXPECTED_ROW_ACTIONS.includes(action));
    if (undeclared.length) problems.push(`fila ${index + 1}: acción sin declarar ${undeclared.join(', ')}`);
    // One control per row action per card, for the same reason as on a screen: two controls for one action
    // read as two different things to do, even when they carry the same name.
    for (const action of new Set(card.actions)) {
      const count = card.actions.filter(entry => entry === action).length;
      if (count > 1) problems.push(`fila ${index + 1}: ${action} en ${count} controles`);
    }
  });
  return problems;
}

// A mark that says a project is ready is a claim, so the check reads three things off the page: that the mark
// appears only where the state is `verified`, that every row says where its state came from at no smaller a
// size than the state itself, and that a ready row says what the check did not cover. The internal token of
// a stage may never appear in the row's text.
export const READY_CLAIMS = () => {
  const size = node => (node ? parseFloat(getComputedStyle(node).fontSize) : 0);
  return [...document.querySelectorAll('article.project')].map(card => {
    const state = card.querySelector('.project-state'), qualifier = card.querySelector('.project-state .recorded');
    return { className: state?.className ?? '', mark: card.querySelector('.state-mark')?.textContent.trim() ?? null,
      qualifier: qualifier?.textContent.replace(/\s+/g, ' ').trim() ?? null,
      text: state?.textContent.replace(/\s+/g, ' ').trim() ?? '',
      namedStages: card.querySelectorAll('.project-state .stage').length,
      stageTexts: [...card.querySelectorAll('.project-state .stage')].map(node => node.textContent.replace(/\s+/g, ' ').trim()),
      stateSize: size(state), qualifierSize: size(qualifier) };
  });
};
export const STAGE_NAMES = ['base', 'context', 'environment', 'engineering', 'code'];
export const INTERNAL_TOKENS = /\b(not-prepared|not-verified|requires-action|requires-repair|inventory-stale|not-available|not-requested|unknown)\b/;
export function readyProblems(cards) {
  const problems = [];
  cards.forEach((card, index) => {
    const ready = /\bstate-verified\b/.test(card.className);
    if (ready && card.mark !== '✓') problems.push(`fila ${index + 1}: lista sin su marca`);
    if (!ready && card.mark === '✓') problems.push(`fila ${index + 1}: marca de listo en ${card.className}`);
    if (!card.qualifier) problems.push(`fila ${index + 1}: no dice de dónde sale su estado`);
    if (card.qualifierSize < card.stateSize) problems.push(`fila ${index + 1}: la aclaración es más chica que el estado`);
    if (ready && !/no vuelve a leer tus archivos/i.test(card.qualifier ?? '')) {
      problems.push(`fila ${index + 1}: lista sin decir qué no comprobó`);
    }
    // A state that comes from a check has to say when the check was, and a row that says something is missing
    // or changed has to name what. Both are the difference between a state and an assertion nobody can act on.
    const checked = /\bstate-(verified|incomplete|changed)\b/.test(card.className);
    if (checked && !/\b20\d\d\b/.test(card.qualifier ?? '')) problems.push(`fila ${index + 1}: no dice cuándo se comprobó`);
    if (/\bstate-(incomplete|changed)\b/.test(card.className) && !card.namedStages) {
      problems.push(`fila ${index + 1}: no nombra qué le falta o qué cambió`);
    }
    if (INTERNAL_TOKENS.test(card.text)) problems.push(`fila ${index + 1}: un código interno en la fila`);
    for (const stage of card.stageTexts ?? []) {
      if (STAGE_NAMES.includes(stage)) problems.push(`fila ${index + 1}: "${stage}" es el nombre interno de una etapa, no una palabra`);
    }
  });
  return problems;
}

// The guidance inside a project: its steps, whether each carries text for an AI or a control that does the
// work here, and which definitions it offers. Compared between two projects by the steps themselves, never by
// the whole panel: a panel that differed only by the project's name would look different without any of the
// work being different.
export const GUIDE = () => {
  const list = document.querySelector('.guide');
  if (!list) return null;
  const panel = list.closest('.panel');
  return { heading: panel.querySelector('h2')?.textContent.replace(/\s+/g, ' ').trim() ?? '',
    terms: [...panel.querySelectorAll('.term[data-term]')].map(node => node.dataset.term),
    steps: [...list.querySelectorAll('.guide-step')].map(step => ({
      action: step.dataset.stepAction ?? null,
      title: step.querySelector('h3')?.textContent.replace(/\s+/g, ' ').trim() ?? '',
      why: step.querySelector('p')?.textContent.replace(/\s+/g, ' ').trim() ?? '',
      promptChars: step.querySelector('pre.prompt')?.textContent.length ?? 0,
      controls: [...step.querySelectorAll('button')]
        .map(node => node.dataset.action ?? node.textContent.replace(/\s+/g, ' ').trim()) })) };
};
export function guideProblems(guide) {
  if (!guide) return ['no se encontró la guía del proyecto'];
  const problems = [];
  if (!guide.steps.length) problems.push('la guía no tiene pasos');
  guide.steps.forEach((step, index) => {
    if (!step.title || !step.why) problems.push(`paso ${index + 1}: sin título o sin motivo`);
    if (INTERNAL_TOKENS.test(`${step.title} ${step.why}`)) problems.push(`paso ${index + 1}: un código interno en la guía`);
    // Two pending stages can be resolved by the same control — the managed tools and the development files
    // are both reviewed in one flow — and drawing that control twice would put the same name on the screen
    // twice. A later step covered by an earlier step's control is complete; anything else is not.
    const covered = step.action && guide.steps.slice(0, index).some(earlier => earlier.action === step.action
      && earlier.controls.includes(step.action));
    if (!step.promptChars && !step.controls.length && !covered) problems.push(`paso ${index + 1}: no ofrece ni texto ni control`);
    if (step.promptChars && !step.controls.length) problems.push(`paso ${index + 1}: texto sin forma de copiarlo`);
  });
  return problems;
}
export const guideSignature = guide => JSON.stringify((guide?.steps ?? []).map(step => [step.title, step.why]));

// Contrast, heading order and keyboard reach, measured on the rendered page rather than asserted from the
// stylesheet. The effective background is resolved by walking up until an opaque one is found, because a
// transparent element inherits whatever is painted behind it and comparing against `rgba(0,0,0,0)` would
// pass everything.
//
// Contrast covers the whole document, not `#view`: a review set the persistent sidebar navigation to 1.33:1
// and the definition dialog's own text to 1.17:1, and the earlier `#view`-scoped probe passed both. Heading
// order is a property of the screen's own outline, so it is read inside `#view`, plus the dialog when one is
// open, which is its own screen.
export const ACCESSIBILITY = () => {
  const luminance = ([r, g, b]) => {
    const channel = value => {
      const v = value / 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  };
  const parse = value => (value.match(/[\d.]+/g) ?? []).map(Number);
  const opaque = value => { const p = parse(value); return p.length >= 3 && (p.length < 4 || p[3] === 1); };
  const ratio = (front, back) => {
    const a = luminance(front), b = luminance(back);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  };
  const backgroundOf = element => {
    for (let node = element; node; node = node.parentElement) {
      const value = getComputedStyle(node).backgroundColor;
      if (opaque(value)) return parse(value).slice(0, 3);
    }
    return [255, 255, 255];
  };
  const dialog = document.getElementById('dialog');
  const open = dialog?.open ? dialog : null;
  const visible = element => {
    const style = getComputedStyle(element);
    if (style.visibility === 'hidden' || style.display === 'none' || Number(style.opacity) === 0) return false;
    if (element.closest('[hidden]') || element.closest('.sr-only')) return false;
    // A closed dialog is not on screen, and the skip link is off-canvas until focused.
    if (!open && element.closest('#dialog')) return false;
    if (element.closest('.skip')) return false;
    return element.offsetParent !== null || element === document.body || !!element.closest('#dialog');
  };
  const contrast = [];
  let measured = 0;
  for (const element of [...document.body.querySelectorAll('*')]) {
    const own = [...element.childNodes].some(node => node.nodeType === 3 && node.textContent.trim().length > 1);
    if (!own || !visible(element)) continue;
    measured += 1;
    const style = getComputedStyle(element);
    const size = parseFloat(style.fontSize);
    const large = size >= 24 || (size >= 18.66 && Number(style.fontWeight) >= 700);
    const value = ratio(parse(style.color).slice(0, 3), backgroundOf(element));
    if (value < (large ? 3 : 4.5)) {
      contrast.push({ tag: element.tagName.toLowerCase(), class: element.className || null,
        size, ratio: Math.round(value * 100) / 100, required: large ? 3 : 4.5,
        text: element.textContent.trim().slice(0, 50) });
    }
  }
  const outline = root => {
    const levels = [...root.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(node => Number(node.tagName[1]));
    const problems = [];
    levels.forEach((level, index) => {
      if (index > 0 && level > levels[index - 1] + 1) problems.push(`salta de h${levels[index - 1]} a h${level}`);
    });
    return { levels, problems };
  };
  const view = outline(document.getElementById('view'));
  if (view.levels.length && view.levels[0] !== 1) view.problems.push(`empieza en h${view.levels[0]}`);
  const ones = view.levels.filter(level => level === 1).length;
  if (ones !== 1) view.problems.push(`hay ${ones} encabezados h1`);
  const dialogOutline = open ? outline(open) : { levels: [], problems: [] };
  const focusable = [...document.querySelectorAll('a[href],button,input,select,textarea,summary,[tabindex]')]
    .filter(node => !node.disabled && node.tabIndex >= 0 && (node.offsetParent !== null || node.closest('#dialog')?.open))
    .length;
  const terms = [...document.querySelectorAll('.term')];
  // Words that wrap mid-word are unreadable even when nothing overflows. `noOverflow` compares scrollWidth
  // to innerWidth, so a navigation entry breaking into "Ini / ci / o" passes it — a review found exactly
  // that at the minimum equivalent viewport, in this change's own screenshot.
  //
  // The line count comes from the text's own client rects, not from the element's height: a first attempt
  // divided the bounding box by the line height and flagged every single-word entry, because the box
  // includes 36 px of padding. A range over the text node reports the line boxes the text actually occupies,
  // and a word cannot have been split unless there are more lines than words.
  const broken = [];
  for (const node of document.querySelectorAll('nav button, .tool-tabs button')) {
    if (node.offsetParent === null) continue;
    const text = [...node.childNodes].find(child => child.nodeType === 3 && child.textContent.trim());
    if (!text) continue;
    const range = document.createRange();
    range.selectNodeContents(text);
    const lines = range.getClientRects().length;
    const words = text.textContent.trim().split(/\s+/).length;
    if (lines > words) {
      broken.push(`${node.textContent.replace(/\s+/g, ' ').trim()} en ${lines} renglones para ${words} palabra(s)`);
    }
  }
  return { contrast, headingOrder: [...view.problems, ...dialogOutline.problems.map(p => `diálogo: ${p}`)],
    headings: view.levels, focusable, dialogOpen: !!open, brokenWords: broken,
    measured,
    terms: terms.length,
    termsReachable: terms.filter(node => node.tagName === 'BUTTON' && !node.disabled && node.tabIndex >= 0).length };
};

// What an assistive technology actually consumes is the accessibility tree, not the pixels. This reads the
// names and roles the page exposes: a control with no accessible name is unusable with a screen reader even
// when it looks obvious, and it is the one part of an assistive-technology pass a machine can honestly do.
export const ACCESSIBLE_NAMES = () => {
  const named = element => {
    if (element.getAttribute('aria-label')?.trim()) return true;
    const labelled = element.getAttribute('aria-labelledby');
    if (labelled && labelled.split(/\s+/).some(id => document.getElementById(id)?.textContent.trim())) return true;
    if (element.textContent.replace(/\s+/g, ' ').trim()) return true;
    if (element.labels?.length && [...element.labels].some(label => label.textContent.trim())) return true;
    if (element.title?.trim()) return true;
    return false;
  };
  const dialog = document.getElementById('dialog');
  const onScreen = element => element.offsetParent !== null || (dialog?.open && element.closest('#dialog'));
  const controls = [...document.querySelectorAll('button, input, select, textarea, a[href]')]
    .filter(element => onScreen(element) && !element.closest('.sr-only'));
  return {
    controls: controls.length,
    unnamed: controls.filter(element => !named(element))
      .map(element => `${element.tagName.toLowerCase()}${element.id ? '#' + element.id : ''}.${element.className}`),
    landmarks: [...document.querySelectorAll('nav, main, aside, header')]
      .filter(onScreen).map(element => element.tagName.toLowerCase()),
    navigationLabelled: !!document.querySelector('nav')?.getAttribute('aria-label'),
    liveRegions: [...document.querySelectorAll('[aria-live], [role="status"], [role="alert"]')].length,
    dialogNamed: !!(dialog?.getAttribute('aria-labelledby')
      && document.getElementById(dialog.getAttribute('aria-labelledby'))?.textContent.trim()),
    pressedTabs: [...document.querySelectorAll('.tool-tabs button')].every(node => node.hasAttribute('aria-pressed')),
  };
};

// Every probe's denominator in one place, so a caller can refuse a vacuous pass without knowing each probe's
// internals. An emptied screen used to be indistinguishable from a screen where everything passed.
export function vacuous(screen) {
  const empty = [];
  if (!screen.accessibility?.measured) empty.push('ningún elemento con texto medido para contraste');
  if (!screen.accessibility?.focusable) empty.push('ningún control alcanzable con el teclado');
  if (!screen.vocabulary?.examinedChars) empty.push('ningún texto leído para la regla de vocabulario');
  if (!screen.names?.controls) empty.push('ningún control inspeccionado para nombre accesible');
  return empty;
}
