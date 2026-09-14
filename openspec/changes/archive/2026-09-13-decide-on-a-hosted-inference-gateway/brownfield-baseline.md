# Brownfield baseline

Measured on `main` at de66a2e, the commit that integrated issue 105. Read from the code, not from memory.

## The four levels that already exist

`apps/companion/runtime/inference.mjs`:

```js
export const LEVELS = Object.freeze(['off', 'local', 'provider', 'own-key']);
export const LEVEL_LABELS = Object.freeze({
  off: 'Solo plantillas, en este equipo',
  local: 'Un modelo en tu equipo',
  provider: 'Un proveedor gratuito, con tu clave',
  'own-key': 'Tu proveedor, con tu clave',
});
export const PROVIDERS = Object.freeze({
  cerebras: { label: 'Cerebras', origin: 'https://api.cerebras.ai', … },
  groq: { label: 'Groq', origin: 'https://api.groq.com', … },
});
```

Both named providers issue a **free** key without a card. So the gap a hosted gateway would close is not "no
model available" — it is "having to create a free account".

`off` is a first-class state, not a degradation. Issue 100's technology recommendation is decided from profile
and inventory **on purpose**, so that a person with inference off gets the same product with the same
explanation. What a model adds to this product is wording, not capability.

## The data boundary that already exists

From issue 99, and hardened by its independent review:

- `shareableFacts(input)` rebuilds the outbound payload **field by field** — profile, experience, role, goal,
  agents, pending stages, file counts — rather than forwarding what it is handed.
- `projectDataIn(body, paths)` refuses a body carrying project data, comparing in NFC and lowercase after a
  review got a file name through on capitalisation alone.
- The draft and the person's pasted notes **do not travel**.
- `withLocalRules` appends this application's rules after any model text, so what a model returns never
  replaces them.

So a gateway would carry the same seven declared fields it carries today — never file content. That bounds the
exposure without eliminating it: a goal someone writes is personal data even when it is not a file.

## Why a key cannot ship inside the application

`apps/companion/electron-builder.yml` sets `asar: false`, deliberately, so the managed Node can read the
modules the app copies into a prepared project. The application's code therefore ships as plain files under
`resources/app`. A key placed there is extracted in seconds. Issue 99 closed this and the product ships with
the provider level working from **the person's** key, which the application never stores.

## Degradation that already exists

Issue 99 built and measured it: a provider that is dead, slow, oversized or incoherent degrades to the level
below **and says why**. A hosted gateway would inherit that for free, which is the one thing in its favour.

## What does not exist

No server, no domain, no account in the project's name, no per-installation identifier, no usage log, no rate
limiter, no fifth level. This change creates none of them: the issue puts building it out of scope and asks
for an evaluated design and a recommendation.

## Constraints carried in

- The privacy screen says «No hay cuenta, suscripción ni telemetría» and the sidebar says «Tus archivos, en
  este equipo · Sin cuenta». Those are among the few unqualified claims this product can make.
- `MAX_OUTPUT_TOKENS` is 1200 and `PROVIDER_TIMEOUT_MS` is 25000, which is where the volume assumptions in the
  cost estimate come from.
- No absolute path, account name or session identifier may reach a versioned file.
