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
  const allows = (constraints, target) => {
    if (!Array.isArray(constraints)) return true;
    if (constraints.includes(`!${target}`)) return false;
    const positives = constraints.filter((value) => (
      typeof value === 'string' && !value.startsWith('!')
    ));
    return positives.length === 0 || positives.includes(target);
  };
  return allows(entry.os, 'win32') && allows(entry.cpu, 'x64');
}

function dependencyMap(record, field) {
  const value = record?.[field];
  if (value === undefined) return {};
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`invalid ${field} map`);
  }
  return value;
}

function peerDependencyMeta(record) {
  const value = record?.peerDependenciesMeta;
  if (value === undefined) return {};
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('invalid peerDependenciesMeta map');
  }
  for (const [name, metadata] of Object.entries(value)) {
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)
      || (Object.hasOwn(metadata, 'optional') && typeof metadata.optional !== 'boolean')) {
      throw new Error(`invalid peerDependenciesMeta entry: ${name}`);
    }
  }
  return value;
}

export function isOptionalPeer(record, name) {
  return peerDependencyMeta(record)[name]?.optional === true;
}

function resolvePackageKey(packages, parentKey, dependencyName) {
  let ancestor = parentKey;
  while (ancestor) {
    const candidate = `${ancestor}/node_modules/${dependencyName}`;
    if (Object.hasOwn(packages, candidate)) return candidate;
    const marker = ancestor.lastIndexOf('/node_modules/');
    if (marker < 0) break;
    ancestor = ancestor.slice(0, marker);
  }
  const rootCandidate = `node_modules/${dependencyName}`;
  return Object.hasOwn(packages, rootCandidate) ? rootCandidate : null;
}

export function productionPackages(lockfile, { windowsOnly = true } = {}) {
  const lockPackages = lockfile?.packages;
  if (!lockPackages || typeof lockPackages !== 'object' || Array.isArray(lockPackages)) {
    throw new Error('invalid package lock inventory');
  }
  const rootPackage = lockPackages[''];
  if (!rootPackage || typeof rootPackage !== 'object' || Array.isArray(rootPackage)) {
    throw new Error('package lock root entry missing or invalid');
  }
  peerDependencyMeta(rootPackage);
  const pending = [];
  for (const field of ['dependencies', 'optionalDependencies', 'peerDependencies']) {
    for (const name of Object.keys(dependencyMap(rootPackage, field))) {
      pending.push({
        parentKey: '',
        name,
        optional: field === 'optionalDependencies'
          || (field === 'peerDependencies' && isOptionalPeer(rootPackage, name)),
      });
    }
  }
  const rows = new Map();
  const visited = new Set();
  while (pending.length > 0) {
    const { parentKey, name, optional } = pending.pop();
    const key = resolvePackageKey(lockPackages, parentKey, name);
    if (!key) {
      if (optional) continue;
      throw new Error(`production dependency lock entry missing: ${name}`);
    }
    if (visited.has(key)) continue;
    visited.add(key);
    const value = lockPackages[key];
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new Error(`invalid production dependency lock entry: ${name}`);
    }
    if (value.link === true) throw new Error(`linked production dependency is unsupported: ${name}`);
    if (windowsOnly && !installedOnWindows(value)) continue;
    const packageName = packageNameFromKey(key);
    const version = typeof value.version === 'string' && value.version.length > 0
      ? value.version
      : null;
    rows.set(`${packageName}@${version ?? 'missing-version'}`, {
      name: packageName,
      version,
      license: value.license ?? null,
    });
    for (const field of ['dependencies', 'optionalDependencies', 'peerDependencies']) {
      for (const childName of Object.keys(dependencyMap(value, field))) {
        pending.push({
          parentKey: key,
          name: childName,
          optional: field === 'optionalDependencies'
            || (field === 'peerDependencies' && isOptionalPeer(value, childName)),
        });
      }
    }
  }
  return [...rows.values()].sort((a, b) => a.name.localeCompare(b.name)
    || String(a.version ?? '').localeCompare(String(b.version ?? '')));
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
