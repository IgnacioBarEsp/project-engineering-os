import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { portable } from './portable-path.mjs';

// Checks the landing page in a real browser: that it makes no external request, that its structure and
// contrast are usable, and that it reflows without horizontal scrolling down to a narrow viewport.
// It does not certify WCAG conformance: an automated pass is not an accessibility audit, and this
// records what was checked rather than claiming what was not.
const [pageArgument, output] = process.argv.slice(2);
const page = path.resolve(pageArgument ?? path.join(fileURLToPath(new URL('../../../site/', import.meta.url)), 'index.html'));
const evidence = output ? path.resolve(output) : null;
if (evidence) await mkdir(evidence, { recursive: true });
const pw = await import(process.env.PROJECT_OS_PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PROJECT_OS_PLAYWRIGHT_MODULE).href : 'playwright');
const { chromium } = pw.default ?? pw;

const html = await readFile(page, 'utf8');
const server = createServer((request, response) => {
  if (request.url !== '/' && request.url !== '/index.html') { response.writeHead(404); response.end(); return; }
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  response.end(html);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const url = `http://127.0.0.1:${server.address().port}/`;

// Relative luminance and contrast, from the sRGB definition used by the accessibility guidelines.
const channel = value => { const c = value / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const luminance = ([r, g, b]) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
const contrast = (a, b) => { const l1 = luminance(a), l2 = luminance(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };
const parse = value => {
  const channels = (value.match(/\d+(\.\d+)?/g) ?? []).map(Number);
  // Alpha would change the colour the reader actually sees, and this calculation composites nothing.
  // Refusing is honest; silently dropping the fourth channel would publish a ratio nobody experiences.
  assert.ok(channels.length < 4 || channels[3] === 1, `Color con transparencia sin componer: ${value}`);
  return channels.slice(0, 3);
};

const repository = path.resolve(fileURLToPath(new URL('../../../', import.meta.url)));
const report = { date: new Date().toISOString(), page: portable(page, [['<repo>', repository]]),
  checks: [], widths: [], contrast: [], requests: [] };
let browser;
try {
  browser = await chromium.launch({ ...(process.platform === 'win32' ? { channel: 'msedge' } : {}), headless: true });
  const context = await browser.newContext({ viewport: { width: 1180, height: 900 }, reducedMotion: 'reduce' });
  const tab = await context.newPage();
  const external = [], errors = [];
  tab.on('request', request => { if (!request.url().startsWith(url)) external.push(request.url()); });
  tab.on('pageerror', error => errors.push(error.message));
  await tab.goto(url, { waitUntil: 'networkidle' });

  // No external request at all: no font service, no analytics, no image host.
  assert.deepEqual(external, [], `La página pidió recursos externos: ${external.join(', ')}`);
  assert.deepEqual(errors, [], `La página produjo errores: ${errors.join(', ')}`);
  report.requests = ['solo el documento local'];
  report.checks.push('Ninguna petición externa: sin fuentes remotas, sin analítica, sin imágenes de terceros.');

  const structure = await tab.evaluate(() => {
    const headings = [...document.querySelectorAll('h1,h2,h3')].map(node => ({ level: Number(node.tagName[1]), text: node.textContent.trim().slice(0, 60) }));
    return {
      title: document.title, lang: document.documentElement.lang,
      description: document.querySelector('meta[name="description"]')?.content ?? null,
      h1: document.querySelectorAll('h1').length,
      headings,
      landmarks: { header: document.querySelectorAll('header').length, main: document.querySelectorAll('main').length, footer: document.querySelectorAll('footer').length },
      skipLink: document.querySelector('.skip')?.getAttribute('href') ?? null,
      imagesWithoutText: [...document.querySelectorAll('img,svg')].filter(node => !node.getAttribute('alt') && !node.getAttribute('aria-label') && node.getAttribute('role') !== 'presentation').length,
      links: [...document.querySelectorAll('a')].map(node => ({ text: node.textContent.trim(), href: node.getAttribute('href') })),
      tableHasCaptionAndHeaders: Boolean(document.querySelector('table caption')) && document.querySelectorAll('table th[scope]').length > 0,
      scripts: document.querySelectorAll('script').length,
    };
  });
  assert.equal(structure.lang, 'es');
  assert.equal(structure.h1, 1, 'La página debe tener un solo encabezado principal.');
  assert.ok(structure.description && structure.description.length > 60);
  assert.equal(structure.landmarks.main, 1);
  assert.equal(structure.skipLink, '#contenido');
  assert.equal(structure.imagesWithoutText, 0, 'Hay una imagen sin texto alternativo.');
  assert.equal(structure.scripts, 0, 'La página no necesita JavaScript para leerse.');
  assert.ok(structure.tableHasCaptionAndHeaders, 'La tabla necesita título y encabezados con alcance.');
  for (const link of structure.links) {
    assert.ok(link.text.length >= 4, `Un enlace no dice a dónde lleva: "${link.text}"`);
    assert.ok(!/aquí|aqui|click|leer más/i.test(link.text), `Un enlace usa un texto vacío de significado: "${link.text}"`);
  }
  let previous = 0;
  for (const heading of structure.headings) {
    assert.ok(heading.level <= previous + 1, `El orden de encabezados salta un nivel en "${heading.text}"`);
    previous = heading.level;
  }
  report.checks.push(`Estructura: un h1, ${structure.headings.length} encabezados sin saltos, landmarks, enlace para saltar al contenido, tabla con título y encabezados, y cero scripts.`);

  // The skip link must actually move focus into the content.
  await tab.keyboard.press('Tab');
  const focusedFirst = await tab.evaluate(() => document.activeElement?.className ?? '');
  assert.ok(focusedFirst.includes('skip'), 'El primer tabulador debe llegar al enlace para saltar al contenido.');
  await tab.keyboard.press('Enter');
  const target = await tab.evaluate(() => location.hash);
  assert.equal(target, '#contenido');
  const focusRing = await tab.evaluate(() => {
    const node = document.querySelector('.skip');
    node.focus();
    const style = getComputedStyle(node);
    return { outlineWidth: style.outlineWidth, outlineStyle: style.outlineStyle };
  });
  assert.notEqual(focusRing.outlineStyle, 'none', 'El foco debe ser visible.');
  report.checks.push('Teclado: el primer tabulador llega al salto de contenido, activa el destino y el foco es visible.');

  // Contrast for the text sizes actually used, in both colour schemes. The page ships a full dark
  // palette, so measuring only the light one would leave half of what readers see unchecked.
  const SELECTORS = ['.hero h1', '.hero p', '.hero .note', '.lead', '.card p', '.claim li', 'td', '.foot',
    'footer p', '.button-main'];
  async function measureContrast(scheme) {
    await tab.emulateMedia({ colorScheme: scheme });
    const samples = await tab.evaluate(selectors => {
      // querySelectorAll, not querySelector: the first `.claim li` sits on a different ground than the
      // ones inside `.claim.plain`, and reporting only the first would publish a worst case that is not
      // the worst case.
      const every = selector => [...document.querySelectorAll(selector)].map((node, order) => {
        const style = getComputedStyle(node);
        let background = node, backgroundColor = getComputedStyle(background).backgroundColor;
        while (/, 0\)$/.test(backgroundColor) && background.parentElement) { background = background.parentElement; backgroundColor = getComputedStyle(background).backgroundColor; }
        return { selector, order, color: style.color, background: backgroundColor, size: parseFloat(style.fontSize), weight: style.fontWeight };
      });
      return selectors.flatMap(every).filter(Boolean);
    }, SELECTORS);
    const worst = new Map();
    for (const sample of samples) {
      const ratio = Number(contrast(parse(sample.color), parse(sample.background)).toFixed(2));
      const large = sample.size >= 24 || (sample.size >= 18.66 && Number(sample.weight) >= 700);
      const required = large ? 3 : 4.5;
      assert.ok(ratio >= required,
        `Contraste insuficiente en modo ${scheme}, ${sample.selector} #${sample.order}: ${ratio} frente a ${required}`);
      const kept = worst.get(sample.selector);
      if (!kept || ratio < kept.ratio) worst.set(sample.selector, { scheme, selector: sample.selector, ratio, size: sample.size, required, measured: 0 });
    }
    for (const sample of samples) worst.get(sample.selector).measured += 1;
    return { scheme, nodes: samples.length, worst: [...worst.values()] };
  }
  const light = await measureContrast('light');
  const dark = await measureContrast('dark');
  await tab.emulateMedia({ colorScheme: 'light' });
  report.contrast = [...light.worst, ...dark.worst];
  const minimum = Math.min(...report.contrast.map(entry => entry.ratio));
  report.checks.push(`Contraste: ${light.nodes + dark.nodes} nodos de texto medidos en los dos esquemas de color; se publica el peor de cada combinación y el peor de todos es ${minimum}.`);

  // Reflow without horizontal scrolling, including the narrowest width the desktop app supports.
  // Checking documentElement.scrollWidth alone is not enough: a container with `overflow:hidden` clips
  // its overflowing children, so the page reports no scroll while text sits outside the viewport. Every
  // element that carries its own text is measured against the viewport as well.
  const clipped = () => {
    // Text that leaves the viewport is only a defect when the reader cannot get to it. Inside an
    // ancestor that scrolls on its own — the table in its `overflow-x:auto` wrapper — it is reachable
    // and intended. Inside one that hides its overflow, or inside none at all, it is lost.
    const reachable = node => {
      for (let parent = node.parentElement; parent; parent = parent.parentElement) {
        const overflow = getComputedStyle(parent).overflowX;
        if (overflow === 'auto' || overflow === 'scroll') return true;
        if (overflow === 'hidden' || overflow === 'clip') return false;
      }
      return false;
    };
    return [...document.querySelectorAll('body *')]
      .filter(node => [...node.childNodes].some(child => child.nodeType === 3 && child.textContent.trim().length > 0))
      .filter(node => { const rect = node.getBoundingClientRect(); return rect.right > innerWidth + 1 || rect.left < -1; })
      .filter(node => !reachable(node))
      .map(node => {
        const rect = node.getBoundingClientRect();
        return { tag: node.tagName.toLowerCase(), cls: node.className?.toString?.().slice(0, 40) ?? '',
          left: Math.round(rect.left), right: Math.round(rect.right) };
      });
  };

  for (const width of [1180, 1024, 768, 480, 360, 240]) {
    await tab.setViewportSize({ width, height: width <= 360 ? 640 : 900 });
    const size = await tab.evaluate(() => ({ inner: innerWidth, scroll: document.documentElement.scrollWidth }));
    assert.ok(size.scroll <= size.inner + 1, `Desbordamiento horizontal a ${width}px: ${JSON.stringify(size)}`);
    const outside = await tab.evaluate(clipped);
    assert.deepEqual(outside, [], `Texto fuera de la ventana a ${width}px pese a no haber barra: ${JSON.stringify(outside)}`);
    report.widths.push(width);
  }
  // At 200% zoom the text must still reflow rather than clip.
  await tab.setViewportSize({ width: 640, height: 900 });
  await tab.evaluate(() => { document.documentElement.style.fontSize = '32px'; });
  const zoomed = await tab.evaluate(() => ({ inner: innerWidth, scroll: document.documentElement.scrollWidth }));
  assert.ok(zoomed.scroll <= zoomed.inner + 1, `Desbordamiento con texto al doble de tamaño: ${JSON.stringify(zoomed)}`);
  const zoomedOutside = await tab.evaluate(clipped);
  assert.deepEqual(zoomedOutside, [], `Texto fuera de la ventana con el texto al doble: ${JSON.stringify(zoomedOutside)}`);
  await tab.evaluate(() => { document.documentElement.style.fontSize = ''; });
  report.checks.push('Reflujo en 1180, 1024, 768, 480, 360 y 240 px y con el texto al doble de tamaño: ni barra horizontal ni texto fuera de la ventana, incluido dentro de contenedores recortados.');

  if (evidence) {
    // Capture the default state: the focus ring belongs in the keyboard check, not in the evidence
    // a reader will take as how the page looks.
    await tab.evaluate(() => document.activeElement?.blur());
    // One location only. Writing beside the records as well left two copies of every capture, and a
    // reader had no way to tell which pair was current.
    const shots = path.join(evidence, 'screenshots');
    await mkdir(shots, { recursive: true });
    await tab.setViewportSize({ width: 1180, height: 900 });
    await tab.screenshot({ path: path.join(shots, 'landing-1180.png'), fullPage: true });
    await tab.setViewportSize({ width: 380, height: 820 });
    await tab.screenshot({ path: path.join(shots, 'landing-380.png'), fullPage: true });
    report.screenshots = ['screenshots/landing-1180.png', 'screenshots/landing-380.png'];
  }

  // The page must not claim what the repository cannot evidence.
  const text = await tab.evaluate(() => document.body.innerText);
  for (const forbidden of [/\b\d+\s*%\s*(menos|más|mas)\b/i, /miles de (usuarios|personas|equipos)/i,
    /cientos de (usuarios|personas|equipos)/i, /sin alucinaciones/i, /menos alucinaciones/i,
    /reduce (los )?tokens/i, /ahorro de tokens/i, /menos tokens/i, /\bla mitad del contexto\b/i,
    /\b\d+\s*x\b(?!\s*\d)/i, /\bel mejor\b/i, /\bla mejor\b/i, /\bl[íi]der\b/i,
    /\b(más|mas) r[áa]pido que\b/i, /garantizad[oa]/i]) {
    assert.ok(!forbidden.test(text), `La página afirma algo que no se puede respaldar: ${forbidden}`);
  }
  for (const [label, rule] of [
    ['que la aplicación no está firmada', /no est[áa] firmada/i],
    ['que no se mide el consumo de tokens', /no se mide el consumo de tokens/i],
    ['que no se afirma nada sobre alucinaciones', /no se afirma nada sobre alucinaciones/i],
    ['que los recorridos publicados no los hizo una persona usuaria', /persona usuaria[\s\S]{0,40}no un estudio/i],
    ['que se probó en un solo equipo', /no demuestra compatibilidad en otros/i],
    ['que un barrido literal responde las mismas ocho', /barrido literal responde ocho de diez/i],
    ['que el PDF del corpus va sin comprimir', /sin comprimir/i],
    ['que no se afirma superioridad sobre un barrido literal', /no se afirma superioridad/i],
    ['dónde la línea base es más barata', /grep/i],
  ]) {
    assert.ok(rule.test(text), `La página debe declarar ${label}.`);
  }
  // Every number the page publishes must reconcile with the raw measurement. A page that drifts from
  // its own evidence is worse than a page with no numbers.
  // The raw measurement moves when the change is archived, and this check runs in CI both before and
  // after that. Look in the active change and in the archive, and say which was used rather than
  // failing on a path that was correct last week.
  const CHANGE = 'validate-companion-journeys';
  const changes = path.join(repository, 'openspec', 'changes');
  const archived = await readdir(path.join(changes, 'archive')).catch(() => []);
  const candidates = [process.argv[4],
    path.join(changes, CHANGE, 'evidence', 'benchmark.json'),
    ...archived.filter(name => name.endsWith(CHANGE))
      .map(name => path.join(changes, 'archive', name, 'evidence', 'benchmark.json'))].filter(Boolean);
  let measurement = null, measurementFrom = null;
  for (const candidate of candidates) {
    const raw = await readFile(path.resolve(candidate), 'utf8').catch(() => null);
    if (raw === null) continue;
    measurement = JSON.parse(raw); measurementFrom = path.resolve(candidate); break;
  }
  assert.ok(measurement, `No se encontro la medicion cruda. Rutas probadas: ${candidates.join(', ')}`);
  report.measurement = portable(measurementFrom, [['<repo>', repository]]);
  // Reconciling by stripping whitespace out of the page is the wrong way round: in the rendered text a
  // cell boundary is also whitespace between digits, so "68 120<tab>6812" would collapse into one run
  // and stop containing either number. Instead the expected number is turned into a pattern that
  // tolerates thousands grouping, and the page text is left exactly as the reader sees it.
  const escape = value => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const grouped = value => {
    const [whole, fraction] = String(value).split('.');
    const parts = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ' ').split(' ').map(escape);
    // A single optional separator between groups; never \s, which would swallow a tab and weld cells.
    return parts.join('[   ]?') + (fraction === undefined ? '' : `[.,]${escape(fraction)}`);
  };
  const publishesNumber = value => new RegExp(`(?<![\\d.,])${grouped(value)}(?![\\d])`).test(text);
  const publishes = value => text.includes(value);
  const row = id => measurement.methods.find(entry => entry.id === id);
  for (const [id, label] of [['read-all', 'Abrir todo'], ['literal-scan', 'Barrido literal'], ['prepared-context', 'Contexto preparado']]) {
    const method = row(id);
    assert.ok(method, `La medicion no contiene el metodo ${id}.`);
    assert.ok(publishes(`${method.answerInReturnedText} / 10`), `La pagina no publica "${method.answerInReturnedText} / 10" para ${label}.`);
    assert.ok(publishesNumber(method.contextBytesTotal), `La pagina no publica los bytes devueltos de ${label}: ${method.contextBytesTotal}`);
    assert.ok(publishesNumber(method.bytesReadPerQuestion), `La pagina no publica los bytes leidos de ${label}: ${method.bytesReadPerQuestion}`);
    // The locator column is a kind, not a score, since every method here carries one.
    const kinds = { file: 'archivo', 'file-line': 'archivo:línea', passage: 'pasaje' };
    assert.ok(publishes(kinds[method.locatorKind]),
      `La pagina no publica el tipo de localizador de ${label}: ${method.locatorKind}`);
  }
  assert.ok(publishesNumber(measurement.corpus.bytes), 'La pagina no publica el tamano real del corpus.');
  assert.ok(publishesNumber(measurement.preparation.elapsedMs), 'La pagina no publica el tiempo real de preparacion.');
  assert.ok(publishesNumber(measurement.preparation.bytesWritten), 'La pagina no publica los bytes reales que escribio la preparacion.');
  // The corrected result must be on the page, not only in the raw file: the baseline is not behind.
  assert.equal(row('literal-scan').answerInReturnedText, row('read-all').answerInReturnedText,
    'La medicion cambio: revisa el texto publicado antes de volver a afirmar que ambas lineas base empatan.');
  report.checks.push('Cifras: cada número publicado reconcilia con benchmark.json, incluido el costo de preparar.');

  report.checks.push('Afirmaciones: ninguna cifra de adopción, porcentaje, promesa sobre tokens o alucinaciones; declara la falta de firma y dónde la línea base es más barata.');
  report.bytes = Buffer.byteLength(html);
  report.limits = [
    'Una comprobación automática no es una auditoría de accesibilidad ni certifica conformidad.',
    'No se probó con un lector de pantalla real ni con personas usuarias.',
    'Se midió en un navegador basado en Chromium; otros motores pueden diferir.',
  ];
  if (evidence) await writeFile(path.join(evidence, 'landing.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ status: 'PASS', bytes: report.bytes, widths: report.widths,
    minimumContrast: Math.min(...report.contrast.map(entry => entry.ratio)), checks: report.checks }, null, 2));
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
