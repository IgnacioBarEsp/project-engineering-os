import os from 'node:os';
import path from 'node:path';

// Evidence files are committed and public. A raw absolute path carries the account name of whoever ran
// the check, and the documentation tells everyone else to keep absolute paths out of version control,
// so the records this repository publishes have to follow the same rule. Paths are anchored to the
// location that gives them meaning and the machine-specific prefix is dropped, which also makes two
// runs on two machines comparable instead of merely different.

const canonical = value => path.resolve(value).replace(/\\/g, '/');

const MACHINE_ANCHORS = [['<temp>', os.tmpdir()], ['<localappdata>', process.env.LOCALAPPDATA],
  ['<home>', os.homedir()]];

function anchors(extra) {
  return [...extra, ...MACHINE_ANCHORS]
    .filter(([, base]) => typeof base === 'string' && base.length > 0)
    .map(([label, base]) => [label, canonical(base)])
    // Longest first: on Windows the temporary directory lives inside the home directory, and anchoring
    // to the home directory first would hide which of the two a path actually belongs to.
    .sort((left, right) => right[1].length - left[1].length);
}

export function portable(value, extra = []) {
  if (typeof value !== 'string' || value.length === 0) return value;
  const resolved = canonical(value);
  const lowered = resolved.toLowerCase();
  for (const [label, base] of anchors(extra)) {
    const lowest = base.toLowerCase();
    if (lowered === lowest) return label;
    if (lowered.startsWith(`${lowest}/`)) return label + resolved.slice(base.length);
  }
  return resolved;
}

export default portable;
