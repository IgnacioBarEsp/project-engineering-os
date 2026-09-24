export const SUPPORTED_NODE_RANGE = '^22.22.0 || ^24.18.0';

const STABLE_NODE_VERSION = /^v?(22|24)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;

export function isSupportedNode(actual) {
  const match = String(actual).match(STABLE_NODE_VERSION);
  if (!match) return false;
  const major = Number(match[1]);
  const minor = Number(match[2]);
  const patch = Number(match[3]);
  if (![major, minor, patch].every(Number.isSafeInteger)) return false;
  return (major === 22 && minor >= 22) || (major === 24 && minor >= 18);
}

export function supportedNodeRemediation() {
  return 'Active Node 22.22.0 o posterior dentro de Node 22, o Node 24.18.0 o posterior dentro de Node 24 (recomendado), y vuelva a ejecutar.';
}

export function unsupportedNodeCause(version) {
  return `Node ${version} no cumple ${SUPPORTED_NODE_RANGE}. Node 20 llegó a fin de vida el 2026-04-30; use Node 22.22.0+ o Node 24.18.0+ (recomendado).`;
}
