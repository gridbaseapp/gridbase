import Mousetrap from 'mousetrap';
import 'mousetrap/plugins/pause/mousetrap-pause';

interface Binding {
  [name: string]: Mousetrap.MousetrapInstance;
}

const bindings: Binding = {};

interface KeyDefinition {
  [name: string]: () => void;
}

Mousetrap.prototype.stopCallback = function() {
  if (this.paused) return true;
  return false;
};

export default {
  bind(context: string, definition: KeyDefinition) {
    this.unbind(context);

    const mousetrap = new Mousetrap();

    for (const [key, value] of Object.entries(definition)) {
      mousetrap.bind(key, () => {console.log(`hotkey -> ${context}: ${key}`); value();});
    }

    bindings[context] = mousetrap;
  },
  unbind(context: string) {
    if (!bindings[context]) return;
    bindings[context].reset();
    delete bindings[context];
  },
  pause(contexts: string[]) {
    for (const context of contexts) {
      bindings[context].pause();
    }
  },
  unpause(contexts: string[]) {
    for (const context of contexts) {
      bindings[context].unpause();
    }
  },
  getContexts() {
    return Object.keys(bindings);
  },
};
