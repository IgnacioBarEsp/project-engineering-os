// Pure helpers shared by the packaging script and its tests. Kept apart from pack-app.mjs so that
// importing them never starts a build.

// A lockfile key is a path, so a nested dependency reads `node_modules/npm/node_modules/tar`. Only the
// last segment is the package name; slicing the first prefix would publish names that do not exist.
export function packageNameFromKey(key) {
  const marker = 'node_modules/';
  const last = key.lastIndexOf(marker);
  return last < 0 ? key : key.slice(last + marker.length);
}

// An optional dependency for another platform is present in the lockfile and absent from a Windows
// artifact. Listing it would overstate what a person actually receives.
export function installedOnWindows(entry) {
  const platforms = entry.os, architectures = entry.cpu;
  if (Array.isArray(platforms) && !platforms.includes('win32') && !platforms.includes('!win32')) return false;
  if (Array.isArray(architectures) && !architectures.includes('x64') && !architectures.includes('!x64')) return false;
  return true;
}

export function productionPackages(lockfile) {
  const rows = new Map();
  for (const [key, value] of Object.entries(lockfile.packages)) {
    if (!key.startsWith('node_modules/') || value.dev || !value.version) continue;
    if (!installedOnWindows(value)) continue;
    const name = packageNameFromKey(key);
    rows.set(`${name}@${value.version}`, { name, version: value.version, license: value.license ?? null });
  }
  return [...rows.values()].sort((a, b) => a.name.localeCompare(b.name) || a.version.localeCompare(b.version));
}

export function renderNotices(packages, appVersion) {
  const counts = new Map();
  for (const entry of packages) {
    const license = entry.license ?? 'declared in the package';
    counts.set(license, (counts.get(license) ?? 0) + 1);
  }
  const summary = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  return [
    '# Third-party notices',
    '',
    `Project Engineering OS Companion ${appVersion} is MIT; see LICENSE. It also ships two bodies of`,
    'third-party software: the Electron runtime that executes it, and the npm packages it depends on.',
    '',
    '## Electron runtime',
    '',
    'Most of the installed bytes are the Electron runtime, which embeds Chromium, Node.js, V8 and their',
    'own dependencies. Electron is MIT. Its complete notice ships beside the executable as',
    '`LICENSE.electron.txt`, and the Chromium notices as `LICENSES.chromium.html`; both are installed',
    'next to the application and are verified to be present before publication.',
    '',
    '## Portable tools downloaded later',
    '',
    'Node, MinGit and the optional code symbol extractor are not part of this artifact. Their identities,',
    'licenses and notices are reviewed and shown before any download, and are listed in',
    '`runtime/notices/README.md`.',
    '',
    '## Local SVG icons',
    '',
    'The terminal, folder and folder-open symbols in `ui/icons.svg` and the terminal favicon are from Lucide.',
    'The terminal icon is derived from Feather. The notice for the redistributed icons follows.',
    'Source: https://github.com/lucide-icons/lucide/blob/main/LICENSE',
    '',
    'ISC License',
    '',
    'Copyright (c) 2026 Lucide Icons and Contributors',
    '',
    'Permission to use, copy, modify, and/or distribute this software for any',
    'purpose with or without fee is hereby granted, provided that the above',
    'copyright notice and this permission notice appear in all copies.',
    'THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES',
    'WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF',
    'MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR',
    'ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES',
    'WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN',
    'ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF',
    'OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.',
    '',
    'The MIT License (MIT) (for the terminal icon derived from Feather)',
    '',
    'Copyright (c) 2013-present Cole Bemis',
    'Permission is hereby granted, free of charge, to any person obtaining a copy',
    'of this software and associated documentation files (the "Software"), to deal',
    'in the Software without restriction, including without limitation the rights',
    'to use, copy, modify, merge, publish, distribute, sublicense, and/or sell',
    'copies of the Software, and to permit persons to whom the Software is',
    'furnished to do so, subject to the following conditions:',
    'The above copyright notice and this permission notice shall be included in all',
    'copies or substantial portions of the Software.',
    'THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR',
    'IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,',
    'FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE',
    'AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER',
    'LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,',
    'OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE',
    'SOFTWARE.',
    '',
    '## Packages',
    '',
    'These are the packages installed inside the artifact, with the license each one declares. Their',
    'complete license texts ship inside each package directory under `resources/app/node_modules`.',
    'Optional dependencies for other platforms are excluded because they are not installed here.',
    '',
    ...summary.map(([license, count]) => `- ${license}: ${count} package${count === 1 ? '' : 's'}`),
    '',
    '| Package | Version | License |',
    '| --- | --- | --- |',
    ...packages.map(entry => `| ${entry.name} | ${entry.version} | ${entry.license ?? 'declared in the package'} |`),
    '',
  ].join('\n');
}
