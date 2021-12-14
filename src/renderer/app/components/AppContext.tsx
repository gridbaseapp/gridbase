import React, { useState } from 'react';
import { Context } from '../context';
import { SecureStore } from '../SecureStore';

interface Props {
  store: SecureStore;
  children: React.ReactNode;
}

export function AppContext({ store, children }: Props) {
  const [focus, setFocus] = useState<string[]>([]);
  const [exclusiveFocus, setExclusiveFocus] = useState<string[]>([]);

  const contextValue = {
    store,
    focus,
    exclusiveFocus,
    setFocus,
    setExclusiveFocus,
  };

  return (
    <Context.Provider value={contextValue}>
      {children}
    </Context.Provider>
  );
}
