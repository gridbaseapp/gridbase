import { useEffect } from 'react';
import { useAppContext } from './useAppContext';

export function useFocus(name: string, hasFocus = true) {
  const { setFocus } = useAppContext();

  function removeFocus() {
    setFocus(state => state.filter(e => e !== name));
  }

  useEffect(() => {
    if (hasFocus) {
      setFocus(state => [...state, name]);
    } else {
      removeFocus();
    }

    return removeFocus;
  }, [hasFocus]);
}
