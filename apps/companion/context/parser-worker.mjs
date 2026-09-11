import { parentPort, workerData } from 'node:worker_threads';
import { Unzip, UnzipInflate } from 'fflate';
import { SaxesParser } from 'saxes';

// Receives bytes, never a project path or URL. Parsers cannot request remote font/relationship resources.
globalThis.fetch = async () => { throw new Error('NETWORK_DISABLED'); };
const { bytes, extension, limits } = workerData;
const decoder = new TextDecoder('utf-8', { fatal: true });
const result = { sections: [], issues: [] };
let textBytes = 0;
function section(text, locator) {
  text = text.replace(/\u0000/g, '').trim();
  if (!text) return;
  const size = Buffer.byteLength(text);
  if (textBytes + size > limits.textBytes) throw new Error('text-limit');
  textBytes += size;
  result.sections.push({ text, ...locator });
}

// Loading the parser modules is not part of a document's reading budget. The caller bounds start-up
// separately and only arms the per-document limit after this signal, so a cold or busy machine does
// not report a readable document as a timeout.
const ready = () => parentPort.postMessage({ ready: true });

async function pdf() {
  const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
  ready();
  const task = getDocument({ data: new Uint8Array(bytes), verbosity: 0, useWorkerFetch: false,
    disableFontFace: true, useSystemFonts: false, enableXfa: false, stopAtErrors: true,
    isOffscreenCanvasSupported: false, isImageDecoderSupported: false });
  try {
    const doc = await task.promise;
    if (doc.numPages > limits.pages) result.issues.push({ reason: 'page-limit', pages: doc.numPages });
    for (let p = 1; p <= Math.min(doc.numPages, limits.pages); p++) {
      const page = await doc.getPage(p), content = await page.getTextContent();
      const text = content.items.filter(item => typeof item.str === 'string')
        .map(item => item.str + (item.hasEOL ? '\n' : ' ')).join('');
      if (!text.trim()) result.issues.push({ reason: 'no-text-ocr-needed', page: p });
      section(text, { kind: 'page', start: p, end: p });
      page.cleanup();
    }
  } finally { await task.destroy(); }
}

function docx() {
  let count = 0, size = 0, found = false, chunks = [], failure;
  const zip = new Unzip(file => {
    if (++count > 2000) throw new Error('zip-entry-limit');
    if (file.name !== 'word/document.xml') {
      if (/^word\/(?:comments|footnotes|endnotes|header\d*|footer\d*)\.xml$/.test(file.name)
          && !result.issues.some(i=>i.reason==='docx-additional-parts-not-read')) result.issues.push({ reason: 'docx-additional-parts-not-read' });
      return;
    }
    if (found) throw new Error('duplicate-document');
    found = true;
    if (file.originalSize > limits.textBytes * 4) throw new Error('zip-size-limit');
    file.ondata = (error, data) => {
      if (error) { failure = error; return; }
      size += data.length;
      if (size > limits.textBytes * 4) throw new Error('zip-size-limit');
      chunks.push(data);
    };
    file.start();
  });
  zip.register(UnzipInflate);
  // Small compressed input slices limit a decoder callback's transient allocation.
  for (let i = 0; i < bytes.length; i += 1024) zip.push(bytes.subarray(i, i + 1024), i + 1024 >= bytes.length);
  if (failure) throw failure;
  if (!found) throw new Error('document-missing');
  const xml = decoder.decode(Buffer.concat(chunks));
  if (/<!DOCTYPE|<!ENTITY/i.test(xml)) throw new Error('unsupported-xml');
  const word = new Set(['http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'http://purl.oclc.org/ooxml/wordprocessingml/main']);
  let depth = 0, paragraph = 0, textDepth = 0, active = null, document = false, paragraphBytes = 0;
  const parsed = [], parser = new SaxesParser({ xmlns: true });
  parser.on('error', () => { throw new Error('invalid-xml'); });
  parser.on('doctype', () => { throw new Error('unsupported-xml'); });
  parser.on('opentag', tag => {
    if (++depth > 128) throw new Error('xml-depth-limit');
    const isWord = word.has(tag.uri);
    if (depth === 1) { document = isWord && tag.local === 'document'; if (!document) throw new Error('unsupported-xml'); }
    if (isWord && tag.local === 'p') {
      if (active) throw new Error('unsupported-nested-paragraph');
      active = { number: ++paragraph, text: '' }; paragraphBytes = 0;
    }
    if (active && isWord && tag.local === 't') textDepth++;
    if (active && isWord && ['tab','br'].includes(tag.local)) active.text += ' ';
    if (isWord && ['drawing','pict','object'].includes(tag.local) && !result.issues.some(i=>i.reason==='docx-nontext-content')) result.issues.push({ reason: 'docx-nontext-content' });
  });
  const text = value => {
    if (active && textDepth) {
      paragraphBytes += Buffer.byteLength(value);
      if (paragraphBytes > limits.textBytes) throw new Error('text-limit');
      active.text += value;
    }
  };
  parser.on('text', text); parser.on('cdata', text);
  parser.on('closetag', tag => {
    if (word.has(tag.uri)) {
      if (tag.local === 't' && active) textDepth--;
      if (tag.local === 'p' && active) { parsed.push(active); active = null; }
    }
    depth--;
  });
  parser.write(xml).close();
  if (!document) throw new Error('unsupported-xml');
  // Commit text only after the entire XML document was structurally validated.
  for (const p of parsed) section(p.text, { kind: 'paragraph', start: p.number, end: p.number });
  if (!result.sections.length) result.issues.push({ reason: 'no-text' });
}

try {
  if (extension === '.pdf') await pdf();
  else if (extension === '.docx') { ready(); docx(); }
  else {
    ready();
    const text = decoder.decode(bytes);
    if (text.includes('\u0000')) throw new Error('binary-or-unsupported-encoding');
    text.split(/\r\n|\n|\r/).forEach((line, i) => section(line, { kind: 'line', start: i + 1, end: i + 1 }));
    if (!result.sections.length) result.issues.push({ reason: 'no-text' });
  }
} catch (error) {
  const reason = error.name === 'PasswordException' ? 'password-required'
    : ['text-limit','zip-entry-limit','zip-size-limit','duplicate-document','document-missing',
      'unsupported-xml','invalid-xml','xml-depth-limit','unsupported-nested-paragraph','binary-or-unsupported-encoding'].includes(error.message) ? error.message : 'unreadable-document';
  result.issues.push({ reason });
}
parentPort.postMessage(result);
