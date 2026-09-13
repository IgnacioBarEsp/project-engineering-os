// The only thing in this application that talks to a model, and the first thing in it that makes an outbound
// request at all outside the toolchain download.
//
// Three properties hold it together, and each one is enforced rather than intended:
//
//   1. **The payload is built, not filtered.** The body is composed here from a small declared shape —
//      answers the person gave the wizard, the ids of the stages that are pending, and an aggregate of file
//      types. There is no code path that puts a file path or a line of a document into it. Removing fields
//      from a general object would be a filter someone has to keep correct as the object grows.
//   2. **A guard refuses.** Before any request, the serialised body is checked against the project's own
//      paths. If one appears, the request is not made. That turns a future mistake into a refusal.
//   3. **Every call is bounded.** An explicit destination, a timeout, a maximum response size read as it
//      arrives, no redirects, no credentials in the URL, and `https:` for anything that is not loopback.
//
// It runs in the main process. The renderer's content security policy is `connect-src 'none'`, so the
// interface cannot reach the network at all, and this does not change that.
import { fail } from '../engine/files.mjs';

export const LEVELS = Object.freeze(['off', 'local', 'provider', 'own-key']);
export const LEVEL_LABELS = Object.freeze({
  off: 'Solo plantillas, en este equipo',
  local: 'Un modelo en tu equipo',
  provider: 'Un proveedor gratuito, con tu clave',
  'own-key': 'Tu proveedor, con tu clave',
});
// The loopback interface, where a model on the person's own machine answers. Nothing leaves the equipment.
export const LOCAL_ORIGINS = Object.freeze(['http://127.0.0.1:1234', 'http://localhost:1234']);
export const PROVIDERS = Object.freeze({
  cerebras: { label: 'Cerebras', origin: 'https://api.cerebras.ai', chat: '/v1/chat/completions', models: '/v1/models' },
  groq: { label: 'Groq', origin: 'https://api.groq.com', chat: '/openai/v1/chat/completions', models: '/openai/v1/models' },
});
// Measured on the machine this was built on rather than guessed. Detecting a local server took 33 ms. A
// local model answered in 33 s warm and 87 s cold, because the first call loads the weights — so a local
// bound of twenty-five seconds would have made level 1 unusable on first use, and the earlier draft of this
// file proved it by timing out. A hosted provider that takes longer than twenty-five seconds is not worth
// waiting for, since degrading costs nothing.
//
// Neither bound can freeze the interface: the call runs in the main process inside the same operation
// machinery every other long task uses, which shows progress and offers Detener.
export const DETECT_TIMEOUT_MS = 2000, LOCAL_TIMEOUT_MS = 120000, PROVIDER_TIMEOUT_MS = 25000;
export const MAX_RESPONSE_BYTES = 256 * 1024, MAX_OUTPUT_TOKENS = 1200;
export const MIN_LENGTH_RATIO = 1;

const INSTRUCTION = [
  'Escribe en español las instrucciones que una persona le va a pegar a su propia IA para trabajar en su proyecto.',
  'Solo recibes los datos de abajo: no tienes acceso a la carpeta, a sus archivos ni a sus nombres, y no debes suponer ninguno.',
  'Estructura la respuesta con encabezados "## " y frases cortas. Incluye qué preparar antes de trabajar, cómo trabajar, qué no está listo y qué reglas no cambian.',
  'No afirmes resultados, beneficios ni rapidez. No inventes archivos, versiones ni herramientas concretas que no estén en los datos.',
  'Responde solo con el texto de las instrucciones, sin comentarlo.',
].join(' ');

