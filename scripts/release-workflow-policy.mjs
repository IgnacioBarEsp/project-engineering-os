export const UPSTREAM_NPM_VERSION = '11.19.1';

export function checkPinnedClient(content, expectedJobs) {
  const pins = [...content.matchAll(/run: npm install --global --ignore-scripts npm@([^\s]+)\s*\n/g)];
  return pins.length === expectedJobs && pins.every((match) => match[1] === UPSTREAM_NPM_VERSION)
    ? [] : [`all ${expectedJobs} installation jobs must pin npm@${UPSTREAM_NPM_VERSION} with scripts disabled`];
}

export function checkPublishedVerificationWorkflow(content) {
  const failures = checkPinnedClient(content, 1);
  if (!/^permissions:\r?\n  contents: read\s*\r?\n/m.test(content)
    || /:\s*write\b|\bid-token\b|\bnpm publish\b|gh (?:release (?:create|upload|delete)|api[^\n]*--method)/.test(content)) {
    failures.push('published verification must remain read-only without publishing or OIDC');
  }
  if (!content.includes('persist-credentials: false')
    || !content.includes('RELEASE_TAG: ${{ inputs.tag }}')
    || (content.match(/\$\{\{ inputs\.tag \}\}/g) ?? []).length !== 1
    || !content.includes('run: node scripts/verify-published.mjs --tag "$RELEASE_TAG"')) {
    failures.push('published verification must pass the tag as data to the reviewed verifier');
  }
  return failures;
}

export function checkReleaseWorkflow(content) {
  const failures = checkPinnedClient(content, 2);
  const buildJob = content.match(/^  build:\r?\n([\s\S]*?)^  github-release:/m)?.[1] ?? '';
  const githubReleaseJob = content.match(/^  github-release:\r?\n([\s\S]*?)^  npm:/m)?.[1] ?? '';
  const npmJob = content.match(/^  npm:\r?\n([\s\S]*)$/m)?.[1] ?? '';
  const releaseToolsLoadFromMain = (job) => (
    job.includes('RELEASE_TOOL_SHA: ${{ github.sha }}')
    && job.includes('test "$GITHUB_REF" = "refs/heads/main"')
    && job.includes('git fetch --no-tags origin "$RELEASE_TOOL_SHA"')
    && job.includes('git show "$RELEASE_TOOL_SHA:scripts/release-lib.mjs" > scripts/release-lib.mjs')
    && job.includes('git show "$RELEASE_TOOL_SHA:scripts/validate-release.mjs" > scripts/validate-release.mjs')
    && job.includes('git show "$RELEASE_TOOL_SHA:scripts/release-source.mjs" > scripts/release-source.mjs')
  );
  const releaseToolsLoadBeforeUse = (job, packRequired) => {
    const loadAt = job.indexOf('- name: Load reviewed');
    const validateAt = job.indexOf('node scripts/validate-release.mjs');
    const packAt = job.indexOf('node scripts/pack-release.mjs --output release');
    return loadAt >= 0 && validateAt > loadAt && (!packRequired || packAt > validateAt);
  };
  const tagInputTransportIsSafe = () => {
    const qualifiedTagCheckouts = content.match(/^\s+ref: refs\/tags\/\$\{\{ inputs\.tag \}\}\s*$/gm) ?? [];
    const tagEnvironmentValues = content.match(/^\s+RELEASE_TAG: \$\{\{ inputs\.tag \}\}\s*$/gm) ?? [];
    const inputContextInRun = /^        run:[^\n]*\$\{\{[^}]*\binputs\b[^}]*\}\}|^        run:[^\n]*\n(?:(?!^        [\w-]+:|^      - name:|^  [\w-]+:)[\s\S])*?\$\{\{[^}]*\binputs\b[^}]*\}\}/m;
    return qualifiedTagCheckouts.length === 3
      && tagEnvironmentValues.length === 5
      && !inputContextInRun.test(content);
  };

  if (!/name:\s*release-candidate[\s\S]{0,400}retention-days:\s*35\b/.test(content)) {
    failures.push('release candidate retention must cover the 30-day approval window');
  }
  if (
    !content.includes('gh release view "$RELEASE_TAG"')
    || !content.includes('node scripts/compare-release.mjs release existing-release')
  ) {
    failures.push('existing release recovery missing');
  }
  if (!npmJob) {
    failures.push('npm job missing');
    return failures;
  }
  if (!buildJob || !releaseToolsLoadFromMain(buildJob)
    || !releaseToolsLoadFromMain(githubReleaseJob)
    || !releaseToolsLoadFromMain(npmJob)
    || !releaseToolsLoadBeforeUse(buildJob, true)
    || !releaseToolsLoadBeforeUse(githubReleaseJob, false)
    || !releaseToolsLoadBeforeUse(npmJob, true)
    || !githubReleaseJob.includes('git show "$RELEASE_TOOL_SHA:scripts/verify-release.mjs" > scripts/verify-release.mjs')) {
    failures.push('release jobs must load the source validator and resolver from the exact workflow commit on main before use, including candidate verification in github-release');
  }
  const verifierLoadAt = githubReleaseJob.indexOf('git show "$RELEASE_TOOL_SHA:scripts/verify-release.mjs" > scripts/verify-release.mjs');
  const verifierUseAt = githubReleaseJob.indexOf('node scripts/verify-release.mjs release --commit "$SOURCE_COMMIT"');
  if (verifierLoadAt < 0 || verifierUseAt <= verifierLoadAt) {
    failures.push('github-release must load its candidate verifier from the workflow commit before checking the manifest');
  }
  if (!githubReleaseJob.includes('node scripts/validate-release.mjs --tag "$RELEASE_TAG" --verify-tag-source')
    || !githubReleaseJob.includes('node scripts/verify-release.mjs release --commit "$SOURCE_COMMIT"')) {
    failures.push('github-release must bind candidate manifest identity to the verified tag checkout');
  }
  if (!tagInputTransportIsSafe()) {
    failures.push('release inputs must use fully qualified tag refs and pass to shell only through environment data');
  }
  if (!/^  github-release:[\s\S]*?^    environment: github-release\s*$/m.test(content)) {
    failures.push('GitHub Release publishing must use the branch-restricted github-release environment');
  }
  const jobBlocks = content.split(/(?=^  [\w-]+:\s*$)/m);
  for (const job of ['build', 'github-release', 'npm']) {
    const block = jobBlocks.find((candidate) => candidate.startsWith(`  ${job}:`)) ?? '';
    if (!/^    if: github\.ref == 'refs\/heads\/main'\s*$/m.test(block)) {
      failures.push(`${job} job must run only for a workflow dispatch from main`);
    }
  }

  const required = [
    'environment: npm-publish',
    'id-token: write',
    'ref: refs/tags/${{ inputs.tag }}',
    'node scripts/pack-release.mjs --output release',
    'gh release download "$RELEASE_TAG" --dir canonical-release',
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
