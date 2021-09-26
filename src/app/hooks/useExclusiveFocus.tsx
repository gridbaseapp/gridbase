import { useEffect } from 'react';
import { useAppContext } from './useAppContext';

export function useExclusiveFocus(name: string, hasFocus = true) {
  const { setExclusiveFocus } = useAppContext();

  function removeFocus() {
    setExclusiveFocus(state => state.filter(e => e !== name));
  }

  useEffect(() => {
    if (hasFocus) {
      setExclusiveFocus(state => [...state, name]);
    } else {
      removeFocus();
    }

    return removeFocus;
  }, [hasFocus]);
}
