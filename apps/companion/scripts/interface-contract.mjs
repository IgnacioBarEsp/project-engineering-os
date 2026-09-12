// The structural properties this interface has to hold, in one place, so the journey harness and the
// mutation harness check the same code rather than two similar-looking copies of it.
//
// Each probe is a function handed to `page.evaluate`, so it closes over nothing and runs in the page. Where
// a probe needs the vocabulary, it is passed in as data.

// Every control that offers a navigable action declares which action it is, and `doBtn` takes the label from
// the action table rather than from the caller, so a declared action cannot carry two labels. This reads the
// pairs off the rendered page so the table and the page cannot disagree either.
export const ACTION_PAIRS = () => [...document.querySelectorAll('[data-action]')].map(node => {
  const clone = node.cloneNode(true);
  clone.querySelectorAll('.sr-only').forEach(hidden => hidden.remove());
  return [node.dataset.action, clone.textContent.replace(/\s+/g, ' ').trim()];
});

// The real question, asked per screen: is a word of this repository's vocabulary on this screen without its
// definition being openable from this screen? The earlier version asked a much weaker one — six fixed words,
// on Inicio only — and an independent review put `harness` on the help screen and passed both harnesses.
//
// The whole document is inspected, not just `#view`: the sidebar and the topbar are on every screen, and an
// open dialog is the screen the person is looking at. The glossary's own definition list is excluded, since
// defining a word is not using it, and so is the text of every control that opens a definition.
// What is NOT interface text: the person's own files and the text generated from them. A search result, a
// planned file list, a folder path, a citation and the first instruction for an AI are all content passing
// through the screen. The first run of this probe reported `tokens` and `Contexto` as undefined vocabulary
// because a fixture file said "tokens must be measured" and a generated prompt said "Contexto" — the check
// was reading the person's material and blaming the interface for it. That is the instrument deciding the
// result, so it is excluded by kind rather than by word.
export const UNDEFINED_VOCABULARY = vocabulary => {
  const clone = document.body.cloneNode(true);
  clone.querySelectorAll('.term, .glossary, #dialog:not([open]), pre, .file-list, .path, .result, .citation, .own')
    .forEach(node => node.remove());
  const text = clone.textContent.replace(/\s+/g, ' ');
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
  return { missing, forbidden, openable: [...openable] };
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
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const value = node.textContent.replace(/\s+/g, ' ').trim();
    if (!value) continue;
    if (node.parentElement?.closest('article.project')) continue;
    if (node.parentElement?.closest('h1')) continue;
    stray.push(value.slice(0, 70));
  }
  return { cards: view.querySelectorAll('article.project').length, stray,
    headings: [...view.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(node => node.tagName.toLowerCase()) };
};

// Declared explicitly, because a check that only inspects the controls it finds can be satisfied by removing
// one. The set has to match, not merely be consistent.
export const EXPECTED_ACTIONS = ['open-start', 'open-project-list', 'prepare-project', 'open-help',
  'privacy-scope', 'open-workspace', 'recheck-project', 'read-files', 'review-development',
  'review-code-map', 'repair-tools'];

export function duplicateActionNames(seen) {
  return [...seen].filter(([, names]) => names.size > 1)
    .map(([action, names]) => `${action}: ${[...names].map(([name, where]) => `"${name}" (${where})`).join(' vs ')}`);
}

// Two of them only exist when the managed toolchain is available: the code map and its repair belong to the
// runtime, and a probe run without it would report them as missing rather than as out of scope.
export const RUNTIME_ONLY_ACTIONS = ['review-code-map', 'repair-tools'];

export function missingActions(seen, { runtime = true } = {}) {
  return EXPECTED_ACTIONS
    .filter(action => runtime || !RUNTIME_ONLY_ACTIONS.includes(action))
    .filter(action => !seen.has(action));
}

export function undeclaredActions(seen) {
  return [...seen.keys()].filter(action => !EXPECTED_ACTIONS.includes(action));
}

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
  for (const element of [...document.body.querySelectorAll('*')]) {
    const own = [...element.childNodes].some(node => node.nodeType === 3 && node.textContent.trim().length > 1);
    if (!own || !visible(element)) continue;
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
  return { contrast, headingOrder: [...view.problems, ...dialogOutline.problems.map(p => `diálogo: ${p}`)],
    headings: view.levels, focusable, dialogOpen: !!open,
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
