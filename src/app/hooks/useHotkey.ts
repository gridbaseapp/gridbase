import { useEffect } from 'react';
import hotkeys from 'hotkeys-js';
import { useAppContext } from './useAppContext';

interface Options {
  global: boolean;
}

const ALPHABET = [
  'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'a', 's', 'd',
  'f', 'g', 'h', 'j', 'k', 'l', 'z', 'x', 'c', 'v', 'b', 'n', 'm',
  'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'A', 'S', 'D',
  'F', 'G', 'H', 'J', 'K', 'L', 'Z', 'X', 'C', 'V', 'B', 'N', 'M',
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
].join(', ');

hotkeys.filter = () => true;

export function useHotkey(
  scopeOrScopes: string | string[],
  keyCombination: string | string[],
  handler: (event: KeyboardEvent) => void,
  deps: any[] = [],
  options: Options = { global: true },
) {
  const { focus, exclusiveFocus } = useAppContext();

  useEffect(() => {
    let hasFocus = false;

    const scopes = Array.isArray(scopeOrScopes) ? scopeOrScopes : [scopeOrScopes];
    let keys = Array.isArray(keyCombination) ? keyCombination.join(', ') : keyCombination;

    if (keyCombination === 'alphabet') {
      keys = ALPHABET;
    }

    if (exclusiveFocus.length > 0) {
      hasFocus = exclusiveFocus[0] === scopes[0];
    } else {
      hasFocus = scopes.every(e => focus.includes(e));
    }

    const wrapperHandler = (ev: KeyboardEvent) => {
      const target = ev.target as HTMLElement | null;

      if (!options.global && target) {
        const isEditable = target.isContentEditable;
        const isInput = /(INPUT|TEXTAREA|SELECT)/.test(target.tagName);
        const isReadOnly = (target as HTMLInputElement).readOnly;

        if (isEditable || (isInput && !isReadOnly)) return;
      }

      handler(ev);
    }

    function unbind() {
      hotkeys.unbind(keys, wrapperHandler);
    }

    if (hasFocus) {
      hotkeys(keys, wrapperHandler);
    } else {
      unbind();
    }

    return unbind;
  }, [focus, exclusiveFocus, ...deps]);
}
