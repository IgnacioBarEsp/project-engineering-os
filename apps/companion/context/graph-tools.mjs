import { lstat } from 'node:fs/promises';
import { canonicalFolder, assertPath, fail } from '../engine/files.mjs';

// A reviewed catalog and presence check; it does not execute or trust code found in the project.
const CANDIDATES = [
  { id: 'codegraph', package: '@colbymchenry/codegraph', version: '1.6.0', license: 'MIT',
    homepage: 'https://github.com/colbymchenry/codegraph', artifact: '.codegraph', profiles: ['software','unity'],
    decision: 'candidate-for-structural-code', activation: 'pending-runtime-and-query-verification',
    processEnvironment: { DO_NOT_TRACK: '1', CODEGRAPH_TELEMETRY: '0', CODEGRAPH_NO_UPDATE_CHECK: '1' } },
  { id: 'graphify', package: 'graphifyy', version: null, observedVersion: '0.9.56', license: 'Apache-2.0',
    homepage: 'https://github.com/Graphify-Labs/graphify', artifact: 'graphify-out', profiles: ['research','software','unity','media','general'],
    decision: 'optional-mixed-corpus-evaluation', activation: 'pending-extras-runtime-and-query-verification' },
  { id: 'gitnexus', package: 'gitnexus', version: '1.6.10', license: 'PolyForm-Noncommercial-1.0.0',
    homepage: 'https://github.com/abhigyanpatwari/GitNexus', artifact: '.gitnexus', profiles: ['software','unity'],
    decision: 'conditional-permitted-use', activation: 'pending-license-runtime-and-query-verification' },
];
export async function graphOptions(target, profile) {
  if (!['research','software','unity','media','general'].includes(profile)) fail('PROFILE_INVALID', 'Elige un perfil válido.');
  const root = await canonicalFolder(target), options = [];
  for (const candidate of CANDIDATES.filter(c=>c.profiles.includes(profile))) {
    let presence = 'absent';
    try {
      const absolute = await assertPath(root, candidate.artifact), stat = await lstat(absolute);
      presence = stat.isDirectory() ? 'artifact-present' : 'unexpected-artifact';
    } catch (error) {
      if (error.code === 'LINK_REJECTED') presence = 'link-rejected';
      else if (error.code !== 'ENOENT') throw error;
    }
    options.push({ ...structuredClone(candidate), presence, status: 'not-verified', activated: false });
  }
  return { baseline: { id: 'local-lexical', scope: 'text-and-document-sources', requiresAccount: false }, options };
}
