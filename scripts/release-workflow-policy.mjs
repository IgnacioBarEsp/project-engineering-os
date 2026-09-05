export const UPSTREAM_NPM_VERSION = '11.19.1';

export function checkPinnedClient(content, expectedJobs) {
  const pins = [...content.matchAll(/run: npm install --global --ignore-scripts npm@([^\s]+)\s*\n/g)];
  return pins.length === expectedJobs && pins.every((match) => match[1] === UPSTREAM_NPM_VERSION)
    ? [] : [`all ${expectedJobs} installation jobs must pin npm@${UPSTREAM_NPM_VERSION} with scripts disabled`];
}

export function checkReleaseWorkflow(content) {
  const failures = checkPinnedClient(content, 2);
  const npmJob = content.match(/^  npm:\r?\n([\s\S]*)$/m)?.[1] ?? '';

  if (!/name:\s*release-candidate[\s\S]{0,400}retention-days:\s*35\b/.test(content)) {
    failures.push('release candidate retention must cover the 30-day approval window');
  }
  if (
    !content.includes('gh release view "${{ inputs.tag }}"')
    || !content.includes('node scripts/compare-release.mjs release existing-release')
  ) {
    failures.push('existing release recovery missing');
  }
  if (!npmJob) {
    failures.push('npm job missing');
    return failures;
  }

  const required = [
    'environment: npm-publish',
    'id-token: write',
    'ref: ${{ inputs.tag }}',
    'node scripts/pack-release.mjs --output release',
    'gh release download "${{ inputs.tag }}" --dir canonical-release',
    'node scripts/compare-release.mjs release canonical-release',
    'npm publish ./canonical-release/*.tgz --access public --provenance',
  ];
  for (const contract of required) {
    if (!npmJob.includes(contract)) failures.push(`npm job missing: ${contract}`);
  }
  if (npmJob.includes('actions/download-artifact@')) {
    failures.push('npm job must recover the canonical GitHub Release, not a workflow artifact');
  }
  if (/\b(?:NPM_TOKEN|NODE_AUTH_TOKEN)\b/.test(npmJob)) {
    failures.push('npm job must not add a persistent token fallback');
  }
  return failures;
}
