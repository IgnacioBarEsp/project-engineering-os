export function createScreenState(initial = {}) {
  const values = new Map(Object.entries(initial));
  const listeners = new Map();

  function get(screen) { return values.get(screen); }
  function set(screen, value) {
    const previous = values.get(screen);
    if (Object.is(previous, value)) return previous;
    values.set(screen, value);
    for (const listener of listeners.get(screen) ?? []) listener(value, previous);
    return value;
  }
  function update(screen, patch) {
    const current = get(screen) ?? {};
    return set(screen, {...current, ...patch});
  }
  function subscribe(screen, listener) {
    if (typeof listener !== 'function') throw new TypeError('listener must be a function');
    const screenListeners = listeners.get(screen) ?? new Set();
    screenListeners.add(listener);
    listeners.set(screen, screenListeners);
    return () => {
      screenListeners.delete(listener);
      if (screenListeners.size === 0) listeners.delete(screen);
    };
  }
  return Object.freeze({get, set, update, subscribe});
}