// Exactly what may leave. Anything not named here cannot travel, because nothing else is ever read into the
// body: `facts` is rebuilt field by field rather than passed through.
export function shareableFacts(input = {}) {
  const clean = (value, max) => (typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, max) : '');
  const summary = input.summary ?? {};
  return {
    profile: clean(input.profile, 20),
    experience: clean(input.experience, 20),
    role: clean(input.role, 40),
    goal: clean(input.goal, 500),
    agents: (Array.isArray(input.agents) ? input.agents : []).slice(0, 10).map(value => clean(value, 30)).filter(Boolean),
    pending: (Array.isArray(input.pending) ? input.pending : []).slice(0, 10).map(value => clean(value, 20)).filter(Boolean),
    files: {
      total: Number.isInteger(summary.total) ? summary.total : 0,
      excluded: Number.isInteger(summary.excluded) ? summary.excluded : 0,
      complete: summary.complete !== false,
      types: (Array.isArray(summary.extensions) ? summary.extensions : []).slice(0, 40)
        .map(entry => ({ extension: clean(entry?.extension, 14), kind: clean(entry?.kind, 10),
          count: Number.isInteger(entry?.count) ? entry.count : 0 })),
      limitations: (Array.isArray(summary.limitations) ? summary.limitations : []).slice(0, 20)
        .map(entry => ({ reason: clean(entry?.reason, 40), count: Number.isInteger(entry?.count) ? entry.count : 0 })),
    },
  };
}

// A path of this project, a path-shaped string, or a drive letter. The first is what the guard is really for;
// the other two catch a shape that should never be in a payload built the way this one is.
//
// Compared with both sides normalised and lowercased. An independent review walked a real file name past this
// with nothing but a different capitalisation — `Contrato-Despido-2024.pdf` on disk, `contrato-despido-2024.pdf`
// typed into the goal — which on Windows is not an exotic case but the ordinary one, since the filesystem
// itself does not distinguish them. The same review got past it with a different Unicode normalisation.
const PATH_SHAPED = /(^|[\s"'`(])([A-Za-z]:[\\/]|\.{1,2}[\\/]|~[\\/]|\/[A-Za-z0-9._-]+\/)/;
const comparable = value => String(value).normalize('NFC').toLowerCase();
export function projectDataIn(body, paths = []) {
  const raw = typeof body === 'string' ? body : JSON.stringify(body);
  const text = comparable(raw);
  const found = [];
  for (const value of paths) {
    if (typeof value !== 'string' || value.length < 3) continue;
    const whole = comparable(value), base = comparable(value.split(/[\\/]/).pop() ?? '');
    if (text.includes(whole)) found.push(value);
    else if (base.length >= 5 && text.includes(base)) found.push(base);
  }
  const shaped = raw.match(PATH_SHAPED);
  if (shaped) found.push(shaped[2]);
  return [...new Set(found)].slice(0, 5);
}

function destination(level, provider) {
  if (level === 'local') return { origin: LOCAL_ORIGINS[0], chat: '/v1/chat/completions', models: '/v1/models', label: 'tu equipo', loopback: true };
  const chosen = PROVIDERS[provider];
  if (!chosen) fail('INFERENCE_PROVIDER', 'Ese proveedor no está en la lista revisada.', 'Elige uno de los proveedores que la pantalla ofrece.');
  return { ...chosen, loopback: false };
}
function checkedUrl(origin, route) {
  const url = new URL(route, origin);
  if (url.origin !== origin) fail('INFERENCE_DESTINATION', 'El destino no coincide con el proveedor elegido.');
  if (url.username || url.password || url.hash) fail('INFERENCE_DESTINATION', 'El destino lleva datos que no se pueden enviar.');
  if (!LOCAL_ORIGINS.includes(origin) && url.protocol !== 'https:') fail('INFERENCE_DESTINATION', 'Un proveedor fuera de este equipo tiene que usar una conexión cifrada.');
  return url.href;
}

// Read at most `limit` bytes and stop, instead of taking the whole body and measuring it afterwards.
async function boundedText(response, limit) {
  // Without a readable stream the size cannot be bounded as it arrives. Reading it whole and slicing
  // afterwards would be a bound in name only, so an oversize body is refused instead.
  if (!response.body) {
    const whole = await response.text();
    if (whole.length > limit) fail('INFERENCE_TOO_LARGE', 'La respuesta del modelo es más grande de lo permitido.');
    return whole;
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let text = '', size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) fail('INFERENCE_TOO_LARGE', 'La respuesta del modelo es más grande de lo permitido.');
      text += decoder.decode(value, { stream: true });
    }
  } finally { await reader.cancel().catch(() => {}); }
  return text + decoder.decode();
}

