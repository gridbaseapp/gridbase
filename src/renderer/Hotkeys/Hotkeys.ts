type Handler = (event: KeyboardEvent) => void;

interface KeyBindingHandlers {
  [keyBinding: string]: Handler[];
}

const MODIFIERS = ['Alt', 'Control', 'Meta', 'Shift'];

const keyBindingHandlers: KeyBindingHandlers = {};

function splitKeyBinding(str: string) {
  return str
    .split(/\b,/)
    .map(e => e.trim())
  .filter((val, i, array) => array.indexOf(val) === i);
}

function normalize(str: string) {
	const mods = str.trim().toLowerCase().split(/\b\+/);
  const key = mods.pop() as string;

  return [...mods.sort(), key].join('+');
}

function getModifiers(event: KeyboardEvent) {
  const modifiers: string[] = [];

  MODIFIERS.forEach(mod => {
    if (event.getModifierState(mod)) {
      modifiers.push(mod.toLowerCase());
    }
  });

  return modifiers;
}

function on(keyBinding: string, handler: Handler) {
  if (!keyBinding || keyBinding.length === 0) {
    throw new Error('key binding is required');
  }

  splitKeyBinding(keyBinding).forEach(key => {
    (keyBindingHandlers[normalize(key)] ??= []).push(handler);
  });
}

function off(keyBinding: string, handler: Handler) {
  if (!keyBinding || keyBinding.length === 0) {
    throw new Error('key binding is required');
  }

  splitKeyBinding(keyBinding).forEach(key => {
    keyBindingHandlers[key] =
      (keyBindingHandlers[key] ?? []).filter(e => e !== handler);
  });
}

document.addEventListener('keydown', (event: KeyboardEvent) => {
  if (!(event instanceof KeyboardEvent)) {
    return;
  }

  const key = event.key.toLowerCase();
  const mods = getModifiers(event).filter(e => e !== key);

  const keyBinding = [...mods, key].join('+');

  if ((keyBindingHandlers[keyBinding] ?? []).length > 0) {
    keyBindingHandlers[keyBinding].forEach(handler => handler(event));
  } else {
    const key = event.code.toLowerCase().replace('key', '');
    const keyBinding = [...mods, key].join('+');

    if ((keyBindingHandlers[keyBinding] ?? []).length > 0) {
      keyBindingHandlers[keyBinding].forEach(handler => handler(event));
    }
  }
});

export { on, off };
