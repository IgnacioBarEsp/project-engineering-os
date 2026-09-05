import { setTimeout as sleep } from 'node:timers/promises';
import { assertSemver } from './release-lib.mjs';

export function registryIdentity(name, version) {
  if (!/^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/.test(name)) {
    throw new Error('Invalid package identity.');
  }
  assertSemver(version);
  const base = name.split('/').at(-1);
  return {
    metadata: `https://registry.npmjs.org/${encodeURIComponent(name)}/${version}`,
    tarball: `https://registry.npmjs.org/${name}/-/${base}-${version}.tgz`,
    attestations: `https://registry.npmjs.org/-/npm/v1/attestations/${name}@${version}`,
  };
}

export async function readBounded(response, limit) {
  const chunks = [];
  let size = 0;
  for await (const chunk of response.body ?? []) {
    size += chunk.length;
    if (size > limit) throw new Error('Registry response exceeds the verification size limit.');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export function completeRegistryRelease(release, name, version, expectedIntegrity) {
  const expected = registryIdentity(name, version);
  for (const [actual, wanted] of [
    [release?.name, name], [release?.version, version],
    [release?.dist?.tarball, expected.tarball],
    [release?.dist?.attestations?.url, expected.attestations],
  ]) {
    if (actual !== undefined && actual !== null && actual !== wanted) {
      throw new Error('Registry release identity differs from the requested publication.');
    }
  }
  const integrity = release?.dist?.integrity;
  if (integrity != null && (!/^sha512-[A-Za-z0-9+/]{86}==$/.test(integrity)
    || (expectedIntegrity && integrity !== expectedIntegrity))) {
    throw new Error('Registry integrity differs from the expected SHA-512 identity.');
  }
  return release?.name === name && release?.version === version && Boolean(integrity)
    && release?.dist?.tarball === expected.tarball
    && release?.dist?.attestations?.url === expected.attestations;
}

export async function waitForRegistryRelease({
  name, version, expectedIntegrity, maxWaitMs = 600_000,
  fetchImpl = fetch, now = () => performance.now(), sleepImpl = sleep,
}) {
  const identity = registryIdentity(name, version);
  if (!Number.isSafeInteger(maxWaitMs) || maxWaitMs < 1 || maxWaitMs > 600_000) {
    throw new Error('Registry wait must be between 1 ms and ten minutes.');
  }
  const deadline = now() + maxWaitMs;
  let backoff = 1_000;
  for (let attempt = 0; attempt < 128 && now() < deadline; attempt += 1) {
    try {
      const response = await fetchImpl(identity.metadata, {
        headers: { 'cache-control': 'no-cache' }, redirect: 'error',
        signal: AbortSignal.timeout(Math.max(1, Math.ceil(Math.min(15_000, deadline - now())))),
      });
      if (response.ok) {
        const release = JSON.parse((await readBounded(response, 1_048_576)).toString('utf8'));
        if (completeRegistryRelease(release, name, version, expectedIntegrity) && now() < deadline) return release;
      } else {
        await response.body?.cancel();
        if (![404, 408, 429].includes(response.status) && response.status < 500) {
          throw new Error(`Registry returned permanent HTTP ${response.status}.`);
        }
      }
    } catch (error) {
      // Fetch and streamed network failures are transient; identity/JSON/policy errors are not.
      if (!(error instanceof TypeError) && !['TimeoutError', 'AbortError'].includes(error.name)) throw error;
    }
    const remaining = deadline - now();
    if (remaining <= 0) break;
    await sleepImpl(Math.min(backoff, remaining));
    backoff = Math.min(backoff * 2, 15_000);
  }
  throw new Error('Registry propagation timed out. Retry read-only verification; do not republish.');
}
