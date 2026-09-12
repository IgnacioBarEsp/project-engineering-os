// The three structural properties this interface has to hold, in one place, so the journey harness and the
// mutation harness check the same code rather than two similar-looking copies of it.
//
// Each probe is a function handed to `page.evaluate`, so it closes over nothing and runs in the page.

// Every control that offers a navigable action declares which action it is. The original defect was three
// controls, three names, one action; the property is therefore about the pair, not about any one label.
export const ACTION_PAIRS = () => [...document.querySelectorAll('[data-action]')].map(node => {
  const clone = node.cloneNode(true);
  clone.querySelectorAll('.sr-only').forEach(hidden => hidden.remove());
  return [node.dataset.action, clone.textContent.replace(/\s+/g, ' ').trim()];
});

// The complement of "every term is answerable from where it appears": after removing every control that
// opens a definition, none of this repository's vocabulary is left as plain prose. RAG and SDD are matched
// case-sensitively with word boundaries, because "fragmento" contains "rag".
export const UNDEFINED_JARGON = () => {
  const clone = document.getElementById('view').cloneNode(true);
  clone.querySelectorAll('.term').forEach(node => node.remove());
  const text = clone.textContent;
  return [['harness', /harness/i], ['RAG', /\bRAG\b/], ['SDD', /\bSDD\b/], ['contexto', /contexto/i],
    ['adversarial', /adversarial/i], ['OpenSpec', /OpenSpec/]]
    .filter(([, pattern]) => pattern.test(text)).map(([name]) => name);
};

// "Sin saludo, sin explicaciones, sin pasos", as a property: with entries on screen there is no paragraph
// outside a project card and none of the home page's furniture.
export const LIST_PURITY = () => {
  const view = document.getElementById('view');
  return { cards: view.querySelectorAll('article.project').length,
    strayParagraphs: [...view.querySelectorAll('p')].filter(node => !node.closest('article.project'))
      .map(node => node.textContent.trim().slice(0, 70)),
    furniture: ['.eyebrow', '.intro', '.steps', '.feature-row', '.panel', '.hero-title']
      .filter(selector => view.querySelector(selector)) };
};

// Declared explicitly, because a check that only inspects the controls it finds can be satisfied by removing
// one. The set has to match, not merely be consistent.
export const EXPECTED_ACTIONS = ['open-start', 'open-project-list', 'prepare-project', 'open-help',
  'privacy-scope'];

export function duplicateActionNames(seen) {
  return [...seen].filter(([, names]) => names.size > 1)
    .map(([action, names]) => `${action}: ${[...names].map(([name, where]) => `"${name}" (${where})`).join(' vs ')}`);
}

export function missingActions(seen) {
  return EXPECTED_ACTIONS.filter(action => !seen.has(action));
}

// Contrast, heading order and keyboard reach, measured on the rendered page rather than asserted from the
// stylesheet. The effective background is resolved by walking up until an opaque one is found, because a
// transparent element inherits whatever is painted behind it and comparing against `rgba(0,0,0,0)` would
// pass everything.
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
  const view = document.getElementById('view');
  const contrast = [];
  for (const element of [view, ...view.querySelectorAll('*')]) {
    const own = [...element.childNodes].some(node => node.nodeType === 3 && node.textContent.trim().length > 1);
    if (!own) continue;
    const style = getComputedStyle(element);
    if (style.visibility === 'hidden' || style.display === 'none' || Number(style.opacity) === 0) continue;
    const size = parseFloat(style.fontSize);
    const large = size >= 24 || (size >= 18.66 && Number(style.fontWeight) >= 700);
    const value = ratio(parse(style.color).slice(0, 3), backgroundOf(element));
    if (value < (large ? 3 : 4.5)) {
      contrast.push({ tag: element.tagName.toLowerCase(), class: element.className || null,
        size, ratio: Math.round(value * 100) / 100, required: large ? 3 : 4.5,
        text: element.textContent.trim().slice(0, 50) });
    }
  }
  const headings = [...view.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(node => Number(node.tagName[1]));
  const order = [];
  headings.forEach((level, index) => {
    if (index === 0 && level !== 1) order.push(`empieza en h${level}`);
    if (index > 0 && level > headings[index - 1] + 1) order.push(`salta de h${headings[index - 1]} a h${level}`);
  });
  if (headings.filter(level => level === 1).length !== 1) order.push(`hay ${headings.filter(l => l === 1).length} encabezados h1`);
  const focusable = [...document.querySelectorAll('a[href],button,input,select,textarea,summary,[tabindex]')]
    .filter(node => !node.disabled && node.tabIndex >= 0 && node.offsetParent !== null).length;
  const terms = [...view.querySelectorAll('.term')];
  return { contrast, headingOrder: order, headings, focusable,
    terms: terms.length,
    termsReachable: terms.filter(node => node.tagName === 'BUTTON' && !node.disabled && node.tabIndex >= 0).length };
};
