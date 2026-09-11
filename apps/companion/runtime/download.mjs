import { open, unlink } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fail } from '../engine/files.mjs';

function permitted(value, origins) {
  let url; try { url = new URL(value); } catch { fail('DOWNLOAD_ORIGIN', 'La dirección de descarga no es válida.'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.hash || !origins.includes(url.origin)) {
    fail('DOWNLOAD_ORIGIN', 'La descarga salió de los servidores revisados.', 'No se instaló el paquete. Conserva el aviso y vuelve a comprobar más tarde.');
  }
  return url.href;
}

// The caller is the trusted runtime catalog, never the renderer. Test transport is injectable;
// production always uses bounded HTTPS with manual redirect validation and no authentication.
export async function downloadArtifact(artifact, destination, { signal, onProgress = () => {}, transport = fetch, timeoutMs = 10 * 60 * 1000 } = {}) {
  const controller = AbortSignal.timeout(timeoutMs), combined = signal ? AbortSignal.any([signal, controller]) : controller;
  let url = permitted(artifact.url, artifact.origins), response, handle, created = false;
  try {
    for (let hop = 0; hop <= 4; hop++) {
      combined.throwIfAborted();
      response = await transport(url, { redirect: 'manual', signal: combined, credentials: 'omit', headers: { 'Accept-Encoding': 'identity' } });
      if (![301, 302, 303, 307, 308].includes(response.status)) break;
      const location = response.headers.get('location'); await response.body?.cancel();
      if (!location || hop === 4) fail('DOWNLOAD_REDIRECT', 'El servidor no pudo completar la descarga.');
      url = permitted(new URL(location, url).href, artifact.origins);
    }
    if (response.status !== 200 || !response.body) fail('DOWNLOAD_UNAVAILABLE', 'No se pudo descargar la herramienta.', 'Comprueba tu conexión y vuelve a intentarlo. El contexto local sigue disponible.');
    const length = response.headers.get('content-length'), encoding = response.headers.get('content-encoding');
    if ((length !== null && Number(length) !== artifact.bytes) || (encoding && encoding !== 'identity')) fail('DOWNLOAD_SIZE', 'El tamaño de la descarga no coincide con el paquete revisado.');
    handle = await open(destination, 'wx', 0o600); created = true;
    let used = 0; const digest = createHash('sha256');
    for await (const chunk of response.body) {
      combined.throwIfAborted(); used += chunk.length;
      if (used > artifact.bytes) fail('DOWNLOAD_SIZE', 'La descarga supera el tamaño revisado.');
      digest.update(chunk); await handle.writeFile(chunk); onProgress({ completed: used, total: artifact.bytes });
    }
    if (used !== artifact.bytes || digest.digest('hex') !== artifact.sha256) fail('DOWNLOAD_INTEGRITY', 'El paquete descargado no coincide con su verificación.', 'No se activó la herramienta. Vuelve a descargarla desde la aplicación.');
    await handle.sync(); return { bytes: used, sha256: artifact.sha256 };
  } catch (error) {
    await response?.body?.cancel().catch(() => {});
    if (handle) { await handle.close(); handle = null; }
    if (created) await unlink(destination);
    throw error;
  } finally { if (handle) await handle.close(); }
}
