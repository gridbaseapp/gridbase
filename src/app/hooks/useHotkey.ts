import { useRef, useEffect } from 'react';
import Mousetrap from 'mousetrap';
import 'mousetrap/plugins/global-bind/mousetrap-global-bind';
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
];

export function useHotkey(
  scopeOrScopes: string | string[],
  keyCombination: string | string[],
  handler: (event: KeyboardEvent) => void,
  deps: any[] = [],
  options: Options = { global: true },
) {
  const scopes = Array.isArray(scopeOrScopes) ? scopeOrScopes : [scopeOrScopes];

  const { focus, exclusiveFocus } = useAppContext();
  const mousetrap = useRef(new Mousetrap());

  useEffect(() => {
    let hasFocus = false;

    if (exclusiveFocus.length > 0) {
      hasFocus = exclusiveFocus[0] === scopes[0];
    } else {
      hasFocus = scopes.every(e => focus.includes(e));
    }

    function unbind() {
      mousetrap.current.reset();
    }

    if (hasFocus) {
      mousetrap.current.reset();

      if (keyCombination === 'alphabet') {
        keyCombination = ALPHABET;
      }

      if (options.global) {
        // @ts-expect-error
        mousetrap.current.bindGlobal(keyCombination, handler);
      } else {
        mousetrap.current.bind(keyCombination, handler);
      }
    } else {
      unbind();
    }

    return unbind;
  }, [focus, exclusiveFocus, ...deps]);
}