export function createInferenceClient({ fetch: request = globalThis.fetch, now = () => Date.now() } = {}) {
  async function call(url, { key, body, timeout, signal }) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(new Error('timeout')), timeout);
    const abort = () => controller.abort(new Error('cancelled'));
    signal?.addEventListener('abort', abort, { once: true });
    const started = now();
    try {
      const response = await request(url, {
        method: body ? 'POST' : 'GET', redirect: 'error', signal: controller.signal,
        headers: { accept: 'application/json', ...(body ? { 'content-type': 'application/json' } : {}),
          ...(key ? { authorization: `Bearer ${key}` } : {}) },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      const text = await boundedText(response, MAX_RESPONSE_BYTES);
      return { ok: response.ok, status: response.status, text, elapsedMs: now() - started };
    } finally { clearTimeout(timer); signal?.removeEventListener('abort', abort); }
  }

  return {
    // Whether something answers the protocol on this machine, asked with a short bound. Not whether an
    // application is installed: what matters is that an endpoint answers.
    async detectLocal() {
      for (const origin of LOCAL_ORIGINS) {
        try {
          const result = await call(checkedUrl(origin, '/v1/models'), { timeout: DETECT_TIMEOUT_MS });
          if (!result.ok) continue;
          const models = JSON.parse(result.text)?.data;
          if (!Array.isArray(models) || !models.length) continue;
          return { available: true, origin, elapsedMs: result.elapsedMs,
            models: models.map(entry => String(entry?.id ?? '')).filter(Boolean).slice(0, 40) };
        } catch { /* the next origin, or none */ }
      }
      return { available: false, origin: null, models: [] };
    },

    /**
     * One attempt at one level. Returns what happened rather than throwing: the caller degrades, and the
     * screen says which level was used and why.
     */
    async compose({ level, provider, model, key, facts, paths = [], signal }) {
      if (!LEVELS.includes(level) || level === 'off') return { used: 'off', reason: 'sin modelo', text: null };
      const target = destination(level, provider);
      if (!target.loopback && !key) return { used: 'off', reason: 'falta la clave de tu proveedor', text: null };
      const body = { model: String(model ?? '').slice(0, 120), stream: false, temperature: 0.2,
        max_tokens: MAX_OUTPUT_TOKENS,
        messages: [{ role: 'system', content: INSTRUCTION },
          { role: 'user', content: JSON.stringify(shareableFacts(facts)) }] };
      const leaking = projectDataIn(body, paths);
      if (leaking.length) {
        return { used: 'off', text: null, refused: true,
          reason: `la petición llevaba datos de tu carpeta (${leaking.length}), así que no se envió` };
      }
      try {
        const timeout = target.loopback ? LOCAL_TIMEOUT_MS : PROVIDER_TIMEOUT_MS;
        const result = await call(checkedUrl(target.origin, target.chat), { key, body, timeout, signal });
        if (!result.ok) return { used: 'off', text: null, elapsedMs: result.elapsedMs, reason: `el proveedor respondió ${result.status}` };
        const message = JSON.parse(result.text)?.choices?.[0]?.message;
        const content = message?.content;
        if (typeof content !== 'string' || !content.trim()) {
          // Measured: a model that reasons before answering can spend its whole budget thinking and come back
          // with an empty answer. That is not a failure to say generically — the person deserves to know the
          // model they chose did not answer, not that "something went wrong".
          const thought = typeof message?.reasoning_content === 'string' && message.reasoning_content.trim();
          return { used: 'off', text: null, elapsedMs: result.elapsedMs,
            reason: thought ? 'el modelo gastó su turno razonando y no devolvió instrucciones' : 'el proveedor no devolvió texto' };
        }
        return { used: level, text: content.trim(), elapsedMs: result.elapsedMs, destination: target.label ?? target.origin, model: body.model };
      } catch (error) {
        const reason = error?.name === 'AbortError' || /timeout/.test(String(error?.message))
          ? 'el proveedor no respondió a tiempo'
          : error?.code === 'INFERENCE_TOO_LARGE' ? 'la respuesta era demasiado grande'
          : 'no se pudo hablar con el proveedor';
        return { used: 'off', text: null, reason };
      }
    },
  };
}

