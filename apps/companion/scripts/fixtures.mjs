import { zipSync, strToU8 } from 'fflate';

// Synthetic documents for acceptance fixtures.
//
// A corpus of only .txt and .md quietly narrows a check to the formats its verifier already knows how to
// read, and the two profiles the product defines as "artículos, PDF, documentos" and "imágenes, música,
// video y sus workflows" are exactly the ones that would stop being represented. These exist so a fixture
// can hold what the profile claims to hold.

// A minimal one-page PDF whose content stream is uncompressed, which is what makes it readable without a
// parser — stated wherever a measurement depends on it, because a compressed PDF would behave differently.
export function pdf(lines) {
  const stream = lines.map((text, index) => `BT /F1 12 Tf 40 ${720 - index * 24} Td (${text.replace(/[()\\]/g, '\\$&')}) Tj ET`).join('\n');
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [4 0 R] /Count 1 >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents 5 0 R >>',
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`];
  let out = '%PDF-1.4\n';
  const offsets = [];
  objects.forEach((value, index) => { offsets.push(Buffer.byteLength(out)); out += `${index + 1} 0 obj\n${value}\nendobj\n`; });
  const start = Buffer.byteLength(out);
  out += `xref\n0 6\n0000000000 65535 f \n${offsets.map(n => `${String(n).padStart(10, '0')} 00000 n \n`).join('')}` +
    `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${start}\n%%EOF`;
  return Buffer.from(out);
}

// A Word document. Its parts are deflated, so unlike the PDF above this one is genuinely opaque without a
// parser, which is the property that makes it worth having in a fixture.
export function docx(paragraphs) {
  const xml = '<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' +
    paragraphs.map(text => `<w:p><w:r><w:t>${text}</w:t></w:r></w:p>`).join('') + '</w:body></w:document>';
  return Buffer.from(zipSync({ 'word/document.xml': strToU8(xml) }));
}
