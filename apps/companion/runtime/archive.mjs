import { createReadStream, createWriteStream } from 'node:fs';
import { mkdir, lstat } from 'node:fs/promises';
import path from 'node:path';
import { createInflateRaw } from 'node:zlib';
import { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { assertPath, canonicalFolder, fail, readBounded } from '../engine/files.mjs';

const bad = () => fail('ARCHIVE_UNSAFE', 'El paquete contiene entradas no admitidas.', 'No se activó la herramienta. Reintenta con el paquete oficial verificado.');
const crcTable = Array.from({ length: 256 }, (_, n) => {
  for (let k = 0; k < 8; k++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
  return n >>> 0;
});
export function safeArchivePath(name) {
  if (typeof name !== 'string' || name.length > 512 || /[\\:\x00-\x1f\x7f<>"|?*]/.test(name) || name.startsWith('/')) bad();
  const plain = name.endsWith('/') ? name.slice(0, -1) : name;
  if (!plain || plain.split('/').some(p => !p || p === '.' || p === '..' || /[. ]$/.test(p)
    || /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(p))) bad();
  return plain;
}

// Parse every central/local header before creating any output. Only ordinary ZIP (not ZIP64,
// encrypted, multipart or special files) is needed by the pinned portable distributions.
export function inspectZip(bytes, { maxEntries = 10000, maxExpandedBytes = 600 * 1024 * 1024, maxFileBytes = 128 * 1024 * 1024 } = {}) {
  const b = Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const range = (offset, size) => { if (!Number.isSafeInteger(offset) || offset < 0 || offset + size > b.length) bad(); };
  const u16 = at => { range(at, 2); return b.readUInt16LE(at); };
  const u32 = at => { range(at, 4); return b.readUInt32LE(at); };
  let end = -1;
  for (let i = b.length - 22; i >= Math.max(0, b.length - 65557); i--) {
    if (u32(i) === 0x06054b50 && i + 22 + u16(i + 20) === b.length) { end = i; break; }
  }
  if (end < 0 || u16(end + 4) || u16(end + 6) || u16(end + 8) !== u16(end + 10)) bad();
  const count = u16(end + 10), centralSize = u32(end + 12), central = u32(end + 16);
  if (!count || count > maxEntries || count === 0xffff || central + centralSize !== end) bad();
  const names = new Map(), entries = [], ranges = [];
  let cursor = central, total = 0;
  for (let i = 0; i < count; i++) {
    if (u32(cursor) !== 0x02014b50) bad();
    const flags = u16(cursor + 8), method = u16(cursor + 10), crc = u32(cursor + 16);
    const compressed = u32(cursor + 20), expanded = u32(cursor + 24), nameSize = u16(cursor + 28);
    const extraSize = u16(cursor + 30), commentSize = u16(cursor + 32), external = u32(cursor + 38), local = u32(cursor + 42);
    // UTF-8, data descriptor and deflate speed bits only. Names in older ZIPs must be ASCII.
    if (flags & ~0x080e || ![0, 8].includes(method) || u16(cursor + 34) || compressed === 0xffffffff
      || expanded > maxFileBytes || (total += expanded) > maxExpandedBytes) bad();
    range(cursor + 46, nameSize + extraSize + commentSize);
    const rawName = b.subarray(cursor + 46, cursor + 46 + nameSize);
    if (!(flags & 0x800) && rawName.some(v => v > 127)) bad();
    let name; try { name = new TextDecoder('utf-8', { fatal: true }).decode(rawName); } catch { bad(); }
    const relative = safeArchivePath(name), directory = name.endsWith('/'), kind = (external >>> 16) & 0xf000;
    if (![0, directory ? 0x4000 : 0x8000].includes(kind) || (external & 0x400) || (!!(external & 16) && !directory)
      || (directory && expanded !== 0)) bad();
    const key = relative.toLowerCase(); if (names.has(key)) bad(); names.set(key, directory);
    if (u32(local) !== 0x04034b50 || u16(local + 6) !== flags || u16(local + 8) !== method) bad();
    const localNameSize = u16(local + 26), localExtraSize = u16(local + 28), dataOffset = local + 30 + localNameSize + localExtraSize;
    range(local + 30, localNameSize + localExtraSize);
    if (!b.subarray(local + 30, local + 30 + localNameSize).equals(rawName) || dataOffset + compressed > central) bad();
    if (!(flags & 8) && (u32(local + 14) !== crc || u32(local + 18) !== compressed || u32(local + 22) !== expanded)) bad();
    if (method === 0 && compressed !== expanded) bad();
    ranges.push([local, dataOffset + compressed]);
    entries.push({ name, relative, directory, method, crc, compressed, expanded, dataOffset });
    cursor += 46 + nameSize + extraSize + commentSize;
  }
  if (cursor !== end) bad();
  ranges.sort((a, b) => a[0] - b[0]);
  for (let i = 1; i < ranges.length; i++) if (ranges[i][0] < ranges[i - 1][1]) bad();
  for (const key of names.keys()) {
    const parts = key.split('/'); parts.pop();
    while (parts.length) { if (names.get(parts.join('/')) === false) bad(); parts.pop(); }
  }
  return entries;
}

export async function extractZip(archive, target, { signal, select = name => name, maxArchiveBytes = 64 * 1024 * 1024, ...limits } = {}) {
  signal?.throwIfAborted();
  const stat = await lstat(archive);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.nlink !== 1 || stat.size > maxArchiveBytes) bad();
  const entries = inspectZip(await readBounded(archive, maxArchiveBytes), limits), selected = [], seen = new Set();
  for (const entry of entries) {
    const output = select(entry.name); if (output === null) continue;
    const relative = safeArchivePath(output), key = relative.toLowerCase();
    if (seen.has(key)) bad(); seen.add(key); selected.push({ ...entry, relative });
  }
  // Destination must be exclusively created here; partial output is never an active runtime.
  await mkdir(target); const root = await canonicalFolder(target);
  for (const entry of selected) {
    signal?.throwIfAborted();
    const destination = await assertPath(root, entry.relative);
    if (entry.directory) { await mkdir(destination, { recursive: true }); continue; }
    await mkdir(path.dirname(destination), { recursive: true }); await assertPath(root, entry.relative);
    let used = 0, crc = 0xffffffff;
    const check = new Transform({ transform(chunk, _encoding, callback) {
      used += chunk.length;
      if (used > entry.expanded) { callback(new Error('ARCHIVE_EXPANSION_LIMIT')); return; }
      for (const byte of chunk) crc = crcTable[(crc ^ byte) & 255] ^ (crc >>> 8);
      callback(null, chunk);
    } });
    const output = createWriteStream(destination, { flags: 'wx', mode: 0o600 });
    if (entry.compressed === 0) { output.end(); await new Promise((resolve, reject) => { output.on('close', resolve); output.on('error', reject); }); }
    else {
      const input = createReadStream(archive, { start: entry.dataOffset, end: entry.dataOffset + entry.compressed - 1 });
      await pipeline(...[input, entry.method === 8 ? createInflateRaw() : null, check, output].filter(Boolean), { signal });
    }
    if (used !== entry.expanded || ((crc ^ 0xffffffff) >>> 0) !== entry.crc) bad();
  }
  return { files: selected.filter(e => !e.directory).length, bytes: selected.reduce((n, e) => n + e.expanded, 0) };
}