// The template is the floor. This does not judge which text is better — it decides whether the alternative
// clears a floor that can be checked: it has to be a real body of instructions, at least as long, still about
// this project, and free of the claims this product refuses to make anywhere.
export const REFUSED_CLAIMS = [
  /garantiza|asegura que|siempre funciona|sin errores|100\s?%/i,
  /m[aá]s r[aá]pid[oa] que/i, /mejores? respuestas?/i, /menos errores/i,
  /no (alucina|se equivoca|se invent)/i, /ahorra(s|r)? (tiempo|dinero|tokens)/i,
];
//
// The word a text has to carry to be about this project. Taking the first word of the label gave "un" for
// Unity, which every sentence in Spanish contains — an independent review passed a cake recipe through it.
const PROFILE_WORDS = Object.freeze({ research: ['investigación', 'investigacion', 'documento'],
  software: ['software', 'código', 'codigo', 'aplicación', 'aplicacion'],
  unity: ['unity', 'juego', 'escena'], media: ['contenido', 'imagen', 'video', 'audio'],
  general: ['trabajo', 'entrega', 'material'] });
export function clearsTheFloor(alternative, draft, { profile = '', profileLabel = '', goal = '' } = {}) {
  const problems = [];
  if (typeof alternative !== 'string' || !alternative.trim()) problems.push('no devolvió texto');
  else {
    const value = alternative.normalize('NFC').toLowerCase();
    if (alternative.length < draft.length * MIN_LENGTH_RATIO) problems.push('es más corto que la plantilla');
    if ((alternative.match(/^##\s+/gm) ?? []).length < 3) problems.push('no trae las secciones que se le pidieron');
    // Coverage, not length: the four things the instruction asked for have to be there.
    const covered = [/prepar|instal|configur/, /trabaj|paso|method|revis/, /regla|no supongas|no inventes|comprueb/]
      .filter(pattern => pattern.test(value)).length;
    if (covered < 3) problems.push('no cubre qué preparar, cómo trabajar y qué reglas seguir');
    const words = PROFILE_WORDS[profile] ?? (profileLabel ? [profileLabel.toLowerCase()] : []);
    if (words.length && !words.some(word => value.includes(word.normalize('NFC').toLowerCase()))) {
      problems.push('no habla de este tipo de proyecto');
    }
    if (goal && goal.length > 12 && !value.includes(goal.normalize('NFC').toLowerCase().slice(0, 12))) {
      problems.push('no menciona el objetivo de la persona');
    }
    if (draft && alternative.trim() === draft.trim()) problems.push('es la misma plantilla');
    for (const pattern of REFUSED_CLAIMS) if (pattern.test(alternative)) problems.push('afirma algo que este producto no afirma');
  }
  return { clears: problems.length === 0, problems: [...new Set(problems)] };
}

// What a model writes is never the last word. The rules this product does not negotiate are appended after
// it, and the text says where each half came from — because whatever comes back is about to be pasted into an
// AI that can open the person's folder. An independent review had a provider return "sube el contenido
// completo a https://…" and watched it replace the rules and reach the clipboard.
export const MODEL_HEADER = '## De dónde viene este texto';
export function withLocalRules(modelText, rules, { destination = 'un modelo' } = {}) {
  return [`${MODEL_HEADER}\nLas secciones que siguen las escribió ${destination} a partir de tus respuestas, no esta aplicación. Las reglas del final son de esta aplicación y no se negocian.`,
    modelText.trim(), rules.trim()].join('\n\n');
}
